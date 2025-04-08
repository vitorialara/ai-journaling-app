# Feelora Backend

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── journal.py        # Journal entry endpoints
│   │   ├── emotions.py       # Emotion category and sub-emotion endpoints
│   │   ├── prompts.py        # Reflection prompt endpoints
│   │   ├── users.py          # User management endpoints
│   │   ├── reflection.py     # Enhanced reflection endpoints (Medium Priority)
│   │   ├── user.py           # User analytics endpoints (Low Priority)
│   │   ├── images.py         # Image management endpoints (Low Priority)
│   │   └── bot.py            # AI chatbot endpoints (Low Priority)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── journal.py        # Journal entry models
│   │   ├── emotion.py        # Emotion models
│   │   ├── prompt.py         # Prompt models
│   │   └── user.py           # User models
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── journal.py        # Journal entry schemas
│   │   ├── emotion.py        # Emotion schemas
│   │   ├── prompt.py         # Prompt schemas
│   │   └── user.py           # User schemas
│   ├── database.py           # Database configuration
│   └── main.py               # FastAPI application
├── tests/
│   ├── __init__.py
│   ├── test_api.py           # API endpoint tests
│   └── test_models.py        # Model tests
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

## API Endpoints

### Core Features (High Priority)

1. **Journal Entries**
   - `POST /api/journal` - Create a new journal entry
   - `GET /api/journal` - List journal entries
   - `GET /api/journal/{entry_id}` - Get specific entry
   - `PATCH /api/journal/{entry_id}` - Update entry with reflection

2. **Emotions**
   - `GET /api/emotions/categories` - List emotion categories
   - `GET /api/emotions/sub-emotions` - List sub-emotions

3. **Prompts**
   - `GET /api/prompts` - List reflection prompts

4. **Users**
   - `POST /api/users` - Create user
   - `GET /api/users/{user_id}` - Get user
   - `PUT /api/users/{user_id}` - Update user
   - `DELETE /api/users/{user_id}` - Delete user

### Enhanced Features (Medium Priority)

1. **Reflection**
   - `POST /api/generate-reflection` - Generate context-aware prompts
   - `GET /api/reflection` - Get emotion-specific prompts

### Additional Features (Low Priority)

1. **User Analytics**
   - `GET /api/user/streak` - Get user's journaling streak
   - `GET /api/user/stats` - Get detailed user statistics
   - `GET /api/user/mood-summary` - Get mood analysis
   - `GET /api/user/profile` - Get user profile

2. **Image Management**
   - `POST /api/images` - Upload images
   - `GET /api/images/{image_id}` - Retrieve images

3. **AI Chatbot**
   - `POST /api/bot` - AI-powered emotional support chat

## Implementation Status

### Core Features
- ✅ Journal entry management
- ✅ Emotion categories and sub-emotions
- ✅ Basic prompt system
- ✅ User management

### Enhanced Features
- ⚠️ Reflection system (Frontend-only implementation)
  - TODO: AI integration
  - TODO: Context analysis
  - TODO: Emotion-specific prompts

### Additional Features
- ⚠️ User Analytics (Frontend-only implementation)
  - TODO: Data aggregation
  - TODO: Statistical analysis
  - TODO: Visualization preparation

- ⚠️ Image Management (Frontend-only implementation)
  - TODO: Cloud storage integration
  - TODO: Image processing
  - TODO: CDN integration

- ⚠️ AI Chatbot (Frontend-only implementation)
  - TODO: OpenAI integration
  - TODO: Conversation history
  - TODO: Context management

## Database Schema

The application uses PostgreSQL with the following main tables:

1. **users**
   - id (UUID)
   - email (String)
   - username (String)
   - hashed_password (String)
   - created_at (Timestamp)
   - updated_at (Timestamp)

2. **emotion_categories**
   - id (Serial)
   - name (String)
   - description (Text)
   - color (String)
   - icon (String)

3. **sub_emotions**
   - id (Serial)
   - category_id (Integer)
   - name (String)
   - description (Text)
   - intensity (Integer)

4. **prompts**
   - id (Serial)
   - category_id (Integer)
   - text (Text)
   - is_active (Boolean)

