from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import init_db
from app.core.config import settings
from app.routers import leaderboard

# 初始化數據庫
init_db()

app = FastAPI(
    title="Air Hockey Leaderboard API",
    description="排行榜 API for Air Hockey Game",
    version="1.0.0"
)

# 配置 CORS - 允許前端連接
print(f"CORS allowed origins: {settings.cors_origins_list}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# 註冊路由
app.include_router(leaderboard.router)


@app.get("/")
async def root():
    """根路徑，返回 API 信息"""
    return {
        "message": "Air Hockey Leaderboard API",
        "version": "1.0.0",
        "endpoints": {
            "GET /api/leaderboard": "獲取排行榜",
            "POST /api/matches": "提交比賽記錄"
        }
    }


@app.get("/health")
async def health_check():
    """健康檢查端點"""
    return {"status": "healthy"}
