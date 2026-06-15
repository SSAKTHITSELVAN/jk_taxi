# JK Taxi - MVP Taxi Booking Platform

## 🚀 Backend Status: ✅ RUNNING

FastAPI backend is fully functional with all authentication and booking APIs.

## 📍 Quick Start

### Backend Server
```bash
# Activate virtual environment
source ~/billion/bin/activate

# Start FastAPI server
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Access Points
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 🔐 Default Credentials

### Admin
- **Username**: `admin`
- **Password**: `admin123`

### Test User (already created)
- **Phone**: `9876543210`
- **Password**: `password123`

### Static OTP
- **OTP Code**: `123456` (works for any phone number)

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - Verify OTP (static 123456)
- `POST /api/auth/driver/register` - Register driver
- `POST /api/auth/driver/login` - Driver login
- `POST /api/auth/admin/login` - Admin login

### User APIs
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Booking APIs
- `POST /api/bookings` - Create new ride booking
- `GET /api/bookings/{ride_id}` - Get ride details
- `GET /api/bookings/active` - Get active ride
- `PUT /api/bookings/{ride_id}/cancel` - Cancel ride
- `POST /api/bookings/{ride_id}/payment` - Mock payment
- `GET /api/bookings/history/all` - Get ride history

### Driver APIs
- `GET /api/driver/profile` - Get driver profile
- `PUT /api/driver/profile` - Update driver profile
- `PUT /api/driver/status` - Update online/offline status
- `GET /api/driver/rides/available` - Get available rides
- `POST /api/driver/rides/{ride_id}/accept` - Accept ride
- `POST /api/driver/rides/{ride_id}/reject` - Reject ride
- `POST /api/driver/rides/{ride_id}/start` - Start ride
- `POST /api/driver/rides/{ride_id}/complete` - Complete ride
- `GET /api/driver/rides/history` - Get ride history
- `GET /api/driver/earnings` - Get mock earnings

### Admin APIs
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/drivers` - Get all drivers
- `GET /api/admin/rides` - Get all rides
- `PUT /api/admin/users/{user_id}/block` - Block user
- `PUT /api/admin/users/{user_id}/unblock` - Unblock user
- `PUT /api/admin/drivers/{driver_id}/block` - Block driver
- `PUT /api/admin/drivers/{driver_id}/unblock` - Unblock driver

## 🧪 Testing APIs

### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "1234567890",
    "password": "password123"
  }'
```

### Create Booking (requires auth token)
```bash
curl -X POST http://localhost:8000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "pickup_location": "MG Road, Bangalore",
    "dropoff_location": "Koramangala, Bangalore",
    "pickup_lat": 12.9716,
    "pickup_lng": 77.5946,
    "dropoff_lat": 12.9352,
    "dropoff_lng": 77.6245,
    "payment_method": "cash"
  }'
```

## 🗄️ Database

Using AWS RDS PostgreSQL:
- **Host**: bizzapdb.c3iya6wc0708.ap-south-1.rds.amazonaws.com
- **Database**: jktaxi
- **Port**: 5432

### Database Tables
- `users` - Customer accounts
- `drivers` - Driver accounts
- `rides` - Ride bookings
- `admins` - Admin accounts

## 📦 Tech Stack

### Backend
- FastAPI 0.136.1
- Python 3.14.4
- SQLAlchemy 2.0.49
- Alembic 1.18.4
- PostgreSQL (AWS RDS)
- JWT Authentication
- BCrypt Password Hashing

## 🔧 Project Structure

```
jk_taxi/
├── AI_CONTEXT/              # Memory files for Claude Code
├── backend/
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   ├── auth/       # Authentication
│   │   │   ├── user/       # User endpoints
│   │   │   ├── driver/     # Driver endpoints
│   │   │   ├── booking/    # Booking endpoints
│   │   │   └── admin/      # Admin endpoints
│   │   ├── core/           # Config, security
│   │   ├── db/             # Database setup
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── main.py         # FastAPI app
│   ├── alembic/            # Database migrations
│   ├── create_admin.py     # Admin creation script
│   └── requirements.txt
├── .env                    # Environment variables
└── README.md
```

## 🎯 Features Implemented

✅ User registration and login  
✅ Driver registration and login  
✅ Admin login  
✅ JWT authentication  
✅ Static OTP verification (123456)  
✅ User profile management  
✅ Driver profile management  
✅ Ride booking creation  
✅ Ride cancellation  
✅ Driver online/offline status  
✅ Driver accept/reject rides  
✅ Ride status management  
✅ Mock payment processing  
✅ Ride history  
✅ Driver earnings (mock)  
✅ Admin dashboard statistics  
✅ Admin user/driver management  
✅ Block/Unblock functionality  

## 🚧 Next Steps

### Frontend (Pending)
- Expo React Native setup
- Customer app screens
- Driver app screens
- Admin dashboard UI

## 📝 Notes

- This is an MVP with simulated integrations
- OTP is static: `123456`
- Payment is mocked
- No real maps/GPS integration yet
- All simulations are functional for testing
