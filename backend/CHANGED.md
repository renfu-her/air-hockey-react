# 變更記錄 / Change Log

## 2025-12-06 10:30:45

### 建立 FastAPI Backend / Created FastAPI Backend

1. **專案結構 / Project Structure**
   - 使用標準 FastAPI 專案結構：`app/models/`, `app/routers/`, `app/schemas/`, `app/core/`
   - 使用 `uv` 進行依賴管理
   - 配置 MySQL 數據庫連接

2. **數據庫配置 / Database Configuration**
   - 從 SQLite 遷移到 MySQL
   - 使用環境變數配置（`.env` 文件）
   - 數據庫配置：
     - Host: localhost
     - Port: 3306
     - User: root
     - Password: (空)
     - Database: air-hockey

3. **API Endpoints**
   - `GET /api/leaderboard` - 獲取排行榜
   - `POST /api/matches` - 提交比賽記錄
   - `GET /health` - 健康檢查
   - `GET /` - API 信息

### 建立的檔案 / Created Files

- `app/models/` - 數據庫模型
  - `__init__.py` - Base 和模型導出
  - `match.py` - MatchRecord 模型
- `app/schemas/` - Pydantic 模型
  - `__init__.py` - Schema 導出
  - `match.py` - MatchRecord schemas
- `app/core/` - 核心配置
  - `__init__.py`
  - `config.py` - 應用配置（從環境變數讀取）
  - `database.py` - 數據庫連接
- `app/routers/` - API 路由
  - `__init__.py`
  - `leaderboard.py` - 排行榜路由
- `app/main.py` - FastAPI 應用主文件
- `main.py` - 啟動文件
- `.env` - 環境變數配置
- `.env.example` - 環境變數範例
- `pyproject.toml` - 專案配置和依賴
- `requirements.txt` - 依賴列表（保留以備用）
- `README.md` - 文檔
- `run.sh` / `run.bat` - 啟動腳本

### 依賴 / Dependencies

- fastapi==0.115.0
- uvicorn[standard]==0.32.0
- sqlalchemy==2.0.36
- pydantic==2.9.2
- pydantic-settings==2.5.0
- python-multipart==0.0.12
- pymysql==1.1.1
- cryptography==43.0.0

