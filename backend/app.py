import logging
from flask import Flask, jsonify, request
from flask_cors import CORS

from config import GROQ_API_KEY, SQLALCHEMY_DATABASE_URI
from models import db
from routes.auth import auth_bp
from routes.chatbot import chatbot_bp

logging.basicConfig(level=logging.DEBUG, format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s')

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.debug = True
app.logger.setLevel(logging.DEBUG)
CORS(app, resources={r'/api/*': {'origins': '*'}}, supports_credentials=True, allow_headers=['Content-Type', 'Authorization'])

db.init_app(app)

with app.app_context():
    db.create_all()

app.register_blueprint(auth_bp)
app.register_blueprint(chatbot_bp)

app.logger.info('Registered backend routes:')
for rule in app.url_map.iter_rules():
    methods = ','.join(sorted(rule.methods - {'HEAD', 'OPTIONS'}))
    app.logger.info('%s %s', methods, rule.rule)

@app.before_request
def log_request():
    body = request.get_data(as_text=True)
    app.logger.debug('Incoming request: %s %s headers=%s body=%s', request.method, request.path, dict(request.headers), body)

# Test AI on startup
# try:
#     test_response = generate_healthcare_response("Hello")
#     app.logger.info('AI startup test successful: %s', test_response)
# except Exception as e:
#     app.logger.error('AI startup test failed: %s', e)

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
    if not GROQ_API_KEY:
        app.logger.warning('GROQ_API_KEY is not configured. Chat functionality will be limited.')
    app.run(debug=True)
