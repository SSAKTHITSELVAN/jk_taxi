# Deployment Guide — JK Taxi Backend

**Last Updated:** 2026-06-15  
**Status:** ✅ LIVE on EC2

---

## Production Server

| Item | Value |
|------|-------|
| **Public IP** | 3.7.46.116 |
| **API URL** | http://3.7.46.116/ |
| **Swagger Docs** | http://3.7.46.116/docs |
| **Health Check** | http://3.7.46.116/health |
| **Instance** | AWS EC2 (Ubuntu 26.04 LTS) |
| **Region** | ap-south-1 (Mumbai) |
| **Python** | 3.14.4 |

---

## Architecture on Server

```
Client Request → Nginx (port 80) → Uvicorn (port 8000) → FastAPI App → RDS PostgreSQL
```

---

## Server Access

```bash
ssh -i ~/Downloads/jk_taxi_server.pem ubuntu@3.7.46.116
```

---

## Service Management

```bash
# Check status
sudo systemctl status jktaxi

# Restart backend
sudo systemctl restart jktaxi

# View logs (live)
sudo journalctl -u jktaxi -f

# View last 50 log lines
sudo journalctl -u jktaxi --no-pager -n 50

# Stop
sudo systemctl stop jktaxi

# Start
sudo systemctl start jktaxi
```

---

## File Locations on EC2

```
/home/ubuntu/jk_taxi/                  # Project root (cloned from GitHub)
/home/ubuntu/jk_taxi/.env              # Environment variables (not in git)
/home/ubuntu/jk_taxi/venv/             # Python virtual environment
/home/ubuntu/jk_taxi/backend/          # FastAPI backend code
/etc/systemd/system/jktaxi.service     # Systemd service file
/etc/nginx/sites-available/jktaxi      # Nginx config
```

---

## Environment Variables (.env on server)

```env
APP_NAME=JK Taxi API
DEBUG=False
API_VERSION=v1
DATABASE_URL=postgresql://postgres:bizzap123@bizzapdb.c3iya6wc0708.ap-south-1.rds.amazonaws.com:5432/jktaxi
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=jktaxi-super-secret-key-change-in-production-2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
STATIC_OTP=123456
ALLOWED_ORIGINS=["*"]
```

---

## Database

- **Type:** AWS RDS PostgreSQL
- **Host:** bizzapdb.c3iya6wc0708.ap-south-1.rds.amazonaws.com
- **Port:** 5432
- **Database:** jktaxi
- **User:** postgres
- **Note:** RDS is in a different AWS account. EC2 public IP (3.7.46.116) must be whitelisted in RDS security group on port 5432.

---

## Deployment Steps (How to Update)

### Quick Update (after git push)

```bash
ssh -i ~/Downloads/jk_taxi_server.pem ubuntu@3.7.46.116
cd ~/jk_taxi
git pull
sudo systemctl restart jktaxi
```

### Full Redeployment

```bash
ssh -i ~/Downloads/jk_taxi_server.pem ubuntu@3.7.46.116
cd ~
rm -rf jk_taxi
git clone https://github.com/SSAKTHITSELVAN/jk_taxi.git
cd jk_taxi
python3 -m venv venv
source venv/bin/activate
pip install pydantic greenlet
pip install fastapi uvicorn[standard] sqlalchemy alembic asyncpg redis python-jose[cryptography] passlib[bcrypt] python-multipart pydantic-settings python-dotenv email-validator psycopg2-binary
# Recreate .env (see above)
cd backend && alembic upgrade head
sudo systemctl restart jktaxi
```

---

## Security Group Rules (EC2)

| Type | Port | Source |
|------|------|--------|
| SSH | 22 | 0.0.0.0/0 |
| HTTP | 80 | 0.0.0.0/0 |
| HTTPS | 443 | 0.0.0.0/0 |
| Custom TCP | 8000 | 0.0.0.0/0 |

---

## Nginx Config

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Systemd Service

```ini
[Unit]
Description=JK Taxi FastAPI Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/jk_taxi/backend
Environment="PATH=/home/ubuntu/jk_taxi/venv/bin"
EnvironmentFile=/home/ubuntu/jk_taxi/.env
ExecStart=/home/ubuntu/jk_taxi/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

---

## GitHub Repository

- **URL:** git@github.com:SSAKTHITSELVAN/jk_taxi.git
- **Public:** https://github.com/SSAKTHITSELVAN/jk_taxi
- **Branch:** main
- **.env is gitignored** — must be created manually on server

---

## Python 3.14 Notes

Ubuntu 26.04 ships Python 3.14. The pinned versions in `requirements.txt` (pydantic 2.10.3, greenlet 3.1.1) don't have pre-built wheels for 3.14. On the server we install latest compatible versions instead:
- pydantic 2.13+ (has cp314 wheels)
- greenlet 3.5+ (has cp314 wheels)

---

## Troubleshooting

### Service won't start
```bash
sudo journalctl -u jktaxi --no-pager -n 50
```

### Can't connect to RDS
- Check RDS security group allows EC2 IP (3.7.46.116) on port 5432
- Test: `psql -h bizzapdb.c3iya6wc0708.ap-south-1.rds.amazonaws.com -U postgres -d jktaxi`

### Port 80 not reachable
- Check EC2 security group has HTTP (80) inbound rule
- Check nginx: `sudo systemctl status nginx`

### After code changes
```bash
cd ~/jk_taxi && git pull && sudo systemctl restart jktaxi
```
