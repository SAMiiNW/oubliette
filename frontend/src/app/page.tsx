'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Gauge, Layers, KeyRound, Award } from 'lucide-react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LockKiosk from '@/components/LockKiosk';
import VaultSpine from '@/components/VaultSpine';
import Chronicle from '@/components/Chronicle';
import AuthorModal, { type AuthorDraft } from '@/components/AuthorModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { ToastStack } from '@/components/Toast';
import { ErrorState, EmptyVault, Skeleton } from '@/components/States';

import { useWallet } from '@/hooks/useWallet';
import { useContractData } from '@/hooks/useContractData';
import { useTransaction } from '@/hooks/useTransaction';
import { useToasts } from '@/hooks/useToasts';

import {
  fetchPlayer,
  sendAttempt,
  sendAuthorLock,
  type PlayerState,
} from '@/lib/contract';
import { friendlyError } from '@/lib/format';

export default function Page() {
  const wallet = useWallet();
  const data = useContractData();
  const tx = useTransaction();
  const { toasts, push, update, dismiss } = useToasts();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [authorOpen, setAuthorOpen] = useState(false);
  const [authorBusy, setAuthorBusy] = useState(false);
  const [pendingAttempt, setPendingAttempt] = useState<string | null>(null);
  const [lastVerdict, setLastVerdict] = useState<
    { ruling: string; ingenuity: number; note: string; advanced: boolean } | null
  >(null);

  // Default the active lock to the deepest unsolved door, else the first.
  useEffect(() => {
    if (activeId || data.locks.length === 0) return;
    setActiveId(data.locks[0].id);
  }, [data.locks, activeId]);

  const loadPlayer = useCallback(async () => {
    if (!wallet.address) {
      setPlayer(null);
      return;
    }
    try {
      setPlayer(await fetchPlayer(wallet.address));
    } catch {
      /* non-fatal */
    }
  }, [wallet.address]);

  useEffect(() => {
    loadPlayer();
  }, [loadPlayer]);

  const activeLock = useMemo(
    () => data.locks.find((l) => l.id === activeId) ?? null,
    [data.locks, activeId],
  );

  const solvedIds = player?.solved ?? [];

  // ----- author flow --------------------------------------------------------
  const submitAuthor = useCallback(
    async (draft: AuthorDraft) => {
      if (!wallet.address) return;
      setAuthorBusy(true);
      data.setTxInFlight(true);
      const tid = push('loading', 'Confirm in wallet to seal the lock.');
      try {
        await tx.run({
          account: wallet.address,
          send: (client) => sendAuthorLock(client, draft.title, draft.riddle, draft.rationale),
          onConfirmed: async () => {
            update(tid, 'success', 'Lock sealed into the vault.');
            await data.refresh();
            await loadPlayer();
          },
        });
      } catch (e) {
        update(tid, 'error', friendlyError(e));
      } finally {
        setAuthorBusy(false);
        setAuthorOpen(false);
        data.setTxInFlight(false);
      }
    },
    [wallet.address, tx, push, update, data, loadPlayer],
  );

  // Watch tx phase to surface toast for author errors that resolve in poll.
  useEffect(() => {
    if (tx.state.phase === 'error' && tx.state.error) {
      push('error', tx.state.error, tx.state.hash ?? undefined);
    }
  }, [tx.state.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ----- attempt flow -------------------------------------------------------
  const doAttempt = useCallback(
    async (text: string) => {
      if (!wallet.address || !activeLock) return;
      const lockId = activeLock.id;
      data.setTxInFlight(true);
      setLastVerdict(null);
      const tid = push('loading', 'Confirm in wallet to pull the lever.', undefined);
      await tx.run({
        account: wallet.address,
        send: (client) => sendAttempt(client, lockId, text),
        onConfirmed: async (draft) => {
          update(tid, 'success', 'The gatekeeper has ruled.');
          await data.refresh();
          const p = await fetchPlayerSafe(wallet.address as string);
          if (p) setPlayer(p);
          if (draft) {
            setLastVerdict({
              ruling: draft.ruling,
              ingenuity: typeof draft.ingenuity === 'number' ? draft.ingenuity : 0,
              note: draft.note ?? '',
              advanced: !!draft.advanced,
            });
          }
        },
      });
      data.setTxInFlight(false);
    },
    [wallet.address, activeLock, tx, push, update, data],
  );

  const requestAttempt = useCallback((text: string) => {
    setPendingAttempt(text);
  }, []);

  const stats = data.stats;

  return (
    <>
      <Header wallet={wallet} />

      <main className="container" style={{ padding: '1.8rem 1.5rem 0' }}>
        {/* Status gauges */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '0.8rem',
            marginBottom: '1.6rem',
          }}
        >
          <Gauges stats={stats} player={player} />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.8rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'var(--lamp)' }}>
              The Oubliette
            </h1>
            <p className="etch-label" style={{ marginTop: 4 }}>
              One lock. One attempt. The gatekeeper rules under consensus.
            </p>
          </div>
          <button
            className="brass-btn"
            onClick={() => (wallet.address ? setAuthorOpen(true) : wallet.connect())}
            style={{ display: 'inline-flex', gap: 7, alignItems: 'center' }}
          >
            <Plus size={15} /> Forge a lock
          </button>
        </div>

        {data.loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '1rem' }}>
            <Skeleton height={360} />
          </div>
        ) : data.error && data.locks.length === 0 ? (
          <ErrorState message={friendlyError(data.error)} onRetry={data.refresh} />
        ) : data.locks.length === 0 ? (
          <EmptyVault
            walletConnected={!!wallet.address}
            onCreate={() => (wallet.address ? setAuthorOpen(true) : wallet.connect())}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr)',
              gap: '1.2rem',
            }}
            className="kiosk-grid"
          >
            <div style={{ display: 'grid', gap: '1.2rem' }} className="kiosk-main">
              <LockKiosk
                lock={activeLock}
                player={player}
                walletConnected={!!wallet.address}
                onConnect={wallet.connect}
                onAttempt={requestAttempt}
                tx={tx.state}
                lastVerdict={lastVerdict}
                onDismissVerdict={() => {
                  setLastVerdict(null);
                  tx.reset();
                }}
              />
            </div>
            <aside style={{ display: 'grid', gap: '1.2rem', alignContent: 'start' }} className="kiosk-aside">
              <div className="plate" style={{ padding: '1.3rem' }}>
                <VaultSpine
                  locks={data.locks}
                  activeId={activeId}
                  solvedIds={solvedIds}
                  onSelect={(id) => {
                    setActiveId(id);
                    setLastVerdict(null);
                    tx.reset();
                  }}
                />
              </div>
              <Chronicle entries={data.chronicle} />
            </aside>
          </div>
        )}

        {data.lastUpdated && Date.now() - data.lastUpdated > 120000 && (
          <p className="etch-label" style={{ textAlign: 'center', marginTop: '1rem' }}>
            Data may be stale. The next refresh is on its way.
          </p>
        )}
      </main>

      <Footer />

      <AuthorModal
        open={authorOpen}
        busy={authorBusy}
        onClose={() => !authorBusy && setAuthorOpen(false)}
        onSubmit={submitAuthor}
      />

      <ConfirmDialog
        open={pendingAttempt !== null}
        title="Submit an attempt on Bradbury"
        body="This sends a transaction to the GenLayer Bradbury testnet. Validators will run the AI gatekeeper under consensus, which can take a few minutes. Network fees apply (mostly refunded)."
        confirmLabel="Pull the lever"
        onCancel={() => setPendingAttempt(null)}
        onConfirm={() => {
          const t = pendingAttempt;
          setPendingAttempt(null);
          if (t) doAttempt(t);
        }}
      />

      <ToastStack toasts={toasts} dismiss={dismiss} />

      <style jsx global>{`
        @media (min-width: 900px) {
          .kiosk-grid {
            grid-template-columns: minmax(0, 1.7fr) minmax(300px, 1fr) !important;
          }
        }
      `}</style>
    </>
  );
}

