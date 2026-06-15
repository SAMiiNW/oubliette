'use client';

import { useCallback, useRef, useState } from 'react';
import { makeWalletClient } from '@/lib/contract';
import { pollUntilDecided, type LeaderDraft } from '@/lib/poll';
import { friendlyError } from '@/lib/format';

export type TxPhase = 'idle' | 'wallet' | 'submitted' | 'consensus' | 'confirmed' | 'error';

export interface TxState {
  phase: TxPhase;
  hash: `0x${string}` | null;
  liveStatus: string | null;
  draft: LeaderDraft | null;
  error: string | null;
}

const INITIAL: TxState = {
  phase: 'idle',
  hash: null,
  liveStatus: null,
  draft: null,
  error: null,
};

export interface RunTxArgs {
  account: `0x${string}`;
  send: (client: ReturnType<typeof makeWalletClient>) => Promise<`0x${string}`>;
  onConfirmed?: (draft: LeaderDraft | null, status: string) => void;
}

export function useTransaction() {
  const [state, setState] = useState<TxState>(INITIAL);
  const busy = useRef(false);

  const reset = useCallback(() => {
    busy.current = false;
    setState(INITIAL);
  }, []);

  const run = useCallback(async ({ account, send, onConfirmed }: RunTxArgs) => {
    if (busy.current) return;
    busy.current = true;
    setState({ ...INITIAL, phase: 'wallet' });
    try {
      const client = makeWalletClient(account);
      const hash = await send(client);
      setState((s) => ({ ...s, phase: 'submitted', hash }));
      setState((s) => ({ ...s, phase: 'consensus', liveStatus: 'PENDING' }));

      const { status, draft } = await pollUntilDecided(client, hash, (st, dr) => {
        setState((s) => ({ ...s, liveStatus: st, draft: dr ?? s.draft }));
      });

      if (status === 'ACCEPTED' || status === 'FINALIZED') {
        setState((s) => ({ ...s, phase: 'confirmed', liveStatus: status, draft }));
        onConfirmed?.(draft, status);
      } else if (status === 'TIMEOUT') {
        setState((s) => ({
          ...s,
          phase: 'error',
          error: 'The network is congested. Your transaction is still being processed.',
        }));
      } else {
        setState((s) => ({
          ...s,
          phase: 'error',
          error:
            status === 'UNDETERMINED'
              ? 'Validators could not reach consensus on this ruling. Please try again.'
              : `Transaction ended as ${status}.`,
        }));
      }
    } catch (e) {
      setState((s) => ({ ...s, phase: 'error', error: friendlyError(e) }));
    } finally {
      busy.current = false;
    }
  }, []);

  return { state, run, reset };
}
