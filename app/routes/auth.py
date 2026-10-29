from flask import Blueprint, request, jsonify
from app.models import User
from app.extensions import db, bcrypt
import jwt
import datetime
from config import Config

auth_bp = Blueprint('auth', __name__)

def user_payload(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': None,
        'phone': None,
        'rank': '',
        'department': '',
        'experience_years': 0,
        'unit': None,
        'certifications': [],
        'role': user.role,
        'is_active': True,
        'created_at': None,
        'last_login': None,
    }

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username') or data.get('email')
    password = data.get('password')
    role = data.get('role', 'player') # Default to player

    if not username or not password:
        return jsonify({'message': 'Username and password required'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password_hash=hashed_password, role=role)
    
    db.session.add(new_user)
    db.session.commit()

    token = jwt.encode({
        'user_id': new_user.id,
        'role': new_user.role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, Config.SECRET_KEY, algorithm="HS256")

    return jsonify({
        'message': 'User created successfully',
        'token': token,
        'user': user_payload(new_user),
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username') or data.get('email')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and bcrypt.check_password_hash(user.password_hash, password):
        token = jwt.encode({
            'user_id': user.id,
            'role': user.role,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, Config.SECRET_KEY, algorithm="HS256")

        return jsonify({
            'token': token,
            'role': user.role,
            'user_id': user.id,
            'user': user_payload(user),
        }), 200

    return jsonify({'message': 'Invalid credentials'}), 401
