# JK Taxi - Architecture

## Backend Architecture

### Layer Structure

```
API Layer (Routes)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Database (PostgreSQL)
```

### Folder Breakdown

#### `/app/api/`
API route handlers organized by feature:
- `auth/` - Login, register, OTP verification
- `user/` - User profile, history
- `driver/` - Driver status, ride management
- `booking/` - Create, cancel, status rides
- `admin/` - Admin dashboard, user management

#### `/app/core/`
Core configuration:
- `config.py` - Environment variables, settings
- `security.py` - JWT, password hashing
- `dependencies.py` - FastAPI dependencies

#### `/app/db/`
Database setup:
- `database.py` - SQLAlchemy engine, session
- `base.py` - Base model class

#### `/app/models/`
SQLAlchemy ORM models:
- `user.py` - User table
- `driver.py` - Driver table
- `ride.py` - Ride/Booking table
- `admin.py` - Admin table

#### `/app/schemas/`
Pydantic validation schemas:
- Request schemas (input validation)
- Response schemas (output serialization)
- Separated by feature (auth, user, driver, booking)

#### `/app/services/`
Business logic:
- `auth_service.py` - Authentication logic
- `user_service.py` - User operations
- `driver_service.py` - Driver operations
- `booking_service.py` - Booking logic
- `payment_service.py` - Mock payment
- `otp_service.py` - Static OTP (123456)

#### `/app/repositories/`
Data access layer:
- `user_repository.py` - User CRUD
- `driver_repository.py` - Driver CRUD
- `ride_repository.py` - Ride CRUD
- `admin_repository.py` - Admin CRUD

#### `/app/utils/`
Utility functions:
- `validators.py` - Custom validators
- `helpers.py` - Helper functions
- `constants.py` - App constants

## Database Schema

### Users Table
- id (UUID, PK)
- phone (String, Unique)
- name (String)
- email (String, Unique)
- password_hash (String)
- emergency_contact_name (String, Nullable) **NEW**
- emergency_contact_phone (String, Nullable) **NEW**
- is_verified (Boolean)
- is_active (Boolean)
- created_at (DateTime)
- updated_at (DateTime)

### Drivers Table
- id (UUID, PK)
- phone (String, Unique)
- name (String)
- email (String, Unique)
- password_hash (String)
- vehicle_number (String)
- vehicle_type (String)
- is_online (Boolean)
- is_verified (Boolean)
- is_active (Boolean)
- created_at (DateTime)
- updated_at (DateTime)

### Rides Table
- id (UUID, PK)
- user_id (UUID, FK)
- driver_id (UUID, FK, Nullable)
- pickup_location (String)
- dropoff_location (String)
- pickup_lat (Float)
- pickup_lng (Float)
- dropoff_lat (Float)
- dropoff_lng (Float)
- status (Enum: pending, accepted, started, completed, cancelled)
- fare (Float)
- payment_status (Enum: pending, completed, failed)
- payment_method (String)
- created_at (DateTime)
- updated_at (DateTime)

### Admins Table
- id (UUID, PK)
- username (String, Unique)
- email (String, Unique)
- password_hash (String)
- is_active (Boolean)
- created_at (DateTime)

## Authentication Flow

1. User/Driver sends phone + password
2. Backend validates credentials
3. Generate JWT access + refresh tokens
4. For new users: send static OTP 123456
5. User verifies OTP (always accepts 123456)
6. Return tokens

## Booking Flow

1. Customer creates booking (pickup, dropoff)
2. System finds available drivers (is_online=true)
3. Driver accepts ride
4. Ride status: pending → accepted → started → completed
5. Mock payment processed
6. Ride saved to history

## Driver Flow

1. Driver sets online/offline status
2. When online, receive ride requests
3. Accept/Reject rides
4. Complete rides
5. View earnings (mocked)

## Admin Flow

1. Admin logs in with username/password
2. View dashboard with statistics
3. Manage users (block/unblock)
4. Manage drivers (block/unblock)
5. View all rides

## API Authentication

- JWT Bearer Token
- Access Token: 30 minutes expiry
- Refresh Token: 7 days expiry
- Role-based access (user, driver, admin)

## Simulated Features

### OTP Service
```python
def verify_otp(phone: str, otp: str) -> bool:
    return otp == "123456"  # Always accept static OTP
```

### Payment Service
```python
def process_payment(ride_id: str, amount: float) -> dict:
    return {
        "status": "success",
        "transaction_id": f"MOCK_{uuid4()}",
        "amount": amount
    }
```

### Location Service
```python
def find_nearby_drivers(lat: float, lng: float) -> list:
    # Return random online drivers
    return get_online_drivers()
```
