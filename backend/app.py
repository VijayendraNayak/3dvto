from flask import Flask, request, jsonify, make_response,send_from_directory
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
from flask_cors import CORS
from dotenv import load_dotenv
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

NGROK_URL = "https://7399-103-62-150-78.ngrok-free.app"

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


# Admin: Add clothing
@app.route('/admin/clothing', methods=['POST'])
@token_required
@admin_required
def add_clothing(current_user):
    data = request.get_json()
    clothing_item = {
        'name': data['name'],
        'category_id': data['category'],
        'price': float(data['price']),
        'sizes_available': data.get('sizes_available', []),
        'color': data.get('color', ''),
        'model_file_path': data.get('model_file_path', ''),
        'thumbnail_path': data.get('thumbnail_path', ''),
        'created_by': current_user['_id'],
        'created_at': datetime.now(timezone.utc),
        'is_active': True
    }

    result = mongo.db.clothing_items.insert_one(clothing_item)
    log_admin_action(current_user['_id'], 'CREATE', 'clothing_items', result.inserted_id, data)

    return jsonify({'message': 'Clothing item added successfully', 'id': str(result.inserted_id)}), 201

# Helper function for logging admin actions
def log_admin_action(admin_id, action_type, collection_name, record_id, changes):
    log = {
        'admin_id': admin_id,
        'action_type': action_type,
        'collection_name': collection_name,
        'record_id': str(record_id),
        'changes': changes,
        'action_timestamp': datetime.now(timezone.utc).isoformat()
    }
    mongo.db.admin_audit_logs.insert_one(log)
    
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
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file:
        # Save the file locally
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)
        
        # Generate a public download link using ngrok
        public_url = f"{NGROK_URL}/uploads/{file.filename}"
        return jsonify({"message": "File uploaded successfully!", "download_url": public_url})

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
