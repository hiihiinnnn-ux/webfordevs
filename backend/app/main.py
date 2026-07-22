from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.routers import auth, catalog, favorites, search
from app.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.app_name,
    description=(
        "API for discovering local AI tools, models, and frameworks. "
        "Register an account, search the catalog, save favorites, and follow guided learning paths."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(catalog.router, prefix="/api")
app.include_router(favorites.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok", "service": settings.app_name}
