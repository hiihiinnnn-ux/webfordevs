from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "LocalAI Dev Platform"
    secret_key: str = "dev-secret-change-in-production-use-openssl-rand"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    database_url: str = "sqlite:///./localai.db"
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    class Config:
        env_file = ".env"


settings = Settings()
