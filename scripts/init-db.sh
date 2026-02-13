#!/bin/sh
# init-db.sh - Initialize the database if tables don't exist

set -e

echo "Checking if database tables exist..."

# Check if the bookings table exists
TABLE_EXISTS=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$DB_NAME' AND table_name = 'bookings';" | grep -v "COUNT" | tr -d ' ')

if [ "$TABLE_EXISTS" = "0" ] || [ -z "$TABLE_EXISTS" ]; then
  echo "Tables don't exist. Initializing database..."
  
  # Import the schema
  mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < /usr/src/app/config/schema.sql
  
  echo "Database initialized successfully."
else
  echo "Tables already exist. Skipping initialization."
fi