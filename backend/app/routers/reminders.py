from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.reminder import Reminder
from app.models.notification import Notification
from app.routers.auth import get_current_user
from app.schemas.reminder import ReminderCreate, ReminderResponse

router = APIRouter(prefix="/api/reminders", tags=["Reminders"])


@router.post("/", response_model=ReminderResponse)
def create_reminder(
    reminder: ReminderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_reminder = Reminder(
        user_id=current_user.id,
        **reminder.model_dump()
    )
    db.add(new_reminder)
    db.commit()
    db.refresh(new_reminder)
    return new_reminder


@router.get("/", response_model=list[ReminderResponse])
def get_reminders(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Reminder).filter(
        Reminder.user_id == current_user.id
    ).order_by(Reminder.reminder_time).all()


@router.put("/{reminder_id}", response_model=ReminderResponse)
def update_reminder(
    reminder_id: int,
    reminder: ReminderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    existing = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == current_user.id
    ).first()

    if not existing:
        raise HTTPException(status_code=404, detail="Reminder not found")

    for key, value in reminder.model_dump().items():
        setattr(existing, key, value)

    db.commit()
    db.refresh(existing)
    return existing


@router.delete("/{reminder_id}")
def delete_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    existing = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == current_user.id
    ).first()

    if not existing:
        raise HTTPException(status_code=404, detail="Reminder not found")

    db.delete(existing)
    db.commit()
    return {"message": "Reminder deleted successfully"}


@router.post("/check-due")
def check_due_reminders(
    current_time: str,
    weekday: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    from datetime import timedelta

    try:
        now = datetime.strptime(current_time, "%H:%M").time()
    except ValueError:
        raise HTTPException(status_code=400, detail="Use HH:MM time format")

    today = date.today()
    minute_start = now.replace(second=0, microsecond=0)
    minute_end = (
        datetime.combine(today, minute_start) + timedelta(minutes=1)
    ).time()

    reminders = db.query(Reminder).filter(
        Reminder.user_id == current_user.id,
        Reminder.is_enabled == True,
        Reminder.reminder_time >= minute_start,
        Reminder.reminder_time < minute_end
    ).all()

    due_reminders = []

    for reminder in reminders:
        schedule = reminder.repeat_days.lower()
        day = weekday.lower()

        should_run = (
            schedule == "every day"
            or (
                schedule == "weekdays"
                and day in ["monday", "tuesday", "wednesday", "thursday", "friday"]
            )
            or (
                schedule == "weekends"
                and day in ["saturday", "sunday"]
            )
        )

        if not should_run:
            continue

        title = f"Reminder: {reminder.title}"
        message = (
            f"It's time for your {reminder.reminder_type.lower()} reminder."
        )

        existing = db.query(Notification).filter(
            Notification.user_id == current_user.id,
            Notification.title == title,
            Notification.message == message
        ).all()

        already_notified = any(
            item.created_at and item.created_at.date() == today
            for item in existing
        )

        if not already_notified:
            db.add(Notification(
                user_id=current_user.id,
                title=title,
                message=message
            ))

        due_reminders.append({
            "id": reminder.id,
            "title": reminder.title,
            "reminder_type": reminder.reminder_type,
            "reminder_time": reminder.reminder_time.strftime("%H:%M")
        })

    db.commit()

    return {"due_reminders": due_reminders}
