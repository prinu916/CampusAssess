import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseExamTimerOptions {
  durationMinutes: number;
  onTimeout: () => void;
  warningThresholdSeconds?: number;
}

export function useExamTimer({
  durationMinutes,
  onTimeout,
  warningThresholdSeconds = 300, // 5 mins
}: UseExamTimerOptions) {
  // Frontend timer simulating startedAt & expiresAt
  const [secondsRemaining, setSecondsRemaining] = useState<number>(durationMinutes * 60);
  const [isWarning, setIsWarning] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const timerRef = useRef<any>(null);
  const hasTriggeredTimeoutRef = useRef(false);

  useEffect(() => {
    const totalSeconds = durationMinutes * 60;
    setSecondsRemaining(totalSeconds);
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
        if (next <= warningThresholdSeconds) {
          setIsWarning(true);
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [durationMinutes, onTimeout, warningThresholdSeconds]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const totalSeconds = durationMinutes * 60;
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
  };
}
