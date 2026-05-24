from groq import Groq
from config import GROQ_API_KEY, GROQ_MODEL_NAME
from health_engine import (
    calculate_bmi, get_bmi_category, calculate_calories, calculate_water_intake,
    generate_diet_plan, generate_exercise_recommendation, generate_home_remedies,
    calculate_sleep_recommendation, get_food_calories
)
import json
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


def _extract_json_response(raw_text):
    if not raw_text:
        return None
    raw_text = raw_text.strip()
    json_match = re.search(r'\{.*\}$', raw_text, re.DOTALL)
    if json_match:
        raw_text = json_match.group(0)
    try:
        return json.loads(raw_text)
    except Exception:
        try:
            start = raw_text.index('{')
            end = raw_text.rindex('}') + 1
            return json.loads(raw_text[start:end])
        except Exception:
            return None


def _extract_number(value, default=0.0):
    if value is None:
        return default
    if isinstance(value, (int, float)):
        return float(value)
    try:
        text = str(value).strip().replace(',', '')
        match = re.search(r'-?\d+(?:\.\d+)?', text)
        if match:
            return float(match.group(0))
    except Exception:
        pass
    return default


def _extract_volume_ml(text):
    if not text:
        return None
    text_l = text.lower()
    match = re.search(r'(\d+(?:\.\d+)?)\s*(ml|milliliter|millilitre|l|liter|litre|glass|cup|bottle|bottles|cups|glasses)\b', text_l)
    if match:
        amount = float(match.group(1))
        unit = match.group(2)
        if unit in ('l', 'liter', 'litre', 'liters', 'litres'):
            return int(amount * 1000)
        if unit in ('glass', 'cup', 'cups', 'glasses'):
            return int(amount * 250)
        if unit in ('bottle', 'bottles'):
            return int(amount * 500)
        return int(amount)
    return None


def _detect_item_type(label):
    if not label:
        return 'food'
    text = str(label).lower()
    if 'water' in text and not any(word in text for word in ['juice', 'coffee', 'tea', 'smoothie', 'milkshake', 'cola', 'soda', 'beer', 'wine']):
        return 'water'
    if any(word in text for word in ['juice', 'coffee', 'tea', 'smoothie', 'latte', 'milkshake', 'cola', 'soda', 'beer', 'wine']):
        return 'drink'
    return 'food'


def _normalize_food_item(item, original_line=None):
    if not item or not isinstance(item, dict):
        return {}
    normalized = {}
    for key in ['food', 'description', 'quantity', 'note', 'item_type', 'volume_ml']:
        value = item.get(key)
        if isinstance(value, dict):
            if value.get('food') or value.get('description'):
                normalized[key] = str(value.get('food') or value.get('description'))
            elif value.get('value') is not None:
                normalized[key] = str(value.get('value'))
            else:
                normalized[key] = json.dumps(value)
        elif value is not None:
            normalized[key] = str(value)

    normalized['food'] = normalized.get('food') or normalized.get('description') or (str(item.get('item')) if item.get('item') else None) or original_line
    normalized['item_type'] = normalized.get('item_type') or _detect_item_type(normalized['food'])
    normalized['volume_ml'] = normalized.get('volume_ml') or _extract_volume_ml(normalized.get('quantity') or normalized.get('food') or original_line)

    normalized['calories'] = _extract_number(item.get('calories'), 0)
    normalized['protein'] = _extract_number(item.get('protein'), None)
    normalized['carbs'] = _extract_number(item.get('carbs'), None)
    normalized['fats'] = _extract_number(item.get('fats'), None)

    if normalized['item_type'] == 'water':
        normalized['calories'] = 0
        normalized['volume_ml'] = normalized['volume_ml'] or 250
        normalized['quantity'] = normalized['quantity'] or f"{int(normalized['volume_ml'])} ml"

    if normalized['volume_ml']:
        normalized['volume_ml'] = int(normalized['volume_ml'])

    return normalized


