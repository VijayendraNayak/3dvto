from flask import Flask, request, jsonify, make_response,send_from_directory,send_file
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import firebase_admin
from firebase_admin import credentials, storage
from urllib.parse import quote
from time import sleep
from functools import wraps
import jwt
import time
from datetime import datetime, timedelta, timezone
import os
import requests
# from gradio_client import Client,file
# import io
import http.client
import json
import requests


# Load environment variables
load_dotenv()
app = Flask(__name__)
frontend_url = os.getenv('FRONTEND_URL')
mongo_url = os.getenv('MONGO_URL')
secret_key = os.getenv('SECRET_KEY')
API_KEY = os.getenv("MESHY_KEY")
CORS(app, resources={r"/*": {"origins": frontend_url}})
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
CARTOON_API_KEY = os.getenv("CARTOON_API_KEY")
CARTOON_API_HOST = "ai-cartoon-generator.p.rapidapi.com"
REMOVE_BG_KEY = os.getenv("REMOVE_BG_KEY")
ALLOWED_EXTENSIONS={'png','jpg','jpeg'}


cred = credentials.Certificate("./serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    "storageBucket": "ecommerce-1094e.appspot.com"
})

# Get a reference to the Firebase Storage bucket
bucket = storage.bucket()


# Configuration
app.config["MONGO_URI"] = mongo_url
app.config['SECRET_KEY'] = secret_key  # Change to a secure secret key

try:
    mongo = PyMongo(app)
    mongo.db.command('ping')  # Test the database connection
    print("✅ Database connected successfully!")
except Exception as e:
    print(f"❌ Database connection failed: {str(e)}")

