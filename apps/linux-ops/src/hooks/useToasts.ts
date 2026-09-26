import { useCallback, useState } from 'react';

export interface Toast {
  id: number;
  message: string;
}

// A tiny toast queue. It exists so copy and favorite actions can confirm
// themselves without a blocking alert, and it never grows without bound.
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2200);
  }, []);

  return { toasts, notify };
}
