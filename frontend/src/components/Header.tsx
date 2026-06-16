'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cog, Copy, Check, LogOut, Droplet, ExternalLink, Wallet } from 'lucide-react';
import { CONTRACT_ADDRESS, EXPLORER, FAUCET } from '@/lib/contract';
import { shortAddr, explorerAddr } from '@/lib/format';
import type { WalletState } from '@/hooks/useWallet';

export default function Header({ wallet }: { wallet: WalletState }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid var(--line)',
        background: 'rgba(21, 16, 12, 0.82)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        className="container"
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 14, ease: 'linear', repeat: Infinity }}
            style={{ display: 'grid', placeItems: 'center', color: 'var(--brass)' }}
          >
            <Cog size={26} strokeWidth={1.5} />
          </motion.div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: '1.18rem',
                color: 'var(--lamp)',
                lineHeight: 1,
                letterSpacing: '0.04em',
              }}
            >
              OUBLIETTE
            </div>
            <div className="etch-label" style={{ marginTop: 3 }}>
              Clockwork AI Vault
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <a
            href={FAUCET}
            target="_blank"
            rel="noopener noreferrer"
            className="ghost-btn"
            style={{ display: 'none', alignItems: 'center', gap: 6 }}
            data-faucet
          >
            <Droplet size={13} /> Faucet
          </a>
          {wallet.address ? (
            <div style={{ position: 'relative' }}>
              <button
                className="ghost-btn"
                onClick={() => setOpen((o) => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: wallet.onCorrectChain ? 'var(--verdigris-bright)' : 'var(--text-3)',
                    boxShadow: wallet.onCorrectChain ? '0 0 8px var(--verdigris-bright)' : 'none',
                  }}
                />
                <span className="mono">{shortAddr(wallet.address)}</span>
              </button>
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="plate"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: 260,
                      padding: '1rem',
                    }}
                  >
                    <div className="etch-label">Connected wallet</div>
                    <div
                      className="mono"
                      style={{ fontSize: '0.8rem', wordBreak: 'break-all', margin: '0.4rem 0 0.8rem', color: 'var(--text)' }}
                    >
                      {wallet.address}
                    </div>
                    {!wallet.onCorrectChain && (
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--warning)',
                          marginBottom: '0.7rem',
                        }}
                      >
                        Wrong network. Switch to Bradbury (4221).
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button
                        className="ghost-btn"
                        onClick={() => copy(wallet.address as string)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
                      >
                        {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy address'}
                      </button>
                      <button
                        className="ghost-btn"
                        onClick={() => {
                          wallet.disconnect();
                          setOpen(false);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
                      >
                        <LogOut size={13} /> Disconnect
                      </button>
                    </div>

                    <div
                      style={{
                        marginTop: '0.9rem',
                        paddingTop: '0.8rem',
                        borderTop: '1px solid var(--line)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.55rem',
                      }}
                    >
                      <div className="etch-label">Bradbury testnet</div>
                      <a
                        className="mono"
                        href={explorerAddr(EXPLORER, CONTRACT_ADDRESS)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.72rem', display: 'inline-flex', gap: 5, alignItems: 'center' }}
                      >
                        contract {shortAddr(CONTRACT_ADDRESS)} <ExternalLink size={10} />
                      </a>
                      <a
                        className="mono"
                        href={FAUCET}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.72rem', display: 'inline-flex', gap: 5, alignItems: 'center' }}
                      >
                        <Droplet size={11} /> Claim test GEN
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              className="brass-btn"
              onClick={wallet.connect}
              disabled={wallet.connecting}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Wallet size={15} />
              {wallet.connecting ? 'Connecting' : 'Connect'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
