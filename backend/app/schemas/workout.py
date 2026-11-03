
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field, ConfigDict


class WorkoutCreate(BaseModel):
    workout_name: str = Field(min_length=2, max_length=100)
    category: Literal["Cardio", "Strength", "Yoga"]
    duration: int = Field(gt=0, le=1440)
    calories_burned: int = Field(ge=0)
    workout_date: date


class WorkoutUpdate(BaseModel):
    workout_name: str | None = Field(default=None, min_length=2, max_length=100)
    category: Literal["Cardio", "Strength", "Yoga"] | None = None
    duration: int | None = Field(default=None, gt=0, le=1440)
    calories_burned: int | None = Field(default=None, ge=0)
    workout_date: date | None = None


class WorkoutResponse(BaseModel):
    id: int
    user_id: int
    workout_name: str
    category: str
    duration: int
    calories_burned: int
    workout_date: date
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

