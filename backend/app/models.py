from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(64), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    display_name = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")


class Tool(Base):
    __tablename__ = "tools"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(128), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False, index=True)
    tagline = Column(String(512), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(64), nullable=False, index=True)
    website_url = Column(String(512), nullable=True)
    github_url = Column(String(512), nullable=True)
    tags = Column(String(512), nullable=False, default="")
    difficulty = Column(String(32), nullable=False, default="beginner")
    created_at = Column(DateTime, default=datetime.utcnow)


class Model(Base):
    __tablename__ = "models"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(128), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False, index=True)
    provider = Column(String(128), nullable=False, index=True)
    parameter_size = Column(String(64), nullable=True)
    context_length = Column(String(64), nullable=True)
    description = Column(Text, nullable=False)
    use_cases = Column(String(512), nullable=False, default="")
    license = Column(String(128), nullable=True)
    tags = Column(String(512), nullable=False, default="")
    min_vram_gb = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Framework(Base):
    __tablename__ = "frameworks"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(128), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False, index=True)
    language = Column(String(64), nullable=False, index=True)
    description = Column(Text, nullable=False)
    website_url = Column(String(512), nullable=True)
    github_url = Column(String(512), nullable=True)
    tags = Column(String(512), nullable=False, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class Guide(Base):
    __tablename__ = "guides"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(128), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    summary = Column(String(512), nullable=False)
    content = Column(Text, nullable=False)
    level = Column(String(32), nullable=False, default="beginner")
    reading_time_minutes = Column(Integer, nullable=False, default=5)
    tags = Column(String(512), nullable=False, default="")
    order_index = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (UniqueConstraint("user_id", "item_type", "item_id", name="uq_user_favorite"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    item_type = Column(String(32), nullable=False)
    item_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="favorites")
