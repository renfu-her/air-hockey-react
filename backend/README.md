# Air Hockey Leaderboard Backend

FastAPI backend for Air Hockey game leaderboard.

## 功能 / Features

- 獲取排行榜 / Get leaderboard
- 提交比賽記錄 / Submit match records
- SQLite 數據庫存儲 / SQLite database storage

## 安裝 / Installation

使用 `uv` 進行依賴管理：

```bash
# 安裝 uv (如果還沒安裝)
# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# 進入 backend 目錄
cd backend

# 使用 uv 同步依賴（會自動創建虛擬環境）
uv sync

# 如果使用 Python 3.14，需要設置環境變數來構建 pydantic-core
# Windows (PowerShell)
$env:PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1; uv sync
# Linux/macOS
PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1 uv sync

# 或者手動創建虛擬環境並安裝
uv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uv pip install -e .
```

### Python 版本要求

- **要求**: Python 3.12 或更高版本
- **推薦**: Python 3.12 或 3.13

## 運行 / Run

```bash
# 使用 uv 運行（推薦）
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 或者使用啟動腳本
# Linux/macOS
./run.sh

# Windows
run.bat

# 或者激活虛擬環境後運行
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 生產模式
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

API 文檔將在以下地址可用：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### GET /api/leaderboard
獲取排行榜記錄

**查詢參數:**
- `limit` (可選): 返回記錄數量，默認 50

**響應:**
```json
{
  "records": [
    {
      "id": "1234567890",
      "player_name": "Player1",
      "player_score": 3,
      "ai_score": 1,
      "winner": "PLAYER",
      "date": 1234567890000
    }
  ]
}
```

### POST /api/matches
提交新的比賽記錄

**請求體:**
```json
{
  "player_name": "Player1",
  "player_score": 3,
  "ai_score": 1,
  "winner": "PLAYER",
  "date": 1234567890000
}
```

**響應:**
```json
{
  "id": "1234567890",
  "player_name": "Player1",
  "player_score": 3,
  "ai_score": 1,
  "winner": "PLAYER",
  "date": 1234567890000
}
```

## 數據庫 / Database

使用 MySQL 數據庫。

### 配置環境變數

在 `backend` 目錄下創建 `.env` 文件：

```env
# MySQL 數據庫配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=air-hockey
```

### 數據庫設置

1. 確保 MySQL 服務正在運行
2. 創建數據庫（如果不存在）：
   ```sql
   CREATE DATABASE IF NOT EXISTS `air-hockey` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. 數據庫表會在首次運行時自動創建

### 數據庫遷移

如果數據庫表已經存在，需要修改表結構（例如將 id 從 String 改為 Integer），可以使用遷移腳本：

#### 選項 1：刪除舊表並重新創建（會丟失所有數據）
```bash
cd backend
python migrate_id_to_integer.py
```

#### 選項 2：保留現有數據（推薦）
```bash
cd backend
python migrate_preserve_data.py
```

**注意：**
- 遷移前請務必備份數據庫
- 如果表不存在，遷移腳本會自動創建新表
- 保留數據的版本會嘗試恢復現有記錄，但 id 會重新自動生成