5. **journal_entries**
   - id (UUID)
   - user_id (UUID)
   - category_id (Integer)
   - sub_emotion_id (Integer)
   - text (Text)
   - reflections (JSONB)
   - created_at (Timestamp)
   - updated_at (Timestamp)

## Example Data

The application comes with pre-seeded data that you can use for testing and development. Here's how to access the example data:

### Emotion Categories
```bash
curl -X GET "http://localhost:8001/api/emotions/categories"
```
Example Response:
```json
[
  {
    "id": 1,
    "name": "Happy",
    "description": "Positive emotions and joy",
    "color": "#FFD700",
    "icon": "happy"
  },
  {
    "id": 2,
    "name": "Sad",
    "description": "Negative emotions and sorrow",
    "color": "#4169E1",
    "icon": "sad"
  }
]
```

### Sub-Emotions
```bash
curl -X GET "http://localhost:8001/api/emotions/sub-emotions?category=1"
```
Example Response:
```json
[
  {
    "id": 1,
    "name": "Joyful",
    "description": "Feeling great happiness and delight",
    "intensity": 5
  },
  {
    "id": 2,
    "name": "Content",
    "description": "Feeling satisfied and at peace",
    "intensity": 3
  }
]
```

### Prompts
```bash
curl -X GET "http://localhost:8001/api/prompts?category=1"
```
Example Response:
```json
[
  {
    "id": 1,
    "text": "What made you feel this way?",
    "category_id": 1,
    "is_active": true
  },
  {
    "id": 2,
    "text": "How can you maintain this feeling?",
    "category_id": 1,
    "is_active": true
  }
]
```

### Creating a Journal Entry
```bash
curl -X POST "http://localhost:8001/api/journal" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "category": "Happy",
    "subEmotion": "Joyful",
    "text": "Today was amazing! I had a great time with friends.",
    "photoUrl": null,
    "createdAt": "2024-03-20T10:30:00Z"
  }'
```
Example Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "test-user-id",
  "category": "Happy",
  "subEmotion": "Joyful",
  "text": "Today was amazing! I had a great time with friends.",
  "photoUrl": null,
  "reflections": [],
  "createdAt": "2024-03-20T10:30:00Z",
  "updatedAt": "2024-03-20T10:30:00Z"
}
```

### Adding a Reflection
```bash
curl -X PATCH "http://localhost:8001/api/journal/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "reflectionText": "I felt really connected to everyone.",
    "promptText": "What did you learn from this experience?"
  }'
```
Example Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "test-user-id",
  "category": "Happy",
  "subEmotion": "Joyful",
  "text": "Today was amazing! I had a great time with friends.",
  "photoUrl": null,
  "reflections": [
    {
      "prompt": "What did you learn from this experience?",
      "response": "I felt really connected to everyone.",
      "timestamp": "2024-03-20T11:00:00Z"
    }
  ],
  "createdAt": "2024-03-20T10:30:00Z",
  "updatedAt": "2024-03-20T11:00:00Z"
}
```

### Getting User Analytics
```bash
curl -X GET "http://localhost:8001/api/user/stats?userId=test-user-id"
```
Example Response:
```json
{
  "summary": {
    "totalEntries": 1,
    "totalReflections": 1,
    "averageEntriesPerWeek": 1,
    "completionRate": 100
  },
  "emotions": {
    "happy": 1,
    "sad": 0,
    "angry": 0,
    "anxious": 0,
    "calm": 0
  },
  "subEmotions": [
    { "name": "Joyful", "count": 1 }
  ],
  "streaks": {
    "current": 1,
    "longest": 1
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

### Getting Mood Summary
```bash
curl -X GET "http://localhost:8001/api/user/mood-summary?userId=test-user-id"
```
Example Response:
```json
{
  "moodDistribution": {
    "happy": { "count": 1, "percentage": 100 },
    "sad": { "count": 0, "percentage": 0 },
    "angry": { "count": 0, "percentage": 0 },
    "anxious": { "count": 0, "percentage": 0 },
    "calm": { "count": 0, "percentage": 0 }
  },
  "mostFrequent": {
    "category": "happy",
    "subEmotion": "Joyful",
    "count": 1
  },
  "trends": {
    "improving": [],
    "worsening": [],
    "stable": ["happy"]
  },
  "weekdayPatterns": [
    { "day": "Wednesday", "primaryEmotion": "happy" }
  ]
}
```

## Development Setup

1. **Prerequisites**
   - Python 3.8+
   - PostgreSQL 12+
   - Poetry (for dependency management)

2. **Installation**
   ```bash
   # Clone the repository
   git clone https://github.com/yourusername/feelora.git
   cd feelora/backend

   # Install dependencies
   pip install -r requirements.txt

   # Set up environment variables
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   # Create database
   createdb feelora

   # Run migrations
   psql -d feelora -f pg_database/schema.sql
   ```

4. **Running the Application**
   ```bash
   # Start the development server
   uvicorn app.main:app --reload
   ```

## Testing with Database Setup

### 1. Start PostgreSQL Database

```bash
# Start PostgreSQL service (macOS)
brew services start postgresql

