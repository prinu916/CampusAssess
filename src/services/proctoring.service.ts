import { ProctoringEvent, TestResult } from '../types/result.types';

const PROCTORING_LOGS_KEY = 'campusassess_proctoring_logs';
const PROCTORING_REVIEWS_KEY = 'campusassess_proctoring_reviews';

export interface ProctoringReviewRecord {
  resultId: string;
  status: 'pending' | 'verified' | 'flagged' | 'dismissed';
  notes: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface UnifiedProctoringSession {
  resultId: string;
  testId: string;
  testTitle: string;
  testType: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  section: string;
  score: number;
  maxMarks: number;
  percentage: number;
  submissionTime: string;
  events: ProctoringEvent[];
  tabSwitchCount: number;
  windowBlurCount: number;
  copyAttemptCount: number;
  devtoolsCount: number;
  fullscreenExitCount: number;
  totalViolations: number;
  riskLevel: 'clean' | 'low' | 'medium' | 'high';
  reviewStatus: 'pending' | 'verified' | 'flagged' | 'dismissed';
  facultyNotes?: string;
}

export const INITIAL_PROCTORING_LOGS: Record<string, ProctoringEvent[]> = {
  res_03: [
    {
      id: 'pe_01',
      timestamp: '2026-10-08T05:08:22Z',
      type: 'TAB_SWITCH',
      severity: 'high',
      message: 'Tab switch detected: Focus lost to external browser window for 14 seconds.',
    },
    {
      id: 'pe_02',
      timestamp: '2026-10-08T05:14:05Z',
      type: 'COPY_ATTEMPT',
      severity: 'medium',
      message: 'Clipboard copy shortcut (Ctrl+C) intercepted on Question 8.',
    },
  ],
  res_02: [],
  res_04: [
    {
      id: 'pe_03',
      timestamp: '2026-10-08T06:02:40Z',
      type: 'WINDOW_BLUR',
      severity: 'low',
      message: 'Window blur detected: Application minimized for 3 seconds.',
    },
    {
      id: 'pe_04',
      timestamp: '2026-10-08T06:09:12Z',
      type: 'TAB_SWITCH',
      severity: 'high',
      message: 'Tab switch detected: Browser backgrounded for 6 seconds.',
    },
  ],
  res_05: [],
};

export const proctoringService = {
  getLogsByResultId(resultId: string): ProctoringEvent[] {
    try {
      const stored = localStorage.getItem(PROCTORING_LOGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[resultId]) return parsed[resultId];
      }
    } catch {
      // fallback
    }
    return INITIAL_PROCTORING_LOGS[resultId] || [];
  },

  logEvent(testId: string, studentId: string, event: Omit<ProctoringEvent, 'id' | 'timestamp'>): ProctoringEvent {
    const key = `active_${testId}_${studentId}`;
    const newEvent: ProctoringEvent = {
      id: `pe_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };

    try {
      const stored = localStorage.getItem(PROCTORING_LOGS_KEY);
      const all = stored ? JSON.parse(stored) : { ...INITIAL_PROCTORING_LOGS };
      const currentList = all[key] || [];
      all[key] = [...currentList, newEvent];
      localStorage.setItem(PROCTORING_LOGS_KEY, JSON.stringify(all));
    } catch {
      // ignore
    }

    return newEvent;
  },

  getActiveEvents(testId: string, studentId: string): ProctoringEvent[] {
    const key = `active_${testId}_${studentId}`;
    try {
      const stored = localStorage.getItem(PROCTORING_LOGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed[key] || [];
      }
    } catch {
      // ignore
    }
    return [];
  },

  attachEventsToResult(resultId: string, testId: string, studentId: string, events: ProctoringEvent[]): void {
    try {
      const stored = localStorage.getItem(PROCTORING_LOGS_KEY);
      const all = stored ? JSON.parse(stored) : { ...INITIAL_PROCTORING_LOGS };
      all[resultId] = events;
      // also clear active key once attached
      delete all[`active_${testId}_${studentId}`];
      localStorage.setItem(PROCTORING_LOGS_KEY, JSON.stringify(all));
    } catch {
      // ignore
    }
  },

  getReviews(): Record<string, ProctoringReviewRecord> {
    try {
      const stored = localStorage.getItem(PROCTORING_REVIEWS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return {};
  },

  saveReview(resultId: string, status: ProctoringReviewRecord['status'], notes: string): void {
    try {
      const reviews = this.getReviews();
      reviews[resultId] = {
        resultId,
        status,
        notes,
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Dr. Rajesh Sen Sharma (Faculty)',
      };
      localStorage.setItem(PROCTORING_REVIEWS_KEY, JSON.stringify(reviews));
    } catch {
      // ignore
    }
  },

  getAllProctoredSessions(results: TestResult[]): UnifiedProctoringSession[] {
    const reviews = this.getReviews();

    return results.map((r) => {
      const logs = r.proctoringEvents && r.proctoringEvents.length > 0
        ? r.proctoringEvents
        : this.getLogsByResultId(r.id);

      const tabSwitchCount = logs.filter((e) => e.type === 'TAB_SWITCH').length;
      const windowBlurCount = logs.filter((e) => e.type === 'WINDOW_BLUR').length;
      const copyAttemptCount = logs.filter((e) => e.type === 'COPY_ATTEMPT').length;
      const devtoolsCount = logs.filter((e) => e.type === 'DEVTOOLS_ATTEMPT').length;
      const fullscreenExitCount = logs.filter((e) => e.type === 'FULLSCREEN_EXIT').length;
      const totalViolations = logs.length;

      let riskLevel: 'clean' | 'low' | 'medium' | 'high' = 'clean';
      if (totalViolations >= 3 || tabSwitchCount >= 2 || devtoolsCount > 0) {
        riskLevel = 'high';
      } else if (totalViolations >= 1) {
        riskLevel = 'medium';
      } else if (totalViolations > 0) {
        riskLevel = 'low';
      }

      const review = reviews[r.id];
      const reviewStatus = review?.status || (totalViolations > 0 ? 'pending' : 'verified');
      const facultyNotes = review?.notes || '';

      return {
        resultId: r.id,
        testId: r.testId,
        testTitle: r.testTitle,
        testType: r.testType,
        studentId: r.studentId,
        studentName: r.studentName,
        rollNumber: r.rollNumber,
        department: r.department,
        section: r.section,
        score: r.score,
        maxMarks: r.maxMarks,
        percentage: r.percentage,
        submissionTime: r.submissionTime,
        events: logs,
        tabSwitchCount,
        windowBlurCount,
        copyAttemptCount,
        devtoolsCount,
        fullscreenExitCount,
        totalViolations,
        riskLevel,
        reviewStatus,
        facultyNotes,
      };
    });
  },
};
