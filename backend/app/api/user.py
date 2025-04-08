from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import bcrypt
import logging
import time
import uuid
from app.models.db_models import JournalEntry as JournalEntryDB, EmotionCategory, SubEmotion
from app.schemas.journal import (
    WeeklySummaryResponse,
    EmotionalPattern,
    MoodChange
)
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

class ProfileResponse(BaseModel):
    user: dict
    stats: dict

def get_password_hash(password: str) -> str:
    # Use a lower number of rounds for testing
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(rounds=4)).decode('utf-8')

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
    dominant_emotion = max(emotional_patterns, key=lambda x: x.count)

    # Analyze mood stability
    mood_stability = len(set(change.emotion for change in mood_changes))

    insights = []

    # Add emotion pattern insight
    insights.append(f"Your dominant emotion this week was {dominant_emotion.emotion}, appearing in {dominant_emotion.percentage:.1f}% of your entries.")

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

@router.get("/profile", response_model=ProfileResponse)
async def get_user_profile(
    db: Session = Depends(get_db)
):
    """
    Get user profile and basic statistics.

    Implementation Status: Frontend-only with mock data
    Priority: Low
    Requirements:
    - User data aggregation
    - Profile customization
    - Privacy settings
    - Data export functionality

    TODO:
    1. Implement user data aggregation
    2. Add profile customization options
    3. Implement privacy settings
    4. Add data export functionality
    5. Add profile completion tracking
    """
    try:
        # TODO: Implement profile data
        return ProfileResponse(
            user={
                "id": "user-1",
                "email": "demo@example.com",
                "name": "Demo User",
                "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
                "createdAt": datetime.utcnow()
            },
            stats={
                "totalEntries": 12,
                "totalReflections": 8,
                "streakDays": 15,
                "currentStreak": 3,
                "longestStreak": 5,
                "lastCheckInDate": datetime.utcnow()
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
