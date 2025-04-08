"use client"

import { useMemo } from "react"

interface MoodData {
  name: string
  value: number
  percentage: number
}

interface MoodChartProps {
  data: MoodData[]
  colors: Record<string, string>
  size?: number
  className?: string
}

export function MoodChart({ data, colors, size = 180, className = "" }: MoodChartProps) {
  // Sort data by percentage (descending)
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.percentage - a.percentage)
  }, [data])

  // Calculate the circumference and radius for the SVG circle
  const radius = size * 0.35
  const circumference = 2 * Math.PI * radius

  // Calculate stroke-dasharray and stroke-dashoffset for each segment
  const segments = useMemo(() => {
    let currentOffset = 0
    return sortedData.map((entry) => {
      const strokeDasharray = (entry.percentage / 100) * circumference
      const segment = {
        name: entry.name,
        percentage: entry.percentage,
        color: colors[entry.name] || "#C4B5FD",
        strokeDasharray: `${strokeDasharray} ${circumference - strokeDasharray}`,
        strokeDashoffset: -currentOffset,
      }
      currentOffset += strokeDasharray
      return segment
    })
  }, [sortedData, colors, circumference])

  if (data.length === 0) {
    return <p className="text-center text-purple-500">No mood data yet</p>
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`relative w-[${size}px] h-[${size}px]`} style={{ width: size, height: size }}>
        {/* SVG for donut chart */}
        <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
          <g transform={`translate(${size / 2}, ${size / 2})`}>
            {segments.map((segment, index) => (
              <circle
                key={index}
                r={radius}
                cx="0"
                cy="0"
                fill="transparent"
                stroke={segment.color}
                strokeWidth={radius * 0.4}
                strokeDasharray={segment.strokeDasharray}
                strokeDashoffset={segment.strokeDashoffset}
                transform="rotate(-90)"
                style={{ transition: "all 0.5s ease-in-out" }}
              />
            ))}
            {/* Inner white circle to create donut effect */}
            <circle r={radius * 0.8} cx="0" cy="0" fill="white" />
          </g>
        </svg>

        {/* Center text showing the most frequent mood */}
        {sortedData.length > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-sm text-gray-500">Most frequent</p>
            <p className="text-lg font-semibold capitalize" style={{ color: colors[sortedData[0].name] || "#C4B5FD" }}>
              {sortedData[0].name}
            </p>
            <p className="text-2xl font-bold">{sortedData[0].percentage}%</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 mt-4 w-full">
        {sortedData.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: colors[entry.name] || "#C4B5FD" }} />
            <span className="text-sm capitalize">
              {entry.name}: {entry.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

