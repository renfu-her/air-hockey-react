from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # 檢查連接是否有效
    echo=False  # 設置為 True 可以看到 SQL 查詢日誌
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """初始化數據庫，創建所有表"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """獲取數據庫會話"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

