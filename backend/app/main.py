from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models.user import User
from app.models.progress import Progress
from app.models.goal import Goal
from app.models.workout import Workout
from app.models.notification import Notification

from app.routers.auth import router as auth_router
from app.routers.workouts import router as workouts_router
from app.routers.progress import router as progress_router
from app.routers.goals import router as goals_router
from app.routers.reports import router as reports_router
from app.routers.notifications import router as notifications_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FitTrack API",
    description="Fitness and Workout Management Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(workouts_router)
app.include_router(progress_router)
app.include_router(goals_router)
app.include_router(reports_router)
app.include_router(notifications_router)


@app.get("/")
def home():
    return {"message": "Welcome to FitTrack API"}

