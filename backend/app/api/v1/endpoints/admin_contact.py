from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.crud.contact import (
    get_messages, get_message,
    update_message, delete_message, get_unread_count,
)
from app.schemas.contact import ContactMessageUpdate
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/contact", tags=["contact"])


@router.get("/stats/unread/")
async def admin_unread_count(db: AsyncSession = Depends(get_db), admin: dict = Depends(get_current_admin)):
    count = await get_unread_count(db)
    return ApiResponse(data={"unread": count})


@router.get("/")
async def admin_list_messages(db: AsyncSession = Depends(get_db), admin: dict = Depends(get_current_admin)):
    msgs = await get_messages(db)
    return ApiResponse(data=[{
        "id": m.id, "name": m.name, "email": m.email,
        "subject": m.subject, "message": m.message,
        "is_read": m.is_read, "is_replied": m.is_replied,
        "created_at": m.created_at.isoformat(),
    } for m in msgs])


@router.get("/{msg_id}/")
async def admin_get_message(msg_id: int, db: AsyncSession = Depends(get_db), admin: dict = Depends(get_current_admin)):
    msg = await get_message(db, msg_id)
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    return ApiResponse(data={
        "id": msg.id, "name": msg.name, "email": msg.email,
        "subject": msg.subject, "message": msg.message,
        "is_read": msg.is_read, "is_replied": msg.is_replied,
        "ip_address": msg.ip_address, "created_at": msg.created_at.isoformat(),
    })


@router.put("/{msg_id}/")
async def admin_update_message(
    msg_id: int,
    data: ContactMessageUpdate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    msg = await update_message(db, msg_id, data)
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    return ApiResponse(data={"id": msg.id}, message="Message updated")


@router.delete("/{msg_id}/")
async def admin_delete_message(
    msg_id: int,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    ok = await delete_message(db, msg_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    return ApiResponse(message="Message deleted")