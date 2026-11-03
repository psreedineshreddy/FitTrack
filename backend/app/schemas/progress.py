from datetime import date

from pydantic import BaseModel, ConfigDict


class ProgressResponse(BaseModel):
    id: int
    user_id: int
    total_workouts: int
    total_calories: int
    date: date

    model_config = ConfigDict(from_attributes=True)
