from routers.reservation import router as reservation_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from database import engine
from models import Base
from routers.menu import router as menu_router

app = FastAPI(
    title="Restaurant Management API",
    description="Backend API for Restaurant Website",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://restaurant-management-system-gilt.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(menu_router)
app.include_router(reservation_router)

@app.get("/")
def home():
    return {
        "message": "Restaurant Backend is Running Successfully!"
    }