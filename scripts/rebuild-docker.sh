#!/bin/bash
# Script to rebuild Docker containers without using the cache

# Check if the reset flag is provided
RESET_DB=false
if [ "$1" == "--reset-db" ] || [ "$1" == "-r" ]; then
  RESET_DB=true
fi

echo "Stopping containers..."
if [ "$RESET_DB" = true ]; then
  echo "Removing volumes to reset database..."
  docker-compose down -v
else
  docker-compose down
fi

echo "Rebuilding containers without cache..."
docker-compose build --no-cache

echo "Starting containers..."
docker-compose up -d

if [ "$RESET_DB" = true ]; then
  echo "Database has been reset to initial state."
fi

echo "Done! The application should now be running at http://localhost:3000"
