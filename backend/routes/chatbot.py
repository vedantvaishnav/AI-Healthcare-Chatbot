import json
import traceback
from datetime import datetime
from flask import Blueprint, jsonify, request, current_app, g

from groq_service import generate_healthcare_response
from services.db_service import (
    save_chat_message,
    get_sessions_for_user,
    get_chat_history,
    create_session,
    get_user_by_id,
    save_health_record,
    get_health_records,
    get_health_summary,
    save_bmi_record,
    get_bmi_history,
    save_symptom_report,
    get_symptom_reports,
    get_dashboard_summary,
)
from utils.jwt_utils import auth_required, decode_access_token

chatbot_bp = Blueprint('chatbot', __name__)


def _get_user_id_from_token():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None

    token = auth_header.split(' ', 1)[1].strip()
    if not token:
        return None

    try:
        payload = decode_access_token(token)
        user_id = payload.get('sub')
        return int(user_id) if user_id is not None else None
    except Exception:
        current_app.logger.debug('Invalid auth token for support route')
        return None


@chatbot_bp.route('/api/test-ai', methods=['GET'])
def test_ai():
    try:
        reply = generate_healthcare_response("Hello")
        return jsonify({'success': True, 'response': reply}), 200
    except Exception as exc:
        current_app.logger.exception('AI test failed: %s', exc)
        return jsonify({'success': False, 'error': str(exc)}), 500


@chatbot_bp.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200


@chatbot_bp.route('/api/chat', methods=['POST'])
def chat():
    try:
        raw_body = request.get_data(as_text=True)
        data = request.get_json(silent=True)
        current_app.logger.debug('Incoming Raw Body: %s', raw_body)
        current_app.logger.debug('Incoming Parsed JSON: %s', data)

        if data is None:
            try:
                data = json.loads(raw_body) if raw_body else {}
            except json.JSONDecodeError:
                return jsonify({'success': False, 'reply': 'Request body must be valid JSON.'}), 400

        message = str(data.get('message', '')).strip()
        session_id = data.get('sessionId')
        session_name = data.get('sessionName', 'Quick Health Chat')
        mode = data.get('mode', 'general')
        user_data = {
            'age': data.get('age'),
            'gender': data.get('gender'),
            'weight': data.get('weight'),
            'height': data.get('height'),
            'BMI': data.get('BMI'),
            'symptoms': data.get('symptoms') or data.get('symptom'),
            'activity_level': data.get('activityLevel') or data.get('activity_level'),
        }

        current_app.logger.debug('Chat request message=%s sessionId=%s mode=%s user_data=%s', message, session_id, mode, user_data)

        if not message:
            return jsonify({'success': False, 'reply': 'A valid message is required.'}), 400

        user_id = _get_user_id_from_token()
        if user_id and not session_id:
            session_id = create_session(user_id, session_name)

        save_chat_message(user_id, session_id, 'user', message)

        try:
            reply = generate_healthcare_response(message, user_data)
            current_app.logger.debug('AI reply generated successfully: %s', reply)
            save_chat_message(user_id, session_id, 'assistant', reply)
            return jsonify({'success': True, 'reply': reply, 'sessionId': session_id}), 200
        except Exception as ai_exc:
            current_app.logger.exception('AI generation failure: %s', ai_exc)
            error_reply = f'AI generation failed: {str(ai_exc)}'
            save_chat_message(user_id, session_id, 'assistant', error_reply)
            return jsonify({'success': False, 'reply': error_reply, 'sessionId': session_id}), 500
    except Exception as exc:
        current_app.logger.exception('Chat error: %s', exc)
        traceback.print_exc()
        return jsonify({'success': False, 'reply': 'Unable to generate a response. Please try again.'}), 500


@chatbot_bp.route('/api/chats', methods=['GET'])
@auth_required
def chats():
    user = g.current_user
    sessions = get_sessions_for_user(user['id'])
    return jsonify({'sessions': sessions}), 200


@chatbot_bp.route('/api/chats/<int:session_id>', methods=['GET'])
@auth_required
def chat_history(session_id):
    user = g.current_user
    history = get_chat_history(user['id'], session_id)
    return jsonify({'messages': history}), 200


