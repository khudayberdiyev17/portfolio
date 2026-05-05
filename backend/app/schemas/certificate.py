from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class CertificateBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: str | None = None
    issuer: str | None = None
    image: str | None = None
    url: str | None = None
    skills: list[str] | None = None
    verified: bool = False
    verify_url: str | None = None
    issued_date: str | None = None


class CertificateCreate(CertificateBase):
    pass


class CertificateUpdate(CertificateBase):
    pass


class CertificateRead(CertificateBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
