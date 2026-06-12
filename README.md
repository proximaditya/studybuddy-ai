# 🎀 StudyBuddy AI ✨

A gorgeous, Gemini-powered study assistant — built at GDG, upgraded with an ultra-aesthetic Next.js UI! 🧸

Upload any PDF, image, or notes. Get summaries, quizzes, flashcards, and a personal AI tutor. Built with the **Gemini 2.0 Flash API**, featuring a buttery-smooth **Next.js & Framer Motion** frontend and the original **Streamlit** backend!

## ✨ Features
| Feature | What it does |
|---|---|
| 💬 **Chat** | Ask anything about your uploaded material. Gemini reads and reasons across all files. |
| 📋 **Summary** | Instant structured summary with key topics, takeaways, and study tips. |
| 🎯 **Quiz** | Auto-generated MCQs with downloadable JSON. |
| 🃏 **Flashcards** | Smart flippable front/back flashcards for spaced repetition practice. |
| 🎭 **5 Personas** | Switch between Study Buddy, Socratic Tutor, Exam Coach, Debate Partner, Simple Explainer. |

*Supported file types: PDF, PNG, JPG, WEBP, TXT, MD, CSV*

---

## 🚀 Run the New Next.js UI (Recommended 🎀)
We upgraded the UI to a smooth, beautiful React application!

**Prerequisites:**
* Node.js installed
* A free Gemini API key from [aistudio.google.com](https://aistudio.google.com/)

### Step 1. Clone the repo
`git clone https://github.com/YOUR_USERNAME/studybuddy-ai.git`
`cd studybuddy-ai/frontend`

### Step 2. Install dependencies
`npm install`

### Step 3. Run the beautifully animated app!
`npm run dev`

The app will open at http://localhost:3000. Enter your Gemini API key on the gorgeous login screen and start uploading!

---

## 🐍 Run the Original Streamlit UI (Classic Mode)

Want to run the classic Python-only version? You still can!

**Prerequisites:**
* Python 3.9+

### Step 1. Go to the root folder
`cd studybuddy-ai`

### Step 2. Create a virtual environment (recommended)
`python -m venv venv`
`source venv/bin/activate` *(Mac/Linux)*
`venv\Scripts\activate` *(Windows)*

### Step 3. Install dependencies
`pip install -r requirements.txt`

### Step 4. Run the app
`streamlit run app.py`

---

## 📁 File Structure

* `frontend/` - ✨ NEW: The gorgeous Next.js / Tailwind application
  * `src/app/` - Next.js App Router (page.tsx, layout.tsx)
  * `package.json` - Node dependencies
  * `postcss.config.mjs` - Tailwind V4 config
* `app.py` - Classic Streamlit application
* `requirements.txt` - Python dependencies
* `.gitignore` - Ignores .env, secrets, cache
* `README.md` - This file
* 

---

## 📚 Resources

* [Gemini API docs](https://ai.google.dev/docs)
* [Google AI Studio](https://aistudio.google.com/)
* [Next.js Docs](https://nextjs.org/docs)

*Built at a GDG hands-on session · Gemini 2.0 Flash · Next.js · Streamlit*
