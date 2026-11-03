from datetime import date, timedelta
import calendar

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.workout import Workout
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/reports", tags=["Reports & Analytics"])


@router.get("/weekly")
def weekly_report(
    selected_date: date = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_date = selected_date or date.today()
    start_date = target_date - timedelta(days=target_date.weekday())
    end_date = start_date + timedelta(days=6)

    workouts = db.query(Workout).filter(
        Workout.user_id == current_user.id,
        Workout.workout_date >= start_date,
        Workout.workout_date <= end_date
    ).order_by(Workout.workout_date).all()

    return {
        "period": "Weekly",
        "start_date": start_date,
        "end_date": end_date,
        "total_workouts": len(workouts),
        "total_calories": sum(w.calories_burned for w in workouts),
        "total_duration": sum(w.duration for w in workouts),
        "workouts": [
            {
                "date": w.workout_date,
                "workout_name": w.workout_name,
                "category": w.category,
                "duration": w.duration,
                "calories_burned": w.calories_burned
            }
            for w in workouts
        ]
    }


@router.get("/monthly")
def monthly_report(
    selected_month: date = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_date = selected_month or date.today()
    start_date = target_date.replace(day=1)
    last_day = calendar.monthrange(target_date.year, target_date.month)[1]
    end_date = target_date.replace(day=last_day)

    workouts = db.query(Workout).filter(
        Workout.user_id == current_user.id,
        Workout.workout_date >= start_date,
        Workout.workout_date <= end_date
    ).order_by(Workout.workout_date).all()

    daily_summary = db.query(
        Workout.workout_date,
        func.count(Workout.id).label("total_workouts"),
        func.coalesce(func.sum(Workout.calories_burned), 0).label("total_calories")
    ).filter(
        Workout.user_id == current_user.id,
        Workout.workout_date >= start_date,
        Workout.workout_date <= end_date
    ).group_by(
        Workout.workout_date
    ).order_by(
        Workout.workout_date
    ).all()

    return {
        "period": "Monthly",
        "start_date": start_date,
        "end_date": end_date,
        "total_workouts": len(workouts),
        "total_calories": sum(w.calories_burned for w in workouts),
        "total_duration": sum(w.duration for w in workouts),
        "daily_summary": [
            {
                "date": item.workout_date,
                "total_workouts": item.total_workouts,
                "total_calories": item.total_calories
            }
            for item in daily_summary
        ]
    }
