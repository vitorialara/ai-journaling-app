"use client"

import { useEffect, useState, useRef } from "react"
import { getJournalEntries } from "../lib/api"
import type { JournalEntry } from "../types/journal"

interface LogoProps {
  className?: string
  showEmotionData?: boolean
  animated?: boolean
  variant?: "standard" | "minimal" | "detailed"
}

export function Logo({ className = "", showEmotionData = false, animated = false, variant = "standard" }: LogoProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [animationProgress, setAnimationProgress] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    if (showEmotionData) {
      const loadEntries = async () => {
        try {
          const journalEntries = await getJournalEntries()
          setEntries(journalEntries)
        } catch (error) {
          console.error("Error loading entries:", error)
        } finally {
          setIsLoading(false)
        }
      }
      loadEntries()
    } else {
      setIsLoading(false)
    }
  }, [showEmotionData])

  // Calculate emotion counts
  const emotionCounts = entries.reduce(
    (acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Default petal counts if no data or not showing emotion data
  const defaultPetalCounts = {
    happy: 1,
    sad: 1,
    angry: 1,
    anxious: 1,
    calm: 1,
  }

  // Determine petal counts based on data or defaults
  const petalCounts =
    showEmotionData && !isLoading && Object.keys(emotionCounts).length > 0 ? emotionCounts : defaultPetalCounts

  // Calculate total for percentage
  const total = Object.values(petalCounts).reduce((sum, count) => sum + count, 0)

  // Colors for each emotion
  const colors = {
    happy: "#FCD34D", // yellow
    sad: "#93C5FD", // blue
    angry: "#FCA5A5", // red
    anxious: "#C4B5FD", // purple
    calm: "#86EFAC", // green
  }

  // Animation effect
  useEffect(() => {
    if (!animated) return

    let startTime: number
    const duration = 2000 // 2 seconds for the animation

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)

      setAnimationProgress(progress)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [animated])

  // Canvas-based detailed logo
  useEffect(() => {
    if (variant !== "detailed" || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const size = Math.min(canvas.width, canvas.height)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background circle
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.fill()

    // Draw petals
    const emotions = ["happy", "sad", "angry", "anxious", "calm"]
    const centerX = size / 2
    const centerY = size / 2

    emotions.forEach((emotion, index) => {
      const count = petalCounts[emotion as keyof typeof petalCounts] || 1
      const percentage = total > 0 ? count / total : 0.2

      // Calculate angle for this emotion (72 degrees apart)
      const angle = index * 72 * (Math.PI / 180)

      // Draw main petal
      const petalLength = (size / 2) * 0.7 * (0.5 + percentage * 0.5)
      const petalWidth = (size / 5) * (0.5 + percentage * 0.5)

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(angle)

      // Create gradient for petal
      const gradient = ctx.createLinearGradient(0, 0, petalLength, 0)
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.9)")
      gradient.addColorStop(1, colors[emotion as keyof typeof colors])

      // Draw petal shape
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.quadraticCurveTo(petalLength * 0.5, petalWidth * 0.5, petalLength, 0)
      ctx.quadraticCurveTo(petalLength * 0.5, -petalWidth * 0.5, 0, 0)

      ctx.fillStyle = gradient
      ctx.fill()

      // Add texture/detail to petal
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(petalLength, 0)
      ctx.stroke()

      ctx.restore()
    })

    // Draw center circle
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size / 8)
    centerGradient.addColorStop(0, "#f3e8ff")
    centerGradient.addColorStop(1, "#c084fc")

    ctx.fillStyle = centerGradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, size / 8, 0, Math.PI * 2)
    ctx.fill()

    // Add "F" letter
    ctx.fillStyle = "#7e22ce"
    ctx.font = `bold ${size / 6}px sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("F", centerX, centerY)

    // Add subtle shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
  }, [variant, petalCounts, total, isLoading, entries])

  // Minimal variant (simple icon)
  if (variant === "minimal") {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 bg-white rounded-full opacity-50"></div>
        <div className="relative w-full h-full bg-white bg-opacity-80 rounded-full shadow-md overflow-hidden flex items-center justify-center">
          <span className="text-2xl font-bold text-purple-600">F</span>

          {/* Simple petals */}
          <div className="absolute w-full h-full">
            {["happy", "sad", "angry", "anxious", "calm"].map((emotion, index) => {
              const angle = index * 72 * (Math.PI / 180)
              const x = 50 + Math.cos(angle) * 35
              const y = 50 + Math.sin(angle) * 35

              return (
                <div
                  key={emotion}
                  className="absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    backgroundColor: colors[emotion as keyof typeof colors],
                    left: `${x.toFixed(2)}%`,
                    top: `${y.toFixed(2)}%`,
                    opacity: 0.7,
                  }}
                />
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Detailed variant (canvas-based)
  if (variant === "detailed") {
    return (
      <div className={`relative ${className}`}>
        <canvas ref={canvasRef} width="200" height="200" className="w-full h-full" />
      </div>
    )
  }

  // Standard variant (default)
  // Generate petals
  const generatePetals = () => {
    const petals = []
    const emotions = ["happy", "sad", "angry", "anxious", "calm"]

    // Create petals for each emotion
    emotions.forEach((emotion, index) => {
      const count = petalCounts[emotion as keyof typeof petalCounts] || 0
      const percentage = total > 0 ? count / total : 0.2 // 1/5 = 0.2 for equal distribution

      // Base size varies between 20-50px based on percentage
      const baseSize = 20 + percentage * 30

      // If animated, scale the size based on animation progress
      const size = animated ? baseSize * Math.min(animationProgress * 1.5, 1) : baseSize

      // Calculate position for each petal (evenly distributed around the circle)
      // For 5 petals, we need to distribute them 72 degrees apart (360/5 = 72)
      const angle = index * 72 * (Math.PI / 180)
      const x = 50 + Math.cos(angle) * 30
      const y = 50 + Math.sin(angle) * 30

      // Add a slight delay to each petal's appearance if animated
      const delay = animated ? index * 0.15 : 0
      const opacity = animated ? (animationProgress > delay ? (animationProgress - delay) / 0.3 : 0) : 0.8

      petals.push(
        <div
          key={emotion}
          className="absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
          style={{
            backgroundColor: colors[emotion as keyof typeof colors],
            width: `${size}px`,
            height: `${size}px`,
            left: `${x.toFixed(2)}%`,
            top: `${y.toFixed(2)}%`,
            opacity: Math.min(opacity, 0.8),
            boxShadow: `0 0 10px ${colors[emotion as keyof typeof colors]}`,
            filter: `blur(${animated ? Math.max(0, 5 - animationProgress * 5) : 0}px)`,
          }}
        />,
      )

      // Add inner petal for more depth
      petals.push(
        <div
          key={`inner-${emotion}`}
          className="absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
          style={{
            backgroundColor: "white",
            width: `${size * 0.5}px`,
            height: `${size * 0.5}px`,
            left: `${x.toFixed(2)}%`,
            top: `${y.toFixed(2)}%`,
            opacity: Math.min(opacity * 0.7, 0.6),
            mixBlendMode: "overlay",
          }}
        />,
      )

      // Add connecting line to center
      petals.push(
        <div
          key={`line-${emotion}`}
          className="absolute transform origin-left transition-all duration-500"
          style={{
            backgroundColor: colors[emotion as keyof typeof colors],
            height: "2px",
            width: animated ? `${30 * animationProgress}px` : "30px",
            left: "50%",
            top: "50%",
            opacity: 0.4,
            transform: `rotate(${angle * (180 / Math.PI)}deg)`,
            transformOrigin: "left center",
          }}
        />,
      )
    })

    return petals
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-white rounded-full opacity-50"></div>
      <div className="relative w-full h-full bg-white bg-opacity-80 rounded-full shadow-md overflow-hidden">
        {/* Flower petals */}
        {generatePetals()}

        {/* Center of flower */}
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-100 rounded-full flex items-center justify-center shadow-inner transition-all duration-500"
          style={{
            width: animated ? `${12 * Math.min(animationProgress * 2, 1)}px` : "12px",
            height: animated ? `${12 * Math.min(animationProgress * 2, 1)}px` : "12px",
            opacity: animated ? Math.min(animationProgress * 2, 1) : 1,
          }}
        >
          <span
            className="text-2xl font-bold text-purple-600 transition-all duration-500"
            style={{
              opacity: animated ? Math.min((animationProgress - 0.5) * 2, 1) : 1,
              transform: `scale(${animated ? Math.min((animationProgress - 0.5) * 2, 1) : 1})`,
              display: animated && animationProgress < 0.5 ? "none" : "block",
            }}
          >
            F
          </span>
        </div>
      </div>
    </div>
  )
}
