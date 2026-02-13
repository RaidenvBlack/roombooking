#!/bin/bash
# Script to reset the database by removing volumes

echo "Stopping containers..."
docker-compose down -v

echo "Database volumes have been removed."
echo "Starting containers..."
docker-compose up -d

echo "Done! The database has been reset to its initial state."
echo "The application should now be running at http://localhost:3000"