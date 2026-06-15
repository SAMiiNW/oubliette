'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, PenLine, Lock as LockIcon, EyeOff } from 'lucide-react';

export interface AuthorDraft {
  title: string;
  riddle: string;
  rationale: string;
}

export default function AuthorModal({
  open,
  busy,
  onClose,
  onSubmit,
}: {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onSubmit: (draft: AuthorDraft) => void;
}) {
  const [title, setTitle] = useState('');
  const [riddle, setRiddle] = useState('');
  const [rationale, setRationale] = useState('');

  const titleOk = title.trim().length >= 1 && title.trim().length <= 80;
  const riddleOk = riddle.trim().length >= 1 && riddle.trim().length <= 600;
  const ratOk = rationale.trim().length >= 1 && rationale.trim().length <= 600;
  const valid = titleOk && riddleOk && ratOk && !busy;

  const submit = () => {
    if (!valid) return;
    onSubmit({ title: title.trim(), riddle: riddle.trim(), rationale: rationale.trim() });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={busy ? undefined : onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 170,
            background: 'rgba(10, 7, 4, 0.74)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            padding: '1rem',
            overflowY: 'auto',
          }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 16 }}
            onClick={(e) => e.stopPropagation()}
            className="plate"
            style={{ width: 'min(560px, 100%)', padding: '1.6rem', margin: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <PenLine size={18} color="var(--brass)" />
                <h3 style={{ fontSize: '1.2rem', color: 'var(--lamp)' }}>Forge a new lock</h3>
              </div>
              <button
                onClick={onClose}
                disabled={busy}
                aria-label="Close"
                style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', margin: '0.7rem 0 1.3rem', lineHeight: 1.55 }}>
              Author a riddle-guarded mechanism. The gatekeeper rules on every attempt using your
              hidden rationale, which is stored on-chain but never returned by any view or revealed
              to players.
            </p>

            <Field
              icon={<LockIcon size={13} />}
              label="Lock title"
              hint={`${title.trim().length}/80`}
              error={title.length > 0 && !titleOk ? 'Title must be 1 to 80 characters.' : null}
            >
              <input
                value={title}
                maxLength={90}
                placeholder="The Brass Sundial"
                onChange={(e) => setTitle(e.target.value)}
                disabled={busy}
              />
            </Field>

            <Field
              icon={<PenLine size={13} />}
              label="Riddle shown to players"
              hint={`${riddle.trim().length}/600`}
              error={riddle.length > 0 && !riddleOk ? 'Riddle must be 1 to 600 characters.' : null}
            >
              <textarea
                value={riddle}
                rows={3}
                maxLength={700}
                placeholder="Describe the mechanism and what defeats it. The player sees only this."
                onChange={(e) => setRiddle(e.target.value)}
                disabled={busy}
              />
            </Field>

            <Field
              icon={<EyeOff size={13} />}
              label="Confidential solving rationale"
              hint={`${rationale.trim().length}/600`}
              error={rationale.length > 0 && !ratOk ? 'Rationale must be 1 to 600 characters.' : null}
            >
              <textarea
                value={rationale}
                rows={3}
                maxLength={700}
                placeholder="The reasoning that should count as solving it. Never shown to players or any view."
                onChange={(e) => setRationale(e.target.value)}
                disabled={busy}
              />
            </Field>

            <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'flex-end', marginTop: '1.2rem' }}>
              <button className="ghost-btn" onClick={onClose} disabled={busy}>
                Cancel
              </button>
              <button className="brass-btn" onClick={submit} disabled={!valid}>
                {busy ? <span className="spinner" /> : 'Seal the lock'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  icon,
  label,
  hint,
  error,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  error: string | null;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.4rem',
        }}
      >
        <span
          className="etch-label"
          style={{ display: 'inline-flex', gap: 5, alignItems: 'center', color: 'var(--text-2)' }}
        >
          {icon} {label}
        </span>
        <span className="mono tabnum" style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>
          {hint}
        </span>
      </div>
      {children}
      {error && (
        <p style={{ color: 'var(--danger-bright)', fontSize: '0.76rem', margin: '0.35rem 0 0' }}>
          {error}
        </p>
      )}
    </div>
  );
}
