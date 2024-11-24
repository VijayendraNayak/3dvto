from flask import Flask, request, jsonify, make_response,send_from_directory
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
from flask_cors import CORS
from dotenv import load_dotenv
<<<<<<< HEAD
from werkzeug.utils import secure_filename
import firebase_admin
from firebase_admin import credentials, storage
=======
>>>>>>> origin/main
from functools import wraps
import jwt
import time
from datetime import datetime, timedelta, timezone
import os
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
        local_path = os.path.join("/tmp", filename)  # Save temporarily before uploading to Firebase
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
            'category_id': data.get('category', ''),
            'price': float(data.get('price', 0)),
            'sizes_available': data.get('sizes_available', '').split(','),
            'color': data.get('color', ''),
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
        updated_fields['category_id'] = data['category']
    if 'price' in data:
        updated_fields['price'] = float(data['price'])
    if 'sizes_available' in data:
        updated_fields['sizes_available'] = data['sizes_available'].split(',')
    if 'color' in data:
        updated_fields['color'] = data['color']

    if updated_fields:
        updated_fields['updated_at'] = datetime.now(timezone.utc)
        mongo.db.clothing_items.update_one(
            {"_id": ObjectId(cloth_id)},
            {"$set": updated_fields}
        )

    return jsonify({"message": "Clothing item updated successfully"}), 200




# Serve uploaded files
@app.route('/uploads/<filename>')
def serve_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

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
