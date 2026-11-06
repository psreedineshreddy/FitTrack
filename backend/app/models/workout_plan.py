from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    scheduled_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
