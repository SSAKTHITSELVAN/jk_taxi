from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # App Config
    APP_NAME: str = "JK Taxi API"
    DEBUG: bool = True
    API_VERSION: str = "v1"

    # Database
    DATABASE_URL: str

    # Redis
    REDIS_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Static OTP
    STATIC_OTP: str = "123456"

    # CORS
    ALLOWED_ORIGINS: str = '["http://localhost:3000","http://localhost:8081"]'

    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse ALLOWED_ORIGINS from JSON string to list"""
        try:
            return json.loads(self.ALLOWED_ORIGINS)
        except:
            return ["http://localhost:3000", "http://localhost:8081"]

    class Config:
        env_file = "../.env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
