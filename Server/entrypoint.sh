#!/bin/sh
set -e

# Ensure production env defaults
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-4000}

# Run pending migrations (requires DB env vars)
if [ -n "$DB_URL" ] || { [ -n "$DB_HOST" ] && [ -n "$DB_NAME" ]; }; then
	echo "Running DB migrations..."
	npx sequelize db:migrate --config src/config/config.js || { echo "Migrations failed"; exit 1; }
else
	echo "DB env not set, skipping migrations"
fi

# Start the server
exec node src/app.js

