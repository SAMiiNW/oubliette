'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import Header from '@/components/Header';
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

      <main className="kiosk-screen">
        {data.loading ? (
          <div className="kiosk-stage">
            <Skeleton height={420} />
          </div>
        ) : data.error && data.locks.length === 0 ? (
          <div className="kiosk-stage">
            <ErrorState message={friendlyError(data.error)} onRetry={data.refresh} />
          </div>
        ) : data.locks.length === 0 ? (
          <div className="kiosk-stage">
            <EmptyVault
              walletConnected={!!wallet.address}
              onCreate={() => (wallet.address ? setAuthorOpen(true) : wallet.connect())}
            />
          </div>
        ) : (
          <div className="kiosk-layout">
            {/* Left: the progress spine, a vertical rail of vault doors */}
            <aside className="kiosk-rail">
              <div className="rail-readout mono">
                <span>
                  vault depth <b>{player?.depth ?? 0}</b>
                  <i> / </i>
                  {stats?.locks ?? 0}
                </span>
                <span>
                  {stats?.solves ?? 0} released
                  <i> . </i>
                  {stats?.attempts ?? 0} tried
                </span>
              </div>
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
              <button
                className="ghost-btn"
                onClick={() => (wallet.address ? setAuthorOpen(true) : wallet.connect())}
                style={{ display: 'inline-flex', gap: 7, alignItems: 'center', justifyContent: 'center', marginTop: '0.4rem' }}
              >
                <Plus size={13} /> Forge a lock
              </button>
            </aside>

            {/* Right: one focused mechanism fills the screen */}
            <section className="kiosk-stage">
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
              <Chronicle entries={data.chronicle} />
              {data.lastUpdated && Date.now() - data.lastUpdated > 120000 && (
                <p className="etch-label" style={{ textAlign: 'center' }}>
                  Data may be stale. The next refresh is on its way.
                </p>
              )}
            </section>
          </div>
        )}
      </main>

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
        .kiosk-screen {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 1.5rem 1.5rem 3rem;
        }
        .kiosk-stage {
          display: grid;
          gap: 1.2rem;
          align-content: start;
          min-width: 0;
        }
        .kiosk-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 1.4rem;
        }
        .kiosk-rail {
          display: grid;
          gap: 1rem;
          align-content: start;
        }
        .rail-readout {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          font-size: 0.72rem;
          color: var(--text-3);
        }
        .rail-readout b {
          color: var(--lamp);
          font-variant-numeric: tabular-nums;
        }
        .rail-readout i {
          color: var(--text-3);
          font-style: normal;
        }
        @media (min-width: 900px) {
          .kiosk-layout {
            grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
            align-items: start;
          }
          .kiosk-rail {
            position: sticky;
            top: 84px;
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
