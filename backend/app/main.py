from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.forms import router as form_router
from app.api.ai import router as ai_router
from app.database.database import Base, engine

from app.models.user import User
from app.models.form import Form
from app.models.response import Response
from app.models.form_share import FormShare

# =========================================================
# CREATE APP
# =========================================================

app = FastAPI(
    title="Smart Form Builder API"
)

# =========================================================
# CORS
# =========================================================

origins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5501",
    "http://localhost:5501",
    "http://127.0.0.1:5502",
    "http://localhost:5502",
]


app.add_middleware(

    CORSMiddleware,

    allow_origins=origins,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]

)


# =========================================================
# DATABASE TABLES
# =========================================================

Base.metadata.create_all(
    bind=engine
)


# =========================================================
# ROUTERS
# =========================================================

app.include_router(
    auth_router
)

app.include_router(
    form_router
)
app.include_router(
    ai_router
)

# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "message":
        "Smart Form Builder Backend is Running!"
    }