# Description of Key Classes and Application Layers

This document provides an overview of the core architectural layers and key classes in the **Questify** system, enabling future developers to quickly locate and modify relevant components.

---

## 1. Architectural Layers

| Layer | Technology | Description |
|-------|-------------|--------------|
| **Frontend (Presentation Layer)** | React (Vite) | Provides user interface for students and staff. Handles routing, forms, and state management via React Context. Communicates with backend through Axios-based API services. |
| **Backend (Application Layer)** | Django REST Framework | Contains business logic, API endpoints, and authentication. Manages request handling, validation, and model serialization. |
| **Database (Persistence Layer)** | SQLite (development) / PostgreSQL (production) | Stores persistent data such as users, questions, attempts, comments, and ratings. Uses Django ORM for relational mapping. |
| **Integration Layer** | OpenAI API | Supports AI-assisted explanation generation for short-answer questions. |
| **Infrastructure Layer** | Render / GitHub Pages | Provides hosting, environment management, and CI/CD deployment. |

---

## 2. Backend: Key Packages and Classes

### `user/`
| File | Key Classes | Purpose |
|------|--------------|----------|
| `models.py` | `UserProfile` | Extends Django User model; adds student ID, profile name, and profile picture. |
| `views.py` | `RegisterView`, `LoginView`, `MeView` | Handles authentication, registration, and profile retrieval/updating. |
| `serializers.py` | `UserLoginSerializer`, `UserRegistrationSerializer `, `UserSerializer` | Converts User model data to JSON for API use. |

### `questions/`
| File | Key Classes | Purpose |
|------|--------------|----------|
| `models.py` | `Question`, `QuestionRating`, `Comment` | Core entities for the question bank. Supports creating questions, rating, and threaded comments. |
| `views.py` | `QuestionListView`, `QuestionDetailView`, `QuestionCreateView`, `CommentViewSet` | Enables browsing, filtering, creating, and verifying questions. |
| `serializers.py` | `QuestionSerializer`, `CommentSerializer`, `QuestionCreateSerializer` | Defines how questions and related entities are structured in API responses. |

### `attempts/`
| File | Key Classes | Purpose |
|------|--------------|----------|
| `models.py` | `Attempt` | Tracks student attempts, correctness, and timestamps. |
| `views.py` | `AttemptCreateView`, `AttemptListView` | Allows submitting and reviewing attempts. |
| `serializers.py` | `AttemptSerializer` | Serializes attempt data for profile display and analytics. |

### `leaderboard/`
| File | Key Classes | Purpose |
|------|--------------|----------|
| `views.py` | `LeaderboardView`, `MyLeaderboardView` | Calculates rankings based on question creation, attempts, comments, and ratings. |
| `serializers.py` | `LeaderboardRowSerializer`, `MyLeaderboardSerializer` | Formats leaderboard data for UI presentation. |

### `adminpanel/`
| File | Key Classes | Purpose |
|------|--------------|----------|
| `views.py` | `AdminVerifyQuestionView`, `AdminUserActivityView` | Allows teaching staff to approve or reject questions and view platform data. |

---

## 3. Frontend: Key Components and Structure

### Directory Overview
| Directory | Description |
|------------|-------------|
| `src/pages/` | Top-level pages (e.g. HomePage, PostQuestionPage, QuestionListPage, AdminDashboardPage). |
| `src/components/` | Reusable UI components (e.g. `QuestionList`, `LoginForm`, `LeaderboardTable`). |
| `src/services/` | API clients for communication with backend (`apiClient.js`, `QuestionService.js`, etc.). |
| `src/contexts/` | React Context for global state management (`AuthContext.jsx`). |
| `src/utils/` | Utility helpers for cookies. |

---

## 4. Inter-Layer Communication

- **Frontend ↔ Backend:** via REST API using Axios; CSRF tokens automatically attached by `CsrfService`. 
- **Backend ↔ Database:** through Django ORM models and serializers. 
- **Backend ↔ OpenAI API:** via `openai` Python client, called when generating AI explanations. 
