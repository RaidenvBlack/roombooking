#!/bin/sh
# wait-for-it.sh

set -e

host="$1"
shift
cmd="$@"

until mysql -h "$host" -u "$DB_USER" -p"$DB_PASSWORD" -e '\q'; do
  >&2 echo "MySQL is unavailable - sleeping"
  sleep 1
done

>&2 echo "MySQL is up - initializing database if needed"
/usr/src/app/scripts/init-db.sh

>&2 echo "Database initialization completed - executing command"
exec $cmd
