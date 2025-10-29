This document describes the public API endpoints for the **Questify System**.  
Each section outlines URL patterns, request/response formats, authentication requirements, and expected status codes.

---

## 1. **User API**

| **Feature**                | **URL**                             | **Method** | **Auth Required** | **Request Body**                                                                                               | **Success Response**                                                             | **Fail Response**                                                        | **Status Codes**                                    |
| -------------------------- | ----------------------------------- | ---------- | ----------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------- |
| **Get CSRF Token**         | `/api/csrf/`                        | `GET`      | F                 | None                                                                                                           | ```json {"csrfToken": "<token>"}```                                              | N/A                                                                      | `200 OK`                                            |
| **Register**               | `/api/auth/register/`               | `POST`     | F                 | ```json {"name": "string", "student_id": "string", "email": "user@domain.edu", "password": "StrongPass123!"}``` | ```json {"ok": true, "message": "Registration successful", "user": {...}}```     | ```json {"ok": false, "message": "Registration failed", "errors": {...}}``` | `201 Created`<br>`400 Bad Request`                  |
| **Login**                  | `/api/auth/login/`                  | `POST`     | F                 | ```json {"email": "user@domain.edu", "password": "string"}```                                                  | ```json {"ok": true, "message": "Login successful", "user": {"is_admin": true, ...}}``` | ```json {"ok": false, "message": "Invalid email or password", "errors": {...}}``` | `200 OK`<br>`400 Bad Request`<br>`401 Unauthorized` |
| **Logout**                 | `/api/auth/logout/`                 | `POST`     | F                 | ```json {}```                                                                                                  | ```json {"ok": true, "message": "Logout successful"}```                          | N/A                                                                      | `200 OK`                                            |
| **Get Current User (Me)**  | `/api/me/`                          | `GET`      | T                 | None                                                                                                           | ```json {"id": 4, "email": "user@domain.edu", "name": "Questify User", "is_admin": false, ...}``` | ```json {"detail": "Authentication credentials were not provided."}```   | `200 OK`<br>`401 Unauthorized`<br>`403 Forbidden`   |
| **Update Profile**         | `/api/me/`                          | `PATCH`    | T                 | ```json {"display_name": "New Name"}```                                                                        | Updated user payload                                                                 | ```json {"ok": false, "message": "Invalid data", "errors": {...}}```     | `200 OK`<br>`400 Bad Request`                       |
| **Password Reset Request** | `/api/auth/password-reset/`         | `POST`     | F                 | ```json {"email": "user@domain.edu"}```                                                                        | ```json {"ok": true, "message": "If the email exists, a password reset link has been sent"}``` | ```json {"email": ["Enter a valid email address."]}```               | `200 OK`<br>`400 Bad Request`                       |
| **Password Reset Confirm** | `/api/auth/password-reset-confirm/` | `POST`     | F                 | ```json {"uid": "base64", "token": "string", "new_password": "NewPass123!"}```                                 | ```json {"ok": true, "message": "Password has been reset successfully"}```       | ```json {"ok": false, "message": "Invalid or expired reset link"}```     | `200 OK`<br>`400 Bad Request`                       |

*Auth Required column*: `T` = session + CSRF token required, `F` = public.

---

## 2. **Question API**

| **Feature**         | **URL**                      | **Method** | **Auth Required** | **Request Body / Query Params**                                                                                                                                     | **Success Response**                                                              | **Fail Response**                                      | **Status Codes**                     |
| ------------------- | ---------------------------- | ---------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------ |
| **Create Question** | `/questions/create/`         | `POST`     | T                 | MCQ: ```json {"type": "MCQ", "question": "...", "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...", "option_e": "...", "correct_option": "A"}```<br>Short: ```json {"type": "SHORT", "question": "...", "answer": "..."}``` | Normalized question JSON (id, type, metadata)                                      | ```json {"type": ["Invalid question type."], ...}```    | `201 Created`<br>`400 Bad Request`   |
| **List Questions**  | `/questions/`                | `GET`      | T                 | Optional filters for pagination or search (e.g. `page`, `type`, `week`).                                                                                             | ```json [{"id": "...", "type": "MCQ", ...}, ...]```                              | ```json {"detail": "Authentication credentials were not provided."}``` | `200 OK`<br>`401 Unauthorized`      |
| **Question Detail** | `/questions/<uuid>/`         | `GET`      | T                 | None                                                                                                                                                                  | ```json {"id": "...", "type": "SHORT", "question": "...", "answer": "...", ...}``` | ```json {"detail": "Not found."}```                    | `200 OK`<br>`404 Not Found`          |
| **Verify Question** | `/questions/<uuid>/verify/`  | `POST`     | Admin only        | ```json {"approved": true}```<br>or<br>```json {"approved": false, "rejectionReason": "Question is unclear"}``` | Updated question with `verify_status` (APPROVED/REJECTED) and `admin_feedback` | ```json {"error": "Only administrators can verify questions."}```<br>```json {"error": "Rejection reason is required when rejecting a question."}``` | `200 OK`<br>`400 Bad Request`<br>`403 Forbidden`<br>`404 Not Found` |

