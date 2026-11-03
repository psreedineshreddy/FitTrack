import os
from datetime import timedelta

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "fittrack-development-secret-key-change-before-production"
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 30
