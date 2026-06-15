'use client';

import { motion } from 'framer-motion';
import GearCanvas from './GearCanvas';
import { rulingLabel } from '@/lib/format';
import type { LeaderDraft } from '@/lib/poll';
import type { TxPhase } from '@/hooks/useTransaction';

const STAGE_STORY: Record<string, string> = {
  PENDING: 'Engaging the mechanism. Your attempt is sealed into a transaction.',
  PROPOSING: 'A validator takes the lead and reads your attempt against the riddle.',
  COMMITTING: 'Validators independently re-run the gatekeeper and commit their rulings.',
  REVEALING: 'The tumblers reveal. Validators compare rulings and ingenuity scores.',
  LEADER_TIMEOUT: 'The lead validator stalled. The vault rotates the leader and keeps turning.',
  VALIDATORS_TIMEOUT: 'The quorum is regrouping. The gears keep seeking, no action needed.',
  ACCEPTED: 'Consensus sealed. The gatekeeper has ruled.',
  FINALIZED: 'Consensus sealed. The gatekeeper has ruled.',
};

function rulingColor(ruling?: string): string {
  switch ((ruling ?? '').toUpperCase()) {
    case 'SOLVED':
      return 'var(--verdigris-bright)';
    case 'PARTIAL':
      return 'var(--brass-bright)';
    case 'REJECTED':
      return 'var(--danger-bright)';
    default:
      return 'var(--text-2)';
  }
}

export default function ConsensusStage({
  phase,
  liveStatus,
  draft,
}: {
  phase: TxPhase;
  liveStatus: string | null;
  draft: LeaderDraft | null;
}) {
  const seeking = phase === 'consensus' || phase === 'submitted' || phase === 'wallet';
  const status = liveStatus ?? 'PENDING';
  const story =
    phase === 'wallet'
      ? 'Confirm the transaction in your wallet to engage the lock.'
      : STAGE_STORY[status] ?? 'The mechanism is turning.';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 360, aspectRatio: '1 / 1' }}>
        <GearCanvas seeking={seeking} className="" />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <GearCanvasOverlay status={status} phase={phase} draft={draft} />
        </div>
      </div>

      <div style={{ textAlign: 'center', maxWidth: 460 }}>
        <div className="etch-label" style={{ color: 'var(--brass)' }}>
          {phase === 'confirmed' ? 'Sealed' : 'Validators deliberating'} {' . '} {status}
        </div>
        <p style={{ color: 'var(--text-2)', margin: '0.6rem 0 0', lineHeight: 1.6 }}>{story}</p>
      </div>

      {draft && phase !== 'confirmed' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="plate"
          style={{ padding: '1rem 1.2rem', width: '100%', maxWidth: 460 }}
        >
          <div className="etch-label">Leader draft, sealing under consensus</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.8rem',
              marginTop: '0.5rem',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1.3rem',
                color: rulingColor(draft.ruling),
              }}
            >
              {rulingLabel(draft.ruling)}
            </span>
            {typeof draft.ingenuity === 'number' && (
              <span className="mono tabnum" style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>
                ingenuity {draft.ingenuity}/100
              </span>
            )}
          </div>
          {draft.note && (
            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-2)', fontSize: '0.9rem', fontStyle: 'italic' }}>
              {draft.note}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}

function GearCanvasOverlay({
  status,
  phase,
  draft,
}: {
  status: string;
  phase: TxPhase;
  draft: LeaderDraft | null;
}) {
  return (
    <div
      style={{
        width: 92,
        height: 92,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        background: 'radial-gradient(circle at 40% 35%, var(--panel-2), var(--inset))',
        border: '1px solid var(--line-bright)',
        boxShadow: 'var(--bevel-deep), 0 0 22px rgba(217,164,65,0.18)',
        textAlign: 'center',
      }}
    >
      <div>
        <div
          className="mono tabnum"
          style={{ fontSize: '1.5rem', color: 'var(--lamp)', fontWeight: 700 }}
        >
          {phase === 'confirmed' && draft?.ingenuity != null ? draft.ingenuity : '. .'}
        </div>
        <div className="etch-label" style={{ fontSize: '0.5rem' }}>
          {phase === 'confirmed' ? 'score' : 'seeking'}
        </div>
      </div>
    </div>
  );
}
