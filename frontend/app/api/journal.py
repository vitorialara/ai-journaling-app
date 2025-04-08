from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.journal import JournalEntry, JournalEntryCreate, JournalEntryUpdate
from app.schemas.journal import JournalEntry as JournalEntryDB
import uuid
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[JournalEntry])
async def get_journal_entries(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    entries = db.query(JournalEntryDB).offset(skip).limit(limit).all()
    return entries

@router.get("/{entry_id}", response_model=JournalEntry)
async def get_journal_entry(
    entry_id: str,
    db: Session = Depends(get_db)
):
    entry = db.query(JournalEntryDB).filter(JournalEntryDB.id == entry_id).first()
    if entry is None:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return entry

@router.post("/", response_model=JournalEntry)
async def create_journal_entry(
    entry: JournalEntryCreate,
    db: Session = Depends(get_db)
):
    db_entry = JournalEntryDB(
        id=str(uuid.uuid4()),
        userId="user1",  # TODO: Get from auth
        **entry.model_dump()
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.patch("/{entry_id}", response_model=JournalEntry)
async def update_journal_entry(
    entry_id: str,
    update: JournalEntryUpdate,
    db: Session = Depends(get_db)
):
    db_entry = db.query(JournalEntryDB).filter(JournalEntryDB.id == entry_id).first()
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    # Add the new reflection
    new_reflection = {
        "prompt": update.promptText,
        "response": update.reflectionText,
        "timestamp": datetime.utcnow()
    }
    if not db_entry.reflections:
        db_entry.reflections = []
    db_entry.reflections.append(new_reflection)

    db.commit()
    db.refresh(db_entry)
    return db_entry
