from flask import Flask, request, jsonify, make_response
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
from functools import wraps
import jwt
from datetime import datetime, timedelta, timezone
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
app = Flask(__name__)
frontend_url = os.getenv('FRONTEND_URL')
mongo_url = os.getenv('MONGO_URL')
secret_key = os.getenv('SECRET_KEY')
CORS(app, resources={r"/*": {"origins": frontend_url}})

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
    }

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
