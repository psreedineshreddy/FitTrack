
from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.workout import Workout
from app.models.user import User
from app.models.progress import Progress
from app.schemas.progress import ProgressResponse
from app.routers.auth import get_current_user


router = APIRouter(
    prefix="/api/progress",
    tags=["Progress Tracking"]
)


# -------------------- DAILY PROGRESS --------------------

@router.get("/daily", response_model=ProgressResponse)
def get_daily_progress(
    selected_date: date = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_date = selected_date or date.today()

    total_workouts, total_calories = db.query(
        func.count(Workout.id),
        func.coalesce(func.sum(Workout.calories_burned), 0)
    ).filter(
        Workout.user_id == current_user.id,
        Workout.workout_date == target_date
    ).first()

    progress = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.date == target_date
    ).first()

    if not progress:
        progress = Progress(
            user_id=current_user.id,
            date=target_date,
            total_workouts=total_workouts,
            total_calories=total_calories
        )
        db.add(progress)
    else:
        progress.total_workouts = total_workouts
        progress.total_calories = total_calories

    db.commit()
    db.refresh(progress)

    return progress


# -------------------- COMPARISON CALCULATIONS --------------------

def build_comparison(
    db,
    user_id,
    current_start,
    current_end,
    previous_start,
    previous_end,
    period
):
    workouts = db.query(Workout).filter(
        Workout.user_id == user_id,
        Workout.workout_date >= previous_start,
        Workout.workout_date <= current_end
    ).all()

    def get_summary(items):
        return {
            "total_workouts": len(items),
            "total_calories": sum(w.calories_burned for w in items),
            "total_duration": sum(w.duration for w in items)
        }

    current = [
        w for w in workouts
        if current_start <= w.workout_date <= current_end
    ]

    previous = [
        w for w in workouts
        if previous_start <= w.workout_date <= previous_end
    ]

    current_summary = get_summary(current)
    previous_summary = get_summary(previous)

    def percentage_change(current_value, previous_value):
        if previous_value == 0:
            return 100.0 if current_value > 0 else 0.0

        return round(
            ((current_value - previous_value) / previous_value) * 100,
            1
        )

    changes = {
        key: percentage_change(
            current_summary[key],
            previous_summary[key]
        )
        for key in current_summary
    }

    chart_data = []

    # -------------------- WEEKLY CHART --------------------

    if period == "weekly":
        labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

        for index, label in enumerate(labels):
            current_date = current_start + timedelta(days=index)
            previous_date = previous_start + timedelta(days=index)

            current_day = [
                w for w in current
                if w.workout_date == current_date
            ]

            previous_day = [
                w for w in previous
                if w.workout_date == previous_date
            ]

            chart_data.append({
                "label": label,
                "current_workouts": len(current_day),
                "previous_workouts": len(previous_day),
                "current_calories": sum(
                    w.calories_burned for w in current_day
                ),
                "previous_calories": sum(
                    w.calories_burned for w in previous_day
                ),
                "current_duration": sum(
                    w.duration for w in current_day
                ),
                "previous_duration": sum(
                    w.duration for w in previous_day
                )
            })

    # -------------------- MONTHLY CHART --------------------

    else:
        week_ranges = [
            (1, 7),
            (8, 14),
            (15, 21),
            (22, 28),
            (29, 31)
        ]

        previous_last_day = previous_end.day

        for week_number, (start_day, end_day) in enumerate(
            week_ranges, start=1
        ):
            current_items = [
                w for w in current
                if start_day <= w.workout_date.day <= end_day
            ]

            previous_items = [
                w for w in previous
                if start_day <= w.workout_date.day <= min(
                    end_day, previous_last_day
                )
            ]

            chart_data.append({
                "label": f"Week {week_number}",
                "current_workouts": len(current_items),
                "previous_workouts": len(previous_items),
                "current_calories": sum(
                    w.calories_burned for w in current_items
                ),
                "previous_calories": sum(
                    w.calories_burned for w in previous_items
                ),
                "current_duration": sum(
                    w.duration for w in current_items
                ),
                "previous_duration": sum(
                    w.duration for w in previous_items
                )
            })

    return {
        "period": period,
        "current_period": current_summary,
        "previous_period": previous_summary,
        "percentage_changes": changes,
        "chart_data": chart_data
    }


# -------------------- WEEKLY COMPARISON --------------------

@router.get("/weekly-comparison")
def get_weekly_comparison(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()

    current_start = today - timedelta(days=today.weekday())
    current_end = current_start + timedelta(days=6)

    previous_start = current_start - timedelta(days=7)
    previous_end = current_start - timedelta(days=1)

    return build_comparison(
        db,
        current_user.id,
        current_start,
        current_end,
        previous_start,
        previous_end,
        "weekly"
    )


# -------------------- MONTHLY COMPARISON --------------------

@router.get("/monthly-comparison")
def get_monthly_comparison(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()

    current_start = today.replace(day=1)

    if today.month == 12:
        next_month = date(today.year + 1, 1, 1)
    else:
        next_month = date(today.year, today.month + 1, 1)

    current_end = next_month - timedelta(days=1)

    previous_end = current_start - timedelta(days=1)
    previous_start = previous_end.replace(day=1)

    return build_comparison(
        db,
        current_user.id,
        current_start,
        current_end,
        previous_start,
        previous_end,
        "monthly"
    )
