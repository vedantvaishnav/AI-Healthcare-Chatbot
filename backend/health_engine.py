"""
Health Recommendation Engine
Provides personalized health calculations and recommendations
"""

def calculate_bmi(weight_kg, height_cm):
    """Calculate BMI from weight and height"""
    if not weight_kg or not height_cm or height_cm <= 0:
        return None

    height_m = height_cm / 100
    bmi = weight_kg / (height_m ** 2)
    return round(bmi, 1)

def get_bmi_category(bmi):
    """Get BMI category and recommendations"""
    if bmi < 18.5:
        return {
            'category': 'Underweight',
            'goal': 'weight_gain',
            'calorie_adjustment': 1.2,  # 20% surplus
            'focus': 'high_protein',
            'exercise': 'strength_training'
        }
    elif 18.5 <= bmi < 25:
        return {
            'category': 'Normal',
            'goal': 'maintenance',
            'calorie_adjustment': 1.0,
            'focus': 'balanced',
            'exercise': 'mixed'
        }
    elif 25 <= bmi < 30:
        return {
            'category': 'Overweight',
            'goal': 'weight_loss',
            'calorie_adjustment': 0.8,  # 20% deficit
            'focus': 'calorie_control',
            'exercise': 'cardio'
        }
    else:
        return {
            'category': 'Obese',
            'goal': 'weight_loss',
            'calorie_adjustment': 0.7,  # 30% deficit
            'focus': 'low_calorie',
            'exercise': 'cardio_hiit'
        }

def calculate_calories(weight_kg, height_cm, age, gender, activity_level='moderate'):
    """Calculate daily calorie needs using Mifflin-St Jeor equation"""
    if not all([weight_kg, height_cm, age, gender]):
        return None

    # BMR calculation
    if gender.lower() == 'male':
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161

    # Activity multipliers
    activity_multipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very_active': 1.9
    }

    multiplier = activity_multipliers.get(activity_level.lower(), 1.55)
    tdee = bmr * multiplier

    return {
        'bmr': round(bmr),
        'tdee': round(tdee),
        'maintenance': round(tdee),
        'weight_loss': round(tdee * 0.8),  # 20% deficit
        'weight_gain': round(tdee * 1.2)   # 20% surplus
    }

def calculate_water_intake(weight_kg, bmi=None, activity_level='moderate', weather='normal'):
    """Calculate recommended daily water intake"""
    if not weight_kg:
        return None

    # Base calculation: 30ml per kg body weight
    base_water = weight_kg * 0.03  # liters

    # BMI adjustment
    bmi_multiplier = 1.0
    if bmi:
        if bmi < 18.5:
            bmi_multiplier = 1.1  # Slightly more for underweight
        elif bmi > 25:
            bmi_multiplier = 1.2  # More for overweight (sweating, metabolism)

    # Activity adjustment
    activity_multiplier = 1.0
    if activity_level.lower() in ['active', 'very_active']:
        activity_multiplier = 1.3
    elif activity_level.lower() == 'sedentary':
        activity_multiplier = 0.9

    # Weather adjustment
    weather_multiplier = 1.0
    if weather.lower() in ['hot', 'humid']:
        weather_multiplier = 1.2
    elif weather.lower() in ['cold', 'dry']:
        weather_multiplier = 1.1

    total_water = base_water * bmi_multiplier * activity_multiplier * weather_multiplier

    return {
        'daily_liters': round(total_water, 1),
        'schedule': generate_water_schedule(round(total_water, 1))
    }

def generate_water_schedule(daily_liters):
    """Generate hourly water intake schedule"""
    total_ml = daily_liters * 1000
    schedule = {
        '8:00 AM': '500ml (morning start)',
        '10:00 AM': '300ml (mid-morning)',
        '12:00 PM': '400ml (lunch time)',
        '2:00 PM': '300ml (afternoon)',
        '4:00 PM': '400ml (late afternoon)',
        '6:00 PM': '300ml (evening)',
        '8:00 PM': '200ml (after dinner)',
        '10:00 PM': '100ml (before bed)' if total_ml > 2400 else '0ml'
    }

    # Adjust based on total
    if total_ml < 2000:
        schedule = {k: v.replace('500', '400').replace('400', '300').replace('300', '250').replace('200', '150').replace('100', '50') for k, v in schedule.items()}
    elif total_ml > 3500:
        schedule = {k: v.replace('500', '600').replace('400', '500').replace('300', '400').replace('200', '300').replace('100', '150') for k, v in schedule.items()}

    return schedule

