#!/bin/bash

# Exit on error
set -e

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Installing Node dependencies..."
npm install

echo "Building Next.js..."
npm run build

echo "Deployment completed successfully!"
