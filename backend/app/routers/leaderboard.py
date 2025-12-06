from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas import MatchRecordCreate, MatchRecordResponse, LeaderboardResponse
from app.models import MatchRecord
from app.models.match import WinnerEnum
from sqlalchemy import desc
from datetime import datetime

router = APIRouter(prefix="/api", tags=["leaderboard"])


def create_match_record(db: Session, record: MatchRecordCreate) -> MatchRecord:
    """創建新的比賽記錄"""
    db_record = MatchRecord(
        # id 會自動生成，不需要手動設置
        player_name=record.player_name,
        player_score=record.player_score,
        ai_score=record.ai_score,
        winner=record.winner,
        date=datetime.fromtimestamp(record.date / 1000)  # 轉換毫秒為秒
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record


def get_leaderboard(db: Session, limit: int = 50) -> list[MatchRecord]:
    """獲取排行榜，按日期降序排列"""
    return db.query(MatchRecord).order_by(desc(MatchRecord.date)).limit(limit).all()


def to_response(record: MatchRecord) -> MatchRecordResponse:
    """將數據庫模型轉換為響應模型"""
    return MatchRecordResponse(
        id=record.id,
        player_name=record.player_name,
        player_score=record.player_score,
        ai_score=record.ai_score,
        winner=record.winner,
        date=int(record.date.timestamp() * 1000)  # 轉換為毫秒時間戳
    )


@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard_api(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    獲取排行榜
    
    - **limit**: 返回的記錄數量（默認 50）
    """
    records = get_leaderboard(db, limit=limit)
    return LeaderboardResponse(
        records=[to_response(record) for record in records]
    )


@router.post("/matches", response_model=MatchRecordResponse, status_code=201)
async def create_match(
    record: MatchRecordCreate,
    db: Session = Depends(get_db)
):
    """
    提交新的比賽記錄
    
    - **player_name**: 玩家名稱
    - **player_score**: 玩家分數
    - **ai_score**: AI 分數
    - **winner**: 獲勝者 ("PLAYER" 或 "AI")
    - **date**: Unix 時間戳（毫秒）
    """
    try:
        db_record = create_match_record(db, record)
        return to_response(db_record)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"創建記錄失敗: {str(e)}")

