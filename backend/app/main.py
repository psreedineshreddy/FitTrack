
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import Base, engine, SessionLocal
from app.services.badge_service import ensure_default_badges

from app.models.user import User
from app.models.progress import Progress
from app.models.goal import Goal
from app.models.workout import Workout
from app.models.notification import Notification
from app.models.workout_plan import WorkoutPlan
from app.models.exercise import Exercise
from app.models.streak import Streak
from app.models.badge import Badge
from app.models.user_badge import UserBadge
from app.models.meal import Meal
from app.models.water_tracking import WaterTracking
from app.models.reminder import Reminder

from app.routers.auth import router as auth_router
from app.routers.workouts import router as workouts_router
from app.routers.progress import router as progress_router
from app.routers.goals import router as goals_router
from app.routers.reports import router as reports_router
from app.routers.notifications import router as notifications_router
from app.routers.workout_plans import router as workout_plans_router
from app.routers.exercises import router as exercises_router
from app.routers.streaks import router as streaks_router
from app.routers.badges import router as badges_router
from app.routers.meals import router as meals_router
from app.routers.water_tracking import router as water_router
from app.routers.ai_suggestions import router as ai_suggestions_router
from app.models.activity_sync import ActivitySync
from app.routers.activity_sync import router as activity_sync_router
from app.routers.advanced_analytics import router as advanced_analytics_router
from app.routers.reminders import router as reminders_router

Base.metadata.create_all(bind=engine)

def seed_exercises():
    db = SessionLocal()

    predefined_exercises = [
        {
            "name": "Running",
            "category": "Cardio",
            "description": "Outdoor running to improve cardiovascular endurance.",
            "duration": 30,
        },
        {
            "name": "Cycling",
            "category": "Cardio",
            "description": "Cycling workout to build stamina and fitness.",
            "duration": 30,
        },
        {
            "name": "Jump Rope",
            "category": "Cardio",
            "description": "High-intensity skipping exercise.",
            "duration": 15,
        },
        {
            "name": "Push Ups",
            "category": "Strength",
            "description": "Upper body exercise targeting chest, shoulders and triceps.",
            "duration": 15,
        },
        {
            "name": "Squats",
            "category": "Strength",
            "description": "Lower body exercise targeting quadriceps and glutes.",
            "duration": 20,
        },
        {
            "name": "Dumbbell Curls",
            "category": "Strength",
            "description": "Arm strengthening exercise using dumbbells.",
            "duration": 15,
        },
        {
            "name": "Plank",
            "category": "Strength",
            "description": "Core strengthening exercise.",
            "duration": 5,
        },
        {
            "name": "Sun Salutation",
            "category": "Yoga",
            "description": "Yoga sequence to improve flexibility and mobility.",
            "duration": 15,
        },
        {
            "name": "Tree Pose",
            "category": "Yoga",
            "description": "Balance-focused yoga posture.",
            "duration": 5,
        },
        {
            "name": "Child's Pose",
            "category": "Yoga",
            "description": "Relaxing yoga posture for recovery and stretching.",
            "duration": 5,
        },
    ]

    try:
        for item in predefined_exercises:
            existing = db.query(Exercise).filter(
                Exercise.name == item["name"]
            ).first()

            if not existing:
                db.add(Exercise(**item))

        db.commit()
    finally:
        db.close()


def seed_badges():
    db = SessionLocal()

    try:
        ensure_default_badges(db)
        db.commit()
    finally:
        db.close()


seed_exercises()
seed_badges()

app = FastAPI(
    title="FitTrack API",
    description="Fitness and Workout Management Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(workouts_router)
app.include_router(progress_router)
app.include_router(goals_router)
app.include_router(reports_router)
app.include_router(notifications_router)
app.include_router(workout_plans_router)
app.include_router(exercises_router)
app.include_router(streaks_router)
app.include_router(badges_router)
app.include_router(meals_router)
app.include_router(water_router)
app.include_router(ai_suggestions_router)
app.include_router(activity_sync_router)
app.include_router(advanced_analytics_router)
app.include_router(reminders_router)

@app.get("/")
def home():
    return {"message": "Welcome to FitTrack API"}
