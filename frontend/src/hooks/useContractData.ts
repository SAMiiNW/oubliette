'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchLocks,
  fetchChronicle,
  fetchStats,
  type Lock,
  type ChronicleEntry,
  type Stats,
} from '@/lib/contract';

const POLL_MS = 95000;

export interface ContractData {
  locks: Lock[];
  chronicle: ChronicleEntry[];
  stats: Stats | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => Promise<void>;
  setTxInFlight: (v: boolean) => void;
}

export function useContractData(): ContractData {
  const [locks, setLocks] = useState<Lock[]>([]);
  const [chronicle, setChronicle] = useState<ChronicleEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const alive = useRef(true);
  const txInFlight = useRef(false);

  const load = useCallback(async (initial = false) => {
    if (txInFlight.current) return;
    if (initial) setLoading(true);
    try {
      const [s, ls, ch] = await Promise.all([fetchStats(), fetchLocks(0), fetchChronicle(0)]);
      if (!alive.current) return;
      setStats(s);
      setLocks(ls);
      setChronicle(ch);
      setError(null);
      setLastUpdated(Date.now());
    } catch (e) {
      if (!alive.current) return;
      setError(String(e));
    } finally {
      if (alive.current && initial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    load(true);
    const id = setInterval(() => load(false), POLL_MS);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, [load]);

  const refresh = useCallback(async () => {
    await load(false);
  }, [load]);

  const setTxInFlight = useCallback((v: boolean) => {
    txInFlight.current = v;
  }, []);

  // Stats are authoritative from the contract, but derive a safe fallback.
  const safeStats = useMemo(() => {
    if (stats) return stats;
    return {
      locks: locks.length,
      attempts: chronicle.length,
      solves: chronicle.filter((c) => c.advanced).length,
      chronicle: chronicle.length,
    } as Stats;
  }, [stats, locks, chronicle]);

  return {
    locks,
    chronicle,
    stats: safeStats,
    loading,
    error,
    lastUpdated,
    refresh,
    setTxInFlight,
  };
}
