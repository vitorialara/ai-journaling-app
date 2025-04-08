import type { EmotionCategory, SubEmotion } from "./emotions"

export interface Reflection {
  prompt: string
  response: string
  timestamp: string
}

export interface JournalEntry {
  id: string
  userId: string
  category: EmotionCategory
  subEmotion: SubEmotion
  text: string
  photoUrl: string | null
  reflections: Reflection[]
  createdAt: string
  updatedAt: string
}

export interface CreateJournalEntryInput {
  userId: string
  category: EmotionCategory
  subEmotion: SubEmotion
  text: string
  photoUrl: string | null
  createdAt?: string
}
