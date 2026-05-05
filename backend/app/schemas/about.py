from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class AboutBase(BaseModel):
    name: str = Field(..., max_length=255)
    shortly_me: str | None = None
    bio: str | None = None
    avatar: str | None = None
    skills: list[str] | None = None
    cv_url: str | None = None
    location: str | None = None
    available_for: str | None = None


class AboutCreate(AboutBase):
    pass


class AboutUpdate(AboutBase):
    pass


class AboutRead(AboutBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EducationBase(BaseModel):
    degree: str = Field(..., max_length=255)
    university: str = Field(..., max_length=255)
    field_of_study: str | None = None
    start_year: int | None = None
    end_year: int | None = None
    description: str | None = None


class EducationCreate(EducationBase):
    pass


class EducationUpdate(EducationBase):
    pass


class EducationRead(EducationBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)