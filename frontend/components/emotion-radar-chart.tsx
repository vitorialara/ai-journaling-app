import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

interface EmotionData {
  emotion: string;
  value: number;
}

interface EmotionRadarChartProps {
  data: EmotionData[];
}

const EmotionRadarChart: React.FC<EmotionRadarChartProps> = ({ data }) => {
  // Define colors for each emotion matching the dashboard's color scheme
  const emotionColors: { [key: string]: string } = {
    Happy: '#FCD34D', // yellow
    Sad: '#93C5FD',   // blue
    Angry: '#FCA5A5', // red
    Anxious: '#C4B5FD', // purple
    Calm: '#86EFAC',  // green
  };

  // Get the color for a specific emotion
  const getEmotionColor = (emotion: string): string => {
    return emotionColors[emotion] || '#8884d8';
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid
            stroke="#E5E7EB"
            strokeDasharray="3 3"
            strokeOpacity={0.3}
          />
          <PolarAngleAxis
            dataKey="emotion"
            tick={{
              fill: '#6B7280',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.025em'
            }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 4]}
            tick={{
              fill: '#6B7280',
              fontSize: 10,
              opacity: 0.6
            }}
            tickCount={5}
          />
          {data.map((entry, index) => (
            <Radar
              key={entry.emotion}
              name={entry.emotion}
              dataKey="value"
              stroke={getEmotionColor(entry.emotion)}
              fill={getEmotionColor(entry.emotion)}
              fillOpacity={0.4}
              strokeWidth={2}
              dot={{
                fill: getEmotionColor(entry.emotion),
                strokeWidth: 2,
                r: 4
              }}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmotionRadarChart;
