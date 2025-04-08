from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

class Reflection(BaseModel):
    prompt: str
    response: str
    timestamp: datetime

class JournalEntryBase(BaseModel):
    user_id: str
    category_id: int
    sub_emotion_id: int
    text: str
    photo_url: Optional[str] = None
    reflections: List[dict] = Field(default_factory=list)

class JournalEntryCreate(JournalEntryBase):
    pass

class JournalEntryUpdate(BaseModel):
    reflection_text: Optional[str] = None
    prompt_text: Optional[str] = None

class JournalEntryResponse(BaseModel):
    id: str
    user_id: str = Field(alias="userId")
    category: str
    sub_emotion: str = Field(alias="subEmotion")
    text: str
    photo_url: Optional[str] = Field(None, alias="photoUrl")
    reflections: List[dict] = Field(default_factory=list)
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        json_encoders={
            datetime: lambda dt: dt.isoformat()
        }
    )

class ReflectionCreate(BaseModel):
    prompt: str
    response: str

class EmotionalPattern(BaseModel):
    emotion: str
    count: int
    percentage: float

class MoodChange(BaseModel):
    date: datetime
    emotion: str
    intensity: float

class WeeklySummaryResponse(BaseModel):
    emotionalPatterns: List[EmotionalPattern]
    keyThemes: List[str]
    moodChanges: List[MoodChange]
    personalizedInsights: str
    period: str
    startDate: datetime
    endDate: datetime
    isAI: bool

    model_config = ConfigDict(from_attributes=True)
