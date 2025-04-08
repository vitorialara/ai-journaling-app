import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import { GrowingChooser } from "@/app/components/VisualGrowthElements/GrowingChooser"
import { EMOTION_CONFIG } from "@/app/config"

interface EmotionalPattern {
  emotion: string
  count: number
  percentage: number
}

interface MoodChange {
  date: string
  emotion: string
  intensity: number
}

interface WeeklySummaryProps {
  data: {
    emotionalPatterns: EmotionalPattern[]
    keyThemes: string[]
    moodChanges: {
      date: string
      emotion: string
      intensity: number
    }[]
    personalizedInsights: string
    period: string
    startDate: string
    endDate: string
    isAI: boolean
  }
}

const emotionColors = {
  happy: "#FCD34D", // yellow
  sad: "#93C5FD",   // blue
  angry: "#FCA5A5", // red
  anxious: "#C4B5FD", // purple
  calm: "#86EFAC",  // green
}

const emotionIcons = {
  happy: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .703.398 1.25 1.125 1.25.75 0 1.125-.547 1.125-1.25 0-.323-.06-.6-.189-.866-.108-.215-.396-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.266.189.543.189.866 0 .703-.375 1.25-1.125 1.25-.727 0-1.125-.547-1.125-1.25 0-.323.06-.6.189-.866zM12 17.25c-.75 0-1.5-.375-1.5-1.125 0-.75.75-1.125 1.5-1.125s1.5.375 1.5 1.125c0 .75-.75 1.125-1.5 1.125z" clipRule="evenodd" />
    </svg>
  ),
  sad: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .703.398 1.25 1.125 1.25.75 0 1.125-.547 1.125-1.25 0-.323-.06-.6-.189-.866-.108-.215-.396-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.266.189.543.189.866 0 .703-.375 1.25-1.125 1.25-.727 0-1.125-.547-1.125-1.25 0-.323.06-.6.189-.866zM12 17.25c-1.5 0-2.25-.75-2.25-1.5 0-.75.75-1.5 2.25-1.5s2.25.75 2.25 1.5c0 .75-.75 1.5-2.25 1.5z" clipRule="evenodd" />
    </svg>
  ),
  angry: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .703.398 1.25 1.125 1.25.75 0 1.125-.547 1.125-1.25 0-.323-.06-.6-.189-.866-.108-.215-.396-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.266.189.543.189.866 0 .703-.375 1.25-1.125 1.25-.727 0-1.125-.547-1.125-1.25 0-.323.06-.6.189-.866zM12 17.25c-1.5 0-2.25-.75-2.25-1.5 0-.75.75-1.5 2.25-1.5s2.25.75 2.25 1.5c0 .75-.75 1.5-2.25 1.5z" clipRule="evenodd" />
    </svg>
  ),
  anxious: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .703.398 1.25 1.125 1.25.75 0 1.125-.547 1.125-1.25 0-.323-.06-.6-.189-.866-.108-.215-.396-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.266.189.543.189.866 0 .703-.375 1.25-1.125 1.25-.727 0-1.125-.547-1.125-1.25 0-.323.06-.6.189-.866zM12 17.25c-1.5 0-2.25-.75-2.25-1.5 0-.75.75-1.5 2.25-1.5s2.25.75 2.25 1.5c0 .75-.75 1.5-2.25 1.5z" clipRule="evenodd" />
    </svg>
  ),
  calm: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .703.398 1.25 1.125 1.25.75 0 1.125-.547 1.125-1.25 0-.323-.06-.6-.189-.866-.108-.215-.396-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.266.189.543.189.866 0 .703-.375 1.25-1.125 1.25-.727 0-1.125-.547-1.125-1.25 0-.323.06-.6.189-.866zM12 17.25c-1.5 0-2.25-.75-2.25-1.5 0-.75.75-1.5 2.25-1.5s2.25.75 2.25 1.5c0 .75-.75 1.5-2.25 1.5z" clipRule="evenodd" />
    </svg>
  ),
}

