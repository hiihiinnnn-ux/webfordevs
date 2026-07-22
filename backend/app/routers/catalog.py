from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Framework, Guide, Model, Tool, User
from app.schemas import FrameworkOut, GuideListOut, GuideOut, ModelOut, StatsOut, ToolOut

router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.get("/stats", response_model=StatsOut)
def stats(db: Session = Depends(get_db)):
    return StatsOut(
        tools=db.query(Tool).count(),
        models=db.query(Model).count(),
        frameworks=db.query(Framework).count(),
        guides=db.query(Guide).count(),
        users=db.query(User).count(),
    )


@router.get("/tools", response_model=list[ToolOut])
def list_tools(
    category: str | None = None,
    difficulty: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Tool)
    if category:
        query = query.filter(Tool.category == category)
    if difficulty:
        query = query.filter(Tool.difficulty == difficulty)
    return query.order_by(Tool.name).all()


@router.get("/tools/{slug}", response_model=ToolOut)
def get_tool(slug: str, db: Session = Depends(get_db)):
    tool = db.query(Tool).filter(Tool.slug == slug).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    return tool


@router.get("/models", response_model=list[ModelOut])
def list_models(
    provider: str | None = None,
    max_vram: int | None = Query(default=None, description="Max VRAM in GB your GPU has"),
    db: Session = Depends(get_db),
):
    query = db.query(Model)
    if provider:
        query = query.filter(Model.provider == provider)
    if max_vram is not None:
        query = query.filter((Model.min_vram_gb.is_(None)) | (Model.min_vram_gb <= max_vram))
    return query.order_by(Model.name).all()


@router.get("/models/{slug}", response_model=ModelOut)
def get_model(slug: str, db: Session = Depends(get_db)):
    model = db.query(Model).filter(Model.slug == slug).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return model


@router.get("/frameworks", response_model=list[FrameworkOut])
def list_frameworks(language: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Framework)
    if language:
        query = query.filter(Framework.language == language)
    return query.order_by(Framework.name).all()


@router.get("/frameworks/{slug}", response_model=FrameworkOut)
def get_framework(slug: str, db: Session = Depends(get_db)):
    framework = db.query(Framework).filter(Framework.slug == slug).first()
    if not framework:
        raise HTTPException(status_code=404, detail="Framework not found")
    return framework


@router.get("/guides", response_model=list[GuideListOut])
def list_guides(level: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Guide)
    if level:
        query = query.filter(Guide.level == level)
    return query.order_by(Guide.order_index).all()


@router.get("/guides/{slug}", response_model=GuideOut)
def get_guide(slug: str, db: Session = Depends(get_db)):
    guide = db.query(Guide).filter(Guide.slug == slug).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    return guide
