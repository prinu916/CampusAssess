import { TestType } from './test.types';

export interface McqQuestionResult {
  questionId: string;
  order: number;
  question: string;
  options: { id: 'A' | 'B' | 'C' | 'D'; text: string }[];
  selectedOption?: 'A' | 'B' | 'C' | 'D';
  correctOption: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  marksObtained: number;
  maxMarks: number;
}

export interface CodingProblemResult {
  problemId: string;
  order: number;
  title: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Compilation Error' | 'Runtime Error' | 'Unattempted';
  passedCount: number;
  totalTestCases: number;
  language: string;
  submittedCode: string;
  score: number;
  maxMarks: number;
  runtimeMs: number;
  memoryMb: number;
}

export interface ProctoringEvent {
  id: string;
  timestamp: string;
  type: 'TAB_SWITCH' | 'WINDOW_BLUR' | 'COPY_ATTEMPT' | 'FULLSCREEN_EXIT' | 'CONTEXT_MENU' | 'DEVTOOLS_ATTEMPT';
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export interface TestResult {
  id: string;
  testId: string;
  testTitle: string;
  subject: string;
  testType: TestType;
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
  status: 'Evaluated' | 'Pending';
  // Proctoring audit
  suspiciousActivityCount?: number;
  proctoringEvents?: ProctoringEvent[];
  // MCQ specific
  totalQuestions?: number;
  attemptedQuestions?: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
  mcqBreakdown?: McqQuestionResult[];
  // Coding specific
  problemsAttempted?: number;
  problemsSolved?: number;
  acceptedSubmissions?: number;
  wrongAnswerSubmissions?: number;
  compilationErrorSubmissions?: number;
  runtimeErrorSubmissions?: number;
  codingBreakdown?: CodingProblemResult[];
}
