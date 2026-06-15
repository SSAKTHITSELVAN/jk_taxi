# JK Taxi - Project Overview

## Project Name
JK Taxi - MVP Taxi Booking Platform

## Goal
Build a production-style MVP taxi booking platform with simulated integrations (OTP, Payment, Maps, GPS).

## Tech Stack

### Backend
- FastAPI (Python 3.14.4)
- PostgreSQL (Database)
- Redis (Caching/Sessions)
- SQLAlchemy 2 (ORM)
- Alembic (Migrations)
- JWT Authentication
- Pydantic v2 (Validation)

### Frontend
- Expo React Native
- TypeScript
- Expo Router
- Zustand (State Management)
- React Query (API Integration)
- Axios (HTTP Client)
- NativeWind (Styling)

### Environment
- Node.js v24.15.0
- npm 11.12.1
- Docker & Docker Compose

## MVP Scope - Phase 1

### Features
1. **Customer App**
   - Login/Register with static OTP (123456)
   - Dynamic profile management with edit functionality
   - Emergency contact (mandatory for safety)
   - Emergency SOS button during active rides
   - Book ride with simulated map
   - Cancel ride at any time (pending/accepted/started)
   - View ride history
   - Mock payment flow
   - Driver tracking simulation

2. **Driver App**
   - Login/Register
   - Dynamic profile management with edit functionality
   - Vehicle information management
   - Online/Offline toggle
   - Accept/Reject rides
   - Start/Complete rides
   - View ride history
   - Mock earnings UI

3. **Admin Dashboard**
   - Admin login
   - Dashboard with statistics
   - View users/drivers/rides
   - Block/Unblock users
   - Block/Unblock drivers
   - Basic analytics

### Simulations (NO REAL INTEGRATIONS)
- **OTP**: Static code `123456`
- **Payment**: Mock success screen
- **Maps**: Static coordinates
- **GPS**: Simulated driver movement

## Folder Structure

```
jk-taxi/
├── AI_CONTEXT/           # Memory files for Claude Code
├── apps/
│   ├── customer-app/     # Expo customer app
│   └── driver-app/       # Expo driver app
├── backend/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── core/         # Config, security
│   │   ├── db/           # Database setup
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   ├── repositories/ # Data access
│   │   ├── utils/        # Utilities
│   │   └── main.py       # FastAPI app
│   ├── alembic/          # DB migrations
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

## UI Theme
- Purple neon accent
- Dark background
- White typography
- Rounded cards
- Premium minimal design
- Smooth animations

## Architecture Pattern
- Repository Pattern (Data Access)
- Service Layer (Business Logic)
- API Layer (Routes)
- Clean separation of concerns
