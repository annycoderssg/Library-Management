#!/bin/bash

# Script to run the FastAPI server

cd "$(dirname "$0")"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "📝 Please create .env file from .env.example"
    echo ""
fi

# Run the server using virtual environment's uvicorn directly
echo "Starting Neighborhood Library Service API..."
echo "API will be available at http://localhost:8891"
echo "API Documentation at http://localhost:8891/docs"
echo ""
./venv/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8891

