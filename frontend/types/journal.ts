import type { EmotionCategory, SubEmotion } from "./emotions"

export interface JournalEntry {
  id: string
  category: EmotionCategory
  subEmotion: SubEmotion
  text: string
  photoUrl: string | null
  reflections?: ReflectionItem[]
  createdAt: string
}

export interface CreateJournalEntryInput {
  category: EmotionCategory
  subEmotion: SubEmotion
  text: string
  photoUrl: string | null
  createdAt?: string
}

export interface ReflectionItem {
  prompt: string
  response: string
  timestamp: string
}

