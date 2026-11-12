from datetime import time, datetime
from pydantic import BaseModel, ConfigDict


class ReminderCreate(BaseModel):
    reminder_type: str
    title: str
    reminder_time: time
    repeat_days: str = "Every day"
    is_enabled: bool = True


class ReminderResponse(BaseModel):
    id: int
    user_id: int
    reminder_type: str
    title: str
    reminder_time: time
    repeat_days: str
    is_enabled: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
