from datetime import date

from pydantic import BaseModel, ConfigDict


class StreakResponse(BaseModel):
    id: int
    user_id: int
    current_streak: int
    longest_streak: int
    last_workout_date: date | None

    model_config = ConfigDict(from_attributes=True)