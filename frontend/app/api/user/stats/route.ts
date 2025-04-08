import { NextResponse } from "next/server"

/**
 * USER STATS ENDPOINT
 *
 * GET /api/user/stats
 * - Returns user statistics
 * - Query params: period (optional, defaults to "month")
 * - Example: fetch('/api/user/stats?period=month')
 * - Response: { summary: {...}, emotions: {...}, ... }
 */

export async function GET(request: Request) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Get query parameters
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "month"

  // Return mock data
  return NextResponse.json({
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
  })
}

