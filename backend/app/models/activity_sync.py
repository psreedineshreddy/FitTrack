
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class ActivitySync(Base):
    __tablename__ = "activity_sync"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    source = Column(String, nullable=False)
    activity_date = Column(Date, nullable=False)
    steps = Column(Integer, default=0)
    calories = Column(Integer, default=0)
    active_minutes = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

