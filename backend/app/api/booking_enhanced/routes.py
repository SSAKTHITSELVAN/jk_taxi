from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import datetime, time
from app.core.dependencies import get_db, get_current_user
from app.schemas.ride_enhanced import (
    BookingCreate, RideEnhancedResponse, VerifyOTPRequest,
    VehicleCategoryResponse, FareBreakdown
)
from app.models.ride_enhanced import RideEnhanced
from app.models.vehicle_category import VehicleCategoryConfig
from app.models.user import User
from app.models.driver import Driver

router = APIRouter()


def calculate_fare(
    distance_km: float,
    vehicle_category: VehicleCategoryConfig,
    is_night: bool = False,
    toll_charges: float = 0.0
) -> dict:
    """Calculate detailed fare breakdown"""
    base_fare = vehicle_category.base_fare
    distance_fare = distance_km * vehicle_category.per_km_rate
    platform_fee = 20.0

    # Night charges (10 PM - 6 AM)
    night_charges = (base_fare + distance_fare) * 0.15 if is_night else 0.0

    subtotal = base_fare + distance_fare + platform_fee + toll_charges + night_charges
    gst = subtotal * 0.05  # 5% GST

    total = subtotal + gst

    return {
        "base_fare": round(base_fare, 2),
        "distance_fare": round(distance_fare, 2),
        "platform_fee": round(platform_fee, 2),
        "gst": round(gst, 2),
        "toll_charges": round(toll_charges, 2),
        "night_charges": round(night_charges, 2),
        "waiting_charges": 0.0,
        "total": round(total, 2)
    }


@router.get("/vehicle-categories", response_model=List[VehicleCategoryResponse])
async def get_vehicle_categories(db: Session = Depends(get_db)):
    """Get all active vehicle categories"""
    categories = db.query(VehicleCategoryConfig).filter(
        VehicleCategoryConfig.is_active == True
    ).order_by(VehicleCategoryConfig.display_order).all()

    return categories


@router.post("/calculate-fare", response_model=FareBreakdown)
async def calculate_fare_estimate(
    pickup_lat: float,
    pickup_lng: float,
    dropoff_lat: float,
    dropoff_lng: float,
    vehicle_category: str,
    scheduled_datetime: datetime = None,
    db: Session = Depends(get_db)
):
    """Calculate fare estimate before booking"""
    # Get vehicle category config
    category_config = db.query(VehicleCategoryConfig).filter(
        VehicleCategoryConfig.name == vehicle_category
    ).first()

    if not category_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle category not found"
        )

    # Calculate distance (simple formula for MVP)
    distance_km = abs(dropoff_lat - pickup_lat) + abs(dropoff_lng - pickup_lng)
    distance_km = max(2.0, distance_km * 100)  # Minimum 2km

    # Check if night time
    ride_time = scheduled_datetime or datetime.now()
    is_night = ride_time.hour >= 22 or ride_time.hour < 6

    # Calculate fare
    fare_breakdown = calculate_fare(distance_km, category_config, is_night)

    return FareBreakdown(**fare_breakdown)


