#!/bin/bash

# Deployment script for ecommerce project
# Usage: ./deploy.sh

# Navigate to project directory
echo "Changing directory to /var/www/html/ecommerce/"
cd /var/www/html/ecommerce/ || { echo "Failed to change directory"; exit 1; }

# Update code from repository
echo "Pulling latest changes from Git..."
git pull origin main || { echo "Git pull failed"; exit 1; }

# Navigate to frontend
echo "Changing to frontend directory..."
cd frontend/talodu/ || { echo "Failed to enter frontend directory"; exit 1; }

# Clean previous build
echo "Removing old .next build directory..."
rm -rf .next/ || { echo "Failed to remove .next directory"; exit 1; }

# Stop existing PM2 process
echo "Stopping existing PM2 process..."
pm2 delete talodu-next || echo "No existing PM2 process found (continuing anyway)"

# Install dependencies and build
echo "Installing dependencies..."
#npm install || { echo "npm install failed"; exit 1; }

echo "Building Next.js application..."
npm run nextbuild || { echo "Build failed"; exit 1; }

# Start application with PM2
echo "Starting application with PM2..."
pm2 start "npm run nextstart" --name "talodu-next"

echo "Deployment completed successfully!"
pm2 save
pm2 list