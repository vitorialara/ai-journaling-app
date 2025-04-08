export interface WeeklySummaryResponse {
  emotionalPatterns: {
    emotion: string;
    count: number;
    percentage: number;
  }[];
  keyThemes: string[];
  moodChanges: {
    date: string;
    emotion: string;
    intensity: number;
  }[];
  personalizedInsights: string;
  period: string;
  startDate: string;
  endDate: string;
}
