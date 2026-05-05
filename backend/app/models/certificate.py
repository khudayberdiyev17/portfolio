from sqlalchemy import String, Text, Integer, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from app.core.database import Base


class Certificate(Base):
    __tablename__ = "certificates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    issuer: Mapped[str] = mapped_column(String(255), nullable=True)
    image: Mapped[str] = mapped_column(String(500), nullable=True)
    url: Mapped[str] = mapped_column(String(500), nullable=True)
    skills: Mapped[str] = mapped_column(Text, nullable=True)  # JSON string array
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verify_url: Mapped[str] = mapped_column(String(500), nullable=True)
    issued_date: Mapped[str] = mapped_column(String(50), nullable=True)
    expires_date: Mapped[str] = mapped_column(String(50), nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )
