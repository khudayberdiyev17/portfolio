from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.crud.admin_user import (
    get_all_admins, create_admin, update_admin, delete_admin,
)
from app.schemas.admin_user import AdminUserCreate, AdminUserUpdate
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/admins", tags=["admins"])


@router.get("/")
async def admin_list_admins(
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    if not admin["is_superuser"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    admins = await get_all_admins(db)
    return ApiResponse(data=[{
        "id": a.id, "email": a.email, "full_name": a.full_name,
        "is_active": a.is_active, "is_superuser": a.is_superuser,
        "created_at": a.created_at.isoformat(),
    } for a in admins])


@router.post("/")
async def admin_register(
    data: AdminUserCreate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    if not admin["is_superuser"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    new_admin = await create_admin(db, data)
    return ApiResponse(data={"id": new_admin.id}, message="Admin created")


@router.put("/{admin_id}/")
async def admin_update(
    admin_id: int,
    data: AdminUserUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: dict = Depends(get_current_admin),
):
    if not current_admin["is_superuser"] and current_admin["id"] != admin_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    updated = await update_admin(db, admin_id, data)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")
    return ApiResponse(data={"id": updated.id}, message="Admin updated")


@router.delete("/{admin_id}/")
async def admin_delete(
    admin_id: int,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    if not admin["is_superuser"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    if admin["id"] == admin_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete your own account")
    ok = await delete_admin(db, admin_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")
    return ApiResponse(message="Admin deleted")