@chatbot_bp.route('/api/bmi', methods=['POST'])
def calculate_bmi():
    try:
        data = request.get_json()
        height = data.get('height')
        weight = data.get('weight')

        if height is None or weight is None:
            return jsonify({'error': 'Height and weight are required.'}), 400

        try:
            height_m = float(height) / 100
            weight_kg = float(weight)
            bmi = round(weight_kg / (height_m ** 2), 1)
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid height or weight values.'}), 400

        if bmi < 18.5:
            category = 'Underweight'
            advice = 'Consider consulting a healthcare provider for personalized nutrition advice.'
        elif 18.5 <= bmi < 25:
            category = 'Normal weight'
            advice = 'Maintain a balanced diet and regular exercise.'
        elif 25 <= bmi < 30:
            category = 'Overweight'
            advice = 'Focus on healthy eating and increased physical activity.'
        else:
            category = 'Obese'
            advice = 'Consult a healthcare professional for comprehensive weight management.'

        user_id = _get_user_id_from_token()
        if user_id:
            save_bmi_record(user_id, float(height), float(weight), bmi, category, advice, datetime.utcnow().date().isoformat())

        return jsonify({
            'bmi': bmi,
            'category': category,
            'advice': advice,
        }), 200
    except Exception as exc:
        current_app.logger.error('BMI calculation error: %s', exc)
        traceback.print_exc()
        return jsonify({'error': 'Unable to calculate BMI.'}), 500


@chatbot_bp.route('/api/bmi/history', methods=['GET'])
@auth_required
def bmi_history():
    user = g.current_user
    history = get_bmi_history(user['id'])
    return jsonify({'history': history}), 200


@chatbot_bp.route('/api/health-records', methods=['POST'])
@auth_required
def add_health_record():
    try:
        user = g.current_user
        data = request.get_json()
        record_type = data.get('type')
        value = data.get('value')
        unit = data.get('unit')
        date = data.get('date')
        notes = data.get('notes')

        if not all([record_type, value, unit, date]):
            return jsonify({'error': 'Type, value, unit, and date are required.'}), 400

        record_id = save_health_record(user['id'], record_type, float(value), unit, date, notes)
        return jsonify({'id': record_id, 'message': 'Health record saved successfully.'}), 201
    except Exception as exc:
        current_app.logger.error('Health record save error: %s', exc)
        traceback.print_exc()
        return jsonify({'error': 'Unable to save health record.'}), 500


@chatbot_bp.route('/api/health-records', methods=['GET'])
@auth_required
def get_user_health_records():
    try:
        user = g.current_user
        record_type = request.args.get('type')
        date = request.args.get('date')
        records = get_health_records(user['id'], record_type, date)
        return jsonify({'records': records}), 200
    except Exception as exc:
        current_app.logger.error('Health records fetch error: %s', exc)
        traceback.print_exc()
        return jsonify({'error': 'Unable to fetch health records.'}), 500


@chatbot_bp.route('/api/health-summary', methods=['GET'])
@auth_required
def health_summary():
    try:
        user = g.current_user
        date = request.args.get('date')
        if not date:
            date = datetime.utcnow().date().isoformat()
        summary = get_health_summary(user['id'], date)
        return jsonify({'summary': summary, 'date': date}), 200
    except Exception as exc:
        current_app.logger.error('Health summary error: %s', exc)
        traceback.print_exc()
        return jsonify({'error': 'Unable to fetch health summary.'}), 500


@chatbot_bp.route('/api/symptoms', methods=['POST'])
@auth_required
def add_symptom_report():
    try:
        user = g.current_user
        data = request.get_json()
        summary_text = data.get('summary')
        details = data.get('details')
        severity = data.get('severity')
        duration = data.get('duration')

        if not summary_text or not details or not severity:
            return jsonify({'error': 'Summary, details, and severity are required.'}), 400

        report_id = save_symptom_report(user['id'], summary_text, details, severity, duration or '')
        return jsonify({'id': report_id, 'message': 'Symptom report saved successfully.'}), 201
    except Exception as exc:
        current_app.logger.error('Symptom report save error: %s', exc)
        traceback.print_exc()
        return jsonify({'error': 'Unable to save symptom report.'}), 500


@chatbot_bp.route('/api/symptoms', methods=['GET'])
@auth_required
def list_symptom_reports():
    user = g.current_user
    reports = get_symptom_reports(user['id'])
    return jsonify({'reports': reports}), 200


@chatbot_bp.route('/api/dashboard/summary', methods=['GET'])
@auth_required
def dashboard_summary():
    user = g.current_user
    summary = get_dashboard_summary(user['id'])
    return jsonify({'summary': summary}), 200


@chatbot_bp.route('/api/healthtips', methods=['GET'])
def health_tips():
    tips = [
        {
            'title': 'Stay hydrated',
            'description': 'Drink water regularly, especially when you are active or in hot weather.',
        },
        {
            'title': 'Balanced meals',
            'description': 'Aim for a mix of lean protein, whole grains, and colorful vegetables every day.',
        },
        {
            'title': 'Rest and recovery',
            'description': 'Sleep 7-9 hours each night to support mood, memory, and immune health.',
        },
        {
            'title': 'Emergency awareness',
            'description': 'If you experience severe chest pain, shortness of breath, or sudden weakness, seek immediate medical help.',
        },
        {
            'title': 'First aid readiness',
            'description': 'Keep a basic first aid kit nearby and know when to use it for minor injuries.',
        },
    ]
    return jsonify({'tips': tips}), 200

