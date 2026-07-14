import random
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.config import settings
from app.schemas.auth import (
    SendOTP, VerifyOTP, CompleteProfile,
    UserRegister, UserLogin, DriverRegister, DriverLogin,
    AdminLogin, Token
)
from app.models.user import User
from app.models.driver import Driver
from app.models.admin import Admin

router = APIRouter()

# In-memory OTP store (phone -> otp)
_otp_store: dict[str, str] = {}


def _send_otp_sms(phone: str, otp: str) -> bool:
    """Send OTP via TeleSign SMS"""
    try:
        from telesignenterprise.verify import VerifyClient
        verify = VerifyClient(settings.TELESIGN_CUSTOMER_ID, settings.TELESIGN_API_KEY)
        phone_e164 = phone if phone.startswith('91') else f'91{phone}'
        response = verify.sms(phone_e164, verify_code=otp)
        if response.status_code == 200:
            return True
        print(f"[OTP] TeleSign error: {response.status_code} {response.body}")
        return False
    except Exception as e:
        print(f"[OTP] TeleSign exception: {e}")
        return False


VERIFIED_NUMBERS = {"9361802547"}


@router.post("/send-otp")
async def send_otp(data: SendOTP, db: Session = Depends(get_db)):
    """Send OTP to phone number for login/registration"""
    phone = data.phone.strip()

    if phone in VERIFIED_NUMBERS or phone.replace("91", "", 1) in VERIFIED_NUMBERS:
        otp = str(random.randint(1000, 9999))
        _otp_store[phone] = otp
        _send_otp_sms(phone, otp)
    else:
        _otp_store[phone] = "1234"

    return {"message": "OTP sent successfully", "otp_length": 4}


@router.post("/verify-otp")
async def verify_otp_endpoint(data: VerifyOTP, db: Session = Depends(get_db)):
    """Verify OTP and return tokens. Creates user if new."""
    phone = data.phone.strip()
    otp = data.otp.strip()

    stored_otp = _otp_store.get(phone)
    if not stored_otp or stored_otp != otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )

    del _otp_store[phone]

    user = db.query(User).filter(User.phone == phone).first()
    is_new_user = False

    if not user:
        user = User(
            phone=phone,
            name=phone,
            is_verified=True,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        is_new_user = True
    else:
        user.is_verified = True
        db.commit()

    access_token = create_access_token(data={"sub": str(user.id), "role": "user"})
    refresh_token = create_refresh_token(data={"sub": str(user.id), "role": "user"})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "is_new_user": is_new_user,
    }


@router.put("/complete-profile")
async def complete_profile_endpoint(
    data: CompleteProfile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Complete user profile after OTP verification (for new users)"""
    current_user.name = data.name
    if data.email:
        existing = db.query(User).filter(User.email == data.email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = data.email
    if data.emergency_contact_name:
        current_user.emergency_contact_name = data.emergency_contact_name
    if data.emergency_contact_phone:
        current_user.emergency_contact_phone = data.emergency_contact_phone
    db.commit()

    return {"message": "Profile updated successfully"}


# === Legacy password-based endpoints (kept for driver/admin) ===

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register new user (legacy)"""
    existing_user = db.query(User).filter(User.phone == user_data.phone).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    if user_data.email:
        existing_email = db.query(User).filter(User.email == user_data.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered")

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

    access_token = create_access_token(data={"sub": str(new_user.id), "role": "user"})
    refresh_token = create_refresh_token(data={"sub": str(new_user.id), "role": "user"})

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    """User login (legacy)"""
    user = db.query(User).filter(User.phone == user_data.phone).first()
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect phone or password")

    if not user.password_hash or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect phone or password")

    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is inactive")

    access_token = create_access_token(data={"sub": str(user.id), "role": "user"})
    refresh_token = create_refresh_token(data={"sub": str(user.id), "role": "user"})

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.post("/driver/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_driver(driver_data: DriverRegister, db: Session = Depends(get_db)):
    """Register new driver"""
    existing_driver = db.query(Driver).filter(Driver.phone == driver_data.phone).first()
    if existing_driver:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    if driver_data.email:
        existing_email = db.query(Driver).filter(Driver.email == driver_data.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered")

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
        is_active=False
    )
    db.add(new_driver)
    db.commit()
    db.refresh(new_driver)

    access_token = create_access_token(data={"sub": str(new_driver.id), "role": "driver"})
    refresh_token = create_refresh_token(data={"sub": str(new_driver.id), "role": "driver"})

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.post("/driver/login", response_model=Token)
async def login_driver(driver_data: DriverLogin, db: Session = Depends(get_db)):
    """Driver login"""
    driver = db.query(Driver).filter(Driver.phone == driver_data.phone).first()
    if not driver:
        raise HTTPException(status_code=401, detail="Incorrect phone or password")

    if not verify_password(driver_data.password, driver.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect phone or password")

    if not driver.is_active:
        raise HTTPException(status_code=403, detail="ACCOUNT_PENDING_APPROVAL")

    access_token = create_access_token(data={"sub": str(driver.id), "role": "driver"})
    refresh_token = create_refresh_token(data={"sub": str(driver.id), "role": "driver"})

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.post("/admin/login", response_model=Token)
async def login_admin(admin_data: AdminLogin, db: Session = Depends(get_db)):
    """Admin login"""
    admin = db.query(Admin).filter(Admin.username == admin_data.username).first()
    if not admin:
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    if not verify_password(admin_data.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    if not admin.is_active:
        raise HTTPException(status_code=400, detail="Admin account is inactive")

    access_token = create_access_token(data={"sub": str(admin.id), "role": "admin"})
    refresh_token = create_refresh_token(data={"sub": str(admin.id), "role": "admin"})

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.post("/refresh", response_model=Token)
async def refresh_access_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh access token using refresh token"""
    payload = decode_token(request.refresh_token)

    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = payload.get("sub")
    role = payload.get("role", "user")

    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    access_token = create_access_token(data={"sub": user_id, "role": role})
    new_refresh_token = create_refresh_token(data={"sub": user_id, "role": role})

    return {"access_token": access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}
