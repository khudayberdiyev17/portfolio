from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class ProjectImageBase(BaseModel):
    image: str
    caption: str | None = None


class ProjectImageCreate(ProjectImageBase):
    project_id: int


class ProjectImageRead(ProjectImageBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    project_id: int
    created_at: datetime


class ProjectBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: str | None = None
    long_description: str | None = None
    technologies: list[str] | None = None
    category: str | None = None
    live_url: str | None = None
    github_url: str | None = None
    demo_gif: str | None = None
    featured: bool = False
    images: list[str] | None = None
    primary_image: str | None = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    pass


class ProjectRead(ProjectBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    images: list[ProjectImageRead] = []
    created_at: datetime
    updated_at: datetime
