@echo off
REM 使用 uv 運行開發服務器 (Windows)

uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

