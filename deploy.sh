#!/bin/bash
# JK Taxi Backend Deployment Script for Ubuntu 26.04 EC2
# Run this ON the EC2 server after transferring the code

set -e

echo "=== JK Taxi Backend Deployment ==="

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and pip
sudo apt install -y python3 python3-pip python3-venv nginx

# Create app directory
mkdir -p ~/jk_taxi

# Create virtual environment
cd ~/jk_taxi
python3 -m venv venv
source venv/bin/activate

# Install dependencies
cd ~/jk_taxi/backend
pip install -r requirements.txt

# Run database migrations
cd ~/jk_taxi/backend
alembic upgrade head

echo "=== Dependencies installed ==="

# Create systemd service for auto-start and management
sudo tee /etc/systemd/system/jktaxi.service > /dev/null <<EOF
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
EOF

# Create nginx reverse proxy (port 80 -> 8000)
sudo tee /etc/nginx/sites-available/jktaxi > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }
}
EOF

# Enable nginx site
sudo ln -sf /etc/nginx/sites-available/jktaxi /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Start the app service
sudo systemctl daemon-reload
sudo systemctl enable jktaxi
sudo systemctl start jktaxi

echo ""
echo "=== Deployment Complete ==="
echo "API available at: http://$(curl -s ifconfig.me):80"
echo "API docs at: http://$(curl -s ifconfig.me)/docs"
echo ""
echo "Useful commands:"
echo "  sudo systemctl status jktaxi    # Check status"
echo "  sudo systemctl restart jktaxi   # Restart"
echo "  sudo journalctl -u jktaxi -f    # View logs"
