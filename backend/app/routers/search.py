from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import SearchResponse
from app.services.search import search_catalog

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=SearchResponse)
def search(
    q: str = Query(..., min_length=1, max_length=200, description="Search query"),
    type: list[str] | None = Query(default=None, description="Filter by type: tool, model, framework, guide"),
    limit: int = Query(default=30, ge=1, le=100),
    db: Session = Depends(get_db),
):
    allowed_types = {"tool", "model", "framework", "guide"}
    filtered = [t for t in (type or []) if t in allowed_types] or None
    results = search_catalog(db, q, filtered, limit)
    return SearchResponse(query=q, total=len(results), results=results)
