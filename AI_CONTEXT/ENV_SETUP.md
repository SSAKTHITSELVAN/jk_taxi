# Environment Setup

## Prerequisites
- Python 3.14.4
- Node.js v24.15.0
- npm 11.12.1
- Docker & Docker Compose
- PostgreSQL (via Docker)
- Redis (via Docker)

## Backend Setup

### 1. Create Virtual Environment
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Variables
Create `.env` file in `backend/` directory:
```env
# App Config
APP_NAME=JK Taxi API
DEBUG=True
API_VERSION=v1

# Database
DATABASE_URL=postgresql://jktaxi:jktaxi123@localhost:5432/jktaxi_db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Static OTP
STATIC_OTP=123456

# CORS
ALLOWED_ORIGINS=["http://localhost:3000","http://localhost:8081"]
```

### 4. Start Docker Services
```bash
docker-compose up -d
```

### 5. Run Database Migrations
```bash
cd backend
alembic upgrade head
```

### 6. Run FastAPI Server
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 7. Access API
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Docker Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### Restart Services
```bash
docker-compose restart
```

### Access PostgreSQL
```bash
docker exec -it jktaxi_postgres psql -U jktaxi -d jktaxi_db
```

### Access Redis
```bash
docker exec -it jktaxi_redis redis-cli
```

## Database Management

### Create New Migration
```bash
cd backend
alembic revision --autogenerate -m "description"
```

### Apply Migrations
```bash
alembic upgrade head
```

### Rollback Migration
```bash
alembic downgrade -1
```

### View Migration History
```bash
alembic history
```

## Testing API

### Using curl
```bash
# Health check
curl http://localhost:8000/health

# Register user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"1234567890","name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"1234567890","password":"password123"}'
```

### Using API Docs
Visit http://localhost:8000/docs for interactive Swagger UI

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

### Database Connection Error
- Check Docker containers: `docker-compose ps`
- Check logs: `docker-compose logs postgres`
- Verify DATABASE_URL in .env

### Redis Connection Error
- Check Redis container: `docker-compose ps redis`
- Check logs: `docker-compose logs redis`
- Verify REDIS_URL in .env

### Migration Error
```bash
# Reset database (CAUTION: deletes all data)
alembic downgrade base
alembic upgrade head
```