@router.post("/", response_model=RideEnhancedResponse, status_code=status.HTTP_201_CREATED)
async def create_booking_enhanced(
    booking: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new enhanced ride booking"""

    # Get vehicle category config
    category_config = db.query(VehicleCategoryConfig).filter(
        VehicleCategoryConfig.name == booking.vehicle_category.value
    ).first()

    if not category_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle category not found"
        )

    # Calculate distance
    if booking.dropoff_lat and booking.dropoff_lng:
        distance_km = abs(booking.dropoff_lat - booking.pickup_lat) + abs(booking.dropoff_lng - booking.pickup_lng)
        distance_km = max(2.0, distance_km * 100)  # Minimum 2km
    else:
        # For rental, use estimated distance
        distance_km = 20.0

    # Check if night time
    ride_time = booking.scheduled_datetime or datetime.now()
    is_night = ride_time.hour >= 22 or ride_time.hour < 6

    # Calculate fare breakdown
    fare_breakdown = calculate_fare(distance_km, category_config, is_night)

    # Convert stops to dict format
    stops_data = [stop.model_dump() for stop in booking.stops]

    # Create ride with user's static OTP (like Rapido)
    new_ride = RideEnhanced(
        user_id=current_user.id,
        trip_type=booking.trip_type.value,
        vehicle_category=booking.vehicle_category.value,
        pickup_location=booking.pickup_location,
        dropoff_location=booking.dropoff_location,
        pickup_lat=booking.pickup_lat,
        pickup_lng=booking.pickup_lng,
        dropoff_lat=booking.dropoff_lat,
        dropoff_lng=booking.dropoff_lng,
        stops=stops_data,
        is_scheduled=booking.is_scheduled,
        scheduled_datetime=booking.scheduled_datetime,
        booking_for_self=booking.booking_for_self,
        passenger_name=booking.passenger_name,
        passenger_phone=booking.passenger_phone,
        passenger_notes=booking.passenger_notes,
        preferences=booking.preferences.model_dump(),
        driver_notes=booking.driver_notes,
        ride_otp=current_user.ride_otp,  # Copy user's static OTP
        payment_method=booking.payment_method,
        distance_km=distance_km,
        base_fare=fare_breakdown["base_fare"],
        distance_fare=fare_breakdown["distance_fare"],
        platform_fee=fare_breakdown["platform_fee"],
        gst=fare_breakdown["gst"],
        toll_charges=fare_breakdown["toll_charges"],
        night_charges=fare_breakdown["night_charges"],
        waiting_charges=fare_breakdown["waiting_charges"],
        fare=fare_breakdown["total"]
    )

    db.add(new_ride)
    db.commit()
    db.refresh(new_ride)

    return new_ride


def enrich_ride_with_driver(ride: RideEnhanced, db: Session) -> dict:
    """Add driver details to ride response"""
    ride_dict = {c.name: getattr(ride, c.name) for c in ride.__table__.columns}
    ride_dict['driver_name'] = None
    ride_dict['driver_phone'] = None
    ride_dict['driver_vehicle_number'] = None
    ride_dict['driver_vehicle_type'] = None

    if ride.driver_id:
        driver = db.query(Driver).filter(Driver.id == ride.driver_id).first()
        if driver:
            ride_dict['driver_name'] = driver.name
            ride_dict['driver_phone'] = driver.phone
            ride_dict['driver_vehicle_number'] = driver.vehicle_number
            ride_dict['driver_vehicle_type'] = driver.vehicle_type

    return ride_dict


@router.get("/active", response_model=RideEnhancedResponse)
async def get_active_booking(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's active ride"""
    active_ride = db.query(RideEnhanced).filter(
        RideEnhanced.user_id == current_user.id,
        RideEnhanced.status.in_(["pending", "accepted", "started"])
    ).first()

    if not active_ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active ride found"
        )

    return enrich_ride_with_driver(active_ride, db)


@router.get("/{ride_id}", response_model=RideEnhancedResponse)
async def get_booking(
    ride_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific ride details"""
    ride = db.query(RideEnhanced).filter(
        RideEnhanced.id == ride_id,
        RideEnhanced.user_id == current_user.id
    ).first()

    if not ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found"
        )

    return ride


@router.put("/{ride_id}/cancel", response_model=RideEnhancedResponse)
async def cancel_booking(
    ride_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel a ride"""
    ride = db.query(RideEnhanced).filter(
        RideEnhanced.id == ride_id,
        RideEnhanced.user_id == current_user.id
    ).first()

    if not ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found"
        )

    if ride.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel a completed ride"
        )

    if ride.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ride is already cancelled"
        )

    ride.status = "cancelled"
    db.commit()
    db.refresh(ride)

    return ride


@router.get("/nearby-drivers")
async def get_nearby_drivers_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get count of online drivers nearby"""
    online_count = db.query(Driver).filter(
        Driver.is_online == True,
        Driver.is_active == True
    ).count()
    return {"nearby_count": online_count}


@router.get("/history/all", response_model=List[RideEnhancedResponse])
async def get_ride_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's ride history"""
    rides = db.query(RideEnhanced).filter(
        RideEnhanced.user_id == current_user.id,
        RideEnhanced.status.in_(["completed", "cancelled"])
    ).order_by(RideEnhanced.created_at.desc()).all()

    return rides
