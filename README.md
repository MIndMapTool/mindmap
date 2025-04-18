

# 🧠 MindMap – AI-Powered Knowledge Tool

**MindMap** is an AI-driven educational platform!![MindMap_LOGO_WORD](https://github.com/user-attachments/assets/142e6252-5087-40a5-bb72-6a2bbd7a9fa5)

 that generates personalized learning paths using your interests. It leverages Google Gemini for content generation and Supabase for user data storage, helping users explore new academic subjects via referential learning.

---

## 🚀 Features

- ✨ Personalized subject recommendations using generative AI
- 📚 AI-generated in-depth educational articles
- 🔁 Dynamic learning loop powered by current + learned interests
- 📦 Supabase backend to track evolving interests
- 🧠 Referential learning system that links new topics to known ones

---

## 🧱 Tech Stack

| Layer       | Tech                      |
|-------------|---------------------------|
| Backend     | Python, Flask             |
| Frontend    | HTML, CSS, JavaScript     |
| Database    | Supabase (PostgreSQL)     |
| AI Engine   | Google Gemini 1.5 Flash   |

---

## 🧩 System Flow

1. User selects initial interests → stored in Supabase
2. Gemini recommends new topics → stored as `recommended_interests`
3. Articles are generated using combinations of:
   - `current_interests`
   - `learned_interests`
   - `recommended_interests`
4. On article click:
   - If topic is from recommended, it’s added to `learned_interests` (work in progress)
5. Cycle repeats, adapting based on user interaction

---

## ⚙️ Installation & Setup

```bash
git clone https://github.com/smupamanyu/MindMap.git
cd MindMap
pip install -r requirements.txt

Create a .env and a config.js file and add:
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_api_key
GEMINI_API_KEY=your_gemini_api_key

python app.py

Do not forget to add .env and config.js to .gitignore!
```
👥 Contributors
🤖 Built by @smupamanyu and @anikasingh31

🎓 SRM University, CINTEL Department

⚠️ License
This project is currently under academic patent review. Do not reproduce, distribute, or fork without prior permission.



  
