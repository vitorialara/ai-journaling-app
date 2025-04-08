from pydantic import BaseModel, Field
from typing import List, Optional

class EmotionCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None

class EmotionCategoryCreate(EmotionCategoryBase):
    pass

class EmotionCategoryResponse(EmotionCategoryBase):
    id: int

    class Config:
        from_attributes = True

class SubEmotionBase(BaseModel):
    name: str
    description: Optional[str] = None
    intensity: int = Field(ge=1, le=10)
    category_id: int

class SubEmotionCreate(SubEmotionBase):
    pass

class SubEmotionResponse(SubEmotionBase):
    id: int
    category_id: int

    class Config:
        from_attributes = True
