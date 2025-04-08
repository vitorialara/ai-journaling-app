import { X, ChevronLeft, ChevronRight, CalendarIcon, Plus } from "lucide-react"
import { format } from "date-fns"
import { JournalEntry } from "../types/journal"
import { JournalImage } from "./journal-image"
import { getReflectionPrompt } from "../lib/api-client"
import { useState, useEffect } from "react"

interface EntryDetailModalProps {
  entry: JournalEntry | null
  onClose: () => void
  onNext?: () => void
  onPrev?: () => void
  currentIndex?: number
  totalEntries?: number
  showReflectionForm?: boolean
  onReflectionFormChange?: (show: boolean) => void
}

export default function EntryDetailModal({
  entry,
  onClose,
  onNext,
  onPrev,
  currentIndex = 0,
  totalEntries = 1,
  showReflectionForm = false,
  onReflectionFormChange
}: EntryDetailModalProps) {
  const [reflectionPrompt, setReflectionPrompt] = useState("")
  const [reflectionResponse, setReflectionResponse] = useState("")
  const [currentReflectionCount, setCurrentReflectionCount] = useState(0)

  useEffect(() => {
    if (showReflectionForm && entry) {
      handleAddReflection()
    }
  }, [showReflectionForm, entry])

  if (!entry) return null

  const entryDate = new Date(entry.createdAt)
  const formattedDate = format(entryDate, "MMMM d, yyyy")
  const formattedTime = format(entryDate, "h:mm a")

  // Get emotion color class
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

  const emotionColorClass = getEmotionColor(entry.category)

  const handleAddReflection = async () => {
    if (entry?.reflections.length === 0) {
      // If it's the first reflection, get a prompt based on emotion category
      const prompt = await getReflectionPrompt(entry.category)
      setReflectionPrompt(prompt)
      setCurrentReflectionCount(1)
    } else {
      // For subsequent reflections, we'll use getCompletion later
      // For now, use a default prompt
      setReflectionPrompt("How does this emotion make you feel?")
      setCurrentReflectionCount(currentReflectionCount + 1)
    }
    onReflectionFormChange?.(true)
  }

  const handleSubmitReflection = async () => {
    // Store the current reflection (will be implemented later)
    const currentResponse = reflectionResponse

    // Clear the form
    setReflectionResponse("")

    // If this was the first reflection, automatically show the next reflection form
    if (currentReflectionCount === 1) {
      // For now use a default prompt, later we'll use getCompletion
      setReflectionPrompt("How does this emotion make you feel?")
      setCurrentReflectionCount(2)
    } else {
      // For now, just close the form
      onReflectionFormChange?.(false)
      setCurrentReflectionCount(0)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 text-purple-500 mr-2" />
            <div>
              <h3 className="font-medium">{formattedDate}</h3>
              <p className="text-xs text-gray-500">{formattedTime}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Navigation for multiple entries */}
          {totalEntries > 1 && onNext && onPrev && (
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onPrev}
                className="p-1 rounded-full hover:bg-gray-100"
                aria-label="Previous entry"
              >
                <ChevronLeft className="h-5 w-5 text-gray-500" />
              </button>
              <span className="text-sm text-gray-500">
                Entry {currentIndex + 1} of {totalEntries}
              </span>
              <button
                onClick={onNext}
                className="p-1 rounded-full hover:bg-gray-100"
                aria-label="Next entry"
              >
                <ChevronRight className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          )}

          {/* Emotion tag */}
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${emotionColorClass}`}>
              {entry.subEmotion}
            </span>
          </div>

          {/* Journal text */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Journal Entry</h4>
            <p className="text-gray-800 whitespace-pre-wrap">{entry.text}</p>
          </div>

          {/* Photo if available */}
          {entry.photoUrl && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Photo</h4>
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <JournalImage
                  imageUrl={entry.photoUrl}
                  alt="Journal entry"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          )}

          {/* Reflection form */}
          {showReflectionForm && (
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-2">{reflectionPrompt}</p>
              <textarea
                value={reflectionResponse}
                onChange={(e) => setReflectionResponse(e.target.value)}
                placeholder="Write your reflection..."
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleSubmitReflection}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Save Reflection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
