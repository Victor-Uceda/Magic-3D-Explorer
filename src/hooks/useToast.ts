import { useState, useEffect, useCallback } from 'react';

export interface ToastData {
  title: string;
  subtitle?: string;
}

export interface UseToastReturn {
  toast: ToastData | null;
  showToast: (title: string, subtitle?: string) => void;
  clearToast: () => void;
}

export function useToast(durationMs: number = 2600): UseToastReturn {
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), durationMs);
    return () => clearTimeout(timer);
  }, [toast, durationMs]);

  const showToast = useCallback((title: string, subtitle?: string) => {
    setToast({ title, subtitle });
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, clearToast };
}
