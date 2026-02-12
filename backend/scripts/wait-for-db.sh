#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."

until bun -e "
import pg from 'pg'

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
})

await client.connect()
await client.end()
" > /dev/null 2>&1; do
  sleep 2
done

echo "PostgreSQL is ready!"
