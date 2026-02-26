#!/bin/bash
export DATABASE_URL="file:sqlite.db"
export NODE_ENV="production"
export PORT="${PORT:-5000}"
exec node dist/index.cjs
