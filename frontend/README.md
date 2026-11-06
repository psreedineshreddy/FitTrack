# FitTrack – Fitness & Workout Management Platform

## Project Overview

FitTrack is a full-stack fitness and workout management platform that helps users manage workouts, track daily progress, set fitness goals, explore exercises, schedule workout plans, analyze performance, and monitor their fitness journey.

## Technologies Used

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- JWT Authentication
- Bcrypt Password Hashing

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
- User-specific data access

### 2. Workout Management
- Add workout details
- View workout history
- Update and delete workouts
- Track workout duration and calories burned
- Search and filter workouts

### 3. Daily Progress Tracking
- Track daily workouts
- Calculate total calories burned
- Select any date to view daily progress
- Display daily activity summaries

### 4. Goal Setting
- Create fitness goals
- Set target values and deadlines
- Track current progress
- Update goal progress
- Automatically track goal status
- Receive goal completion notifications

### 5. Reports & Analytics
- View weekly workout summaries
- View monthly progress reports
- Track calories burned and workout duration
- Visualize fitness activity using charts

### 6. Notifications
- View notifications
- Mark notifications as read
- Receive workout reminders
- Receive goal completion notifications

## Features – Phase 2

### 7. Workout Plans & Scheduling
- Create workout plans
- Schedule workouts for specific dates
- View upcoming workout plans
- Update and delete scheduled plans
- Manage workout schedules through a calendar interface

### 8. Exercise Library
- Browse predefined exercises
- Explore exercises by category
- Search exercises by name
- View exercise descriptions and durations
- Add and delete exercises

### 9. Progress Comparison
- Compare weekly fitness progress
- Compare monthly fitness statistics
- Compare current and previous performance
- Visualize daily workout trends in weekly comparisons
- Visualize weekly workout trends in monthly comparisons
- Display percentage improvements and progress insights

### 10. Streak Tracking
- Track consecutive workout days
- Calculate current workout streak
- Maintain longest workout streak
- Display last workout date
- Track fitness consistency and milestones

### 11. Achievement Badges
- Unlock badges based on workout activities
- Earn badges for workout milestones
- Track streak-based achievements
- Receive goal-related achievements
- View earned and locked badges

### 12. Personalized Dashboard
- Display personalized welcome information
- Show daily workout summaries
- Display upcoming workout plans
- Track goal progress
- Show current and longest workout streaks
- Display recently earned achievement badges
- Provide quick navigation to application features

## Project Structure

```text
FitTrack/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── database.py
│   │   └── main.py
│   │
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
│   │
│   └── package.json
│
├── Phase 1 Screenshots/
│
├── Phase 2 Screenshots/
│
└── README.md
```

## Installation and Setup

### Prerequisites
- Python 3.9 or higher
- Node.js and npm
- Git (optional)

### Backend Setup

Open a terminal and execute:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend URL: http://127.0.0.1:8000

API Documentation: http://127.0.0.1:8000/docs

### Frontend Setup

Open another terminal and execute:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: http://localhost:5173

## Screenshots

The project includes separate screenshot folders for both development phases.

### Phase 1 Screenshots
All Phase 1 application and API screenshots are available in:

`Phase 1 Screenshots/`

### Phase 2 Screenshots
All Phase 2 application and API screenshots are available in:

`Phase 2 Screenshots/`

## Conclusion

FitTrack is a full-stack fitness and workout management platform developed using FastAPI, React, and SQLite.

Phase 1 establishes the core fitness management features, including authentication, workout management, daily progress tracking, goal setting, reports, and notifications.

Phase 2 extends the application with workout scheduling, an exercise library, progress comparison, streak tracking, achievement badges, and a personalized dashboard.

Together, both phases provide a comprehensive fitness tracking experience that helps users manage workouts, monitor performance, maintain consistency, and achieve their fitness goals.