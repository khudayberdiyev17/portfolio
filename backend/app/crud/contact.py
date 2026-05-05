from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.contact import ContactMessage
from app.schemas.contact import ContactMessageUpdate


async def get_messages(db: AsyncSession) -> list[ContactMessage]:
    result = await db.execute(select(ContactMessage).order_by(ContactMessage.created_at.desc()))
    return list(result.scalars().all())


async def get_message(db: AsyncSession, msg_id: int) -> ContactMessage | None:
    result = await db.execute(select(ContactMessage).where(ContactMessage.id == msg_id))
    return result.scalar_one_or_none()


async def create_message(db: AsyncSession, data, ip_address: str | None = None) -> ContactMessage:
    msg = ContactMessage(
        name=data.name,
        email=data.email,
        subject=getattr(data, 'subject', None),
        message=data.message,
        ip_address=ip_address,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg


async def update_message(db: AsyncSession, msg_id: int, data: ContactMessageUpdate) -> ContactMessage | None:
    msg = await get_message(db, msg_id)
    if not msg:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(msg, key, value)
    await db.commit()
    await db.refresh(msg)
    return msg


async def delete_message(db: AsyncSession, msg_id: int) -> bool:
    msg = await get_message(db, msg_id)
    if not msg:
        return False
    await db.delete(msg)
    await db.commit()
    return True


async def get_unread_count(db: AsyncSession) -> int:
    result = await db.execute(select(ContactMessage).where(ContactMessage.is_read == False))
    return len(list(result.scalars().all()))