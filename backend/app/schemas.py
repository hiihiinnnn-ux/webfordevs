from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=64, pattern=r"^[a-zA-Z0-9_-]+$")
    password: str = Field(min_length=8, max_length=128)
    display_name: str | None = Field(default=None, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    username: str
    display_name: str | None
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ToolOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    tagline: str
    description: str
    category: str
    website_url: str | None
    github_url: str | None
    tags: str
    difficulty: str


class ModelOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    provider: str
    parameter_size: str | None
    context_length: str | None
    description: str
    use_cases: str
    license: str | None
    tags: str
    min_vram_gb: int | None


class FrameworkOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    language: str
    description: str
    website_url: str | None
    github_url: str | None
    tags: str


class GuideOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    summary: str
    content: str
    level: str
    reading_time_minutes: int
    tags: str
    order_index: int


class GuideListOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    summary: str
    level: str
    reading_time_minutes: int
    tags: str
    order_index: int


class SearchResult(BaseModel):
    type: Literal["tool", "model", "framework", "guide"]
    id: int
    slug: str
    title: str
    summary: str
    tags: str
    score: float
    meta: dict[str, str | int | None] = {}


class SearchResponse(BaseModel):
    query: str
    total: int
    results: list[SearchResult]


class FavoriteCreate(BaseModel):
    item_type: Literal["tool", "model", "framework", "guide"]
    item_id: int


class FavoriteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    item_type: str
    item_id: int
    created_at: datetime
    item: dict


class StatsOut(BaseModel):
    tools: int
    models: int
    frameworks: int
    guides: int
    users: int
