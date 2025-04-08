import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db, Base, engine
from app.models.db_models import JournalEntry, User, EmotionCategory, SubEmotion, Prompt
from sqlalchemy.orm import Session
import uuid
from datetime import datetime, timezone
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create test database tables
logger.info("Creating test database tables...")
Base.metadata.create_all(bind=engine)
logger.info("Test database tables created successfully")

# Override the database dependency
def override_get_db():
    logger.debug("Creating new database session...")
    try:
        db = Session(engine)
        yield db
    finally:
        logger.debug("Closing database session...")
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

# Test constants
TEST_USER = {
    "id": "user-1",
    "email": "demo@example.com",
    "username": "demo_user",
    "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"
}

TEST_JOURNAL_ENTRY = {
    "text": "Test journal entry",
    "photo_url": "https://example.com/photo.jpg",
    "reflections": ["Reflection 1", "Reflection 2"]
}

@pytest.fixture(scope="function")
def db():
    """Create a new database session for each test"""
    logger.debug("Setting up database session fixture...")
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)

    yield session

    logger.debug("Cleaning up database session fixture...")
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def test_user(db: Session):
    """Get existing test user"""
    logger.debug("Getting test user fixture...")
    user = db.query(User).filter(User.id == TEST_USER["id"]).first()
    if not user:
        raise Exception("Test user not found. Please ensure seed data is loaded.")
    return user

@pytest.fixture(scope="function")
def test_category(db: Session):
    """Get existing emotion category"""
    logger.debug("Getting test category fixture...")
    # Get an existing category instead of creating a new one
    category = db.query(EmotionCategory).first()
    if not category:
        raise Exception("No emotion categories found in database. Please ensure seed data is loaded.")
    return category

@pytest.fixture(scope="function")
def test_sub_emotion(db: Session, test_category: EmotionCategory):
    """Get existing sub-emotion"""
    logger.debug("Getting test sub-emotion fixture...")
    # Get a sub-emotion for the test category
    sub_emotion = db.query(SubEmotion).filter(
        SubEmotion.category_id == test_category.id
    ).first()
    if not sub_emotion:
        raise Exception("No sub-emotions found for category. Please ensure seed data is loaded.")
    return sub_emotion

@pytest.fixture(scope="function")
def test_prompt(db: Session, test_category: EmotionCategory):
    """Get existing prompt"""
    logger.debug("Getting test prompt fixture...")
    # Get a prompt for the test category
    prompt = db.query(Prompt).filter(
        Prompt.category_id == test_category.id
    ).first()
    if not prompt:
        raise Exception("No prompts found for category. Please ensure seed data is loaded.")
    return prompt

def test_create_journal_entry(db: Session, test_user, test_category, test_sub_emotion):
    """Test creating a new journal entry"""
    logger.debug("Testing journal entry creation...")
    logger.debug(f"Test user ID: {test_user.id}")
    logger.debug(f"Test entry data: {TEST_JOURNAL_ENTRY}")

    response = client.post("/api/journal/", json=TEST_JOURNAL_ENTRY)
    logger.debug(f"Response status code: {response.status_code}")
    logger.debug(f"Response data: {response.json()}")

    assert response.status_code == 200
    data = response.json()
    assert data["userId"] == TEST_USER["id"]
    assert data["text"] == TEST_JOURNAL_ENTRY["text"]
    logger.debug(f"Created journal entry with ID: {data['id']}")
    return data["id"]

