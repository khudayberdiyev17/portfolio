from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime


class ContactMessageCreate(BaseModel):
    name: str = Field(..., max_length=255)
    email: EmailStr
    subject: str | None = Field(None, max_length=500)
    message: str = Field(..., min_length=10, max_length=5000)


class ContactMessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    subject: str | None
    message: str
    is_read: bool
    is_replied: bool
    created_at: datetime


class ContactMessageUpdate(BaseModel):
    is_read: bool | None = None
    is_replied: bool | None = None
