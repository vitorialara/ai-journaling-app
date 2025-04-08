import type { JournalEntry, CreateJournalEntryInput } from "../types/journal"
import { API_CONFIG, DEFAULT_VALUES } from "../config"

// Helper function for making API requests
export async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`
    console.log(`Making API request to: ${url}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json"
      },
      mode: "cors",
      credentials: "include",
      signal: controller.signal,
      ...options,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      // Try to get error details
      let errorDetails = ""
      try {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const errorJson = await response.json()
          errorDetails = JSON.stringify(errorJson)
        } else {
          errorDetails = await response.text()
          // Truncate long HTML responses
          if (errorDetails.startsWith("<!DOCTYPE") || errorDetails.startsWith("<html")) {
            errorDetails = "HTML error page returned instead of JSON"
          }
        }
      } catch (parseError) {
        errorDetails = "Could not parse error response"
      }

      console.error(`API error (${response.status}): ${errorDetails}`)
      throw new Error(`API returned status ${response.status}: ${errorDetails}`)
    }

    return response.json()
  } catch (error: unknown) {
    console.error("API request failed:", error)
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Could not connect to the server. Please check your internet connection and try again.")
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error("Request timed out. Please try again.")
    }
    if (error instanceof Error) {
      throw error
    }
    throw new Error("An unknown error occurred")
  }
}

// Create a new journal entry
export async function createJournalEntry(input: CreateJournalEntryInput): Promise<JournalEntry> {
  try {
    // Map emotion categories to IDs
    const categoryToId: Record<string, number> = {
      'happy': 1,
      'sad': 2,
      'angry': 3,
      'anxious': 4,
      'calm': 5
    };

    // Map sub-emotions to IDs based on category
    const subEmotionToId: Record<string, Record<string, number>> = {
      'happy': {
        'Joyful': 1,
        'Grateful': 2,
        'Excited': 3,
        'Content': 4,
        'Proud': 5,
        'Peaceful': 6,
        'Hopeful': 7,
        'Inspired': 8,
        'Loved': 9,
        'Cheerful': 10
      },
      'sad': {
        'Lonely': 11,
        'Disappointed': 12,
        'Hurt': 13,
        'Grief': 14,
        'Regretful': 15,
        'Hopeless': 16,
        'Melancholic': 17,
        'Empty': 18,
        'Heartbroken': 19,
        'Vulnerable': 20
      },
      'angry': {
        'Frustrated': 21,
        'Irritated': 22,
        'Resentful': 23,
        'Jealous': 24,
        'Betrayed': 25,
        'Furious': 26,
        'Bitter': 27,
        'Disgusted': 28,
        'Outraged': 29,
        'Hostile': 30
      },
      'anxious': {
        'Nervous': 31,
        'Worried': 32,
        'Stressed': 33,
        'Insecure': 34,
        'Fearful': 35,
        'Panicked': 36,
        'Uneasy': 37,
        'Restless': 38,
        'Doubtful': 39,
        'Overwhelmed': 40
      },
      'calm': {
        'Relaxed': 41,
        'Mindful': 42,
        'Centered': 43,
        'Balanced': 44,
        'Serene': 45,
        'Tranquil': 46,
        'Peaceful': 47,
        'Grounded': 48,
        'Harmonious': 49,
        'Soothed': 50
      }
    };

    const category_id = categoryToId[input.category];
    const sub_emotion_id = subEmotionToId[input.category][input.subEmotion];

    if (!category_id || !sub_emotion_id) {
      throw new Error('Invalid category or sub-emotion');
    }

    const response = await fetchAPI<JournalEntry>(API_CONFIG.ENDPOINTS.JOURNAL, {
      method: "POST",
      body: JSON.stringify({
        text: input.text,
        category_id,
        sub_emotion_id,
        photo_url: input.photoUrl,
        created_at: input.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: input.userId || DEFAULT_VALUES.USER_ID,
        reflections: []
      }),
    })
    return response
  } catch (error) {
    console.error("Failed to create journal entry:", error)
    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        throw new Error("Please sign in to save your journal entry.")
      }
      if (error.message.includes("Failed to fetch")) {
        throw new Error("Could not connect to the server. Please check your internet connection and try again.")
      }
      if (error.message.includes("API returned status")) {
        throw new Error(`Server error: ${error.message}`)
      }
      if (error.message === 'Invalid category or sub-emotion') {
        throw new Error("Invalid emotion category or sub-emotion selected.")
      }
    }
    throw new Error("There was an error saving your journal entry. Please try again.")
  }
}

