from datetime import datetime
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


class BaseModel:
    def to_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}


class User(db.Model, BaseModel):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    sessions = db.relationship('ChatSession', back_populates='user', lazy='dynamic', cascade='all, delete-orphan')
    messages = db.relationship('ChatMessage', back_populates='user', lazy='dynamic', cascade='all, delete-orphan')
    health_records = db.relationship('HealthRecord', back_populates='user', lazy='dynamic', cascade='all, delete-orphan')
    bmi_records = db.relationship('BmiRecord', back_populates='user', lazy='dynamic', cascade='all, delete-orphan')


class ChatSession(db.Model, BaseModel):
    __tablename__ = 'sessions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship('User', back_populates='sessions')
    messages = db.relationship('ChatMessage', back_populates='session', lazy='dynamic', cascade='all, delete-orphan')


class ChatMessage(db.Model, BaseModel):
    __tablename__ = 'chats'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'), nullable=True)
    role = db.Column(db.String(32), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship('User', back_populates='messages')
    session = db.relationship('ChatSession', back_populates='messages')


class HealthRecord(db.Model, BaseModel):
    __tablename__ = 'health_records'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    record_type = db.Column(db.String(50), nullable=False)
    value = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(50), nullable=False)
    date = db.Column(db.String(20), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship('User', back_populates='health_records')


class BmiRecord(db.Model, BaseModel):
    __tablename__ = 'bmi_records'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    height_cm = db.Column(db.Float, nullable=False)
    weight_kg = db.Column(db.Float, nullable=False)
    bmi = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    advice = db.Column(db.Text, nullable=False)
    date = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship('User', back_populates='bmi_records')


