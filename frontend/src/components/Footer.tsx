'use client';

import { Cog } from 'lucide-react';
import { CONTRACT_ADDRESS, DEPLOY_TX, EXPLORER, FAUCET } from '@/lib/contract';
import { shortAddr, explorerAddr, explorerTx } from '@/lib/format';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--line)',
        marginTop: '3rem',
        background: 'rgba(0,0,0,0.25)',
      }}
    >
      <div
        className="container"
        style={{
          padding: '1.4rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-3)' }}>
          <Cog size={16} color="var(--brass-deep)" />
          <span className="mono" style={{ fontSize: '0.72rem' }}>
            Oubliette runs entirely on a GenLayer intelligent contract. No backend, no custody, no deposits.
          </span>
        </div>
        <div
          className="mono"
          style={{ display: 'flex', gap: '1.1rem', fontSize: '0.7rem', flexWrap: 'wrap' }}
        >
          <a href={explorerAddr(EXPLORER, CONTRACT_ADDRESS)} target="_blank" rel="noopener noreferrer">
            contract {shortAddr(CONTRACT_ADDRESS)}
          </a>
          <a href={explorerTx(EXPLORER, DEPLOY_TX)} target="_blank" rel="noopener noreferrer">
            deploy tx
          </a>
          <a href={FAUCET} target="_blank" rel="noopener noreferrer">
            faucet
          </a>
        </div>
      </div>
    </footer>
  );
}
