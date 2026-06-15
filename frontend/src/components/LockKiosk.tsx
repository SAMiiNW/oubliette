'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScrollText, KeyRound, CheckCircle2, User2, ExternalLink } from 'lucide-react';
import type { Lock, PlayerState } from '@/lib/contract';
import { EXPLORER } from '@/lib/contract';
import { shortAddr, explorerAddr } from '@/lib/format';
import ConsensusStage from './ConsensusStage';
import type { TxState } from '@/hooks/useTransaction';

interface LockKioskProps {
  lock: Lock | null;
  player: PlayerState | null;
  walletConnected: boolean;
  onConnect: () => void;
  onAttempt: (text: string) => void;
  tx: TxState;
  lastVerdict: { ruling: string; ingenuity: number; note: string; advanced: boolean } | null;
  onDismissVerdict: () => void;
}

const MAX = 600;

export default function LockKiosk({
  lock,
  player,
  walletConnected,
  onConnect,
  onAttempt,
  tx,
  lastVerdict,
  onDismissVerdict,
}: LockKioskProps) {
  const [text, setText] = useState('');

  useEffect(() => {
    setText('');
  }, [lock?.id]);

  if (!lock) return null;

  const inFlight = tx.phase === 'wallet' || tx.phase === 'submitted' || tx.phase === 'consensus';
  const alreadySolved = !!player && player.solved.includes(lock.id);
  const len = text.trim().length;
  const canSubmit = walletConnected && !inFlight && len >= 1 && len <= MAX && !alreadySolved && lock.status === 'OPEN';

  return (
    <div className="plate" style={{ padding: 'clamp(1.2rem, 3vw, 2.2rem)', position: 'relative' }}>
      <span className="rivet" style={{ top: 12, left: 12 }} />
      <span className="rivet" style={{ top: 12, right: 12 }} />
      <span className="rivet" style={{ bottom: 12, left: 12 }} />
      <span className="rivet" style={{ bottom: 12, right: 12 }} />

      {inFlight ? (
        <ConsensusStage phase={tx.phase} liveStatus={tx.liveStatus} draft={tx.draft} />
      ) : lastVerdict ? (
        <VerdictReveal verdict={lastVerdict} lock={lock} onDismiss={onDismissVerdict} />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem' }}>
            <div className="etch-label" style={{ color: 'var(--brass)' }}>
              Mechanism {' . '} depth {lock.depth}
            </div>
            <div className="etch-label">
              {lock.solves} solved {' / '} {lock.attempts} tried
            </div>
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3.6vw, 2.4rem)',
              color: 'var(--lamp)',
              margin: '0.7rem 0 1rem',
              lineHeight: 1.1,
            }}
          >
            {lock.title}
          </h2>

          <div
            style={{
              display: 'flex',
              gap: '0.6rem',
              alignItems: 'flex-start',
              padding: '1rem 1.1rem',
              background: 'var(--inset)',
              borderRadius: 'var(--r-md)',
              border: '1px solid var(--line-bright)',
              boxShadow: 'var(--bevel-deep)',
            }}
          >
            <ScrollText size={18} color="var(--brass)" style={{ flexShrink: 0, marginTop: 3 }} />
            <p style={{ margin: 0, lineHeight: 1.7, fontSize: '1.02rem', color: 'var(--text)' }}>
              {lock.riddle}
            </p>
          </div>

          <div
            className="mono"
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-3)',
              display: 'flex',
              gap: '0.4rem',
              alignItems: 'center',
              margin: '0.7rem 0 1.3rem',
            }}
          >
            <User2 size={11} /> authored by
            <a
              href={explorerAddr(EXPLORER, lock.author)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}
            >
              {shortAddr(lock.author)} <ExternalLink size={9} />
            </a>
          </div>

          {alreadySolved ? (
            <div
              style={{
                display: 'flex',
                gap: '0.6rem',
                alignItems: 'center',
                padding: '1rem',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--verdigris-deep)',
                background: 'rgba(78, 154, 143, 0.08)',
                color: 'var(--verdigris-bright)',
              }}
            >
              <CheckCircle2 size={18} /> You have already released this lock. Choose another door on
              the spine.
            </div>
          ) : lock.status !== 'OPEN' ? (
            <div className="etch-label">This lock is sealed shut.</div>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <span className="etch-label" style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
                  <KeyRound size={12} /> Your written attempt
                </span>
                <span
                  className="mono tabnum"
                  style={{
                    fontSize: '0.68rem',
                    color: len > MAX ? 'var(--danger-bright)' : 'var(--text-3)',
                  }}
                >
                  {len}/{MAX}
                </span>
              </div>
              <textarea
                rows={4}
                value={text}
                maxLength={MAX + 40}
                disabled={!walletConnected || inFlight}
                placeholder={
                  walletConnected
                    ? 'State how you defeat the mechanism. Reason it out; the gatekeeper rewards specific, original thinking.'
                    : 'Connect your wallet to pull the lever.'
                }
                onChange={(e) => setText(e.target.value)}
              />

              <div style={{ marginTop: '1.1rem', display: 'flex', justifyContent: 'flex-end' }}>
                {walletConnected ? (
                  <button className="brass-btn" onClick={() => onAttempt(text.trim())} disabled={!canSubmit}>
                    Pull the brass lever
                  </button>
                ) : (
                  <button className="brass-btn" onClick={onConnect}>
                    Connect to attempt
                  </button>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function VerdictReveal({
  verdict,
  lock,
  onDismiss,
}: {
  verdict: { ruling: string; ingenuity: number; note: string; advanced: boolean };
  lock: Lock;
  onDismiss: () => void;
}) {
  const color =
    verdict.ruling === 'SOLVED'
      ? 'var(--verdigris-bright)'
      : verdict.ruling === 'PARTIAL'
      ? 'var(--brass-bright)'
      : 'var(--danger-bright)';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flash-confirm"
      style={{ textAlign: 'center', padding: '0.5rem 0', borderRadius: 'var(--r-md)' }}
    >
      <div className="etch-label">Gatekeeper ruling {' . '} {lock.title}</div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 'clamp(2.4rem, 7vw, 3.6rem)',
          color,
          margin: '0.6rem 0',
        }}
      >
        {verdict.ruling}
      </div>
      <div
        className="mono tabnum"
        style={{ fontSize: '1.1rem', color: 'var(--text)', marginBottom: '0.4rem' }}
      >
        ingenuity {verdict.ingenuity}/100
      </div>
      {verdict.advanced && (
        <div style={{ color: 'var(--verdigris-bright)', fontSize: '0.92rem', marginBottom: '0.6rem' }}>
          The lock yields. You descend deeper into the vault.
        </div>
      )}
      {verdict.note && (
        <p
          style={{
            color: 'var(--text-2)',
            fontStyle: 'italic',
            maxWidth: 440,
            margin: '0.4rem auto 1.4rem',
            lineHeight: 1.6,
          }}
        >
          {'"'}
          {verdict.note}
          {'"'}
        </p>
      )}
      <button className="ghost-btn" onClick={onDismiss}>
        Return to the mechanism
      </button>
    </motion.div>
  );
}
