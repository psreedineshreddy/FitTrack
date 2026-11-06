from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.workout_plan import WorkoutPlan
from app.schemas.workout_plan import WorkoutPlanCreate, WorkoutPlanResponse
from app.routers.auth import get_current_user

router = APIRouter(
    prefix="/api/workout-plans",
    tags=["Workout Plans"]
)


@router.post("/", response_model=WorkoutPlanResponse)
def create_workout_plan(
    plan_data: WorkoutPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = WorkoutPlan(
        user_id=current_user.id,
        title=plan_data.title,
        description=plan_data.description,
        scheduled_date=plan_data.scheduled_date
    )

    db.add(plan)
    db.commit()
    db.refresh(plan)

    return plan


@router.get("/", response_model=list[WorkoutPlanResponse])
def get_workout_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(WorkoutPlan).filter(
        WorkoutPlan.user_id == current_user.id
    ).order_by(WorkoutPlan.scheduled_date).all()


@router.get("/upcoming", response_model=list[WorkoutPlanResponse])
def get_upcoming_workouts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(WorkoutPlan).filter(
        WorkoutPlan.user_id == current_user.id,
        WorkoutPlan.scheduled_date >= date.today()
    ).order_by(WorkoutPlan.scheduled_date).all()
@router.put("/{plan_id}", response_model=WorkoutPlanResponse)
def update_workout_plan(
    plan_id: int,
    plan_data: WorkoutPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = db.query(WorkoutPlan).filter(
        WorkoutPlan.id == plan_id,
        WorkoutPlan.user_id == current_user.id
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Workout plan not found")

    plan.title = plan_data.title
    plan.description = plan_data.description
    plan.scheduled_date = plan_data.scheduled_date

    db.commit()
    db.refresh(plan)

    return plan


@router.delete("/{plan_id}")
def delete_workout_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = db.query(WorkoutPlan).filter(
        WorkoutPlan.id == plan_id,
        WorkoutPlan.user_id == current_user.id
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Workout plan not found")

    db.delete(plan)
    db.commit()

    return {"message": "Workout plan deleted successfully"}