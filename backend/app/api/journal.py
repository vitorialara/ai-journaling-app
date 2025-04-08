from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.db_models import JournalEntry as JournalEntryDB, EmotionCategory, SubEmotion
from app.schemas.journal import (
    JournalEntryCreate,
    JournalEntryResponse,
    ReflectionCreate,
    WeeklySummaryResponse,
    EmotionalPattern,
    MoodChange
)
import uuid
from datetime import datetime, timedelta
import logging
import openai
import os
import json
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# List of positive quotes
POSITIVE_QUOTES = [
    "Every day is a new beginning. Take a deep breath and start again.",
    "You are stronger than you think, braver than you believe, and smarter than you know.",
    "The only way to do great work is to love what you do.",
    "Your present circumstances don't determine where you can go; they merely determine where you start.",
    "Believe you can and you're halfway there.",
    "The best way to predict your future is to create it.",
    "You are never too old to set another goal or to dream a new dream.",
    "Every moment is a fresh beginning.",
    "You are enough just as you are.",
    "The sun will rise and we will try again.",
    "Your potential is endless. Go do what you were created to do.",
    "Today is a perfect day to start something new.",
    "You are capable of amazing things.",
    "The only limit to our realization of tomorrow is our doubts of today.",
    "You are braver than you believe, stronger than you seem, and smarter than you think."
]

router = APIRouter()

