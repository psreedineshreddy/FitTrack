# FitTrack – Fitness & Workout Management Platform

## Project Overview

FitTrack is a full-stack fitness and workout management platform that helps users manage workouts, track daily progress, set fitness goals, explore exercises, schedule workout plans, monitor nutrition and water intake, analyze performance, and maintain a consistent fitness routine.

The application is developed using FastAPI, React, and SQLite, with secure authentication, interactive dashboards, and personalized fitness insights.

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
- Receive goal completion notifications
- Display notification alerts through the notification bell

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

## Features – Phase 3

### 13. Nutrition & Meal Tracking
- Record daily meals
- Track meal information
- View meal history
- Calculate daily nutrition summaries
- Delete meal entries

### 14. Water Intake Tracker
- Record daily water consumption
- Track total water intake
- Set daily water intake goals
- View daily water summaries
- Delete water intake entries

### 15. AI Workout Suggestions
- Generate personalized workout suggestions using fitness activity and goal data
- Analyze recent workout history
- Identify workout categories
- Recommend exercises from the exercise library
- Display personalized fitness suggestions

### 16. Workout Timer & Live Tracking
- Start and stop workout timers
- Track workout duration in real time
- Calculate estimated calories burned
- Save completed workout sessions
- View saved workouts in workout history

### 17. Third-Party Activity Integration
- Activity data entry for Google Fit
- Activity data entry for Apple Health
- Record steps, calories, and active minutes
- View imported activity history
- Display daily activity summaries

*Note: The current web application supports manual activity data import. Automatic Google Fit and Apple Health synchronization is not enabled.*

### 18. Advanced Analytics Dashboard
- View weekly workout performance trends
- View monthly workout performance trends
- Track goal completion rates
- Analyze workout consistency
- Visualize workout and calorie statistics
- Display personalized performance insights

### 19. In-App Reminders & Alerts
- Create custom workout reminders
- Set meal reminders
- Set water intake reminders
- Schedule daily, weekday, and weekend reminders
- Enable and pause reminders
- Edit and delete reminders
- Receive automatic in-app reminder notifications
- View unread notification counts
- Mark notifications as read

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
├── Phase 3 Screenshots/
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

## Conclusion

FitTrack is a full-stack fitness and workout management platform developed using FastAPI, React, and SQLite.

**Phase 1** establishes the core fitness management features, including authentication, workout management, daily progress tracking, goal setting, reports, and notifications.

**Phase 2** extends the platform with workout scheduling, an exercise library, progress comparison, streak tracking, achievement badges, and a personalized dashboard.

**Phase 3** further enhances the application with nutrition tracking, water intake monitoring, personalized workout suggestions, live workout tracking, activity data import, advanced analytics, and in-app reminders.

Together, all three phases provide a comprehensive fitness management experience that helps users manage workouts, monitor performance, maintain consistency, and work toward their fitness goals.