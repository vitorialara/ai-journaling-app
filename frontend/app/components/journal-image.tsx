"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface JournalImageProps {
  imageUrl: string | null
  alt?: string
  className?: string
}

/**
 * Component to display journal images
 *
 * This component handles both local blob URLs and backend image URLs.
 *
 * Expected backend image URL format: /api/images/{imageId}
 *
 * Example usage:
 * <JournalImage imageUrl={entry.photoUrl} alt="Journal photo" className="w-full rounded-lg" />
 */
export function JournalImage({ imageUrl, alt = "Journal image", className = "" }: JournalImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Reset loading state when image URL changes
  useEffect(() => {
    setIsLoading(true)
    setError(null)
  }, [imageUrl])

  if (!imageUrl) {
    return null
  }

  // Handle image load events
  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setError("Failed to load image")
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <img
        src={imageUrl || "/placeholder.svg"}
        alt={alt}
        className={`w-full h-auto ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}

