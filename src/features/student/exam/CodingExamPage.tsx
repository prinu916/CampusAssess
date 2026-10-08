import { useState, useMemo, useCallback } from 'react';
import { useRouter } from '../../../lib/router';
import { useAuth } from '../../../hooks/useAuth';
import { testService } from '../../../services/test.service';
import { resultService } from '../../../services/result.service';
import { useExamTimer } from '../../../hooks/useExamTimer';
import { ProctoringAssistant } from '../../../components/exam/ProctoringAssistant';
import { ExamProgressBar } from '../../../components/exam/ExamProgressBar';
import { ProctoringEvent } from '../../../types/result.types';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { cn } from '../../../lib/utils';
import {
  Clock,
  Play,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Terminal,
  FileCode,
  Check,
} from 'lucide-react';

export function CodingExamPage({
  testId,
  isPreview = false,
}: {
  testId: string;
  isPreview?: boolean;
}) {
  const { navigate } = useRouter();
  const { user } = useAuth();

  const test = useMemo(() => {
    return testService.getTestById(testId) || testService.getTests('all')[1];
  }, [testId]);

  const problems = useMemo(() => {
    return test?.problems || [];
  }, [test]);

  const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
  const currentProblem = problems[currentProblemIdx] || problems[0];

  const [selectedLanguage, setSelectedLanguage] = useState<string>('java');
  const [codeByProblemAndLang, setCodeByProblemAndLang] = useState<Record<string, Record<string, string>>>(() => {
    const initial: Record<string, Record<string, string>> = {};
    problems.forEach((p) => {
      initial[p.id] = { ...p.starterCode };
    });
    return initial;
  });

  // Code editor text
  const currentCode =
    codeByProblemAndLang[currentProblem?.id]?.[selectedLanguage] ||
    currentProblem?.starterCode?.[selectedLanguage] ||
    '';

  const handleCodeChange = (newCode: string) => {
    setCodeByProblemAndLang((prev) => ({
      ...prev,
      [currentProblem.id]: {
        ...prev[currentProblem.id],
        [selectedLanguage]: newCode,
      },
    }));
  };

  const handleResetCode = () => {
    const defaultCode = currentProblem.starterCode[selectedLanguage] || '';
    handleCodeChange(defaultCode);
  };

  // Execution & Output State
  const [activeTabOutput, setActiveTabOutput] = useState<'testcases' | 'console'>('testcases');
  const [isRunning, setIsRunning] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [runResults, setRunResults] = useState<{
    status: 'success' | 'failed' | 'idle';
    cases: Array<{ id: string; input: string; expected: string; actual: string; passed: boolean }>;
    runtimeMs: number;
    stdout: string;
  }>({
    status: 'idle',
    cases: [],
    runtimeMs: 0,
    stdout: '',
  });

  // Track per-problem submission results
  const [problemVerdicts, setProblemVerdicts] = useState<
    Record<string, { status: string; passedCount: number; totalCount: number; score: number }>
  >({});

  // Modals state
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [isFinalSubmitting, setIsFinalSubmitting] = useState(false);
  const [isFinalSubmitted, setIsFinalSubmitted] = useState(false);
  const [createdResultId, setCreatedResultId] = useState<string | null>(null);
  const [recordedEvents, setRecordedEvents] = useState<ProctoringEvent[]>([]);

  // Auto-submit simulation on timer expiration
  const handleTimeout = useCallback(() => {
    setShowTimeoutModal(true);
    setTimeout(async () => {
      const studentInfo = {
        id: user?.id || 'usr_student_01',
        name: user?.name || 'Priyanshu Kumar',
        rollNumber: '21BCSE104',
        department: 'Department of Computer Science',
        section: 'A',
      };

      const submissions: any = {};
      problems.forEach((p) => {
        const v = problemVerdicts[p.id];
        submissions[p.id] = {
          code: codeByProblemAndLang[p.id]?.[selectedLanguage] || '',
          language: selectedLanguage,
          passedCount: v?.passedCount || 0,
          totalCount: p.testCases.length,
          status: v?.status || 'Unattempted',
          score: v?.score || 0,
        };
      });

      const res = await resultService.submitCodingExam(
        test.id,
        submissions,
        test.duration * 60,
        studentInfo,
        recordedEvents
      );
      setCreatedResultId(res.id);
      setIsFinalSubmitted(true);
    }, 1500);
  }, [test, problems, problemVerdicts, codeByProblemAndLang, selectedLanguage, user, recordedEvents]);

  const { formattedTime, isWarning, timeSpentSeconds, stopTimer, secondsRemaining } = useExamTimer({
    durationMinutes: test.duration,
    onTimeout: handleTimeout,
    warningThresholdSeconds: 300,
  });

  // Run visible sample test cases
  const handleRunCode = () => {
    setIsRunning(true);
    setActiveTabOutput('testcases');
    setTimeout(() => {
      const visibleCases = currentProblem.testCases.filter((tc) => !tc.isHidden);
      const executed = visibleCases.map((tc) => ({
        id: tc.id,
        input: tc.input,
        expected: tc.expectedOutput,
        actual: tc.expectedOutput, // simulated exact match
        passed: true,
      }));

      setRunResults({
        status: 'success',
        cases: executed,
        runtimeMs: 46,
        stdout: 'Compilation successful.\nAll sample inputs executed within time limit.',
      });
      setIsRunning(false);
    }, 700);
  };

  // Submit solution for current problem
  const handleSubmitProblem = () => {
    setIsEvaluating(true);
    setActiveTabOutput('testcases');
    setTimeout(() => {
      const allCases = currentProblem.testCases;
      const executed = allCases.map((tc) => ({
        id: tc.id,
        input: tc.isHidden ? '[Hidden Test Case]' : tc.input,
        expected: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
        actual: tc.isHidden ? '[Hidden Output Matched]' : tc.expectedOutput,
        passed: true,
      }));

      setRunResults({
        status: 'success',
        cases: executed,
        runtimeMs: 52,
        stdout: 'All evaluation test cases passed (including hidden constraints).',
      });

      setProblemVerdicts((prev) => ({
        ...prev,
        [currentProblem.id]: {
          status: 'Accepted',
          passedCount: allCases.length,
          totalCount: allCases.length,
          score: Math.round(test.maxMarks / problems.length),
        },
      }));

      setIsEvaluating(false);
    }, 900);
  };

  // Final Exam submission
  const handleFinalSubmit = async () => {
    stopTimer();
    setIsFinalSubmitting(true);
    const studentInfo = {
      id: user?.id || 'usr_student_01',
      name: user?.name || 'Priyanshu Kumar',
      rollNumber: '21BCSE104',
      department: 'Department of Computer Science',
      section: 'A',
    };

    const submissions: any = {};
    problems.forEach((p) => {
      const v = problemVerdicts[p.id];
      submissions[p.id] = {
        code: codeByProblemAndLang[p.id]?.[selectedLanguage] || '',
        language: selectedLanguage,
        passedCount: v?.passedCount || 0,
        totalCount: p.testCases.length,
        status: v?.status || (v?.passedCount ? 'Accepted' : 'Unattempted'),
        score: v?.score || 0,
      };
    });

    const res = await resultService.submitCodingExam(
      test.id,
      submissions,
      timeSpentSeconds,
      studentInfo,
      recordedEvents
    );

    setIsFinalSubmitting(false);
    setShowConfirmSubmit(false);
    setCreatedResultId(res.id);
    setIsFinalSubmitted(true);
  };

  const solvedProblemsCount = Object.values(problemVerdicts).filter((v) => v.status === 'Accepted').length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none">
      {/* PREVIEW BANNER */}
      {isPreview && (
        <div className="bg-amber-600 text-white text-xs py-1 px-4 text-center font-semibold tracking-wider uppercase sticky top-0 z-50 flex items-center justify-center gap-2">
          <span>PREVIEW MODE — Faculty Coding Inspection</span>
          <button
            onClick={() => navigate('/faculty/tests')}
            className="underline ml-4 hover:opacity-80"
          >
            Exit Preview
          </button>
        </div>
      )}

      {/* TOP CODING BAR */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-red-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
            IDE
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">
              {test.title}
            </h1>
            <p className="text-2xs text-slate-400">
              Problems Solved: {solvedProblemsCount} / {problems.length}
            </p>
          </div>
        </div>

        {/* Problem Selector Pills */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {problems.map((p, idx) => {
            const isCurrent = idx === currentProblemIdx;
            const isAccepted = problemVerdicts[p.id]?.status === 'Accepted';

            return (
              <button
                key={p.id}
                onClick={() => setCurrentProblemIdx(idx)}
                className={cn(
                  'px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5',
                  isCurrent
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <span>P{idx + 1}</span>
                {isAccepted && <Check className="w-3 h-3 text-emerald-300" />}
              </button>
            );
          })}
        </div>

        {/* Timer & Submit Exam */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md border font-mono font-bold text-sm tabular-nums',
              isWarning
                ? 'bg-red-950/80 border-red-500 text-red-400 animate-pulse'
                : 'bg-slate-900 border-slate-700 text-slate-200'
            )}
          >
            <Clock className={cn('w-4 h-4', isWarning ? 'text-red-400' : 'text-slate-400')} />
            <span>{formattedTime}</span>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowConfirmSubmit(true)}
            className="text-xs font-semibold"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Submit Assessment
          </Button>
        </div>
      </header>

      {/* DYNAMIC PROGRESS BAR FOR REMAINING TIME & PROBLEM STATUS */}
      <ExamProgressBar
        totalQuestions={problems.length}
        answeredCount={solvedProblemsCount}
        currentQuestionNumber={currentProblemIdx + 1}
        durationMinutes={test.duration}
        secondsRemaining={secondsRemaining}
        formattedTime={formattedTime}
        isWarning={isWarning}
        examType="CODING"
      />

      {/* 2-COLUMN CODING ASSESSMENT WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[calc(100vh-3.5rem)]">
        {/* LEFT COLUMN: Problem Statement */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 overflow-y-auto bg-slate-900 border-r border-slate-800 space-y-6">
          {/* Problem Header */}
          <div className="space-y-1.5 pb-4 border-b border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-2xs uppercase tracking-wider text-red-400 font-semibold">
                Problem {currentProblem.order} of {problems.length}
              </span>
              <span className="font-mono text-xs text-slate-400">
                Time Limit: {currentProblem.timeLimit}s · Mem: {currentProblem.memoryLimit}MB
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {currentProblem.title}
            </h2>
          </div>

          {/* Problem Statement Markdown */}
          <div className="text-xs text-slate-300 space-y-3 leading-relaxed whitespace-pre-line">
            {currentProblem.description}
          </div>

          {/* Input & Output Format */}
          <div className="space-y-3 text-xs">
            <div>
              <h3 className="font-semibold text-slate-200 mb-1">Input Format</h3>
              <p className="text-slate-400 whitespace-pre-line leading-relaxed font-mono text-2xs bg-slate-950 p-2.5 rounded border border-slate-800">
                {currentProblem.inputFormat}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-200 mb-1">Output Format</h3>
              <p className="text-slate-400 whitespace-pre-line leading-relaxed font-mono text-2xs bg-slate-950 p-2.5 rounded border border-slate-800">
                {currentProblem.outputFormat}
              </p>
            </div>
          </div>

          {/* Constraints */}
          <div className="space-y-1.5 text-xs">
            <h3 className="font-semibold text-slate-200">Constraints</h3>
            <pre className="p-3 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono text-2xs whitespace-pre-line leading-relaxed">
              {currentProblem.constraints}
            </pre>
          </div>

          {/* Sample Examples */}
          <div className="space-y-3 text-xs pt-2">
            <h3 className="font-semibold text-slate-200">Sample Test Cases</h3>
            {currentProblem.examples.map((ex, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2"
              >
                <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">
                  Example {idx + 1}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs font-mono">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Input:</span>
                    <pre className="p-2 bg-slate-900 border border-slate-800 rounded text-slate-300 overflow-x-auto">
                      {ex.input}
                    </pre>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Output:</span>
                    <pre className="p-2 bg-slate-900 border border-slate-800 rounded text-slate-300 overflow-x-auto">
                      {ex.output}
                    </pre>
                  </div>
                </div>
                {ex.explanation && (
                  <p className="text-slate-400 text-2xs mt-1 italic">
                    Explanation: {ex.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Code Editor & Execution Panel */}
        <div className="w-full lg:w-1/2 flex flex-col bg-slate-950 overflow-hidden">
          {/* Editor Header Bar */}
          <div className="h-11 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-slate-400" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-slate-800 text-white text-xs border border-slate-700 rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
              >
                <option value="java">Java (OpenJDK 17)</option>
                <option value="python">Python 3.10</option>
                <option value="cpp">C++ (GCC 11)</option>
                <option value="javascript">JavaScript (Node.js 18)</option>
              </select>
            </div>

            <button
              onClick={handleResetCode}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
              title="Reset starter template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* IDE Textarea Code Editor */}
          <div className="flex-1 relative bg-slate-950 font-mono text-xs min-h-[300px]">
            <textarea
              value={currentCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              spellCheck={false}
              className="w-full h-full p-4 bg-slate-950 text-slate-200 resize-none font-mono text-xs leading-relaxed focus:outline-none focus:ring-0 border-0 selection:bg-red-900/60"
              placeholder="Write your solution here..."
            />
          </div>

          {/* Bottom Execution Bar */}
          <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              {problemVerdicts[currentProblem.id]?.status === 'Accepted' && (
                <span className="text-2xs text-emerald-400 font-mono font-semibold flex items-center gap-1 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Problem Accepted
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRunCode}
                isLoading={isRunning}
                disabled={isEvaluating}
                className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white text-xs gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Run Code</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitProblem}
                isLoading={isEvaluating}
                disabled={isRunning}
                className="text-xs gap-1.5 font-semibold"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Submit Solution</span>
              </Button>
            </div>
          </div>

          {/* Execution Output Panel (Collapsible/Tabs) */}
          <div className="h-56 bg-slate-900 border-t border-slate-800 flex flex-col shrink-0">
            <div className="flex items-center justify-between px-4 h-9 bg-slate-950/80 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTabOutput('testcases')}
                  className={cn(
                    'font-medium text-xs py-1 transition-colors',
                    activeTabOutput === 'testcases' ? 'text-red-400 border-b-2 border-red-500 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  Test Cases ({runResults.cases.length})
                </button>
                <button
                  onClick={() => setActiveTabOutput('console')}
                  className={cn(
                    'font-medium text-xs py-1 transition-colors flex items-center gap-1',
                    activeTabOutput === 'console' ? 'text-red-400 border-b-2 border-red-500 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  <Terminal className="w-3 h-3" />
                  <span>Compiler Output</span>
                </button>
              </div>

              {runResults.runtimeMs > 0 && (
                <span className="font-mono text-2xs text-slate-400 tabular-nums">
                  Execution Time: {runResults.runtimeMs}ms
                </span>
              )}
            </div>

            <div className="p-3 overflow-y-auto flex-1 font-mono text-xs">
              {activeTabOutput === 'testcases' ? (
                runResults.cases.length === 0 ? (
                  <p className="text-slate-500 text-2xs italic pt-4 text-center font-sans">
                    Click "Run Code" or "Submit Solution" to evaluate your solution.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {runResults.cases.map((tc, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-2xs"
                      >
                        <div className="flex items-center gap-2">
                          {tc.passed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          )}
                          <span className="font-semibold text-slate-300">
                            Test Case #{idx + 1}: {tc.passed ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                        <div className="text-slate-500 font-mono text-3xs">
                          Input: {tc.input}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <pre className="text-2xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {runResults.stdout || 'No compilation output recorded.'}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRM ASSESSMENT SUBMIT MODAL */}
      <Modal
        isOpen={showConfirmSubmit}
        onClose={() => setShowConfirmSubmit(false)}
        title="Submit Coding Assessment?"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-slate-800">
          <p className="text-slate-700 leading-relaxed">
            You have solved <span className="font-mono font-bold text-slate-900">{solvedProblemsCount}</span> of{' '}
            <span className="font-mono font-bold text-slate-900">{problems.length}</span> problems.
          </p>

          {solvedProblemsCount < problems.length && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                You have {problems.length - solvedProblemsCount} unsolved problems. You may continue coding or submit your current progress.
              </span>
            </div>
          )}

          <p className="text-slate-500">
            Once submitted, your code submissions are finalized and graded against the full benchmark test suites.
          </p>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmSubmit(false)}
            >
              Continue Working
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleFinalSubmit}
              isLoading={isFinalSubmitting}
              className="font-semibold"
            >
              Submit Assessment
            </Button>
          </div>
        </div>
      </Modal>

      {/* TIMEOUT MODAL */}
      <Modal
        isOpen={showTimeoutModal && !isFinalSubmitted}
        onClose={() => {}}
        title="Time Expired"
        maxWidth="md"
      >
        <div className="space-y-3 text-xs text-center py-2 text-slate-800">
          <Clock className="w-10 h-10 text-red-600 mx-auto animate-pulse" />
          <h2 className="text-sm font-bold text-slate-900">Coding Time Concluded</h2>
          <p className="text-slate-600">
            The timer has concluded. Your current editor solutions are being evaluated and auto-submitted.
          </p>
        </div>
      </Modal>

      {/* SUCCESS MODAL */}
      <Modal
        isOpen={isFinalSubmitted}
        onClose={() => {}}
        title="Assessment Submitted"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-center py-2 text-slate-800">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Your coding assessment has been submitted!</h2>
            <p className="text-slate-500 mt-1">
              Test case execution and runtime evaluations have been completed.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                if (createdResultId) {
                  navigate(`/student/results/${createdResultId}`);
                } else {
                  navigate('/student/results');
                }
              }}
              className="font-semibold"
            >
              View Result
            </Button>
          </div>
        </div>
      </Modal>

      {/* Proctoring Assistant Live Detection Overlay */}
      {!isFinalSubmitted && (
        <ProctoringAssistant
          testId={test.id}
          studentId={user?.id || 'usr_student_01'}
          studentName={user?.name || 'Priyanshu Kumar'}
          maxAllowedViolations={3}
          onEventsChange={setRecordedEvents}
        />
      )}
    </div>
  );
}
