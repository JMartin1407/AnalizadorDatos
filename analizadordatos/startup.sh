#!/bin/bash
set -e

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
npm install
npm run build

# Start the application
gunicorn --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 backend.main:app &
npm start
