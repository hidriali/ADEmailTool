#!/bin/bash

# Deployment script for Email Tool

echo "🚀 Deploying Email Tool..."

# Update system
sudo yum update -y

# Install dependencies
sudo yum install -y git python3 python3-pip nodejs npm postgresql postgresql-server postgresql-contrib

# Setup PostgreSQL
sudo postgresql-setup initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Create database
sudo -u postgres psql -c "CREATE DATABASE emailTool;"
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'postgres';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE emailTool TO postgres;"

# Setup backend
cd emailtool-new
pip3 install -r requirements.txt

# Setup frontend
cd ../emailtool-ui
npm install
npm run build

# Start services
cd ../emailtool-new
nohup python3 advanced_ai_service.py > backend.log 2>&1 &

cd ../emailtool-ui
nohup npm start > frontend.log 2>&1 &

echo "✅ Deployment completed!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8000"
