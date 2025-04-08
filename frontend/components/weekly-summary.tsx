import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { WeeklySummaryResponse } from "@/types/weekly-summary";

interface WeeklySummaryProps {
  userId: string;
}

export function WeeklySummary({ userId }: WeeklySummaryProps) {
  const [summary, setSummary] = useState<WeeklySummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(`/api/journal/weekly-summary?user_id=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch weekly summary");
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error("Error fetching weekly summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [userId]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Weekly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Weekly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No data available for this period.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Weekly Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Emotional Patterns */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Emotional Patterns</h3>
          <div className="space-y-2">
            {summary.emotionalPatterns.map((pattern) => (
              <div key={pattern.emotion} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{pattern.emotion}</span>
                  <span>{pattern.percentage.toFixed(1)}%</span>
                </div>
                <Progress value={pattern.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Key Themes */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Key Themes</h3>
          <div className="flex flex-wrap gap-2">
            {summary.keyThemes.map((theme: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>

        {/* Mood Changes */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Mood Changes</h3>
          <div className="space-y-2">
            {summary.moodChanges.map((change, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {new Date(change.date).toLocaleDateString()}
                </span>
                <span className="capitalize">{change.emotion}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Personalized Insights */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Personalized Insights</h3>
          <p className="text-gray-700">{summary.personalizedInsights}</p>
        </div>
      </CardContent>
    </Card>
  );
}
