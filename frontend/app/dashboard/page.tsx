"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "../components/page-header"
import { getUserJournalEntries, getUserStats, getMoodSummary } from "../lib/api-client"
import type { JournalEntry } from "../types/journal"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import { JournalImage } from "../components/journal-image"
import { DEFAULT_VALUES } from "../config"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import EmotionRadarChart from "@/components/emotion-radar-chart"
import { WeeklySummaryCard } from "@/components/weekly-summary-card"
import { StatsCard } from "@/components/stats-card"
import { useAuth } from "@/contexts/auth-context"
import { fetchAPI } from "@/app/lib/api-client"
import { API_CONFIG } from "@/app/config"

// Lazy load the entry detail modal
const EntryDetailModal = dynamic(() => import('../components/entry-detail-modal'), {
  loading: () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-4">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    </div>
  ),
  ssr: false
})

interface WeeklySummaryData {
  emotionalPatterns: Array<{
    emotion: string
    count: number
    percentage: number
  }>
  keyThemes: string[]
  moodChanges: Array<{
    date: string
    emotion: string
    intensity: number
  }>
  personalizedInsights: string
  period: string
  startDate: string
  endDate: string
  isAI: boolean
}

function DashboardContent() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [showEntryDetail, setShowEntryDetail] = useState(false)
  const [userStats, setUserStats] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 5
  const [radarData, setRadarData] = useState<any[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummaryData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)

      // Fetch paginated entries for the list view
      const { entries: paginatedEntries, totalPages: newTotalPages } = await getUserJournalEntries(DEFAULT_VALUES.USER_ID, currentPage, pageSize)
      setEntries(paginatedEntries)
      setTotalPages(newTotalPages)

      // Use dummy data for user stats
      setUserStats({
        summary: {
          totalEntries: 12,
          totalReflections: 8,
          averageEntriesPerWeek: 3,
          completionRate: 75,
        },
        streaks: {
          current: 3,
          longest: 5,
          thisMonth: 15,
        }
      })

      // Set radar chart data
      setRadarData([
        { emotion: "Happy", value: 4 },
        { emotion: "Sad", value: 2 },
        { emotion: "Angry", value: 1 },
        { emotion: "Anxious", value: 3 },
        { emotion: "Calm", value: 2 },
      ])
    } catch (error) {
      console.error("Failed to load data:", error)
      setUserStats(null)
      setRadarData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentPage, user?.id])

  useEffect(() => {
    const entryId = searchParams.get("entryId")
    const showEntry = searchParams.get("showEntry")

    if (entryId && showEntry === "true") {
      // Try to find in current entries first
      let entry = entries.find(e => e.id === entryId)

      if (entry) {
        setSelectedEntry(entry)
        setShowEntryDetail(true)
        // Clear the URL parameters after showing the entry
        router.replace('/dashboard')
      }
    }
  }, [entries, searchParams, router])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  // Get emotion color for calendar highlight
  const getEmotionColor = (category: string): string => {
    switch (category) {
      case "happy":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200"
      case "sad":
        return "bg-blue-100 text-blue-800 border border-blue-200"
      case "angry":
        return "bg-red-100 text-red-800 border border-red-200"
      case "anxious":
        return "bg-purple-100 text-purple-800 border border-purple-200"
      case "calm":
        return "bg-green-100 text-green-800 border border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  useEffect(() => {
    const fetchWeeklySummary = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/weekly-summary?user_id=${DEFAULT_VALUES.USER_ID}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          throw new Error(errorData?.detail || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setWeeklySummary(data)
      } catch (err) {
        console.error("Error fetching weekly summary:", err)
        setError(err instanceof Error ? err.message : "An error occurred while fetching the weekly summary")
      } finally {
        setLoading(false)
      }
    }

    fetchWeeklySummary()
  }, [])

  // Show loading state while loading data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-purple-500 animate-spin mb-4" />
          <p className="text-purple-700">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-4">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

      <div className="max-w-4xl mx-auto relative">
        <PageHeader title="Dashboard" subtitle="Your emotional journey" />

        {/* Stats and Emotion Profile Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <StatsCard
            title="Weekly Progress"
            value={userStats?.summary?.totalEntries || 0}
            description={`${userStats?.summary?.completionRate || 0}% of weekly goal`}
            progress={userStats?.summary?.completionRate || 0}
            streak={userStats?.streaks?.current || 0}
            bestStreak={userStats?.streaks?.longest || 0}
            target={7}
            icon={<Loader2 className="h-4 w-4 text-purple-500 animate-spin" />}
            titleSize="text-lg"
          />

          {/* Emotion Radar Chart Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-purple-800">Emotional Patterns</h3>
                <span className="text-sm text-purple-600 animate-pulse">Last 7 days</span>
              </div>
              {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : radarData && radarData.length > 0 ? (
                <div className="transform hover:scale-105 transition-transform duration-300">
                  <EmotionRadarChart data={radarData} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-gray-500">No emotion data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weekly Summary Section */}
        <div className="mt-6">
          {loading ? (
            <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              </CardContent>
            </Card>
          ) : weeklySummary ? (
            <WeeklySummaryCard data={weeklySummary} />
          ) : (
            <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-gray-500">No weekly summary available</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Entries Section */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4 text-purple-800">Recent Entries</h3>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : entries.length === 0 ? (
            <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4 text-center">
                <p className="text-gray-500">No entries yet. Start your journaling journey!</p>
                <Link href="/journal">
                  <Button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-300">
                    Write Your First Entry
            </Button>
          </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                {entries.map((entry) => (
                  <Card
                    key={entry.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] bg-gradient-to-br from-purple-50 to-white border-purple-100"
                  >
                    <CardContent className="p-4" onClick={() => {
                      setSelectedEntry(entry)
                      setShowEntryDetail(true)
                    }}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-purple-900">{format(new Date(entry.createdAt), "MMMM d, yyyy")}</h4>
                          <p className="text-sm text-purple-600">{format(new Date(entry.createdAt), "h:mm a")}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEmotionColor(entry.category)} animate-pulse`}>
                          {entry.subEmotion}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-700 line-clamp-2">{entry.text}</p>
                      {entry.photoUrl && (
                        <div className="mt-2 transform hover:scale-105 transition-transform duration-300">
                          <JournalImage imageUrl={entry.photoUrl} alt="Journal entry photo" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="hover:bg-purple-100 transition-colors duration-300"
                >
                  Previous
                </Button>
                <span className="text-sm text-purple-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="hover:bg-purple-100 transition-colors duration-300"
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Entry Detail Modal */}
        {showEntryDetail && selectedEntry && (
          <EntryDetailModal
            entry={selectedEntry}
            onClose={() => {
              setShowEntryDetail(false)
              setSelectedEntry(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-purple-500 animate-spin mb-4" />
          <p className="text-purple-700">Loading your dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
