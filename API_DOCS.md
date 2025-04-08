# Feel-Write API Documentation

## Base URL
```
http://localhost:8001
```

## Authentication
Currently, the API uses a simple user ID system. Each request should include a `userId` in the request body where applicable.

## Endpoints

### Journal Entries

#### Create a Journal Entry
**Endpoint Name:** `createJournalEntry`
**Backend Source:** `backend/app/api/journal.py` (line 40)
```python
@router.post("/", response_model=JournalEntry)
async def create_journal_entry(
    entry: JournalEntryCreate,
    db: Session = Depends(get_db)
):
    db_entry = JournalEntryDB(
        id=str(uuid.uuid4()),
        userId="user1",  # TODO: Get from auth
        **entry.model_dump()
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry
```

**Frontend Source:** `frontend/app/journal/page.tsx` (line 58)
```typescript
const handleSubmit = async (shouldReflect: boolean) => {
  if (!journalText.trim()) {
    alert("Please write something in your journal before submitting.")
    return
  }

  setIsSubmitting(true)
  try {
    const entry = await createJournalEntry({
      userId: "user1", // TODO: Get from auth context
      category,
      subEmotion,
      text: journalText,
      photoUrl: photoUrl,
      createdAt: new Date().toISOString(),
    })

    if (shouldReflect) {
      router.push(`/reflect?entryId=${entry.id}`)
    } else {
      router.push("/confirmation")
    }
  } catch (error) {
    console.error("Error creating journal entry:", error)
    alert("There was an error saving your journal entry. Please try again.")
  } finally {
    setIsSubmitting(false)
  }
}
```

- Input:
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
- Output:
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
- Curl Example:
  ```bash
  curl -X POST http://localhost:8001/api/journal \
    -H "Content-Type: application/json" \
    -d '{
      "userId": "user1",
      "category": "happy",
      "subEmotion": "Joyful",
      "text": "Today was amazing!",
      "photoUrl": null,
      "createdAt": "2024-03-20T10:30:00Z"
    }'
  ```

#### Get a Journal Entry
**Endpoint Name:** `getJournalEntry`
**Backend Source:** `backend/app/api/journal.py` (line 30)
**Frontend Source:** `frontend/app/reflect/page.tsx` (line 39)
- Input: URL parameter `entry_id`
- Output:
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
- Curl Example:
  ```bash
  curl -X GET http://localhost:8001/api/journal/550e8400-e29b-41d4-a716-446655440000
  ```

#### Update a Journal Entry
**Endpoint Name:** `updateJournalEntry`
**Backend Source:** `backend/app/api/journal.py` (line 60)
**Frontend Source:** `frontend/app/reflect/page.tsx` (line 39)
- Input:
  ```json
  {
    "reflectionText": "I felt really connected to everyone.",
    "promptText": "What did you learn from this experience?"
  }
  ```
- Output:
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
- Curl Example:
  ```bash
  curl -X PATCH http://localhost:8001/api/journal/550e8400-e29b-41d4-a716-446655440000 \
    -H "Content-Type: application/json" \
    -d '{
      "reflectionText": "I felt really connected to everyone.",
      "promptText": "What did you learn from this experience?"
    }'
  ```

#### Get User's Journal Entries
**Endpoint Name:** `getUserJournalEntries`
**Backend Source:** `backend/app/api/journal.py` (line 20)
**Frontend Source:** `frontend/app/dashboard/page.tsx` (line 1)
- Input: Query parameters `skip` and `limit`
- Output:
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
- Curl Example:
  ```bash
  curl -X GET "http://localhost:8001/api/journal?skip=0&limit=100"
  ```

#### Get User's Journal Entries by User ID
**Endpoint Name:** `getUserJournalEntriesByUserId`
**Backend Source:** `backend/app/api/journal.py` (line 200)
- Input:
  - Path parameter: `user_id` (required)
  - Query parameters:
    - `skip` (optional, default: 0)
    - `limit` (optional, default: 100)
