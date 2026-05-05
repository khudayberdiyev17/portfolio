import json
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.experience import Experience, ExperienceItem
from app.schemas.experience import ExperienceCreate, ExperienceUpdate, ExperienceItemCreate, ExperienceItemUpdate


async def get_experience_summary(db: AsyncSession) -> Experience | None:
    result = await db.execute(select(Experience).limit(1))
    return result.scalar_one_or_none()


async def create_or_update_experience(db: AsyncSession, data: ExperienceCreate) -> Experience:
    result = await db.execute(select(Experience).limit(1))
    existing = result.scalar_one_or_none()
    if existing:
        for key, value in data.model_dump().items():
            setattr(existing, key, value)
        await db.commit()
        await db.refresh(existing)
        return existing
    exp = Experience(**data.model_dump())
    db.add(exp)
    await db.commit()
    await db.refresh(exp)
    return exp


async def get_experience_items(db: AsyncSession) -> list[ExperienceItem]:
    result = await db.execute(select(ExperienceItem).order_by(ExperienceItem.created_at.desc(), ExperienceItem.id.desc()))
    return list(result.scalars().all())


async def get_experience_item(db: AsyncSession, item_id: int) -> ExperienceItem | None:
    result = await db.execute(select(ExperienceItem).where(ExperienceItem.id == item_id))
    return result.scalar_one_or_none()


async def create_experience_item(db: AsyncSession, data: ExperienceItemCreate) -> ExperienceItem:
    tech_json = json.dumps(data.technologies) if data.technologies else "[]"
    item = ExperienceItem(
        name=data.name,
        company_name=data.company_name,
        description=data.description,
        technologies=tech_json,
        work_type=data.work_type,
        location=data.location,
        start_date=data.start_date,
        end_date=data.end_date,
        is_current=data.is_current,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


async def update_experience_item(db: AsyncSession, item_id: int, data: ExperienceItemUpdate) -> ExperienceItem | None:
    item = await get_experience_item(db, item_id)
    if not item:
        return None
    update_data = data.model_dump(exclude_unset=True)
    if "technologies" in update_data and update_data["technologies"] is not None:
        update_data["technologies"] = json.dumps(update_data["technologies"])
    for key, value in update_data.items():
        setattr(item, key, value)
    await db.commit()
    await db.refresh(item)
    return item


async def delete_experience_item(db: AsyncSession, item_id: int) -> bool:
    item = await get_experience_item(db, item_id)
    if not item:
        return False
    await db.delete(item)
    await db.commit()
    return True
