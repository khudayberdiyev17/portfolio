import json
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.crud.certificate import get_certificates

router = APIRouter()


@router.get("/certificates/")
async def public_get_certificates(db: AsyncSession = Depends(get_db)):
    certs = await get_certificates(db)
    return [
        {
            "id": c.id,
            "title": c.title,
            "description": c.description or "",
            "issuer": c.issuer or "",
            "image": c.image or "",
            "url": c.url or "",
            "skills": json.loads(c.skills) if c.skills else [],
            "verified": c.verified,
            "verify_url": c.verify_url or "",
        }
        for c in certs
    ]
