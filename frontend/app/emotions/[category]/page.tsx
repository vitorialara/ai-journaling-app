"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { PageHeader } from "../../components/page-header"
import { type EmotionCategory, type SubEmotion, getSubEmotions } from "../../types/emotions"
import { use } from "react"

type PageParams = {
  category: string
}

export default function SubEmotionPage({ params }: { params: Promise<PageParams> }) {
  const router = useRouter()
  const category = use(params).category as EmotionCategory
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  const [hoveredEmotion, setHoveredEmotion] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Validate category
  const validCategories = ["happy", "sad", "angry", "anxious", "calm"]

  // Get sub-emotions for this category
  const subEmotions = useMemo(() => {
    if (validCategories.includes(category)) {
      return getSubEmotions(category)
    }
    return []
  }, [category])

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Add animation for items appearing one by one
  useEffect(() => {
    if (subEmotions.length === 0) return

    const animateItems = () => {
      // Add items one by one with a delay
      const addItem = (index: number) => {
        setTimeout(() => {
          setVisibleItems((prev) => [...prev, index])
        }, index * 70) // 70ms delay between each item
      }

      // Start the animation after a short delay
      setTimeout(() => {
        for (let i = 0; i < subEmotions.length; i++) {
          addItem(i)
        }
      }, 300)
    }

    animateItems()
  }, [subEmotions])

  const handleSubEmotionSelect = (subEmotion: SubEmotion) => {
    router.push(`/journal?category=${category}&subEmotion=${subEmotion}`)
  }

  // If category is invalid, show error
  if (!validCategories.includes(category)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
        <div className="max-w-md mx-auto pt-12 text-center">
          <h1 className="text-2xl font-semibold text-purple-800">Invalid Emotion Category</h1>
          <p className="mt-4 text-purple-600">The emotion category you selected is not valid.</p>
          <button
            onClick={() => router.push("/emotions")}
            className="mt-6 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Get color scheme based on emotion category
  const getColorScheme = () => {
    switch (category) {
      case "happy":
        return {
          bg: "from-yellow-50",
          text: "text-yellow-700",
          darkText: "text-yellow-900",
          lightBg: "bg-yellow-50",
          mediumBg: "bg-yellow-100",
          darkBg: "bg-yellow-200",
          border: "border-yellow-300",
          shadow: "shadow-yellow-200/50",
          petalColor: "#FCD34D",
          stemColor: "#FBBF24",
        }
      case "sad":
        return {
          bg: "from-blue-50",
          text: "text-blue-700",
          darkText: "text-blue-900",
          lightBg: "bg-blue-50",
          mediumBg: "bg-blue-100",
          darkBg: "bg-blue-200",
          border: "border-blue-300",
          shadow: "shadow-blue-200/50",
          petalColor: "#93C5FD",
          stemColor: "#60A5FA",
        }
      case "angry":
        return {
          bg: "from-red-50",
          text: "text-red-700",
          darkText: "text-red-900",
          lightBg: "bg-red-50",
          mediumBg: "bg-red-100",
          darkBg: "bg-red-200",
          border: "border-red-300",
          shadow: "shadow-red-200/50",
          petalColor: "#FCA5A5",
          stemColor: "#F87171",
        }
      case "anxious":
        return {
          bg: "from-purple-50",
          text: "text-purple-700",
          darkText: "text-purple-900",
          lightBg: "bg-purple-50",
          mediumBg: "bg-purple-100",
          darkBg: "bg-purple-200",
          border: "border-purple-300",
          shadow: "shadow-purple-200/50",
          petalColor: "#C4B5FD",
          stemColor: "#A78BFA",
        }
      case "calm":
        return {
          bg: "from-green-50",
          text: "text-green-700",
          darkText: "text-green-900",
          lightBg: "bg-green-50",
          mediumBg: "bg-green-100",
          darkBg: "bg-green-200",
          border: "border-green-300",
          shadow: "shadow-green-200/50",
          petalColor: "#86EFAC",
          stemColor: "#4ADE80",
        }
      default:
        return {
          bg: "from-purple-50",
          text: "text-purple-700",
          darkText: "text-purple-900",
          lightBg: "bg-purple-50",
          mediumBg: "bg-purple-100",
          darkBg: "bg-purple-200",
          border: "border-purple-300",
          shadow: "shadow-purple-200/50",
          petalColor: "#C4B5FD",
          stemColor: "#A78BFA",
        }
    }
  }

  const colorScheme = getColorScheme()

  // Generate flower for each sub-emotion
  const renderFlower = (emotion: string, index: number) => {
    // Different flower types based on index
    const flowerType = index % 5
    const isVisible = visibleItems.includes(index)
    const isHovered = hoveredEmotion === emotion

    // Base styles
    const containerClasses = `
      relative w-full aspect-square rounded-lg overflow-hidden
      ${colorScheme.lightBg} ${colorScheme.border} border
      transition-all duration-300 cursor-pointer
      hover:shadow-lg transform hover:-translate-y-1
      ${isVisible ? "opacity-100" : "opacity-0"}
    `

    const labelClasses = `
      absolute bottom-0 left-0 right-0 py-2 px-1 text-center
      ${colorScheme.mediumBg} ${colorScheme.text} text-sm font-medium
      transition-all duration-300
      ${isHovered ? colorScheme.darkBg : ""}
    `

    // Different flower visualizations
    let flowerContent

    switch (flowerType) {
      case 0: // Simple flower with petals
        flowerContent = (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Center */}
            <div
              className="w-8 h-8 rounded-full z-10 transition-transform duration-300"
              style={{
                backgroundColor: colorScheme.stemColor,
                transform: isHovered ? "scale(1.2)" : "scale(1)",
              }}
            />

            {/* Petals */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const angle = i * 60
              const radian = angle * (Math.PI / 180)
              const x = Math.cos(radian) * 20
              const y = Math.sin(radian) * 20

              return (
                <div
                  key={i}
                  className="absolute w-10 h-10 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: colorScheme.petalColor,
                    opacity: 0.8,
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: `translate(-50%, -50%) ${isHovered ? "scale(1.1)" : "scale(1)"}`,
                    transformOrigin: "center",
                    zIndex: i % 2 === 0 ? 5 : 15,
                  }}
                />
              )
            })}
          </div>
        )
        break

      case 1: // Blooming flower
        flowerContent = (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Stem */}
            <div
              className="absolute w-2 h-24 bottom-0 left-1/2 transform -translate-x-1/2"
              style={{ backgroundColor: colorScheme.stemColor }}
            />

            {/* Flower head */}
            <div
              className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
              style={{ transform: isHovered ? "translate(-50%, -50%) scale(1.2)" : "translate(-50%, -50%) scale(1)" }}
            >
              {/* Petals in a circle */}
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                const angle = i * 45
                const radian = angle * (Math.PI / 180)
                const distance = isHovered ? 18 : 15
                const x = Math.cos(radian) * distance
                const y = Math.sin(radian) * distance

                return (
                  <div
                    key={i}
                    className="absolute w-8 h-8 rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: colorScheme.petalColor,
                      left: `calc(0px + ${x}px)`,
                      top: `calc(0px + ${y}px)`,
                      transform: "translate(-50%, -50%)",
                      opacity: 0.9,
                    }}
                  />
                )
              })}

              {/* Center */}
              <div
                className="absolute w-10 h-10 rounded-full z-20"
                style={{
                  backgroundColor: colorScheme.stemColor,
                  left: "0px",
                  top: "0px",
                  transform: "translate(-50%, -50%)",
                }}
              />
            </div>
          </div>
        )
        break

      case 2: // Lotus-like flower
        flowerContent = (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Layers of petals */}
            {[16, 12, 8].map((numPetals, layerIndex) => {
              return (
                <div key={layerIndex} className="absolute inset-0 flex items-center justify-center">
                  {Array.from({ length: numPetals }).map((_, i) => {
                    const angle = (i * 360) / numPetals
                    const radian = angle * (Math.PI / 180)
                    const distance = 12 + layerIndex * 8
                    const x = Math.cos(radian) * distance
                    const y = Math.sin(radian) * distance

                    return (
                      <div
                        key={i}
                        className="absolute rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: colorScheme.petalColor,
                          width: isHovered ? "14px" : "12px",
                          height: isHovered ? "14px" : "12px",
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                          transform: "translate(-50%, -50%)",
                          opacity: 0.7 + layerIndex * 0.1,
                        }}
                      />
                    )
                  })}
                </div>
              )
            })}

            {/* Center */}
            <div
              className="absolute w-8 h-8 rounded-full z-20 transition-transform duration-300"
              style={{
                backgroundColor: colorScheme.stemColor,
                transform: isHovered ? "scale(1.2)" : "scale(1)",
              }}
            />
          </div>
        )
        break

      case 3: // Daisy-like flower
        flowerContent = (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Petals */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = i * 30
              const radian = angle * (Math.PI / 180)
              const x = Math.cos(radian) * 20
              const y = Math.sin(radian) * 20

              return (
                <div
                  key={i}
                  className="absolute rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: "white",
                    width: "12px",
                    height: "24px",
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: `translate(-50%, -50%) rotate(${angle}deg) ${isHovered ? "scale(1.1)" : "scale(1)"}`,
                    boxShadow: `0 0 5px rgba(0,0,0,0.1)`,
                  }}
                />
              )
            })}

            {/* Center */}
            <div
              className="w-12 h-12 rounded-full z-10 transition-transform duration-300"
              style={{
                backgroundColor: colorScheme.petalColor,
                transform: isHovered ? "scale(1.2)" : "scale(1)",
              }}
            />
          </div>
        )
        break

      case 4: // Abstract flower
      default:
        flowerContent = (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Abstract shape */}
            <div className="relative w-32 h-32">
              {Array.from({ length: 5 }).map((_, i) => {
                const size = 20 + i * 8
                const rotation = i * 15

                return (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 rounded-full transition-all duration-500"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      backgroundColor: i % 2 === 0 ? colorScheme.petalColor : colorScheme.stemColor,
                      opacity: 0.7 - i * 0.1,
                      transform: `translate(-50%, -50%) rotate(${rotation + (isHovered ? 15 : 0)}deg)`,
                    }}
                  />
                )
              })}
            </div>
          </div>
        )
        break
    }

    return (
      <div
        key={emotion}
        className={containerClasses}
        style={{
          transitionDelay: `${index * 50}ms`,
          transform: isVisible ? (isHovered ? "translateY(-4px)" : "translateY(0)") : "translateY(10px)",
        }}
        onClick={() => handleSubEmotionSelect(emotion as SubEmotion)}
        onMouseEnter={() => setHoveredEmotion(emotion)}
        onMouseLeave={() => setHoveredEmotion(null)}
      >
        {flowerContent}
        <div className={labelClasses}>{emotion}</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${colorScheme.bg} to-white p-4 overflow-hidden relative`}>
      <div className="max-w-5xl mx-auto pt-8 relative z-10">
        <PageHeader
          title={category.charAt(0).toUpperCase() + category.slice(1)}
          subtitle="Select the specific emotion you're experiencing"
          className={`${colorScheme.text} animate-fade-in mb-6`}
        />

        <div
          className={`grid ${isMobile ? "grid-cols-2 gap-3" : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"} mt-4`}
        >
          {subEmotions.map((emotion, index) => renderFlower(emotion, index))}
        </div>
      </div>
    </div>
  )
}
