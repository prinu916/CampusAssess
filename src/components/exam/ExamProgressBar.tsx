import React from 'react';
import { Clock, CheckCircle2, AlertCircle, HelpCircle, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ExamProgressBarProps {
  totalQuestions: number;
  answeredCount: number;
  currentQuestionNumber?: number;
  durationMinutes: number;
  secondsRemaining: number;
  formattedTime: string;
  isWarning: boolean;
  examType?: 'MCQ' | 'CODING';
  flaggedCount?: number;
  className?: string;
}

export function ExamProgressBar({
  totalQuestions,
  answeredCount,
  currentQuestionNumber,
  durationMinutes,
  secondsRemaining,
  formattedTime,
  isWarning,
  examType = 'MCQ',
  flaggedCount = 0,
  className,
}: ExamProgressBarProps) {
  // Safe math calculations
  const safeTotal = Math.max(1, totalQuestions);
  const completionPercentage = Math.min(100, Math.max(0, Math.round((answeredCount / safeTotal) * 100)));
  
  const totalSeconds = Math.max(1, durationMinutes * 60);
  const timeRemainingPercentage = Math.min(100, Math.max(0, Math.round((secondsRemaining / totalSeconds) * 100)));
  const timeElapsedPercentage = 100 - timeRemainingPercentage;

  // Determine time status theme
  let timeTheme = {
    barColor: 'bg-emerald-500 dark:bg-emerald-400',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
    pulse: false,
    label: 'Normal',
  };

  if (isWarning || timeRemainingPercentage <= 20 || secondsRemaining <= 300) {
    timeTheme = {
      barColor: 'bg-red-600 dark:bg-red-500 animate-pulse',
      badgeBg: 'bg-red-50 dark:bg-red-950/80 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 ring-2 ring-red-400/40',
      pulse: true,
      label: 'Urgent',
    };
  } else if (timeRemainingPercentage <= 40) {
    timeTheme = {
      barColor: 'bg-amber-500 dark:bg-amber-400',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/70 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
      pulse: false,
      label: 'Low',
    };
  }

  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  return (
    <div
      className={cn(
        'w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 shadow-2xs transition-colors',
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* LEFT: Questions Completion Meter */}
        <div className="flex-1 space-y-1.5 min-w-[280px]">
          <div className="flex items-center justify-between font-medium">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
              <span>
                {examType === 'MCQ' ? 'Question Completion' : 'Problems Solved'}:
              </span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                {answeredCount} of {totalQuestions}
              </span>
              <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-2xs rounded font-mono font-semibold">
                {completionPercentage}%
              </span>
            </div>

            {currentQuestionNumber && (
              <span className="text-2xs text-slate-500 dark:text-slate-400 font-mono">
                Viewing: #{currentQuestionNumber}
              </span>
            )}
          </div>

          {/* Question completion progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative border border-slate-200/80 dark:border-slate-700/80">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-500 dark:to-rose-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${completionPercentage}%` }}
              role="progressbar"
              aria-valuenow={completionPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {/* Completion summary badges */}
          <div className="flex items-center gap-3 text-2xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              {answeredCount} Answered
            </span>
            <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <HelpCircle className="w-3 h-3" />
              {unansweredCount} Unanswered
            </span>
            {flaggedCount > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <AlertCircle className="w-3 h-3" />
                {flaggedCount} Marked
              </span>
            )}
          </div>
        </div>

        {/* Vertical divider on desktop */}
        <div className="hidden md:block w-px h-10 bg-slate-200 dark:bg-slate-800 mx-2" />

        {/* RIGHT: Exam Time Remaining Meter */}
        <div className="flex-1 space-y-1.5 min-w-[280px]">
          <div className="flex items-center justify-between font-medium">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Clock className={cn('w-3.5 h-3.5', timeTheme.pulse ? 'text-red-600 dark:text-red-400 animate-spin' : 'text-slate-500 dark:text-slate-400')} />
              <span>Time Remaining:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums tracking-wide">
                {formattedTime}
              </span>
              <span className={cn('px-1.5 py-0.2 text-2xs rounded font-mono font-semibold border', timeTheme.badgeBg)}>
                {timeRemainingPercentage}% Left
              </span>
            </div>

            <span className="text-2xs text-slate-500 dark:text-slate-400 font-mono">
              Total: {durationMinutes} min
            </span>
          </div>

          {/* Time remaining progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative border border-slate-200/80 dark:border-slate-700/80">
            <div
              className={cn('h-full rounded-full transition-all duration-500 ease-linear', timeTheme.barColor)}
              style={{ width: `${timeRemainingPercentage}%` }}
              role="progressbar"
              aria-valuenow={timeRemainingPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <div className="flex items-center justify-between text-2xs text-slate-500 dark:text-slate-400">
            <span>{timeElapsedPercentage}% Time Elapsed</span>
            {timeTheme.pulse ? (
              <span className="text-red-600 dark:text-red-400 font-bold animate-pulse">
                Hurry, concluding shortly!
              </span>
            ) : (
              <span>Paced for {durationMinutes}m duration</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
