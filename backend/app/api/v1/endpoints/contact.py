from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.database import get_db
from app.crud.contact import create_message
from app.schemas.contact import ContactMessageCreate

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()


@router.post("/contact/")
@limiter.limit("5/minute")  # Badmonkey: prevent spam/flood - max 5 per IP per minute
async def public_create_contact(
    contact_data: ContactMessageCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    ip = request.client.host if request.client else None
    msg = await create_message(db, contact_data, ip_address=ip)
    return {
        "id": msg.id,
        "created_at": msg.created_at.isoformat(),
        "message": "Message sent successfully",
    }
