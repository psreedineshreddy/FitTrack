from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class GoalCreate(BaseModel):
    goal_type: Literal["Weight Loss", "Muscle Gain", "Steps"]
    target_value: float = Field(gt=0)
    current_value: float = Field(default=0, ge=0)
    deadline: date


class GoalUpdate(BaseModel):
    target_value: float | None = Field(default=None, gt=0)
    current_value: float | None = Field(default=None, ge=0)
    deadline: date | None = None


class GoalResponse(BaseModel):
    id: int
    user_id: int
    goal_type: str
    target_value: float
    current_value: float
    deadline: date
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
