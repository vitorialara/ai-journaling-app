import { NextResponse } from "next/server"

/**
 * USER STREAK ENDPOINT
 *
 * GET /api/user/streak
 * - Returns user streak information
 * - Example: fetch('/api/user/streak')
 * - Response: { currentStreak: number, longestStreak: number, ... }
 */

export async function GET(request: Request) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return mock data
  return NextResponse.json({
    currentStreak: 3,
    longestStreak: 5,
    lastCheckInDate: new Date().toISOString(),
    streakHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      hasEntry: Math.random() > 0.5,
    })),
  })
}

