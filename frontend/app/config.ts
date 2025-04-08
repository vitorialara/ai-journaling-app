// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://feelwrite-622255484144.us-central1.run.app',
  ENDPOINTS: {
    JOURNAL: '/api/journal/',
    PROMPTS: '/api/prompts',
    COMPLETION: '/api/completion/',
    USER_STATS: '/api/user/stats/',
    MOOD_SUMMARY: '/api/user/mood-summary/'
  }
} as const;

// Default values
export const DEFAULT_VALUES = {
  USER_ID: 'user-1',
  PAGE_SIZE: 5,
  MIN_TEXT_LENGTH: 1
} as const;

// Emotion categories and their configurations
export const EMOTION_CONFIG = {
  CATEGORIES: ['happy', 'sad', 'angry', 'anxious', 'calm'] as const,
  DEFAULT_CATEGORY: 'anxious' as const,
  DEFAULT_SUB_EMOTION: 'Nervous' as const
} as const;
