from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, JSON, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(50), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class EmotionCategory(Base):
    __tablename__ = "emotion_categories"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)
    description = Column(Text)
    color = Column(String(7))  # Hex color code
    icon = Column(String(50))  # Icon name or path

    sub_emotions = relationship("SubEmotion", back_populates="category")
    prompts = relationship("Prompt", back_populates="category")

class SubEmotion(Base):
    __tablename__ = "sub_emotions"

    id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey("emotion_categories.id"), nullable=False)
    name = Column(String(50), nullable=False)
    description = Column(Text)
    intensity = Column(Integer)

    category = relationship("EmotionCategory", back_populates="sub_emotions")

class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey("emotion_categories.id"))
    text = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)

    category = relationship("EmotionCategory", back_populates="prompts")

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("emotion_categories.id"))
    sub_emotion_id = Column(Integer, ForeignKey("sub_emotions.id"))
    text = Column(Text, nullable=False)
    photo_url = Column(Text, nullable=True)
    reflections = Column(JSON, nullable=False, server_default='[]')
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    category = relationship("EmotionCategory")
    sub_emotion = relationship("SubEmotion")

class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    emotion_counts = Column(JSON, nullable=False, server_default='{}')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
