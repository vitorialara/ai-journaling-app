from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    journal, emotions, prompts, users,
    user, images, completion, analytics
)
from app.database import engine, Base
from app.models.db_models import User, EmotionCategory, SubEmotion, Prompt, JournalEntry, Analytics
import os
from dotenv import load_dotenv

import logging

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Initialize FastAPI app

app = FastAPI(
    title="Feel-Write API",
    description="""
    Feel-Write API Documentation - Emotional Journaling and Reflection Platform

    ## Authentication
    Currently using simple user ID system. Include userId in request body.

    ## Endpoints

    ### Journal Entries
    * `POST /api/journal` - Create a journal entry
      ```json
      {
        "userId": "user1",
        "category": "happy",
        "subEmotion": "Joyful",
        "text": "Today was amazing!",
        "photoUrl": null,
        "createdAt": "2024-03-20T10:30:00Z"
      }
      ```
      Response:
      ```json
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "userId": "user1",
        "category": "happy",
        "subEmotion": "Joyful",
        "text": "Today was amazing!",
        "photoUrl": null,
        "createdAt": "2024-03-20T10:30:00Z",
        "updatedAt": "2024-03-20T10:30:00Z"
      }
      ```

    * `GET /api/journal/{entry_id}` - Get a specific journal entry
      Response:
      ```json
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "userId": "user1",
        "category": "happy",
        "subEmotion": "Joyful",
        "text": "Today was amazing!",
        "photoUrl": null,
        "reflections": [
          {
            "prompt": "What made this moment special?",
            "response": "Spending time with friends",
            "timestamp": "2024-03-20T11:00:00Z"
          }
        ],
        "createdAt": "2024-03-20T10:30:00Z",
        "updatedAt": "2024-03-20T11:00:00Z"
      }
      ```

    * `GET /api/journal` - List user's journal entries
      Query Parameters:
      - skip: int (default: 0)
      - limit: int (default: 100)
      Response:
      ```json
      {
        "entries": [
          {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "userId": "user1",
            "category": "happy",
            "subEmotion": "Joyful",
            "text": "Today was amazing!",
            "photoUrl": null,
            "createdAt": "2024-03-20T10:30:00Z",
            "updatedAt": "2024-03-20T10:30:00Z"
          }
        ],
        "total": 1,
        "skip": 0,
        "limit": 100
      }
      ```

    * `PATCH /api/journal/{entry_id}` - Update a journal entry with reflection
      Request:
      ```json
      {
        "reflectionText": "I felt really connected to everyone.",
        "promptText": "What did you learn from this experience?"
      }
      ```
      Response:
      ```json
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "userId": "user1",
        "category": "happy",
        "subEmotion": "Joyful",
        "text": "Today was amazing!",
        "photoUrl": null,
        "reflections": [
          {
            "prompt": "What made this moment special?",
            "response": "Spending time with friends",
            "timestamp": "2024-03-20T11:00:00Z"
          },
          {
            "prompt": "What did you learn from this experience?",
            "response": "I felt really connected to everyone.",
            "timestamp": "2024-03-20T11:30:00Z"
          }
        ],
        "createdAt": "2024-03-20T10:30:00Z",
        "updatedAt": "2024-03-20T11:30:00Z"
      }
      ```

    ### Emotions
    * `GET /api/emotions/categories` - Get emotion categories
      Response:
      ```json
      [
        {
          "id": "happy",
          "name": "Happy",
          "description": "Positive emotions",
          "color": "#FCD34D"
        },
        {
          "id": "sad",
          "name": "Sad",
          "description": "Negative emotions",
          "color": "#93C5FD"
        }
      ]
      ```

    * `GET /api/emotions/sub-emotions` - Get sub-emotions
      Query Parameters:
      - category: string (optional, e.g., "happy", "sad", "angry", "anxious", "calm")
      Response:
      ```json
      [
        {
          "id": "joyful",
          "name": "Joyful",
          "category": "happy",
          "description": "Feeling of great pleasure and happiness",
          "intensity": 0.8
        },
        {
          "id": "grateful",
          "name": "Grateful",
          "category": "happy",
          "description": "Feeling thankful",
          "intensity": 0.7
        }
      ]
      ```

    ### Prompts
    * `GET /api/prompts` - Get reflection prompts
      Query Parameters:
      - category: string (optional)
      Response:
      ```json
      [
        {
          "id": "prompt1",
          "text": "What made this moment special for you?",
          "category": "happy",
          "type": "reflection"
        },
        {
          "id": "prompt2",
          "text": "How can you create more moments like this?",
          "category": "happy",
          "type": "action"
        }
      ]
      ```

    ### Users
    * `POST /api/users` - Create a new user
      Request:
      ```json
      {
        "email": "user@example.com",
        "password": "securepassword123",
        "username": "user1"
      }
      ```
      Response:
      ```json
      {
        "id": "user1",
        "email": "user@example.com",
        "username": "user1",
        "createdAt": "2024-03-20T10:30:00Z"
      }
      ```

    * `GET /api/users/{user_id}` - Get user details
      Response:
      ```json
      {
        "id": "user1",
        "email": "user@example.com",
        "username": "user1",
        "createdAt": "2024-03-20T10:30:00Z",
        "updatedAt": "2024-03-20T10:30:00Z"
      }
      ```

    ### Analytics
    * `GET /api/user/streak` - Get user's streak information
      Response:
      ```json
      {
        "currentStreak": 3,
        "longestStreak": 5,
        "lastCheckInDate": "2024-03-20T10:30:00Z",
        "streakHistory": [
          {
            "date": "2024-03-20T00:00:00Z",
            "hasEntry": true
          }
        ]
      }
      ```

    * `GET /api/user/stats` - Get detailed user statistics
      Query Parameters:
      - period: string (optional, e.g., "week", "month", "year")
      Response:
      ```json
      {
        "summary": {
          "totalEntries": 12,
          "totalReflections": 8,
          "averageEntriesPerWeek": 3,
          "completionRate": 75
        },
        "emotions": {
          "happy": 4,
          "sad": 2,
          "angry": 1,
          "anxious": 3,
          "calm": 2
        },
        "subEmotions": [
          { "name": "Joyful", "count": 2 },
          { "name": "Grateful", "count": 2 }
        ],
        "streaks": {
          "current": 3,
          "longest": 5
        },
        "timeline": [
          {
            "date": "2024-03-20T00:00:00Z",
            "entries": 1,
            "reflections": 1,
            "primaryEmotion": "happy"
          }
        ]
      }
      ```

    * `GET /api/user/mood-summary` - Get mood analysis and trends
      Query Parameters:
      - period: string (optional, e.g., "week", "month", "year")
      Response:
      ```json
      {
        "moodDistribution": {
          "happy": { "count": 4, "percentage": 33 },
          "sad": { "count": 2, "percentage": 17 },
          "angry": { "count": 1, "percentage": 8 },
          "anxious": { "count": 3, "percentage": 25 },
          "calm": { "count": 2, "percentage": 17 }
        },
        "mostFrequent": {
          "category": "happy",
          "subEmotion": "Joyful",
          "count": 3
        },
        "trends": {
          "improving": ["anxious"],
          "worsening": [],
          "stable": ["happy", "calm"]
        },
        "weekdayPatterns": [
          { "day": "Monday", "primaryEmotion": "anxious" },
          { "day": "Tuesday", "primaryEmotion": "anxious" }
        ]
      }
      ```

    * `GET /api/user/profile` - Get user profile and basic stats
      Response:
      ```json
      {
        "user": {
          "id": "user-1",
          "email": "demo@example.com",
          "name": "Demo User",
          "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
          "createdAt": "2024-02-20T00:00:00Z"
        },
        "stats": {
          "totalEntries": 12,
          "totalReflections": 8,
          "streakDays": 15,
          "currentStreak": 3,
          "longestStreak": 5,
          "lastCheckInDate": "2024-03-20T10:30:00Z"
        }
      }
      ```
    """,
    version="1.0.0",
    openapi_url="/api/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://feelwrite-622255484144.us-central1.run.app",
        "https://feelwrite.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "accept"],
    expose_headers=["Content-Type"]
)

