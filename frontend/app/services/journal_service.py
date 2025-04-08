from sqlalchemy.orm import Session
from app.models.journal import JournalEntryCreate, JournalEntryUpdate
from app.schemas.journal import JournalEntry as JournalEntryDB
from typing import List, Optional
import uuid
from datetime import datetime

def get_entries(db: Session, skip: int = 0, limit: int = 100) -> List[JournalEntryDB]:
    return db.query(JournalEntryDB).offset(skip).limit(limit).all()

def get_entry(db: Session, entry_id: str) -> Optional[JournalEntryDB]:
    return db.query(JournalEntryDB).filter(JournalEntryDB.id == entry_id).first()

def create_entry(db: Session, entry: JournalEntryCreate) -> JournalEntryDB:
    db_entry = JournalEntryDB(
        id=str(uuid.uuid4()),
        **entry.model_dump()
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

def update_entry(db: Session, entry_id: str, update: JournalEntryUpdate) -> Optional[JournalEntryDB]:
    db_entry = get_entry(db, entry_id)
    if db_entry is None:
        return None

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
