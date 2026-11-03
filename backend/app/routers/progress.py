from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.workout import Workout
from app.models.user import User
from app.models.progress import Progress
from app.schemas.progress import ProgressResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/progress", tags=["Daily Progress"])


@router.get("/daily", response_model=ProgressResponse)
def get_daily_progress(
    selected_date: date = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_date = selected_date or date.today()

    total_workouts, total_calories = db.query(
        func.count(Workout.id),
        func.coalesce(func.sum(Workout.calories_burned), 0)
    ).filter(
        Workout.user_id == current_user.id,
        Workout.workout_date == target_date
    ).first()

    progress = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.date == target_date
    ).first()

    if not progress:
        progress = Progress(
            user_id=current_user.id,
            date=target_date,
            total_workouts=total_workouts,
            total_calories=total_calories
        )
        db.add(progress)
    else:
        progress.total_workouts = total_workouts
        progress.total_calories = total_calories

    db.commit()
    db.refresh(progress)

    return progress
