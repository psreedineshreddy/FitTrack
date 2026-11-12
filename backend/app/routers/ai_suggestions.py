
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.workout import Workout
from app.models.goal import Goal
from app.models.exercise import Exercise
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(
    prefix="/api/ai-suggestions",
    tags=["AI Workout Suggestions"]
)


@router.get("/")
def get_ai_suggestions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    week_start = today - timedelta(days=6)

    workouts = db.query(Workout).filter(
        Workout.user_id == current_user.id,
        Workout.workout_date >= week_start,
        Workout.workout_date <= today
    ).all()

    goals = db.query(Goal).filter(
        Goal.user_id == current_user.id,
        Goal.status == "ACTIVE"
    ).all()

    exercise_library = db.query(Exercise).order_by(
        Exercise.name
    ).all()

    category_counts = {
        "Cardio": 0,
        "Strength": 0,
        "Yoga": 0
    }

    for workout in workouts:
        if workout.category in category_counts:
            category_counts[workout.category] += 1

    goal_focus = "General Fitness"

    if goals:
        goal_types = [goal.goal_type for goal in goals]

        if "Weight Loss" in goal_types:
            goal_focus = "Weight Loss"
            preferred_categories = ["Cardio", "Strength", "Yoga"]
        elif "Muscle Gain" in goal_types:
            goal_focus = "Muscle Gain"
            preferred_categories = ["Strength", "Cardio", "Yoga"]
        elif "Steps" in goal_types:
            goal_focus = "Daily Activity"
            preferred_categories = ["Cardio", "Yoga", "Strength"]
        else:
            preferred_categories = ["Cardio", "Strength", "Yoga"]
    else:
        preferred_categories = ["Cardio", "Strength", "Yoga"]

    # Prioritize categories with fewer recent workouts.
    preferred_categories.sort(
        key=lambda category: category_counts[category]
    )

    suggestions = []

    for category in preferred_categories:
        category_exercises = [
            exercise for exercise in exercise_library
            if exercise.category == category
        ]

        for exercise in category_exercises:
            suggestions.append({
                "exercise_id": exercise.id,
                "name": exercise.name,
                "category": exercise.category,
                "description": exercise.description,
                "duration": exercise.duration,
                "reason": (
                    f"Recommended for your {goal_focus} focus "
                    f"and to balance your recent workout routine."
                )
            })

            if len(suggestions) == 5:
                break

        if len(suggestions) == 5:
            break

    return {
        "goal_focus": goal_focus,
        "workouts_this_week": len(workouts),
        "category_breakdown": category_counts,
        "suggestions": suggestions,
        "message": (
            "Personalized workout suggestions generated "
            "from your goals and recent activity."
        )
    }

