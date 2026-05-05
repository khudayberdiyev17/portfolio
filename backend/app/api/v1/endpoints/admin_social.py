from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.crud.social import (
    get_all_social_links, get_social_link,
    create_social_link, update_social_link, delete_social_link,
)
from app.schemas.social import SocialLinkCreate, SocialLinkUpdate
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/social", tags=["social"])


@router.get("/")
async def admin_list_links(db: AsyncSession = Depends(get_db), admin: dict = Depends(get_current_admin)):
    links = await get_all_social_links(db)
    return ApiResponse(data=[{
        "id": l.id, "platform": l.platform, "url": l.url,
        "icon": l.icon, "is_active": l.is_active,
    } for l in links])


@router.get("/{link_id}/")
async def admin_get_link(link_id: int, db: AsyncSession = Depends(get_db), admin: dict = Depends(get_current_admin)):
    link = await get_social_link(db, link_id)
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found")
    return ApiResponse(data={
        "id": link.id, "platform": link.platform, "url": link.url,
        "icon": link.icon, "is_active": link.is_active,
    })


@router.post("/")
async def admin_create_link(
    data: SocialLinkCreate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    link = await create_social_link(db, data)
    return ApiResponse(data={"id": link.id}, message="Social link created")


@router.put("/{link_id}/")
async def admin_update_link(
    link_id: int,
    data: SocialLinkUpdate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    link = await update_social_link(db, link_id, data)
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found")
    return ApiResponse(data={"id": link.id}, message="Social link updated")


@router.delete("/{link_id}/")
async def admin_delete_link(
    link_id: int,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    ok = await delete_social_link(db, link_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found")
    return ApiResponse(message="Social link deleted")
