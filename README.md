# Questify - OOSD Question Bank System

A full-stack web application built as part of the OOSD course project. It provides a collaborative platform for students to create, share, answer, and review questions while engaging in active learning.

**Tech Stack:**

- **Frontend:** React (Vite)
- **Backend:** Django REST Framework
- **Database:** SQLite

## Table of Contents

- [Project Overview](#project-overview)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
  - [Authentication](#authentication)
  - [Main Page](#main-page)
  - [Question Management](#question-management)
  - [Practice & Feedback](#practice--feedback)
  - [Leaderboard & Gamification](#leaderboard--gamification)
  - [Profile Page](#profile-page)
  - [Admin & Staff Features](#admin--staff-features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup-django--drf--sqlite)
- [Frontend Setup](#frontend-setup-react--vite)
- [Running the Project](#running-the-project)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Common Pitfalls](#common-pitfalls)
- [Project Guidelines](#project-guidelines)
- [Future Work](#future-work)
- [.gitignore](#gitignore)

## Project Overview

Questify is designed to transform the way OOSD students practice and learn. Instead of passively consuming practice questions, students actively create, evaluate, and discuss them.

This approach improves retention and understanding, aligns with research on active learning, and keeps students engaged.

## Project Structure

```
IT-PROJECT-TEAM56-OOSD-QUESTION-BANK/
├── .github/
│   └── workflows/
│       └── ci.yml                  # CI/CD pipeline for automated testing
│
├── backend/                        # Django REST API backend
│   ├── attempts/                   # Question attempt & progress tracking
│   ├── config/                     # Project settings & URLs
│   ├── leaderboard/                # Ranking and reward logic
│   ├── media/                      # Uploaded user images (avatars)
│   ├── questions/                  # Question creation, moderation, listing
│   ├── user/                       # Authentication & profile modules
│   ├── env/                        # Virtual environment (local only, ignored)
│   ├── requirements.txt            # Backend dependencies
│   ├── manage.py                   # Django entry point
│   ├── pytest.ini                  # Pytest config
│   ├── coverage_report.txt         # Latest test coverage summary
│   └── db.sqlite3                  # Local database (ignored in Git)
│
├── frontend/                       # React (Vite) frontend
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Main page views (Home, Profile, Admin)
│   │   ├── services/               # API & CSRF service layers
│   │   ├── context/                # Global state (AuthContext etc.)
│   │   └── App.jsx                 # App entry
│   ├── public/                     # Static assets
│   ├── package.json                # Frontend dependencies
│   ├── vite.config.js              # Vite configuration
│   ├── setupTests.js               # Frontend test setup
│   └── .env                        # Local API base URL config
│
├── render.yaml                     # Render deployment configuration
├── LICENSE                         # License information
├── API Documentation.md            # API reference for endpoints
├── README.md                       # Main project documentation
└── questify-start.bat / questify-stop.bat  # Local scripts for quick start/stop
```

## Key Features

### Authentication

- Account creation & login
- Forgot password/reset (via email)
- Two-factor authentication (Google Authenticator, etc.)
- UniMelb SSO integration (planned)

### Main Page

- Week-based content selection (12-week course)
- Quick leaderboard stats overview

### Question Management

- Students upload questions with answers & tags (week/topic based)
- Edit/update previously created questions
- Save favorite questions
- View both creator's answer + AI explanation
- Comment & rate questions for quality feedback

### Practice & Feedback

- AI provides rubric & explanations for verified questions
- Peer feedback via ratings and comments
- Short-answer and MCQ supported (no coding questions)

### Leaderboard & Gamification

- Multi-dimensional rankings (weekly & overall)
- Scoring breakdown:
  - Question quality (40%)
  - Daily consistency (30%)
  - Community contributions (20%)
  - Practice performance (10%)
- Recognition for top 3 students each week
- Reward system to encourage engagement

### Profile Page

- Saved questions library with retry function
- User's created questions archive
- Visual progress tracking across 12 weeks

### Admin & Staff Features

- Access and verify all student-created questions
- Staff-verified mark on approved questions
- Activity dashboards (charts/diagrams showing student engagement)
- Minimal staff workload — designed for student-driven participation

## Tech Stack

- **Frontend:** React (Vite), Axios
- **Backend:** Django + Django REST Framework
- **Database:** SQLite
- **Auth:** Django sessions + optional 2FA
- **AI Integration:** Explanations & rubric (OpenAI API, requires funding approval)

## Prerequisites

Make sure your environment matches these versions:

- Python 3.11
- Node.js 20 LTS (Node 18 will NOT work with Vite)
- npm (comes with Node)
- Python virtual environment (venv)

## Backend Setup (Django + DRF + SQLite)

```bash
cd backend

# 1. Create venv
# macOS/Linux
python3 -m venv env
source env/bin/activate

# Windows
python -m venv env
env\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run migrations
python manage.py migrate

# 4. Start server
python manage.py runserver 8000
```

**API runs at:** <http://localhost:8000/api>

## Frontend Setup (React + Vite)

```bash
cd frontend

# 1. Install deps
npm install

# 2. Create .env
echo "VITE_API_BASE_URL=http://localhost:8000/api" > .env

# 3. Start dev server
npm run dev
```

**Frontend runs at:** <http://localhost:5173>

## Running the Project

### Backend

```bash
cd backend
source env/bin/activate   # macOS/Linux
env\Scripts\activate      # Windows
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm run dev
```

## Security (Sessions & CSRF)

- The backend issues Django session and CSRF cookies; production deployments must run behind HTTPS and a distinct frontend origin.
- `/api/csrf/` returns JSON `{"csrfToken": "<value>"}` and refreshes the cookie so clients can safely bootstrap.
- The React client ships with a `CsrfService` that pre-fetches the token on boot and injects it into all unsafe requests, so no manual cookie handling is required.
- Key environment variables (see `render.yaml` for production-ready values):
  - `FRONTEND_ORIGIN`
  - `DJANGO_CORS_ALLOWED_ORIGINS`
  - `DJANGO_CSRF_TRUSTED_ORIGINS`
  - `SESSION_COOKIE_SECURE`
  - `SESSION_COOKIE_SAMESITE`
  - `CSRF_COOKIE_SECURE`
  - `CSRF_COOKIE_SAMESITE`
- Local development defaults remain `Secure=False` and `SameSite=Lax`; override them only when testing full cross-site flows.

## Common Pitfalls

- **Wrong Node version** → use Node 20.19+
- **Forgot to activate venv** → always activate before running backend
- **Missing .env file** → ensure `frontend/.env` exists with `VITE_API_BASE_URL`
- **Cross-domain cookies blocked** — for split frontend/backends ensure `SameSite=None` and the `Secure` flags are enabled (covered in `render.yaml`)
- **db.sqlite3 committed** → must be ignored in Git

## Project Guidelines

- Questions are week-based only (for now)
- Supported types: Multiple choice & short answer (no coding questions)
- AI use: For rubric + explanations, alongside creator answers
- Admin page includes:
  - Question verification
  - Engagement statistics
  - Activity dashboards
- User profile includes attempt history

## Future Work

- **OAuth 2.0 / SSO Integration**
  - Integrate University of Melbourne SSO via Azure AD to replace manual registration.
  - Improve user security and simplify onboarding.

- **Reward for Students**
  - Facilitate rewards for top students on the leaderboard during the coarse.

- **Database Migration**
  - Replace SQLite with PostgreSQL or MySQL for production scalability.
  - Add backup and restore scripts for admin use.

- **Enhanced AI Assistance**
  - Expand AI-generated feedback to include hints and difficulty analysis.
  - Provide automatic question tagging and topic recommendation.

- **Gamification Expansion**
  - Introduce achievement badges and streak tracking to motivate consistent participation.
  - Add a seasonal leaderboard with reset cycles.

- **Question Recommendation System**
  - Implement personalized question suggestions based on user history and performance.

- **Mobile Responsiveness**
  - Optimize React frontend for mobile and tablet users.

- **Cloud Deployment**
  - Migrate from Render to AWS (Elastic Beanstalk + RDS) for better performance and cost management.

## .gitignore

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