// Get all journal entries
export async function getJournalEntries(): Promise<JournalEntry[]> {
  try {
    const data = await fetchAPI<{ entries: JournalEntry[] }>(API_CONFIG.ENDPOINTS.JOURNAL)
    return data.entries
  } catch (error) {
    console.error("Failed to get journal entries, using dummy data:", error)
    // Return dummy data
    return [
      {
        id: "dummy-1",
        userId: "user-1",
        text: "I had a great day today. The weather was perfect for a walk in the park.",
        category: "happy",
        subEmotion: "Joyful",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        photoUrl: "/placeholder.svg?height=300&width=300",
        reflections: [
          {
            prompt: "What made this moment special for you?",
            response: "Being outdoors and feeling the sunshine really lifted my mood.",
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
          },
        ],
      },
      {
        id: "dummy-2",
        userId: "user-1",
        text: "I'm feeling a bit anxious about my upcoming presentation.",
        category: "anxious",
        subEmotion: "Worried",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        photoUrl: null,
        reflections: [],
      },
      {
        id: "dummy-3",
        userId: "user-1",
        text: "I'm feeling really calm after my meditation session this morning.",
        category: "calm",
        subEmotion: "Peaceful",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        photoUrl: null,
        reflections: [
          {
            prompt: "How can you bring more of this peaceful feeling into your daily life?",
            response: "I think I'll try to meditate for at least 10 minutes every morning.",
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
          },
        ],
      },
      {
        id: "dummy-4",
        userId: "user-1",
        text: "I'm feeling sad about missing my friend's wedding due to travel restrictions.",
        category: "sad",
        subEmotion: "Disappointed",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        photoUrl: null,
        reflections: [],
      },
      {
        id: "dummy-5",
        userId: "user-1",
        text: "I'm so frustrated with my internet connection today!",
        category: "angry",
        subEmotion: "Frustrated",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        photoUrl: null,
        reflections: [],
      },
    ]
  }
}

// Get a single journal entry by ID
export async function getJournalEntry(id: string): Promise<JournalEntry> {
  try {
    const data = await fetchAPI<{ entry: JournalEntry }>(`${API_CONFIG.ENDPOINTS.JOURNAL}${id}`)
    return data.entry
  } catch (error) {
    console.error(`Failed to get journal entry ${id}, using dummy data:`, error)
    // Return dummy data
    return {
      id,
      userId: "user-1",
      text: "This is a dummy journal entry for when the API fails.",
      category: "calm",
      subEmotion: "Peaceful",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      photoUrl: null,
      reflections: [],
    }
  }
}

// Get a reflection prompt based on emotion
export async function getReflectionPrompt(category: string): Promise<string> {
  try {
    // Get array of prompts for the category
    const prompts = await fetchAPI<Array<{
      text: string;
      is_active: boolean;
      id: number;
      category_id: number;
    }>>(`${API_CONFIG.ENDPOINTS.PROMPTS}?category=${category}`)

    // Filter active prompts
    const activePrompts = prompts.filter(p => p.is_active)

    if (activePrompts.length > 0) {
      // Randomly select one prompt
      const randomIndex = Math.floor(Math.random() * activePrompts.length)
      return activePrompts[randomIndex].text
    }

    // Fallback prompts if no active prompts found
    const fallbackPrompts: Record<string, string> = {
      happy: "What made this moment special for you?",
      sad: "What would help you feel better right now?",
      angry: "What's beneath this anger?",
      anxious: "What's one thing you can control in this situation?",
      calm: "How can you bring more of this peaceful feeling into your daily life?"
    }
    return fallbackPrompts[category] || "How does this emotion make you feel?"
  } catch (error) {
    console.error("Failed to get reflection prompt:", error)
    // Use fallback prompts on error
    const fallbackPrompts: Record<string, string> = {
      happy: "What made this moment special for you?",
      sad: "What would help you feel better right now?",
      angry: "What's beneath this anger?",
      anxious: "What's one thing you can control in this situation?",
      calm: "How can you bring more of this peaceful feeling into your daily life?"
    }
    return fallbackPrompts[category] || "How does this emotion make you feel?"
  }
}

// User profile and statistics types
export interface UserProfile {
  user: {
    id: string
    email: string
    name: string
    avatar: string
    createdAt: string
  }
  stats: {
    totalEntries: number
    totalReflections: number
    streakDays: number
    currentStreak: number
    longestStreak: number
    lastCheckInDate: string
  }
}

