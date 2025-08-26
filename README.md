# mastero


# Quiz Portal

A simple web-based system where users can register, take quizzes, and view performance reports.  
Admins can manage users, skills, and questions.

## Setup

### Backend
```bash
cd backend
npm install
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm run dev
```

Backend runs on: http://localhost:777

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

