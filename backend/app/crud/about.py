import json
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.about import About, Education
from app.schemas.about import AboutCreate, AboutUpdate, EducationCreate, EducationUpdate


def _serialize_about(obj: About) -> dict:
    d = {
        "id": obj.id,
        "name": obj.name,
        "shortly_me": obj.shortly_me,
        "bio": obj.bio,
        "avatar": obj.avatar,
        "skills": json.loads(obj.skills) if obj.skills else [],
        "cv_url": obj.cv_url,
        "location": obj.location,
        "available_for": obj.available_for,
        "created_at": obj.created_at.isoformat() if obj.created_at else None,
        "updated_at": obj.updated_at.isoformat() if obj.updated_at else None,
    }
    return d


async def get_about(db: AsyncSession) -> dict | None:
    result = await db.execute(select(About).order_by(About.id.desc()).limit(1))
    row = result.scalar_one_or_none()
    return _serialize_about(row) if row else None


async def create_or_update_about(db: AsyncSession, data: AboutCreate) -> About:
    result = await db.execute(select(About).limit(1))
    existing = result.scalar_one_or_none()
    skills_json = json.dumps(data.skills) if data.skills else "[]"
    if existing:
        for key, value in data.model_dump().items():
            if value is not None or key not in ["skills"]:
                setattr(existing, key, value if key != "skills" else skills_json)
        await db.commit()
        await db.refresh(existing)
        return existing
    about = About(
        name=data.name,
        shortly_me=data.shortly_me,
        bio=data.bio,
        avatar=data.avatar,
        skills=skills_json,
        cv_url=data.cv_url,
        location=data.location,
        available_for=data.available_for,
    )
    db.add(about)
    await db.commit()
    await db.refresh(about)
    return about


# Education CRUD
async def get_educations(db: AsyncSession) -> list[Education]:
    result = await db.execute(select(Education).order_by(Education.end_year.desc().nullslast()))
    return list(result.scalars().all())


async def get_education(db: AsyncSession, edu_id: int) -> Education | None:
    result = await db.execute(select(Education).where(Education.id == edu_id))
    return result.scalar_one_or_none()


async def create_education(db: AsyncSession, data: EducationCreate) -> Education:
    edu = Education(**data.model_dump())
    db.add(edu)
    await db.commit()
    await db.refresh(edu)
    return edu


async def update_education(db: AsyncSession, edu_id: int, data: EducationUpdate) -> Education | None:
    edu = await get_education(db, edu_id)
    if not edu:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(edu, key, value)
    await db.commit()
    await db.refresh(edu)
    return edu


async def delete_education(db: AsyncSession, edu_id: int) -> bool:
    edu = await get_education(db, edu_id)
    if not edu:
        return False
    await db.delete(edu)
    await db.commit()
    return True