export function WeeklySummaryCard({ data }: WeeklySummaryProps) {
  const [animationProgress, setAnimationProgress] = useState(0)
  const mostRecentEmotion = data.moodChanges.length > 0
    ? data.moodChanges[data.moodChanges.length - 1].emotion
    : EMOTION_CONFIG.DEFAULT_CATEGORY

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationProgress(1)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-purple-800">Weekly Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Emotion Visualization */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative h-[200px] w-[200px]">
            {/* Growing circle animation */}
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-1000"
              style={{
                width: `${animationProgress * 200}px`,
                height: `${animationProgress * 200}px`,
                backgroundColor: emotionColors[mostRecentEmotion.toLowerCase() as keyof typeof emotionColors],
                opacity: 0.2,
                transform: `translate(-50%, -50%) scale(${animationProgress})`,
              }}
            />
            {/* Emotion icon */}
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
              style={{
                opacity: animationProgress,
                transform: `translate(-50%, -50%) scale(${animationProgress})`,
                transition: "all 0.5s ease",
              }}
            >
              <div className="w-32 h-32">
                <GrowingChooser
                  emotion={mostRecentEmotion.toLowerCase()}
                  growthStage={3}
                  textLength={0}
                  charsBeforeNextStep={0}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Emotional Patterns */}
        {data.emotionalPatterns.length > 0 && (
          <div className="space-y-4">
            {data.emotionalPatterns.map((pattern, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                style={{
                  transform: `translateX(${(1 - animationProgress) * 20}px)`,
                  opacity: animationProgress,
                  transitionDelay: `${index * 100}ms`
                }}
              >
                <span className="text-lg font-medium" style={{ color: emotionColors[pattern.emotion.toLowerCase() as keyof typeof emotionColors] }}>
                  {pattern.emotion}
                </span>
                <div className="flex items-center space-x-4">
                  <div className="w-32 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pattern.percentage}%`,
                        backgroundColor: emotionColors[pattern.emotion.toLowerCase() as keyof typeof emotionColors],
                        boxShadow: `0 0 8px ${emotionColors[pattern.emotion.toLowerCase() as keyof typeof emotionColors]}`
                      }}
                    />
                  </div>
                  <span className="text-base font-semibold" style={{ color: emotionColors[pattern.emotion.toLowerCase() as keyof typeof emotionColors] }}>
                    {pattern.count} entries
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Weekly Progress */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-purple-800">Weekly Progress</h3>
            <span className="text-sm text-purple-600">{data.period}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Progress Circle */}
            <div className="relative h-32 w-32 mx-auto">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  className="text-purple-100"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                {/* Progress circle */}
                <circle
                  className="text-purple-600"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * data.emotionalPatterns.reduce((sum, pattern) => sum + pattern.count, 0)) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  style={{
                    transition: 'stroke-dashoffset 1s ease-in-out',
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%'
                  }}
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-3xl font-bold text-purple-800">{data.emotionalPatterns.reduce((sum, pattern) => sum + pattern.count, 0)}</span>
                <span className="block text-sm text-purple-600">entries this week</span>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                <span className="text-sm text-purple-800">Daily average: 1.7</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                <span className="text-sm text-purple-800">Best day: 3 entries</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                <span className="text-sm text-purple-800">Consistency: 85%</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-purple-800">Progress</span>
              <span className="text-purple-600">12/14 entries</span>
            </div>
            <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${(12/14) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Key Themes */}
        {data.keyThemes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.keyThemes.map((theme, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors duration-300"
                style={{
                  transform: `scale(${animationProgress})`,
                  transitionDelay: `${index * 100}ms`
                }}
              >
                {theme}
              </span>
            ))}
          </div>
        )}

        {/* Mood Changes Timeline */}
        {data.moodChanges.length > 0 && (
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-100 rounded-full" />
            <div className="space-y-4 pl-6">
              {data.moodChanges.map((change, index) => (
                <div
                  key={index}
                  className="relative"
                  style={{
                    transform: `translateX(${(1 - animationProgress) * 20}px)`,
                    opacity: animationProgress,
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  <div className="absolute left-[-1.5rem] top-2 w-3 h-3 bg-purple-500 rounded-full" />
                  <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-800 font-medium">{format(new Date(change.date), "MMM d")}</span>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                        change.emotion === "happy" ? "bg-yellow-100 text-yellow-800" :
                        change.emotion === "sad" ? "bg-blue-100 text-blue-800" :
                        change.emotion === "angry" ? "bg-red-100 text-red-800" :
                        change.emotion === "anxious" ? "bg-purple-100 text-purple-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {change.emotion}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${change.intensity * 10}%`,
                            backgroundColor: emotionColors[change.emotion.toLowerCase() as keyof typeof emotionColors]
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personalized Insights */}
        {data.personalizedInsights && (
          <div
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            style={{
              transform: `translateY(${(1 - animationProgress) * 20}px)`,
              opacity: animationProgress,
              transitionDelay: "300ms"
            }}
          >
            <p className="text-purple-800 leading-relaxed">{data.personalizedInsights}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
