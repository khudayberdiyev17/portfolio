import json
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.certificate import Certificate
from app.schemas.certificate import CertificateCreate, CertificateUpdate


async def get_certificates(db: AsyncSession) -> list[Certificate]:
    result = await db.execute(select(Certificate).order_by(Certificate.created_at.desc(), Certificate.id.desc()))
    return list(result.scalars().all())


async def get_certificate(db: AsyncSession, cert_id: int) -> Certificate | None:
    result = await db.execute(select(Certificate).where(Certificate.id == cert_id))
    return result.scalar_one_or_none()


async def create_certificate(db: AsyncSession, data: CertificateCreate) -> Certificate:
    skills_json = json.dumps(data.skills) if data.skills else "[]"
    cert = Certificate(
        title=data.title,
        description=data.description,
        issuer=data.issuer,
        image=data.image,
        url=data.url,
        skills=skills_json,
        verified=data.verified,
        verify_url=data.verify_url,
        issued_date=data.issued_date,
    )
    db.add(cert)
    await db.commit()
    await db.refresh(cert)
    return cert


async def update_certificate(db: AsyncSession, cert_id: int, data: CertificateUpdate) -> Certificate | None:
    cert = await get_certificate(db, cert_id)
    if not cert:
        return None
    update_data = data.model_dump(exclude_unset=True)
    if "skills" in update_data and update_data["skills"] is not None:
        update_data["skills"] = json.dumps(update_data["skills"])
    for key, value in update_data.items():
        setattr(cert, key, value)
    await db.commit()
    await db.refresh(cert)
    return cert


async def delete_certificate(db: AsyncSession, cert_id: int) -> bool:
    cert = await get_certificate(db, cert_id)
    if not cert:
        return False
    await db.delete(cert)
    await db.commit()
    return True
