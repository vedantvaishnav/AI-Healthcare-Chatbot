from datetime import datetime
from typing import Dict, List, Optional

from models import db, User, ChatSession, ChatMessage, HealthRecord, BmiRecord


def _format_datetime(value: Optional[datetime]) -> Optional[str]:
    if not value:
        return None
    return value.isoformat() + 'Z'


def _user_to_dict(user: User, include_password: bool = False) -> Dict:
    if not user:
        return None
    result = {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'created_at': _format_datetime(user.created_at),
    }
    if include_password:
        result['password_hash'] = user.password_hash
    return result


def create_user(name: str, email: str, password_hash: str) -> int:
    user = User(name=name, email=email, password_hash=password_hash)
    db.session.add(user)
    db.session.commit()
    return user.id


def get_user_by_email(email: str) -> Optional[Dict]:
    user = User.query.filter_by(email=email).first()
    return _user_to_dict(user, include_password=True) if user else None


def get_user_by_id(user_id: int) -> Optional[Dict]:
    if user_id is None:
        return None
    user = User.query.get(int(user_id))
    return _user_to_dict(user) if user else None


def create_session(user_id: int, name: str = 'Quick Health Chat') -> int:
    session = ChatSession(user_id=user_id, name=name)
    db.session.add(session)
    db.session.commit()
    return session.id


def get_sessions_for_user(user_id: int) -> List[Dict]:
    sessions = ChatSession.query.filter_by(user_id=user_id).order_by(ChatSession.created_at.desc()).all()
    results = []
    for session in sessions:
        messages = session.messages.order_by(ChatMessage.created_at.asc()).all()
        results.append({
            'id': session.id,
            'name': session.name,
            'created_at': _format_datetime(session.created_at),
            'message_count': len(messages),
            'last_message': messages[-1].message if messages else None,
        })
    return results


def get_chat_history(user_id: int, session_id: Optional[int] = None) -> List[Dict]:
    query = ChatMessage.query.filter_by(user_id=user_id)
    if session_id:
        query = query.filter_by(session_id=session_id)
    messages = query.order_by(ChatMessage.created_at.asc()).all()
    return [
        {
            'role': message.role,
            'message': message.message,
            'created_at': _format_datetime(message.created_at),
        }
        for message in messages
    ]


def save_chat_message(user_id: Optional[int], session_id: Optional[int], role: str, message: str) -> int:
    chat_message = ChatMessage(user_id=user_id, session_id=session_id, role=role, message=message)
    db.session.add(chat_message)
    db.session.commit()
    return chat_message.id


def save_health_record(user_id: int, record_type: str, value: float, unit: str, date: str, notes: str = None) -> int:
    record = HealthRecord(
        user_id=user_id,
        record_type=record_type,
        value=value,
        unit=unit,
        date=date,
        notes=notes,
    )
    db.session.add(record)
    db.session.commit()
    return record.id


def get_health_records(user_id: int, record_type: str = None, date: str = None) -> List[Dict]:
    query = HealthRecord.query.filter_by(user_id=user_id)
    if record_type:
        query = query.filter_by(record_type=record_type)
    if date:
        query = query.filter_by(date=date)
    records = query.order_by(HealthRecord.created_at.desc()).all()
    return [
        {
            'id': record.id,
            'record_type': record.record_type,
            'value': record.value,
            'unit': record.unit,
            'date': record.date,
            'notes': record.notes,
            'created_at': _format_datetime(record.created_at),
        }
        for record in records
    ]


def get_health_summary(user_id: int, date: str) -> Dict:
    summary = {}
    record_types = ['water', 'exercise', 'sleep']
    for record_type in record_types:
        total = db.session.query(db.func.sum(HealthRecord.value)).filter_by(user_id=user_id, record_type=record_type, date=date).scalar() or 0
        summary[record_type] = float(total)

    food_total = db.session.query(db.func.sum(HealthRecord.value)).filter_by(user_id=user_id, record_type='food', date=date).scalar() or 0
    manual_calories = db.session.query(db.func.sum(HealthRecord.value)).filter_by(user_id=user_id, record_type='calories', date=date).scalar() or 0

    food_total = float(food_total)
    manual_calories = float(manual_calories)
    summary['food'] = food_total
    summary['calories'] = float(food_total + manual_calories)

    return summary


def save_bmi_record(user_id: int, height_cm: float, weight_kg: float, bmi: float, category: str, advice: str, date: str) -> int:
    record = BmiRecord(
        user_id=user_id,
        height_cm=height_cm,
        weight_kg=weight_kg,
        bmi=bmi,
        category=category,
        advice=advice,
        date=date,
    )
    db.session.add(record)
    db.session.commit()
    return record.id


def get_bmi_history(user_id: int) -> List[Dict]:
    records = BmiRecord.query.filter_by(user_id=user_id).order_by(BmiRecord.created_at.desc()).all()
    return [
        {
            'id': record.id,
            'height_cm': record.height_cm,
            'weight_kg': record.weight_kg,
            'bmi': record.bmi,
            'category': record.category,
            'advice': record.advice,
            'date': record.date,
            'created_at': _format_datetime(record.created_at),
        }
        for record in records
    ]


def get_dashboard_summary(user_id: int) -> Dict:
    return {
        'sessions': ChatSession.query.filter_by(user_id=user_id).count(),
        'messages': ChatMessage.query.filter_by(user_id=user_id).count(),
        'health_records': HealthRecord.query.filter_by(user_id=user_id).count(),
        'bmi_history': BmiRecord.query.filter_by(user_id=user_id).count(),
    }
