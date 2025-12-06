from pydantic_settings import BaseSettings
from typing import Union
import json


class Settings(BaseSettings):
    # MySQL 數據庫配置
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "air-hockey"
    
    @property
    def DATABASE_URL(self) -> str:
        """構建 MySQL 連接字符串"""
        if self.DB_PASSWORD:
            return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        else:
            # 空密碼時使用 user:@host 格式
            return f"mysql+pymysql://{self.DB_USER}:@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    # CORS 配置 - 支持逗号分隔的字符串或 JSON 数组
    CORS_ORIGINS: Union[str, list[str]] = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
    
    @property
    def cors_origins_list(self) -> list[str]:
        """將 CORS_ORIGINS 轉換為列表"""
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        # 如果是字符串，嘗試解析為 JSON，否則按逗號分割
        try:
            return json.loads(self.CORS_ORIGINS)
        except (json.JSONDecodeError, TypeError):
            # 按逗號分割並去除空白
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
    
    # API 配置
    API_V1_PREFIX: str = "/api"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

