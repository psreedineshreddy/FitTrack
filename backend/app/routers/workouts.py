
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.workout import Workout
from app.models.streak import Streak
from app.models.user import User
from app.models.notification import Notification
from app.schemas.workout import WorkoutCreate, WorkoutUpdate, WorkoutResponse
from app.routers.auth import get_current_user
from app.services.badge_service import award_badges

router = APIRouter(prefix="/api/workouts", tags=["Workouts"])


def update_user_streak(db: Session, user_id: int):
    streak = db.query(Streak).filter(
        Streak.user_id == user_id
    ).first()

    if not streak:
        streak = Streak(user_id=user_id)
        db.add(streak)
        db.flush()

    workout_dates = [
        row[0]
        for row in db.query(Workout.workout_date)
        .filter(
            Workout.user_id == user_id,
            Workout.workout_date <= date.today()
        )
        .distinct()
        .order_by(Workout.workout_date.desc())
        .all()
    ]

    if not workout_dates:
        streak.current_streak = 0
        streak.last_workout_date = None
        return

    longest = 1
    current_count = 1

    for index in range(1, len(workout_dates)):
        if workout_dates[index - 1] - workout_dates[index] == timedelta(days=1):
            current_count += 1
            longest = max(longest, current_count)
        else:
            current_count = 1

    streak.longest_streak = max(streak.longest_streak, longest)
    streak.last_workout_date = workout_dates[0]

    if workout_dates[0] >= date.today() - timedelta(days=1):
        current_streak = 1

        for index in range(1, len(workout_dates)):
            if workout_dates[index - 1] - workout_dates[index] == timedelta(days=1):
                current_streak += 1
            else:
                break

        streak.current_streak = current_streak
    else:
        streak.current_streak = 0


# Get all workouts belonging to the logged-in user
@router.get("/", response_model=list[WorkoutResponse])
def get_workouts(
    search: str | None = None,
    category: str | None = None,
    workout_date: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Workout).filter(
        Workout.user_id == current_user.id
    )

    if search:
        query = query.filter(
            Workout.workout_name.ilike(f"%{search}%")
        )

    if category:
        query = query.filter(
            Workout.category == category
        )

    if workout_date:
        query = query.filter(
            Workout.workout_date == workout_date
        )

    return query.order_by(Workout.workout_date.desc()).all()


# Create workout
@router.post("/", response_model=WorkoutResponse, status_code=status.HTTP_201_CREATED)
def create_workout(
    workout_data: WorkoutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workout = Workout(
        **workout_data.model_dump(),
        user_id=current_user.id
    )

    db.add(workout)
    db.flush()

    update_user_streak(db, current_user.id)
    award_badges(db, current_user.id)

    db.commit()
    db.refresh(workout)

    return workout


# Update workout
@router.put("/{workout_id}", response_model=WorkoutResponse)
def update_workout(
    workout_id: int,
    workout_data: WorkoutUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workout = db.query(Workout).filter(
        Workout.id == workout_id,
        Workout.user_id == current_user.id
    ).first()

    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")

    updates = workout_data.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(workout, field, value)

    db.flush()
    update_user_streak(db, current_user.id)

    award_badges(db, current_user.id)

    db.commit()
    db.refresh(workout)

    return workout


# Delete workout
@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workout = db.query(Workout).filter(
        Workout.id == workout_id,
        Workout.user_id == current_user.id
    ).first()

    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")

    db.delete(workout)
    db.flush()

    update_user_streak(db, current_user.id)

    db.commit()