export interface UserStats {
  summary: {
    totalEntries: number
    totalReflections: number
    averageEntriesPerWeek: number
    completionRate: number
  }
  emotions: Record<string, number>
  subEmotions: Array<{ name: string; count: number }>
  streaks: {
    current: number
    longest: number
    thisMonth: number
    history: Array<{ date: string; hasEntry: boolean }>
  }
  timeline: Array<{
    date: string
    entries: number
    reflections: number
    primaryEmotion: string
  }>
}

export interface UserStreak {
  currentStreak: number
  longestStreak: number
  lastCheckInDate: string
  streakHistory: Array<{ date: string; hasEntry: boolean }>
}

export interface MoodSummary {
  moodDistribution: Record<string, { count: number; percentage: number }>
  mostFrequent: {
    emotion: string
    subEmotion: string
    count: number
  }
  timeline: Array<{
    date: string
    emotion: string
    subEmotion: string
  }>
}

// Get user profile and basic statistics
export async function getUserProfile(userId?: string): Promise<UserProfile> {
  try {
    const endpoint = userId ? `/user/profile?userId=${userId}` : "/user/profile"
    const data = await fetchAPI<{ user: UserProfile["user"]; stats: UserProfile["stats"] }>(endpoint)
    return data
  } catch (error) {
    console.error("Failed to get user profile, using dummy data:", error)
    // Return dummy data
    return {
      user: {
        id: "user-1",
        email: "demo@example.com",
        name: "Demo User",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      stats: {
        totalEntries: 12,
        totalReflections: 8,
        streakDays: 15,
        currentStreak: 3,
        longestStreak: 5,
        lastCheckInDate: new Date().toISOString(),
      },
    }
  }
}

// Get detailed user statistics
export async function getUserStats(
  period: "week" | "month" | "year" | "all" = "month",
  startDate?: string,
  endDate?: string,
  userId?: string,
): Promise<UserStats> {
  try {
    let endpoint = `${API_CONFIG.ENDPOINTS.USER_STATS}?period=${period}`

    if (startDate) endpoint += `&startDate=${startDate}`
    if (endDate) endpoint += `&endDate=${endDate}`
    if (userId) endpoint += `&userId=${userId}`

    const data = await fetchAPI<UserStats>(endpoint)
    return data
  } catch (error) {
    console.error(`Failed to get user stats for period ${period}, using dummy data:`, error)
    // Return dummy data
    return {
      summary: {
        totalEntries: 12,
        totalReflections: 8,
        averageEntriesPerWeek: 3,
        completionRate: 75,
      },
      emotions: {
        happy: 4,
        sad: 2,
        angry: 1,
        anxious: 3,
        calm: 2,
      },
      subEmotions: [
        { name: "Joyful", count: 2 },
        { name: "Grateful", count: 2 },
        { name: "Worried", count: 2 },
        { name: "Stressed", count: 1 },
      ],
      streaks: {
        current: 3,
        longest: 5,
        thisMonth: 15,
        history: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          hasEntry: Math.random() > 0.5,
        })),
      },
      timeline: Array.from({ length: 12 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        entries: Math.floor(Math.random() * 3),
        reflections: Math.floor(Math.random() * 2),
        primaryEmotion: ["happy", "sad", "anxious", "calm"][Math.floor(Math.random() * 4)],
      })),
    }
  }
}

// Get user streak information
export async function getUserStreak(userId?: string): Promise<UserStreak> {
  try {
    const endpoint = userId ? `/user/streak?userId=${userId}` : "/user/streak"
    const data = await fetchAPI<UserStreak>(endpoint)
    return data
  } catch (error) {
    console.error("Failed to get user streak, using dummy data:", error)
    // Return dummy data
    return {
      currentStreak: 3,
      longestStreak: 5,
      lastCheckInDate: new Date().toISOString(),
      streakHistory: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        hasEntry: Math.random() > 0.5,
      })),
    }
  }
}

// Get mood summary
export async function getMoodSummary(
  period: "week" | "month" | "year" | "all" = "month",
  userId?: string,
): Promise<MoodSummary> {
  try {
    let endpoint = `${API_CONFIG.ENDPOINTS.MOOD_SUMMARY}?period=${period}`
    if (userId) endpoint += `&userId=${userId}`

    const data = await fetchAPI<MoodSummary>(endpoint)
    return data
  } catch (error) {
    console.error(`Failed to get mood summary for period ${period}, using dummy data:`, error)
    // Return dummy data
    return {
      moodDistribution: {
        happy: { count: 4, percentage: 33 },
        sad: { count: 2, percentage: 17 },
        angry: { count: 1, percentage: 8 },
        anxious: { count: 3, percentage: 25 },
        calm: { count: 2, percentage: 17 },
      },
      mostFrequent: {
        emotion: "happy",
        subEmotion: "Joyful",
        count: 4,
      },
      timeline: Array.from({ length: 12 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        emotion: ["happy", "sad", "anxious", "calm"][Math.floor(Math.random() * 4)],
        subEmotion: ["Joyful", "Grateful", "Worried", "Stressed"][Math.floor(Math.random() * 4)],
      })),
    }
  }
}

