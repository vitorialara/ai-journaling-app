from pydantic import BaseModel
from typing import Optional

class PromptBase(BaseModel):
    text: str
    is_active: bool = True

class PromptCreate(PromptBase):
    pass

class PromptResponse(PromptBase):
    id: int
    category_id: Optional[int] = None

    class Config:
        from_attributes = True
