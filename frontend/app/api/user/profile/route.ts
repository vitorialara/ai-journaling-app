import { NextResponse } from "next/server"

/**
 * USER PROFILE ENDPOINT
 *
 * GET /api/user/profile
 * - Returns user profile and basic statistics
 * - Example: fetch('/api/user/profile')
 * - Response: { user: {...}, stats: {...} }
 */

export async function GET(request: Request) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return mock data
  return NextResponse.json({
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
  })
}

