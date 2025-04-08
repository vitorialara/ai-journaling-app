import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.models.db_models import User, EmotionCategory, SubEmotion, Prompt, JournalEntry
import logging
import os
import time
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Test database setup
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

engine = create_engine(DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency override
def override_get_db():
    try:
        db = TestingSessionLocal()
        # Set the schema for this session
        db.execute(text("SET search_path TO \"feel-write\";"))
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

# Test data with unique timestamp
timestamp = int(time.time())
TEST_USER = {
    "email": f"test2{timestamp}@example.com",
    "username": f"testuser2{timestamp}",
    "password": "testpass123"
}

@pytest.fixture(scope="function")
def test_db():
    # Set schema for the test
    with engine.connect() as conn:
        conn.execute(text("SET search_path TO \"feel-write\";"))
        conn.commit()

    yield

    # Clean up test data
    with TestingSessionLocal() as db:
        db.execute(text("SET search_path TO \"feel-write\";"))
        # Only delete journal entries, keep users for now
        db.query(JournalEntry).delete()
        db.commit()

@pytest.fixture(scope="session", autouse=True)
def cleanup_test_users():
    yield
    # Clean up test users after all tests are complete
    with TestingSessionLocal() as db:
        db.execute(text("SET search_path TO \"feel-write\";"))
        db.query(User).filter(User.email.like("test%@example.com")).delete()
        db.commit()

def test_create_user(test_db):
    # Log the test user data
    logger.info(f"Attempting to create test user with data: {TEST_USER}")

    # Check if user already exists
    with TestingSessionLocal() as db:
        db.execute(text("SET search_path TO \"feel-write\";"))
        existing_user = db.query(User).filter(
            (User.email == TEST_USER["email"]) | (User.username == TEST_USER["username"])
        ).first()
        if existing_user:
            logger.warning(f"User already exists: {existing_user.__dict__}")
            # Delete the existing user
            db.delete(existing_user)
            db.commit()
            logger.info("Deleted existing test user")

    response = client.post("/api/users/", json=TEST_USER)
    if response.status_code != 200:
        logger.error(f"Error response: {response.text}")
        # Log database state
        with TestingSessionLocal() as db:
            db.execute(text("SET search_path TO \"feel-write\";"))
            users = db.query(User).all()
            logger.error(f"Current users in database: {[u.__dict__ for u in users]}")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == TEST_USER["email"]
    assert data["username"] == TEST_USER["username"]
    assert "id" in data
    return data["id"]

def test_get_emotion_categories(test_db):
    response = client.get("/api/emotions/categories")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5  # Should have 5 categories from seed data
    categories = {cat["name"]: cat for cat in data}
    assert "happy" in categories
    assert "sad" in categories
    assert "angry" in categories
    assert "anxious" in categories
    assert "calm" in categories

def test_get_sub_emotions(test_db):
    # Test getting all sub-emotions
    response = client.get("/api/emotions/sub-emotions")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 50  # Should have 50 sub-emotions from seed data

    # Test filtering by category
    response = client.get("/api/emotions/sub-emotions?category=happy")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 10  # Should have 10 happy sub-emotions
    assert all(emotion["name"] in ["Joyful", "Grateful", "Excited", "Content", "Proud",
                                 "Peaceful", "Hopeful", "Inspired", "Loved", "Cheerful"]
              for emotion in data)

def test_get_prompts(test_db):
    # Test getting all prompts
    response = client.get("/api/prompts")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 25  # Should have 25 prompts from seed data

    # Test filtering by category
    response = client.get("/api/prompts?category=happy")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5  # Should have 5 happy prompts

def test_journal_entry_flow(test_db):
    # Create a user first
    user_id = test_create_user(test_db)
    print("\n=== Test Journal Entry Flow ===")
    print(f"Created user with ID: {user_id}")

    # Create a journal entry
    entry_data = {
        "userId": user_id,
        "category": "happy",
        "subEmotion": "Joyful",
        "text": "Today was a great day!",
        "photoUrl": None,
        "createdAt": "2024-03-20T10:30:00Z"
    }
    print(f"Creating journal entry for user {user_id}")
    response = client.post("/api/journal/", json=entry_data)
    assert response.status_code == 200
    entry = response.json()
    entry_id = entry["id"]
    print(f"Created journal entry with ID: {entry_id}")

    # Get the journal entry
    print(f"Retrieving journal entry {entry_id}")
    response = client.get(f"/api/journal/{entry_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["text"] == entry_data["text"]
    assert data["category"] == entry_data["category"]
    print(f"Successfully retrieved entry: {data}")

    # Add a reflection
    reflection_data = {
        "prompt": "What made this day great?",
        "response": "I accomplished a lot and felt productive"
    }
    print(f"Adding reflection to entry {entry_id}")
    response = client.patch(f"/api/journal/{entry_id}", json=reflection_data)
    assert response.status_code == 200
    data = response.json()
    assert len(data["reflections"]) == 1
    assert data["reflections"][0]["prompt"] == reflection_data["prompt"]
    assert data["reflections"][0]["response"] == reflection_data["response"]
    print(f"Successfully added reflection: {data['reflections'][0]}")
    print("=== Test Journal Entry Flow Complete ===\n")

def test_reflection_endpoints(test_db):
    # Test generate reflection using hardcoded IDs from seed data
    response = client.post("/api/reflection/generate-reflection", json={
        "entry": {
            "category": "anxious",
            "subEmotion": "Nervous",
            "text": "I'm feeling anxious about my upcoming presentation"
        },
        "previousReflection": None,
        "reflectionCount": 0
    })
    assert response.status_code == 200
    data = response.json()
    assert "prompt" in data
    assert "source" in data

    # Test get reflection
    response = client.get("/api/reflection/reflection?category=anxious")
    assert response.status_code == 200
    data = response.json()
    assert "prompt" in data

def test_user_analytics(test_db):
    # Create a user first
    user_id = test_create_user(test_db)


    # Create some journal entries using hardcoded IDs from seed data
    entries = [
        {
            "userId": user_id,
            "category": "happy",
            "subEmotion": "Joyful",
            "text": "Happy day",
            "photoUrl": None,
            "createdAt": "2024-03-20T10:30:00Z"
        },
        {
            "userId": user_id,
            "category": "sad",
            "subEmotion": "Lonely",
            "text": "Sad moment",
            "photoUrl": None,
            "createdAt": "2024-03-20T11:30:00Z"
        },
        {
            "userId": user_id,
            "category": "calm",
            "subEmotion": "Peaceful",
            "text": "Calm evening",
            "photoUrl": None,
            "createdAt": "2024-03-20T12:30:00Z"
        }
    ]
    for entry in entries:
        response = client.post("/api/journal/", json=entry)
        assert response.status_code == 200

    # Test user stats
    response = client.get(f"/api/user/stats?period=month")
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "emotions" in data
    assert "subEmotions" in data
    assert "streaks" in data
    assert "timeline" in data

    # Test mood summary
    response = client.get(f"/api/user/mood-summary?period=month")
    assert response.status_code == 200
    data = response.json()
    assert "moodDistribution" in data
    assert "mostFrequent" in data
    assert "trends" in data
    assert "weekdayPatterns" in data

def test_create_journal_entry_validation(test_db):
    """Test journal entry creation with invalid data"""
    user_id = test_create_user(test_db)

    # Test missing required fields
    invalid_data = {
        "userId": user_id,
        "category": "happy"  # Missing subEmotion and text
    }
    response = client.post("/api/journal/", json=invalid_data)
    assert response.status_code == 422  # Validation error

    # Test invalid category
    invalid_data = {
        "userId": user_id,
        "category": "invalid_category",
        "subEmotion": "Joyful",
        "text": "Test entry"
    }
    response = client.post("/api/journal/", json=invalid_data)
    assert response.status_code == 422  # Validation error

    # Test invalid sub-emotion
    invalid_data = {
        "userId": user_id,
        "category": "happy",
        "subEmotion": "InvalidEmotion",
        "text": "Test entry"
    }
    response = client.post("/api/journal/", json=invalid_data)
    assert response.status_code == 422  # Validation error

def test_get_nonexistent_journal_entry(test_db):
    """Test getting a non-existent journal entry"""
    response = client.get("/api/journal/nonexistent-id")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_journal_entries_pagination(test_db):
    """Test getting journal entries with pagination"""
    user_id = test_create_user(test_db)

    # Create multiple entries
    for i in range(5):
        entry_data = {
            "userId": user_id,
            "category": "happy",
            "subEmotion": "Joyful",
            "text": f"Test entry {i}",
            "photoUrl": None,
            "createdAt": "2024-03-20T10:30:00Z"
        }
        client.post("/api/journal/", json=entry_data)

    # Test pagination
    response = client.get("/api/journal?skip=0&limit=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2  # Direct list of entries
    assert all(isinstance(entry, dict) for entry in data)

def test_multiple_reflections(test_db):
    """Test adding multiple reflections to a journal entry"""
    user_id = test_create_user(test_db)

    # Create a journal entry
    entry_data = {
        "userId": user_id,
        "category": "happy",
        "subEmotion": "Joyful",
        "text": "Test entry",
        "photoUrl": None,
        "createdAt": "2024-03-20T10:30:00Z"
    }
    response = client.post("/api/journal/", json=entry_data)
    entry_id = response.json()["id"]

    # Add multiple reflections
    reflections = [
        {"prompt": "First prompt", "response": "First response"},
        {"prompt": "Second prompt", "response": "Second response"}
    ]

    for reflection in reflections:
        response = client.patch(f"/api/journal/{entry_id}", json=reflection)
        assert response.status_code == 200

    # Verify all reflections were added
    response = client.get(f"/api/journal/{entry_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data["reflections"]) == 2
    assert data["reflections"][0]["prompt"] == "First prompt"
    assert data["reflections"][1]["prompt"] == "Second prompt"

def test_edge_cases(test_db):
    """Test edge cases for journal entries"""
    user_id = test_create_user(test_db)

    # Test empty text
    entry_data = {
        "userId": user_id,
        "category": "happy",
        "subEmotion": "Joyful",
        "text": "",
        "photoUrl": None,
        "createdAt": "2024-03-20T10:30:00Z"
    }
    response = client.post("/api/journal/", json=entry_data)
    assert response.status_code == 200  # Empty text is allowed

    # Test very long text
    long_text = "a" * 10000
    entry_data = {
        "userId": user_id,
        "category": "happy",
        "subEmotion": "Joyful",
        "text": long_text,
        "photoUrl": None,
        "createdAt": "2024-03-20T10:30:00Z"
    }
    response = client.post("/api/journal/", json=entry_data)
    assert response.status_code == 200

    # Test special characters
    special_text = "Test entry with special chars: !@#$%^&*()_+"
    entry_data = {
        "userId": user_id,
        "category": "happy",
        "subEmotion": "Joyful",
        "text": special_text,
        "photoUrl": None,
        "createdAt": "2024-03-20T10:30:00Z"
    }
    response = client.post("/api/journal/", json=entry_data)
    assert response.status_code == 200
    assert response.json()["text"] == special_text

# def test_error_handling(test_db):
#     """Test error handling for various scenarios"""
#     # Test invalid JSON
#     response = client.post("/api/journal/", data="invalid json")
#     assert response.status_code == 422

#     # Test invalid UUID format
#     response = client.get("/api/journal/invalid-uuid")
#     assert response.status_code == 500  # Server error for invalid UUID

#     # Test invalid date format
#     user_id = test_create_user(test_db)
#     entry_data = {
#         "userId": user_id,
#         "category": "happy",
#         "subEmotion": "Joyful",
#         "text": "Test entry",
#         "photoUrl": None,
#         "createdAt": "invalid-date"
#     }
#     response = client.post("/api/journal/", json=entry_data)
#     assert response.status_code == 422

if __name__ == "__main__":
    pytest.main([__file__])
