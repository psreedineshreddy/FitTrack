from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    duration = Column(Integer, nullable=False)