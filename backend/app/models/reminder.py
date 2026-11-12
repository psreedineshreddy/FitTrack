
from sqlalchemy import Column, Integer, String, Boolean, Time, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    reminder_type = Column(String(30), nullable=False)
    title = Column(String(150), nullable=False)
    reminder_time = Column(Time, nullable=False)
    repeat_days = Column(String, default="Every day", nullable=False)
    is_enabled = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

