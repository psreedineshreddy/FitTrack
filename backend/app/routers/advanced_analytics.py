
from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.auth import get_current_user
from app.models.workout import Workout
from app.models.goal import Goal

router = APIRouter(
    prefix="/api/advanced-analytics",
    tags=["Advanced Analytics"]
)


def get_month_start(month_offset=0):
    today = date.today()
    month_index = today.month - 1 - month_offset
    year = today.year + month_index // 12
    month = month_index % 12 + 1
    return date(year, month, 1)


@router.get("/")
def get_advanced_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    today = date.today()
    weekly_start = today - timedelta(days=6)
    consistency_start = today - timedelta(days=29)
    monthly_start = get_month_start(5)

    workouts = (
        db.query(Workout)
        .filter(
            Workout.user_id == current_user.id,
            Workout.workout_date >= monthly_start,
            Workout.workout_date <= today
        )
        .all()
    )

    goals = (
        db.query(Goal)
        .filter(Goal.user_id == current_user.id)
        .all()
    )

    # Weekly performance: last 7 days
    weekly_trend = []

    for offset in range(6, -1, -1):
        selected_date = today - timedelta(days=offset)
        daily_workouts = [
            workout for workout in workouts
            if workout.workout_date == selected_date
        ]

        weekly_trend.append({
            "date": selected_date.isoformat(),
            "workouts": len(daily_workouts),
            "calories": sum(w.calories_burned for w in daily_workouts),
            "duration": sum(w.duration for w in daily_workouts)
        })

    # Monthly performance: current month and previous 5 months
    monthly_trend = []

    for offset in range(5, -1, -1):
        month_start = get_month_start(offset)

        if offset == 0:
            next_month = today + timedelta(days=1)
        else:
            next_month = get_month_start(offset - 1)

        month_workouts = [
            workout for workout in workouts
            if month_start <= workout.workout_date < next_month
        ]

        monthly_trend.append({
            "month": month_start.strftime("%b %Y"),
            "workouts": len(month_workouts),
            "calories": sum(w.calories_burned for w in month_workouts),
            "duration": sum(w.duration for w in month_workouts)
        })

    # Goal completion rate
    total_goals = len(goals)
    completed_goals = sum(
        1 for goal in goals
        if goal.status.upper() == "COMPLETED"
    )

    goal_completion_rate = (
        round((completed_goals / total_goals) * 100, 1)
        if total_goals else 0
    )

    # Workout consistency over the last 30 days
    recent_workouts = [
        workout for workout in workouts
        if consistency_start <= workout.workout_date <= today
    ]

    active_days = len({
        workout.workout_date for workout in recent_workouts
    })

    consistency_rate = round((active_days / 30) * 100, 1)

    total_recent_workouts = len(recent_workouts)

    # Performance insights
    insights = []

    if active_days >= 20:
        insights.append("Excellent consistency! You have been active on many days this month.")
    elif active_days >= 10:
        insights.append("Good progress! Keep maintaining your workout routine.")
    elif active_days > 0:
        insights.append("Try to build a more consistent workout schedule.")
    else:
        insights.append("Start logging workouts to track your fitness consistency.")

    if goal_completion_rate == 100 and total_goals > 0:
        insights.append("Amazing! You have completed all your fitness goals.")
    elif goal_completion_rate > 0:
        insights.append("You have completed some of your fitness goals. Keep going!")
    elif total_goals > 0:
        insights.append("Keep working towards your active fitness goals.")
    else:
        insights.append("Create a fitness goal to start tracking your goal completion.")

    return {
        "weekly_trend": weekly_trend,
        "monthly_trend": monthly_trend,
        "goal_completion": {
            "total_goals": total_goals,
            "completed_goals": completed_goals,
            "completion_rate": goal_completion_rate
        },
        "consistency": {
            "period_days": 30,
            "active_days": active_days,
            "consistency_rate": consistency_rate,
            "total_workouts": total_recent_workouts
        },
        "insights": insights
    }

