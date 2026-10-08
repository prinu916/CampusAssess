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
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Send,
  Save,
} from 'lucide-react';

export function McqExamPage({
  testId,
  isPreview = false,
}: {
  testId: string;
  isPreview?: boolean;
}) {
  const { navigate } = useRouter();
  const { user } = useAuth();

  const test = useMemo(() => {
    return testService.getTestById(testId) || testService.getTests('all')[0];
  }, [testId]);

  const questions = useMemo(() => {
    return test?.questions || [];
  }, [test]);

  const totalQuestions = questions.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');

  // Modals state
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdResultId, setCreatedResultId] = useState<string | null>(null);
  const [recordedEvents, setRecordedEvents] = useState<ProctoringEvent[]>([]);

  // Auto-submit simulation on timer expiration
  const handleTimeout = useCallback(() => {
    setShowTimeoutModal(true);
    // Execute auto-submit
    setTimeout(async () => {
      const studentInfo = {
        id: user?.id || 'usr_student_01',
        name: user?.name || 'Priyanshu Kumar',
        rollNumber: '21BCSE104',
        department: 'Department of Computer Science',
        section: 'A',
      };
      const res = await resultService.submitMcqExam(
        test.id,
        selectedAnswers,
        test.duration * 60,
        studentInfo,
        recordedEvents
      );
      setCreatedResultId(res.id);
      setIsSubmitted(true);
    }, 1500);
  }, [test, selectedAnswers, user, recordedEvents]);

  const { formattedTime, isWarning, timeSpentSeconds, stopTimer, secondsRemaining } = useExamTimer({
    durationMinutes: test.duration,
    onTimeout: handleTimeout,
    warningThresholdSeconds: 300,
  });

  const currentQuestion = questions[currentIndex] || questions[0];

  const handleSelectOption = (optionId: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitted) return;
    const newAnswers = { ...selectedAnswers, [currentQuestion.id]: optionId };
    setSelectedAnswers(newAnswers);

    // Simulate autosave
    setIsAutoSaving(true);
    setTimeout(() => {
      setIsAutoSaving(false);
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 300);
  };

  const handleClearAnswer = () => {
    if (isSubmitted) return;
    const next = { ...selectedAnswers };
    delete next[currentQuestion.id];
    setSelectedAnswers(next);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleManualSubmit = async () => {
    stopTimer();
    setIsSubmitting(true);
    const studentInfo = {
      id: user?.id || 'usr_student_01',
      name: user?.name || 'Priyanshu Kumar',
      rollNumber: '21BCSE104',
      department: 'Department of Computer Science',
      section: 'A',
    };

    const res = await resultService.submitMcqExam(
      test.id,
      selectedAnswers,
      timeSpentSeconds,
      studentInfo,
      recordedEvents
    );

    setIsSubmitting(false);
    setShowConfirmSubmit(false);
    setCreatedResultId(res.id);
    setIsSubmitted(true);
  };

  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans select-none transition-colors">
      {/* PREVIEW BANNER (IF IN FACULTY PREVIEW MODE) */}
      {isPreview && (
        <div className="bg-amber-600 text-white text-xs py-1 px-4 text-center font-semibold tracking-wider uppercase sticky top-0 z-50 flex items-center justify-center gap-2">
          <span>PREVIEW MODE — Faculty Inspection View</span>
          <button
            onClick={() => navigate('/faculty/tests')}
            className="underline ml-4 hover:opacity-80"
          >
            Exit Preview
          </button>
        </div>
      )}

      {/* TOP EXAM BAR (Strict No Dashboard Navigation) */}
      <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        {/* Left: Test title & subject */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-red-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
            MCQ
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {test.title}
            </h1>
            <p className="text-2xs text-slate-500 dark:text-slate-400 font-mono">
              Question {currentIndex + 1} of {totalQuestions}
            </p>
          </div>
        </div>

        {/* Center: Live Autosave indicator */}
        <div className="hidden md:flex items-center gap-2 text-2xs text-slate-500 dark:text-slate-400">
          <Save className="w-3.5 h-3.5 text-slate-400" />
          <span>{isAutoSaving ? 'Saving answer...' : `Auto-saved at ${lastSavedTime}`}</span>
        </div>

        {/* Right: Timer & Submit Action */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md border font-mono font-bold text-sm tabular-nums transition-colors',
              isWarning
                ? 'bg-red-50 dark:bg-red-950/80 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 animate-pulse'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
            )}
          >
            <Clock className={cn('w-4 h-4', isWarning ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400')} />
            <span>{formattedTime}</span>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowConfirmSubmit(true)}
            disabled={isSubmitted}
            className="text-xs font-semibold"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Submit Test
          </Button>
        </div>
      </header>

      {/* DYNAMIC PROGRESS BAR FOR REMAINING TIME & QUESTIONS STATUS */}
      <ExamProgressBar
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        currentQuestionNumber={currentIndex + 1}
        durationMinutes={test.duration}
        secondsRemaining={secondsRemaining}
        formattedTime={formattedTime}
        isWarning={isWarning}
        examType="MCQ"
      />

      {/* MAIN EXAM BODY */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
        {/* Question Content Viewport */}
        <main className="flex-1 flex flex-col justify-between bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
          <div className="space-y-6">
            {/* Question Header & Marks */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="font-mono text-xs font-semibold text-slate-500 uppercase">
                Question {currentIndex + 1}
              </span>
              <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded font-medium">
                {currentQuestion.marks} Marks
              </span>
            </div>

            {/* Question Text */}
            <div className="text-base font-medium text-slate-900 leading-relaxed">
              {currentQuestion.question}
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedAnswers[currentQuestion.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id)}
                    disabled={isSubmitted}
                    className={cn(
                      'w-full p-4 rounded-md border text-left text-sm flex items-start gap-3 transition-colors',
                      isSelected
                        ? 'border-red-700 bg-red-50/50 text-slate-900 ring-1 ring-red-700'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    )}
                  >
                    <span
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5',
                        isSelected
                          ? 'bg-red-700 text-white'
                          : 'border border-slate-300 text-slate-600 bg-slate-50'
                      )}
                    >
                      {opt.id}
                    </span>
                    <span className="flex-1 leading-normal pt-0.5">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Question Controls */}
          <div className="pt-6 mt-8 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentIndex === 0 || isSubmitted}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              {selectedAnswers[currentQuestion.id] && (
                <button
                  type="button"
                  onClick={handleClearAnswer}
                  disabled={isSubmitted}
                  className="text-xs text-slate-500 hover:text-red-700 ml-2"
                >
                  Clear Choice
                </button>
              )}
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === totalQuestions - 1 || isSubmitted}
              className="gap-1 text-xs"
            >
              Save & Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </main>

        {/* Right Palette / Navigation Drawer */}
        <aside className="w-full lg:w-80 shrink-0 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Question Palette
            </h2>

            {/* Answered Progress Summary */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Progress:</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {answeredCount} / {totalQuestions} Answered
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-red-700 h-full transition-all duration-300"
                  style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-2xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300 shrink-0" />
                <span>Unanswered ({totalQuestions - answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border-2 border-red-700 shrink-0" />
                <span>Current Question</span>
              </div>
            </div>

            {/* Question Selector Numbers */}
            <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-100 max-h-72 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!selectedAnswers[q.id];

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    disabled={isSubmitted}
                    className={cn(
                      'h-9 rounded font-mono text-xs font-semibold flex items-center justify-center transition-colors',
                      isCurrent
                        ? 'ring-2 ring-red-700 font-bold'
                        : '',
                      isAnswered
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secure mode reminder */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-2xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Proctoring mode active. Do not switch tabs.</span>
          </div>
        </aside>
      </div>

      {/* CONFIRM SUBMISSION MODAL */}
      <Modal
        isOpen={showConfirmSubmit}
        onClose={() => setShowConfirmSubmit(false)}
        title="Submit Test?"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-700 leading-relaxed">
            You have answered <span className="font-mono font-bold text-slate-900">{answeredCount}</span> of{' '}
            <span className="font-mono font-bold text-slate-900">{totalQuestions}</span> questions.
          </p>

          {answeredCount < totalQuestions && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                You have {totalQuestions - answeredCount} unanswered questions remaining. You can go back and review your responses.
              </span>
            </div>
          )}

          <p className="text-slate-500">
            Once submitted, you cannot modify your answers or return to the exam session.
          </p>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmSubmit(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleManualSubmit}
              isLoading={isSubmitting}
              className="font-semibold"
            >
              Submit Test
            </Button>
          </div>
        </div>
      </Modal>

      {/* TIMEOUT AUTO-SUBMIT MODAL */}
      <Modal
        isOpen={showTimeoutModal && !isSubmitted}
        onClose={() => {}}
        title="Time Expired"
        maxWidth="md"
      >
        <div className="space-y-3 text-xs text-center py-2">
          <Clock className="w-10 h-10 text-red-600 mx-auto animate-pulse" />
          <h2 className="text-sm font-bold text-slate-900">Exam Window Concluded</h2>
          <p className="text-slate-600">
            The allocated duration for this assessment has reached 00:00. Your saved answers are being automatically finalized and submitted.
          </p>
        </div>
      </Modal>

      {/* SUBMISSION SUCCESS MODAL */}
      <Modal
        isOpen={isSubmitted}
        onClose={() => {}}
        title="Submission Successful"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-center py-2">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Your test has been submitted successfully</h2>
            <p className="text-slate-500 mt-1">
              Your responses have been recorded and graded. You can now review your score and question breakdown.
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
      {!isSubmitted && (
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
