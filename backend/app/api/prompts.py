from fastapi import APIRouter, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.db_models import Prompt, EmotionCategory
from typing import List, Optional
from app.schemas.prompt import PromptResponse
from fastapi import Depends

router = APIRouter()

@router.get("", response_model=List[PromptResponse])

async def get_prompts(
    category: Optional[str] = Query(None, description="Filter by emotion category"),
    db: Session = Depends(get_db)
):

    try:
        query = db.query(Prompt)
        if category:
            query = query.join(EmotionCategory).filter(EmotionCategory.name == category)
        prompts = query.all()
        return prompts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
