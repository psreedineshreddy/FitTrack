from datetime import date, datetime
from pydantic import BaseModel, ConfigDict


class WorkoutPlanCreate(BaseModel):
    title: str
    description: str | None = None
    scheduled_date: date


class WorkoutPlanResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str | None
    scheduled_date: date
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
