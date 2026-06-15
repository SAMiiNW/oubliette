'use client';

import { useCallback, useEffect, useState } from 'react';
import { CHAIN_ID } from '@/lib/contract';

const BRADBURY_PARAMS = {
  chainId: '0x107D', // 4221
  chainName: 'GenLayer Bradbury Testnet',
  nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
  rpcUrls: ['https://rpc-bradbury.genlayer.com'],
  blockExplorerUrls: ['https://explorer-bradbury.genlayer.com/'],
};

interface Eip1193 {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
}

function getProvider(): Eip1193 | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { ethereum?: Eip1193 };
  return w.ethereum ?? null;
}

export interface WalletState {
  address: `0x${string}` | null;
  chainId: number | null;
  connecting: boolean;
  hasProvider: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  onCorrectChain: boolean;
}

export function useWallet(): WalletState {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasProvider, setHasProvider] = useState(false);

  useEffect(() => {
    setHasProvider(!!getProvider());
  }, []);

  const refreshChain = useCallback(async () => {
    const p = getProvider();
    if (!p) return;
    try {
      const cid = (await p.request({ method: 'eth_chainId' })) as string;
      setChainId(parseInt(cid, 16));
    } catch {
      /* ignore */
    }
  }, []);

  const connect = useCallback(async () => {
    const p = getProvider();
    if (!p) {
      setError('No wallet detected.');
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      const accounts = (await p.request({ method: 'eth_requestAccounts' })) as string[];
      try {
        await p.request({ method: 'wallet_addEthereumChain', params: [BRADBURY_PARAMS] });
      } catch {
        /* chain may already exist */
      }
      try {
        await p.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BRADBURY_PARAMS.chainId }],
        });
      } catch {
        /* user may decline switch */
      }
      setAddress((accounts[0] as `0x${string}`) ?? null);
      await refreshChain();
    } catch (e) {
      if (/4001|rejected|denied/i.test(String(e))) setError('You cancelled the connection.');
      else setError('Could not connect to your wallet.');
    } finally {
      setConnecting(false);
    }
  }, [refreshChain]);

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  useEffect(() => {
    const p = getProvider();
    if (!p || !p.on) return;
    const onAccounts = (...args: unknown[]) => {
      const accs = args[0] as string[];
      if (!accs || accs.length === 0) setAddress(null);
      else setAddress(accs[0] as `0x${string}`);
    };
    const onChain = (...args: unknown[]) => {
      const cid = args[0] as string;
      setChainId(parseInt(cid, 16));
    };
    p.on('accountsChanged', onAccounts);
    p.on('chainChanged', onChain);
    return () => {
      p.removeListener?.('accountsChanged', onAccounts);
      p.removeListener?.('chainChanged', onChain);
    };
  }, []);

  return {
    address,
    chainId,
    connecting,
    hasProvider,
    error,
    connect,
    disconnect,
    onCorrectChain: chainId === CHAIN_ID,
  };
}
