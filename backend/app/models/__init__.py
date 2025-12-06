from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# 導入模型（在 Base 定義之後）
from app.models.match import MatchRecord, WinnerEnum

__all__ = ["Base", "MatchRecord", "WinnerEnum"]

