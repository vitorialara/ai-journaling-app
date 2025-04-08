import type { JournalEntry } from "@/app/types/journal"

/**
 * DUMMY DATA FOR JOURNAL ENDPOINTS
 *
 * Endpoints that use this data:
 *
 * 1. GET /api/journal
 *    - Returns all journal entries
 *    - Query params: userId (optional)
 *    - Example: fetch('/api/journal')
 *    - Response: { entries: JournalEntry[] }
 *
 * 2. POST /api/journal
 *    - Creates a new journal entry
 *    - Body: { category, subEmotion, text, photoUrl, createdAt? }
 *    - Example:
 *      fetch('/api/journal', {
 *        method: 'POST',
 *        headers: { 'Content-Type': 'application/json' },
 *        body: JSON.stringify({
 *          category: 'happy',
 *          subEmotion: 'Joyful',
 *          text: 'Today was amazing!',
 *          photoUrl: null
 *        })
 *      })
 *    - Response: { entry: JournalEntry }
 *
 * 3. GET /api/journal/[id]
 *    - Returns a specific journal entry by ID
 *    - Example: fetch('/api/journal/1')
 *    - Response: { entry: JournalEntry }
 *
 * 4. PATCH /api/journal/[id]
 *    - Updates a journal entry (adds reflection)
 *    - Body: { reflectionText, promptText }
 *    - Example:
 *      fetch('/api/journal/1', {
 *        method: 'PATCH',
 *        headers: { 'Content-Type': 'application/json' },
 *        body: JSON.stringify({
 *          reflectionText: 'My reflection...',
 *          promptText: 'What did you learn?'
 *        })
 *      })
 *    - Response: { entry: JournalEntry }
 */

// In-memory storage for the dummy backend
export const journalEntries: JournalEntry[] = [
  {
    id: "1",
    userId: "user-1",
    category: "anxious",
    subEmotion: "Overwhelmed",
    text: "I have so many deadlines coming up and I don't know how I'll manage to complete everything on time. My mind keeps racing with all the tasks I need to do.",
    photoUrl: null,
    reflections: [
      {
        prompt: "What's one thing you can control in this situation?",
        response: "Maybe I could try breaking down my tasks into smaller steps and focus on one thing at a time.",
        timestamp: "2023-04-15T10:35:00Z",
      },
    ],
    createdAt: "2023-04-15T10:30:00Z",
  },
  {
    id: "2",
    userId: "user-1",
    category: "happy",
    subEmotion: "Grateful",
    text: "Had a wonderful day with friends. We went hiking and the weather was perfect. I feel so thankful for these moments.",
    photoUrl: "/placeholder.svg?height=200&width=200",
    createdAt: "2023-04-10T18:45:00Z",
  },
  {
    id: "3",
    userId: "user-1",
    category: "sad",
    subEmotion: "Lonely",
    text: "Feeling disconnected today. Everyone seems busy with their own lives and I'm missing having someone to talk to.",
    photoUrl: null,
    reflections: [
      {
        prompt: "What would you say to a friend feeling this way?",
        response: "I could reach out to an old friend I haven't spoken to in a while.",
        timestamp: "2023-04-05T21:20:00Z",
      },
    ],
    createdAt: "2023-04-05T21:15:00Z",
  },
]
