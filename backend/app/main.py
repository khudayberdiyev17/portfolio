import os
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pathlib import Path

from app.core.config import get_settings
from app.api.v1.endpoints import (
    auth, public, projects, certificates, contact,
    admin_about, admin_experience, admin_projects,
    admin_certificates, admin_contact, admin_social, admin_users,
    upload,
)

settings = get_settings()
IS_PRODUCTION = os.getenv("APP_ENV", "development") == "production"

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Portfolio API",
    description="Portfolio backend API with admin panel",
    version="1.0.0",
    # Disable interactive docs in production to reduce attack surface
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# Mount static files for media
media_path = Path(settings.UPLOAD_DIR)
media_path.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(media_path)), name="media")

# Public API routes
public_router = FastAPI(docs_url=None, redoc_url=None)
public_router.include_router(public.router)
public_router.include_router(projects.router)
public_router.include_router(certificates.router)
public_router.include_router(contact.router)

# Admin API routes
admin_router = FastAPI(docs_url=None, redoc_url=None)
admin_router.include_router(auth.router)
admin_router.include_router(admin_about.router)
admin_router.include_router(admin_experience.router)
admin_router.include_router(admin_projects.router)
admin_router.include_router(admin_certificates.router)
admin_router.include_router(admin_contact.router)
admin_router.include_router(admin_social.router)
admin_router.include_router(admin_users.router)
admin_router.include_router(upload.router)

# Mount under versioned prefix
app.mount("/portfolio/v1/api/admin", admin_router)
app.mount("/portfolio/v1/api", public_router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": None,
        },
    )


# Security headers middleware
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    # CSP - tighten as needed
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: blob: https:; "
        "connect-src 'self'; "
        "frame-ancestors 'none';"
    )
    return response
