from sqlalchemy import Column, String, Integer, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
import enum
from app.models import Base


class WinnerEnum(str, enum.Enum):
    PLAYER = "PLAYER"
    AI = "AI"


class MatchRecord(Base):
    __tablename__ = "match_records"

    id = Column(String, primary_key=True, index=True)
    player_name = Column(String, nullable=False, index=True)
    player_score = Column(Integer, nullable=False)
    ai_score = Column(Integer, nullable=False)
    winner = Column(SQLEnum(WinnerEnum), nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

