import { useState, useEffect, useRef, useCallback } from 'react';
import { examAudioService } from '../services/examAudio.service';
import { ExamAlertData, ExamMilestoneType } from '../components/exam/ExamTimeAlertBanner';

export interface UseExamTimerOptions {
  durationMinutes: number;
  onTimeout: () => void;
  warningThresholdSeconds?: number;
  initialSecondsRemaining?: number;
}

export function useExamTimer({
  durationMinutes,
  onTimeout,
  warningThresholdSeconds = 300, // 5 mins
  initialSecondsRemaining,
}: UseExamTimerOptions) {
  const totalSeconds = durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (typeof initialSecondsRemaining === 'number' && initialSecondsRemaining > 0) {
      return initialSecondsRemaining;
    }
    return totalSeconds;
  });

  const [isWarning, setIsWarning] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [activeAlert, setActiveAlert] = useState<ExamAlertData | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(() => examAudioService.isMuted());

  const timerRef = useRef<any>(null);
  const hasTriggeredTimeoutRef = useRef(false);
  const triggeredMilestonesRef = useRef<Set<ExamMilestoneType>>(new Set());

  // Milestones in seconds
  const halfSeconds = Math.floor(totalSeconds * 0.5);
  const quarterSeconds = Math.floor(totalSeconds * 0.25);
  const fiveMinSeconds = 300;

  const triggerMilestone = useCallback(
    (type: ExamMilestoneType, remaining: number) => {
      triggeredMilestonesRef.current.add(type);

      let title = '';
      let message = '';

      if (type === '50_percent') {
        title = '50% Time Remaining';
        const minsLeft = Math.floor(remaining / 60);
        message = `You are halfway through the assessment (${minsLeft} minutes remaining). Maintain your steady pace!`;
      } else if (type === '25_percent') {
        title = '25% Time Remaining';
        const minsLeft = Math.floor(remaining / 60);
        message = `One quarter of the exam duration remains (${minsLeft} minutes). Start reviewing unattempted questions.`;
      } else if (type === '5_minutes') {
        title = '5 Minutes Remaining!';
        message = 'Final 5-minute countdown! Please verify your answers and prepare to finalize submission.';
      }

      // Play synthesized pleasant subtle audio chime
      examAudioService.playMilestoneAlert(type);

      // Trigger visual alert
      setActiveAlert({
        id: `alert_${type}_${Date.now()}`,
        type,
        title,
        message,
        secondsRemaining: remaining,
      });
    },
    []
  );

  useEffect(() => {
    const total = durationMinutes * 60;
    hasTriggeredTimeoutRef.current = false;
    setIsExpired(false);

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsExpired(true);
          if (!hasTriggeredTimeoutRef.current) {
            hasTriggeredTimeoutRef.current = true;
            onTimeout();
          }
          return 0;
        }

        const next = prev - 1;

        // Check 50% milestone
        if (
          next <= halfSeconds &&
          !triggeredMilestonesRef.current.has('50_percent') &&
          total > 60
        ) {
          triggerMilestone('50_percent', next);
        }

        // Check 25% milestone
        if (
          next <= quarterSeconds &&
          !triggeredMilestonesRef.current.has('25_percent') &&
          total > 60
        ) {
          triggerMilestone('25_percent', next);
        }

        // Check 5 minutes milestone (only if total exam length > 360s to prevent firing at test launch)
        if (
          next <= fiveMinSeconds &&
          total > 360 &&
          !triggeredMilestonesRef.current.has('5_minutes')
        ) {
          triggerMilestone('5_minutes', next);
        }

        if (next <= warningThresholdSeconds) {
          setIsWarning(true);
        }

        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    durationMinutes,
    onTimeout,
    warningThresholdSeconds,
    halfSeconds,
    quarterSeconds,
    fiveMinSeconds,
    triggerMilestone,
  ]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  const toggleMute = useCallback(() => {
    const next = examAudioService.toggleMute();
    setIsMuted(next);
  }, []);

  const timeSpentSeconds = totalSeconds - secondsRemaining;
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return {
    secondsRemaining,
    formattedTime,
    isWarning,
    isExpired,
    timeSpentSeconds,
    stopTimer,
    activeAlert,
    dismissAlert,
    isMuted,
    toggleMute,
    triggerMilestone,
  };
}
