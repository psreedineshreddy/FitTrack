from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=False)
    icon = Column(String(50), nullable=False)