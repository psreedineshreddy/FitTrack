from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    goal_type = Column(String, nullable=False)
    target_value = Column(Float, nullable=False)
    current_value = Column(Float, default=0, nullable=False)

    deadline = Column(Date, nullable=False)
    status = Column(String, default="ACTIVE", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
