import { Test, TestStatus } from '../types/test.types';
import { INITIAL_TESTS } from './mockTestData';

const TESTS_STORAGE_KEY = 'campusassess_tests_store';

export const testService = {
  getTests(filter: 'all' | 'available' | 'upcoming' | 'completed' = 'all'): Test[] {
    try {
      const stored = localStorage.getItem(TESTS_STORAGE_KEY);
      let tests: Test[] = stored ? JSON.parse(stored) : INITIAL_TESTS;

      // Migrate or backfill tags and difficulty if missing on stored records
      let hasMigrated = false;
      tests = tests.map((t) => {
        let changed = false;
        let updated = { ...t };
        if (!updated.difficulty) {
          const matchInitial = INITIAL_TESTS.find((it) => it.id === t.id);
          updated.difficulty = matchInitial?.difficulty || 'Intermediate';
          changed = true;
        }
        if (!updated.tags || updated.tags.length === 0) {
          const matchInitial = INITIAL_TESTS.find((it) => it.id === t.id);
          updated.tags = matchInitial?.tags || [t.subject?.split(' ')[0] || 'General'];
          changed = true;
        }
        if (changed) hasMigrated = true;
        return updated;
      });

      if (!stored || hasMigrated) {
        localStorage.setItem(TESTS_STORAGE_KEY, JSON.stringify(tests));
      }

      if (filter === 'all') return tests;
      return tests.filter((t) => t.status === filter);
    } catch {
      return filter === 'all' ? INITIAL_TESTS : INITIAL_TESTS.filter((t) => t.status === filter);
    }
  },

  getTestById(id: string): Test | undefined {
    const tests = this.getTests('all');
    return tests.find((t) => t.id === id);
  },

  createTest(data: Partial<Test>): Promise<Test> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tests = this.getTests('all');
        const newTest: Test = {
          id: `test_${Date.now()}`,
          title: data.title || 'Untitled Assessment',
          subject: data.subject || 'General Assessment',
          description: data.description || '',
          type: data.type || 'MCQ',
          difficulty: data.difficulty || 'Intermediate',
          tags: data.tags && data.tags.length > 0 ? data.tags : [data.subject || 'General'].filter(Boolean),
          duration: data.duration || 30,
          startTime: data.startTime || new Date().toISOString(),
          endTime: data.endTime || new Date(Date.now() + 7 * 86400000).toISOString(),
          maxMarks: data.maxMarks || (data.type === 'MCQ' ? 50 : 100),
          instructions: data.instructions && data.instructions.length > 0
            ? data.instructions
            : [
                'Ensure a stable internet connection.',
                'The timer starts immediately upon clicking Start Exam.',
                'Do not switch browser tabs or open external windows.',
              ],
          questions: data.questions || [],
          problems: data.problems || [],
          access: data.access || { type: 'ALL' },
          status: data.status || 'available',
          createdByName: data.createdByName || 'Dr. Aris Thorne',
          createdAt: new Date().toISOString(),
          participantsCount: 0,
          submissionsCount: 0,
        };

        const updated = [newTest, ...tests];
        localStorage.setItem(TESTS_STORAGE_KEY, JSON.stringify(updated));
        resolve(newTest);
      }, 350);
    });
  },

  updateTest(id: string, updates: Partial<Test>): Promise<Test> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const tests = this.getTests('all');
        const idx = tests.findIndex((t) => t.id === id);
        if (idx === -1) {
          reject(new Error('Test not found'));
          return;
        }
        const updated = { ...tests[idx], ...updates };
        tests[idx] = updated;
        localStorage.setItem(TESTS_STORAGE_KEY, JSON.stringify(tests));
        resolve(updated);
      }, 300);
    });
  },

  deleteTest(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tests = this.getTests('all').filter((t) => t.id !== id);
        localStorage.setItem(TESTS_STORAGE_KEY, JSON.stringify(tests));
        resolve();
      }, 250);
    });
  },

  updateStatus(id: string, status: TestStatus): Promise<Test> {
    return this.updateTest(id, { status });
  }
};
