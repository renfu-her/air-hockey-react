from pydantic_settings import BaseSettings


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
    
    # CORS 配置
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    
    # API 配置
    API_V1_PREFIX: str = "/api"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

