import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProctoringEvent } from '../../types/result.types';
import { proctoringService } from '../../services/proctoring.service';
import { examAudioService } from '../../services/examAudio.service';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
  ShieldAlert,
  ShieldCheck,
  Camera,
  Eye,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Lock,
  Volume2,
  VolumeX,
} from 'lucide-react';

export interface ProctoringAssistantProps {
  testId: string;
  studentId: string;
  studentName?: string;
  maxAllowedViolations?: number;
  onViolation?: (event: ProctoringEvent, totalCount: number) => void;
  onEventsChange?: (events: ProctoringEvent[]) => void;
}

export function ProctoringAssistant({
  testId,
  studentId,
  studentName = 'Student',
  maxAllowedViolations = 3,
  onViolation,
  onEventsChange,
}: ProctoringAssistantProps) {
  const [events, setEvents] = useState<ProctoringEvent[]>(() =>
    proctoringService.getActiveEvents(testId, studentId)
  );

  const [activeWarning, setActiveWarning] = useState<ProctoringEvent | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [simulatedGaze, setSimulatedGaze] = useState<'CENTER' | 'LEFT' | 'RIGHT'>('CENTER');
  const [hasEnteredFullscreen, setHasEnteredFullscreen] = useState(false);

  const eventsRef = useRef(events);
  eventsRef.current = events;

  const triggerEvent = useCallback(
    (
      type: ProctoringEvent['type'],
      severity: ProctoringEvent['severity'],
      message: string
    ) => {
      // Audio warning cue
      examAudioService.playProctorWarning();

      const newEvent = proctoringService.logEvent(testId, studentId, {
        type,
        severity,
        message,
      });

      const updated = [...eventsRef.current, newEvent];
      setEvents(updated);
      setActiveWarning(newEvent);

      if (onViolation) {
        onViolation(newEvent, updated.length);
      }
      if (onEventsChange) {
        onEventsChange(updated);
      }
    },
    [testId, studentId, onViolation, onEventsChange]
  );

  // 1. Detect Tab Switching via Page Visibility API
  useEffect(() => {
    let lastHiddenTime = 0;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        lastHiddenTime = Date.now();
      } else {
        const awayDurationSec = lastHiddenTime
          ? Math.max(1, Math.round((Date.now() - lastHiddenTime) / 1000))
          : 1;

        triggerEvent(
          'TAB_SWITCH',
          'high',
          `Tab switch detected: Focus lost to external browser window for ${awayDurationSec} second(s).`
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [triggerEvent]);

  // 2. Detect Window Blur (Focus loss to another desktop app/Alt-Tab)
  useEffect(() => {
    const handleBlur = () => {
      // Small debounce to avoid duplicate trigger when visibilitychange fires
      setTimeout(() => {
        if (!document.hidden) {
          triggerEvent(
            'WINDOW_BLUR',
            'medium',
            'Application window lost focus. Multi-tasking or Alt+Tab action detected.'
          );
        }
      }, 100);
    };

    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, [triggerEvent]);

  // 3. Monitor Fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);

      if (hasEnteredFullscreen && !isCurrentlyFullscreen) {
        triggerEvent(
          'FULLSCREEN_EXIT',
          'medium',
          'Candidate exited proctored full-screen mode before test completion.'
        );
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [hasEnteredFullscreen, triggerEvent]);

  const toggleFullscreenMode = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        setHasEnteredFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Browser might restrict if not user gesture triggered directly
    }
  };

  // 4. Intercept Copy / Paste / Context Menu & DevTools
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerEvent(
        'COPY_ATTEMPT',
        'medium',
        'Unauthorized clipboard copy action intercepted and prevented.'
      );
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerEvent(
        'CONTEXT_MENU',
        'low',
        'Right-click context menu access prevented during proctored exam.'
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect DevTools F12 or Ctrl+Shift+I / Cmd+Option+I
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j'))
      ) {
        e.preventDefault();
        triggerEvent(
          'DEVTOOLS_ATTEMPT',
          'high',
          'Attempted to open browser developer tools / DOM inspector.'
        );
      }

      // Detect Ctrl+C / Cmd+C
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        triggerEvent(
          'COPY_ATTEMPT',
          'medium',
          'Keyboard copy shortcut (Ctrl+C / Cmd+C) recorded.'
        );
      }
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [triggerEvent]);

  // Simulated gaze check
  useEffect(() => {
    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand > 0.95) {
        setSimulatedGaze('RIGHT');
      } else if (rand > 0.90) {
        setSimulatedGaze('LEFT');
      } else {
        setSimulatedGaze('CENTER');
      }
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const totalViolations = events.length;

  return (
    <>
      {/* FLOATING PROCTORING ASSISTANT HUD WIDGET */}
      <aside
        aria-label="Proctoring Assistant"
        className="fixed bottom-4 left-4 z-40 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden transition-all duration-200 w-64 max-w-[calc(100vw-2rem)] select-none text-xs"
      >
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-2xs uppercase tracking-wider">
            <span
              className={`w-2 h-2 rounded-full ${
                totalViolations > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />
            <span>Proctored Session</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleFullscreenMode}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Lockdown Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
              aria-label={isMinimized ? 'Expand proctoring widget' : 'Minimize proctoring widget'}
            >
              {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Body (Collapsible) */}
        {!isMinimized && (
          <div className="p-3 space-y-3 bg-white dark:bg-slate-900">
            {/* Camera Viewport Simulation */}
            <div className="relative w-full aspect-4/3 bg-slate-950 rounded border border-slate-800 overflow-hidden flex items-center justify-center">
              {/* Simulated video frame */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                {/* Face mesh bounding box indicator */}
                <div className="w-20 h-20 border border-emerald-500/60 rounded-full flex items-center justify-center relative">
                  <div className="w-16 h-16 border border-dashed border-emerald-400/40 rounded-full animate-spin duration-1000" />
                  <Camera className="w-5 h-5 text-emerald-400/80" />
                  <div className="absolute -bottom-2 bg-emerald-950/80 text-emerald-300 text-3xs font-mono px-1 rounded border border-emerald-800">
                    FACIAL ID: ACTIVE
                  </div>
                </div>

                <div className="mt-2 text-3xs font-mono text-slate-400">
                  Candidate: {studentName.split(' ')[0]}
                </div>
              </div>

              {/* Status pill inside camera */}
              <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/70 backdrop-blur-xs text-white text-3xs font-mono px-1.5 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                <span>REC · PROCTORED</span>
              </div>

              <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-slate-300 text-3xs font-mono px-1 rounded">
                GAZE: {simulatedGaze}
              </div>
            </div>

            {/* Integrity Status Indicators */}
            <div className="space-y-1.5 text-2xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Tab Focus Status:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Active Window
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Flagged Incidents:</span>
                <span
                  className={`font-mono font-bold tabular-nums px-1.5 py-0.2 rounded text-2xs ${
                    totalViolations > 0
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {totalViolations} / {maxAllowedViolations} Warnings
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Mode:</span>
                <button
                  onClick={toggleFullscreenMode}
                  className="text-3xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  {isFullscreen ? 'Lockdown Active' : 'Enter Fullscreen'}
                </button>
              </div>
            </div>

            {/* Test integrity warning text */}
            <div className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded text-3xs text-slate-500 dark:text-slate-400 leading-tight">
              Window focus, tab transitions, and clipboard actions are recorded in real time for faculty review.
            </div>
          </div>
        )}
      </aside>

      {/* INSTANT PROCTORING INTEGRITY WARNING MODAL */}
      <Modal
        isOpen={!!activeWarning}
        onClose={() => setActiveWarning(null)}
        title="Proctoring Integrity Warning"
        maxWidth="md"
      >
        {activeWarning && (
          <div className="space-y-4 text-xs text-slate-800 dark:text-slate-200">
            <div className="p-3 bg-red-50 dark:bg-red-950/70 border border-red-200 dark:border-red-900 rounded-md flex items-start gap-3 text-red-950 dark:text-red-200">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm text-red-900 dark:text-red-300">
                  Suspicious Activity Detected & Logged
                </p>
                <p className="text-xs text-red-800 dark:text-red-300/90 leading-relaxed">
                  {activeWarning.message}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Violation Type:</span>
                <span className="font-mono text-2xs uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-800 dark:text-slate-200">
                  {activeWarning.type}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Timestamp:</span>
                <span className="font-mono text-2xs text-slate-600 dark:text-slate-400">
                  {new Date(activeWarning.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Warning Strike:</span>
                <span className="font-mono font-bold text-red-700 dark:text-red-400">
                  Strike {totalViolations} of {maxAllowedViolations}
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 rounded text-2xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Academic Honor Notice:</strong> This event has been permanently appended to your session audit trail. Faculty members will review tab switch logs and window blur events prior to releasing your final certificate.
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveWarning(null)}
                className="font-semibold text-xs"
              >
                I Acknowledge & Return to Exam
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
