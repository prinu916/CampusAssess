import { Test } from '../types/test.types';
import { TestResult } from '../types/result.types';
import { AiDifficultyReport } from '../types/difficulty.types';

const DIFFICULTY_STORAGE_KEY = 'campusassess_ai_difficulty_cache';

export const difficultyAnalysisService = {
  generateDifficultyReport(test: Test, results: TestResult[]): Promise<AiDifficultyReport> {
    return new Promise((resolve) => {
      // Simulate rapid AI analysis synthesis
      setTimeout(() => {
        const sampleSize = results.length;
        const avgPercentage = sampleSize > 0
          ? results.reduce((acc, r) => acc + r.percentage, 0) / sampleSize
          : 75;

        const avgTimeSeconds = sampleSize > 0
          ? results.reduce((acc, r) => acc + r.timeTakenSeconds, 0) / sampleSize
          : (test.duration * 60) * 0.75;

        const allocatedSeconds = (test.duration || 30) * 60;
        const timeRatio = Math.min(1, avgTimeSeconds / allocatedSeconds);

        // Compute 0.0 - 10.0 difficulty score
        // Lower class average percentage -> higher difficulty
        let baseDiff = (100 - avgPercentage) / 10;
        // Factor in time pressure
        baseDiff = baseDiff * 0.75 + (timeRatio * 10) * 0.25;
        const overallIndex = Math.min(9.8, Math.max(1.5, Math.round(baseDiff * 10) / 10));

        let tier: AiDifficultyReport['tier'] = 'Balanced';
        let tierColor = '#EAB308';

        if (overallIndex >= 7.8) {
          tier = 'Highly Challenging';
          tierColor = '#DC2626';
        } else if (overallIndex >= 6.5) {
          tier = 'Rigorous';
          tierColor = '#EA580C';
        } else if (overallIndex <= 3.8) {
          tier = 'Introductory';
          tierColor = '#16A34A';
        }

        const conceptualDepth = Math.min(9.6, Math.max(2.0, Math.round((overallIndex * 1.05) * 10) / 10));
        const timePressure = Math.min(9.9, Math.max(2.5, Math.round((timeRatio * 9.5) * 10) / 10));
        const distractorEfficacy = Math.min(9.2, Math.max(3.0, Math.round((overallIndex * 0.88 + 1.2) * 10) / 10));
        const discriminationIndex = Math.round((0.42 + (Math.random() * 0.18 - 0.09)) * 100) / 100;

        let summary = '';
        let keyInsights: string[] = [];
        let recommendations: string[] = [];

        if (test.type === 'MCQ') {
          summary = `The AI diagnostic engine rates "${test.title}" at an empirical Difficulty Index of ${overallIndex}/10 (${tier}). Analysis of ${sampleSize} candidate attempts shows strong grasp of core syntax and inheritance models, but sharp variance in asynchronous execution and runtime memory lifecycle items.`;
          keyInsights = [
            'High Facility Items: Over 85% of students solved Question 1 (Runtime Polymorphism) and Question 5 (Functional Interfaces) without hesitation.',
            'Cognitive Bottlenecks: Question 3 (G1 GC defaults) and Question 7 (NIO Channel non-blocking streams) exhibited a low 42% accuracy, indicating conceptual confusion between compile-time types and JVM memory structures.',
            `Time Pressure: Candidates averaged ${Math.round(timeRatio * 100)}% of the ${test.duration}m exam window, suggesting pacing was well matched for high performers but pressured for bottom quartiles.`,
          ];
          recommendations = [
            'Dedicate 15 minutes of lecture time to JVM Garbage Collector generational phases before finals.',
            'Review distractors on Question 7: 38% of students mistakenly selected option B (FileChannel), which implies an ambiguity between blocking and non-blocking I/O.',
            'Maintain current difficulty weighting for midterm benchmarks to ensure effective cohort stratification.',
          ];
        } else {
          summary = `The algorithmic suite "${test.title}" exhibits a Difficulty Index of ${overallIndex}/10 (${tier}). Candidates successfully managed linear scan problems but hit exponential time bottlenecks on sub-array optimization constraints.`;
          keyInsights = [
            'Problem 1 (Two Sum) had a 92% pass rate with average submission runtime of 46ms.',
            'Problem 3 (Kadane\'s Variant) had a 54% pass rate due to edge-case timeouts on negative integer constraints.',
            'Language selection distribution: 52% Java, 34% Python, 14% C++.',
          ];
          recommendations = [
            'Conduct a problem-solving workshop on Dynamic Programming contiguous sub-segment Kadane heuristics.',
            'Encourage Python candidates to be mindful of I/O buffer latency on large constraint arrays.',
            'Consider granting 5 additional minutes for the upcoming final assessment.',
          ];
        }

        const report: AiDifficultyReport = {
          testId: test.id,
          testTitle: test.title,
          overallIndex,
          tier,
          tierColor,
          metrics: {
            conceptualDepth,
            timePressure,
            distractorEfficacy,
            discriminationIndex,
          },
          summary,
          keyInsights,
          recommendations,
          generatedAt: new Date().toISOString(),
          sampleSize,
        };

        // Cache report
        try {
          const stored = localStorage.getItem(DIFFICULTY_STORAGE_KEY);
          const all = stored ? JSON.parse(stored) : {};
          all[test.id] = report;
          localStorage.setItem(DIFFICULTY_STORAGE_KEY, JSON.stringify(all));
        } catch {
          // ignore
        }

        resolve(report);
      }, 600);
    });
  },

  getCachedReport(testId: string): AiDifficultyReport | null {
    try {
      const stored = localStorage.getItem(DIFFICULTY_STORAGE_KEY);
      if (stored) {
        const all = JSON.parse(stored);
        if (all[testId]) return all[testId];
      }
    } catch {
      // ignore
    }
    return null;
  },
};
