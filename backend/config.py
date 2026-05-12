from pathlib import Path
from dotenv import load_dotenv
import os

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env', override=True)

DATABASE_FILE = BASE_DIR / 'healthai.db'
DATABASE_PATH = DATABASE_FILE
SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', f"sqlite:///{DATABASE_FILE.as_posix()}")
JWT_SECRET = os.getenv('JWT_SECRET', 'change-me-to-a-secure-secret-12345')
JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
JWT_EXP_DELTA_MINUTES = int(os.getenv('JWT_EXP_DELTA_MINUTES', '1440'))

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
GEMINI_MODEL_NAME = os.getenv('GEMINI_MODEL_NAME', 'models/gemini-2.0-flash')
