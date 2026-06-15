'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, Loader2, X, ExternalLink } from 'lucide-react';
import { EXPLORER } from '@/lib/contract';
import { explorerTx } from '@/lib/format';

export type ToastKind = 'loading' | 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
  hash?: string;
}

const ICONS = {
  loading: Loader2,
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const COLORS: Record<ToastKind, string> = {
  loading: 'var(--brass)',
  success: 'var(--verdigris-bright)',
  error: 'var(--danger-bright)',
  info: 'var(--text-2)',
};

export function ToastStack({
  toasts,
  dismiss,
}: {
  toasts: ToastItem[];
  dismiss: (id: number) => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        right: '1.25rem',
        bottom: '1.25rem',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.7rem',
        maxWidth: 'min(380px, calc(100vw - 2.5rem))',
      }}
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.kind];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 360, damping: 30 }}
              className="plate"
              style={{ padding: '0.9rem 1rem', display: 'flex', gap: '0.7rem' }}
            >
              <Icon
                size={18}
                color={COLORS[t.kind]}
                className={t.kind === 'loading' ? 'spin-icon' : undefined}
                style={
                  t.kind === 'loading'
                    ? { animation: 'spin-cw 0.9s linear infinite', flexShrink: 0, marginTop: 2 }
                    : { flexShrink: 0, marginTop: 2 }
                }
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.45 }}>
                  {t.message}
                </p>
                {t.hash && (
                  <a
                    className="mono"
                    href={explorerTx(EXPLORER, t.hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.72rem', display: 'inline-flex', gap: 4, marginTop: 5 }}
                  >
                    {t.hash.slice(0, 10)}
                    {'\u2026'}
                    {t.hash.slice(-6)}
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-3)',
                  cursor: 'pointer',
                  padding: 0,
                  height: 18,
                }}
              >
                <X size={15} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
