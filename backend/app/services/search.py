from sqlalchemy.orm import Session

from app.models import Framework, Guide, Model, Tool
from app.schemas import SearchResult


def _score_text(query: str, *fields: str) -> float:
    q = query.lower().strip()
    if not q:
        return 0.0

    score = 0.0
    terms = [t for t in q.split() if t]
    for field in fields:
        text = (field or "").lower()
        if q in text:
            score += 10.0
        for term in terms:
            if term in text:
                score += 2.0
    return score


def search_catalog(
    db: Session,
    query: str,
    types: list[str] | None = None,
    limit: int = 50,
) -> list[SearchResult]:
    allowed = types or ["tool", "model", "framework", "guide"]
    results: list[SearchResult] = []

    if "tool" in allowed:
        for tool in db.query(Tool).all():
            score = _score_text(query, tool.name, tool.tagline, tool.description, tool.tags, tool.category)
            if score > 0:
                results.append(
                    SearchResult(
                        type="tool",
                        id=tool.id,
                        slug=tool.slug,
                        title=tool.name,
                        summary=tool.tagline,
                        tags=tool.tags,
                        score=score,
                        meta={"category": tool.category, "difficulty": tool.difficulty},
                    )
                )

    if "model" in allowed:
        for model in db.query(Model).all():
            score = _score_text(
                query,
                model.name,
                model.provider,
                model.description,
                model.tags,
                model.use_cases,
                model.parameter_size or "",
            )
            if score > 0:
                results.append(
                    SearchResult(
                        type="model",
                        id=model.id,
                        slug=model.slug,
                        title=model.name,
                        summary=f"{model.provider} · {model.parameter_size or 'size varies'}",
                        tags=model.tags,
                        score=score,
                        meta={
                            "provider": model.provider,
                            "min_vram_gb": model.min_vram_gb,
                            "license": model.license,
                        },
                    )
                )

    if "framework" in allowed:
        for framework in db.query(Framework).all():
            score = _score_text(
                query,
                framework.name,
                framework.language,
                framework.description,
                framework.tags,
            )
            if score > 0:
                results.append(
                    SearchResult(
                        type="framework",
                        id=framework.id,
                        slug=framework.slug,
                        title=framework.name,
                        summary=f"{framework.language} framework",
                        tags=framework.tags,
                        score=score,
                        meta={"language": framework.language},
                    )
                )

    if "guide" in allowed:
        for guide in db.query(Guide).all():
            score = _score_text(query, guide.title, guide.summary, guide.content, guide.tags)
            if score > 0:
                results.append(
                    SearchResult(
                        type="guide",
                        id=guide.id,
                        slug=guide.slug,
                        title=guide.title,
                        summary=guide.summary,
                        tags=guide.tags,
                        score=score,
                        meta={"level": guide.level, "reading_time_minutes": guide.reading_time_minutes},
                    )
                )

    results.sort(key=lambda r: r.score, reverse=True)
    return results[:limit]
