export type TestType = 'MCQ' | 'CODING';
export type TestStatus = 'available' | 'upcoming' | 'completed' | 'draft';

export interface McqOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface McqQuestion {
  id: string;
  order: number;
  question: string;
  options: McqOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  marks: number;
  explanation?: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  marks: number;
}

export interface CodingExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface CodingProblem {
  id: string;
  order: number;
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  examples: CodingExample[];
  allowedLanguages: string[];
  timeLimit: number; // in seconds
  memoryLimit: number; // in MB
  testCases: TestCase[];
  starterCode: Record<string, string>; // e.g. 'java': '...', 'python': '...'
}

export interface TestAccess {
  type: 'ALL' | 'SELECTED';
  selectedStudentIds?: string[];
  department?: string;
  branch?: string;
  semester?: string;
  section?: string;
}

export interface Test {
  id: string;
  title: string;
  subject: string;
  description: string;
  type: TestType;
  duration: number; // in minutes
  startTime: string;
  endTime: string;
  maxMarks: number;
  instructions: string[];
  questions?: McqQuestion[];
  problems?: CodingProblem[];
  access: TestAccess;
  status: TestStatus;
  createdByName: string;
  createdAt: string;
  participantsCount: number;
  submissionsCount: number;
}
