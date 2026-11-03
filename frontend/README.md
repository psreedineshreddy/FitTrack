# FitTrack – Fitness & Workout Management Platform

## Project Overview

FitTrack is a fitness and workout management platform that helps users manage workouts, track daily progress, set fitness goals, view reports, and receive notifications.

## Technologies Used

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- JWT Authentication

### Frontend
- React
- Vite
- JavaScript
- Axios
- React Router
- Lucide React
- Recharts
- CSS

## Features – Phase 1

### 1. User Authentication
- User registration and login
- Secure password hashing
- JWT-based authentication
- Protected routes

### 2. Workout Management
- Add workout details
- View workout history
- Manage workout information
- Track workout duration and calories burned

### 3. Daily Progress Tracking
- Track daily workouts
- Calculate total calories burned
- Select any date to view daily progress

### 4. Goal Setting
- Create fitness goals
- Set target values and deadlines
- Track current progress
- Automatically update goal status
- Receive goal completion notifications

### 5. Reports & Analytics
- View weekly workout summaries
- View monthly progress reports
- Track calories burned and workout duration
- Visualize fitness activity using charts

### 6. Notifications
- View notifications
- Mark notifications as read
- Receive daily workout reminders
- Receive goal completion notifications

## Project Structure

```text
FitTrack/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── database.py
│   │   └── main.py
│   ├── fittrack.db
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── App.jsx
│   └── package.json
│
└── Phase 1 Screenshots/
```

## Installation and Setup

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend URL: `http://127.0.0.1:8000`

API Documentation: `http://127.0.0.1:8000/docs`

### Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## Screenshots

All Phase 1 application and API screenshots are available in the following folder:

**`Phase 1 Screenshots/`**

## Conclusion

FitTrack Phase 1 provides a fitness management platform with authentication, workout management, daily progress tracking, goal setting, reports and analytics, and notifications.