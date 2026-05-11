import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, g
from config import JWT_SECRET, JWT_ALGORITHM, JWT_EXP_DELTA_MINUTES
from services.db_service import get_user_by_id


def create_access_token(user_id: int) -> str:
    payload = {
        'sub': str(user_id),
        'exp': datetime.utcnow() + timedelta(minutes=JWT_EXP_DELTA_MINUTES),
        'iat': datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


def auth_required(route_function):
    @wraps(route_function)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        token = None
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ', 1)[1].strip()

        if not token:
            return jsonify({'error': 'Missing authorization token.'}), 401

        try:
            payload = decode_access_token(token)
            user_id = payload.get('sub')
            if user_id is None:
                return jsonify({'error': 'Invalid token claims.'}), 401
            user = get_user_by_id(int(user_id))
            if not user:
                return jsonify({'error': 'Invalid token user.'}), 401
            g.current_user = user
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired.'}), 401
        except (jwt.InvalidTokenError, ValueError):
            return jsonify({'error': 'Invalid authorization token.'}), 401

        return route_function(*args, **kwargs)

    return wrapper
