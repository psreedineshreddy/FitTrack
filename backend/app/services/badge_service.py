from sqlalchemy.orm import Session

from app.models.badge import Badge
from app.models.user_badge import UserBadge
from app.models.workout import Workout
from app.models.streak import Streak


DEFAULT_BADGES = [
    {
        "name": "First Workout",
        "description": "Complete your first workout.",
        "icon": "Dumbbell",
    },
    {
        "name": "Fitness Enthusiast",
        "description": "Complete 10 workouts.",
        "icon": "Award",
    },
    {
        "name": "Fitness Champion",
        "description": "Complete 25 workouts.",
        "icon": "Trophy",
    },
    {
        "name": "Week Warrior",
        "description": "Achieve a 7-day workout streak.",
        "icon": "Flame",
    },
    {
        "name": "Consistency Master",
        "description": "Achieve a 30-day workout streak.",
        "icon": "Crown",
    },
    {
        "name": "Goal Setter",
        "description": "Create your first fitness goal.",
        "icon": "Target",
    },
]


def ensure_default_badges(db: Session):
    for badge_data in DEFAULT_BADGES:
        existing = db.query(Badge).filter(
            Badge.name == badge_data["name"]
        ).first()

        if not existing:
            db.add(Badge(**badge_data))

    db.flush()


def award_badges(db: Session, user_id: int):
    ensure_default_badges(db)

    workout_count = db.query(Workout).filter(
        Workout.user_id == user_id
    ).count()

    streak = db.query(Streak).filter(
        Streak.user_id == user_id
    ).first()

    earned_names = set(
        name for (name,) in db.query(Badge.name)
        .join(UserBadge, UserBadge.badge_id == Badge.id)
        .filter(UserBadge.user_id == user_id)
        .all()
    )

    eligible_badges = []

    if workout_count >= 1:
        eligible_badges.append("First Workout")

    if workout_count >= 10:
        eligible_badges.append("Fitness Enthusiast")

    if workout_count >= 25:
        eligible_badges.append("Fitness Champion")

    if streak and streak.longest_streak >= 7:
        eligible_badges.append("Week Warrior")

    if streak and streak.longest_streak >= 30:
        eligible_badges.append("Consistency Master")

    for name in eligible_badges:
        if name not in earned_names:
            badge = db.query(Badge).filter(
                Badge.name == name
            ).first()

            if badge:
                db.add(UserBadge(
                    user_id=user_id,
                    badge_id=badge.id
                ))

    db.flush()
