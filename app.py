from flask import Flask, request, jsonify
from flask_cors import CORS
import config
from supabase import create_client, Client
import os

app = Flask(__name__)
CORS(app)  # Enable CORS if you're making requests from the frontend

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route('/generate', methods=['POST'])
def handle_generate():
    try:
        data = request.json
        user_id = data['user_id']

        # Get user interest data from Supabase
        user_data = config.get_user_data(user_id)
        current = user_data.get("current_interests", []) or []
        learned = user_data.get("learned_interests", []) or []

        # Step 1: Refresh recommendations
        recommended = config.refresh_recommendations(user_id, current, learned)

        # Step 2: Generate articles
        articles = config.generate_articles(user_id)

        return jsonify({
            "status": "success",
            "recommended": recommended,
            "articles": articles
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
    
@app.route('/read', methods=['POST'])
def handle_read():
    try:
        data = request.json
        user_id = data.get('user_id')
        read_interests = set(data.get('read_interests', []))

        if not user_id or not read_interests:
            return jsonify({"status": "error", "message": "Missing user_id or read_interests"}), 400

        user_data = config.get_user_data(user_id)
        if not user_data:
            return jsonify({"status": "error", "message": "User not found"}), 404

        current = set(user_data.get("current_interests", []) or [])
        learned = set(user_data.get("learned_interests", []) or [])

        combined = current.union(learned)
        matched = list(read_interests.intersection(combined))

        if not matched:
            return jsonify({"status": "noop", "message": "No overlapping interest found"})

        updated_learned = learned.union(matched)

        config.supabase.table("users").update({
            "learned_interests": list(updated_learned)
        }).eq("user_id", user_id).execute()

        return jsonify({
            "status": "success",
            "added": matched,
            "learned_interests": list(updated_learned)
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


if __name__ == '__main__':
    app.run(debug=True)

