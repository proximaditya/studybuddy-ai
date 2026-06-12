# studybuddy-ai
# 🧠 StudyBuddy AI
### A Gemini-powered study assistant — built at GDG

Upload any PDF, image, or notes. Get summaries, quizzes, flashcards, and a personal AI tutor.
Built with the Gemini 2.0 Flash API and Streamlit.

---

## ✨ Features

| Feature | What it does |
|---|---|
| 💬 **Chat** | Ask anything about your uploaded material. Gemini reads and reasons across all files. |
| 📋 **Summary** | Instant structured summary with key topics, takeaways, and study tips. |
| 🎯 **Quiz** | Auto-generated MCQs with difficulty control and downloadable JSON. |
| 🃏 **Flashcards** | Smart front/back flashcards for spaced repetition practice. |
| 🎭 **5 Personas** | Switch between Study Buddy, Socratic Tutor, Exam Coach, Debate Partner, Simple Explainer. |

**Supported file types:** PDF, PNG, JPG, WEBP, TXT, MD, CSV

---

## 🚀 Run Locally

### Prerequisites
- Python 3.9+
- A free Gemini API key from [aistudio.google.com](https://aistudio.google.com)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/studybuddy-ai.git
cd studybuddy-ai

# 2. Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the app
streamlit run app.py
```

The app opens at `http://localhost:8501`. Enter your Gemini API key in the sidebar and start uploading!

---

## ☁️ Deploy to Streamlit Cloud (Free)

1. **Push this repo to GitHub** (see section below)

2. Go to [share.streamlit.io](https://share.streamlit.io) and sign in with GitHub

3. Click **"New app"** → select your repo → set main file to `app.py`

4. Under **"Advanced settings"** → **Secrets**, paste:
   ```toml
   GEMINI_API_KEY = "your_api_key_here"
   ```

5. Click **Deploy** — your app gets a public URL in ~60 seconds

> 💡 With a secret set, you can optionally auto-fill the key. The app works either way — users can always enter their own key in the sidebar.

---

## 📁 File Structure

```
studybuddy-ai/
├── app.py                          # Main Streamlit application
├── requirements.txt                # Python dependencies
├── .gitignore                      # Ignores .env, secrets, cache
├── .streamlit/
│   └── secrets.toml.example        # Template for Streamlit Cloud secrets
└── README.md                       # This file
```

---

## 🔧 Push to GitHub (step by step)

```bash
# In your project folder:
git init
git add .
git commit -m "feat: initial StudyBuddy AI — Gemini + Streamlit"

# Create a new repo on github.com (no README, no .gitignore — you already have them)
# Then:
git remote add origin https://github.com/YOUR_USERNAME/studybuddy-ai.git
git branch -M main
git push -u origin main
```

> ⚠️ Before every commit, run `git status` and confirm `.env` and `secrets.toml` are NOT listed.

---

## 🧑‍💻 Run in Google Colab

```python
# Cell 1 — Install
!pip install -q streamlit google-generativeai pyngrok

# Cell 2 — Write app to disk (paste app.py content here or clone from GitHub)
!git clone https://github.com/YOUR_USERNAME/studybuddy-ai.git
%cd studybuddy-ai

# Cell 3 — Expose via ngrok (free tunnel)
from pyngrok import ngrok
import subprocess, time

proc = subprocess.Popen(["streamlit", "run", "app.py", "--server.port=8501"])
time.sleep(3)
tunnel = ngrok.connect(8501)
print("🚀 App live at:", tunnel.public_url)
```

---

## 📚 Resources

- [Gemini API docs](https://ai.google.dev/gemini-api/docs)
- [Google AI Studio](https://aistudio.google.com)
- [Streamlit docs](https://docs.streamlit.io)
- [Streamlit Cloud](https://share.streamlit.io)
- [Gemini cookbook](https://github.com/google-gemini/cookbook)

---

*Built at a GDG hands-on session · Gemini 2.0 Flash · Streamlit*
