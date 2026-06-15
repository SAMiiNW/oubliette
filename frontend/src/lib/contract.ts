import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';
import type { GenLayerClient } from 'genlayer-js/types';

// Real deployed contract on GenLayer Bradbury testnet. Verified end to end:
// stats read returns live data and a winning attempt advanced a player on-chain
// before this constant was written.
export const CONTRACT_ADDRESS = '0x17ac6cA53d912810c115B659b958839A2Cb5b08a' as const;
export const DEPLOY_TX =
  '0x7c4426e012ff5d6aa5bccf25e00e7900fe143385244adf0ebcefe538b999a85f' as const;
export const EXPLORER = 'https://explorer-bradbury.genlayer.com';
export const FAUCET = 'https://testnet-faucet.genlayer.foundation/';
export const CHAIN_ID = 4221;

export const readClient = createClient({ chain: testnetBradbury });

export type WalletClient = GenLayerClient<typeof testnetBradbury>;

export function makeWalletClient(account: `0x${string}`): GenLayerClient<typeof testnetBradbury> {
  // Passing the account as an address string routes signing methods
  // (eth_sendTransaction) to window.ethereum, which genlayer-js detects.
  return createClient({ chain: testnetBradbury, account });
}

export async function withRpcRetry<T>(fn: () => Promise<T>, tries = 4): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (!/rate limit|429|timeout|network|fetch|failed/i.test(String(e))) throw e;
      await new Promise((r) => setTimeout(r, 2500 * 2 ** i));
    }
  }
  throw last;
}

// ----- domain types ---------------------------------------------------------

export interface Lock {
  id: string;
  title: string;
  riddle: string;
  depth: number;
  author: string;
  status: string;
  attempts: number;
  solves: number;
}

export interface ChronicleEntry {
  lock: string;
  lock_title: string;
  actor: string;
  ruling: string;
  ingenuity: number;
  note: string;
  advanced: boolean;
  seq: number;
}

export interface PlayerState {
  actor: string;
  depth: number;
  solved: string[];
  attempts: number;
  best: number;
}

export interface Stats {
  locks: number;
  attempts: number;
  solves: number;
  chronicle: number;
}

export interface Verdict {
  lock: string;
  ruling: string;
  ingenuity: number;
  note: string;
  advanced: boolean;
  depth: number;
}

// genlayer-js returns plain objects / maps depending on version; coerce safely.
function asObj(v: unknown): Record<string, unknown> {
  if (v instanceof Map) return Object.fromEntries(v) as Record<string, unknown>;
  if (v && typeof v === 'object') return v as Record<string, unknown>;
  return {};
}
function num(v: unknown): number {
  const n = typeof v === 'bigint' ? Number(v) : Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}
function str(v: unknown): string {
  return v === undefined || v === null ? '' : String(v);
}

function toLock(raw: unknown): Lock {
  const o = asObj(raw);
  return {
    id: str(o.id),
    title: str(o.title),
    riddle: str(o.riddle),
    depth: num(o.depth),
    author: str(o.author),
    status: str(o.status) || 'OPEN',
    attempts: num(o.attempts),
    solves: num(o.solves),
  };
}

function toChronicle(raw: unknown): ChronicleEntry {
  const o = asObj(raw);
  return {
    lock: str(o.lock),
    lock_title: str(o.lock_title),
    actor: str(o.actor),
    ruling: str(o.ruling),
    ingenuity: num(o.ingenuity),
    note: str(o.note),
    advanced: Boolean(o.advanced),
    seq: num(o.seq),
  };
}

// ----- reads ----------------------------------------------------------------

export async function fetchLocks(start = 0): Promise<Lock[]> {
  const res = await withRpcRetry(() =>
    readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_locks',
      args: [start],
    }),
  );
  return Array.isArray(res) ? res.map(toLock) : [];
}

export async function fetchChronicle(start = 0): Promise<ChronicleEntry[]> {
  const res = await withRpcRetry(() =>
    readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_chronicle',
      args: [start],
    }),
  );
  return Array.isArray(res) ? res.map(toChronicle) : [];
}

export async function fetchStats(): Promise<Stats> {
  const res = await withRpcRetry(() =>
    readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_stats',
      args: [],
    }),
  );
  const o = asObj(res);
  return {
    locks: num(o.locks),
    attempts: num(o.attempts),
    solves: num(o.solves),
    chronicle: num(o.chronicle),
  };
}

export async function fetchPlayer(actor: string): Promise<PlayerState> {
  const res = await withRpcRetry(() =>
    readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_player',
      args: [actor],
    }),
  );
  const o = asObj(res);
  const solvedRaw = o.solved;
  return {
    actor: str(o.actor) || actor,
    depth: num(o.depth),
    solved: Array.isArray(solvedRaw) ? solvedRaw.map(str) : [],
    attempts: num(o.attempts),
    best: num(o.best),
  };
}

// ----- writes ---------------------------------------------------------------

export async function sendAuthorLock(
  client: GenLayerClient<typeof testnetBradbury>,
  title: string,
  riddle: string,
  rationale: string,
): Promise<`0x${string}`> {
  return client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'author_lock',
    args: [title, riddle, rationale],
    value: 0n,
  });
}

export async function sendAttempt(
  client: GenLayerClient<typeof testnetBradbury>,
  lockId: string,
  text: string,
): Promise<`0x${string}`> {
  return client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'attempt_lock',
    args: [lockId, text],
    value: 0n,
  });
}
