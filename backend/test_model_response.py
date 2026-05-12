#!/usr/bin/env python
import os
from pathlib import Path
from dotenv import load_dotenv
import google.genai as genai
import time

# Load environment
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')

api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    print("ERROR: GEMINI_API_KEY not found")
    exit(1)

print(f"API Key loaded (last 4 chars): ...{api_key[-4:]}")

try:
    client = genai.Client(api_key=api_key)
    
    # Test with the new model
    model_name = 'models/gemini-2.0-flash'
    print(f"\n✓ Testing model: {model_name}")
    
    response = client.models.generate_content(
        model=model_name,
        contents="Hello! What is 2+2?"
    )
    
    print(f"✓ Model response successful!")
    print(f"Response: {response.text[:100]}...")
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