/**
 * Upload a photo to the backend
 *
 * Expected backend endpoint: POST /api/images
 *
 * Request format:
 * - Method: POST
 * - Content-Type: multipart/form-data
 * - Body: FormData with 'file' field containing the image
 *
 * Expected response format:
 * {
 *   "url": string  // URL to access the uploaded image
 * }
 *
 * Example usage:
 * const imageUrl = await uploadPhoto(fileFromInput);
 * if (imageUrl) {
 *   // Use the image URL in your journal entry
 * }
 */
export async function uploadPhoto(file: File): Promise<string | null> {
  // For now, we'll just return a local URL until the backend is implemented
  return URL.createObjectURL(file)

  // When the backend is ready, uncomment this code:
  /*
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/images`, {
      method: 'POST',
      body: formData,
      // Note: Don't set Content-Type header for FormData
      // The browser will set it automatically with the boundary
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const data = await response.json();
    return data.url;  // The backend should return the URL to access the image
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
  */
}

/**
 * Load an image from the backend
 *
 * Expected backend endpoint: GET /api/images/{imageId}
 *
 * Request format:
 * - Method: GET
 * - Path parameter: imageId
 *
 * Expected response:
 * - Content-Type: image/* (appropriate image MIME type)
 * - Body: Binary image data
 *
 * Note: This function isn't typically needed since you can use the image URL
 * directly in <img> tags, but it's included for completeness.
 */
export async function loadImage(imageId: string): Promise<Blob | null> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/images/${imageId}`)

    if (!response.ok) {
      throw new Error(`Failed to load image: ${response.status}`)
    }

    return await response.blob()
  } catch (error) {
    console.error("Error loading image:", error)
    return null
  }
}

// Get total count of entries for a user
export async function getTotalEntriesCount(userId: string = "user-1"): Promise<number> {
  try {
    const data = await fetchAPI<JournalEntry[]>(`${API_CONFIG.ENDPOINTS.JOURNAL}?userId=${userId}`)
    return Array.isArray(data) ? data.length : 0
  } catch (error) {
    console.error("Failed to get total entries count:", error)
    return 0
  }
}

// Get user journal entries with page-based pagination
export async function getUserJournalEntries(
  userId: string = "user-1",
  page: number = 1,
  pageSize: number = 5
): Promise<{ entries: JournalEntry[]; totalPages: number }> {
  try {
    // Calculate skip based on page number and page size
    const skip = (page - 1) * pageSize;
    const data = await fetchAPI<JournalEntry[]>(`/api/journal/user/${userId}?skip=${skip}&limit=${pageSize}`)

    // Get total count for pagination
    const totalCount = await getTotalEntriesCount(userId)
    const totalPages = Math.ceil(totalCount / pageSize)

    return { entries: data, totalPages }
  } catch (error) {
    console.error("Failed to get user journal entries:", error)
    // Return empty array instead of throwing error
    return { entries: [], totalPages: 0 }
  }
}

// Helper function to get total pages
export async function getTotalPages(
  userId: string = "user-1",
  pageSize: number = 5
): Promise<number> {
  try {
    // Get total count of entries
    const { entries } = await getUserJournalEntries(userId, 1, 1000); // Get all entries
    return Math.ceil(entries.length / pageSize);
  } catch (error) {
    console.error("Failed to get total pages:", error)
    throw error
  }
}

export async function getAICompletion(messages: { role: string; content: string }[]): Promise<string> {
  try {
    const response = await fetch('https://feelwrite-622255484144.us-central1.run.app/api/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('Error getting AI completion:', error);
    return "How does this make you feel?";
  }
}

interface CreateUserResponse {
  email: string;
  username: string;
  id: string;
  created_at: string;
  updated_at: string;
}

export async function createUser(email: string, username: string, password: string): Promise<CreateUserResponse> {
  const response = await fetchAPI('/users/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      username,
      password,
    }),
  }) as Response;

  if (!response.ok) {
    const error = await response.json() as { message: string };
    throw new Error(error.message || 'Failed to create user');
  }

  return response.json() as Promise<CreateUserResponse>;
}
