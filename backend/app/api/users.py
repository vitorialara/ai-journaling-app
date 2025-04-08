from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.db_models import User as UserDB
from app.schemas.user import UserCreate, UserResponse, UserUpdate
import bcrypt
import logging
import time
import uuid
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

def get_password_hash(password: str) -> str:
    # Use a lower number of rounds for testing
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(rounds=4)).decode('utf-8')

@router.post("/", response_model=UserResponse)
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    try:
        # Check if user already exists
        existing_user = db.query(UserDB).filter(
            (UserDB.email == user.email) | (UserDB.username == user.username)
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email or username already registered"
            )

        # Create new user
        db_user = UserDB(
            id=str(uuid.uuid4()),
            email=user.email,
            username=user.username,
            hashed_password=get_password_hash(user.password),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: Session = Depends(get_db)
):
    try:
        user = db.query(UserDB).filter(UserDB.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    db: Session = Depends(get_db)
):
    try:
        db_user = db.query(UserDB).filter(UserDB.id == user_id).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update fields if provided
        if user_update.email is not None:
            db_user.email = user_update.email
        if user_update.username is not None:
            db_user.username = user_update.username
        if user_update.password is not None:
            db_user.hashed_password = get_password_hash(user_update.password)

        db_user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db)
):
    try:
        db_user = db.query(UserDB).filter(UserDB.id == user_id).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

        db.delete(db_user)
        db.commit()
        return {"message": "User deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
