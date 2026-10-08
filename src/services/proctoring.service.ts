import { ProctoringEvent } from '../types/result.types';

const PROCTORING_LOGS_KEY = 'campusassess_proctoring_logs';

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
      localStorage.setItem(PROCTORING_LOGS_KEY, JSON.stringify(all));
    } catch {
      // ignore
    }
  },
};
