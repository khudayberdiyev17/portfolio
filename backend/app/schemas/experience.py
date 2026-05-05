from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class ExperienceBase(BaseModel):
    exp_years: int = 0
    project_count: int = 0


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(ExperienceBase):
    pass


class ExperienceRead(ExperienceBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class ExperienceItemBase(BaseModel):
    name: str = Field(..., max_length=255)
    company_name: str = Field(..., max_length=255)
    description: str | None = None
    technologies: list[str] | None = None
    work_type: str | None = None
    location: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    is_current: bool = False


class ExperienceItemCreate(ExperienceItemBase):
    pass


class ExperienceItemUpdate(ExperienceItemBase):
    pass


class ExperienceItemRead(ExperienceItemBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
