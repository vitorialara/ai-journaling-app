"use client"

import React from "react"

import { useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "../components/page-header"
import { Camera, X, Loader2, Info } from "lucide-react"
import { createJournalEntry, uploadPhoto, getReflectionPrompt, getAICompletion } from "../lib/api-client"
import type { EmotionCategory, SubEmotion } from "../types/emotions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { API_CONFIG, DEFAULT_VALUES, EMOTION_CONFIG } from '../config'
import { useAuth } from "@/contexts/auth-context"

import { GrowingChooser } from "../components/VisualGrowthElements/GrowingChooser"

// Debug flag
const DEBUG = true

export default function JournalEntryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const category = (searchParams.get("category") as EmotionCategory) || EMOTION_CONFIG.DEFAULT_CATEGORY
  const subEmotion = (searchParams.get("subEmotion") as SubEmotion) || EMOTION_CONFIG.DEFAULT_SUB_EMOTION
  const fileInputRef = useRef<HTMLInputElement>(null)
  const charsBeforeNextStep = 4;

  const [journalText, setJournalText] = useState("")
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isLocalImage, setIsLocalImage] = useState(false)
  const [journalPrompt, setJournalPrompt] = useState("Write about this moment...")
  const [growthStage, setGrowthStage] = useState(0)
  const [textLength, setTextLength] = useState(0)
  const [showReflectionForm, setShowReflectionForm] = useState(false)
  const [reflectionPrompt, setReflectionPrompt] = useState("")
  const [reflectionResponse, setReflectionResponse] = useState("")
  const [currentReflectionCount, setCurrentReflectionCount] = useState(0)
  const [reflections, setReflections] = useState<{ prompt: string; response: string }[]>([])

  React.useEffect(() => {
    // Update growth stage based on text length
    const textLength = journalText.length;
    if (textLength > charsBeforeNextStep * 4) setGrowthStage(4);
    else if (textLength > charsBeforeNextStep * 3) setGrowthStage(3);
    else if (textLength > charsBeforeNextStep * 2) setGrowthStage(2);
    else if (textLength > charsBeforeNextStep * 1) setGrowthStage(1);
    else setGrowthStage(0);
  }, [journalText]);

  React.useEffect(() => {
    // Update text length
    setTextLength(journalText.length);
  }, [journalText]);
  // Get color scheme based on emotion category
  const getColorScheme = () => {
    switch (category) {
      case "happy":
        return { bg: "from-yellow-50", text: "text-yellow-700", button: "bg-yellow-500 hover:bg-yellow-600" }
      case "sad":
        return { bg: "from-blue-50", text: "text-blue-700", button: "bg-blue-500 hover:bg-blue-600" }
      case "angry":
        return { bg: "from-red-50", text: "text-red-700", button: "bg-red-500 hover:bg-red-600" }
      case "anxious":
        return { bg: "from-purple-50", text: "text-purple-700", button: "bg-purple-500 hover:bg-purple-600" }
      case "calm":
        return { bg: "from-green-50", text: "text-green-700", button: "bg-green-500 hover:bg-green-600" }
      default:
        return { bg: "from-purple-50", text: "text-purple-700", button: "bg-purple-500 hover:bg-purple-600" }
    }
  }

  const colorScheme = getColorScheme()

  const handlePhotoUploadClick = () => {
    // Trigger the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // Check if the file is an image
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file (JPEG, PNG, etc.)")
      return
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size should be less than 5MB")
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      // Upload the photo using our API client
      // This will call the backend endpoint when it's implemented
      const url = await uploadPhoto(file)

      if (!url) {
        throw new Error("Failed to upload image")
      }

      setPhotoUrl(url)
      setPhotoFile(file)
      setIsLocalImage(true)

      // In a real implementation with a backend, you would set:
      // setIsLocalImage(false)
      // since the image would be stored on the server
    } catch (error) {
      console.error("Error uploading photo:", error)
      setUploadError("Failed to upload photo. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const removePhoto = () => {
    setPhotoUrl(null)
    setPhotoFile(null)
    setUploadError(null)
    setIsLocalImage(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (shouldReflect: boolean) => {
    // If no text and clicking Done, go to dashboard
    if (!journalText.trim() && !shouldReflect) {
      router.push("/dashboard")
      return
    }

    if (!user) {
      alert("Please sign in to save your journal entry.")
      router.push("/auth/signin")
      return
    }

    if (shouldReflect) {
      // Get the first reflection prompt without saving
      const prompt = await getReflectionPrompt(category)
      setReflectionPrompt(prompt)
      setShowReflectionForm(true)
      setCurrentReflectionCount(1)
      return
    }

    // Only save when clicking Done and there is text
    setIsSubmitting(true)
    try {
      // Create a formatted string of all reflections
      const formattedReflections = reflections.map((r, index) => {
        if (index === 0) {
          return `\n\nReflection:\n${r.response}`
        } else {
          return `\n\nReflection: ${r.prompt}\n${r.response}`
        }
      }).join('')

      // Combine journal text with formatted reflections
      const aggregatedText = journalText + formattedReflections

      // Create journal entry using the API client with the authenticated user's ID
      const entry = await createJournalEntry({
        text: aggregatedText,
        category: category,
        subEmotion: subEmotion,
        photoUrl: photoUrl,
        createdAt: new Date().toISOString(),
        userId: user.id
      });

      console.log("Journal entry created successfully:", entry);
      // Redirect to dashboard with entry data
      router.push(`/dashboard?showEntry=true&entryId=${entry.id}`);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack
        });
        alert(`Error saving your journal entry: ${error.message}`);
      } else {
        console.error("Unknown error type:", error);
        alert("There was an error saving your journal entry. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleSubmitReflection = async () => {
    // Add current reflection to the list
    const newReflection = {
      prompt: reflectionPrompt,
      response: reflectionResponse
    }
    setReflections([...reflections, newReflection])

    // Clear the form
    setReflectionResponse("")

    // Get a new AI-generated prompt
    try {
      const messages = [
        { role: "user", content: journalText },
        ...reflections.flatMap(r => [
          { role: "assistant", content: r.prompt },
          { role: "user", content: r.response }
        ]),
        { role: "assistant", content: reflectionPrompt },
        { role: "user", content: reflectionResponse }
      ]

      const prompt = await getAICompletion(messages)
      setReflectionPrompt(prompt)
      setCurrentReflectionCount(currentReflectionCount + 1)
    } catch (error) {
      console.error("Error getting AI completion:", error)
      // Fallback to a default prompt if AI fails
      setReflectionPrompt("How does this emotion make you feel?")
      setCurrentReflectionCount(currentReflectionCount + 1)
    }
  }

  const handleDone = () => {
    // If no reflection text, just go to dashboard
    if (!reflectionResponse.trim()) {
      router.push("/dashboard")
      return
    }

    setShowReflectionForm(false)
    setCurrentReflectionCount(0)
    handleSubmit(false) // Save the journal entry with all reflections
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${colorScheme.bg} to-white p-4`}>
      <div className="max-w-md mx-auto pt-12">
        {!isLocalImage && photoUrl && (
          <Alert variant="warning" className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>Image Storage Limited</AlertTitle>
            <AlertDescription>
              Image storage is not fully configured. Your journal entry will be saved, but the image may not persist
              after you close the app.
            </AlertDescription>
          </Alert>
        )}

        {!showReflectionForm ? (
          <>
            <PageHeader title={subEmotion} subtitle={journalPrompt} className={colorScheme.text} />

            <div className="mt-6">
              <Textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="What's making you feel this way? Take your time..."
                className="min-h-[200px] bg-white bg-opacity-70 border-0 rounded-xl shadow-inner focus:ring-2 focus:ring-purple-300"
              />
              <div>
                <GrowingChooser emotion={category} growthStage={growthStage} textLength={textLength} charsBeforeNextStep={charsBeforeNextStep}/>
              </div>
            </div>

            {photoUrl && (
              <div className="mt-4 rounded-xl overflow-hidden relative">
                <img src={photoUrl || "/placeholder.svg"} alt="Your upload" className="w-full h-auto" />
                {isLocalImage && (
                  <div className="absolute top-0 left-0 bg-yellow-500 text-white text-xs px-2 py-1">Local Preview</div>
                )}
                <button
                  onClick={removePhoto}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-all"
                  aria-label="Remove photo"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            {uploadError && <div className="mt-2 text-sm text-red-600">{uploadError}</div>}

            <div className="mt-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
                aria-label="Upload photo"
              />
              <Button
                onClick={handlePhotoUploadClick}
                variant="outline"
                className="w-full py-6 rounded-xl border border-gray-200 text-gray-600 hover:bg-white hover:text-purple-600 transition-all duration-300"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-5 w-5" />
                    {photoUrl ? "Change Photo" : "Add Photo"}
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <Button
                onClick={() => handleSubmit(true)}
                className={`py-6 rounded-xl ${colorScheme.button} text-white transition-all duration-300 shadow-md hover:shadow-lg`}
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting ? "Saving..." : "Reflect More"}
              </Button>

              <Button
                onClick={() => handleSubmit(false)}
                variant="outline"
                className={`py-6 rounded-xl border-2 border-${category === "happy" ? "yellow" : category === "sad" ? "blue" : category === "angry" ? "red" : category === "anxious" ? "purple" : "green"}-400 ${colorScheme.text} hover:bg-white transition-all duration-300`}
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting ? "Saving..." : "Done"}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <PageHeader
              title="Reflection"
              subtitle={reflectionPrompt}
              className={colorScheme.text}
            />

            <div className="mt-6">
              <Textarea
                value={reflectionResponse}
                onChange={(e) => setReflectionResponse(e.target.value)}
                placeholder="Write your reflection..."
                className="min-h-[200px] bg-white bg-opacity-70 border-0 rounded-xl shadow-inner focus:ring-2 focus:ring-purple-300"
              />
              <div className="mt-4">
                <GrowingChooser
                  emotion={category}
                  growthStage={Math.min(Math.floor(reflectionResponse.length / 20), 4)}
                  textLength={reflectionResponse.length}
                  charsBeforeNextStep={20}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <Button
                onClick={handleSubmitReflection}
                className={`py-6 rounded-xl ${colorScheme.button} text-white transition-all duration-300 shadow-md hover:shadow-lg`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Reflect More"}
              </Button>

              <Button
                onClick={handleDone}
                variant="outline"
                className={`py-6 rounded-xl border-2 border-${category === "happy" ? "yellow" : category === "sad" ? "blue" : category === "angry" ? "red" : category === "anxious" ? "purple" : "green"}-400 ${colorScheme.text} hover:bg-white transition-all duration-300`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Done"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
