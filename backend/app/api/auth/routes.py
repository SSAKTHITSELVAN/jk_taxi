from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, verify_otp, decode_token
from app.schemas.auth import (
    UserRegister, UserLogin, DriverRegister, DriverLogin,
    AdminLogin, Token, VerifyOTP
)
from app.models.user import User
from app.models.driver import Driver
from app.models.admin import Admin

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.phone == user_data.phone).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )

    if user_data.email:
        existing_email = db.query(User).filter(User.email == user_data.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

    # Create new user
    new_user = User(
        phone=user_data.phone,
        name=user_data.name,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        is_verified=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create tokens
    access_token = create_access_token(data={"sub": str(new_user.id), "role": "user"})
    refresh_token = create_refresh_token(data={"sub": str(new_user.id), "role": "user"})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/login", response_model=Token)
async def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    """User login"""
    user = db.query(User).filter(User.phone == user_data.phone).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone or password"
        )

    if not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive"
        )

    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id), "role": "user"})
    refresh_token = create_refresh_token(data={"sub": str(user.id), "role": "user"})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/verify-otp")
async def verify_user_otp(otp_data: VerifyOTP, db: Session = Depends(get_db)):
    """Verify OTP (static 123456)"""
    user = db.query(User).filter(User.phone == otp_data.phone).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if not verify_otp(otp_data.otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )

    # Mark user as verified
    user.is_verified = True
    db.commit()

    return {"message": "OTP verified successfully"}


@router.post("/driver/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_driver(driver_data: DriverRegister, db: Session = Depends(get_db)):
    """Register new driver"""
    existing_driver = db.query(Driver).filter(Driver.phone == driver_data.phone).first()
    if existing_driver:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )

    if driver_data.email:
        existing_email = db.query(Driver).filter(Driver.email == driver_data.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

    new_driver = Driver(
        phone=driver_data.phone,
        name=driver_data.name,
        email=driver_data.email,
        password_hash=get_password_hash(driver_data.password),
        vehicle_number=driver_data.vehicle_number,
        vehicle_type=driver_data.vehicle_type,
        license_document=driver_data.license_document,
        aadhar_document=driver_data.aadhar_document,
        is_verified=False,
        is_active=False  # Inactive until admin approves
    )
    db.add(new_driver)
    db.commit()
    db.refresh(new_driver)

    access_token = create_access_token(data={"sub": str(new_driver.id), "role": "driver"})
    refresh_token = create_refresh_token(data={"sub": str(new_driver.id), "role": "driver"})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/driver/login", response_model=Token)
async def login_driver(driver_data: DriverLogin, db: Session = Depends(get_db)):
    """Driver login"""
    driver = db.query(Driver).filter(Driver.phone == driver_data.phone).first()
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone or password"
        )

    if not verify_password(driver_data.password, driver.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone or password"
        )

    if not driver.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Driver account is inactive"
        )

    access_token = create_access_token(data={"sub": str(driver.id), "role": "driver"})
    refresh_token = create_refresh_token(data={"sub": str(driver.id), "role": "driver"})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/admin/login", response_model=Token)
async def login_admin(admin_data: AdminLogin, db: Session = Depends(get_db)):
    """Admin login"""
    admin = db.query(Admin).filter(Admin.username == admin_data.username).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    if not verify_password(admin_data.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin account is inactive"
        )

    access_token = create_access_token(data={"sub": str(admin.id), "role": "admin"})
    refresh_token = create_refresh_token(data={"sub": str(admin.id), "role": "admin"})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.post("/refresh", response_model=Token)
async def refresh_access_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh access token using refresh token"""
    payload = decode_token(request.refresh_token)

    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    user_id = payload.get("sub")
    role = payload.get("role", "user")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    access_token = create_access_token(data={"sub": user_id, "role": role})
    new_refresh_token = create_refresh_token(data={"sub": user_id, "role": role})

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }
