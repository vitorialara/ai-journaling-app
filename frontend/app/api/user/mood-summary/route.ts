import { NextResponse } from "next/server"

/**
 * MOOD SUMMARY ENDPOINT
 *
 * GET /api/user/mood-summary
 * - Returns mood summary data
 * - Query params: period (optional, defaults to "month")
 * - Example: fetch('/api/user/mood-summary?period=month')
 * - Response: { moodDistribution: {...}, mostFrequent: {...}, ... }
 */

export async function GET(request: Request) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Get query parameters
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "month"

  // Return mock data
  return NextResponse.json({
    moodDistribution: {
      happy: { count: 4, percentage: 33 },
      sad: { count: 2, percentage: 17 },
      angry: { count: 1, percentage: 8 },
      anxious: { count: 3, percentage: 25 },
      calm: { count: 2, percentage: 17 },
    },
    mostFrequent: {
      category: "happy",
      subEmotion: "Joyful",
      count: 3,
    },
    trends: {
      improving: ["anxious"],
      worsening: [],
      stable: ["happy", "calm"],
    },
    weekdayPatterns: [
      { day: "Monday", primaryEmotion: "anxious" },
      { day: "Tuesday", primaryEmotion: "anxious" },
      { day: "Wednesday", primaryEmotion: "calm" },
      { day: "Thursday", primaryEmotion: "happy" },
      { day: "Friday", primaryEmotion: "happy" },
      { day: "Saturday", primaryEmotion: "happy" },
      { day: "Sunday", primaryEmotion: "calm" },
    ],
  })
}

