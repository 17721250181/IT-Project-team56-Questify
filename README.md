# Questify – OOSD Question Bank System

A full-stack web application built as part of the OOSD course project.
It provides a collaborative platform for students to create, share, answer, and review questions while engaging in active learning.

> For a live demo, deployment link, and user guide, please refer to the [Handover Package](./Handover/Table_of_Contents.md).

---

## Table of Contents

- [Project Overview](#project-overview)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
  - [Authentication & Profile](#authentication--profile)
  - [Create Questions](#create-questions)
  - [Question Solving](#question-solving)
  - [Question List & Discovery](#question-list--discovery)
  - [Comments & Discussion](#comments--discussion)
  - [Leaderboard & Gamification](#leaderboard--gamification)
  - [Admin & Staff Features](#admin--staff-features)
  - [System & Deployment](#system--deployment)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Backend Setup (Django + DRF + SQLite)](#backend-setup-django--drf--sqlite)
  - [Frontend Setup (React + Vite)](#frontend-setup-react--vite)
  - [Common Pitfalls](#common-pitfalls)
- [Running the Project](#running-the-project)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Testing](#testing)
- [Deployment](#deployment)
  - [Backend on Render](#backend-on-render)
- [Environment Variables](#environment-variables)
- [Security (Sessions & CSRF)](#security-sessions--csrf)
- [Project Guidelines](#project-guidelines)
- [Future Work](#future-work)
- [.gitignore](#gitignore)
- [Team](#team)

---

## Project Overview

Questify is an AI-assisted, student-driven question bank system developed for the **Object-Oriented Software Development (OOSD)** subject at the University of Melbourne.
The system aims to make students more engaged with the subject throughout the semester, addressing long-standing issues of passive learning and last-minute exam cramming.

### Background
In previous deliveries of OOSD, the teaching team observed that:
- Students tended to **only study intensively near exams**, rather than engaging consistently throughout the semester.
- Most students **focused on memorising past-paper questions** instead of developing a genuine understanding of the content.
- The subject was **still taught in a relatively traditional way**, with limited interactive tools to motivate ongoing participation.

Meanwhile, a student survey indicated strong interest in having a **question bank** to practise more questions.
However, from the client’s (the subject coordinator’s) perspective, a traditional question bank might **reinforce cramming and surface-level learning** rather than promote engagement.

To address this contradiction, the project team made a key design decision:
instead of simply building a static question bank, we **redesigned the system into a student-driven question creation platform** that encourages critical thinking, collaboration, and continuous learning.

### Our product - Questify
In Questify, students take an active role as both **learners and content creators**:
- Students design their own questions based on weekly topics, provide answers, and write explanations.
- Their peers can attempt these questions, **rate their quality**, and **leave comments for discussion**.
- The system thus transforms question practice into an **interactive and reflective learning process**: students not only solve problems but also evaluate and improve each other’s work.
- A **leaderboard and reward system** further motivates ongoing engagement by recognising students for the **quality and creativity** of their contributions.
- The teaching team moderates submitted questions, ensuring academic accuracy and maintaining content quality.

This approach aligns with the client’s goal of **“making students more engaging to the subject”** and introduces a sustainable, student-led enhancement to the OOSD learning experience.

### Objectives
- **O1 – Active learning:** transform students from passive consumers of questions into active creators and reviewers.
- **O2 – Continuous engagement:** encourage week-by-week participation rather than exam-period cramming.
- **O3 – Peer learning:** enable students to give and receive feedback through ratings and comments.
- **O4 – Motivation through gamification:** use leaderboards and small rewards to recognise consistent effort.
- **O5 – Teaching support:** reduce instructor workload by crowdsourcing question creation while retaining moderation control.

### Client / Stakeholders
- **Client:** Shanika Karunasekera, Subject Coordinator of *COMP30022 Object-Oriented Software Development*, University of Melbourne
- **Admin role:** OOSD teaching team (tutors, demonstrators, and coordinators)
- **End users:** all future OOSD students (as question authors and solvers)
- **Goal:** make students more engaged in the subject using an interactive, AI-assisted tool that complements traditional teaching.

> For a live demo, deployment link, and user guide, please refer to the [Handover Package](./Handover/Table_of_Contents.md).

---

## Project Structure

```
IT-PROJECT-TEAM56-OOSD-QUESTION-BANK/
├── .github/
│   └── workflows/
│       └── ci.yml                  # CI/CD pipeline for automated testing
│
├── Handover/                       # Handover documents (client deliverables)
│
├── backend/                        # Django REST API backend
│   ├── adminpanel/                 # Admin verification & moderation logic
│   ├── attempts/                   # Question attempts & progress tracking
│   ├── config/                     # Project settings, URLs, and environment loading
│   ├── leaderboard/                # Ranking and reward calculation
│   ├── questions/                  # Question creation, editing, and rating
│   ├── user/                       # Authentication, profile, and student data
│   ├── requirements.txt            # Backend dependencies
│   ├── pytest.ini                  # Pytest configuration
│   ├── manage.py                   # Django entry point
│   └── test_coverage_report.txt    # Generated by pytest-cov for reporting
│
├── frontend/                       # React (Vite) frontend
│   ├── public/                     # Static assets (logo, favicon, etc.)
│   ├── src/
│   │   ├── assets/                 # Images, icons, and visual assets
│   │   ├── components/             # Reusable UI components (Filter, Sort, etc.)
│   │   ├── contexts/               # Global states (AuthContext)
│   │   ├── pages/                  # Page views (Home, Profile, Admin dashboard)
│   │   ├── services/               # API and CSRF client services
│   │   ├── styles/                 # CSS and styling modules
│   │   └── utils/                  # Helper functions (cookies, API wrappers)
│   ├── package.json                # Frontend dependencies
│   ├── vite.config.js              # Vite configuration
│   ├── setupTests.js               # Frontend test setup
│   └── .env                        # Local environment variables (API URL)
│
├── render.yaml                     # Render deployment configuration
├── API Documentation.md            # API reference for all endpoints
├── LICENSE                         # License information
├── README.md                       # Main project documentation
├── questify-start.bat / questify-stop.bat  # Local scripts for quick start/stop
└── .gitignore                      # Ignored files and directories
```

---

## Key Features

### Authentication & Profile

- **User registration and login** with university email format validation. 

- **Profile management:** user can set profile name and image. 

- **Created questions tracking:** shows all created questions.

- **Attempt history tracking:** shows all attempted questions with results. 

- **Saved questions:** users can bookmark and revisit questions. 

- **Activity Heatmap (Engagement Visualization):** displays a GitHub-style contribution chart showing the number of attempts per day across the semester.
- *(Future work)* Password reset (requires dummy email configuration). 

### Create Questions
- **Create questions:** students can choose from two types of questions MCQ and short answer questions, write question stem, answer, choices for MCQ and explanation.
- Students create questions based on tags 
- **AI-assisted explanation:** OpenAI API provides explanation for short answer questinos. 
- **Teaching team verification:** questions are submitted to the teaching team for verification. 
- **Status display:** authors and all attempters can view whether their questions are *Pending*, *Approved*, or *Rejected*. 

### Question Solving
- **Attempt questions:** users can answer both MCQ and short-answer types. 
- **View AI explanations** and creator’s answer after submission. 
- **Progress recording:** each attempt is stored for review in the user profile. 
- Comment & rate questions for quality feedback

### Question List & Discovery
- **Browse all approved questions** in a centralized list view. 
- **Filter by week or topic** (aligned with OOSD weekly schedule). 
- **Search bar:** search questions by keywords or tags. 
- **Sort options:** sort by creation time, popularity, or week. 
- **Bookmark questions:** save to personal list for later attempts. 

### Comments & Discussion
- **Comment system:** users can post comments under each question. 
- **Replies and likes:** enable interaction among students. 
- **Threaded display:** nested comments shown in order. 
- *(Future work)* Report function for inappropriate comments. 

### Leaderboard & Gamification
- Base quiz points:
  - points = attempts × 1 + correct × 9 (defaults; can be changed in settings).
- Optional activity points:
   - comments → LEADERBOARD_POINTS_PER_COMMENT
   - ratings → LEADERBOARD_POINTS_PER_RATING
   - likes → LEADERBOARD_POINTS_PER_LIKE
- See Ranking
  - Students are ordered by total points. More points = higher on the board.
  - If two students have the same points, the one with more correct answers goes higher.
  - If they’re still tied, the one who worked more recently (latest activity) goes higher.
  - If they’re still tied after that, the lower user_id goes first (just a stable tiebreak).
  - People with exactly the same stats share the same rank number (they tie, and we don’t skip numbers).
    
### Admin & Staff Features
- Access and verify all student-created questions
- Activity dashboards (charts showing student engagement)
- Designed to minimise staff workload

### System & Deployment
- **Deployed backend:** Django REST API on Render. 
- **Deployed frontend:** React (Vite) on GitHub Pages. 
- **SQLite database (development):** lightweight and fast; can migrate to PostgreSQL for production. 
- **Automated testing:** Pytest and GitHub Actions CI/CD. 

---

## Tech Stack

| Layer | Technologies |
|--------|--------------|
| **Frontend** | React (Vite), Axios |
| **Backend** | Django + Django REST Framework |
| **Database** | SQLite (development), PostgreSQL (planned for production) |
| **Authentication** | Django sessions (with CSRF protection), optional 2FA |
| **AI Integration** | OpenAI API |
| **Testing** | Pytest (Pytest-Cov) |
| **CI/CD** | GitHub Actions |
| **Deployment** | Backend – Render, Frontend – GitHub Pages |
| **Documentation** | Atlassian Confluence |
| **Version Control** | Git & GitHub |

> **CSRF Note:**  
> CSRF tokens are handled automatically via Django’s middleware and React’s `CsrfService`.  
> See [Security (Sessions & CSRF)](#security-sessions--csrf) for implementation details.

---

## Setup Instructions

### Prerequisites
Make sure your environment matches these versions:

- Python 3.11
- Node.js 20 LTS (Node 18 will **not** work with Vite)
- npm (comes with Node)
- Python virtual environment (venv)

---

### Backend Setup (Django + DRF + SQLite)

```bash
cd backend

# 1. Create virtual environment
python3 -m venv env
source env/bin/activate        # macOS/Linux
env\Scripts\activate           # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run migrations
python manage.py migrate

# 4. Start server
python manage.py runserver 8000
```

**API runs at:** <http://localhost:8000/api>

> Default admin credentials (development):  
> `admin@questify.com` / `12345678q`

---

### Frontend Setup (React + Vite)

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Create .env file
echo "VITE_API_BASE_URL=http://localhost:8000/api" > .env

# 3. Start development server
npm run dev
```

**Frontend runs at:** <http://localhost:5173>

---

### Common Pitfalls

Below are the most frequent setup and deployment mistakes encountered during development.

- **Wrong Node version** → use Node 20.19+
- **Forgot to activate venv** → always activate before running backend
- **Missing `.env` file** → ensure `frontend/.env` exists with `VITE_API_BASE_URL` 
- **Cross-domain cookies blocked** → for split frontend/backend deployments, ensure `SameSite=None` and `Secure` flags are enabled (configured in `render.yaml`)
- **`db.sqlite3` committed** → must be added to `.gitignore` to avoid leaking local data

---

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

---

## Testing

Run automated backend tests using Pytest:

```bash
cd backend
pytest
```

Generate line coverage using Python’s built-in trace module:

```bash
python -m trace --count --summary --module pytest
python trace_summary.py   # helper script to aggregate trace_output/*.cover
```

The CI workflow executes `pytest` on every push/PR to enforce code quality.

---

## Deployment

### Current Hosting (Render)

| Service  | URL | Notes |
|----------|-----|-------|
| Backend  | `https://questify-backend-wv3e.onrender.com` | Django web service created via the `render.yaml` blueprint. |
| Frontend | `https://questify-frontend.onrender.com`      | Vite SPA served by Render. |
| Database | `questify-database`                           | Render PostgreSQL (Free tier, expires Nov 30 2025 unless upgraded). |

> All Render services are on free plans. Storage is limited and the database will be deleted at the expiry date unless the client upgrades.

### Environment & Secrets

- Configure variables in Render’s dashboard and mirror them in local `.env` files for development.
- Backend essentials: `SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `FRONTEND_ORIGIN`, `DJANGO_CORS_ALLOWED_ORIGINS`, `DJANGO_CSRF_TRUSTED_ORIGINS`, `SESSION_COOKIE_*`, `CSRF_COOKIE_*`, `SECURE_SSL_REDIRECT`, `OPENAI_API_KEY`, `ADMIN_EMAILS`, and `DATABASE_URL` (production only).
- Frontend: set `VITE_API_BASE_URL` to the backend API (`https://questify-backend-wv3e.onrender.com/api` in production, `http://localhost:8000/api` locally).

### Database (Render PostgreSQL)

- Render build command already runs `python manage.py migrate --noinput`, so schema changes apply automatically on redeploy.

### Admin Accounts

- Migration `user/0004_create_admin_superuser.py` seeds `admin@questify.com` (password `12345678q`). Change it immediately after handover.
- Additional admins: run `python manage.py createsuperuser` (locally or via `render services shell questify-backend`) and add the email to the `ADMIN_EMAILS` environment variable.

### File Storage

- User profile pictures are stored under `/media/`. Render’s free filesystem is ephemeral—files disappear after each redeploy. Attach a Persistent Disk or switch to durable object storage (e.g., S3) if long-term retention is required.

### Redeploy Checklist

1. Commit & push changes to GitHub (Render auto-redeploys if configured).
2. Verify environment variables, especially `DATABASE_URL`, `ADMIN_EMAILS`, and secrets.
3. Click **Redeploy** in Render to rebuild backend and frontend.
4. After deploy, smoke-test:  
   - `curl https://questify-backend-wv3e.onrender.com/api/csrf/`  
   - Visit the frontend URL and log in.
   - Confirm leaderboard/activity pulls shared data from PostgreSQL.

---

## Environment Variables

The following environment variables must be configured before running or deploying Questify.

#### Backend (Django)
| Variable | Required | Description | Example |
|-----------|-----------|-------------|----------|
| `SECRET_KEY` | Required | Django secret key | `django-insecure-xxxx` |
| `DEBUG` / `DJANGO_DEBUG` | Required | Enable/disable debug mode | `False` |
| `DJANGO_ALLOWED_HOSTS` / `ALLOWED_HOSTS` | Required | Allowed domains | `questify.onrender.com,localhost` |
| `FRONTEND_ORIGIN` / `FRONTEND_URL` | Required | Frontend deployment URL | `https://questify-frontend.github.io` |
| `DJANGO_CORS_ALLOWED_ORIGINS` / `CORS_ALLOWED_ORIGINS` | Required | CORS allowed origins | `https://questify-frontend.github.io,http://localhost:5173` |
| `DJANGO_CSRF_TRUSTED_ORIGINS` / `CSRF_TRUSTED_ORIGINS` | Required | CSRF trusted origins | `https://questify-frontend.github.io` |
| `DATABASE_URL` | Optional | PostgreSQL URL (Render) | `postgres://user:pass@host:5432/dbname` |
| `OPENAI_API_KEY` | Required | OpenAI API key (AI explanations) | `sk-xxxx` |
| `ADMIN_EMAILS` | Optional | Comma-separated admin email list | `alice@student.unimelb.edu.au,bob@student.unimelb.edu.au` |

#### Frontend (React + Vite)
| Variable | Required | Description | Example |
|-----------|-----------|-------------|----------|
| `VITE_API_BASE_URL` | Required | Backend API base URL | `https://questify-api.onrender.com/api` |
| `VITE_CSRF_COOKIE_NAME` | Optional | Optional: name of CSRF cookie (default `'csrftoken'`) | `csrftoken` |

> **Local testing tip:**  
> Create `frontend/.env` containing `VITE_API_BASE_URL=http://localhost:8000/api`  
> and add `.env`, `frontend/.env`, and `backend/.env` to `.gitignore`.

---

## Security (Sessions & CSRF)

- The backend issues Django session and CSRF cookies; production deployments must run behind HTTPS and a distinct frontend origin.
- `/api/csrf/` returns JSON `{"csrfToken": "<value>"}` and refreshes the cookie so clients can safely bootstrap.
- The React client includes a `CsrfService` that pre-fetches the token on boot and injects it into all unsafe requests.
- **Key environment variables** (see `render.yaml` for production-ready values):  
  - `FRONTEND_ORIGIN`
  - `DJANGO_CORS_ALLOWED_ORIGINS`
  - `DJANGO_CSRF_TRUSTED_ORIGINS`
  - `SESSION_COOKIE_SECURE`
  - `SESSION_COOKIE_SAMESITE`
  - `CSRF_COOKIE_SECURE`
  - `CSRF_COOKIE_SAMESITE`

Local development defaults use `Secure=False` and `SameSite=Lax`; override only when testing full cross-site flows.

---

## Project Guidelines

- Questions are week-based (aligned with course structure).
- Supported question types: Multiple Choice & Short Answer.
- AI is used for generating rubrics and explanations, shown alongside student-created answers.
- Admin dashboard includes:
  - Question verification
  - Engagement statistics
  - Activity dashboards
- User profile includes attempt history and saved questions.

---

## Future Work

See the full version in [`Handover/Future_Work.md`](./Handover/Future_Work.md). 
Main development priorities include:

- OAuth 2.0 / SSO Integration (University of Melbourne)
- Reward system for top students
- Database migration to PostgreSQL
- Enhanced AI feedback and automatic tagging
- Expanded gamification (badges, streaks)
- Personalized question recommendation system
- Mobile responsiveness improvements
- Cloud deployment on AWS for scalability

---

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
staticfiles/

# Node
node_modules/
dist/
dist-ssr/
*.local

# Environment
.env
frontend/.env
backend/.env

# IDE / OS
.vscode/
.idea/
.DS_Store
Thumbs.db
```

---

## Team

**Team 56 – Questify Contributors**

| Role | Name |
|------|------|
| Product Owner / Frontend Developer | Chen Ma |
| Frontend Lead | Chang (Jerry) Chang |
| Testing Lead / Backend Developer | Cheolgyun (Bill) Park |
| Scrum Master / Backend Developer | Chih-Yi Huang |
| Backend Leader | Ziyi Zhang |

---

> _Last updated: November 2025_