def generate_food_analysis(items, goal='maintenance', maintenance_calories=None):
    if not items:
        return {'items': [], 'total_calories': 0, 'goal_target': 0, 'remaining_calories': 0, 'suggestions': []}

    if isinstance(items, str):
        items_list = [line.strip() for line in items.split('\n') if line.strip()]
    elif isinstance(items, (list, tuple)):
        items_list = [str(item).strip() for item in items if str(item).strip()]
    else:
        items_list = [str(items).strip()]

    try:
        maintenance_value = float(maintenance_calories) if maintenance_calories else 2200.0
    except (TypeError, ValueError):
        maintenance_value = 2200.0

    goal_key = str(goal or 'maintenance').strip().lower()
    if goal_key == 'weight_gain':
        goal_target = round(maintenance_value * 1.2)
    elif goal_key == 'weight_loss':
        goal_target = round(maintenance_value * 0.8)
    else:
        goal_target = round(maintenance_value)

    prompt = dedent(f"""
    You are a nutrition analysis assistant. The user consumed the following foods and drinks today:
    {json.dumps(items_list, indent=2)}

    Output a valid JSON object only, with these keys:
    - items: array of objects with keys food, quantity, calories, protein, carbs, fats, note, item_type, volume_ml
    - total_calories: sum of calories
    - goal_target: daily calorie target for the user's goal
    - remaining_calories: calories still needed to reach the goal (goal_target - total_calories, minimum 0)
    - suggestions: array of 4 healthy food suggestions to complete the remaining calories.

    For drink items, set item_type to "drink".
    For water entries, set item_type to "water", calories to 0, and volume_ml to the estimated amount in milliliters.
    If quantity is available, include it. Use Indian food examples where possible.
    For 'weight_gain', suggest calorie-dense healthy foods.
    For 'weight_loss', suggest low-calorie high-protein foods.
    For 'maintenance', suggest balanced meals.
    Include kcal estimates, and keep all values realistic.
    Do not include any explanation outside the JSON.
    """)

    prompt = prompt + f"\nUser goal: {goal_key}\nDaily maintenance estimate: {int(maintenance_value)} kcal\n"

    response = client.chat.completions.create(
        model=GROQ_MODEL_NAME,
        messages=[{'role': 'user', 'content': prompt}],
        temperature=0.25,
        max_tokens=800
    )

    raw_output = response.choices[0].message.content
    parsed = _extract_json_response(raw_output)
    if not isinstance(parsed, dict):
        parsed = {
            'items': [],
            'total_calories': 0,
            'goal_target': goal_target,
            'remaining_calories': goal_target,
            'suggestions': []
        }

    parsed.setdefault('items', [])
    parsed.setdefault('total_calories', 0)
    parsed.setdefault('goal_target', goal_target)
    parsed.setdefault('remaining_calories', max(goal_target - parsed.get('total_calories', 0), 0))
    parsed.setdefault('suggestions', [])

    normalized_items = []
    for idx, raw_item in enumerate(parsed['items']):
        original_line = items_list[idx] if idx < len(items_list) else None
        normalized_items.append(_normalize_food_item(raw_item, original_line))

    water_lines = [line for line in items_list if 'water' in line.lower() and not any(keyword in line.lower() for keyword in ['juice', 'coffee', 'tea', 'smoothie', 'milkshake', 'cola', 'soda', 'beer', 'wine'])]
    if water_lines and not any(item.get('item_type') == 'water' for item in normalized_items):
        for line in water_lines:
            normalized_items.append(_normalize_food_item({
                'food': 'Water',
                'quantity': f"{_extract_volume_ml(line) or 250} ml",
                'calories': 0,
                'item_type': 'water',
                'volume_ml': _extract_volume_ml(line) or 250,
            }, line))

    parsed['items'] = normalized_items
    parsed['total_calories'] = sum(item.get('calories', 0) for item in normalized_items)
    parsed['remaining_calories'] = max(goal_target - parsed['total_calories'], 0)

    return parsed