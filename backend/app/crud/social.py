from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.social import SocialLink
from app.schemas.social import SocialLinkCreate, SocialLinkUpdate


async def get_social_links(db: AsyncSession) -> list[SocialLink]:
    result = await db.execute(
        select(SocialLink).where(SocialLink.is_active == True).order_by(SocialLink.created_at.desc(), SocialLink.id.desc())
    )
    return list(result.scalars().all())


async def get_all_social_links(db: AsyncSession) -> list[SocialLink]:
    result = await db.execute(select(SocialLink).order_by(SocialLink.created_at.desc(), SocialLink.id.desc()))
    return list(result.scalars().all())


async def get_social_link(db: AsyncSession, link_id: int) -> SocialLink | None:
    result = await db.execute(select(SocialLink).where(SocialLink.id == link_id))
    return result.scalar_one_or_none()


async def create_social_link(db: AsyncSession, data: SocialLinkCreate) -> SocialLink:
    link = SocialLink(**data.model_dump())
    db.add(link)
    await db.commit()
    await db.refresh(link)
    return link


async def update_social_link(db: AsyncSession, link_id: int, data: SocialLinkUpdate) -> SocialLink | None:
    link = await get_social_link(db, link_id)
    if not link:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(link, key, value)
    await db.commit()
    await db.refresh(link)
    return link


async def delete_social_link(db: AsyncSession, link_id: int) -> bool:
    link = await get_social_link(db, link_id)
    if not link:
        return False
    await db.delete(link)
    await db.commit()
    return True
