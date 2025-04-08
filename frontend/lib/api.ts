import type { JournalEntry, CreateJournalEntryInput } from "@/types/journal"

// Mock database for journal entries
let journalEntries: JournalEntry[] = [
  {
    id: "6fdea250-fa58-46b2-a7e5-e3eadc71d59b",
    category: "happy",
    subEmotion: "Excited",
    text: "I'm feeling really excited about my new project!",
    photoUrl: null,
    reflections: [],
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    category: "calm",
    subEmotion: "Grounded",
    text: "Taking a moment to appreciate the present.",
    photoUrl: null,
    reflections: [],
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    category: "anxious",
    subEmotion: "Overwhelmed",
    text: "I have so many deadlines coming up and I don't know how I'll manage to complete everything on time.",
    photoUrl: null,
    reflections: [],
    createdAt: new Date().toISOString()
  }
]

// Mock database for user-specific journal entries
const journalEntriesByUser: { [userId: string]: JournalEntry[] } = {
  user1: [...journalEntries], // Example: User 1 has all the initial entries
}

// Function to simulate getting the current user ID
async function getCurrentUserId(): Promise<string> {
  // In a real application, this would involve authentication and session management
  // For this example, we'll just return a hardcoded user ID
  return "user1"
}

// Create a new journal entry
export async function createJournalEntry(input: CreateJournalEntryInput): Promise<JournalEntry> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const userId = await getCurrentUserId()
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      ...input,
    }

    if (!journalEntriesByUser[userId]) {
      journalEntriesByUser[userId] = []
    }

    journalEntriesByUser[userId].unshift(newEntry)
    return newEntry
  } catch (error) {
    console.error("Error creating journal entry:", error)
    throw new Error("Failed to create journal entry")
  }
}

// Get all journal entries
export async function getJournalEntries(): Promise<JournalEntry[]> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    const userId = await getCurrentUserId()
    return journalEntriesByUser[userId] || []
  } catch (error) {
    console.error("Error fetching journal entries:", error)
    throw error
  }
}

// Get a single journal entry by ID
export async function getJournalEntry(id: string): Promise<JournalEntry> {
  try {
    if (!id) {
      throw new Error('Journal entry ID is required')
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const userId = await getCurrentUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    const entries = journalEntriesByUser[userId] || []
    const entry = entries.find((entry) => entry.id === id)

    if (!entry) {
      console.warn(`Journal entry with ID ${id} not found for user ${userId}`)
      throw new Error(`Journal entry with ID ${id} not found`)
    }

    return entry
  } catch (error) {
    console.error(`Error fetching journal entry with ID ${id}:`, error)
    throw error
  }
}

// Update a journal entry
export async function updateJournalEntry(
  id: string,
  updates: Partial<JournalEntry>
): Promise<JournalEntry> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const userId = await getCurrentUserId()
    const entries = journalEntriesByUser[userId] || []
    const entryIndex = entries.findIndex((entry) => entry.id === id)

    if (entryIndex === -1) {
      throw new Error(`Journal entry with ID ${id} not found`)
    }

    // Update the entry
    entries[entryIndex] = {
      ...entries[entryIndex],
      ...updates
    }

    // Update both databases to keep them in sync
    journalEntriesByUser[userId] = entries
    journalEntries = entries

    return entries[entryIndex]
  } catch (error) {
    console.error(`Error updating journal entry with ID ${id}:`, error)
    throw error
  }
}

// Update a journal entry's reflection
export async function updateJournalEntryReflection(
  id: string,
  reflectionText: string,
  promptText: string,
): Promise<JournalEntry> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const userId = await getCurrentUserId()
    const entryIndex = (journalEntriesByUser[userId] || []).findIndex((entry) => entry.id === id)

    if (entryIndex === -1) {
      throw new Error(`Journal entry with ID ${id} not found`)
    }

    // Get the current entry
    const entry = journalEntriesByUser[userId][entryIndex]

    // Initialize reflections array if it doesn't exist
    if (!entry.reflections) {
      entry.reflections = []
    }

    // Add the new reflection to the array
    entry.reflections.push({
      prompt: promptText,
      response: reflectionText,
      timestamp: new Date().toISOString(),
    })

    // Update the entry
    journalEntriesByUser[userId][entryIndex] = entry

    return entry
  } catch (error) {
    console.error(`Error updating reflection for entry with ID ${id}:`, error)
    throw error
  }
}

// Get a reflection prompt based on the journal entry
export async function getReflectionPrompt(entry: JournalEntry): Promise<string> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // In a real app, this would call the OpenAI API
    const prompts: Record<string, string[]> = {
      happy: [
        "What made this moment special for you?",
        "How can you create more moments like this in your life?",
        "Who would you like to share this happiness with?",
      ],
      sad: [
        "What would you say to a friend feeling this way?",
        "Is there a small comfort you could give yourself right now?",
        "What's one tiny step that might help you feel better?",
      ],
      angry: [
        "What's beneath this anger? Is there another emotion hiding there?",
        "What would help you release some of this tension?",
        "Is there a boundary you need to set with someone?",
      ],
      anxious: [
        "What's one thing you can control in this situation?",
        "What would help you feel more grounded right now?",
        "What's the kindest thing you could do for yourself today?",
      ],
    }

    const categoryPrompts = prompts[entry.category] || prompts.anxious
    const randomIndex = Math.floor(Math.random() * categoryPrompts.length)

    return categoryPrompts[randomIndex]
  } catch (error) {
    console.error("Error generating reflection prompt:", error)
    return "Thanks for being honest with yourself. What's something kind you could do for yourself right now?"
  }
}