# Root route to confirm backend is running
@app.route('/')
def home():
    return jsonify({
        "status": "success",
        "message": "Backend server is running successfully!",
        "database": "connected",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization'].split()
            if len(auth_header) == 2 and auth_header[0] == "Bearer":
                token = auth_header[1]
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = mongo.db.users.find_one({'_id': ObjectId(data['user_id'])})
            if not current_user:
                return jsonify({'message': 'User not found'}), 404
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError as e:
            print(f"JWT decode error: {e}")  # Debugging
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

# Admin required decorator
def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.get('role') != 'admin':
            return jsonify({'message': 'Admin privileges required'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

def remove_background(file_path):
    with open(file_path, 'rb') as image_file:
        response = requests.post(
            'https://api.remove.bg/v1.0/removebg',
            files={'image_file': image_file},
            data={'size': 'auto'},
            headers={'X-Api-Key': REMOVE_BG_KEY},
        )
    if response.status_code == 200:
        no_bg_path = file_path.replace(".jpg", "_no_bg.png").replace(".jpeg", "_no_bg.png").replace(".png", "_no_bg.png")
        with open(no_bg_path, 'wb') as out_file:
            out_file.write(response.content)
        return no_bg_path  # Return the new file path
    else:
        print("Error removing background:", response.text)
        return None


# Register a user
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if mongo.db.users.find_one({'email': data['email']}):
        return jsonify({'message': 'Email already registered'}), 400

    hashed_password = generate_password_hash(data['password'])
    user = {
        'username': data['username'],
        'email': data['email'],
        'password': hashed_password,
        'address': data['address'],
        'phone': data['phone'],
        'role': 'user',  # Default role
        'created_at': datetime.now(timezone.utc)
    }
    mongo.db.users.insert_one(user)
    return jsonify({'message': 'User registered successfully'}), 201

# Login and generate token

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = mongo.db.users.find_one({'email': data['email']})
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401

    # Generate token
    token = jwt.encode({
        'user_id': str(user['_id']),
        'role': user['role'],
        'exp': datetime.now(timezone.utc) + timedelta(hours=24)
    }, app.config['SECRET_KEY'])

    # Filter user data to exclude sensitive information
    user_data = {
        "id": str(user["_id"]),
        "name": user.get("username"),
        "email": user.get("email"),
        "role": user.get("role"),  # Include fields relevant for the client
        "phone":user.get("phone"),
        "address":user.get("address")
    }
    # console.log(user_data)

    # Set token as a secure, HttpOnly cookie
    response = make_response(jsonify({'token': token, 'data': user_data}))
    response.set_cookie('authToken', token, httponly=True, secure=True, samesite='Lax')

    return response, 200

# Function to create a 3D model task
def create_3d_model(image_url):
    url = "https://api.meshy.ai/v1/image-to-3d"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "image_url": image_url,
        "enable_pbr": True,
        "ai_model": "meshy-4"
    }

    response = requests.post(url, json=data, headers=headers)

    if response.status_code == 202:
        task_id = response.json()['result']
        return {"success": True, "task_id": task_id}
    else:
        return {"success": False, "error": response.json(), "status_code": response.status_code}

# Function to poll the task status
def check_task_status(task_id):
    url = f"https://api.meshy.ai/v1/image-to-3d/{task_id}"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
    }

    while True:
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            result = response.json()
            if result['status'] in ['SUCCEEDED', 'FAILED', 'EXPIRED']:
                return {"success": True, "result": result}
        else:
            return {"success": False, "error": response.json(), "status_code": response.status_code}

        time.sleep(5)

# API to create a 3D model task
@app.route('/api/create-3d-model', methods=['POST'])
def api_create_3d_model():
    data = request.get_json()
    if not data or 'image_url' not in data:
        return jsonify({"success": False, "message": "Invalid request. 'image_url' is required"}), 400

    image_url = data['image_url']
    result = create_3d_model(image_url)

    if result["success"]:
        return jsonify({"success": True, "task_id": result["task_id"]}), 202
    else:
        return jsonify({"success": False, "error": result["error"]}), result["status_code"]

# API to check task status
@app.route('/api/check-task-status/<task_id>', methods=['GET'])
def api_check_task_status(task_id):
    result = check_task_status(task_id)

    if result["success"]:
        return jsonify({"success": True, "result": result["result"]})
    else:
        return jsonify({"success": False, "error": result["error"]}), result["status_code"]

# File upload endpoint
# File upload endpoint
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Check if file extension is allowed
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/admin/add-cloth', methods=['POST'])
def addcloth():
    if 'image' not in request.files:
        return jsonify({"error": 'No image file provided'}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        # Secure and save the file temporarily
        filename = secure_filename(file.filename)
        local_path = os.path.join("/tmp", filename)
        file.save(local_path)

        # Upload to Firebase Storage
        blob = bucket.blob(f"clothing_images/{filename}")
        blob.upload_from_filename(local_path)
        blob.make_public()  # Make the file publicly accessible

        # Get the public URL for the uploaded image
        file_url = blob.public_url

        # Remove the temporary file
        os.remove(local_path)

        # Process other form data
        data = request.form
        clothing_item = {
            'name': data.get('name', ''),
            'category': data.get('category', ''),
            'price': float(data.get('price', 0)),
            'sizes': data.get('sizes', ''),
            'color': data.get('color', ''),
            'stock':data.get('stock',''),
            'thumbnail_path': file_url,  # Store the Firebase URL
            'created_at': datetime.now(timezone.utc),
            'is_active': True
        }

        # Insert the clothing item into the database
        result = mongo.db.clothing_items.insert_one(clothing_item)

        return jsonify({
            'message': 'Clothing item added successfully',
            'id': str(result.inserted_id),
            'thumbnail_url': file_url
        }), 201
    else:
        return jsonify({"error": "Invalid file type. Only PNG, JPG, JPEG, and GIF are allowed."}), 400
    
@app.route('/admin/delete-cloth/<cloth_id>', methods=['DELETE'])
def delete_cloth(cloth_id):
    clothing_item = mongo.db.clothing_items.find_one({"_id": ObjectId(cloth_id)})
    
    if not clothing_item:
        return jsonify({"error": "Clothing item not found"}), 404

    # Delete the image from Firebase Storage
    thumbnail_path = clothing_item.get('thumbnail_path')
    if thumbnail_path:
        # Extract the file name from the URL
        filename = thumbnail_path.split('/')[-1]
        blob = bucket.blob(f"clothing_images/{filename}")
        blob.delete()

    # Delete the item from MongoDB
    mongo.db.clothing_items.delete_one({"_id": ObjectId(cloth_id)})

    return jsonify({"message": "Clothing item deleted successfully"}), 200

@app.route('/admin/update-cloth/<cloth_id>', methods=['PATCH'])
def update_cloth(cloth_id):
    clothing_item = mongo.db.clothing_items.find_one({"_id": ObjectId(cloth_id)})
    
    if not clothing_item:
        return jsonify({"error": "Clothing item not found"}), 404

    data = request.form

    # Check if a new image is provided
    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            # Secure and save the new file temporarily
            filename = secure_filename(file.filename)
            local_path = os.path.join("/tmp", filename)
            file.save(local_path)

            # Upload the new image to Firebase Storage
            blob = bucket.blob(f"clothing_images/{filename}")
            blob.upload_from_filename(local_path)
            blob.make_public()

            # Get the public URL of the new image
            file_url = blob.public_url

            # Remove the temporary file
            os.remove(local_path)

            # Update only the image path in MongoDB
            mongo.db.clothing_items.update_one(
                {"_id": ObjectId(cloth_id)},
                {"$set": {"thumbnail_path": file_url}}
            )

    # Update only provided fields
    updated_fields = {}
    if 'name' in data:
        updated_fields['name'] = data['name']
    if 'category' in data:
        updated_fields['category'] = data['category']
    if 'price' in data:
        updated_fields['price'] = float(data['price'])
    if 'sizes_available' in data:
        updated_fields['sizes_available'] = data['sizes_available']
    if 'color' in data:
        updated_fields['color'] = data['color']

    if updated_fields:
        updated_fields['updated_at'] = datetime.now(timezone.utc)
        mongo.db.clothing_items.update_one(
            {"_id": ObjectId(cloth_id)},
            {"$set": updated_fields}
        )

    return jsonify({"message": "Clothing item updated successfully"}), 200

@app.route('/admin/search-cloth', methods=['GET'])
def search_cloth():
    # Extract query parameters
    name = request.args.get('name', '').strip()
    category = request.args.get('category', '').strip()
    cloth_id = request.args.get('id', '').strip()
    color = request.args.get('color', '').strip()
    size = request.args.get('size', '').strip()

    # Build the search filter
    search_filter = {}

    if name:
        # Use a case-insensitive regex for partial matching
        search_filter['name'] = {'$regex': name, '$options': 'i'}
    if category:
        search_filter['category'] = {'$regex': category, '$options': 'i'}
    if cloth_id:
        search_filter['_id'] = ObjectId(cloth_id)  # Convert to ObjectId if searching by ID
    if color:
        search_filter['color'] = {'$regex': color, '$options': 'i'}
    if size:
        search_filter['sizes_available'] = {'$in':size}  # Check if size exists in the list

    # Query the database
    clothing_items = list(mongo.db.clothing_items.find(search_filter))

    # Convert MongoDB ObjectId to string and prepare the response
    for item in clothing_items:
        item['_id'] = str(item['_id'])

    return jsonify(clothing_items), 200


@app.route('/getall', methods=['GET'])
def getall():
    # Query all documents from the `clothing_items` collection
    clothing_items = list(mongo.db.clothing_items.find())

    # Convert MongoDB ObjectId to string for JSON serialization
    for item in clothing_items:
        item['_id'] = str(item['_id'])

    # Return the clothing items as a JSON response
    return jsonify(clothing_items), 200

@app.route("/order/add",methods=['POST'])
def order():
    data=request.get_json()
    order={
        'user_id':data['user_id'],
        'username':data['username'],
        'email':data['email'],
        'address':data['address'],
        'phone':data['phone'],
        'cloth_id':data['cloth_id'],
        'clothname':data['clothname'],
        'created_at': datetime.now(timezone.utc)
    }
    mongo.db.order.insert_one(order)
    return jsonify({'message':'Order placed successfully'}), 201

@app.route("/order/getall/<user_id>", methods=["GET"])
def getorder(user_id):
    try:
        orderitems = list(mongo.db.order.find({"user_id": user_id}))
        
        if not orderitems:
            return jsonify({'message': "There are no items in the orders"}), 200
        
        for item in orderitems:
            item['_id'] = str(item['_id'])
            item['user_id'] = str(item['user_id'])
        
        return jsonify({"message": "Order items", "orderitems": orderitems}), 200
    
    except Exception as e:
        return jsonify({'message': f"Error fetching order items: {str(e)}"}), 500

@app.route("/order/delete/<order_id>",methods=['DELETE'])
def deleteorder(order_id):
    order= mongo.db.order.find_one({"_id":ObjectId(order_id)})
    if not order:
        return jsonify({'message':'Order does not exist'}),400
    mongo.db.order.delete_one({'_id':ObjectId(order_id)})
    return jsonify({'message':"Order deleted successfully"}), 200

@app.route('/admin/order/getall',methods=['GET'])
def ordergetall():
    orderitems=list(mongo.db.order.find())
    for item in orderitems:
        item['_id']=str(item['_id'])
    return jsonify(orderitems),200

@app.route('/cart/add',methods=['POST'])
def addcart():
    data=request.get_json()
    if 'cloth' not in data:
        return jsonify({'message':"Cloth not found"}), 400
    cloth=data['cloth']
    user_id=data['user_id']
    
    cartitem={
        'user_id':user_id,
        'cloth':cloth,
        'quantity':data.get('quantity',1),
        'created_at':datetime.now(timezone.utc)
    }
    mongo.db.cart.insert_one(cartitem)
    return jsonify({'message':'Item added to the cart successfully'}),201

@app.route("/cart/getall/<user_id>", methods=["GET"])
def getcart(user_id):
    try:
        cartitems = list(mongo.db.cart.find({"user_id": user_id}))
        
        if not cartitems:
            return jsonify({'message': "There are no items in the cart"}), 200
        
        for item in cartitems:
            item['_id'] = str(item['_id'])
            item['user_id'] = str(item['user_id'])
        
        return jsonify({"message": "Cart items", "cartitems": cartitems}), 200
    
    except Exception as e:
        return jsonify({'message': f"Error fetching cart items: {str(e)}"}), 500

@app.route('/cart/delete/<cart_id>',methods=['DELETE'])
def deletecart(cart_id):
    cartitem=mongo.db.cart.find_one({"_id":ObjectId(cart_id)})
    if not cartitem:
        return jsonify({'message':"item not found in the cart"}),400
    mongo.db.cart.delete_one({"_id":ObjectId(cart_id)})
    return jsonify({'message':"Item in the cart delted successfully"}),200

@app.route('/admin/cart/getall',methods=['GET'])
def cartgetall():
    cartitems=list(mongo.db.cart.find())
    for item in cartitems:
        item['_id']=str(item['_id'])
    return jsonify(cartitems),200


# Route to upload an image
@app.route("/upload", methods=["POST"])
def upload_image():
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files["file"]
    
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        local_path = os.path.join("./uploads", filename)  # Save temporarily before uploading to Firebase
        file.save(local_path)
        
        # Upload to Firebase Storage
        blob = bucket.blob(f"images/{filename}")
        blob.upload_from_filename(local_path)
        blob.make_public()  # Make the file publicly accessible
        
        # Get the public URL
        file_url = blob.public_url
        
        # Save the image metadata to MongoDB
        image_data = {
            "filename": filename,
            "url": file_url
        }
        mongo.db.images.insert_one(image_data)
        
        # Clean up temporary file
        os.remove(local_path)
        
        return jsonify({"message": "File uploaded successfully", "url": file_url}), 201
    
    return jsonify({"error": "Invalid file type"}), 400

@app.route('/cartoonize', methods=['POST'])
def cartoonize_image():
    """
    Accepts an image file and an index from the request to start the cartoonization process.
    Returns only the task ID.
    """
    # Check if an image file was uploaded
    if 'image' not in request.files:
        return jsonify({"status": "error", "message": "Image file is required"}), 400

    image = request.files['image']
    if not image:
        return jsonify({"status": "error", "message": "Image file is required"}), 400

    # Check if 'index' is present in the form data
    index = request.form.get('index')
    if index is None:
        return jsonify({"status": "error", "message": "Index is required"}), 400

    # Convert the image to a format suitable for sending
    files = {
        'image': (image.filename, image.read(), image.content_type)
    }
    data = {
        'index': index
    }

    # API request headers
    headers = {
        "x-rapidapi-key": CARTOON_API_KEY,
        "x-rapidapi-host": CARTOON_API_HOST
    }

    url = "https://ai-cartoon-generator.p.rapidapi.com/image/effects/generate_cartoonized_image"

    try:
        response = requests.post(url, headers=headers, files=files, data=data)
        response.raise_for_status()

        # Print and check the response JSON
        print(f"Response JSON: {response.json()}")

        job_id = response.json().get("task_id")
        if not job_id:
            return jsonify({"status": "error", "message": "Failed to start cartoonization job"}), 500

        return jsonify({"status": "success", "task_id": job_id}), 200

    except requests.exceptions.RequestException as e:
        print(f"Exception: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/get_result', methods=['GET'])
def get_cartoonized_image():
    task_id = request.args.get('task_id')
    if not task_id:
        return jsonify({"status": "error", "message": "task_id is required"}), 400

    url = "https://ai-cartoon-generator.p.rapidapi.com/api/rapidapi/query-async-task-result"
    headers = {
        "x-rapidapi-key": CARTOON_API_KEY,
        "x-rapidapi-host": CARTOON_API_HOST
    }
    params = {"task_id": task_id}

    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()

        job_data = response.json().get('data', {})
        status = job_data.get('status')
        print(job_data)

        if status == "PROCESS_SUCCESS":
            image_url = job_data.get('result_url')
            return jsonify({"status": "success", "image_url": image_url}), 200
        elif status == "FAILED":
            return jsonify({"status": "error", "message": "Cartoonization failed"}), 500

        return jsonify({"status": "error", "message": f"Unexpected status: {status}"}), 500

    except requests.exceptions.RequestException as e:
        print(f"Exception Occurred: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# Serve uploaded files
@app.route('/uploads/<filename>')
def serve_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

def try_on_request_with_retry(payload, headers, max_retries=5, initial_delay=5):
    conn = http.client.HTTPSConnection("virtual-try-on4.p.rapidapi.com")
    delay = initial_delay
    
    for attempt in range(max_retries):
        try:
            conn.request("POST", "/tryon", payload, headers)
            res = conn.getresponse()
            response_data = res.read()
            
            print(f"Attempt {attempt + 1}: Status {res.status}")
            print(f"Response: {response_data.decode('utf-8')}")
            
            # Successful response
            if res.status == 200:
                return response_data
            
            # Service Unavailable - wait and retry
            if res.status == 503:
                print(f"Service Unavailable. Waiting {delay} seconds before retry...")
                time.sleep(delay)
                # Exponential backoff
                delay *= 2
                continue
            
            # Other error statuses
            if res.status >= 400:
                print(f"Error status received: {res.status}")
                # Wait before next retry
                time.sleep(delay)
                continue
        
        except Exception as e:
            print(f"Error on attempt {attempt + 1}: {str(e)}")
            time.sleep(delay)
            delay *= 2
    
    # If all retries fail
    raise Exception("API request failed after maximum retries")

@app.route('/tryon', methods=['POST'])
def virtual_try_on():
    try:
        data = request.json
        garment_url = data.get('garment_url')
        human_url = data.get('human_url')
        category = data.get('category', 'upper_body')

        if not garment_url or not human_url:
            return jsonify({"error": "garment_url and human_url are required"}), 400

        payload = json.dumps({
            "garm": garment_url,
            "human": human_url,
            "category": category
        })

        headers = {
            'x-rapidapi-key': "b2e2eef074mshaf8ed860e4f49ebp1250a4jsn1a1a419f1200",
            'x-rapidapi-host': "virtual-try-on4.p.rapidapi.com",
            'Content-Type': "application/json"
        }

        try:
            response_data = try_on_request_with_retry(payload, headers)
            result = json.loads(response_data.decode("utf-8"))
            return jsonify({"img": result}), 200
        
        except Exception as e:
            # Log the error for server-side tracking
            print(f"Try-on request failed: {str(e)}")
            # Return a 500 error with a generic message
            return jsonify({"error": "Unable to process try-on request"}), 500

    except Exception as e:
        # Catch any unexpected errors
        print(f"Unexpected error in virtual_try_on: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    
# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'status': 'error', 'message': 'Route not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'status': 'error', 'message': 'Internal server error'}), 500




if __name__ == '__main__':
    print("🚀 Starting Flask server...")
    app.run(debug=True)

