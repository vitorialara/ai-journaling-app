"use client"

import { useAuth } from "@/contexts/auth-context"
import { PageHeader } from "../components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getUserProfile, getUserStreak, getMoodSummary } from "../lib/api-client"
import { useState, useEffect } from "react"
import { Loader2, Calendar, Sparkles } from "lucide-react"
import type { UserProfile, UserStreak, MoodSummary } from "../lib/api-client"

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [streak, setStreak] = useState<UserStreak | null>(null)
  const [moodSummary, setMoodSummary] = useState<MoodSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true)

        // Fetch profile data, streak info, and mood summary in parallel
        const [profileData, streakData, moodData] = await Promise.all([
          getUserProfile(),
          getUserStreak(),
          getMoodSummary("month"),
        ])

        setProfile(profileData)
        setStreak(streakData)
        setMoodSummary(moodData)
      } catch (error) {
        console.error("Error loading profile data:", error)
        setError("Failed to load profile data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadProfileData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-purple-500 animate-spin mb-4" />
          <p className="text-purple-700">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
        <div className="max-w-md mx-auto pt-12">
          <PageHeader title="Your Profile" subtitle="View your account and progress" />
          <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>
          <Button onClick={() => window.location.reload()} className="mt-4 w-full">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="max-w-md mx-auto pt-12">
        <PageHeader title="Your Profile" subtitle="View your account and progress" />

        <Card className="mt-8 bg-white bg-opacity-80 shadow-sm border-0">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={profile?.user.avatar || user?.user_metadata?.avatar_url || ""}
                alt={profile?.user.name || user?.user_metadata?.full_name || "User"}
              />
              <AvatarFallback className="text-lg">
                {profile?.user.name?.[0] || user?.user_metadata?.full_name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">
                {profile?.user.name || user?.user_metadata?.full_name || "User"}
              </CardTitle>
              <p className="text-sm text-gray-500">{profile?.user.email || user?.email || ""}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-2xl font-bold text-purple-700">{profile?.stats.totalEntries || 0}</span>
                <span className="text-xs text-purple-600">Entries</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-2xl font-bold text-purple-700">{profile?.stats.totalReflections || 0}</span>
                <span className="text-xs text-purple-600">Reflections</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-2xl font-bold text-purple-700">{streak?.currentStreak || 0}</span>
                <span className="text-xs text-purple-600">Day Streak</span>
              </div>
            </div>

            {/* Streak Details */}
            {streak && (
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <h3 className="text-sm font-medium text-purple-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Streak Details
                </h3>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-purple-600">Current Streak</p>
                    <p className="text-lg font-semibold text-purple-800">{streak.currentStreak} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600">Longest Streak</p>
                    <p className="text-lg font-semibold text-purple-800">{streak.longestStreak} days</p>
                  </div>
                </div>
                <p className="text-xs text-purple-600 mt-2">
                  Last check-in: {new Date(streak.lastCheckInDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Mood Summary */}
            {moodSummary && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                <h3 className="text-sm font-medium text-purple-700 flex items-center">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Mood Insights
                </h3>
                <div className="mt-2">
                  <p className="text-xs text-purple-600">Most Frequent Emotion</p>
                  <p className="text-lg font-semibold text-purple-800 capitalize">
                    {moodSummary.mostFrequent.subEmotion}
                    <span className="text-sm font-normal ml-1">({moodSummary.mostFrequent.count} times)</span>
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 space-y-4">
              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
              <Button variant="outline" className="w-full">
                Account Settings
              </Button>
              <Button variant="outline" className="w-full">
                Privacy Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

