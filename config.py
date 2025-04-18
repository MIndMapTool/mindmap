import google.generativeai as genai
import supabase
from supabase import create_client, Client
import ast
import random
import json
import re
from dotenv import load_dotenv
import os

load_dotenv()
# --- Your API Keys ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# --- Supabase Client ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Gemini Configuration ---
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=genai.types.GenerationConfig(
        temperature=1.2,
        top_p=0.95,
        top_k=40,
    )
)

import re

def get_user_data(user_id):
    response = supabase.table("users").select("*").eq("user_id", user_id).single().execute()
    data = response.data
    return data


def get_gemini_recommendations(current_interests, learned_interests):
    current_interests = current_interests or []
    learned_interests = learned_interests or []

    prompt = f"""
    Based on the following interests: {current_interests + learned_interests}, suggest 4 related subjects and 1 unrelated subject.
    Return only a Python list of 5 strings like this:
    ["Subject 1", "Subject 2", "Subject 3", "Subject 4", "Random Subject"]
    No extra explanation, no code blocks.
    """

    try:
        response = model.generate_content(prompt)
        output = response.text.strip()

        # Clean code blocks and whitespace
        output = output.replace("```python", "").replace("```", "").strip()

        # Extract the list using regex
        match = re.search(r"\[(.*?)\]", output, re.DOTALL)
        if match:
            cleaned = "[" + match.group(1) + "]"
            subject_list = ast.literal_eval(cleaned)
            if isinstance(subject_list, list) and len(subject_list) == 5:
                return subject_list

        print("Gemini returned an invalid format:", output)
        return []
    except Exception as e:
        print("Gemini parsing error:", e)
        return []

import json

def refresh_recommendations(user_id, current, learned):
    recommended = get_gemini_recommendations(current, learned)
    recommended = [str(r) for r in recommended]  # Ensure they are strings

    print("🧠 Final recommendations:", recommended)

    # Check if the user exists
    user_check = supabase.table("users").select("*").eq("user_id", user_id).execute()
    if not user_check.data:
        print("⚠️ User not found, inserting a new record.")
        supabase.table("users").upsert([{"user_id": user_id, "recommended_interests": json.dumps(recommended)}]).execute()
    else:
        print("🔍 User exists, updating recommendations.")
        supabase.table("users").update({"recommended_interests": recommended}).match({"user_id": user_id}).execute()

    print("📦 Update result:", recommended)
    return recommended


def generate_article_prompt(interests):
    main_focus = interests[0]
    additional = interests[1:]

    if not additional:
        return f"""Write a detailed article titled about "{main_focus}".
        Make sure it is in-depth, educational, and explores key ideas, subfields, applications, and recent developments."""
    
    return f"""
    Write a detailed article that focuses on "{main_focus}" and explores how it connects with the topics: {additional}.
    Explain the relationships, overlapping ideas, and interdisciplinary implications.
    Make it insightful, and ensure that all topics are cohesively interlinked and clearly explained.
    Include a distinct, relevant title and rich educational content.
    """

def generate_articles(user_id):
    user_data = get_user_data(user_id)
    current = user_data.get("current_interests") or []
    learned = user_data.get("learned_interests") or []
    recommended = user_data.get("recommended_interests") or []

    articles = {}

    # 2 articles with only current
    for i in range(1, 3):
        selected = [random.choice(current)] if current else ["Education"]
        prompt = generate_article_prompt(selected)
        articles[f"article_current_{i}"] = model.generate_content(prompt).text.strip()

    # 2 articles with current + learned (fallback to current)
    for i in range(1, 3):
        if learned:
            selected = [random.choice(current), random.choice(learned)]
        else:
            selected = [random.choice(current)]
        prompt = generate_article_prompt(selected)
        articles[f"article_current_learned_{i}"] = model.generate_content(prompt).text.strip()

    # 2 articles with current + learned + recommended (fallback accordingly)
    for i in range(1, 3):
        selected = [random.choice(current)]
        if learned:
            selected.append(random.choice(learned))
        if recommended:
            selected.append(random.choice(recommended))
        prompt = generate_article_prompt(selected)
        articles[f"article_all_{i}"] = model.generate_content(prompt).text.strip()

    return articles