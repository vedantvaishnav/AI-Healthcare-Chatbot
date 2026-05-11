import logging
from flask import Flask, jsonify, request
from flask_cors import CORS

from config import GEMINI_API_KEY, SQLALCHEMY_DATABASE_URI
from models import db
from routes.auth import auth_bp
from routes.chatbot import chatbot_bp

logging.basicConfig(level=logging.DEBUG, format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s')

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.debug = True
app.logger.setLevel(logging.DEBUG)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

db.init_app(app)

with app.app_context():
    db.create_all()

@app.before_request
def log_request():
    body = request.get_data(as_text=True)
    app.logger.debug('Incoming request: %s %s headers=%s body=%s', request.method, request.path, dict(request.headers), body)

app.register_blueprint(auth_bp)
app.register_blueprint(chatbot_bp)

@app.route('/')
def home():
    return jsonify({'message': 'HealthAI Assistant backend is running.', 'status': 'ok'})

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found.'}), 404

@app.errorhandler(500)
def server_error(error):
    logging.exception('Unhandled server error')
    return jsonify({'error': 'Internal server error.'}), 500

if __name__ == '__main__':
    if not GEMINI_API_KEY:
        app.logger.warning('GEMINI_API_KEY or GOOGLE_API_KEY is not configured. Chat functionality will be limited.')
    app.run(debug=True)
