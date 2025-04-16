from flask import Flask, request, jsonify
from flask_cors import CORS
import config
from supabase import create_client, Client

app = Flask(__name__)
CORS(app)  # Enable CORS if you're making requests from the frontend

SUPABASE_URL = "https://arnvjwxafssjqewtgoaf.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnZqd3hhZnNzanFld3Rnb2FmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDE5NDU1MywiZXhwIjoyMDU5NzcwNTUzfQ.5miLC8aFSxAp3qT7wm1mieWuDgTuocSalWC1AGX0hmQ"  # Replace with your actual key

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

if __name__ == '__main__':
    app.run(debug=True)
