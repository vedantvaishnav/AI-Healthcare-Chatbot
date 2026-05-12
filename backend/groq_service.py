from groq import Groq
import os

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_healthcare_response(user_message):

    print("Groq API Called")
    print(user_message)

    prompt = f"""
    You are an intelligent healthcare assistant chatbot.

    Give:
    - natural human-like responses
    - detailed answers
    - different answers every time
    - healthcare guidance
    - symptom explanation
    - prevention tips
    - simple language

    User: {user_message}
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.9,
        max_tokens=700
    )

    return response.choices[0].message.content