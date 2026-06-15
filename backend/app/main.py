from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.auth import routes as auth_routes
from app.api.user import routes as user_routes
from app.api.driver import routes as driver_routes
from app.api.booking import routes as booking_routes
from app.api.admin import routes as admin_routes
from app.api.booking_enhanced import routes as booking_enhanced_routes
from app.api.driver_enhanced import routes as driver_enhanced_routes
from app.api.user_enhanced import routes as user_enhanced_routes
from app.api.admin_enhanced import routes as admin_enhanced_routes

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.API_VERSION,
    debug=settings.DEBUG
)

# CORS - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}

# Include routers
app.include_router(auth_routes.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(user_routes.router, prefix="/api/user", tags=["User"])
app.include_router(driver_routes.router, prefix="/api/driver", tags=["Driver"])
app.include_router(booking_routes.router, prefix="/api/bookings", tags=["Booking"])
app.include_router(admin_routes.router, prefix="/api/admin", tags=["Admin"])

# Enhanced v2 routers with full features
app.include_router(booking_enhanced_routes.router, prefix="/api/v2/bookings", tags=["Booking Enhanced"])
app.include_router(driver_enhanced_routes.router, prefix="/api/v2/driver", tags=["Driver Enhanced"])
app.include_router(user_enhanced_routes.router, prefix="/api/v2/user", tags=["User Enhanced"])
app.include_router(admin_enhanced_routes.router, prefix="/api/v2/admin", tags=["Admin Enhanced"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to JK Taxi API",
        "version": settings.API_VERSION,
        "docs": "/docs",
        "redoc": "/redoc"
    }