- Output:
  ```json
  [
    {
      "id": "entry-1",
      "userId": "user-1",
      "category": "happy",
      "subEmotion": "Joyful",
      "text": "Today was amazing! I got a promotion at work and celebrated with my team.",
      "photoUrl": null,
      "reflections": [],
      "createdAt": "2024-03-20T10:30:00Z",
      "updatedAt": "2024-03-20T10:30:00Z"
    }
  ]
  ```
- Curl Example:
  ```bash
  # Get all entries for a user
  curl "http://localhost:8001/api/journal/user/user-1"

  # Get paginated entries
  curl "http://localhost:8001/api/journal/user/user-1?skip=0&limit=10"
  ```

### Emotions

#### Get Emotion Categories
**Endpoint Name:** `getEmotionCategories`
**Backend Source:** `backend/app/api/emotions.py` (line 10)
**Frontend Source:** `frontend/app/emotions/page.tsx` (line 8)
- Input: None
- Output:
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
- Curl Example:
  ```bash
  curl -X GET http://localhost:8001/api/emotions/categories
  ```

#### Get Sub-Emotions
**Endpoint Name:** `getSubEmotions`
**Backend Source:** `backend/app/api/emotions.py` (line 18)
**Frontend Source:** `frontend/app/emotions/[category]/page.tsx` (line 1)
- Input: Query parameter `category` (optional)
  - Valid categories: `happy`, `sad`, `angry`, `anxious`, `calm`
  - Example: `?category=happy`, `?category=sad`, `?category=angry`, `?category=anxious`, `?category=calm`
- Output:
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
- Curl Example:
  ```bash
  curl -X GET "http://localhost:8001/api/emotions/sub-emotions?category=happy"
  ```
- Example Sub-Emotions by Category:
  - Happy: Joyful, Grateful, Excited, Content, Proud, Peaceful, Hopeful, Inspired, Loved, Cheerful
  - Sad: Lonely, Disappointed, Hurt, Grief, Regretful, Hopeless, Melancholic, Empty, Heartbroken, Vulnerable
  - Angry: Frustrated, Irritated, Resentful, Jealous, Betrayed, Furious, Bitter, Disgusted, Outraged, Hostile
  - Anxious: Nervous, Worried, Stressed, Insecure, Fearful, Panicked, Uneasy, Restless, Doubtful, Overwhelmed
  - Calm: Relaxed, Mindful, Centered, Balanced, Serene, Tranquil, Peaceful, Grounded, Harmonious, Soothed

### Prompts

#### Get Prompts
**Endpoint Name:** `getPrompts`
**Backend Source:** `backend/app/api/prompts.py` (line 8)
**Frontend Source:** `frontend/app/api/reflection/route.ts` (line 1)
- Input: Query parameter `category` (optional)
- Output:
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
- Curl Example:
  ```bash
  curl -X GET "http://localhost:8001/api/prompts?category=happy"
  ```

### Users

