from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class SocialLinkBase(BaseModel):
    platform: str = Field(..., max_length=100)
    url: str
    icon: str | None = None
    is_active: bool = True


class SocialLinkCreate(SocialLinkBase):
    pass


class SocialLinkUpdate(SocialLinkBase):
    pass


class SocialLinkRead(SocialLinkBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
