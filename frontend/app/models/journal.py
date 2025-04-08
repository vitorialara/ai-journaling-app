from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ReflectionBase(BaseModel):
    prompt: str
    response: str
    timestamp: datetime

class JournalEntryBase(BaseModel):
    category: str  # "happy", "sad", "angry", "anxious", "calm"
    subEmotion: str
    text: str
    photoUrl: Optional[str] = None
    createdAt: Optional[datetime] = None

class JournalEntryCreate(JournalEntryBase):
    pass

class JournalEntryUpdate(BaseModel):
    reflectionText: str
    promptText: str

class JournalEntry(JournalEntryBase):
    id: str
    userId: str
    reflections: List[ReflectionBase]

    class Config:
        from_attributes = True
