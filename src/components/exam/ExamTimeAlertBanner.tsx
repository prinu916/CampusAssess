import React, { useEffect, useState } from 'react';
import { Clock, Hourglass, AlertTriangle, X, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ExamMilestoneType = '50_percent' | '25_percent' | '5_minutes';

export interface ExamAlertData {
  id: string;
  type: ExamMilestoneType;
  title: string;
  message: string;
  secondsRemaining: number;
}

interface ExamTimeAlertBannerProps {
  alert: ExamAlertData | null;
  onDismiss: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function ExamTimeAlertBanner({
  alert,
  onDismiss,
  isMuted,
  onToggleMute,
}: ExamTimeAlertBannerProps) {
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!alert) return;

    setProgress(100);
    const durationMs = 10000; // 10 seconds auto-dismiss
    const intervalMs = 100;
    const step = (intervalMs / durationMs) * 100;

    const timer = setInterval(() => {
      if (!isHovered) {
        setProgress((prev) => {
          if (prev <= step) {
            clearInterval(timer);
            onDismiss();
            return 0;
          }
          return prev - step;
        });
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [alert, isHovered, onDismiss]);

  if (!alert) return null;

  const isHalfway = alert.type === '50_percent';
  const isQuarter = alert.type === '25_percent';
  const isFiveMin = alert.type === '5_minutes';

  const mins = Math.floor(alert.secondsRemaining / 60);
  const secs = alert.secondsRemaining % 60;
  const timeText = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <div
      role="alert"
      aria-live="polite"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'fixed top-16 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md shadow-xl rounded-xl border p-4 transition-all duration-300 animate-in fade-in slide-in-from-top-4',
        isHalfway && 'bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-700/80 ring-2 ring-blue-500/20 text-slate-900 dark:text-slate-100',
        isQuarter && 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-700/80 ring-2 ring-amber-500/20 text-slate-900 dark:text-slate-100',
        isFiveMin && 'bg-white dark:bg-slate-900 border-red-400 dark:border-red-600 ring-4 ring-red-500/25 text-slate-900 dark:text-slate-100'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Milestone Icon */}
        <div
          className={cn(
            'p-2 rounded-lg shrink-0 mt-0.5',
            isHalfway && 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
            isQuarter && 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
            isFiveMin && 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 animate-pulse'
          )}
        >
          {isHalfway && <Clock className="w-5 h-5" />}
          {isQuarter && <Hourglass className="w-5 h-5" />}
          {isFiveMin && <AlertTriangle className="w-5 h-5" />}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2">
            <h4
              className={cn(
                'text-xs font-bold uppercase tracking-wider',
                isHalfway && 'text-blue-700 dark:text-blue-400',
                isQuarter && 'text-amber-700 dark:text-amber-400',
                isFiveMin && 'text-red-700 dark:text-red-400'
              )}
            >
              {alert.title}
            </h4>
            <span className="font-mono text-2xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 tabular-nums">
              {timeText} left
            </span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-200 mt-1 font-medium leading-relaxed">
            {alert.message}
          </p>

          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-2xs text-slate-500 dark:text-slate-400">
            <button
              onClick={onToggleMute}
              className="inline-flex items-center gap-1.5 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute exam notification audio' : 'Mute exam notification audio'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  <span>Audio Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Audio Alert Active</span>
                </>
              )}
            </button>

            <button
              onClick={onDismiss}
              className="font-semibold text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white underline cursor-pointer"
            >
              Acknowledge
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors shrink-0"
          aria-label="Dismiss exam notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Auto-dismiss subtle progress line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 rounded-b-xl overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-100',
            isHalfway && 'bg-blue-500',
            isQuarter && 'bg-amber-500',
            isFiveMin && 'bg-red-500'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
