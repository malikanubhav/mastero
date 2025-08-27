# Quiz Portal

A simple web application where users can register, take quizzes, and view performance reports.  
Admins can manage skills, questions, and view user/group reports.


Link : https://airy-happiness-prod.up.railway.app
---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- MySQL (local or cloud e.g., Aiven)
- npm (or yarn/pnpm)

### Backend
```bash
cd backend
npm install

# Run migrations
npx sequelize-cli db:migrate

# Seed initial data (admin user, skills, sample questions)
npx sequelize-cli db:seed:all

# Start backend
npm run dev
```
Backend runs on **http://localhost:777**

Create a `.env` file in `backend/`:
```
JWT_SECRET=your-secret-key
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=quizapp
DB_USERNAME=root
DB_PASSWORD=yourpassword
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on **http://localhost:5173**

Create a `.env` in `frontend/`:
```
VITE_API_URL=http://localhost:777
```

---

## 📡 API Documentation

All endpoints return JSON.  
Secure endpoints require `Authorization: Bearer <token>` header.

### Auth
- **POST** `/api/auth/register`  
  Request:
  ```json
  { "name": "John", "email": "john@example.com", "password": "pass123" }
  ```
  Response:
  ```json
  { "message": "User registered", "token": "jwt...", "user": { "id": 1, "name": "John", "email": "john@example.com", "role": "user" } }
  ```

- **POST** `/api/auth/login`  
  Request:
  ```json
  { "email": "john@example.com", "password": "pass123" }
  ```

---

### Skills
- **POST** `/api/skills` *(admin only)*  
  ```json
  { "name": "JavaScript", "description": "Web programming language" }
  ```

- **GET** `/api/skills?search=js&page=1&limit=10`  
  Response:
  ```json
  {
    "data": [{ "id": 1, "name": "JavaScript", "description": "Web programming language" }],
    "page": 1, "limit": 10, "total": 1, "totalPages": 1
  }
  ```

- **GET** `/api/skills/:id`  
- **PUT** `/api/skills/:id` *(admin only)*  
- **DELETE** `/api/skills/:id` *(admin only)*  

---

### Questions (admin only)
- **POST** `/api/questions`  
  ```json
  {
    "text": "Which company created JavaScript?",
    "skill_id": 1,
    "options": ["Netscape", "Microsoft", "Google", "Oracle"],
    "correct_index": 0,
    "difficulty": "easy",
    "is_active": true
  }
  ```

- **GET** `/api/questions?skill_id=1&page=1&limit=10`  

---

### Quiz
- **POST** `/api/quiz/start`  
  ```json
  { "skill_id": 1, "limit": 5 }
  ```
  Response:
  ```json
  { "attempt_id": 123, "questions": [{ "id": 55, "text": "...", "options": ["a","b","c","d"] }] }
  ```

- **POST** `/api/quiz/answer`  
  ```json
  {
    "attempt_id": 123,
    "answers": [
      { "question_id": 55, "selected_index": 1 },
      { "question_id": 56, "selected_index": 0 }
    ]
  }
  ```

---

### Reports
- **GET** `/api/reports/me/summary`  
  Response:
  ```json
  {
    "summary": { "attempts": 3, "total_score": 21, "total_questions": 30, "avg_score": 7.0 }
  }
  ```

- **GET** `/api/reports/me/gaps`  
  Response:
  ```json
  {
    "skills": [
      { "skill_id": 1, "skill_name": "JavaScript", "avg_score": 4.5, "avg_pct": 0.56, "attempts": 2 }
    ]
  }
  ```

---

## 🗄️ Database Schema Design

### Tables

**users**
- id (PK)
- name
- email (unique)
- password (hashed)
- role (`user` | `admin`)
- is_active (bool)
- createdAt, updatedAt

**skills**
- id (PK)
- name (unique)
- description
- createdAt, updatedAt

**questions**
- id (PK)
- skill_id (FK → skills.id)
- text
- options (JSON array)
- correct_index (int)
- difficulty (enum: easy/medium/hard)
- is_active (bool)
- createdAt, updatedAt

**quiz_attempts**
- id (PK)
- user_id (FK → users.id)
- skill_id (FK → skills.id)
- score
- total_questions
- createdAt, updatedAt

**quiz_answers**
- id (PK)
- attempt_id (FK → quiz_attempts.id)
- question_id (FK → questions.id)
- selected_index
- is_correct (bool)
- createdAt, updatedAt

**groups** (optional)  
**user_groups** (optional many-to-many between users & groups)

---

## 🔑 Seed Accounts

After running seeders:
- **Admin**: `Anubhav@gmail.com / Anubhav123@`
- **User**: `Anushka@gmail.com / Anushka123@`