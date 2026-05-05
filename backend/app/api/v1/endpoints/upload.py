from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.services.file_service import save_upload, ALLOWED_IMAGE_EXTENSIONS

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("/image/")
async def upload_image(
    file: UploadFile = File(...),
    category: str = Form("misc"),
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    path = await save_upload(file, category=category, allowed=ALLOWED_IMAGE_EXTENSIONS)
    return {"url": path, "filename": file.filename}


@router.post("/file/")
async def upload_file(
    file: UploadFile = File(...),
    category: str = Form("misc"),
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(get_current_admin),
):
    path = await save_upload(file, category=category)
    return {"url": path, "filename": file.filename}
