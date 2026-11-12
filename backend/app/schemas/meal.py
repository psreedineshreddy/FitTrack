
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class MealCreate(BaseModel):
    meal_type: Literal["Breakfast", "Lunch", "Dinner", "Snacks"]
    food_name: str = Field(min_length=2, max_length=150)
    calories: float = Field(ge=0, le=10000)
    protein: float = Field(default=0, ge=0, le=1000)
    carbs: float = Field(default=0, ge=0, le=1000)
    fats: float = Field(default=0, ge=0, le=1000)


class MealResponse(BaseModel):
    id: int
    user_id: int
    meal_type: str
    food_name: str
    calories: float
    protein: float
    carbs: float
    fats: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

