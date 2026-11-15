import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "sqlite:///./cricketvision.db"
    secret_key: str = "development-only-change-me"
    access_token_minutes: int = 60
    upload_dir: str = "./uploads"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
# Docker Compose passes DATABASE_URL; pydantic maps it to database_url.
