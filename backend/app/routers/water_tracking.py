from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.water_tracking import WaterTracking
from app.schemas.water_tracking import (
    WaterTrackingCreate,
    WaterTrackingResponse,
)
from app.routers.auth import get_current_user


router = APIRouter(
    prefix="/api/water",
    tags=["Water Tracking"]
)


@router.post(
    "/",
    response_model=WaterTrackingResponse,
    status_code=status.HTTP_201_CREATED
)
def add_water(
    water_data: WaterTrackingCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    water_entry = WaterTracking(
        user_id=current_user.id,
        quantity=water_data.quantity,
        date=date.today()
    )

    db.add(water_entry)
    db.commit()
    db.refresh(water_entry)

    return water_entry


@router.get("/", response_model=list[WaterTrackingResponse])
def get_water_entries(
    selected_date: date | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    target_date = selected_date or date.today()

    return db.query(WaterTracking).filter(
        WaterTracking.user_id == current_user.id,
        WaterTracking.date == target_date
    ).order_by(WaterTracking.created_at.desc()).all()


@router.get("/daily-summary")
def get_daily_water_summary(
    selected_date: date | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    target_date = selected_date or date.today()

    total = db.query(
        func.coalesce(func.sum(WaterTracking.quantity), 0)
    ).filter(
        WaterTracking.user_id == current_user.id,
        WaterTracking.date == target_date
    ).scalar()

    daily_goal = 2500

    return {
        "date": target_date,
        "total_intake": total,
        "daily_goal": daily_goal,
        "remaining": max(daily_goal - total, 0),
        "progress_percentage": min(round(total / daily_goal * 100, 1), 100)
    }


@router.delete("/{entry_id}")
def delete_water_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    entry = db.query(WaterTracking).filter(
        WaterTracking.id == entry_id,
        WaterTracking.user_id == current_user.id
    ).first()

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Water entry not found"
        )

    db.delete(entry)
    db.commit()

    return {"message": "Water entry deleted successfully"}
