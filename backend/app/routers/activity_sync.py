
from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.activity_sync import ActivitySync
from app.routers.auth import get_current_user
from app.schemas.activity_sync import ActivitySyncCreate, ActivitySyncResponse

router = APIRouter(
    prefix="/api/activity-sync",
    tags=["Activity Sync"]
)


@router.post("/", response_model=ActivitySyncResponse)
def create_activity_sync(
    activity: ActivitySyncCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_activity = ActivitySync(
        user_id=current_user.id,
        source=activity.source,
        activity_date=activity.activity_date,
        steps=activity.steps,
        calories=activity.calories,
        active_minutes=activity.active_minutes
    )

    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)

    return new_activity


@router.get("/", response_model=list[ActivitySyncResponse])
def get_activity_syncs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return (
        db.query(ActivitySync)
        .filter(ActivitySync.user_id == current_user.id)
        .order_by(ActivitySync.activity_date.desc())
        .all()
    )


@router.get("/daily-summary")
def get_daily_activity_summary(
    selected_date: date = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    target_date = selected_date or date.today()

    activities = (
        db.query(ActivitySync)
        .filter(
            ActivitySync.user_id == current_user.id,
            ActivitySync.activity_date == target_date
        )
        .all()
    )

    return {
        "date": target_date,
        "total_steps": sum(item.steps for item in activities),
        "total_calories": sum(item.calories for item in activities),
        "total_active_minutes": sum(item.active_minutes for item in activities),
        "sync_count": len(activities)
    }