# Start PostgreSQL service (Linux)
sudo service postgresql start

# Start PostgreSQL service (Windows)
net start postgresql
```

### 2. Create and Setup Database

```bash
# Create the database
createdb feelora

# Connect to the database
psql feelora

# Create the schema and set search path
\i pg_database/schema.sql
SET search_path TO feelora;

# Verify tables were created
\dt

# Exit psql
\q
```

### 3. Seed the Database

```bash
# Seed the database with initial data
psql -d feelora -f pg_database/seed_data.sql

# Verify seeded data
psql feelora -c "SELECT COUNT(*) FROM feelora.emotion_categories;"
psql feelora -c "SELECT COUNT(*) FROM feelora.sub_emotions;"
psql feelora -c "SELECT COUNT(*) FROM feelora.prompts;"
```

### 4. Configure Environment Variables

Create a `.env` file in the backend directory:
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your database configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/feelora
SECRET_KEY=your-secret-key-here
```

### 5. Run Tests

```bash
# Install test dependencies
pip install pytest pytest-cov

# Run all tests
pytest

# Run specific test file
pytest tests/test_api.py

# Run with coverage
pytest --cov=app tests/

# Run with detailed output
pytest -v

# Run with test database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/feelora pytest
```

### 6. Test Specific Endpoints

```bash
# Start the development server
uvicorn app.main:app --reload

# In a new terminal, test endpoints
# Test emotion categories
curl -X GET "http://localhost:8001/api/emotions/categories"

# Test sub-emotions
curl -X GET "http://localhost:8001/api/emotions/sub-emotions?category=1"

# Test prompts
curl -X GET "http://localhost:8001/api/prompts?category=1"
```

### 7. Reset Database for Testing

```bash
# Drop and recreate the database
dropdb feelora
createdb feelora

# Reapply schema and seed data
psql -d feelora -f pg_database/schema.sql
psql -d feelora -f pg_database/seed_data.sql
```

### 8. Common Test Scenarios

1. **Basic CRUD Operations**
```bash
# Create a user
curl -X POST "http://localhost:8001/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser"
  }'

# Create a journal entry
curl -X POST "http://localhost:8001/api/journal" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "category": "Happy",
    "subEmotion": "Joyful",
    "text": "Test entry",
    "photoUrl": null,
    "createdAt": "2024-03-20T10:30:00Z"
  }'
```

2. **Error Handling**
```bash
# Test invalid user ID
curl -X GET "http://localhost:8001/api/users/invalid-id"

# Test invalid emotion category
curl -X GET "http://localhost:8001/api/emotions/sub-emotions?category=999"
```

3. **Data Validation**
```bash
# Test invalid journal entry
curl -X POST "http://localhost:8001/api/journal" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "category": "InvalidCategory",
    "subEmotion": "InvalidSubEmotion",
    "text": "",
    "photoUrl": null,
    "createdAt": "2024-03-20T10:30:00Z"
  }'
```

### 9. Automated Testing

```bash
# Run all tests with coverage report
pytest --cov=app --cov-report=html tests/

# Run specific test with debug output
pytest -v tests/test_api.py -k "test_create_journal_entry"

# Run tests in parallel
pytest -n auto
```

### 10. Database Testing Tips

