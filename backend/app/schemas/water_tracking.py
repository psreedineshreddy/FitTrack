from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class WaterTrackingCreate(BaseModel):
    quantity: int = Field(gt=0, le=10000)


class WaterTrackingResponse(BaseModel):
    id: int
    user_id: int
    quantity: int
    date: date
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
