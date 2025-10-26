This document describes all API endpoints for the **Questify System**.
Each section includes URL patterns, request/response formats, authentication requirements, and status codes.  

---
## 1. **User API**

| **Feature**                   | **URL**                             | **Method** | **Auth Required** | **Request Body**                                                                                                               | **Success Response**                                                                           | **Fail Response**                                                           | **Status Codes**                                    |
| ----------------------------- | ----------------------------------- | ---------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------- |
| **Register**                  | `/api/auth/register/`               | `POST`     | F                 | ```json {"display_name": "string", "student_id": "string", "email": "xxx@allowed-domain.edu", "password": "StrongPass123!"}``` | ```json {"ok": true, "message": "Registration successful", "user": {...}}```                   | ```json {"ok": false, "message": "Registration failed", "errors": {...}}``` | `201 Created`<br>`400 Bad Request`                  |
| **Login**                     | `/api/auth/login/`                  | `POST`     | F                 | ```json {"email": "xxx@xxx.edu", "password": "string"}```                                                                      | ```json {"ok": true, "message": "Login successful", "user": {...}}```                          | ```json {"ok": false, "message": "Invalid email or password"}```            | `200 OK`<br>`400 Bad Request`<br>`401 Unauthorized` |
| **Logout**                    | `/api/auth/logout/`                 | `POST`     | T                 | None                                                                                                                           | ```json {"ok": true, "message": "Logout successful"}```                                        | —                                                                           | `200 OK`                                            |
| **Get CSRF Token**            | `/api/csrf/`                        | `GET`      | F                 | None                                                                                                                           | ```json {"csrfToken": "string"}```                                                             | —                                                                           | `200 OK`                                            |
| **Get Current User (Me)**     | `/api/me/`                          | `GET`      | T                 | None                                                                                                                           | ```json {"id": 1, "email": "xxx@xxx.edu", "display_name": "Shirley", "student_id": "12345"}``` | ```json {"detail": "Authentication credentials were not provided."}```      | `200 OK`<br>`403 Forbidden`                         |
| **Update Display Name**       | `/api/me/`                          | `PATCH`    | T                 | ```json {"display_name": "New Name"}```                                                                                        | ```json {"id": 1, "display_name": "New Name", ...}```                                          | ```json {"ok": false, "message": "Invalid data", "errors": {...}}```        | `200 OK`<br>`400 Bad Request`                       |
| **Password Reset Request**    | `/api/auth/password-reset/`         | `POST`     | F                 | ```json {"email": "xxx@xxx.edu"}```                                                                                            | ```json {"ok": true, "message": "If the email exists, a password reset link has been sent"}``` | ```json {"ok": false, "errors": {...}}```                                   | `200 OK`<br>`400 Bad Request`                       |
| **Password Reset Confirm**    | `/api/auth/password-reset-confirm/` | `POST`     | F                 | ```json {"uid": "base64string", "token": "string", "new_password": "NewPass123!"}```                                           | ```json {"ok": true, "message": "Password has been reset successfully"}```                     | ```json {"ok": false, "message": "Invalid or expired reset link"}```        | `200 OK`<br>`400 Bad Request`                       |
| **Get User by ID**            | `/api/users/<int:user_id>/`         | `GET`      | T                 | None                                                                                                                           | ```json {"id": 2, "email": "student@xxx.edu", "display_name": "Student Name"}```               | ```json {"detail": "Not found."}```                                         | `200 OK`<br>`404 Not Found`                         |
| **Get My Profile Picture**    | `/api/me/profile-picture/`          | `GET`      | T                 | None                                                                                                                           | ```json {"user": 1, "profile_picture_url": "https://.../profile.jpg"}```                       | ```json {"detail": "Authentication credentials were not provided."}```      | `200 OK`<br>`403 Forbidden`                         |
| **Update My Profile Picture** | `/api/me/profile-picture/`          | `PUT`      | T                 | Form-data: `profile_picture` (jpg/png/webp ≤5MB)                                                                               | ```json {"user": 1, "profile_picture_url": "https://.../profile.jpg"}```                       | ```json {"profile_picture": ["Unsupported image type"]}```                  | `200 OK`<br>`400 Bad Request`<br>`403 Forbidden`    |

---
## 2. **Question API**

