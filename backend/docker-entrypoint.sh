#!/bin/sh
set -e

# Symlink data dirs to persistent volume
# DB
mkdir -p /data/db
if [ ! -f /data/db/portfolio.db ] && [ -f /app/portfolio.db ]; then
    cp /app/portfolio.db /data/db/portfolio.db
fi
ln -sf /data/db/portfolio.db /app/portfolio.db 2>/dev/null || true

# Media uploads
mkdir -p /data/media
rm -rf /app/app/static/media
ln -sf /data/media /app/app/static/media

# Update DATABASE_URL to use volume path
export DATABASE_URL="sqlite+aiosqlite:////data/db/portfolio.db"

echo "[entrypoint] Running migrations..."
alembic upgrade head

# Seed only on first run (no admin users yet)
echo "[entrypoint] Checking for admin users..."
python3 -c "
import asyncio, sys
sys.path.insert(0, '/app')
from app.core.database import AsyncSessionLocal
from app.models.admin_user import AdminUser
from sqlalchemy import select

async def check():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(AdminUser).limit(1))
        return result.scalar_one_or_none()

user = asyncio.run(check())
sys.exit(0 if user else 1)
" && echo "[entrypoint] Admin exists, skipping seed." || {
    echo "[entrypoint] No admin found, running seed..."
    python3 seed.py
}

echo "[entrypoint] Starting uvicorn..."
exec "$@"
