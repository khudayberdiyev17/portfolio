import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.crud.project import (
    get_projects, get_project, create_project,
    update_project, delete_project,
    get_project_images, create_project_image, delete_project_image, replace_project_images,
)
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectImageCreate
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/projects", tags=["projects"])


def _clean_images(images: list[str] | None) -> list[str]:
    if not images:
        return []
    cleaned: list[str] = []
    for image_url in images:
        val = (image_url or "").strip()
        if val and val not in cleaned:
            cleaned.append(val)
    return cleaned


def _choose_primary(primary_image: str | None, images: list[str]) -> str:
    candidate = (primary_image or "").strip()
    if candidate and candidate in images:
        return candidate
    return images[0]


@router.post("/images/")
async def admin_add_image(
    data: ProjectImageCreate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    img = await create_project_image(db, data)
    return ApiResponse(data={"id": img.id}, message="Image added")


@router.delete("/images/{image_id}/")
async def admin_delete_image(
    image_id: int,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    ok = await delete_project_image(db, image_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    return ApiResponse(message="Image deleted")


@router.get("/")
async def admin_list_projects(db: AsyncSession = Depends(get_db), admin: dict = Depends(get_current_admin)):
    projects = await get_projects(db)
    result = []
    for p in projects:
        images = await get_project_images(db, p.id)
        result.append({
            "id": p.id, "title": p.title, "description": p.description,
            "long_description": p.long_description,
            "technologies": json.loads(p.technologies) if p.technologies else [],
            "category": p.category, "live_url": p.live_url, "github_url": p.github_url,
            "demo_gif": p.demo_gif, "featured": p.featured,
            "images": [{"id": img.id, "image": img.image, "caption": img.caption} for img in images],
        })
    return ApiResponse(data=result)


@router.get("/{project_id}/")
async def admin_get_project(project_id: int, db: AsyncSession = Depends(get_db), admin: dict = Depends(get_current_admin)):
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    images = await get_project_images(db, project_id)
    return ApiResponse(data={
        "id": project.id, "title": project.title, "description": project.description,
        "long_description": project.long_description,
        "technologies": json.loads(project.technologies) if project.technologies else [],
        "category": project.category, "live_url": project.live_url, "github_url": project.github_url,
        "demo_gif": project.demo_gif, "featured": project.featured,
        "images": [{"id": img.id, "image": img.image, "caption": img.caption} for img in images],
        "primary_image": project.demo_gif,
    })


@router.post("/")
async def admin_create_project(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    images = _clean_images(data.images)
    if len(images) < 3:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least 3 project images are required",
        )
    primary_image = _choose_primary(data.primary_image, images)
    project = await create_project(db, data.model_copy(update={"demo_gif": primary_image}))
    await replace_project_images(db, project.id, images)
    return ApiResponse(data={"id": project.id}, message="Project created")


@router.put("/{project_id}/")
async def admin_update_project(
    project_id: int,
    data: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    images = _clean_images(data.images)
    if len(images) < 3:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least 3 project images are required",
        )
    primary_image = _choose_primary(data.primary_image, images)
    project = await update_project(db, project_id, data.model_copy(update={"demo_gif": primary_image}))
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    await replace_project_images(db, project_id, images)
    return ApiResponse(data={"id": project.id}, message="Project updated")


@router.delete("/{project_id}/")
async def admin_delete_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    ok = await delete_project(db, project_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return ApiResponse(message="Project deleted")
