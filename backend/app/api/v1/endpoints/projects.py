import json
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.crud.project import get_projects, get_project_images

router = APIRouter()


@router.get("/projects/")
async def public_get_projects(db: AsyncSession = Depends(get_db)):
    projects = await get_projects(db)
    result = []
    for p in projects:
        images = await get_project_images(db, p.id)
        tech = json.loads(p.technologies) if p.technologies else []
        result.append({
            "id": p.id,
            "title": p.title,
            "description": p.description or "",
            "long_description": p.long_description or "",
            "technologies": tech,
            "category": p.category or "",
            "live_url": p.live_url or "",
            "github_url": p.github_url or "",
            "demo_gif": p.demo_gif or "",
            "featured": p.featured,
            "images": [{"id": img.id, "image": img.image, "caption": img.caption} for img in images],
        })
    return result


@router.get("/project-image/")
async def public_get_project_images(project: int | None = None, db: AsyncSession = Depends(get_db)):
    if project:
        from app.crud.project import get_project_images
        images = await get_project_images(db, project)
    else:
        from sqlalchemy import select
        from app.models.project import ProjectImage
        result = await db.execute(select(ProjectImage).order_by(ProjectImage.id))
        images = list(result.scalars().all())
    return [{"id": img.id, "project": img.project_id, "image": img.image, "caption": img.caption} for img in images]
