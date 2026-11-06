from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.streak import Streak
from app.models.workout import Workout
from app.models.user import User
from app.schemas.streak import StreakResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/streaks", tags=["Streak Tracking"])


@router.get("/me", response_model=StreakResponse)
def get_my_streak(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    streak = db.query(Streak).filter(
        Streak.user_id == current_user.id
    ).first()

    if not streak:
        streak = Streak(
            user_id=current_user.id,
            current_streak=0,
            longest_streak=0
        )
        db.add(streak)
        db.commit()
        db.refresh(streak)

    workout_dates = [
        row[0]
        for row in db.query(Workout.workout_date)
        .filter(
            Workout.user_id == current_user.id,
            Workout.workout_date <= date.today()
        )
        .distinct()
        .order_by(Workout.workout_date.desc())
        .all()
    ]

    if not workout_dates:
        streak.current_streak = 0
        streak.longest_streak = 0
        streak.last_workout_date = None
    else:
        longest = 1
        count = 1

        for index in range(1, len(workout_dates)):
            if workout_dates[index - 1] - workout_dates[index] == timedelta(days=1):
                count += 1
                longest = max(longest, count)
            else:
                count = 1

        streak.longest_streak = max(streak.longest_streak, longest)
        streak.last_workout_date = workout_dates[0]

        if workout_dates[0] >= date.today() - timedelta(days=1):
            current = 1

            for index in range(1, len(workout_dates)):
                if workout_dates[index - 1] - workout_dates[index] == timedelta(days=1):
                    current += 1
                else:
                    break

            streak.current_streak = current
        else:
            streak.current_streak = 0

    db.commit()
    db.refresh(streak)

    return streak