from pydantic import BaseModel
from typing import Literal


class MatchRecordCreate(BaseModel):
    player_name: str
    player_score: int
    ai_score: int
    winner: Literal["PLAYER", "AI"]
    date: int  # Unix timestamp in milliseconds


class MatchRecordResponse(BaseModel):
    id: str
    player_name: str
    player_score: int
    ai_score: int
    winner: Literal["PLAYER", "AI"]
    date: int  # Unix timestamp in milliseconds

    class Config:
        from_attributes = True


class LeaderboardResponse(BaseModel):
    records: list[MatchRecordResponse]

