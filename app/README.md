# OOSD Question Bank System

This is a **full-stack web application** built for the OOSD course project.  
It provides a platform where students can create, share, answer, and review questions.  
Tech stack: **React (Vite) + Django REST Framework + SQLite**.

---

## 📌 Prerequisites

Before starting, ensure your environment matches these versions:

- **Python 3.11**  
- **Node.js 20 LTS** (⚠️ Node 18 will NOT work with Vite)  
- **npm** (comes with Node)  
- **Virtual Environment (venv)** for Python

---

## 🛠 Backend Setup (Django + DRF + SQLite)

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   - **macOS/Linux**
     ```bash
     python3 -m venv env
     source env/bin/activate
     ```
   - **Windows**
     ```bash
     python -m venv env
     env\Scripts\activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

   (If `requirements.txt` doesn’t exist yet, run:)
   ```bash
   pip install django djangorestframework django-cors-headers
   pip freeze > requirements.txt
   ```

4. Run database migrations:
   ```bash
   python manage.py migrate
   ```

5. Start Django server:
   ```bash
   python manage.py runserver 8000
   ```

👉 Backend API now runs at:  
`http://127.0.0.1:8000/api/`

---

## 🎨 Frontend Setup (React + Vite)

1. Navigate to frontend:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   npm install axios
   ```

3. Create `.env` file inside `frontend/`:
   ```
   VITE_API_BASE_URL=http://127.0.0.1:8000/api
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

👉 Frontend runs at:  
`http://localhost:5173`

---

## ⚠️ Common Pitfalls

- **Node version error**  
  Vite requires Node.js `>=20.19`.  
  If you see errors like `crypto.hash is not a function`, upgrade Node:  
  ```bash
  nvm install 20
  nvm use 20
  nvm alias default 20
  ```

- **Forgot to activate venv**  
  Always run:
  ```bash
  source env/bin/activate   # macOS/Linux
  env\Scripts\activate      # Windows
  ```

- **.env file missing**  
  Make sure `frontend/.env` exists with the API base URL.

- **db.sqlite3 committed to Git**  
  Database file must be ignored (see `.gitignore`).

---

## 📂 Project Structure
```
repo-root/
├─ backend/
│  ├─ config/         # Django project (settings, urls, wsgi/asgi)
│  ├─ api/            # Django app with models & views
│  ├─ manage.py
│  ├─ requirements.txt
│  └─ db.sqlite3      # Local dev database (ignored in git)
├─ frontend/
│  ├─ src/            # React components
│  ├─ index.html
│  ├─ package.json
│  └─ .env            # API base URL (not committed)
├─ legacy/            # Old code archived
├─ README.md
└─ .gitignore
```

---

## 🔄 Development Workflow

- Always pull latest code:  
  ```bash
  git pull origin main
  ```

- Work on a feature branch:  
  ```bash
  git checkout -b feat/my-feature
  ```

- After changes:
  ```bash
  git add .
  git commit -m "feat: add new feature"
  git push origin feat/my-feature
  ```

- Open a Pull Request (PR) on GitHub.

---

## 📌 .gitignore

```gitignore
# Python
venv/
env/
__pycache__/
*.pyc
*.pyo
*.pyd
*.sqlite3
db.sqlite3

# Django
*.log
local_settings.py
media/

# Node
node_modules/
dist/

# Env
.env
frontend/.env
backend/.env
```
