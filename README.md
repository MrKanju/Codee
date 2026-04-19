# 🚀 AI-Powered LeetCode Assistant

An intelligent Chrome Extension + FastAPI backend that provides **context-aware coding hints** for LeetCode problems using Google Gemini.

---

## 🧠 Overview

This project helps users solve coding problems by generating **progressive hints** based on their current code and problem context — simulating an **interview-style guidance system** instead of directly giving solutions.

---

## ✨ Features

### 🔹 AI-Powered Hint Generation
- Uses Google Gemini API
- Takes problem + user code as input
- Returns contextual hints (not solutions)

---

### 🔹 Multi-Level Hint System
- Level 1 → Subtle hint  
- Level 2 → Clear direction  
- Level 3 → Almost full logic  

---

### 🔹 Chrome Extension Integration
- Works directly on LeetCode pages
- Extracts problem + code automatically
- Adds “Get Hint” button in UI

---

### 🔹 FastAPI Backend
- REST API (`POST /hint`)
- Handles AI requests cleanly

---

### 🔹 Caching (Performance Boost)
- In-memory cache
- TTL: 5 minutes
- Reduces API calls + faster responses

---

### 🔹 Rate Limiting (Security)
- 5 requests per minute per user
- Prevents abuse and overuse

---

### 🔹 Secure API Key Handling
- Uses environment variables (`GEMINI_API_KEY`)
- No secrets stored in code

---

## 🏗️ Architecture
Chrome Extension → FastAPI Backend → Gemini API → Response (Hint)
With:
- ⚡ Cache Layer  
- 🔒 Rate Limiter  

---

## 🛠️ Tech Stack

**Backend**
- Python
- FastAPI
- Google Gemini API
- Uvicorn

**Frontend**
- JavaScript (Chrome Extension)
- Manifest V3

---
## 📁 Project Structure
```
leetcode-ai-helper/
│
├── backend/
│   ├── main.py
│   └── requirements.txt
│
├── extension/
│   ├── manifest.json
│   ├── content.js
│
├── .gitignore
└── README.md
```
---
## ⚙️ Setup

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
Set API Key
export GEMINI_API_KEY="your_api_key"
Run Server
uvicorn main:app --reload
```
---
🌐 Chrome Extension Setup

1. Open Chrome → Extensions
2. Enable Developer Mode
3. Click “Load Unpacked”
4. Select extension/ folder
⸻

## 📡 API

POST /hint
```
Request
{
  "title": "Problem name",
  "description": "...",
  "code": "...",
  "hint_level": 1
}
Response
{
  "hint": "Use sliding window approach..."
}
```
⸻

⚡ Optimizations

* Caching → faster responses
* Rate limiting → safe usage
* Clean API design
