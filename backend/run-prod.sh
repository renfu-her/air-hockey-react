#!/bin/bash
# 使用 gunicorn 運行生產服務器

# 設置 worker 數量（根據 CPU 核心數調整）
WORKERS=${WORKERS:-4}

# 使用 gunicorn + uvicorn workers
uv run gunicorn app.main:app \
    -w $WORKERS \
    -k uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -

