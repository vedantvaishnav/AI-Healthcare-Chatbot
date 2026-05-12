#!/usr/bin/env python
import os
from pathlib import Path
from dotenv import load_dotenv
import google.genai as genai

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
    models = list(client.models.list())
    print("\n✓ Connected to Gemini API")
    print(f"\nTotal models: {len(models)}")
    print("\nAll model names:")
    for m in models:
        print(f"  {m.name}")
        # Print first model's attributes for debugging
        if models.index(m) == 0:
            print(f"  First model attributes: {dir(m)[:10]}")
except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
