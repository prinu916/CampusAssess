import { useState, useEffect, useRef } from 'react';

interface AutoSaveOptions<T> {
  key: string;
  data: T;
  intervalMs?: number;
  enabled?: boolean;
  onRestore?: (restoredData: T) => void;
}

export function useExamAutoSave<T>({
  key,
  data,
  intervalMs = 4000,
  enabled = true,
  onRestore,
}: AutoSaveOptions<T>) {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [hasRestored, setHasRestored] = useState(false);

  // Keep ref to latest data
  const dataRef = useRef(data);
  dataRef.current = data;

  // On mount: restore previous draft if exists
  useEffect(() => {
    if (!enabled) return;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.payload) {
          if (onRestore) {
            onRestore(parsed.payload);
          }
          if (parsed.savedAt) {
            setLastSavedTime(new Date(parsed.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          }
          setHasRestored(true);
        }
      }
    } catch (e) {
      console.warn('Could not restore auto-saved exam data', e);
    }
  }, [key]);

  // Periodic background saving
  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(() => {
      try {
        setIsAutoSaving(true);
        const payloadToSave = {
          payload: dataRef.current,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(key, JSON.stringify(payloadToSave));
        setTimeout(() => {
          setIsAutoSaving(false);
          setLastSavedTime(
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          );
        }, 250);
      } catch (err) {
        setIsAutoSaving(false);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [key, intervalMs, enabled]);

  // Immediate save trigger
  const saveImmediately = (customData?: T) => {
    if (!enabled) return;
    try {
      setIsAutoSaving(true);
      const payloadToSave = {
        payload: customData !== undefined ? customData : dataRef.current,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(payloadToSave));
      setTimeout(() => {
        setIsAutoSaving(false);
        setLastSavedTime(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      }, 200);
    } catch {
      setIsAutoSaving(false);
    }
  };

  // Clear auto-saved draft once submitted
  const clearSavedData = () => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  };

  return {
    isAutoSaving,
    lastSavedTime,
    hasRestored,
    saveImmediately,
    clearSavedData,
  };
}
