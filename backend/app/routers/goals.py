
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.goal import Goal
from app.models.user import User
from app.models.notification import Notification
from app.schemas.goal import GoalCreate, GoalUpdate, GoalResponse
from app.routers.auth import get_current_user
from app.services.badge_service import ensure_default_badges
from app.models.badge import Badge
from app.models.user_badge import UserBadge

router = APIRouter(prefix="/api/goals", tags=["Goals"])


def update_goal_status(goal):
    if goal.current_value >= goal.target_value:
        goal.status = "COMPLETED"
    else:
        goal.status = "ACTIVE"


def award_goal_setter_badge(db: Session, user_id: int):
    ensure_default_badges(db)

    badge = db.query(Badge).filter(
        Badge.name == "Goal Setter"
    ).first()

    if badge:
        existing = db.query(UserBadge).filter(
            UserBadge.user_id == user_id,
            UserBadge.badge_id == badge.id
        ).first()

        if not existing:
            db.add(UserBadge(
                user_id=user_id,
                badge_id=badge.id
            ))


@router.post("/", response_model=GoalResponse)
def create_goal(
    goal_data: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = Goal(
        user_id=current_user.id,
        goal_type=goal_data.goal_type,
        target_value=goal_data.target_value,
        current_value=goal_data.current_value,
        deadline=goal_data.deadline
    )

    update_goal_status(goal)

    db.add(goal)
    db.flush()

    award_goal_setter_badge(db, current_user.id)

    if goal.status == "COMPLETED":
        db.add(Notification(
            user_id=current_user.id,
            title="Goal Completed",
            message=f"Congratulations! You completed your {goal.goal_type} goal."
        ))

    db.commit()
    db.refresh(goal)

    return goal


@router.get("/", response_model=list[GoalResponse])
def get_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Goal).filter(
        Goal.user_id == current_user.id
    ).order_by(Goal.created_at.desc()).all()


@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: int,
    goal_data: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    previous_status = goal.status

    update_data = goal_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(goal, key, value)

    update_goal_status(goal)

    if previous_status != "COMPLETED" and goal.status == "COMPLETED":
        db.add(Notification(
            user_id=current_user.id,
            title="Goal Completed",
            message=f"Congratulations! You completed your {goal.goal_type} goal."
        ))

    db.commit()
    db.refresh(goal)

    return goal