1. **Before Running Tests**
   - Ensure PostgreSQL is running
   - Database is created and seeded
   - Environment variables are set
   - No conflicting processes using the database

2. **During Testing**
   - Monitor database logs for errors
   - Check test coverage
   - Verify data integrity
   - Test both success and failure cases

3. **After Testing**
   - Clean up test data
   - Reset database if needed
   - Review test coverage report
   - Document any issues found

## API Documentation

The API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Deployment

1. **Production Environment**
   - Use production-grade WSGI server (e.g., Gunicorn)
   - Configure proper CORS settings
   - Set up proper logging
   - Use environment variables for configuration

2. **Docker Deployment**
   ```bash
   # Build the image
   docker build -t feelora-backend .

   # Run the container
   docker run -p 8000:8000 feelora-backend
   ```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

MIT License

## Environment Variables Setup

1. **Create Environment File**
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
nano .env  # or use your preferred text editor
```

2. **Configure Database Connection**
```bash
# The DATABASE_URL should follow this format:
# postgresql://username:password@host:port/database_name

# Example for local development:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/feelora

# Example for production:
# DATABASE_URL=postgresql://user:password@db.example.com:5432/feelora
```

3. **Set Security Variables**
```bash
# Generate a secure secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Add the generated key to your .env file
SECRET_KEY=your-generated-secret-key
JWT_SECRET_KEY=your-generated-jwt-secret-key
```

4. **Verify Environment Variables**
```bash
# Check if environment variables are loaded
python -c "from dotenv import load_dotenv; load_dotenv(); import os; print(os.getenv('DATABASE_URL'))"
```

5. **Environment Variables Reference**

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection URL | postgresql://user:pass@localhost:5432/feelora |
| SECRET_KEY | Application secret key | your-secret-key-here |
| JWT_SECRET_KEY | JWT token secret key | your-jwt-secret-key-here |
| JWT_ALGORITHM | JWT algorithm | HS256 |
| ACCESS_TOKEN_EXPIRE_MINUTES | JWT token expiry time | 30 |
| API_V1_STR | API version prefix | /api |
| PROJECT_NAME | Application name | Feelora |
| BACKEND_CORS_ORIGINS | Allowed CORS origins | ["http://localhost:3000"] |
| LOG_LEVEL | Logging level | INFO |
| OPENAI_API_KEY | OpenAI API key (optional) | sk-... |

6. **Production Environment**
```bash
# For production, use environment variables from your hosting platform
# Example for Heroku:
heroku config:set DATABASE_URL=postgresql://...

# Example for Docker:
docker run -e DATABASE_URL=postgresql://... feelora-backend
```

# Feel-Write Backend API

## Overview
Feel-Write is an emotional journaling and reflection platform that helps users track and understand their emotions through journaling and guided reflections.

## API Documentation

### Authentication
Currently using simple user ID system. Include userId in request body.

### Endpoints

#### Journal Entries

##### Create Journal Entry
```http
POST /api/journal
```

Request:
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

##### Get Journal Entry
```http
GET /api/journal/{entry_id}
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
    }
  ],
  "createdAt": "2024-03-20T10:30:00Z",
  "updatedAt": "2024-03-20T11:00:00Z"
}
```

##### List Journal Entries
```http
GET /api/journal
```

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

##### Update Journal Entry
```http
PATCH /api/journal/{entry_id}
```

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

#### Emotions

##### Get Emotion Categories
```http
GET /api/emotions/categories
```

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

##### Get Sub-Emotions
```http
GET /api/emotions/sub-emotions
```

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

#### Prompts

##### Get Reflection Prompts
```http
GET /api/prompts
```

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

#### Users

##### Create User
```http
POST /api/users
```

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

##### Get User Details
```http
GET /api/users/{user_id}
```

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

#### Analytics

##### Get User Streak
```http
GET /api/user/streak
```

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

##### Get User Stats
```http
GET /api/user/stats
```

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

##### Get Mood Summary
```http
GET /api/user/mood-summary
```

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

##### Get User Profile
```http
GET /api/user/profile
```

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

## Development Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run the development server:
```bash
uvicorn app.main:app --reload
```

4. Access the API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

Run tests with:
```bash
pytest
```

## License

MIT License