# Include routers with descriptions
app.include_router(
    journal.router,
    prefix="/api/journal",
    tags=["journal"],
    responses={404: {"description": "Not found"}},
)

app.include_router(
    emotions.router,
    prefix="/api/emotions",
    tags=["emotions"],
    responses={404: {"description": "Not found"}},
)

app.include_router(
    prompts.router,
    prefix="/api/prompts",
    tags=["prompts"],
    responses={404: {"description": "Not found"}},
)

app.include_router(
    users.router,
    prefix="/api/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

app.include_router(
    user.router,
    prefix="/api/user",
    tags=["user analytics"],
    responses={404: {"description": "Not found"}},
)

app.include_router(
    images.router,
    prefix="/api/images",
    tags=["images"],
    responses={404: {"description": "Not found"}},
)

app.include_router(
    completion.router,
    prefix="/api",
    tags=["completion"],
    responses={404: {"description": "Not found"}},
)

# Include analytics router
app.include_router(
    analytics.router,
    prefix="/api/analytics",
    tags=["analytics"],
    responses={404: {"description": "Not found"}},
)

@app.get("/", tags=["root"])
async def root():
    """
    Root endpoint that returns API information and links to documentation.
    """
    return {
        "app": "Feelora API",
        "version": "1.0.0",
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc",
            "openapi": "/api/openapi.json"
        }
    }
