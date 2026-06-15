'use client';

import { motion } from 'framer-motion';
import { ScrollText } from 'lucide-react';
import type { ChronicleEntry } from '@/lib/contract';
import { shortAddr } from '@/lib/format';

function color(ruling: string): string {
  switch (ruling.toUpperCase()) {
    case 'SOLVED':
      return 'var(--verdigris-bright)';
    case 'PARTIAL':
      return 'var(--brass-bright)';
    default:
      return 'var(--danger-bright)';
  }
}

export default function Chronicle({ entries }: { entries: ChronicleEntry[] }) {
  return (
    <div className="plate" style={{ padding: '1.3rem' }}>
      <div
        className="etch-label"
        style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: '1rem' }}
      >
        <ScrollText size={13} /> Vault chronicle
      </div>
      {entries.length === 0 ? (
        <p style={{ color: 'var(--text-3)', fontSize: '0.86rem', lineHeight: 1.6 }}>
          No rulings recorded yet. Every gatekeeper verdict sealed under consensus appears here.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', maxHeight: 460, overflowY: 'auto' }}>
          {entries.map((e) => (
            <motion.div
              key={e.seq}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '0.7rem 0.8rem',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-sm)',
                background: 'var(--inset)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: color(e.ruling),
                  }}
                >
                  {e.ruling}
                </span>
                <span className="mono tabnum" style={{ fontSize: '0.66rem', color: 'var(--text-3)' }}>
                  {e.ingenuity}/100
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text)', marginTop: 3 }}>{e.lock_title}</div>
              {e.note && (
                <p style={{ margin: '0.35rem 0 0', fontSize: '0.78rem', color: 'var(--text-2)', fontStyle: 'italic', lineHeight: 1.5 }}>
                  {e.note}
                </p>
              )}
              <div className="mono" style={{ fontSize: '0.62rem', color: 'var(--text-3)', marginTop: 5 }}>
                {shortAddr(e.actor)} {e.advanced ? ' . advanced' : ''}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