@router.get("/", response_model=List[JournalEntryResponse])
async def get_user_journal_entries(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    try:
        # Sort entries by created_at in descending order (newest first)
        entries = db.query(JournalEntryDB).order_by(JournalEntryDB.created_at.desc()).offset(skip).limit(limit).all()

        # If no entries found, return an empty list
        if not entries:
            logger.info("No journal entries found")
            return []

        # Map database entries to response model
        response_entries = []
        for entry in entries:
            # Get category and sub-emotion names
            category = db.query(EmotionCategory).filter(EmotionCategory.id == entry.category_id).first()
            sub_emotion = db.query(SubEmotion).filter(SubEmotion.id == entry.sub_emotion_id).first()

            if not category or not sub_emotion:
                logger.warning(f"Skipping entry {entry.id} due to missing category or sub-emotion")
                continue

            response_entry = JournalEntryResponse(
                id=entry.id,
                userId=entry.user_id,
                category=category.name,
                subEmotion=sub_emotion.name,
                text=entry.text,
                photoUrl=entry.photo_url,
                reflections=entry.reflections,
                createdAt=entry.created_at,
                updatedAt=entry.updated_at
            )
            response_entries.append(response_entry)
        return response_entries
    except Exception as e:
        logger.error(f"Error fetching journal entries: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{entry_id}", response_model=JournalEntryResponse)
async def get_journal_entry(entry_id: str, db: Session = Depends(get_db)):
    try:
        entry = db.query(JournalEntryDB).filter(JournalEntryDB.id == entry_id).first()
        if entry is None:
            logger.info(f"No journal entry found with ID: {entry_id}")
            random_quote = random.choice(POSITIVE_QUOTES)
            return JournalEntryResponse(
                id="",
                userId="",
                category="",
                subEmotion="",
                text=random_quote,
                photoUrl="",
                reflections=[],
                createdAt=datetime.utcnow(),
                updatedAt=datetime.utcnow()
            )

        # Validate UUID format only if entry exists
        try:
            uuid.UUID(entry_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid UUID format")

        # Get category and sub-emotion names
        category = db.query(EmotionCategory).filter(EmotionCategory.id == entry.category_id).first()
        sub_emotion = db.query(SubEmotion).filter(SubEmotion.id == entry.sub_emotion_id).first()

        if not category or not sub_emotion:
            logger.warning(f"Missing category or sub-emotion for entry {entry_id}")
            random_quote = random.choice(POSITIVE_QUOTES)
            return JournalEntryResponse(
                id=entry.id,
                userId=entry.user_id,
                category="",
                subEmotion="",
                text=random_quote,
                photoUrl=entry.photo_url,
                reflections=entry.reflections or [],
                createdAt=entry.created_at,
                updatedAt=entry.updated_at
            )

        # Create response model
        response = JournalEntryResponse(
            id=entry.id,
            userId=entry.user_id,
            category=category.name,
            subEmotion=sub_emotion.name,
            text=entry.text,
            photoUrl=entry.photo_url,
            reflections=entry.reflections or [],
            createdAt=entry.created_at,
            updatedAt=entry.updated_at
        )
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching journal entry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=JournalEntryResponse)
async def create_journal_entry(
    entry: JournalEntryCreate,
    db: Session = Depends(get_db)
):
    try:
        logger.info("Creating new journal entry")

        # Verify category exists
        category = db.query(EmotionCategory).filter(EmotionCategory.id == entry.category_id).first()
        if not category:
            raise HTTPException(status_code=400, detail=f"Invalid category ID: {entry.category_id}")

        # Verify sub-emotion exists and belongs to the category
        sub_emotion = db.query(SubEmotion).filter(
            SubEmotion.id == entry.sub_emotion_id,
            SubEmotion.category_id == entry.category_id
        ).first()
        if not sub_emotion:
            raise HTTPException(status_code=400, detail=f"Invalid sub-emotion ID: {entry.sub_emotion_id} for category: {entry.category_id}")

        # Create database entry
        db_entry = JournalEntryDB(
            id=str(uuid.uuid4()),
            user_id=entry.user_id,
            category_id=entry.category_id,
            sub_emotion_id=entry.sub_emotion_id,
            text=entry.text,
            photo_url=entry.photo_url,
            reflections=entry.reflections or []
        )
        db.add(db_entry)
        db.commit()
        db.refresh(db_entry)

        # Create response model
        response = JournalEntryResponse(
            id=db_entry.id,
            userId=db_entry.user_id,
            category=category.name,
            subEmotion=sub_emotion.name,
            text=entry.text,
            photoUrl=db_entry.photo_url,
            reflections=entry.reflections or [],
            createdAt=db_entry.created_at,
            updatedAt=db_entry.updated_at
        )
        return response
    except Exception as e:
        logger.error(f"Error creating journal entry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{entry_id}", response_model=JournalEntryResponse)
async def update_journal_entry(
    entry_id: str,
    reflection: ReflectionCreate,
    db: Session = Depends(get_db)
):
    try:
        entry = db.query(JournalEntryDB).filter(JournalEntryDB.id == entry_id).first()
        if entry is None:
            raise HTTPException(status_code=404, detail="Journal entry not found")

        # Initialize reflections array if it's None or empty
        if entry.reflections is None or entry.reflections == []:
            entry.reflections = []

        # Create the new reflection
        new_reflection = {
            "prompt": reflection.prompt,
            "response": reflection.response,
            "timestamp": datetime.utcnow().isoformat()
        }

        # Add the reflection to the entry's reflections list
        entry.reflections = entry.reflections + [new_reflection]

        db.commit()
        db.refresh(entry)

        # Get category and sub-emotion names
        category = db.query(EmotionCategory).filter(EmotionCategory.id == entry.category_id).first()
        sub_emotion = db.query(SubEmotion).filter(SubEmotion.id == entry.sub_emotion_id).first()

        if not category or not sub_emotion:
            raise HTTPException(status_code=404, detail="Journal entry data not found")

        # Create response model
        response = JournalEntryResponse(
            id=entry.id,
            userId=entry.user_id,
            category=category.name,
            subEmotion=sub_emotion.name,
            text=entry.text,
            photoUrl=entry.photo_url,
            reflections=entry.reflections,
            createdAt=entry.created_at,
            updatedAt=entry.updated_at
        )
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating journal entry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}", response_model=List[JournalEntryResponse])
async def get_user_journal_entries_by_user_id(
    user_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    try:
        # Add sorting by created_at in descending order (newest first)
        entries = db.query(JournalEntryDB)\
            .filter(JournalEntryDB.user_id == user_id)\
            .order_by(JournalEntryDB.created_at.desc())\
            .offset(skip)\
            .limit(limit)\
            .all()
        # Map database entries to response model
        response_entries = []
        for entry in entries:
            # Get category and sub-emotion names
            category = db.query(EmotionCategory).filter(EmotionCategory.id == entry.category_id).first()
            sub_emotion = db.query(SubEmotion).filter(SubEmotion.id == entry.sub_emotion_id).first()

            if not category or not sub_emotion:
                logger.warning(f"Skipping entry {entry.id} due to missing category or sub-emotion")
                continue

            response_entry = JournalEntryResponse(
                id=entry.id,
                userId=entry.user_id,
                category=category.name,
                subEmotion=sub_emotion.name,
                text=entry.text,
                photoUrl=entry.photo_url,
                reflections=entry.reflections,
                createdAt=entry.created_at,
                updatedAt=entry.updated_at
            )
            response_entries.append(response_entry)
        return response_entries
    except Exception as e:
        logger.error(f"Error fetching journal entries for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/weekly-summary", response_model=WeeklySummaryResponse)
async def get_weekly_summary(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a weekly summary of journal entries including emotional patterns,
    key themes, mood changes, and personalized insights.
    """
    try:
        logger.info(f"Starting weekly summary generation for user_id: {user_id}")

        # Get entries from the last 7 days
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)

        logger.info(f"Querying entries between {start_date} and {end_date}")

        entries = db.query(JournalEntryDB).filter(
            JournalEntryDB.user_id == user_id,
            JournalEntryDB.created_at >= start_date,
            JournalEntryDB.created_at <= end_date
        ).all()

        logger.info(f"Found {len(entries)} entries for user {user_id}")

        # If no entries found, return a summary with a positive quote
        if not entries:
            logger.info(f"No entries found for user {user_id} in the specified period")
            random_quote = random.choice(POSITIVE_QUOTES)
            return WeeklySummaryResponse(
                emotionalPatterns=[],
                keyThemes=[],
                moodChanges=[],
                personalizedInsights=f"{random_quote} Start journaling to track your emotional journey and gain deeper insights!",
                period="week",
                startDate=start_date,
                endDate=end_date,
                isAI=False
            )

        # Initialize analysis data
        emotional_patterns = []
        key_themes = []
        mood_changes = []
        entries_text = []

        # Analyze emotional patterns
        emotion_counts = {}
        logger.info("Analyzing emotional patterns...")
        for entry in entries:
            category = db.query(EmotionCategory).filter(EmotionCategory.id == entry.category_id).first()
            if category:
                emotion_counts[category.name] = emotion_counts.get(category.name, 0) + 1
                entries_text.append(entry.text)
                logger.debug(f"Entry {entry.id}: Category {category.name}, Text length: {len(entry.text)}")
            else:
                logger.warning(f"Missing category for entry {entry.id}")

        # Convert emotion counts to patterns
        for emotion, count in emotion_counts.items():
            emotional_patterns.append(EmotionalPattern(
                emotion=emotion,
                count=count,
                percentage=(count / len(entries)) * 100 if entries else 0
            ))
        logger.info(f"Emotional patterns: {emotional_patterns}")

        # Analyze key themes (simple implementation - can be enhanced with NLP)
        themes = set()
        for entry in entries:
            words = entry.text.lower().split()
            themes.update(words[:5])  # Just a simple example
        key_themes = list(themes)[:5]  # Limit to top 5 themes
        logger.info(f"Key themes identified: {key_themes}")

        # Track mood changes
        logger.info("Tracking mood changes...")
        for entry in entries:
            category = db.query(EmotionCategory).filter(EmotionCategory.id == entry.category_id).first()
            if category:
                mood_changes.append(MoodChange(
                    date=entry.created_at,
                    emotion=category.name,
                    intensity=1.0  # Can be enhanced with actual intensity calculation
                ))
                logger.debug(f"Mood change: {entry.created_at} - {category.name}")
            else:
                logger.warning(f"Missing category for mood change entry {entry.id}")

        # Generate personalized insights using OpenAI
        logger.info("Generating personalized insights...")
        personalized_insights = generate_insights(emotional_patterns, mood_changes, entries_text)
        logger.info("Insights generation completed")

        return WeeklySummaryResponse(
            emotionalPatterns=emotional_patterns,
            keyThemes=key_themes,
            moodChanges=mood_changes,
            personalizedInsights=personalized_insights,
            period="week",
            startDate=start_date,
            endDate=end_date,
            isAI=True
        )
    except Exception as e:
        logger.error(f"Error generating weekly summary: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

def generate_insights(emotional_patterns, mood_changes, entries_text=None):
    """
    Generate personalized insights using OpenAI for sophisticated analysis.
    """
    if not emotional_patterns:
        logger.info("No emotional patterns provided for insights generation")
        return "No entries found for this period. Start journaling to get insights!"

    try:
        logger.info("Preparing data for OpenAI analysis")
        # Prepare the data for OpenAI
        analysis_data = {
            "emotional_patterns": emotional_patterns,
            "mood_changes": mood_changes,
            "entries_text": entries_text or []
        }

        # Create the prompt for OpenAI
        prompt = f"""
        Analyze the following journal entry data and provide personalized insights:

        Emotional Patterns:
        {json.dumps(emotional_patterns, indent=2)}

        Mood Changes:
        {json.dumps(mood_changes, indent=2)}

        Please provide:
        1. A summary of emotional patterns and trends
        2. Notable changes or shifts in mood
        3. Personalized insights and observations
        4. Gentle suggestions for emotional well-being

        Format the response in a warm, supportive tone, as if you're a caring friend or therapist.
        Keep the insights constructive and encouraging.
        """

        logger.info("Initializing OpenAI client")
        # Initialize OpenAI client
        openai.api_key = os.getenv("OPENAI_API_KEY")
        if not openai.api_key:
            logger.error("OpenAI API key not found in environment variables")
            raise ValueError("OpenAI API key not configured")

        logger.info("Making OpenAI API call")
        # Make the API call
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a supportive and insightful emotional well-being assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )

        logger.info("Successfully received response from OpenAI")
        # Extract and return the generated insights
        insights = response.choices[0].message.content.strip()
        logger.debug(f"Generated insights: {insights[:100]}...")  # Log first 100 chars
        return insights

    except Exception as e:
        logger.error(f"Error generating insights with OpenAI: {str(e)}", exc_info=True)
        # Fallback to basic insights if OpenAI fails
        logger.info("Falling back to basic insights generation")
        return generate_basic_insights(emotional_patterns, mood_changes)

def generate_basic_insights(emotional_patterns, mood_changes):
    """
    Fallback function for basic insights generation if OpenAI fails.
    """
    if not emotional_patterns:
        return "No entries found for this period. Start journaling to get insights!"

    # Find dominant emotion
    dominant_emotion = max(emotional_patterns, key=lambda x: x["count"])

    # Analyze mood stability
    mood_stability = len(set(change["emotion"] for change in mood_changes))

    insights = []

    # Add emotion pattern insight
    insights.append(f"Your dominant emotion this week was {dominant_emotion['emotion']}, appearing in {dominant_emotion['percentage']:.1f}% of your entries.")

    # Add mood stability insight
    if mood_stability <= 2:
        insights.append("You've shown consistent emotional patterns this week.")
    elif mood_stability <= 4:
        insights.append("You've experienced a moderate range of emotions this week.")
    else:
        insights.append("You've had a diverse emotional experience this week.")

    # Add encouragement
    insights.append("Keep journaling to track your emotional journey and gain deeper insights!")

    return " ".join(insights)

@router.get("/debug/entries", response_model=List[JournalEntryResponse])
async def get_all_entries(
    db: Session = Depends(get_db)
):
    """
    Debug endpoint to list all journal entries.
    """
    try:
        entries = db.query(JournalEntryDB).all()
        response_entries = []
        for entry in entries:
            category = db.query(EmotionCategory).filter(EmotionCategory.id == entry.category_id).first()
            sub_emotion = db.query(SubEmotion).filter(SubEmotion.id == entry.sub_emotion_id).first()

            if not category or not sub_emotion:
                logger.warning(f"Skipping entry {entry.id} due to missing category or sub-emotion")
                continue

            response_entry = JournalEntryResponse(
                id=entry.id,
                userId=entry.user_id,
                category=category.name,
                subEmotion=sub_emotion.name,
                text=entry.text,
                photoUrl=entry.photo_url,
                reflections=entry.reflections,
                createdAt=entry.created_at,
                updatedAt=entry.updated_at
            )
            response_entries.append(response_entry)
        return response_entries
    except Exception as e:
        logger.error(f"Error fetching all journal entries: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
