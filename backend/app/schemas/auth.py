from pydantic import BaseModel, EmailStr, Field
from typing import Optional


# User Registration/Login
class UserRegister(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    name: str = Field(..., min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=6)


class VerifyOTP(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    otp: str = Field(..., min_length=6, max_length=6)


# Driver Registration/Login
class DriverRegister(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    name: str = Field(..., min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    password: str = Field(..., min_length=6)
    vehicle_number: Optional[str] = None
    vehicle_type: Optional[str] = None


class DriverLogin(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=6)


# Admin Login
class AdminLogin(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)


# Token Response
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshToken(BaseModel):
    refresh_token: str
