from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List
from uuid import UUID
from app.core.dependencies import get_db, get_current_driver
from app.schemas.ride_enhanced import RideEnhancedResponse, VerifyOTPRequest
from app.models.ride_enhanced import RideEnhanced
from app.models.driver import Driver

router = APIRouter()


class LocationUpdate(BaseModel):
    latitude: float
    longitude: float


@router.post("/location")
async def update_driver_location(
    location: LocationUpdate,
    current_driver: Driver = Depends(get_current_driver),
    db: Session = Depends(get_db)
):
    """Update driver's current GPS location"""
    current_driver.current_lat = location.latitude
    current_driver.current_lng = location.longitude
    current_driver.location_updated_at = func.now()
    db.commit()
    return {"status": "ok"}


@router.get("/rides/available", response_model=List[RideEnhancedResponse])
async def get_available_rides(
    current_driver: Driver = Depends(get_current_driver),
    db: Session = Depends(get_db)
):
    """Get available rides for driver"""
    if not current_driver.is_online:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Driver must be online to see available rides"
        )

    rides = db.query(RideEnhanced).filter(
        RideEnhanced.status == "pending",
        RideEnhanced.driver_id.is_(None)
    ).order_by(RideEnhanced.created_at).limit(20).all()

    return rides


@router.post("/rides/{ride_id}/accept", response_model=RideEnhancedResponse)
async def accept_ride(
    ride_id: UUID,
    current_driver: Driver = Depends(get_current_driver),
    db: Session = Depends(get_db)
):
    """Accept a ride request"""
    ride = db.query(RideEnhanced).filter(
        RideEnhanced.id == ride_id,
        RideEnhanced.status == "pending"
    ).first()

    if not ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found or already accepted"
        )

    if not current_driver.is_online:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Driver must be online to accept rides"
        )

    ride.driver_id = current_driver.id
    ride.status = "accepted"
    db.commit()
    db.refresh(ride)

    return ride


@router.post("/rides/{ride_id}/verify-otp", response_model=RideEnhancedResponse)
async def verify_ride_otp(
    ride_id: UUID,
    otp_request: VerifyOTPRequest,
    current_driver: Driver = Depends(get_current_driver),
    db: Session = Depends(get_db)
):
    """Verify OTP before starting ride"""
    ride = db.query(RideEnhanced).filter(
        RideEnhanced.id == ride_id,
        RideEnhanced.driver_id == current_driver.id,
        RideEnhanced.status == "accepted"
    ).first()

    if not ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found or not assigned to you"
        )

    if ride.otp_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP already verified"
        )

    if ride.ride_otp != otp_request.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )

    ride.otp_verified = True
    db.commit()
    db.refresh(ride)

    return ride


@router.post("/rides/{ride_id}/start", response_model=RideEnhancedResponse)
async def start_ride(
    ride_id: UUID,
    current_driver: Driver = Depends(get_current_driver),
    db: Session = Depends(get_db)
):
    """Start a ride (requires OTP verification)"""
    ride = db.query(RideEnhanced).filter(
        RideEnhanced.id == ride_id,
        RideEnhanced.driver_id == current_driver.id
    ).first()

    if not ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found"
        )

    if ride.status != "accepted":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot start ride with status: {ride.status}"
        )

    if not ride.otp_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please verify OTP before starting the ride"
        )

    ride.status = "started"
    db.commit()
    db.refresh(ride)

    return ride


@router.post("/rides/{ride_id}/complete", response_model=RideEnhancedResponse)
async def complete_ride(
    ride_id: UUID,
    current_driver: Driver = Depends(get_current_driver),
    db: Session = Depends(get_db)
):
    """Complete a ride"""
    ride = db.query(RideEnhanced).filter(
        RideEnhanced.id == ride_id,
        RideEnhanced.driver_id == current_driver.id
    ).first()

    if not ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found"
        )

    if ride.status != "started":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only complete rides that are started"
        )

    ride.status = "completed"
    ride.payment_status = "completed"
    db.commit()
    db.refresh(ride)

    return ride


@router.post("/rides/{ride_id}/reject", response_model=dict)
async def reject_ride(
    ride_id: UUID,
    current_driver: Driver = Depends(get_current_driver),
    db: Session = Depends(get_db)
):
    """Reject a ride request"""
    ride = db.query(RideEnhanced).filter(
        RideEnhanced.id == ride_id,
        RideEnhanced.status == "pending"
    ).first()

    if not ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found"
        )

    return {"message": "Ride rejected successfully"}


@router.get("/rides/active", response_model=RideEnhancedResponse)
async def get_active_ride(
    current_driver: Driver = Depends(get_current_driver),
    db: Session = Depends(get_db)
):
    """Get driver's active ride"""
    active_ride = db.query(RideEnhanced).filter(
        RideEnhanced.driver_id == current_driver.id,
        RideEnhanced.status.in_(["accepted", "started"])
    ).first()

    if not active_ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active ride found"
        )

    return active_ride


@router.get("/rides/history", response_model=List[RideEnhancedResponse])
async def get_driver_ride_history(
    current_driver: Driver = Depends(get_current_driver),
    db: Session = Depends(get_db)
):
    """Get driver's ride history"""
    rides = db.query(RideEnhanced).filter(
        RideEnhanced.driver_id == current_driver.id,
        RideEnhanced.status == "completed"
    ).order_by(RideEnhanced.created_at.desc()).all()

    return rides


@router.get("/earnings", response_model=dict)
async def get_driver_earnings(
    current_driver: Driver = Depends(get_current_driver),
    db: Session = Depends(get_db)
):
    """Get driver's earnings"""
    completed_rides = db.query(RideEnhanced).filter(
        RideEnhanced.driver_id == current_driver.id,
        RideEnhanced.status == "completed"
    ).all()

    total_earnings = sum(ride.fare for ride in completed_rides)
    total_rides = len(completed_rides)
    average_fare = total_earnings / total_rides if total_rides > 0 else 0

    return {
        "total_earnings": round(total_earnings, 2),
        "total_rides": total_rides,
        "average_fare": round(average_fare, 2)
    }


@router.post("/rides/{ride_id}/reject")
async def reject_ride(
    ride_id: UUID,
    current_driver: Driver = Depends(get_current_driver),
    db: Session = Depends(get_db)
):
    """Reject or cancel a ride (before starting)"""
    ride = db.query(RideEnhanced).filter(RideEnhanced.id == ride_id).first()

    if not ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found"
        )

    if ride.driver_id != current_driver.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This ride is not assigned to you"
        )

    if ride.status not in ["pending", "accepted"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot reject ride that has already started or completed"
        )

    if ride.otp_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot reject ride after OTP verification. Ride has started."
        )

    # Increment rejection count and make ride available again
    ride.rejection_count += 1
    ride.driver_id = None
    ride.status = "pending"
    ride.otp_verified = False

    db.commit()
    db.refresh(ride)

    return {
        "message": "Ride rejected successfully",
        "rejection_count": ride.rejection_count,
        "ride_id": str(ride.id)
    }
