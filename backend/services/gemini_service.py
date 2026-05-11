import logging
import sqlite3
from datetime import datetime
from pathlib import Path

import google.generativeai as genai

from config import GEMINI_API_KEY, GEMINI_MODEL_NAME

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / 'chat_history.db'

logging.getLogger(__name__).debug('Using Gemini model: %s', GEMINI_MODEL_NAME)

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    logging.getLogger(__name__).warning('GEMINI_API_KEY or GOOGLE_API_KEY is not configured.')


def init_history_db():
    """Initialize the SQLite chat history database."""
    with sqlite3.connect(DB_PATH) as connection:
        connection.execute(
            '''
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                role TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            '''
        )
        connection.commit()


def save_chat_history(role: str, message: str) -> None:
    """Persist the chat message to the SQLite database."""
    timestamp = datetime.utcnow().isoformat() + 'Z'
    with sqlite3.connect(DB_PATH) as connection:
        connection.execute(
            'INSERT INTO chat_history (role, message, created_at) VALUES (?, ?, ?)',
            (role, message, timestamp),
        )
        connection.commit()


def _ensure_disclaimer(text: str) -> str:
    disclaimer = 'This is AI-generated advice. Please consult a medical professional.'
    normalized = text.strip()
    if disclaimer not in normalized:
        if not normalized.endswith(('.', '!', '?')):
            normalized += '.'
        normalized = f'{normalized} {disclaimer}'
    return normalized


def generate_healthcare_response(message: str, mode: str = 'general') -> str:
    if not GEMINI_API_KEY:
        raise EnvironmentError('GEMINI_API_KEY or GOOGLE_API_KEY is missing from environment configuration')

    base_prompt = (
        'You are HealthAI Assistant, a professional healthcare AI. Provide clear guidance on wellness, symptom awareness, diet, disease prevention, first aid, and emergency warning signs. '
        'Do not offer a medical diagnosis, but do describe when a user should seek professional help. '
        'If the prompt describes serious symptoms like chest pain, difficulty breathing, sudden weakness, or severe allergic reaction, emphasize emergency care immediately. '
        'Always include a short medicine disclaimer and simple precautions for the user. '
        'Use empathetic tone and concise recommendations. '
    )

    if mode == 'symptom':
        prompt = base_prompt + (
            'Focus on symptom analysis. Ask clarifying questions if needed. Provide possible causes and when to seek medical attention. '
            f'User symptom query: {message}'
        )
    elif mode == 'diet':
        prompt = base_prompt + (
            'Focus on personalized diet suggestions. Consider nutritional balance, allergies, and health goals. Provide meal ideas and portion guidance. '
            f'User diet query: {message}'
        )
    elif mode == 'bmi':
        prompt = base_prompt + (
            'Provide BMI interpretation and health advice based on the calculation. Suggest lifestyle changes if needed. '
            f'User BMI query: {message}'
        )
    else:
        prompt = base_prompt + f'User query: {message}'

    model = genai.GenerativeModel(GEMINI_MODEL_NAME)
    print('Using Gemini model:', GEMINI_MODEL_NAME)
    response = model.generate_content(prompt)
    print('Gemini response object:', response)

    if response is None or not hasattr(response, 'text'):
        raise RuntimeError('Gemini did not return a valid response')

    reply = response.text
    final_reply = _ensure_disclaimer(reply)
    return final_reply