---

## 3. **Attempt API**

| **Feature**                 | **URL**                      | **Method** | **Auth Required** | **Request Body / Query Params**                          | **Success Response**                                                                                  | **Fail Response**                            | **Status Codes**                     |
| --------------------------- | ---------------------------- | ---------- | ----------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------ |
| **Submit Attempt**          | `/attempts/create/`          | `POST`     | T                 | ```json {"question": "<uuid>", "answer": "string"}```     | ```json {"id": "<uuid>", "is_correct": true, "answer": "...", "submitted_at": "2024-10-26T12:00:00Z"}``` | ```json {"question": ["Question not found."]}``` | `201 Created`<br>`400 Bad Request`<br>`404 Not Found` |
| **List My Attempts**        | `/attempts/user/`            | `GET`      | T                 | Optional pagination (`page`, `page_size`).                | ```json [{"id": "...", "question": "...", "is_correct": null, ...}, ...]```                          | ```json {"detail": "Authentication credentials were not provided."}``` | `200 OK`<br>`401 Unauthorized`      |
| **Attempts for a Question** | `/attempts/question/<uuid>/` | `GET`      | T                 | None                                                      | ```json [{"id": "...", "user": {...}, "is_correct": true, ...}, ...]```                               | ```json {"detail": "Not found."}```          | `200 OK`<br>`404 Not Found`          |

---

## 4. **Leaderboard API**

| **Feature**       | **URL** | **Method** | **Auth Required** | **Query Params** | **Success Response**                                                   | **Fail Response** | **Status Codes** |
| ----------------- | ------- | ---------- | ----------------- | ---------------- | ---------------------------------------------------------------------- | ----------------- | ---------------- |
| **Not available** | N/A     | N/A        | N/A               | N/A              | Leaderboard endpoints are not exposed in the current development build | N/A               | N/A              |

---

## 5. **Admin API**

| **Feature**                | **URL**                     | **Method** | **Auth Required** | **Query Params / Body**        | **Success Response**                                                                                                        | **Fail Response**                                             | **Status Codes**                     |
| -------------------------- | --------------------------- | ---------- | ----------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------ |
| **Platform Overview**      | `/api/admin/overview/`      | `GET`      | Admin only        | None                           | Aggregate metrics (users, questions, attempts, AI usage) with ISO timestamps.                                               | ```json {"detail": "You do not have permission to access the admin panel."}``` | `200 OK`<br>`403 Forbidden`          |
| **User Activity Snapshot** | `/api/admin/user-activity/` | `GET`      | Admin only        | `limit` (optional, default 20) | ```json {"limit": 20, "count": 10, "results": [{"user_id": 4, "email": "...", "total_questions": 3, "total_attempts": 5}]}``` | ```json {"detail": "You do not have permission to access the admin panel."}``` | `200 OK`<br>`403 Forbidden`          |
| **AI Usage Metrics**       | `/api/admin/ai-usage/`      | `GET`      | Admin only        | None                           | Totals and performance insights for AI-generated short answers, plus recent examples (question ids, creator email, etc.).   | ```json {"detail": "You do not have permission to access the admin panel."}``` | `200 OK`<br>`403 Forbidden`          |

> **Note:** Admin access is restricted to the email safelist defined via `ADMIN_EMAILS` in `config/settings.py`. Requests from authenticated users outside that list receive `403 Forbidden`.

---

## **General Notes**

- **Base URL (development)**: `http://127.0.0.1:8000`
- All authenticated requests rely on Django session cookies. Unsafe methods (`POST`, `PUT`, `PATCH`, `DELETE`) must include the `X-CSRFToken` header.
- Recommended default headers: `Content-Type: application/json`, `X-CSRFToken: <token>`.
- Error payloads follow one of three shapes:
  - Standard: `{"detail": "..."}`
  - Validation: `{"field": ["message", ...], ...}`
  - Custom: `{"ok": false, "message": "...", "errors": {...}}`
- Status codes follow REST conventions (`200`, `201`, `204`, `400`, `401`, `403`, `404`, `500`).
- File upload endpoints (if re-enabled) require `multipart/form-data`; none are currently active.
