import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Calendar, Flame, Target, Trophy } from "lucide-react"

interface StatsCardProps {
  title: string
  value: number | string
  description?: string
  progress?: number
  icon?: React.ReactNode
  streak?: number
  target?: number
  bestStreak?: number
  titleSize?: string
}

export function StatsCard({
  title,
  value,
  description,
  progress,
  icon,
  streak = 0,
  target = 7,
  bestStreak = 0,
  titleSize = "text-sm"
}: StatsCardProps) {
  // Define colors based on progress
  const getProgressColor = (value: number) => {
    if (value >= 80) return "bg-green-500"
    if (value >= 60) return "bg-blue-500"
    if (value >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`${titleSize} font-medium text-purple-800`}>
          {title}
        </CardTitle>
        {icon || <Calendar className="h-4 w-4 text-purple-500" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-purple-900">{value}</div>
        {description && (
          <p className="text-xs text-purple-600">
            {description}
          </p>
        )}

        {/* Streak Information */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-purple-700">Current Streak</span>
            </div>
            <span className="font-semibold text-purple-900">{streak} days</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-purple-700">Best Streak</span>
            </div>
            <span className="font-semibold text-purple-900">{bestStreak} days</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <Target className="h-4 w-4 text-green-500" />
              <span className="text-purple-700">Weekly Target</span>
            </div>
            <span className="font-semibold text-purple-900">{target} days</span>
          </div>
        </div>

        {progress !== undefined && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-purple-600 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress
              value={progress}
              className={`h-2 ${getProgressColor(progress)}`}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
