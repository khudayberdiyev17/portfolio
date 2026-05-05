import json
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.crud.about import get_about, get_educations
from app.crud.experience import get_experience_summary, get_experience_items

router = APIRouter()


@router.get("/about-me/")
async def public_get_about(db: AsyncSession = Depends(get_db)):
    data = await get_about(db)
    if not data:
        return {"id": None, "name": "", "shortly_me": "", "bio": "", "avatar": None, "skills": [], "location": "", "available_for": ""}
    result = dict(data)
    if result.get("skills") and isinstance(result["skills"], str):
        result["skills"] = json.loads(result["skills"])
    return result


@router.get("/education/")
async def public_get_education(db: AsyncSession = Depends(get_db)):
    items = await get_educations(db)
    return [{"id": e.id, "degree": e.degree, "university": e.university, "field_of_study": e.field_of_study, "start_year": e.start_year, "end_year": e.end_year, "description": e.description} for e in items]


@router.get("/experience/")
async def public_get_experience(db: AsyncSession = Depends(get_db)):
    exp = await get_experience_summary(db)
    if not exp:
        return {"exp_years": 0, "project_count": 0}
    return {"id": exp.id, "exp_years": exp.exp_years, "project_count": exp.project_count}


@router.get("/experience-item/")
async def public_get_experience_items(db: AsyncSession = Depends(get_db)):
    items = await get_experience_items(db)
    return [
        {
            "id": item.id,
            "name": item.name,
            "company_name": item.company_name,
            "description": item.description,
            "technologies": json.loads(item.technologies) if item.technologies else [],
            "work_type": item.work_type,
            "location": item.location,
            "start_date": item.start_date,
            "end_date": item.end_date,
            "is_current": item.is_current,
        }
        for item in items
    ]


@router.get("/social/")
async def public_get_social(db: AsyncSession = Depends(get_db)):
    from app.crud.social import get_social_links
    links = await get_social_links(db)
    return [{"platform": l.platform, "url": l.url, "icon": l.icon} for l in links]
