from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    workout_name = Column(String(100), nullable=False)
    category = Column(String(30), nullable=False)
    duration = Column(Integer, nullable=False)
    calories_burned = Column(Integer, nullable=False)
    workout_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
