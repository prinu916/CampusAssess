import React, { createContext, useContext, useState, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}

interface ToastContextType {
  toast: (options: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
  removeToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(({ title, description, type = 'info' }: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, title, description, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          let borderClr = 'border-slate-200 bg-white text-slate-900';
          let iconColor = 'text-slate-500';

          if (t.type === 'success') {
            borderClr = 'border-green-200 bg-green-50 text-green-950';
            iconColor = 'text-green-600';
          } else if (t.type === 'error') {
            borderClr = 'border-red-200 bg-red-50 text-red-950';
            iconColor = 'text-red-600';
          } else if (t.type === 'warning') {
            borderClr = 'border-amber-200 bg-amber-50 text-amber-950';
            iconColor = 'text-amber-600';
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-4 rounded-md border shadow-sm flex items-start justify-between gap-3 transition-all ${borderClr}`}
            >
              <div className="space-y-0.5">
                <p className="text-sm font-semibold">{t.title}</p>
                {t.description && <p className="text-xs text-slate-600">{t.description}</p>}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className={`text-xs hover:opacity-80 p-0.5 ${iconColor}`}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
