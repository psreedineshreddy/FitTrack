
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.exercise import Exercise
from app.models.user import User
from app.schemas.exercise import ExerciseCreate, ExerciseResponse
from app.routers.auth import get_current_user

router = APIRouter(
    prefix="/api/exercises",
    tags=["Exercise Library"]
)


@router.post("/", response_model=ExerciseResponse)
def create_exercise(
    exercise: ExerciseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if exercise.category not in ["Cardio", "Strength", "Yoga"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid exercise category"
        )

    if exercise.duration <= 0:
        raise HTTPException(
            status_code=400,
            detail="Duration must be greater than zero"
        )

    new_exercise = Exercise(**exercise.model_dump())

    db.add(new_exercise)
    db.commit()
    db.refresh(new_exercise)

    return new_exercise


@router.get("/", response_model=list[ExerciseResponse])
def get_exercises(
    search: str | None = None,
    category: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Exercise)

    if search:
        query = query.filter(
            Exercise.name.ilike(f"%{search}%")
        )

    if category:
        if category not in ["Cardio", "Strength", "Yoga"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid exercise category"
            )

        query = query.filter(Exercise.category == category)

    return query.order_by(Exercise.name).all()


@router.delete("/{exercise_id}")
def delete_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exercise = db.query(Exercise).filter(
        Exercise.id == exercise_id
    ).first()

    if not exercise:
        raise HTTPException(
            status_code=404,
            detail="Exercise not found"
        )

    db.delete(exercise)
    db.commit()

    return {"message": "Exercise deleted successfully"}
