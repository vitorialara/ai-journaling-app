# Feel-Write API Testing Guide

This document provides examples for testing all endpoints of the Feel-Write API.

## Using Swagger UI

1. Open http://localhost:8000/docs in your browser
2. You'll see all endpoints listed with their documentation
3. Click on any endpoint to expand it
4. Click "Try it out" to test the endpoint
5. Fill in the required parameters
6. Click "Execute" to send the request

## Using cURL Commands

### 1. Create a Journal Entry
```bash
curl -X POST "http://localhost:8000/api/journal" \
     -H "Content-Type: application/json" \
     -d '{
           "category": "happy",
           "subEmotion": "excited",
           "text": "I had a great day today!"
         }'
```

### 2. Get All Journal Entries
```bash
curl -X GET "http://localhost:8000/api/journal"
```

### 3. Get a Specific Journal Entry
```bash
# First, create an entry and note its ID from the response
# Then use that ID to get the specific entry
curl -X GET "http://localhost:8000/api/journal/YOUR_ENTRY_ID"
```

### 4. Update a Journal Entry with Reflection
```bash
curl -X PATCH "http://localhost:8000/api/journal/YOUR_ENTRY_ID" \
     -H "Content-Type: application/json" \
     -d '{
           "promptText": "What made you feel this way?",
           "reflectionText": "I achieved my goals for the day and received positive feedback."
         }'
```

## Complete Testing Sequence

Here's a complete sequence to test all endpoints:

1. Create a new entry:
```bash
curl -X POST "http://localhost:8000/api/journal" \
     -H "Content-Type: application/json" \
     -d '{
           "category": "happy",
           "subEmotion": "excited",
           "text": "I had a great day today!"
         }'
```

2. Get all entries to see what you created:
```bash
curl -X GET "http://localhost:8000/api/journal"
```

3. Copy the ID from the response and get that specific entry:
```bash
curl -X GET "http://localhost:8000/api/journal/YOUR_ENTRY_ID"
```

4. Add a reflection to the entry:
```bash
curl -X PATCH "http://localhost:8000/api/journal/YOUR_ENTRY_ID" \
     -H "Content-Type: application/json" \
     -d '{
           "promptText": "What made you feel this way?",
           "reflectionText": "I achieved my goals for the day and received positive feedback."
         }'
```

5. Get the entry again to see the added reflection:
```bash
curl -X GET "http://localhost:8000/api/journal/YOUR_ENTRY_ID"
```

## Example Responses

### Create Entry Response
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user1",
  "category": "happy",
  "subEmotion": "excited",
  "text": "I had a great day today!",
  "reflections": [],
  "createdAt": "2024-04-05T12:00:00Z",
  "updatedAt": "2024-04-05T12:00:00Z"
}
```

### Get Entry Response
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user1",
  "category": "happy",
  "subEmotion": "excited",
  "text": "I had a great day today!",
  "reflections": [
    {
      "prompt": "What made you feel this way?",
      "response": "I achieved my goals for the day and received positive feedback.",
      "timestamp": "2024-04-05T12:30:00Z"
    }
  ],
  "createdAt": "2024-04-05T12:00:00Z",
  "updatedAt": "2024-04-05T12:30:00Z"
}
```

## Error Responses

### 404 Not Found
```json
{
  "detail": "Journal entry not found"
}
```

### 422 Unprocessable Entity
```json
{
  "detail": [
    {
      "loc": ["body", "category"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```


Database: feel-write
Host: localhost
Port: 5432
Username: postgres
Password: postgres
Schema: feelwrite
