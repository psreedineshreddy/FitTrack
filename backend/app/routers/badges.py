from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.badge import Badge
from app.models.user_badge import UserBadge
from app.models.user import User
from app.schemas.badge import BadgeResponse, UserBadgeResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/badges", tags=["Achievement Badges"])


@router.get("/", response_model=list[BadgeResponse])
def get_all_badges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Badge).order_by(Badge.id).all()


@router.get("/my", response_model=list[UserBadgeResponse])
def get_my_badges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(UserBadge)
        .options(joinedload(UserBadge.badge))
        .filter(UserBadge.user_id == current_user.id)
        .order_by(UserBadge.earned_at.desc())
        .all()
    )