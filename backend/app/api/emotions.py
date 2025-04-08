from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.db_models import EmotionCategory, SubEmotion
from typing import List, Optional
from app.schemas.emotion import EmotionCategoryResponse, SubEmotionResponse
from fastapi import Depends


router = APIRouter()

@router.get("/categories", response_model=List[EmotionCategoryResponse])
async def get_emotion_categories(db: Session = Depends(get_db)):
    try:
        categories = db.query(EmotionCategory).all()
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sub-emotions", response_model=List[SubEmotionResponse])

async def get_sub_emotions(
    category: Optional[str] = Query(None, description="Filter by emotion category. Valid categories: happy, sad, angry, anxious, calm. Example sub-emotions by category:\n"
                                                    "- Happy: Joyful, Grateful, Excited, Content, Proud, Peaceful, Hopeful, Inspired, Loved, Cheerful\n"
                                                    "- Sad: Lonely, Disappointed, Hurt, Grief, Regretful, Hopeless, Melancholic, Empty, Heartbroken, Vulnerable\n"
                                                    "- Angry: Frustrated, Irritated, Resentful, Jealous, Betrayed, Furious, Bitter, Disgusted, Outraged, Hostile\n"
                                                    "- Anxious: Nervous, Worried, Stressed, Insecure, Fearful, Panicked, Uneasy, Restless, Doubtful, Overwhelmed\n"
                                                    "- Calm: Relaxed, Mindful, Centered, Balanced, Serene, Tranquil, Peaceful, Grounded, Harmonious, Soothed"),
    db: Session = Depends(get_db)
):

    try:
        query = db.query(SubEmotion)
        if category:
            query = query.join(EmotionCategory).filter(EmotionCategory.name == category)
        sub_emotions = query.all()
        return sub_emotions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
