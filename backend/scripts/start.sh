#!/bin/sh
set -e

./scripts/wait-for-db.sh

echo "Running Drizzle migrations..."
bunx drizzle-kit push

echo "Starting server..."
bun run dev