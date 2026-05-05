import json
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.project import Project, ProjectImage
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectImageCreate


async def get_projects(db: AsyncSession) -> list[Project]:
    result = await db.execute(select(Project).order_by(Project.featured.desc(), Project.created_at.desc(), Project.id.desc()))
    return list(result.scalars().all())


async def get_project(db: AsyncSession, project_id: int) -> Project | None:
    result = await db.execute(select(Project).where(Project.id == project_id))
    return result.scalar_one_or_none()


async def create_project(db: AsyncSession, data: ProjectCreate) -> Project:
    tech_json = json.dumps(data.technologies) if data.technologies else "[]"
    project = Project(
        title=data.title,
        description=data.description,
        long_description=data.long_description,
        technologies=tech_json,
        category=data.category,
        live_url=data.live_url,
        github_url=data.github_url,
        demo_gif=data.demo_gif,
        featured=data.featured,
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


async def update_project(db: AsyncSession, project_id: int, data: ProjectUpdate) -> Project | None:
    project = await get_project(db, project_id)
    if not project:
        return None
    update_data = data.model_dump(exclude_unset=True)
    if "technologies" in update_data and update_data["technologies"] is not None:
        update_data["technologies"] = json.dumps(update_data["technologies"])
    for key, value in update_data.items():
        setattr(project, key, value)
    await db.commit()
    await db.refresh(project)
    return project


async def delete_project(db: AsyncSession, project_id: int) -> bool:
    project = await get_project(db, project_id)
    if not project:
        return False
    await db.delete(project)
    await db.commit()
    return True


# Project Images
async def get_project_images(db: AsyncSession, project_id: int) -> list[ProjectImage]:
    result = await db.execute(
        select(ProjectImage).where(ProjectImage.project_id == project_id).order_by(ProjectImage.order, ProjectImage.id)
    )
    return list(result.scalars().all())


async def create_project_image(db: AsyncSession, data: ProjectImageCreate) -> ProjectImage:
    image = ProjectImage(project_id=data.project_id, image=data.image, caption=data.caption, order=0)
    db.add(image)
    await db.commit()
    await db.refresh(image)
    return image


async def replace_project_images(db: AsyncSession, project_id: int, images: list[str]) -> list[ProjectImage]:
    await db.execute(delete(ProjectImage).where(ProjectImage.project_id == project_id))
    rows: list[ProjectImage] = []
    for idx, image_url in enumerate(images):
        rows.append(ProjectImage(project_id=project_id, image=image_url, order=idx))
    db.add_all(rows)
    await db.commit()
    return rows


async def delete_project_image(db: AsyncSession, image_id: int) -> bool:
    result = await db.execute(select(ProjectImage).where(ProjectImage.id == image_id))
    image = result.scalar_one_or_none()
    if not image:
        return False
    await db.delete(image)
    await db.commit()
    return True