async function fetchPlayerSafe(addr: string): Promise<PlayerState | null> {
  try {
    return await fetchPlayer(addr);
  } catch {
    return null;
  }
}

function Gauges({ stats, player }: { stats: ReturnType<typeof useContractData>['stats']; player: PlayerState | null }) {
  const items = [
    { icon: Layers, label: 'Locks forged', value: stats?.locks ?? 0, color: 'var(--brass)' },
    { icon: KeyRound, label: 'Attempts ruled', value: stats?.attempts ?? 0, color: 'var(--text-2)' },
    { icon: Award, label: 'Locks released', value: stats?.solves ?? 0, color: 'var(--verdigris-bright)' },
    { icon: Gauge, label: 'Your depth', value: player?.depth ?? 0, color: 'var(--lamp)' },
  ];
  return (
    <>
      {items.map((it, i) => (
        <motion.div
          key={it.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="plate"
          style={{ padding: '0.9rem 1rem', display: 'flex', gap: '0.7rem', alignItems: 'center' }}
        >
          <it.icon size={20} color={it.color} style={{ flexShrink: 0 }} />
          <div>
            <div className="mono tabnum" style={{ fontSize: '1.3rem', color: 'var(--lamp)', fontWeight: 700 }}>
              {it.value}
            </div>
            <div className="etch-label" style={{ fontSize: '0.56rem' }}>
              {it.label}
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
}
