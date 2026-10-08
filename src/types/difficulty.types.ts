export interface DifficultyMetricBreakdown {
  conceptualDepth: number; // 0 - 10
  timePressure: number; // 0 - 10
  distractorEfficacy: number; // 0 - 10
  discriminationIndex: number; // -1.0 to 1.0 (standard psychometric item discrimination)
}

export interface AiDifficultyReport {
  testId: string;
  testTitle: string;
  overallIndex: number; // 0.0 - 10.0 scale
  tier: 'Introductory' | 'Balanced' | 'Rigorous' | 'Highly Challenging';
  tierColor: string;
  metrics: DifficultyMetricBreakdown;
  summary: string;
  keyInsights: string[];
  recommendations: string[];
  generatedAt: string;
  sampleSize: number;
}