def generate_diet_plan(bmi_category, goal, daily_calories):
    """Generate 7-day diet plan based on BMI and goal"""
    if goal == 'weight_loss':
        return {
            'day1': {'breakfast': 'Oatmeal with berries (250 kcal)', 'lunch': 'Grilled chicken salad (350 kcal)', 'dinner': 'Fish with vegetables (400 kcal)', 'snacks': 'Apple + almonds (200 kcal)'},
            'day2': {'breakfast': 'Greek yogurt with nuts (280 kcal)', 'lunch': 'Turkey wrap (320 kcal)', 'dinner': 'Stir-fried tofu (380 kcal)', 'snacks': 'Carrot sticks + hummus (150 kcal)'},
            'day3': {'breakfast': 'Smoothie bowl (260 kcal)', 'lunch': 'Quinoa bowl (340 kcal)', 'dinner': 'Grilled salmon (420 kcal)', 'snacks': 'Banana + peanut butter (180 kcal)'},
            'day4': {'breakfast': 'Egg white omelette (220 kcal)', 'lunch': 'Lentil soup (300 kcal)', 'dinner': 'Chicken stir-fry (380 kcal)', 'snacks': 'Greek yogurt (100 kcal)'},
            'day5': {'breakfast': 'Chia pudding (240 kcal)', 'lunch': 'Tuna salad (320 kcal)', 'dinner': 'Vegetable curry (360 kcal)', 'snacks': 'Orange + walnuts (160 kcal)'},
            'day6': {'breakfast': 'Avocado toast (280 kcal)', 'lunch': 'Grilled fish (340 kcal)', 'dinner': 'Turkey meatballs (400 kcal)', 'snacks': 'Pear + cheese (170 kcal)'},
            'day7': {'breakfast': 'Berry parfait (250 kcal)', 'lunch': 'Chickpea salad (310 kcal)', 'dinner': 'Baked chicken (380 kcal)', 'snacks': 'Apple + almonds (200 kcal)'}
        }
    elif goal == 'weight_gain':
        return {
            'day1': {'breakfast': 'Oatmeal with milk and nuts (450 kcal)', 'lunch': 'Chicken rice bowl (550 kcal)', 'dinner': 'Salmon with potatoes (600 kcal)', 'snacks': 'Protein shake + banana (300 kcal)'},
            'day2': {'breakfast': 'Eggs with avocado toast (480 kcal)', 'lunch': 'Beef stir-fry (580 kcal)', 'dinner': 'Pasta with meat sauce (650 kcal)', 'snacks': 'Peanut butter sandwich (350 kcal)'},
            'day3': {'breakfast': 'Smoothie with protein (460 kcal)', 'lunch': 'Tuna melt sandwich (540 kcal)', 'dinner': 'Chicken curry with rice (620 kcal)', 'snacks': 'Trail mix + yogurt (320 kcal)'},
            'day4': {'breakfast': 'Pancakes with syrup (500 kcal)', 'lunch': 'Burger with fries (600 kcal)', 'dinner': 'Steak with vegetables (650 kcal)', 'snacks': 'Cheese + crackers (300 kcal)'},
            'day5': {'breakfast': 'Cereal with milk (450 kcal)', 'lunch': 'Pizza slice + salad (550 kcal)', 'dinner': 'Fish tacos (580 kcal)', 'snacks': 'Protein bar + fruit (280 kcal)'},
            'day6': {'breakfast': 'Bagel with cream cheese (480 kcal)', 'lunch': 'Chicken sandwich (540 kcal)', 'dinner': 'Pork chops with rice (620 kcal)', 'snacks': 'Nuts + dried fruit (350 kcal)'},
            'day7': {'breakfast': 'French toast (460 kcal)', 'lunch': 'Meatball sub (560 kcal)', 'dinner': 'Grilled chicken with pasta (600 kcal)', 'snacks': 'Milkshake (300 kcal)'}
        }
    else:  # maintenance
        return {
            'day1': {'breakfast': 'Oatmeal with fruit (350 kcal)', 'lunch': 'Chicken salad (450 kcal)', 'dinner': 'Fish with rice (500 kcal)', 'snacks': 'Apple + yogurt (200 kcal)'},
            'day2': {'breakfast': 'Eggs and toast (380 kcal)', 'lunch': 'Turkey sandwich (460 kcal)', 'dinner': 'Vegetable stir-fry (480 kcal)', 'snacks': 'Banana + nuts (220 kcal)'},
            'day3': {'breakfast': 'Smoothie (360 kcal)', 'lunch': 'Quinoa bowl (470 kcal)', 'dinner': 'Grilled chicken (520 kcal)', 'snacks': 'Orange + cheese (180 kcal)'},
            'day4': {'breakfast': 'Yogurt parfait (340 kcal)', 'lunch': 'Tuna salad (450 kcal)', 'dinner': 'Pasta primavera (490 kcal)', 'snacks': 'Pear + almonds (200 kcal)'},
            'day5': {'breakfast': 'Avocado toast (370 kcal)', 'lunch': 'Lentil soup (440 kcal)', 'dinner': 'Salmon salad (510 kcal)', 'snacks': 'Grapes + walnuts (190 kcal)'},
            'day6': {'breakfast': 'Cereal (350 kcal)', 'lunch': 'Chicken wrap (460 kcal)', 'dinner': 'Beef stir-fry (500 kcal)', 'snacks': 'Apple + peanut butter (230 kcal)'},
            'day7': {'breakfast': 'Pancakes (380 kcal)', 'lunch': 'Fish tacos (470 kcal)', 'dinner': 'Turkey stir-fry (490 kcal)', 'snacks': 'Banana + yogurt (210 kcal)'}
        }

