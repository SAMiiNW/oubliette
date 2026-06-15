'use client';

import { motion } from 'framer-motion';
import { Lock as LockClosed, LockOpen, DoorClosed } from 'lucide-react';
import type { Lock } from '@/lib/contract';

export default function VaultSpine({
  locks,
  activeId,
  solvedIds,
  onSelect,
}: {
  locks: Lock[];
  activeId: string | null;
  solvedIds: string[];
  onSelect: (id: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="etch-label" style={{ marginBottom: '0.9rem' }}>
        Vault spine {' . '} {locks.length} {locks.length === 1 ? 'door' : 'doors'}
      </div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 17,
            top: 14,
            bottom: 14,
            width: 2,
            background: 'linear-gradient(var(--brass-deep), var(--verdigris-deep))',
            opacity: 0.5,
          }}
        />
        {locks.map((lock, i) => {
          const solved = solvedIds.includes(lock.id);
          const active = lock.id === activeId;
          return (
            <motion.button
              key={lock.id}
              onClick={() => onSelect(lock.id)}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              style={{
                position: 'relative',
                display: 'flex',
                gap: '0.7rem',
                alignItems: 'center',
                textAlign: 'left',
                background: active ? 'var(--panel-2)' : 'transparent',
                border: `1px solid ${active ? 'var(--brass)' : 'var(--line)'}`,
                borderRadius: 'var(--r-md)',
                padding: '0.55rem 0.7rem',
                cursor: 'pointer',
                color: 'var(--text)',
                width: '100%',
                boxShadow: active ? 'var(--lamp-glow)' : 'none',
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  flexShrink: 0,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  zIndex: 1,
                  background: solved
                    ? 'radial-gradient(circle at 38% 32%, var(--verdigris-bright), var(--verdigris-deep))'
                    : 'radial-gradient(circle at 38% 32%, var(--panel-2), var(--inset))',
                  border: `1px solid ${solved ? 'var(--verdigris)' : 'var(--line-bright)'}`,
                  color: solved ? '#0d1a18' : 'var(--brass)',
                }}
              >
                {solved ? <LockOpen size={13} /> : active ? <DoorClosed size={13} /> : <LockClosed size={13} />}
              </span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span
                  className="mono"
                  style={{ fontSize: '0.62rem', color: 'var(--text-3)', display: 'block' }}
                >
                  DEPTH {lock.depth}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.86rem',
                    color: active ? 'var(--lamp)' : 'var(--text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {lock.title}
                </span>
              </span>
              <span className="mono tabnum" style={{ fontSize: '0.66rem', color: 'var(--text-3)' }}>
                {lock.solves}/{lock.attempts}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