| **Feature**            | **URL**                                  | **Method** | **Auth Required** | **Request Body / Query Params**                                     | **Success Response**                                                                                    | **Fail Response**                                      | **Status Codes**                   |
| ---------------------- | ---------------------------------------- | ---------- | ----------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------- |
| **Create Question**    | `/api/questions/create/`                 | `POST`     | T                 | MCQ → options A–E + `correct_options`<br>Short → `answer`           | Returns created question JSON (includes AI answer for short)                                            | ```json {"error": "Invalid type"}```                   | `201 Created`<br>`400 Bad Request` |
| **List All Questions** | `/api/questions/`                        | `GET`      | T                 | `search`, `week`, `topic`, `type`, `source`, `verified`, `ordering` | List of questions                                                                                       | —                                                      | `200 OK`                           |
| **Get Question by ID** | `/api/questions/<uuid:pk>/`              | `GET`      | T                 | None                                                                | Detailed question JSON                                                                                  | ```json {"detail": "Not found."}```                    | `200 OK`<br>`404 Not Found`        |
| **List My Questions**  | `/api/questions/user/`                   | `GET`      | T                 | None                                                                | My authored questions                                                                                   | —                                                      | `200 OK`                           |
| **Get Metadata**       | `/api/questions/metadata/`               | `GET`      | T                 | None                                                                | ```json {"weeks": [...], "topics": [...], "types": [...], "sources": [...], "verifyStatuses": [...]}``` | —                                                      | `200 OK`                           |
| **Rate a Question**    | `/api/questions/<uuid>/rating/`          | `POST`     | T                 | ```json {"score": 5}```                                             | ```json {"average": 4.5, "count": 10, "userRating": 5}```                                               | ```json {"error": "Score must be between 1 and 5."}``` | `200 OK`<br>`400 Bad Request`      |
| **Get Rating Info**    | `/api/questions/<uuid>/rating/`          | `GET`      | T                 | None                                                                | Current average and user rating                                                                         | ```json {"detail": "Not found."}```                    | `200 OK`<br>`404 Not Found`        |
| **Delete My Rating**   | `/api/questions/<uuid>/rating/`          | `DELETE`   | T                 | None                                                                | (empty)                                                                                                 | —                                                      | `204 No Content`                   |
| **List Comments**      | `/api/questions/<uuid>/comments/`        | `GET`      | T                 | None                                                                | All comments for the question                                                                           | —                                                      | `200 OK`                           |
| **Post Comment**       | `/api/questions/<uuid>/comments/`        | `POST`     | T                 | ```json {"content": "Nice question!"}```                            | Comment JSON                                                                                            | ```json {"error": "Content is required"}```            | `201 Created`<br>`400 Bad Request` |
| **Reply to Comment**   | `/api/questions/comments/<uuid>/reply/`  | `POST`     | T                 | ```json {"content": "Agree!"}```                                    | Reply JSON                                                                                              | ```json {"error": "Content is required"}```            | `201 Created`<br>`400 Bad Request` |
| **Like Comment**       | `/api/questions/comments/<uuid>/like/`   | `POST`     | T                 | None                                                                | ```json {"like_count": 5}```                                                                            | ```json {"error": "Comment not found"}```              | `200 OK`<br>`404 Not Found`        |
| **Unlike Comment**     | `/api/questions/comments/<uuid>/unlike/` | `POST`     | T                 | None                                                                | ```json {"like_count": 4}```                                                                            | ```json {"error": "Comment not found"}```              | `200 OK`<br>`404 Not Found`        |

---
## 3. **Attempt API**

| **Feature**                      | **URL**                          | **Method** | **Auth Required** | **Request Body**                               | **Success Response**                                                                                 | **Fail Response**                          | **Status Codes**                 |
| -------------------------------- | -------------------------------- | ---------- | ----------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------- |
| **Create Attempt**               | `/api/attempts/create/`          | `POST`     | T                 | ```json {"question": "uuid", "answer": "A"}``` | ```json {"id": "uuid", "is_correct": true, "answer": "A", "submitted_at": "2025-10-26T12:00:00Z"}``` | ```json {"error": "Question not found"}``` | `201 Created`<br>`404 Not Found` |
| **List My Attempts**             | `/api/attempts/user/`            | `GET`      | T                 | None                                           | List of attempts with `is_correct` info                                                              | —                                          | `200 OK`                         |
| **List Attempts for a Question** | `/api/attempts/question/<uuid>/` | `GET`      | T                 | None                                           | Attempts for that question                                                                           | ```json {"detail": "Not found."}```        | `200 OK`<br>`404 Not Found`      |
| **Get User Activity Heatmap**    | `/api/attempts/user/activity/`   | `GET`      | T                 | None                                           | ```json {"activity": {"2025-10-20": 3, "2025-10-21": 5}, "total_attempts": 8}```                     | —                                          | `200 OK`                         |

---

## 4. **Leaderboard API**

| **Feature**                | **URL**                | **Method** | **Auth Required** | **Query Params**                                   | **Success Response**                                                                                                                        | **Fail Response**                                                      | **Status Codes**            |
| -------------------------- | ---------------------- | ---------- | ----------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------- |
| **Get Global Leaderboard** | `/api/leaderboard/`    | `GET`      | T                 | `week`, `topic`, `from`, `to`, `page`, `page_size` | ```json {"count": 42, "results": [{ "user_id": 1, "display_name": "Shirley", "attempts": 45, "correct": 38, "points": 387, "rank": 1 }]}``` | ```json {"detail": "Authentication credentials were not provided."}``` | `200 OK`<br>`403 Forbidden` |
| **Get My Ranking**         | `/api/leaderboard/me/` | `GET`      | T                 | None                                               | ```json {"user_id": 1, "display_name": "Shirley", "attempts": 45, "correct": 38, "points": 387, "rank": 1, "total_users": 42}```            | ```json {"detail": "Authentication credentials were not provided."}``` | `200 OK`<br>`403 Forbidden` |

---
## **General Notes**

- All APIs use **session-based authentication** (Django `sessionid` + `csrftoken` cookies).

- Frontend must send requests with credentials enabled:

```js

fetch("/api/.../", { method: "POST", credentials: "include" })

```

- CSRF token obtained from `/api/csrf/` must be included as:

```

X-CSRFToken: <token>

```

- File uploads (e.g. profile pictures) use `multipart/form-data`.

- All datetime fields are in **UTC (ISO 8601)** format.

- Status codes follow REST conventions (`200`, `201`, `204`, `400`, `401`, `403`, `404`).