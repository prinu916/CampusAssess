import { resultService } from './result.service';
import { testService } from './test.service';

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  section: string;
  score: number;
  maxMarks: number;
  percentage: number;
  timeTakenSeconds: number;
  submissionTime: string;
  percentile: number;
  isCurrentUser: boolean;
}

export interface AssessmentLeaderboardStats {
  testId: string;
  testTitle: string;
  subject: string;
  totalParticipants: number;
  averageScore: number;
  averagePercentage: number;
  highestScore: number;
  lowestScore: number;
  currentUserRank: number | null;
  currentUserScore: number | null;
  currentUserPercentile: number | null;
  entries: LeaderboardEntry[];
}

export const leaderboardService = {
  getLeaderboardForTest(
    testId: string,
    currentStudentId: string = 'usr_student_01',
    sectionFilter?: string
  ): AssessmentLeaderboardStats {
    const test = testService.getTestById(testId) || testService.getTests('all')[0];
    let allResults = resultService.getFacultyTestResults(testId);

    // If results are empty for this test, fallback to all results or simulated batch
    if (allResults.length === 0) {
      allResults = resultService.getAllResults().filter((r) => r.testType === test.type);
    }

    let filtered = sectionFilter && sectionFilter !== 'ALL'
      ? allResults.filter((r) => r.section === sectionFilter)
      : allResults;

    // Sort primarily by score descending, then by timeTakenSeconds ascending (speed tiebreaker)
    filtered.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeTakenSeconds - b.timeTakenSeconds;
    });

    const total = filtered.length || 1;
    let currentUserRank: number | null = null;
    let currentUserScore: number | null = null;
    let currentUserPercentile: number | null = null;

    const entries: LeaderboardEntry[] = filtered.map((r, index) => {
      const rank = index + 1;
      const isCurrentUser = r.studentId === currentStudentId;

      // Standard empirical percentile rank = ((Total - Rank + 1) / Total) * 100
      const percentile = Math.round(((total - rank + 1) / total) * 100);

      if (isCurrentUser) {
        currentUserRank = rank;
        currentUserScore = r.score;
        currentUserPercentile = percentile;
      }

      return {
        rank,
        studentId: r.studentId,
        studentName: r.studentName,
        rollNumber: r.rollNumber,
        department: r.department,
        section: r.section,
        score: r.score,
        maxMarks: r.maxMarks,
        percentage: r.percentage,
        timeTakenSeconds: r.timeTakenSeconds,
        submissionTime: r.submissionTime,
        percentile,
        isCurrentUser,
      };
    });

    const scores = filtered.map((r) => r.score);
    const avgScore = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
    const avgPercentage = test.maxMarks > 0 ? Math.round((avgScore / test.maxMarks) * 100) : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

    return {
      testId: test.id,
      testTitle: test.title,
      subject: test.subject,
      totalParticipants: total,
      averageScore: avgScore,
      averagePercentage: avgPercentage,
      highestScore,
      lowestScore,
      currentUserRank,
      currentUserScore,
      currentUserPercentile,
      entries,
    };
  },
};
