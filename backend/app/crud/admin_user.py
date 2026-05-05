from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.admin_user import AdminUser
from app.schemas.admin_user import AdminUserCreate, AdminUserUpdate
from app.core.security import hash_password, verify_password


async def get_admin_by_id(db: AsyncSession, admin_id: int) -> AdminUser | None:
    result = await db.execute(select(AdminUser).where(AdminUser.id == admin_id))
    return result.scalar_one_or_none()


async def get_admin_by_email(db: AsyncSession, email: str) -> AdminUser | None:
    result = await db.execute(select(AdminUser).where(AdminUser.email == email))
    return result.scalar_one_or_none()


async def get_all_admins(db: AsyncSession) -> list[AdminUser]:
    result = await db.execute(select(AdminUser).order_by(AdminUser.created_at.desc()))
    return list(result.scalars().all())


async def create_admin(db: AsyncSession, data: AdminUserCreate) -> AdminUser:
    admin = AdminUser(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        is_superuser=True,
    )
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    return admin


async def update_admin(db: AsyncSession, admin_id: int, data: AdminUserUpdate) -> AdminUser | None:
    admin = await get_admin_by_id(db, admin_id)
    if not admin:
        return None
    if data.email is not None:
        admin.email = data.email
    if data.full_name is not None:
        admin.full_name = data.full_name
    if data.password is not None:
        admin.hashed_password = hash_password(data.password)
    if data.is_active is not None:
        admin.is_active = data.is_active
    await db.commit()
    await db.refresh(admin)
    return admin


async def delete_admin(db: AsyncSession, admin_id: int) -> bool:
    admin = await get_admin_by_id(db, admin_id)
    if not admin:
        return False
    await db.delete(admin)
    await db.commit()
    return True


async def authenticate_admin(db: AsyncSession, email: str, password: str) -> AdminUser | None:
    admin = await get_admin_by_email(db, email)
    if not admin or not admin.is_active:
        return None
    if not verify_password(password, admin.hashed_password):
        return None
    return admin