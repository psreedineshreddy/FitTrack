
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field


class ActivitySyncCreate(BaseModel):
    source: str
    activity_date: date
    steps: int = Field(default=0, ge=0)
    calories: int = Field(default=0, ge=0)
    active_minutes: int = Field(default=0, ge=0)


class ActivitySyncResponse(BaseModel):
    id: int
    user_id: int
    source: str
    activity_date: date
    steps: int
    calories: int
    active_minutes: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

