'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 180,
            background: 'rgba(10, 7, 4, 0.72)',
            backdropFilter: 'blur(3px)',
            display: 'grid',
            placeItems: 'center',
            padding: '1.25rem',
          }}
        >
          <motion.div
            initial={{ scale: 0.94, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            className="plate"
            style={{ width: 'min(440px, 100%)', padding: '1.6rem' }}
          >
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
              <ShieldAlert size={22} color="var(--brass)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--lamp)' }}>{title}</h3>
                <p style={{ color: 'var(--text-2)', marginTop: '0.5rem', lineHeight: 1.55, fontSize: '0.92rem' }}>
                  {body}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.7rem', marginTop: '1.4rem', justifyContent: 'flex-end' }}>
              <button className="ghost-btn" onClick={onCancel}>
                Cancel
              </button>
              <button className="brass-btn" onClick={onConfirm}>
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
