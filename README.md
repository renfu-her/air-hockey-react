# Air Hockey Game

A modern web-based air hockey game built with React + FastAPI full-stack architecture, featuring leaderboard functionality.

## 📖 Project Description

This is a complete air hockey game system consisting of:

- **Frontend**: Responsive web game built with React + TypeScript + Vite
- **Backend**: Leaderboard API service built with FastAPI + MySQL
- **Game Features**:
  - Smooth physics engine and collision detection
  - Smart AI opponent (dynamically adjusts between attack and defense modes)
  - Real-time leaderboard system
  - Mobile-first design, perfectly adapted for phones, tablets, and desktop devices
  - Neon-style visual effects

### Game Rules

- **Objective**: Hit the puck into the opponent's goal
- **Winning Condition**: First player to reach 3 goals wins
- **Controls**: 
  - Touch/Mouse drag to control the red paddle
  - Press `Alt + R` to return to main menu at any time
- **Start Game**: Enter player name, click "Start Game" and wait for 5-second countdown

## 🏗️ Project Structure

```
air-hockey/
├── frontend/          # React frontend application
│   ├── components/    # React components
│   ├── services/      # API services
│   └── ...
├── backend/           # FastAPI backend service
│   ├── app/
│   │   ├── models/    # Database models
│   │   ├── routers/   # API routes
│   │   ├── schemas/   # Pydantic models
│   │   └── core/      # Core configuration
│   └── ...
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and pnpm
- **Python** 3.12+ and uv
- **MySQL** 8.0+

### 1. Clone Repository

```bash
git clone <repository-url>
cd air-hockey
```

### 2. Backend Setup

```bash
cd backend

# Install uv (if not installed)
# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Sync dependencies
uv sync

# Create .env file
cat > .env << EOF
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=air-hockey
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://air-hockey.ai-tracks.com
EOF

# Create database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS \`air-hockey\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run backend (development mode)
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend API Documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Run in development mode
pnpm dev
```

Frontend will run at: http://localhost:3000

## 📦 Deployment

### Method 1: Traditional Server Deployment

#### Backend Deployment

1. **Prepare Server Environment**
   ```bash
   # Install Python 3.12+ and MySQL
   # Install uv
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

2. **Upload Code and Setup**
   ```bash
   cd backend
   uv sync
   
   # Configure .env file
   nano .env
   # Set database connection and CORS_ORIGINS (include frontend domain)
   ```

3. **Manage Service with systemd (Linux)**
   ```bash
   # Create service file
   sudo nano /etc/systemd/system/air-hockey-backend.service
   ```
   
   ```ini
   [Unit]
   Description=Air Hockey Backend API
   After=network.target mysql.service
   
   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/path/to/air-hockey/backend
   Environment="PATH=/path/to/air-hockey/backend/.venv/bin"
   ExecStart=/path/to/air-hockey/backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```
   
   ```bash
   # Start service
   sudo systemctl enable air-hockey-backend
   sudo systemctl start air-hockey-backend
   ```

4. **Use Nginx Reverse Proxy (Optional)**
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

#### Frontend Deployment

1. **Build Production Version**
   ```bash
   cd frontend
   pnpm build
   ```
   
   Build output is in `frontend/dist/` directory

2. **Deploy with Nginx**
   ```bash
   # Copy build output to Nginx directory
   sudo cp -r frontend/dist/* /var/www/air-hockey/
   ```
   
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/air-hockey;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # API proxy (if needed)
       location /api {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

3. **Configure Environment Variables (Optional)**
   
   In `frontend/.env.production`:
   ```env
   VITE_API_BASE_URL=https://api.yourdomain.com
   ```

### Method 2: Docker Deployment

#### Backend Dockerfile

Create `backend/Dockerfile`:
```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Start command
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Frontend Dockerfile

Create `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code and build
COPY . .
RUN pnpm build

# Production environment
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: air-hockey
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USER: root
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: air-hockey
      CORS_ORIGINS: ${CORS_ORIGINS}
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

Deploy:
```bash
docker-compose up -d
```

### Method 3: Cloud Platform Deployment

#### Vercel / Netlify (Frontend)

1. **Connect Git Repository**
2. **Build Settings**:
   - Build Command: `cd frontend && pnpm build`
   - Output Directory: `frontend/dist`
3. **Environment Variables**: Set `VITE_API_BASE_URL`

#### Railway / Render (Backend)

1. **Connect Git Repository**
2. **Set Environment Variables**:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `CORS_ORIGINS`
3. **Start Command**: `uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## 🔧 Configuration

### Backend Environment Variables

In `backend/.env` file:

```env
# Database configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=air-hockey

# CORS configuration (comma-separated or JSON array)
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Frontend Environment Variables

In `frontend/.env` file:

```env
# API base URL
VITE_API_BASE_URL=http://localhost:8000
```

## 📚 API Documentation

The backend provides complete API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Main API Endpoints

- `GET /api/leaderboard?limit=50` - Get leaderboard
- `POST /api/matches` - Submit match record
- `GET /health` - Health check

For detailed documentation, see [backend/README.md](./backend/README.md)

## 🛠️ Development

### Backend Development

```bash
cd backend
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

```bash
cd frontend
pnpm dev
```

## 📝 Database Migration

If you need to modify the database structure, use migration scripts:

```bash
cd backend
# Migrate with data preservation (recommended)
uv run python migrate_preserve_data.py

# Or drop and recreate table
uv run python migrate_id_to_integer.py
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `CORS_ORIGINS` in backend `.env` includes the frontend domain
2. **Database Connection Failed**: Check if MySQL service is running and `.env` configuration is correct
3. **Frontend Cannot Connect to Backend**: Check if `VITE_API_BASE_URL` environment variable is correct

## 📄 License

[Add license information as needed]

## 👥 Contributors

[Add contributor information as needed]
