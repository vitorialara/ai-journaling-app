import type { JournalEntry, CreateJournalEntryInput } from "../types/journal"
import { v4 as uuidv4 } from "uuid"

// Local storage keys
const ENTRIES_STORAGE_KEY = "feel-write_journal_entries"

// Helper to get entries from local storage
const getEntriesFromStorage = (): JournalEntry[] => {
  if (typeof window === "undefined") return []

  try {
    const storedEntries = localStorage.getItem(ENTRIES_STORAGE_KEY)
    return storedEntries ? JSON.parse(storedEntries) : []
  } catch (error) {
    console.error("Error reading from local storage:", error)
    return []
  }
}

// Helper to save entries to local storage
const saveEntriesToStorage = (entries: JournalEntry[]): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(entries))
  } catch (error) {
    console.error("Error saving to local storage:", error)
  }
}

// Create a new journal entry
export async function createJournalEntry(input: CreateJournalEntryInput): Promise<JournalEntry> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newEntry: JournalEntry = {
      id: uuidv4(),
      userId: "local-user",
      category: input.category,
      subEmotion: input.subEmotion,
      text: input.text,
      photoUrl: input.photoUrl,
      createdAt: input.createdAt || new Date().toISOString(),
    }

    // Get existing entries
    const entries = getEntriesFromStorage()

    // Add new entry at the beginning
    const updatedEntries = [newEntry, ...entries]

    // Save to local storage
    saveEntriesToStorage(updatedEntries)

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

    return getEntriesFromStorage()
  } catch (error) {
    console.error("Error fetching journal entries:", error)
    throw new Error("Failed to fetch journal entries")
  }
}

// Get a single journal entry by ID
export async function getJournalEntry(id: string): Promise<JournalEntry> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const entries = getEntriesFromStorage()
    const entry = entries.find((entry) => entry.id === id)

    if (!entry) {
      throw new Error(`Journal entry with ID ${id} not found`)
    }

    return entry
  } catch (error) {
    console.error(`Error fetching journal entry with ID ${id}:`, error)
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

    const entries = getEntriesFromStorage()
    const entryIndex = entries.findIndex((entry) => entry.id === id)

    if (entryIndex === -1) {
      throw new Error(`Journal entry with ID ${id} not found`)
    }

    // Get the current entry
    const entry = entries[entryIndex]

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

    // Update the entry in the array
    entries[entryIndex] = entry

    // Save updated entries to local storage
    saveEntriesToStorage(entries)

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
        "What does this happiness teach you about what truly matters to you?",
        "How can you hold onto this feeling when facing challenges?",
        "What small actions could help you experience this feeling more often?",
        "How does this positive emotion affect your perspective on other areas of life?",
        "What strengths or qualities in yourself does this emotion highlight?",
        "If you could bottle this feeling, when would you choose to open it?",
        "What gratitude arises when you sit with this emotion?",
      ],
      sad: [
        "What would you say to a friend feeling this way?",
        "Is there a small comfort you could give yourself right now?",
        "What's one tiny step that might help you feel better?",
        "How have you moved through similar feelings in the past?",
        "What would feel like a gentle step forward from here?",
        "What does this sadness need most from you right now?",
        "Is there wisdom or insight hidden within this difficult feeling?",
        "How might this emotion be trying to guide or protect you?",
        "What boundaries might need to be set or respected?",
        "What would self-compassion look like in this moment?",
      ],
      angry: [
        "What's beneath this anger? Is there another emotion hiding there?",
        "What would help you release some of this tension?",
        "Is there a boundary you need to set with someone?",
        "What would resolution or peace look like in this situation?",
        "What wisdom might your anger be trying to share with you?",
        "How can you honor this feeling without being controlled by it?",
        "What needs of yours aren't being met in this situation?",
        "How might you channel this energy constructively?",
        "What would help you feel heard or understood?",
        "If your anger could speak, what would it say it needs?",
      ],
      anxious: [
        "What's one thing you can control in this situation?",
        "What would help you feel more grounded right now?",
        "What's the kindest thing you could do for yourself today?",
        "What's a more balanced perspective you could consider?",
        "What self-care practice might help ease this anxiety?",
        "What's the worst that could happen, and how would you cope?",
        "What small step would help you feel more secure?",
        "How can you bring more certainty to this uncertain situation?",
        "What has helped you manage similar feelings in the past?",
        "How might you create a moment of safety for yourself right now?",
      ],
      calm: [
        "How can you bring more of this peaceful feeling into your daily life?",
        "What conditions helped create this sense of calm?",
        "What insights come to you when you're in this centered state?",
        "How does this calmness affect how you see your challenges?",
        "What would you like to remember about this feeling?",
        "What practices help you maintain this sense of balance?",
        "How does your body feel different when you're in this state?",
        "What clarity or wisdom emerges from this place of stillness?",
        "How might you anchor yourself to return to this feeling later?",
        "What does this calm state reveal about what truly matters to you?",
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

