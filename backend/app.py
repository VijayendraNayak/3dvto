# app.py
from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
from functools import wraps
import jwt
import datetime
import os

app = Flask(__name__)

# Configuration
app.config["MONGO_URI"] = "mongodb://localhost:27017/VTO"
app.config['SECRET_KEY'] = 'Chandan love Kiara'  # Change this to a secure secret key
mongo = PyMongo(app)

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = mongo.db.users.find_one({'_id': ObjectId(data['user_id'])})
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

# Admin required decorator
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization').split(" ")[1]
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        current_user = mongo.db.users.find_one({'_id': ObjectId(data['user_id'])})
        
        if current_user['role'] != 'admin':
            return jsonify({'message': 'Admin privileges required'}), 403
        
        return f(current_user, *args, **kwargs)
    return decorated

# Authentication routes
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
        'role': 'user',  # Default role
        'created_at': datetime.datetime.utcnow()
    }
    
    mongo.db.users.insert_one(user)
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = mongo.db.users.find_one({'email': data['email']})
    
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    token = jwt.encode({
        'user_id': str(user['_id']),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'])
    
    return jsonify({'token': token})

# Admin routes for clothing management
@app.route('/admin/clothing', methods=['POST'])
@token_required
@admin_required
def add_clothing(current_user):
    data = request.get_json()
    
    clothing_item = {
        'name': data['name'],
        'category_id': ObjectId(data['category_id']),
        'description': data.get('description', ''),
        'price': float(data['price']),
        'sizes_available': data.get('sizes_available', []),
        'color': data.get('color', ''),
        'brand': data.get('brand', ''),
        'model_file_path': data.get('model_file_path', ''),
        'thumbnail_path': data.get('thumbnail_path', ''),
        'created_by': current_user['_id'],
        'created_at': datetime.datetime.utcnow(),
        'is_active': True
    }
    
    result = mongo.db.clothing_items.insert_one(clothing_item)
    
    # Log admin action
    log_admin_action(current_user['_id'], 'CREATE', 'clothing_items', result.inserted_id, data)
    
    return jsonify({'message': 'Clothing item added successfully', 'id': str(result.inserted_id)}), 201

@app.route('/admin/clothing/<item_id>', methods=['PUT'])
@token_required
@admin_required
def update_clothing(current_user, item_id):
    data = request.get_json()
    
    # Remove fields that shouldn't be updated
    if '_id' in data:
        del data['_id']
    
    data['updated_at'] = datetime.datetime.utcnow()
    
    result = mongo.db.clothing_items.update_one(
        {'_id': ObjectId(item_id)},
        {'$set': data}
    )
    
    if result.modified_count:
        # Log admin action
        log_admin_action(current_user['_id'], 'UPDATE', 'clothing_items', ObjectId(item_id), data)
        return jsonify({'message': 'Clothing item updated successfully'})
    
    return jsonify({'message': 'Item not found'}), 404

@app.route('/admin/clothing/<item_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_clothing(current_user, item_id):
    result = mongo.db.clothing_items.update_one(
        {'_id': ObjectId(item_id)},
        {'$set': {'is_active': False, 'updated_at': datetime.datetime.utcnow()}}
    )
    
    if result.modified_count:
        # Log admin action
        log_admin_action(current_user['_id'], 'DELETE', 'clothing_items', ObjectId(item_id), None)
        return jsonify({'message': 'Clothing item deactivated successfully'})
    
    return jsonify({'message': 'Item not found'}), 404

# Helper function for logging admin actions
def log_admin_action(admin_id, action_type, collection_name, record_id, changes):
    log = {
        'admin_id': admin_id,
        'action_type': action_type,
        'collection_name': collection_name,
        'record_id': record_id,
        'changes': changes,
        'action_timestamp': datetime.datetime.utcnow()
    }
    mongo.db.admin_audit_logs.insert_one(log)

# User profile routes
@app.route('/profile', methods=['GET', 'POST'])
@token_required
def user_profile(current_user):
    if request.method == 'GET':
        profile = mongo.db.user_profiles.find_one({'user_id': current_user['_id']})
        if profile:
            profile['_id'] = str(profile['_id'])
            return jsonify(profile)
        return jsonify({'message': 'Profile not found'}), 404
    
    data = request.get_json()
    profile = {
        'user_id': current_user['_id'],
        'measurements': {
            'shoulder_width': data.get('shoulder_width'),
            'chest_size': data.get('chest_size'),
            'waist_size': data.get('waist_size'),
            'height': data.get('height'),
            'weight': data.get('weight')
        },
        'body_type': data.get('body_type'),
        'last_updated': datetime.datetime.utcnow()
    }
    
    mongo.db.user_profiles.update_one(
        {'user_id': current_user['_id']},
        {'$set': profile},
        upsert=True
    )
    
    return jsonify({'message': 'Profile updated successfully'})

# Try-on session routes
@app.route('/tryon', methods=['POST'])
@token_required
def create_tryon_session(current_user):
    data = request.get_json()
    
    session = {
        'user_id': current_user['_id'],
        'item_id': ObjectId(data['item_id']),
        'captured_image_path': data.get('captured_image_path'),
        'processed_model_path': data.get('processed_model_path'),
        'created_at': datetime.datetime.utcnow()
    }
    
    result = mongo.db.try_on_sessions.insert_one(session)
    return jsonify({'session_id': str(result.inserted_id)})

if __name__ == '__main__':
    app.run(debug=True)