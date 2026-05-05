import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
from app.core.config import get_settings

settings = get_settings()

# SVG REMOVED - XSS attack vector (SVGs can contain embedded JavaScript)
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_DOC_EXTENSIONS = {".pdf"}
ALLOWED_ALL = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_DOC_EXTENSIONS

# Magic bytes (MIME sniffing) to validate actual file content, not just extension
MAGIC_BYTES: dict[str, list[bytes]] = {
    ".jpg":  [b"\xff\xd8\xff"],
    ".jpeg": [b"\xff\xd8\xff"],
    ".png":  [b"\x89PNG\r\n\x1a\n"],
    ".gif":  [b"GIF87a", b"GIF89a"],
    ".webp": [b"RIFF"],  # special check below
    ".pdf":  [b"%PDF-"],
}

CATEGORY_FOLDERS = {
    "avatar": "avatars",
    "about": "about",
    "project": "projects",
    "project_screenshot": "projects/screenshots",
    "project_gif": "projects/gifs",
    "certificate": "certificates",
    "social": "social",
    "cv": "cv",
}


def secure_filename(original_name: str) -> str:
    ext = Path(original_name).suffix.lower()
    unique = uuid.uuid4().hex[:12]
    return f"{unique}{ext}"


def validate_extension(filename: str, allowed: set[str] = ALLOWED_ALL) -> str:
    ext = Path(filename).suffix.lower()
    if ext not in allowed:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"File type '{ext}' not allowed. Allowed: {', '.join(sorted(allowed))}",
        )
    return ext


def validate_magic_bytes(content: bytes, ext: str) -> None:
    """Validate file content matches expected magic bytes (prevents extension spoofing)."""
    signatures = MAGIC_BYTES.get(ext)
    if signatures is None:
        return

    if ext == ".webp":
        if not (content[:4] == b"RIFF" and content[8:12] == b"WEBP"):
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="File content does not match its extension (magic bytes mismatch)",
            )
        return

    for sig in signatures:
        if content[: len(sig)] == sig:
            return

    raise HTTPException(
        status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
        detail="File content does not match its extension (magic bytes mismatch)",
    )


async def save_upload(
    file: UploadFile,
    category: str = "misc",
    allowed: set[str] = ALLOWED_ALL,
    max_size_bytes: int | None = None,
) -> str:
    if max_size_bytes is None:
        max_size_bytes = settings.max_file_size_bytes

    content = await file.read()
    size = len(content)
    if size == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file")
    if size > max_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max size: {settings.MAX_FILE_SIZE_MB}MB",
        )

    ext = validate_extension(file.filename or "file.bin", allowed)
    validate_magic_bytes(content, ext)

    await file.seek(0)

    folder = CATEGORY_FOLDERS.get(category, "misc")
    upload_dir = Path(settings.UPLOAD_DIR) / folder
    upload_dir.mkdir(parents=True, exist_ok=True)

    filename = secure_filename(file.filename or f"file{ext}")
    file_path = upload_dir / filename

    with open(file_path, "wb") as f:
        f.write(content)

    return f"/media/{folder}/{filename}"


def delete_upload(relative_path: str) -> bool:
    try:
        cleaned = relative_path.lstrip("/")
        if cleaned.startswith("media/"):
            cleaned = cleaned[len("media/") :]
        full_path = Path(settings.UPLOAD_DIR) / cleaned
        if full_path.exists():
            full_path.unlink()
            return True
    except Exception:
        pass
    return False
