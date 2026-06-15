'use client';

import { useCallback, useRef, useState } from 'react';
import type { ToastItem, ToastKind } from '@/components/Toast';

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string, hash?: string) => {
      const id = ++seq.current;
      setToasts((t) => [...t, { id, kind, message, hash }]);
      if (kind === 'success' || kind === 'info') {
        setTimeout(() => dismiss(id), 8000);
      }
      return id;
    },
    [dismiss],
  );

  const update = useCallback(
    (id: number, kind: ToastKind, message: string, hash?: string) => {
      setToasts((t) => t.map((x) => (x.id === id ? { ...x, kind, message, hash } : x)));
      if (kind === 'success' || kind === 'info') {
        setTimeout(() => dismiss(id), 8000);
      }
    },
    [dismiss],
  );

  return { toasts, push, update, dismiss };
}
