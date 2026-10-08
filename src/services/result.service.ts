import { TestResult, McqQuestionResult, CodingProblemResult, ProctoringEvent } from '../types/result.types';
import { testService } from './test.service';

const RESULTS_STORAGE_KEY = 'campusassess_results_store';

export const INITIAL_RESULTS: TestResult[] = [
  {
    id: 'res_01',
    testId: 'test_web_completed',
    testTitle: 'Web Technologies & Cloud Fundamentals',
    subject: 'Internet Architecture (CS306)',
    testType: 'MCQ',
    studentId: 'usr_student_01',
    studentName: 'Priyanshu Kumar',
    rollNumber: '21BCSE104',
    department: 'Department of Computer Science',
    section: 'A',
    score: 45,
    maxMarks: 50,
    percentage: 90,
    timeTakenSeconds: 1420,
    submissionTime: '2026-09-20T10:45:00Z',
    status: 'Evaluated',
    suspiciousActivityCount: 0,
    proctoringEvents: [],
    totalQuestions: 20,
    attemptedQuestions: 20,
    correctAnswers: 18,
    incorrectAnswers: 2,
    mcqBreakdown: [
      {
        questionId: 'q1',
        order: 1,
        question: 'Which of the following principles of OOP is illustrated by method overriding in Java?',
        options: [
          { id: 'A', text: 'Encapsulation' },
          { id: 'B', text: 'Runtime Polymorphism' },
          { id: 'C', text: 'Compile-time Polymorphism' },
          { id: 'D', text: 'Data Hiding' },
        ],
        selectedOption: 'B',
        correctOption: 'B',
        isCorrect: true,
        marksObtained: 2.5,
        maxMarks: 2.5,
      },
      {
        questionId: 'q2',
        order: 2,
        question: 'What is the default initial capacity and load factor of a standard java.util.HashMap?',
        options: [
          { id: 'A', text: 'Capacity: 16, Load Factor: 0.75' },
          { id: 'B', text: 'Capacity: 10, Load Factor: 0.50' },
          { id: 'C', text: 'Capacity: 32, Load Factor: 0.80' },
          { id: 'D', text: 'Capacity: 16, Load Factor: 1.00' },
        ],
        selectedOption: 'A',
        correctOption: 'A',
        isCorrect: true,
        marksObtained: 2.5,
        maxMarks: 2.5,
      },
    ],
  },
  {
    id: 'res_02',
    testId: 'test_java_mcq',
    testTitle: 'Java Programming',
    subject: 'Object-Oriented Programming (CS301)',
    testType: 'MCQ',
    studentId: 'usr_student_02',
    studentName: 'Ananya Sharma',
    rollNumber: '21BCSE105',
    department: 'Department of Computer Science',
    section: 'A',
    score: 47.5,
    maxMarks: 50,
    percentage: 95,
    timeTakenSeconds: 1530,
    submissionTime: '2026-10-08T04:15:00Z',
    status: 'Evaluated',
    suspiciousActivityCount: 0,
    proctoringEvents: [],
    totalQuestions: 20,
    attemptedQuestions: 20,
    correctAnswers: 19,
    incorrectAnswers: 1,
  },
  {
    id: 'res_03',
    testId: 'test_java_mcq',
    testTitle: 'Java Programming',
    subject: 'Object-Oriented Programming (CS301)',
    testType: 'MCQ',
    studentId: 'usr_student_03',
    studentName: 'Rohan Verma',
    rollNumber: '21BCSE108',
    department: 'Department of Computer Science',
    section: 'B',
    score: 37.5,
    maxMarks: 50,
    percentage: 75,
    timeTakenSeconds: 1710,
    submissionTime: '2026-10-08T05:22:00Z',
    status: 'Evaluated',
    suspiciousActivityCount: 2,
    proctoringEvents: [
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
    totalQuestions: 20,
    attemptedQuestions: 18,
    correctAnswers: 15,
    incorrectAnswers: 3,
  },
  {
    id: 'res_04',
    testId: 'test_java_mcq',
    testTitle: 'Java Programming',
    subject: 'Object-Oriented Programming (CS301)',
    testType: 'MCQ',
    studentId: 'usr_student_04',
    studentName: 'Sneha Patel',
    rollNumber: '21BCSE112',
    department: 'Department of Computer Science',
    section: 'A',
    score: 42.5,
    maxMarks: 50,
    percentage: 85,
    timeTakenSeconds: 1600,
    submissionTime: '2026-10-08T06:10:00Z',
    status: 'Evaluated',
    suspiciousActivityCount: 1,
    proctoringEvents: [
      {
        id: 'pe_03',
        timestamp: '2026-10-08T06:02:40Z',
        type: 'WINDOW_BLUR',
        severity: 'low',
        message: 'Window blur detected: Application minimized for 3 seconds.',
      },
    ],
    totalQuestions: 20,
    attemptedQuestions: 20,
    correctAnswers: 17,
    incorrectAnswers: 3,
  },
  {
    id: 'res_06',
    testId: 'test_java_mcq',
    testTitle: 'Java Programming',
    subject: 'Object-Oriented Programming (CS301)',
    testType: 'MCQ',
    studentId: 'usr_student_06',
    studentName: 'Tanvi Deshmukh',
    rollNumber: '21BCSE124',
    department: 'Department of Computer Science',
    section: 'B',
    score: 45,
    maxMarks: 50,
    percentage: 90,
    timeTakenSeconds: 1480,
    submissionTime: '2026-10-08T06:30:00Z',
    status: 'Evaluated',
    suspiciousActivityCount: 0,
    proctoringEvents: [],
    totalQuestions: 20,
    attemptedQuestions: 20,
    correctAnswers: 18,
    incorrectAnswers: 2,
  },
  {
    id: 'res_07',
    testId: 'test_java_mcq',
    testTitle: 'Java Programming',
    subject: 'Object-Oriented Programming (CS301)',
    testType: 'MCQ',
    studentId: 'usr_student_07',
    studentName: 'Aditya Gupta',
    rollNumber: '21BCSE131',
    department: 'Department of Electronics',
    section: 'A',
    score: 30,
    maxMarks: 50,
    percentage: 60,
    timeTakenSeconds: 1750,
    submissionTime: '2026-10-08T06:40:00Z',
    status: 'Evaluated',
    suspiciousActivityCount: 3,
    proctoringEvents: [
      {
        id: 'pe_04',
        timestamp: '2026-10-08T06:15:10Z',
        type: 'TAB_SWITCH',
        severity: 'high',
        message: 'Tab switch detected: Focus lost to external browser window for 8 seconds.',
      },
      {
        id: 'pe_05',
        timestamp: '2026-10-08T06:22:30Z',
        type: 'TAB_SWITCH',
        severity: 'high',
        message: 'Tab switch detected: Second focus loss for 21 seconds.',
      },
      {
        id: 'pe_06',
        timestamp: '2026-10-08T06:35:12Z',
        type: 'CONTEXT_MENU',
        severity: 'low',
        message: 'Right-click menu blocked on Question 14.',
      },
    ],
    totalQuestions: 20,
    attemptedQuestions: 17,
    correctAnswers: 12,
    incorrectAnswers: 5,
  },
  {
    id: 'res_08',
    testId: 'test_java_mcq',
    testTitle: 'Java Programming',
    subject: 'Object-Oriented Programming (CS301)',
    testType: 'MCQ',
    studentId: 'usr_student_08',
    studentName: 'Kartik Saxena',
    rollNumber: '21BCSE142',
    department: 'Department of Computer Science',
    section: 'A',
    score: 40,
    maxMarks: 50,
    percentage: 80,
    timeTakenSeconds: 1620,
    submissionTime: '2026-10-08T07:10:00Z',
    status: 'Evaluated',
    suspiciousActivityCount: 0,
    proctoringEvents: [],
    totalQuestions: 20,
    attemptedQuestions: 20,
    correctAnswers: 16,
    incorrectAnswers: 4,
  },
  {
    id: 'res_09',
    testId: 'test_java_mcq',
    testTitle: 'Java Programming',
    subject: 'Object-Oriented Programming (CS301)',
    testType: 'MCQ',
    studentId: 'usr_student_09',
    studentName: 'Bhavna Chawla',
    rollNumber: '21BCSE148',
    department: 'Department of Computer Science',
    section: 'B',
    score: 25,
    maxMarks: 50,
    percentage: 50,
    timeTakenSeconds: 1790,
    submissionTime: '2026-10-08T07:25:00Z',
    status: 'Evaluated',
    suspiciousActivityCount: 1,
    proctoringEvents: [
      {
        id: 'pe_07',
        timestamp: '2026-10-08T07:12:00Z',
        type: 'WINDOW_BLUR',
        severity: 'medium',
        message: 'Window focus lost for 6 seconds.',
      },
    ],
    totalQuestions: 20,
    attemptedQuestions: 15,
    correctAnswers: 10,
    incorrectAnswers: 5,
  },
  {
    id: 'res_05',
    testId: 'test_dsa_coding',
    testTitle: 'DSA Coding Challenge',
    subject: 'Data Structures & Algorithms (CS303)',
    testType: 'CODING',
    studentId: 'usr_student_05',
    studentName: 'Vikramaditya Nair',
    rollNumber: '21BCSE119',
    department: 'Department of Computer Science',
    section: 'A',
    score: 95,
    maxMarks: 100,
    percentage: 95,
    timeTakenSeconds: 2840,
    submissionTime: '2026-10-08T06:45:00Z',
    status: 'Evaluated',
    suspiciousActivityCount: 0,
    proctoringEvents: [],
    problemsAttempted: 3,
    problemsSolved: 3,
    acceptedSubmissions: 3,
    wrongAnswerSubmissions: 0,
    compilationErrorSubmissions: 0,
    runtimeErrorSubmissions: 0,
  },
];

export const resultService = {
  getAllResults(): TestResult[] {
    try {
      const stored = localStorage.getItem(RESULTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(INITIAL_RESULTS));
      return INITIAL_RESULTS;
    } catch {
      return INITIAL_RESULTS;
    }
  },

  getStudentResults(studentId: string = 'usr_student_01'): TestResult[] {
    const all = this.getAllResults();
    return all.filter((r) => r.studentId === studentId);
  },

  getResultById(id: string): TestResult | undefined {
    const all = this.getAllResults();
    return all.find((r) => r.id === id);
  },

  getFacultyTestResults(testId: string): TestResult[] {
    const all = this.getAllResults();
    return all.filter((r) => r.testId === testId);
  },

  submitMcqExam(
    testId: string,
    answers: Record<string, 'A' | 'B' | 'C' | 'D'>,
    timeTakenSeconds: number,
    studentInfo: { id: string; name: string; rollNumber: string; department: string; section: string },
    proctoringEvents: ProctoringEvent[] = []
  ): Promise<TestResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const test = testService.getTestById(testId);
        const questions = test?.questions || [];
        const total = questions.length;
        let attempted = 0;
        let correct = 0;
        let score = 0;

        const mcqBreakdown: McqQuestionResult[] = questions.map((q) => {
          const selected = answers[q.id];
          const isAnswered = !!selected;
          if (isAnswered) attempted++;
          const isCorrect = selected === q.correctAnswer;
          if (isCorrect) {
            correct++;
            score += q.marks;
          }
          return {
            questionId: q.id,
            order: q.order,
            question: q.question,
            options: q.options,
            selectedOption: selected,
            correctOption: q.correctAnswer,
            isCorrect,
            marksObtained: isCorrect ? q.marks : 0,
            maxMarks: q.marks,
          };
        });

        const maxMarks = test?.maxMarks || total * 2.5;
        const percentage = Math.round((score / maxMarks) * 100);

        const newResult: TestResult = {
          id: `res_${Date.now()}`,
          testId,
          testTitle: test?.title || 'MCQ Assessment',
          subject: test?.subject || 'Examination',
          testType: 'MCQ',
          studentId: studentInfo.id,
          studentName: studentInfo.name,
          rollNumber: studentInfo.rollNumber,
          department: studentInfo.department,
          section: studentInfo.section,
          score,
          maxMarks,
          percentage,
          timeTakenSeconds,
          submissionTime: new Date().toISOString(),
          status: 'Evaluated',
          suspiciousActivityCount: proctoringEvents.length,
          proctoringEvents,
          totalQuestions: total,
          attemptedQuestions: attempted,
          correctAnswers: correct,
          incorrectAnswers: attempted - correct,
          mcqBreakdown,
        };

        const all = this.getAllResults();
        const updated = [newResult, ...all];
        localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(updated));
        resolve(newResult);
      }, 500);
    });
  },

  submitCodingExam(
    testId: string,
    problemSubmissions: Record<string, { code: string; language: string; passedCount: number; totalCount: number; status: string; score: number }>,
    timeTakenSeconds: number,
    studentInfo: { id: string; name: string; rollNumber: string; department: string; section: string },
    proctoringEvents: ProctoringEvent[] = []
  ): Promise<TestResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const test = testService.getTestById(testId);
        const problems = test?.problems || [];
        let totalScore = 0;
        let problemsSolved = 0;
        let problemsAttempted = 0;
        let acceptedCount = 0;
        let wrongCount = 0;

        const codingBreakdown: CodingProblemResult[] = problems.map((p) => {
          const sub = problemSubmissions[p.id];
          const hasAttempted = !!sub && sub.code.trim().length > 0;
          if (hasAttempted) problemsAttempted++;

          const isAccepted = sub?.status === 'Accepted' || (sub?.passedCount === p.testCases.length);
          if (isAccepted) {
            problemsSolved++;
            acceptedCount++;
          } else if (hasAttempted) {
            wrongCount++;
          }

          const probScore = sub?.score ?? (isAccepted ? 35 : Math.round(((sub?.passedCount || 0) / p.testCases.length) * 35));
          totalScore += probScore;

          return {
            problemId: p.id,
            order: p.order,
            title: p.title,
            status: (sub?.status as any) || (hasAttempted ? 'Wrong Answer' : 'Unattempted'),
            passedCount: sub?.passedCount || 0,
            totalTestCases: p.testCases.length,
            language: sub?.language || 'java',
            submittedCode: sub?.code || p.starterCode?.java || '',
            score: probScore,
            maxMarks: 35,
            runtimeMs: 42,
            memoryMb: 18.4,
          };
        });

        const maxMarks = test?.maxMarks || 100;
        const percentage = Math.min(100, Math.round((totalScore / maxMarks) * 100));

        const newResult: TestResult = {
          id: `res_${Date.now()}`,
          testId,
          testTitle: test?.title || 'Coding Assessment',
          subject: test?.subject || 'Examination',
          testType: 'CODING',
          studentId: studentInfo.id,
          studentName: studentInfo.name,
          rollNumber: studentInfo.rollNumber,
          department: studentInfo.department,
          section: studentInfo.section,
          score: totalScore,
          maxMarks,
          percentage,
          timeTakenSeconds,
          submissionTime: new Date().toISOString(),
          status: 'Evaluated',
          suspiciousActivityCount: proctoringEvents.length,
          proctoringEvents,
          problemsAttempted,
          problemsSolved,
          acceptedSubmissions: acceptedCount,
          wrongAnswerSubmissions: wrongCount,
          compilationErrorSubmissions: 0,
          runtimeErrorSubmissions: 0,
          codingBreakdown,
        };

        const all = this.getAllResults();
        const updated = [newResult, ...all];
        localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(updated));
        resolve(newResult);
      }, 600);
    });
  }
};
