from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.workout import Workout
from app.models.user import User
from app.models.notification import Notification
from app.schemas.workout import WorkoutCreate, WorkoutUpdate, WorkoutResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/workouts", tags=["Workouts"])


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
    db.commit()
    db.refresh(workout)

    return workout


@router.get("/", response_model=list[WorkoutResponse])
def get_workouts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    today = date.today()

    today_workout = db.query(Workout).filter(
        Workout.user_id == current_user.id,
        Workout.workout_date == today
    ).first()

    existing_reminder = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.title == "Daily Workout Reminder",
        Notification.created_at >= today
    ).first()

    if not today_workout and not existing_reminder:
        db.add(Notification(
            user_id=current_user.id,
            title="Daily Workout Reminder",
            message="Stay active! Don't forget to record your workout today."
        ))
        db.commit()
        
    return (
        db.query(Workout)
        .filter(Workout.user_id == current_user.id)
        .order_by(Workout.workout_date.desc())
        .all()
    )


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

    db.commit()
    db.refresh(workout)

    return workout


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
    db.commit()

