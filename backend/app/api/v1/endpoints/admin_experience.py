import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.crud.experience import (
    get_experience_summary, create_or_update_experience,
    get_experience_items, get_experience_item,
    create_experience_item, update_experience_item, delete_experience_item,
)
from app.schemas.experience import ExperienceCreate, ExperienceItemCreate, ExperienceItemUpdate
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/experience", tags=["experience"])


@router.get("/summary/")
async def admin_get_summary(db: AsyncSession = Depends(get_db), admin: dict = Depends(get_current_admin)):
    exp = await get_experience_summary(db)
    if not exp:
        return ApiResponse(data={"exp_years": 0, "project_count": 0})
    return ApiResponse(data={"id": exp.id, "exp_years": exp.exp_years, "project_count": exp.project_count})


@router.post("/summary/")
async def admin_save_summary(
    data: ExperienceCreate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    exp = await create_or_update_experience(db, data)
    return ApiResponse(data={"id": exp.id}, message="Summary saved")


@router.get("/items/")
async def admin_list_items(db: AsyncSession = Depends(get_db), admin: dict = Depends(get_current_admin)):
    items = await get_experience_items(db)
    return ApiResponse(data=[{
        "id": i.id, "name": i.name, "company_name": i.company_name,
        "description": i.description, "technologies": json.loads(i.technologies) if i.technologies else [],
        "work_type": i.work_type, "location": i.location,
        "start_date": i.start_date, "end_date": i.end_date,
        "is_current": i.is_current,
    } for i in items])


@router.get("/items/{item_id}/")
async def admin_get_item(item_id: int, db: AsyncSession = Depends(get_db), admin: dict = Depends(get_current_admin)):
    item = await get_experience_item(db, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return ApiResponse(data={
        "id": item.id, "name": item.name, "company_name": item.company_name,
        "description": item.description, "technologies": json.loads(item.technologies) if item.technologies else [],
        "work_type": item.work_type, "location": item.location,
        "start_date": item.start_date, "end_date": item.end_date,
        "is_current": item.is_current,
    })


@router.post("/items/")
async def admin_create_item(
    data: ExperienceItemCreate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    item = await create_experience_item(db, data)
    return ApiResponse(data={"id": item.id}, message="Experience item created")


@router.put("/items/{item_id}/")
async def admin_update_item(
    item_id: int,
    data: ExperienceItemUpdate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    item = await update_experience_item(db, item_id, data)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return ApiResponse(data={"id": item.id}, message="Experience item updated")


@router.delete("/items/{item_id}/")
async def admin_delete_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    ok = await delete_experience_item(db, item_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return ApiResponse(message="Experience item deleted")
