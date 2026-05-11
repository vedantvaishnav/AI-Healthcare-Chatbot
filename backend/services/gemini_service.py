import logging
import sqlite3
import time
from datetime import datetime
from pathlib import Path

import google.genai as genai
from google.genai import types

from config import GEMINI_API_KEY, GEMINI_MODEL_NAME

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / 'chat_history.db'

logger = logging.getLogger(__name__)
logger.debug('Using Gemini model: %s', GEMINI_MODEL_NAME)

if GEMINI_API_KEY:
    partial_key = f"{GEMINI_API_KEY[:4]}...{GEMINI_API_KEY[-4:]}" if len(GEMINI_API_KEY) > 8 else 'set'
    logger.info('GEMINI_API_KEY loaded: yes (masked as %s)', partial_key)
    client = genai.Client(api_key=GEMINI_API_KEY)
    logger.info('Gemini client initialized successfully')
else:
    logger.warning('GEMINI_API_KEY or GOOGLE_API_KEY is not configured.')
    client = None


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
    if not GEMINI_API_KEY or not client:
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

    logger.debug('Incoming user message: %s', message)
    logger.debug('Outgoing Gemini request prompt: %s', prompt)

    max_retries = 3
    for attempt in range(1, max_retries + 1):
        try:
            response = client.models.generate_content(model=GEMINI_MODEL_NAME, contents=prompt)
            logger.debug('Raw Gemini API response: %s', response)
            reply = response.text
            logger.debug('Extracted reply: %s', reply)
            break
        except Exception as exc:
            logger.exception('Gemini API call failed on attempt %s: %s', attempt, exc)
            if attempt == max_retries:
                raise RuntimeError(f'Gemini API failed after {max_retries} attempts: {exc}') from exc
            time.sleep(2 * attempt)

    if not reply:
        logger.error('Gemini returned no usable text')
        raise RuntimeError('Gemini did not return a valid text response')

    return _ensure_disclaimer(reply)
