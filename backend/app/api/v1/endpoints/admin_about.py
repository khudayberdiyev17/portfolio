from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.crud.about import (
    get_about, create_or_update_about, get_educations,
    create_education, update_education, delete_education,
)
from app.schemas.about import AboutCreate, EducationCreate, EducationUpdate
from app.schemas.common import ApiResponse

router = APIRouter()


@router.get("/about-me/")
async def admin_get_about(db: AsyncSession = Depends(get_db), admin: dict = Depends(get_current_admin)):
    data = await get_about(db)
    return ApiResponse(data=data)


@router.post("/about-me/")
async def admin_save_about(
    data: AboutCreate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    about = await create_or_update_about(db, data)
    return ApiResponse(data={"id": about.id}, message="About section saved")


@router.get("/education/")
async def admin_list_education(db: AsyncSession = Depends(get_db), admin: dict = Depends(get_current_admin)):
    items = await get_educations(db)
    return ApiResponse(data=[{"id": e.id, "degree": e.degree, "university": e.university, "field_of_study": e.field_of_study, "start_year": e.start_year, "end_year": e.end_year, "description": e.description, "created_at": e.created_at.isoformat()} for e in items])


@router.post("/education/")
async def admin_create_education(
    data: EducationCreate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    edu = await create_education(db, data)
    return ApiResponse(data={"id": edu.id}, message="Education added")


@router.put("/education/{edu_id}/")
async def admin_update_education(
    edu_id: int,
    data: EducationUpdate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    edu = await update_education(db, edu_id, data)
    if not edu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Education not found")
    return ApiResponse(data={"id": edu.id}, message="Education updated")


@router.delete("/education/{edu_id}/")
async def admin_delete_education(
    edu_id: int,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    ok = await delete_education(db, edu_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Education not found")
    return ApiResponse(message="Education deleted")