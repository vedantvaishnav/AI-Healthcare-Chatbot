import traceback
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash

from services.db_service import create_user, get_user_by_email, get_user_by_id
from utils.jwt_utils import create_access_token, decode_access_token

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    try:
        payload = request.get_json(force=True)
        name = payload.get('name', '').strip()
        email = payload.get('email', '').strip().lower()
        password = payload.get('password', '').strip()

        if not name or not email or not password:
            return jsonify({'error': 'Name, email, and password are required.'}), 400

        existing_user = get_user_by_email(email)
        if existing_user:
            return jsonify({'error': 'A user with that email already exists.'}), 409

        hashed_password = generate_password_hash(password)
        user_id = create_user(name, email, hashed_password)
        token = create_access_token(user_id)

        user = get_user_by_id(user_id)
        return jsonify({'token': token, 'user': user}), 201
    except Exception as exc:
        current_app.logger.error('Register error: %s', exc)
        traceback.print_exc()
        return jsonify({'error': 'Unable to create account. Please try again.'}), 500


@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    try:
        payload = request.get_json(force=True)
        email = payload.get('email', '').strip().lower()
        password = payload.get('password', '').strip()

        if not email or not password:
            return jsonify({'error': 'Email and password are required.'}), 400

        user = get_user_by_email(email)
        if not user or not check_password_hash(user['password_hash'], password):
            return jsonify({'error': 'Invalid email or password.'}), 401

        token = create_access_token(user['id'])
        user_data = {k: user[k] for k in ('id', 'name', 'email', 'created_at')}
        return jsonify({'token': token, 'user': user_data}), 200
    except Exception as exc:
        current_app.logger.error('Login error: %s', exc)
        traceback.print_exc()
        return jsonify({'error': 'Unable to authenticate. Please try again.'}), 500


@auth_bp.route('/api/auth/me', methods=['GET'])
def me():
    try:
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing authorization header.'}), 401

        token = auth_header.split(' ', 1)[1].strip()
        payload = decode_access_token(token)
        user_id = payload.get('sub')
        if user_id is None:
            return jsonify({'error': 'User not found.'}), 401
        user = get_user_by_id(int(user_id))
        if not user:
            return jsonify({'error': 'User not found.'}), 401
        return jsonify({'user': user}), 200
    except Exception as exc:
        current_app.logger.error('Me error: %s', exc)
        traceback.print_exc()
        return jsonify({'error': 'Unable to verify user.'}), 401
