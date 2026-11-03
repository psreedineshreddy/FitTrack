from sqlalchemy import Column, Integer, Date, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func

from app.database import Base


class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_workouts = Column(Integer, default=0, nullable=False)
    total_calories = Column(Integer, default=0, nullable=False)
    date = Column(Date, nullable=False, server_default=func.current_date())

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "date",
            name="unique_user_progress_date"
        ),
    )