def generate_exercise_recommendation(bmi_category, goal):
    """Generate exercise recommendations based on BMI and goal"""
    if goal == 'weight_loss':
        return {
            'primary': 'Cardio + HIIT',
            'duration': '45-60 minutes daily',
            'examples': [
                '30 min brisk walking + 15 min HIIT',
                '20 min jogging + 20 min cycling',
                'Swimming 45 minutes',
                'Dance workout 30 minutes'
            ],
            'weekly_goal': '5-6 days per week',
            'tips': 'Combine cardio with strength training 2x per week'
        }
    elif goal == 'weight_gain':
        return {
            'primary': 'Strength Training + Moderate Cardio',
            'duration': '45-60 minutes daily',
            'examples': [
                'Weight lifting 45 minutes',
                'Bodyweight exercises (push-ups, squats)',
                'Resistance band workouts',
                'Light cardio 20 minutes + strength 30 minutes'
            ],
            'weekly_goal': '4-5 days per week',
            'tips': 'Focus on compound movements, progressive overload'
        }
    else:  # maintenance
        return {
            'primary': 'Mixed Activities',
            'duration': '30-45 minutes daily',
            'examples': [
                'Walking or hiking',
                'Yoga or Pilates',
                'Light jogging',
                'Cycling or swimming'
            ],
            'weekly_goal': '4-5 days per week',
            'tips': 'Include variety and enjoy your workouts'
        }

def generate_home_remedies(symptoms):
    """Generate home remedies based on symptoms"""
    remedies = {
        'cough': [
            'Ginger tea with honey (soothes throat)',
            'Steam inhalation with eucalyptus oil',
            'Honey and lemon mixture',
            'Warm saltwater gargle'
        ],
        'fever': [
            'Stay hydrated with water and electrolyte drinks',
            'Rest in cool, comfortable environment',
            'Light clothing and cool compresses',
            'Herbal teas like peppermint or chamomile'
        ],
        'headache': [
            'Adequate sleep and rest',
            'Stay hydrated with water',
            'Apply cold or warm compress',
            'Practice relaxation techniques'
        ],
        'fatigue': [
            'Regular sleep schedule (7-9 hours)',
            'Balanced meals with protein and complex carbs',
            'Light exercise like walking',
            'Stay hydrated and manage stress'
        ],
        'nausea': [
            'Ginger tea or ginger ale',
            'Small, frequent meals',
            'Avoid strong odors',
            'Rest in comfortable position'
        ],
        'sore_throat': [
            'Warm saltwater gargle',
            'Honey and lemon tea',
            'Throat lozenges',
            'Humidifier for moist air'
        ],
        'indigestion': [
            'Ginger tea',
            'Avoid spicy/fatty foods temporarily',
            'Eat smaller meals',
            'Walk after eating'
        ]
    }

    if not symptoms:
        return {'general': [
            'Stay hydrated',
            'Eat balanced meals',
            'Get adequate sleep',
            'Practice stress management'
        ]}

    symptom_list = [s.strip().lower() for s in symptoms.split(',')]
    result = {}

    for symptom in symptom_list:
        if symptom in remedies:
            result[symptom] = remedies[symptom]

    if not result:
        result['general'] = [
            'Consult healthcare provider for specific symptoms',
            'Rest and stay hydrated',
            'Monitor symptoms and seek medical attention if they worsen'
        ]

    return result

