import { useMemo } from 'react';
import { useRouter } from '../../../lib/router';
import { resultService } from '../../../services/result.service';
import { Button } from '../../../components/ui/Button';
import { formatDate, formatTimeLeft } from '../../../lib/utils';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Award,
  Check,
  X,
  Code,
  FileText,
} from 'lucide-react';

export function StudentResultDetailPage({ resultId }: { resultId: string }) {
  const { navigate } = useRouter();

  const result = useMemo(() => {
    return resultService.getResultById(resultId) || resultService.getAllResults()[0];
  }, [resultId]);

  if (!result) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-lg max-w-lg mx-auto">
        <h2 className="text-sm font-semibold text-slate-900">Result Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">Unable to locate the specified evaluation report.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/student/results')}>
          Back to Results
        </Button>
      </div>
    );
  }

  const isMcq = result.testType === 'MCQ';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/student/results')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to All Results</span>
      </button>

      {/* Main Score Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-2xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded">
                {result.testType} TRANSCRIPT
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{result.subject}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {result.testTitle}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Candidate: <span className="font-medium text-slate-800 dark:text-slate-200">{result.studentName}</span> ({result.rollNumber})
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-3 sm:text-right shrink-0">
            <span className="text-2xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Score</span>
            <div className="font-mono text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {result.score} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ {result.maxMarks}</span>
            </div>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-mono">
              {result.percentage}% Marks
            </span>
          </div>
        </div>

        {/* Breakdown Stats Grid */}
        {isMcq ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block">Total Questions</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5 block">
                {result.totalQuestions || 20}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block">Attempted</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5 block">
                {result.attemptedQuestions || 20}
              </span>
            </div>

            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/40 rounded border border-emerald-200 dark:border-emerald-800">
              <span className="text-emerald-700 dark:text-emerald-400 block">Correct Answers</span>
              <span className="font-mono font-bold text-emerald-900 dark:text-emerald-300 text-sm mt-0.5 block flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {result.correctAnswers || 18}
              </span>
            </div>

            <div className="p-3 bg-red-50/50 dark:bg-red-950/40 rounded border border-red-200 dark:border-red-800">
              <span className="text-red-700 dark:text-red-400 block">Incorrect Answers</span>
              <span className="font-mono font-bold text-red-900 dark:text-red-300 text-sm mt-0.5 block flex items-center gap-1">
                <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                {result.incorrectAnswers || 2}
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block">Problems Solved</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5 block">
                {result.problemsSolved || 3} / {result.problemsAttempted || 3}
              </span>
            </div>

            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/40 rounded border border-emerald-200 dark:border-emerald-800">
              <span className="text-emerald-700 dark:text-emerald-400 block">Accepted Submissions</span>
              <span className="font-mono font-bold text-emerald-900 dark:text-emerald-300 text-sm mt-0.5 block">
                {result.acceptedSubmissions || 3}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block">Wrong Answers</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5 block">
                {result.wrongAnswerSubmissions || 0}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block">Runtime / Compile Errors</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5 block">
                {(result.compilationErrorSubmissions || 0) + (result.runtimeErrorSubmissions || 0)}
              </span>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Time Taken: <strong className="font-mono text-slate-700 dark:text-slate-200">{formatTimeLeft(result.timeTakenSeconds)}</strong></span>
          </div>
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Submitted: <strong className="text-slate-700 dark:text-slate-200">{formatDate(result.submissionTime)}</strong></span>
          </div>
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-slate-400" />
            <span>Status: <strong className="text-emerald-700 dark:text-emerald-400">{result.status}</strong></span>
          </div>
        </div>
      </div>

      {/* Item-by-Item Review Section */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {isMcq ? 'Detailed Question Review' : 'Problem Submissions Breakdown'}
        </h2>

        {isMcq ? (
          <div className="space-y-3">
            {(result.mcqBreakdown || []).map((q, idx) => (
              <div
                key={q.questionId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Q{idx + 1}.
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{q.question}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {q.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-2xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Correct (+{q.marksObtained})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-2xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded">
                        <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
                        Incorrect (0/{q.maxMarks})
                      </span>
                    )}
                  </div>
                </div>

                {/* Options List with Visual Feedback */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt) => {
                    const isSelected = q.selectedOption === opt.id;
                    const isCorrect = q.correctOption === opt.id;

                    let bg = 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-200';
                    if (isCorrect) {
                      bg = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 font-medium';
                    } else if (isSelected && !isCorrect) {
                      bg = 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-800 text-red-950 dark:text-red-200';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-2.5 rounded border text-xs flex items-center justify-between ${bg}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-2xs px-1.5 py-0.5 bg-white/70 dark:bg-slate-800 rounded border border-black/5 dark:border-white/10">
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                        {isCorrect && (
                          <span className="text-2xs text-emerald-700 dark:text-emerald-400 font-semibold ml-2">Correct Answer</span>
                        )}
                        {isSelected && !isCorrect && (
                          <span className="text-2xs text-red-700 dark:text-red-400 font-semibold ml-2">Your Answer</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {(result.codingBreakdown || []).map((prob, idx) => (
              <div
                key={prob.problemId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-mono text-2xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                      Problem {idx + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{prob.title}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-2xs text-slate-500 dark:text-slate-400">
                      {prob.passedCount}/{prob.totalTestCases} Tests Passed
                    </span>
                    <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                      {prob.status}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-2xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>Submitted Code ({prob.language.toUpperCase()})</span>
                    <span className="font-mono">Runtime: {prob.runtimeMs}ms</span>
                  </div>
                  <pre className="p-3 bg-slate-950 text-slate-200 rounded-md font-mono text-xs overflow-x-auto leading-relaxed max-h-60">
                    {prob.submittedCode}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
