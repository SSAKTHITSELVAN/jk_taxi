from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List, Optional
from uuid import UUID
import math
from app.core.dependencies import get_db, get_current_driver
from app.schemas.ride_enhanced import RideEnhancedResponse, VerifyOTPRequest
from app.models.ride_enhanced import RideEnhanced
from app.models.driver import Driver
from app.models.ride_cancellation import RideCancellation

router = APIRouter()


class LocationUpdate(BaseModel):
    latitude: float
    longitude: float


class CancelRideRequest(BaseModel):
    reason: str
    custom_reason: Optional[str] = None


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points in kilometers using Haversine formula"""
    R = 6371  # Earth's radius in kilometers

    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    a = math.sin(delta_lat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distance = R * c
    return distance


def estimate_eta_minutes(distance_km: float) -> float:
    """Estimate ETA in minutes based on distance. Assumes average city speed of 30 km/h"""
    AVERAGE_SPEED_KMH = 30
    eta_hours = distance_km / AVERAGE_SPEED_KMH
    return eta_hours * 60


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


@router.get("/rides/available")
async def get_available_rides(
    current_driver: Driver = Depends(get_current_driver),
    db: Session = Depends(get_db)
):
    """Get available rides for driver within 30 minutes reach"""
    if not current_driver.is_online:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Driver must be online to see available rides"
        )

    # Check if driver has location
    if not current_driver.current_lat or not current_driver.current_lng:
        return []

    # Get ride IDs this driver has already cancelled/rejected (don't show again)
    cancelled_ride_ids = db.query(RideCancellation.ride_id).filter(
        RideCancellation.canceller_id == current_driver.id
    ).all()
    excluded_ids = [r[0] for r in cancelled_ride_ids]

    # Get all pending rides not previously rejected by this driver
    query = db.query(RideEnhanced).filter(
        RideEnhanced.status == "pending",
        RideEnhanced.driver_id.is_(None)
    )
    if excluded_ids:
        query = query.filter(RideEnhanced.id.notin_(excluded_ids))

    all_pending_rides = query.all()

    # Filter rides within 30 minutes reach and calculate distance/ETA
    nearby_rides = []
    MAX_ETA_MINUTES = 30

    for ride in all_pending_rides:
        # Calculate distance from driver to pickup location
        distance_to_pickup = calculate_distance(
            current_driver.current_lat,
            current_driver.current_lng,
            ride.pickup_lat,
            ride.pickup_lng
        )

        # Estimate ETA to pickup
        eta_to_pickup = estimate_eta_minutes(distance_to_pickup)

        # Only include rides reachable within 30 minutes
        if eta_to_pickup <= MAX_ETA_MINUTES:
            # Convert to dict and add driver-to-pickup distance/ETA
            ride_dict = {
                "id": str(ride.id),
                "user_id": str(ride.user_id),
                "driver_id": str(ride.driver_id) if ride.driver_id else None,
                "trip_type": ride.trip_type,
                "vehicle_category": ride.vehicle_category,
                "pickup_location": ride.pickup_location,
                "dropoff_location": ride.dropoff_location,
                "pickup_lat": ride.pickup_lat,
                "pickup_lng": ride.pickup_lng,
                "dropoff_lat": ride.dropoff_lat,
                "dropoff_lng": ride.dropoff_lng,
                "stops": ride.stops or [],
                "is_scheduled": ride.is_scheduled,
                "scheduled_datetime": ride.scheduled_datetime,
                "booking_for_self": ride.booking_for_self,
                "passenger_name": ride.passenger_name,
                "passenger_phone": ride.passenger_phone,
                "passenger_notes": ride.passenger_notes,
                "preferences": ride.preferences or {},
                "driver_notes": ride.driver_notes,
                "ride_otp": ride.ride_otp,
                "otp_verified": ride.otp_verified,
                "status": ride.status,
                "rejection_count": ride.rejection_count,
                "cancellation_reason": ride.cancellation_reason,
                "base_fare": ride.base_fare,
                "distance_fare": ride.distance_fare,
                "platform_fee": ride.platform_fee,
                "gst": ride.gst,
                "toll_charges": ride.toll_charges,
                "night_charges": ride.night_charges,
                "waiting_charges": ride.waiting_charges,
                "fare": ride.fare,
                "payment_status": ride.payment_status,
                "payment_method": ride.payment_method,
                "transaction_id": ride.transaction_id,
                # Use driver-to-pickup distance and ETA for available rides
                "distance_km": round(distance_to_pickup, 2),
                "eta_minutes": round(eta_to_pickup),
                "driver_name": None,
                "driver_phone": None,
                "driver_vehicle_number": None,
                "driver_vehicle_type": None,
                "created_at": ride.created_at,
                "updated_at": ride.updated_at,
            }
            nearby_rides.append(ride_dict)

    # Sort by distance (closest first)
    nearby_rides.sort(key=lambda r: r["distance_km"])

    # Limit to top 10 closest rides
    return nearby_rides[:10]


@router.post("/rides/{ride_id}/accept", response_model=RideEnhancedResponse)
async def accept_ride(
    ride_id: UUID,
    current_driver: Driver = Depends(get_current_driver),
    db: Session = Depends(get_db)
):
    """Accept a ride request with row-level lock to prevent race conditions"""
    if not current_driver.is_online:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Driver must be online to accept rides"
        )

    # SELECT FOR UPDATE - locks the row to prevent race condition
    ride = db.query(RideEnhanced).filter(
        RideEnhanced.id == ride_id,
        RideEnhanced.status == "pending",
        RideEnhanced.driver_id.is_(None)
    ).with_for_update().first()

    if not ride:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ride already accepted by another driver"
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
    """Complete a ride - checks driver is within 500m of dropoff location"""
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

    # Location-based completion check (500m radius)
    if ride.dropoff_lat and ride.dropoff_lng and current_driver.current_lat and current_driver.current_lng:
        distance_to_dropoff = calculate_distance(
            current_driver.current_lat,
            current_driver.current_lng,
            ride.dropoff_lat,
            ride.dropoff_lng
        )
        # Must be within 500 meters (0.5 km) of dropoff
        if distance_to_dropoff > 0.5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"You are {distance_to_dropoff:.1f} km away from drop-off. Please reach the destination to complete the ride."
            )

    ride.status = "completed"
    ride.payment_status = "completed"
    db.commit()
    db.refresh(ride)

    return ride


@router.post("/rides/{ride_id}/cancel")
async def cancel_ride(
    ride_id: UUID,
    cancel_request: CancelRideRequest,
    current_driver: Driver = Depends(get_current_driver),
    db: Session = Depends(get_db)
):
    """Cancel an accepted ride with reason"""
    ride = db.query(RideEnhanced).filter(
        RideEnhanced.id == ride_id,
        RideEnhanced.driver_id == current_driver.id,
        RideEnhanced.status.in_(["accepted", "started"])
    ).first()

    if not ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found or not assigned to you"
        )

    # Try to create cancellation record, but don't fail if table doesn't exist
    try:
        cancellation = RideCancellation(
            ride_id=ride_id,
            cancelled_by="driver",
            canceller_id=current_driver.id,
            reason=cancel_request.reason,
            custom_reason=cancel_request.custom_reason
        )
        db.add(cancellation)
    except Exception as e:
        # Table might not exist yet, just log and continue
        print(f"Warning: Could not create cancellation record: {e}")

    # Update ride status
    ride.status = "cancelled"
    ride.driver_id = None

    # Store reason in ride for now
    ride.cancellation_reason = f"{cancel_request.reason}: {cancel_request.custom_reason or ''}"

    db.commit()

    return {
        "message": "Ride cancelled successfully",
        "reason": cancel_request.reason
    }


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
