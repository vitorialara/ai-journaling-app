"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "../components/page-header"
import type { EmotionCategory } from "../types/emotions"

export default function EmotionCategoryPage() {
  const router = useRouter()
  const [hoveredEmotion, setHoveredEmotion] = useState<EmotionCategory | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [visiblePetals, setVisiblePetals] = useState<number[]>([])

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Add animation for petals appearing one by one
  useEffect(() => {
    const animatePetals = () => {
      // Add petals one by one with a delay
      const addPetal = (index: number) => {
        setTimeout(() => {
          setVisiblePetals((prev) => [...prev, index])
        }, index * 270) // 270ms delay between each petal
      }

      // Start the animation after a short delay
      setTimeout(() => {
        for (let i = 0; i < emotions.length; i++) {
          addPetal(i)
        }
      }, 300)
    }

    animatePetals()
  }, [])

  const emotions: {
    category: EmotionCategory
    color: string
    hoverColor: string
    textColor: string
    shadowColor: string
    angle: number
  }[] = [
    {
      category: "happy",
      color: "#FCD34D", // yellow
      hoverColor: "#FBBF24",
      textColor: "#92400E", // dark yellow/brown
      shadowColor: "rgba(252, 211, 77, 0.5)",
      angle: 0,
    },
    {
      category: "sad",
      color: "#93C5FD", // blue
      hoverColor: "#60A5FA",
      textColor: "#1E40AF", // dark blue
      shadowColor: "rgba(147, 197, 253, 0.5)",
      angle: 72,
    },
    {
      category: "angry",
      color: "#FCA5A5", // red
      hoverColor: "#F87171",
      textColor: "#B91C1C", // dark red
      shadowColor: "rgba(252, 165, 165, 0.5)",
      angle: 144,
    },
    {
      category: "anxious",
      color: "#C4B5FD", // purple
      hoverColor: "#A78BFA",
      textColor: "#5B21B6", // dark purple
      shadowColor: "rgba(196, 181, 253, 0.5)",
      angle: 216,
    },
    {
      category: "calm",
      color: "#86EFAC", // green
      hoverColor: "#4ADE80",
      textColor: "#15803D", // dark green
      shadowColor: "rgba(134, 239, 172, 0.5)",
      angle: 288,
    },
  ]

  const handleEmotionSelect = (emotion: EmotionCategory) => {
    router.push(`/emotions/${emotion}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="max-w-md mx-auto pt-12">
        <PageHeader
          title="How are you feeling?"
          subtitle="Select the emotion that best describes your current state"
          className="animate-fade-in"
        />

        {isMobile ? (
          // Mobile view - vertical list of emotion buttons with animation
          <div className="mt-8 space-y-3">
            {emotions.map((emotion, index) => (
              <button
                key={emotion.category}
                onClick={() => handleEmotionSelect(emotion.category)}
                className={`w-full py-4 rounded-xl flex items-center transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                  visiblePetals.includes(index) ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                }`}
                style={{
                  backgroundColor: emotion.color,
                  boxShadow: `0 0 10px ${emotion.shadowColor}`,
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <div className="w-10 h-10 rounded-full ml-4 mr-4" style={{ backgroundColor: emotion.hoverColor }}></div>
                <span className="font-medium text-lg capitalize" style={{ color: emotion.textColor }}>
                  {emotion.category}
                </span>
              </button>
            ))}
          </div>
        ) : (
          // Desktop view - flower petal layout with animation
          <div className="mt-12 relative h-[400px] mx-auto">
            {/* Flower container */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px]">
              {/* Center circle with pulsing animation */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center z-20 animate-pulse">
                <span className="text-2xl font-bold text-purple-600">F</span>
              </div>

              {/* Emotion petals */}
              {emotions.map((emotion, index) => {
                // Calculate position based on angle
                const distance = 120 // Distance from center
                const radian = (emotion.angle * Math.PI) / 180
                const x = Math.cos(radian) * distance
                const y = Math.sin(radian) * distance

                return (
                  <button
                    key={emotion.category}
                    onClick={() => handleEmotionSelect(emotion.category)}
                    onMouseEnter={() => setHoveredEmotion(emotion.category)}
                    onMouseLeave={() => setHoveredEmotion(null)}
                    className="absolute w-[100px] h-[100px] rounded-full flex items-center justify-center transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                    style={{
                      backgroundColor: hoveredEmotion === emotion.category ? emotion.hoverColor : emotion.color,
                      top: `calc(50% + ${y}px)`,
                      left: `calc(50% + ${x}px)`,
                      transform: "translate(-50%, -50%)",
                      boxShadow: `0 0 20px ${emotion.shadowColor}`,
                      opacity: visiblePetals.includes(index) ? 0.9 : 0,
                      scale: visiblePetals.includes(index) ? (hoveredEmotion === emotion.category ? "1.2" : "1") : "0",
                      zIndex: hoveredEmotion === emotion.category ? 15 : 10,
                      transitionDelay: visiblePetals.includes(index) ? "0ms" : `${index * 100}ms`,
                    }}
                    aria-label={`Select ${emotion.category} emotion`}
                  >
                    <span
                      className="font-medium text-lg capitalize drop-shadow-md"
                      style={{ color: emotion.textColor }}
                    >
                      {emotion.category}
                    </span>
                  </button>
                )
              })}

              {/* Connecting stems with animation */}
              {emotions.map((emotion, index) => {
                const radian = (emotion.angle * Math.PI) / 180
                const stemLength = 100 // Length of stem
                const stemWidth = 8 // Width of stem

                return (
                  <div
                    key={`stem-${emotion.category}`}
                    className="absolute top-1/2 left-1/2 origin-left rounded-full z-5 transition-all duration-500"
                    style={{
                      backgroundColor: hoveredEmotion === emotion.category ? emotion.hoverColor : "#D1FAE5",
                      width: visiblePetals.includes(index) ? `${stemLength}px` : "0px",
                      height: `${stemWidth}px`,
                      transform: `rotate(${emotion.angle}deg)`,
                      opacity: visiblePetals.includes(index) ? 0.7 : 0,
                      transition: "all 0.5s ease",
                      transitionDelay: `${index * 100}ms`,
                    }}
                  />
                )
              })}
            </div>

            {/* Emotion label - shows when hovering */}
            {hoveredEmotion && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-30 pointer-events-none">
                <span className="text-lg font-medium capitalize text-gray-700 bg-white bg-opacity-80 px-3 py-1 rounded-full">
                  {hoveredEmotion}
                </span>
              </div>
            )}
          </div>
        )}

        {!isMobile && (
          <p className="text-center text-gray-500 mt-8 animate-fade-in" style={{ animationDelay: "1.5s" }}>
            Click on a petal to select how you're feeling
          </p>
        )}
      </div>
    </div>
  )
}

