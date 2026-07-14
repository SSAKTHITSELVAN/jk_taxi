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
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 525600  # 365 days
    REFRESH_TOKEN_EXPIRE_DAYS: int = 730  # 2 years

    # Static OTP
    STATIC_OTP: str = "123456"

    # TeleSign OTP
    TELESIGN_CUSTOMER_ID: str = "1A1EC314-FC79-4E15-BBFF-C17A9030FF3A"
    TELESIGN_API_KEY: str = "sh1yhg1g15ZLvkjTIKrUtWK2xG+D0SpP2QjxLRXAQjsSNEcvOOWTz8n+ZBOs2BY3Ff1zjslms0xLYhY5EBRiRw=="

    # Razorpay
    RAZORPAY_KEY_ID: str = "rzp_test_TBjnIUaVrr5q2P"
    RAZORPAY_KEY_SECRET: str = "c4sXs7vA2kcQH2mGPvtRNYEq"

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