#### Create User
**Endpoint Name:** `createUser`
**Backend Source:** `backend/app/api/users.py`
**Frontend Source:** `frontend/app/api/user/stats/route.ts` (line 1)
- Input:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123",
    "username": "user1"
  }
  ```
- Output:
  ```json
  {
    "id": "user1",
    "email": "user@example.com",
    "username": "user1",
    "createdAt": "2024-03-20T10:30:00Z"
  }
  ```
- Curl Example:
  ```bash
  curl -X POST http://localhost:8001/api/users \
    -H "Content-Type: application/json" \
    -d '{
      "email": "user@example.com",
      "password": "securepassword123",
      "username": "user1"
    }'
  ```

#### Get User
**Endpoint Name:** `getUser`
**Backend Source:** `backend/app/api/users.py`
**Frontend Source:** `frontend/app/api/user/mood-summary/route.ts` (line 1)
- Input: URL parameter `user_id`
- Output:
  ```json
  {
    "id": "user1",
    "email": "user@example.com",
    "username": "user1",
    "createdAt": "2024-03-20T10:30:00Z",
    "updatedAt": "2024-03-20T10:30:00Z"
  }
  ```
- Curl Example:
  ```bash
  curl -X GET http://localhost:8001/api/users/user1
  ```

## Additional Endpoints

### Image Management
- **POST /api/images**
  - Upload images
  - Request: multipart/form-data with 'file' field
  - Response: { url: string }
  - Backend: `frontend/app/api/images/route.ts` (Frontend-only implementation)
  - Frontend: `frontend/app/components/ImageUpload.tsx`
  - Status: Frontend-only implementation with mock storage
  - Input: multipart/form-data
    ```json
    {
      "file": [binary image data]
    }
    ```
  - Output:
    ```json
    {
      "url": "/api/images/abc123"
    }
    ```
  - Curl Example:
    ```bash
    curl -X POST http://localhost:8001/api/images \
      -H "Content-Type: multipart/form-data" \
      -F "file=@/path/to/image.jpg"
    ```

- **GET /api/images/[id]**
  - Retrieve images by ID
  - Response: Image file with appropriate content type
  - Backend: `frontend/app/api/images/[id]/route.ts` (Frontend-only implementation)
  - Frontend: `frontend/app/components/ImageDisplay.tsx`
  - Status: Frontend-only implementation with mock storage
  - Input: None (URL parameter)
  - Output: Binary image data with appropriate content-type header
  - Curl Example:
    ```bash
    curl -X GET http://localhost:8001/api/images/abc123 \
      -H "Accept: image/jpeg"
    ```

### AI Chatbot
- **POST /api/bot**
  - AI-powered emotional support chat
  - Request: { messages: Array<{role: string, content: string}> }
  - Response: { message: string }
  - Backend: `frontend/app/api/bot/route.ts` (Frontend-only implementation)
  - Frontend: `frontend/app/components/ChatBot.tsx`
  - Status: Frontend-only implementation with OpenAI integration
  - Input:
    ```json
    {
      "messages": [
        {
          "role": "user",
          "content": "I feel anxious about my presentation tomorrow."
        }
      ]
    }
    ```
  - Output:
    ```json
    {
      "message": "I understand that presentations can be nerve-wracking. What specific aspects of the presentation are causing you the most anxiety?"
    }
    ```
  - Curl Example:
    ```bash
    curl -X POST http://localhost:8001/api/bot \
      -H "Content-Type: application/json" \
      -d '{
        "messages": [
          {
            "role": "user",
            "content": "I feel anxious about my presentation tomorrow."
          }
        ]
      }'
    ```

### Enhanced Reflection
- **POST /api/generate-reflection**
  - Generate context-aware reflection prompts
  - Request: { entry: JournalEntry, previousReflection?: string, reflectionCount?: number }
  - Response: { prompt: string, source: string }
  - Backend: `frontend/app/api/generate-reflection/route.ts` (Frontend-only implementation)
  - Frontend: `frontend/app/components/ReflectionGenerator.tsx`
  - Status: Frontend-only implementation with static prompts
  - Input:
    ```json
    {
      "entry": {
        "category": "anxious",
        "subEmotion": "Overwhelmed",
        "text": "I have so many deadlines coming up..."
      },
      "previousReflection": "I need to prioritize my tasks",
      "reflectionCount": 1
    }
    ```
  - Output:
    ```json
    {
      "prompt": "What's one thing you can control in this situation?",
      "source": "enhanced-fallback"
    }
    ```
  - Curl Example:
    ```bash
    curl -X POST http://localhost:8001/api/generate-reflection \
      -H "Content-Type: application/json" \
      -d '{
        "entry": {
          "category": "anxious",
          "subEmotion": "Overwhelmed",
          "text": "I have so many deadlines coming up..."
        },
        "previousReflection": "I need to prioritize my tasks",
        "reflectionCount": 1
      }'
    ```

- **GET /api/reflection**
  - Get emotion-specific reflection prompts
  - Query: category (optional)
  - Response: { prompt: string }
  - Backend: `frontend/app/api/reflection/route.ts` (Frontend-only implementation)
  - Frontend: `frontend/app/components/ReflectionPrompt.tsx`
  - Status: Frontend-only implementation with static prompts
  - Input: Query parameter
  - Output:
    ```json
    {
      "prompt": "What's one thing you can control in this situation?"
    }
    ```
  - Curl Example:
    ```bash
    curl -X GET "http://localhost:8001/api/reflection?category=anxious"
    ```

### User Analytics
- **GET /api/user/streak**
  - User streak information
  - Response: { currentStreak: number, longestStreak: number, lastCheckInDate: string, streakHistory: Array }
  - Backend: `frontend/app/api/user/streak/route.ts` (Frontend-only implementation)
  - Frontend: `frontend/app/components/StreakDisplay.tsx`
  - Status: Frontend-only implementation with mock data
  - Input: None
  - Output:
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
  - Curl Example:
    ```bash
    curl -X GET http://localhost:8001/api/user/streak
    ```

- **GET /api/user/stats**
  - Detailed user statistics
  - Query: period (optional)
  - Response: { summary: {...}, emotions: {...}, subEmotions: Array, streaks: {...}, timeline: Array }
  - Backend: `frontend/app/api/user/stats/route.ts` (Frontend-only implementation)
  - Frontend: `frontend/app/components/UserStats.tsx`
  - Status: Frontend-only implementation with mock data
  - Input: Query parameter
  - Output:
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
  - Curl Example:
    ```bash
    curl -X GET "http://localhost:8001/api/user/stats?period=month"
    ```

- **GET /api/user/mood-summary**
  - Mood analysis and trends
  - Query: period (optional)
  - Response: { moodDistribution: {...}, mostFrequent: {...}, trends: {...}, weekdayPatterns: Array }
  - Backend: `frontend/app/api/user/mood-summary/route.ts` (Frontend-only implementation)
  - Frontend: `frontend/app/components/MoodSummary.tsx`
  - Status: Frontend-only implementation with mock data
  - Input: Query parameter
  - Output:
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
  - Curl Example:
    ```bash
    curl -X GET "http://localhost:8001/api/user/mood-summary?period=month"
    ```

- **GET /api/user/profile**
  - User profile and basic stats
  - Response: { user: {...}, stats: {...} }
  - Backend: `frontend/app/api/user/profile/route.ts` (Frontend-only implementation)
  - Frontend: `frontend/app/components/UserProfile.tsx`
  - Status: Frontend-only implementation with mock data
  - Input: None
  - Output:
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
  - Curl Example:
    ```bash
    curl -X GET http://localhost:8001/api/user/profile
    ```

## Implementation Status

### Image Management
- **Status**: Frontend-only implementation with mock storage
- **Backend Implementation**: Not implemented
- **Frontend Implementation**: Complete with mock data
- **Mock Data**: In-memory storage with sample images

### AI Chatbot
- **Status**: Frontend-only implementation with OpenAI integration
- **Backend Implementation**: Not implemented
- **Frontend Implementation**: Complete with OpenAI API integration
- **Mock Data**: Direct OpenAI API calls

### Enhanced Reflection
- **Status**: Frontend-only implementation with static prompts
- **Backend Implementation**: Not implemented
- **Frontend Implementation**: Complete with static prompts
- **Mock Data**: Hardcoded prompt templates

### User Analytics
- **Status**: Frontend-only implementation with mock data
- **Backend Implementation**: Not implemented
- **Frontend Implementation**: Complete with mock data
- **Mock Data**: Generated statistics based on mock journal entries

## Mock Implementation Details

### Image Management
- **Current Implementation**:
  - Uses in-memory storage (`imageStore` object)
  - Limited to development environment
  - No persistence between server restarts
  - Basic file type validation
  - Mock delay of 500ms for API calls

- **Mock Data Structure**:
  ```typescript
  const imageStore: Record<string, {
    data: Uint8Array;
    type: string;
  }> = {}
  ```

### AI Chatbot
- **Current Implementation**:
  - Uses OpenAI's GPT-4 API directly from frontend
  - System prompt defines bot's empathetic behavior
  - Temperature set to 0.7 for balanced responses
  - Temperature set to 0.7 for balanced responses
  - Max tokens limited to 500 for concise responses
  - Mock delay of 500ms for API calls

- **Mock Configuration**:
  ```typescript
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
  ```

### Analytics
- **Current Implementation**:
  - Static mock data with random values
  - Predefined emotion distributions
  - Fixed streak calculations
  - Mock delay of 500ms for API calls

- **Mock Data Structure**:
  ```typescript
  {
    summary: {
      totalEntries: 12,
      totalReflections: 8,
      averageEntriesPerWeek: 3,
      completionRate: 75,
    },
    emotions: {
      happy: 4,
      sad: 2,
      // ...
    }
  }
  ```

## Planned Backend Implementations

### Image Management
- **Storage Service**:
  - Implement AWS S3 or similar cloud storage
  - Add image processing (resize, optimize)
  - Implement CDN for faster delivery
  - Add file size limits and type restrictions

- **Database Schema**:
  ```sql
  CREATE TABLE images (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  ```

### AI Chatbot
- **Backend Service**:
  - Implement rate limiting
  - Add conversation history storage
  - Implement context management
  - Add sentiment analysis
  - Cache common responses

- **Database Schema**:
  ```sql
  CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    messages JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  ```

### Analytics
- **Backend Service**:
  - Implement real-time data processing
  - Add data aggregation jobs
  - Implement caching layer
  - Add data export functionality

- **Database Schema**:
  ```sql
  CREATE TABLE analytics (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    metric_type TEXT NOT NULL,
    metric_value JSONB NOT NULL,
    period TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  ```

## Technical Requirements

### Image Management
1. **Storage Requirements**:
   - Cloud storage service (AWS S3, Google Cloud Storage)
   - CDN for global delivery
   - Image processing service
   - Backup and disaster recovery

2. **Security Requirements**:
   - File type validation
   - Size limits
   - Access control
   - Encryption at rest

3. **Performance Requirements**:
   - Upload time < 2s
   - Load time < 1s
   - Support for concurrent uploads
   - Automatic optimization

### AI Chatbot
1. **API Requirements**:
   - OpenAI API integration
   - Rate limiting
   - Error handling
   - Response caching

2. **Security Requirements**:
   - API key management
   - Data encryption
   - User authentication
   - Content moderation

3. **Performance Requirements**:
   - Response time < 3s
   - Support for concurrent users
   - Message history management
   - Context preservation

### Analytics
1. **Data Requirements**:
   - Real-time processing
   - Data aggregation
   - Historical data storage
   - Data export capabilities

2. **Security Requirements**:
   - Data encryption
   - Access control
   - Audit logging
   - Data retention policies

3. **Performance Requirements**:
   - Query response time < 1s
   - Support for large datasets
   - Real-time updates
   - Caching strategy

### User Experience
1. **Real-time Updates**:
   - WebSocket implementation
   - Event-driven architecture
   - State synchronization
   - Conflict resolution

2. **PWA Requirements**:
   - Service worker implementation
   - App manifest
   - Offline storage
   - Push notifications

3. **Offline Support**:
   - Local storage strategy
   - Sync mechanism
   - Conflict resolution
   - Data persistence

## Implementation Priority

1. **High Priority**:
   - Image storage backend
   - Real-time updates
   - Analytics backend
   - Offline support

2. **Medium Priority**:
   - AI chatbot backend
   - PWA capabilities
   - Push notifications
   - Advanced analytics

3. **Low Priority**:
   - Additional visualization options
   - Export functionality
   - Advanced AI features
   - Social features

## API Registration
All endpoints are registered in `backend/app/main.py` (line 30-33):
```python
app.include_router(journal.router, prefix="/api/journal", tags=["journal"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(emotions.router, prefix="/api/emotions", tags=["emotions"])
app.include_router(prompts.router, prefix="/api/prompts", tags=["prompts"])
```
