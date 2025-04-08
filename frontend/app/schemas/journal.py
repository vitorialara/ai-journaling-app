from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(String, primary_key=True, index=True)
    userId = Column(String, index=True)
    category = Column(String)  # happy, sad, angry, anxious, calm
    subEmotion = Column(String)
    text = Column(String)
    photoUrl = Column(String, nullable=True)
    reflections = Column(JSON, default=list)  # Store reflections as JSON
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
