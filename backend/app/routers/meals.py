from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.meal import Meal
from app.schemas.meal import MealCreate, MealResponse
from app.routers.auth import get_current_user


router = APIRouter(
    prefix="/api/meals",
    tags=["Nutrition & Meals"]
)


@router.post("/", response_model=MealResponse, status_code=status.HTTP_201_CREATED)
def add_meal(
    meal_data: MealCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    meal = Meal(
        user_id=current_user.id,
        **meal_data.model_dump()
    )

    db.add(meal)
    db.commit()
    db.refresh(meal)

    return meal


@router.get("/", response_model=list[MealResponse])
def get_meals(
    selected_date: date | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Meal).filter(
        Meal.user_id == current_user.id
    )

    if selected_date:
        query = query.filter(
            func.date(Meal.created_at) == selected_date.isoformat()
        )

    return query.order_by(Meal.created_at.desc()).all()


@router.delete("/{meal_id}")
def delete_meal(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    meal = db.query(Meal).filter(
        Meal.id == meal_id,
        Meal.user_id == current_user.id
    ).first()

    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal not found"
        )

    db.delete(meal)
    db.commit()

    return {"message": "Meal deleted successfully"}


@router.get("/daily-summary")
def get_daily_nutrition_summary(
    selected_date: date | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    target_date = selected_date or date.today()

    summary = db.query(
        func.coalesce(func.sum(Meal.calories), 0).label("total_calories"),
        func.coalesce(func.sum(Meal.protein), 0).label("total_protein"),
        func.coalesce(func.sum(Meal.carbs), 0).label("total_carbs"),
        func.coalesce(func.sum(Meal.fats), 0).label("total_fats")
    ).filter(
        Meal.user_id == current_user.id,
        func.date(Meal.created_at) == target_date.isoformat()
    ).first()

    return {
        "date": target_date,
        "total_calories": summary.total_calories,
        "total_protein": summary.total_protein,
        "total_carbs": summary.total_carbs,
        "total_fats": summary.total_fats
    }