def get_food_calories():
    """Return common foods with calorie information"""
    return {
        'fruits': {
            '1 apple': '95 kcal',
            '1 banana': '105 kcal',
            '1 orange': '62 kcal',
            '1 pear': '101 kcal',
            '100g grapes': '69 kcal'
        },
        'vegetables': {
            '100g broccoli': '34 kcal',
            '100g spinach': '23 kcal',
            '1 carrot': '25 kcal',
            '100g tomatoes': '18 kcal',
            '100g cucumber': '15 kcal'
        },
        'proteins': {
            '1 egg': '78 kcal',
            '100g chicken breast': '165 kcal',
            '100g salmon': '206 kcal',
            '100g tofu': '76 kcal',
            '100g lentils': '116 kcal'
        },
        'grains': {
            '100g rice (cooked)': '130 kcal',
            '100g quinoa (cooked)': '120 kcal',
            '1 slice whole wheat bread': '81 kcal',
            '100g oatmeal': '379 kcal',
            '100g pasta (cooked)': '157 kcal'
        },
        'dairy': {
            '1 cup milk': '146 kcal',
            '100g Greek yogurt': '59 kcal',
            '1 oz cheese': '110 kcal',
            '1 cup cottage cheese': '163 kcal'
        }
    }

def calculate_sleep_recommendation(age, activity_level='moderate', goal=None):
    """Calculate recommended sleep duration based on age, activity level, and fitness goal"""
    # Base sleep recommendations by age
    sleep_hours = 8
    
    if age and age < 18:
        sleep_hours = 9
    elif age and age > 65:
        sleep_hours = 7
    
    # Adjust based on activity level
    if activity_level and activity_level.lower() in ['active', 'very_active']:
        sleep_hours += 1  # More sleep for recovery from intense exercise
    elif activity_level and activity_level.lower() == 'sedentary':
        sleep_hours = max(7, sleep_hours - 1)  # Slightly less for sedentary
    
    # Adjust based on goal
    if goal and goal.lower() == 'weight_gain':
        sleep_hours += 0.5  # Extra sleep supports muscle recovery and growth
    
    sleep_hours = round(sleep_hours * 2) / 2  # Round to nearest 0.5
    
    return {
        'recommended_hours': sleep_hours,
        'bedtime_suggestions': generate_sleep_schedule(sleep_hours),
        'tips': [
            'Go to bed and wake up at the same time daily',
            'Avoid screens 1 hour before bed',
            'Keep bedroom cool, dark, and quiet',
            'Avoid caffeine 6 hours before sleep',
            'Exercise regularly, but not close to bedtime',
            'Limit naps to 20-30 minutes during day'
        ]
    }

def generate_sleep_schedule(hours):
    """Generate sleep schedule recommendations"""
    if hours <= 7:
        return {
            'early_bird': '10:00 PM - 5:30 AM',
            'standard': '11:00 PM - 6:30 AM',
            'late_sleeper': '12:00 AM - 7:00 AM'
        }
    elif hours <= 8:
        return {
            'early_bird': '9:30 PM - 5:30 AM',
            'standard': '10:30 PM - 6:30 AM',
            'late_sleeper': '11:30 PM - 7:30 AM'
        }
    else:
        return {
            'early_bird': '9:00 PM - 6:00 AM',
            'standard': '10:00 PM - 7:00 AM',
            'late_sleeper': '11:00 PM - 8:00 AM'
        }