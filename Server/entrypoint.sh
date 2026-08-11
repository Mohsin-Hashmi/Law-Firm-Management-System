#!/bin/sh
set -e

# Ensure production env defaults
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-4000}

mkdir -p uploads/clients uploads/lawyers uploads/case-documents

# Run pending migrations (requires DB env vars)
if [ -n "$DB_URL" ] || [ -n "$DATABASE_URL" ] || [ -n "$MYSQL_URL" ] || { [ -n "$DB_HOST" ] && [ -n "$DB_NAME" ]; } || { [ -n "$MYSQLHOST" ] && [ -n "$MYSQLDATABASE" ]; }; then
	echo "Running DB migrations..."
	npm run db:migrate || { echo "Migrations failed"; exit 1; }
else
	echo "DB env not set, skipping migrations"
fi

# Start the server
exec node src/app.js

