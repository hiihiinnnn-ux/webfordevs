from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Favorite, Framework, Guide, Model, Tool, User
from app.schemas import FavoriteCreate, FavoriteOut

router = APIRouter(prefix="/favorites", tags=["favorites"])

ITEM_MODELS = {
    "tool": Tool,
    "model": Model,
    "framework": Framework,
    "guide": Guide,
}


def _serialize_item(item_type: str, item) -> dict:
    if item_type == "tool":
        return {
            "slug": item.slug,
            "name": item.name,
            "tagline": item.tagline,
            "category": item.category,
        }
    if item_type == "model":
        return {
            "slug": item.slug,
            "name": item.name,
            "provider": item.provider,
            "parameter_size": item.parameter_size,
        }
    if item_type == "framework":
        return {
            "slug": item.slug,
            "name": item.name,
            "language": item.language,
        }
    return {
        "slug": item.slug,
        "title": item.title,
        "summary": item.summary,
        "level": item.level,
    }


@router.get("", response_model=list[FavoriteOut])
def list_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    favorites = (
        db.query(Favorite)
        .filter(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
        .all()
    )
    output: list[FavoriteOut] = []
    for fav in favorites:
        model_cls = ITEM_MODELS.get(fav.item_type)
        if not model_cls:
            continue
        item = db.query(model_cls).filter(model_cls.id == fav.item_id).first()
        if not item:
            continue
        output.append(
            FavoriteOut(
                id=fav.id,
                item_type=fav.item_type,
                item_id=fav.item_id,
                created_at=fav.created_at,
                item=_serialize_item(fav.item_type, item),
            )
        )
    return output


@router.post("", response_model=FavoriteOut, status_code=status.HTTP_201_CREATED)
def add_favorite(
    payload: FavoriteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    model_cls = ITEM_MODELS[payload.item_type]
    item = db.query(model_cls).filter(model_cls.id == payload.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    existing = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == current_user.id,
            Favorite.item_type == payload.item_type,
            Favorite.item_id == payload.item_id,
        )
        .first()
    )
    if existing:
        return FavoriteOut(
            id=existing.id,
            item_type=existing.item_type,
            item_id=existing.item_id,
            created_at=existing.created_at,
            item=_serialize_item(payload.item_type, item),
        )

    favorite = Favorite(
        user_id=current_user.id,
        item_type=payload.item_type,
        item_id=payload.item_id,
    )
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    return FavoriteOut(
        id=favorite.id,
        item_type=favorite.item_type,
        item_id=favorite.item_id,
        created_at=favorite.created_at,
        item=_serialize_item(payload.item_type, item),
    )


@router.delete("/{favorite_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(
    favorite_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    favorite = (
        db.query(Favorite)
        .filter(Favorite.id == favorite_id, Favorite.user_id == current_user.id)
        .first()
    )
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    db.delete(favorite)
    db.commit()
