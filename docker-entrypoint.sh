#!/bin/sh
set -eu

POSTGRES_PASSWORD="$(cat /run/secrets/postgres_password)"
export DATABASE_URL="postgresql://delibot:${POSTGRES_PASSWORD}@db:5432/delibot"

delibot-api &
exec node server.js
