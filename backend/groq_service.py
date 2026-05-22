from groq import Groq
from config import GROQ_API_KEY, GROQ_MODEL_NAME
from health_engine import (
    calculate_bmi, get_bmi_category, calculate_calories, calculate_water_intake,
    generate_diet_plan, generate_exercise_recommendation, generate_home_remedies,
    calculate_sleep_recommendation, get_food_calories
)
import re
from textwrap import dedent

if not GROQ_API_KEY:
    raise RuntimeError('GROQ_API_KEY is not configured. Set it in backend/.env or your environment.')

client = Groq(api_key=GROQ_API_KEY)

def generate_healthcare_response(user_message, user_data=None):
    print("Groq API Called")
    print(user_message)

    # Extract user data for analysis
    age = user_data.get('age') if user_data else None
    gender = user_data.get('gender') if user_data else None
    weight = user_data.get('weight') if user_data else None
    height = user_data.get('height') if user_data else None
    symptoms = user_data.get('symptoms') if user_data else None
    activity_level = user_data.get('activity_level', 'moderate')
    fitness_goal = user_data.get('fitnessGoal') or user_data.get('fitness_goal') if user_data else None

    # Calculate health metrics
    bmi = None
    bmi_info = None
    calories = None
    water = None
    sleep = None
    diet_plan = None
    exercise = None
    remedies = None

    # Helper: detect known symptoms from free text (priority list)
    SYMPTOMS = [
        'headache','fever','cough','cold','acidity','bloating','fatigue','weakness',
        'stress','body pain','stomach pain','dehydration','nausea','sore throat','indigestion'
    ]

    def detect_symptoms(text):
        if not text:
            return []
        text_l = text.lower()
        found = []
        for s in SYMPTOMS:
            # match whole words and simple variants
            pattern = r"\\b" + re.escape(s.replace(' ', '\\s+')) + r"\\b"
            if re.search(pattern, text_l):
                found.append(s)
        return found

    def is_monthly_plan_request(text):
        if not text:
            return False
        text_l = text.lower()
        return bool(re.search(r"(1 month|one month|monthly|month\s+plan|monthly diet|month diet|4 week|4-week)", text_l))

    def generate_monthly_plan(goal='weight_gain'):
        # Simple Indian-flavored 4-week plan skeleton using generate_diet_plan for daily ideas
        weeks = {}
        for w in range(1,5):
            week_key = f'Week {w}'
            # reuse generate_diet_plan for a 7-day block and pick 3 representative days to keep output concise
            day_plan = generate_diet_plan(getattr(bmi_info, 'category', 'Normal') if False else (bmi_info['category'] if bmi_info else 'Normal'), goal, calories['maintenance'] if calories else 2000)
            # pick day1..day3 as representative
            weeks[week_key] = {
                'breakfast': 'Poha / Upma / Idli with chutney (rotate)',
                'lunch': 'Dal + Rice / Roti + Sabzi + Salad',
                'dinner': 'Khichdi / Light dal + roti',
                'snacks': 'Buttermilk, roasted chana, banana, peanuts',
                'goal': 'Focus on steady, balanced meals and small calorie surplus for weight gain' if goal == 'weight_gain' else 'Balanced nutrition and consistency'
            }
        return weeks

    if weight and height:
        bmi = calculate_bmi(weight, height)
        if bmi:
            bmi_info = get_bmi_category(bmi)
            if age and gender:
                calories = calculate_calories(weight, height, age, gender, activity_level)
            water = calculate_water_intake(weight, bmi, activity_level)
            if age:
                sleep = calculate_sleep_recommendation(age, activity_level, bmi_info.get('goal'))
            diet_plan = generate_diet_plan(bmi_info['category'], bmi_info['goal'], calories['maintenance'] if calories else 2000)
            exercise = generate_exercise_recommendation(bmi_info['category'], bmi_info['goal'])

    # If explicit symptoms provided in user_data, use them; else detect from message
    detected_symptoms = []
    if symptoms:
        # normalize comma-separated or list
        if isinstance(symptoms, str):
            detected_symptoms = [s.strip().lower() for s in symptoms.split(',') if s.strip()]
        elif isinstance(symptoms, (list, tuple)):
            detected_symptoms = [str(s).strip().lower() for s in symptoms]
    else:
        detected_symptoms = detect_symptoms(user_message)

    if detected_symptoms:
        remedies = generate_home_remedies(','.join(detected_symptoms))

    food_calories = get_food_calories()

    # Build an adaptive prompt that prioritizes symptom-aware healthcare responses.
    # Key changes: do NOT force BMI/calorie/water/sleep sections unless directly relevant to the user's question or profile.
    profile_lines = [
        f"Age: {age or 'Not provided'}",
        f"Gender: {gender or 'Not provided'}",
        f"Weight(kg): {weight or 'Not provided'}",
        f"Height(cm): {height or 'Not provided'}",
        f"BMI: {bmi or 'Not calculated'}",
        f"BMI Category: {bmi_info['category'] if bmi_info else 'Not calculated'}",
        f"Activity Level: {activity_level}",
    ]

    instructions = [
        'You are a helpful, clinically-minded healthcare assistant focused on practical, evidence-aligned advice.',
        'If the user reports symptoms, prioritize a concise "Health Analysis", "Home Remedies", "Foods to Eat", "Foods to Avoid", "Hydration Tips", "Sleep Advice", and "When to Seek Medical Care" sections in that order.',
        'Do NOT mention BMI, calorie counts, water schedules, or exercise plans unless they are directly relevant to the user\'s symptoms or explicitly requested.',
        'When asked for a monthly diet plan (1 month / monthly / 4-week), return a 4-week plan with Week 1..Week 4, each containing breakfast, lunch, dinner, snacks and a short weekly goal. Use common Indian foods and culturally realistic home remedies.',
        'Keep the final response between 200 and 400 words.',
        'Use clear headers and bullet lists as in the example provided by the user.',
        'End with the sentence: "This is AI-generated advice. Please consult a medical professional for personalized medical advice."'
    ]

    prompt = dedent(f"""
    System: {instructions[0]}

    USER PROFILE:\n{chr(10).join(profile_lines)}

    DETECTED_SYMPTOMS: {', '.join(detected_symptoms) if detected_symptoms else 'None'}

    USER QUESTION: {user_message}

    ADDITIONAL INSTRUCTIONS:\n{chr(10).join(instructions[1:])}
    """)

    # If this is a monthly plan request, generate a structured monthly plan locally and return.
    if is_monthly_plan_request(user_message):
        goal_key = 'weight_gain' if 'gain' in (fitness_goal or '').lower() or 'gain' in user_message.lower() else (fitness_goal or 'maintenance')
        monthly = generate_monthly_plan(goal_key)
        parts = ['# Monthly Diet Plan']
        for wk, content in monthly.items():
            parts.append(f"## {wk}")
            parts.append(f"- Goal: {content['goal']}")
            parts.append(f"- Breakfast: {content['breakfast']}")
            parts.append(f"- Lunch: {content['lunch']}")
            parts.append(f"- Dinner: {content['dinner']}")
            parts.append(f"- Snacks: {content['snacks']}")

        parts.append('\nThis is AI-generated advice. Please consult a medical professional for personalized medical advice.')
        return '\n\n'.join(parts)

    # Otherwise call GROQ with the adaptive prompt
    response = client.chat.completions.create(
        model=GROQ_MODEL_NAME,
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.6,
        max_tokens=1200
    )

    ai_response = response.choices[0].message.content

    # Ensure disclaimer and length constraints
    if "consult a medical professional" not in ai_response.lower():
        ai_response = ai_response.strip() + "\n\nThis is AI-generated advice. Please consult a medical professional for personalized medical advice."

    # If too short or too long, add a brief adjustment note (keep concise)
    # Note: we avoid heavy edits to content; prefer prompting the model correctly above.
    return ai_response