def test_get_journal_entry(db: Session, test_user, test_category, test_sub_emotion):
    """Test getting a specific journal entry"""
    logger.debug("Testing journal entry retrieval...")
    # First create an entry
    entry_id = test_create_journal_entry(db, test_user, test_category, test_sub_emotion)
    logger.debug(f"Retrieving journal entry with ID: {entry_id}")

    # Then get it
    response = client.get(f"/api/journal/{entry_id}")
    logger.debug(f"Response status code: {response.status_code}")
    logger.debug(f"Response data: {response.json()}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == entry_id
    assert data["userId"] == TEST_USER["id"]
    assert data["text"] == TEST_JOURNAL_ENTRY["text"]

def test_get_nonexistent_journal_entry(db: Session, test_user, test_category, test_sub_emotion):
    """Test getting a non-existent journal entry"""
    logger.debug("Testing retrieval of non-existent journal entry...")
    non_existent_id = str(uuid.uuid4())
    logger.debug(f"Attempting to retrieve non-existent ID: {non_existent_id}")

    response = client.get(f"/api/journal/{non_existent_id}")
    logger.debug(f"Response status code: {response.status_code}")
    logger.debug(f"Response data: {response.json()}")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_get_invalid_uuid(db: Session, test_user, test_category, test_sub_emotion):
    """Test getting a journal entry with invalid UUID format"""
    logger.debug("Testing retrieval with invalid UUID format...")
    response = client.get("/api/journal/invalid-uuid")
    logger.debug(f"Response status code: {response.status_code}")
    logger.debug(f"Response data: {response.json()}")

    assert response.status_code == 422
    assert "validation" in response.json()["detail"].lower()

def test_get_user_journal_entries(db: Session, test_user):
    """Test getting all journal entries for a user"""
    logger.debug("Testing retrieval of all user journal entries...")

    # Get all entries for the user
    logger.debug(f"Retrieving entries for user ID: {TEST_USER['id']}")
    response = client.get(f"/api/journal/?userId={TEST_USER['id']}")
    logger.debug(f"Response status code: {response.status_code}")
    logger.debug(f"Response data: {response.json()}")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 10  # We expect 10 entries from the seed data

    # Verify the entries are in chronological order (newest first)
    entries = sorted(data, key=lambda x: x["createdAt"], reverse=True)

    # Verify the first entry (most recent)
    assert entries[0]["id"] == "entry-1"
    assert entries[0]["text"] == "Today was amazing! I got a promotion at work and celebrated with my team."
    assert entries[0]["category"] == "happy"
    assert entries[0]["subEmotion"] == "Joyful"

    # Verify the last entry (oldest)
    assert entries[-1]["id"] == "entry-10"
    assert entries[-1]["text"] == "I practiced mindfulness meditation today and feel centered."
    assert entries[-1]["category"] == "calm"
    assert entries[-1]["subEmotion"] == "Mindful"

    # Verify all entries belong to the test user
    assert all(entry["userId"] == TEST_USER["id"] for entry in entries)

    # Log all entries for verification
    logger.debug("All journal entries:")
    for entry in entries:
        logger.debug(f"Entry ID: {entry['id']}")
        logger.debug(f"Category: {entry['category']}")
        logger.debug(f"Sub-emotion: {entry['subEmotion']}")
        logger.debug(f"Text: {entry['text']}")
        logger.debug(f"Created at: {entry['createdAt']}")
        logger.debug("---")

def test_get_user_journal_entries_pagination(db: Session, test_user, test_category, test_sub_emotion):
    """Test pagination for user journal entries"""
    logger.debug("Testing journal entries pagination...")
    # Create multiple entries
    for i in range(5):
        logger.debug(f"Creating journal entry {i+1}/5")
        test_create_journal_entry(db, test_user, test_category, test_sub_emotion)

    # Test with pagination
    logger.debug("Testing pagination with skip=0, limit=2")
    response = client.get(f"/api/journal/?userId={TEST_USER['id']}&skip=0&limit=2")
    logger.debug(f"Response status code: {response.status_code}")
    logger.debug(f"Response data: {response.json()}")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

def test_get_user_journal_entries_invalid_user(db: Session, test_user, test_category, test_sub_emotion):
    """Test getting journal entries for non-existent user"""
    logger.debug("Testing retrieval for non-existent user...")
    response = client.get("/api/journal/?userId=non_existent_user")
    logger.debug(f"Response status code: {response.status_code}")
    logger.debug(f"Response data: {response.json()}")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0

def test_get_specific_journal_entry(db: Session, test_user):
    """Test getting a specific journal entry by ID"""
    logger.debug("Testing retrieval of specific journal entry...")

    # Test getting entry-1 (most recent happy entry)
    entry_id = "entry-1"
    logger.debug(f"Retrieving journal entry with ID: {entry_id}")
    response = client.get(f"/api/journal/{entry_id}")
    logger.debug(f"Response status code: {response.status_code}")
    logger.debug(f"Response data: {response.json()}")

    assert response.status_code == 200
    data = response.json()

    # Verify the entry details
    assert data["id"] == entry_id
    assert data["userId"] == TEST_USER["id"]
    assert data["text"] == "Today was amazing! I got a promotion at work and celebrated with my team."
    assert data["category"] == "happy"
    assert data["subEmotion"] == "Joyful"
    assert data["createdAt"] == "2024-03-20T10:30:00Z"
    assert data["updatedAt"] == "2024-03-20T10:30:00Z"
    assert data["photoUrl"] is None
    assert data["reflections"] == []

    # Test getting entry-7 (anxious entry)
    entry_id = "entry-7"
    logger.debug(f"Retrieving journal entry with ID: {entry_id}")
    response = client.get(f"/api/journal/{entry_id}")
    logger.debug(f"Response status code: {response.status_code}")
    logger.debug(f"Response data: {response.json()}")

    assert response.status_code == 200
    data = response.json()

    # Verify the entry details
    assert data["id"] == entry_id
    assert data["userId"] == TEST_USER["id"]
    assert data["text"] == "I'm nervous about my presentation tomorrow."
    assert data["category"] == "anxious"
    assert data["subEmotion"] == "Nervous"
    assert data["createdAt"] == "2024-03-14T16:30:00Z"
    assert data["updatedAt"] == "2024-03-14T16:30:00Z"
    assert data["photoUrl"] is None
    assert data["reflections"] == []

def test_get_user_journal_entries_by_user_id(db: Session):
    """Test getting journal entries by user ID"""
    logger.debug("Testing retrieval of journal entries by user ID...")

    # Test with valid user ID
    user_id = "user-1"
    logger.debug(f"Retrieving entries for user ID: {user_id}")
    response = client.get(f"/api/journal/user/{user_id}")
    logger.debug(f"Response status code: {response.status_code}")
    logger.debug(f"Response data: {response.json()}")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 10  # We expect 10 entries from the seed data

    # Verify the entries are in chronological order (newest first)
    entries = sorted(data, key=lambda x: x["createdAt"], reverse=True)

    # Verify the first entry (most recent)
    assert entries[0]["id"] == "entry-1"
    assert entries[0]["text"] == "Today was amazing! I got a promotion at work and celebrated with my team."
    assert entries[0]["category"] == "happy"
    assert entries[0]["subEmotion"] == "Joyful"
    assert entries[0]["userId"] == user_id

    # Verify the last entry (oldest)
    assert entries[-1]["id"] == "entry-10"
    assert entries[-1]["text"] == "I practiced mindfulness meditation today and feel centered."
    assert entries[-1]["category"] == "calm"
    assert entries[-1]["subEmotion"] == "Mindful"
    assert entries[-1]["userId"] == user_id

    # Test with non-existent user ID
    non_existent_user_id = "non-existent-user"
    logger.debug(f"Testing with non-existent user ID: {non_existent_user_id}")
    response = client.get(f"/api/journal/user/{non_existent_user_id}")
    logger.debug(f"Response status code: {response.status_code}")
    logger.debug(f"Response data: {response.json()}")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0  # Should return empty list for non-existent user

    # Log all entries for verification
    logger.debug("All journal entries:")
    for entry in entries:
        logger.debug(f"Entry ID: {entry['id']}")
        logger.debug(f"User ID: {entry['userId']}")
        logger.debug(f"Category: {entry['category']}")
        logger.debug(f"Sub-emotion: {entry['subEmotion']}")
        logger.debug(f"Text: {entry['text']}")
        logger.debug(f"Created at: {entry['createdAt']}")
        logger.debug("---")

if __name__ == "__main__":
    pytest.main([__file__])
