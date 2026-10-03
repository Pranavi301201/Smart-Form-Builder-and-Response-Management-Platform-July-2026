from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

import secrets

from app.database.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserResponse,
    GoogleAuthRequest
)
from app.core.security import hash_password, verify_password
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)
# =========================================================
# GOOGLE AUTHENTICATION
# =========================================================

GOOGLE_CLIENT_ID = "245640416146-uvnosr1m7sm9g2etg4ubba9rhojlbti4.apps.googleusercontent.com"

@router.get("/")
def auth_home():
    return {"message": "Authentication API Working"}


# ---------------- REGISTER ----------------

@router.post("/register", response_model=UserResponse)
def register(user: UserRegister, db: Session = Depends(get_db)):

    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    # Create new user
    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password),
        role="user"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# ---------------- LOGIN ----------------

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    # Find user by email
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid Email")

    # Verify password
    if not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid Password")

    return {
        "message": "Login Successful",
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role
        }
    }
# ---------------- GOOGLE AUTH ----------------

@router.post("/google")
def google_auth(
    google_data: GoogleAuthRequest,
    db: Session = Depends(get_db)
):

    try:

        # Verify Google ID token

        google_user = id_token.verify_oauth2_token(
            google_data.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )

    except ValueError:

        raise HTTPException(
            status_code=401,
            detail="Invalid Google credential"
        )


    # Get verified Google user details

    email = google_user.get("email")
    name = google_user.get("name")


    if not email:

        raise HTTPException(
            status_code=400,
            detail="Google account email not found"
        )


    # Find user in database

    db_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )


    # =====================================================
    # GOOGLE REGISTER
    # =====================================================

    if google_data.action == "register":

        # User already exists

        if db_user:

            raise HTTPException(
                status_code=409,
                detail=(
                    "You already have an account. "
                    "Please login."
                )
            )


        # Create new Google user

        random_password = secrets.token_urlsafe(32)


        new_user = User(

            name=name or email.split("@")[0],

            email=email,

            password_hash=hash_password(
                random_password
            ),

            role="user"

        )


        db.add(new_user)

        db.commit()

        db.refresh(new_user)


        return {

            "message":
                "Google account created successfully",

            "user": {

                "id": new_user.id,

                "name": new_user.name,

                "email": new_user.email,

                "role": new_user.role

            }

        }


    # =====================================================
    # GOOGLE LOGIN
    # =====================================================

    if google_data.action == "login":

        # User does not have an account

        if not db_user:

            raise HTTPException(
                status_code=404,
                detail=(
                    "No account found with this Google account. "
                    "Please create an account first."
                )
            )


        # Existing user login successful

        return {

            "message":
                "Google Login Successful",

            "user": {

                "id": db_user.id,

                "name": db_user.name,

                "email": db_user.email,

                "role": db_user.role

            }

        }


    # =====================================================
    # INVALID ACTION
    # =====================================================

    raise HTTPException(
        status_code=400,
        detail="Invalid authentication action"
    )