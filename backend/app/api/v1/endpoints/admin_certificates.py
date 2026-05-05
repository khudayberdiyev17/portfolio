import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.crud.certificate import (
    get_certificates, get_certificate,
    create_certificate, update_certificate, delete_certificate,
)
from app.schemas.certificate import CertificateCreate, CertificateUpdate
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/certificates", tags=["certificates"])


@router.get("/")
async def admin_list_certificates(db: AsyncSession = Depends(get_db), admin: dict = Depends(get_current_admin)):
    certs = await get_certificates(db)
    return ApiResponse(data=[{
        "id": c.id, "title": c.title, "description": c.description,
        "issuer": c.issuer, "image": c.image, "url": c.url,
        "skills": json.loads(c.skills) if c.skills else [],
        "verified": c.verified, "verify_url": c.verify_url,
        "issued_date": c.issued_date,
    } for c in certs])


@router.get("/{cert_id}/")
async def admin_get_certificate(cert_id: int, db: AsyncSession = Depends(get_db), admin: dict = Depends(get_current_admin)):
    cert = await get_certificate(db, cert_id)
    if not cert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certificate not found")
    return ApiResponse(data={
        "id": cert.id, "title": cert.title, "description": cert.description,
        "issuer": cert.issuer, "image": cert.image, "url": cert.url,
        "skills": json.loads(cert.skills) if cert.skills else [],
        "verified": cert.verified, "verify_url": cert.verify_url,
        "issued_date": cert.issued_date,
    })


@router.post("/")
async def admin_create_certificate(
    data: CertificateCreate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    cert = await create_certificate(db, data)
    return ApiResponse(data={"id": cert.id}, message="Certificate created")


@router.put("/{cert_id}/")
async def admin_update_certificate(
    cert_id: int,
    data: CertificateUpdate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    cert = await update_certificate(db, cert_id, data)
    if not cert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certificate not found")
    return ApiResponse(data={"id": cert.id}, message="Certificate updated")


@router.delete("/{cert_id}/")
async def admin_delete_certificate(
    cert_id: int,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    ok = await delete_certificate(db, cert_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certificate not found")
    return ApiResponse(message="Certificate deleted")
