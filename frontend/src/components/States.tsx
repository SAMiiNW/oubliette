'use client';

import { AlertTriangle, RefreshCw, Cog, ExternalLink } from 'lucide-react';
import { EXPLORER, CONTRACT_ADDRESS } from '@/lib/contract';
import { explorerAddr } from '@/lib/format';

export function Skeleton({ height = 120 }: { height?: number }) {
  return (
    <div
      className="plate"
      style={{
        height,
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-hidden
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, transparent, rgba(217,164,65,0.06), transparent)',
          animation: 'spin-cw 0s',
          backgroundSize: '200% 100%',
        }}
      />
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="plate" style={{ padding: '2rem', textAlign: 'center' }}>
      <AlertTriangle size={32} color="var(--danger-bright)" style={{ margin: '0 auto 0.8rem' }} />
      <h3 style={{ color: 'var(--lamp)', fontSize: '1.1rem' }}>Could not reach the vault</h3>
      <p style={{ color: 'var(--text-2)', margin: '0.6rem auto 1.2rem', maxWidth: 380, lineHeight: 1.6 }}>
        {message}
      </p>
      <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="brass-btn" onClick={onRetry} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          <RefreshCw size={14} /> Retry
        </button>
        <a
          className="ghost-btn"
          href={explorerAddr(EXPLORER, CONTRACT_ADDRESS)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}
        >
          <ExternalLink size={13} /> View on explorer
        </a>
      </div>
    </div>
  );
}

export function EmptyVault({ onCreate, walletConnected }: { onCreate: () => void; walletConnected: boolean }) {
  return (
    <div className="plate" style={{ padding: '2.6rem 2rem', textAlign: 'center' }}>
      <div
        style={{
          width: 72,
          height: 72,
          margin: '0 auto 1.2rem',
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          border: '1px solid var(--line-bright)',
          background: 'radial-gradient(circle at 38% 32%, var(--panel-2), var(--inset))',
          color: 'var(--brass)',
        }}
      >
        <Cog size={34} strokeWidth={1.4} />
      </div>
      <h3 style={{ color: 'var(--lamp)', fontSize: '1.3rem' }}>The vault is empty</h3>
      <p style={{ color: 'var(--text-2)', margin: '0.7rem auto 1.4rem', maxWidth: 420, lineHeight: 1.6 }}>
        No locks have been forged yet. Author the first riddle-guarded mechanism and seal it into the
        chain for others to defeat.
      </p>
      <button className="brass-btn" onClick={onCreate}>
        {walletConnected ? 'Forge the first lock' : 'Connect to forge a lock'}
      </button>
    </div>
  );
}
