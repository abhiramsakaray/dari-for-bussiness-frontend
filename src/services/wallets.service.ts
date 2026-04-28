import api from './api';
import { BalanceDashboardResponse } from '../types/api.types';

export type ChainType = 'stellar' | 'ethereum' | 'polygon' | 'base' | 'bsc' | 'avalanche' | 'tron' | 'arbitrum' | 'solana';

export interface Wallet {
  id: string;
  chain: ChainType;
  wallet_address: string;
  is_active: boolean;
  created_at: string;
}

export interface WalletsResponse {
  wallets: Wallet[];
}

export const walletsService = {
  // Get all wallets for merchant
  getAllWallets: async () => {
    const response = await api.get<WalletsResponse>('/merchant/wallets');
    return response.data;
  },

  // Get wallet dashboard (balance overview)
  getDashboard: async () => {
    const response = await api.get<BalanceDashboardResponse>('/merchant/wallets/balance');
    return response.data;
  },

  // Get wallet for specific chain
  getWalletByChain: async (chain: ChainType) => {
    const response = await api.get<Wallet>(`/merchant/wallets/${chain}`);
    return response.data;
  },

  // Toggle wallet active status
  toggleWalletStatus: async (walletId: string, isActive: boolean) => {
    const response = await api.patch<Wallet>(`/merchant/wallets/${walletId}`, {
      is_active: isActive,
    });
    return response.data;
  },
};

// Helper to get chain display info
export const CHAIN_INFO: Record<string, { name: string; color: string; icon: string; tokens?: string[] }> = {
  stellar: { name: 'Stellar', color: 'blue', icon: '⭐', tokens: ['USDC', 'XLM'] },
  ethereum: { name: 'Ethereum', color: 'purple', icon: '⟠', tokens: ['USDC', 'USDT', 'ETH'] },
  polygon: { name: 'Polygon', color: 'violet', icon: '⬡', tokens: ['USDC', 'USDT', 'MATIC'] },
  base: { name: 'Base', color: 'indigo', icon: '🔵', tokens: ['USDC', 'ETH'] },
  bsc: { name: 'BNB Smart Chain', color: 'yellow', icon: '🔶', tokens: ['USDC', 'USDT', 'BNB'] },
  avalanche: { name: 'Avalanche', color: 'red', icon: '🔺', tokens: ['USDC', 'USDT', 'AVAX'] },
  tron: { name: 'Tron', color: 'red', icon: '◆', tokens: ['USDT', 'TRX'] },
  arbitrum: { name: 'Arbitrum', color: 'blue', icon: '🔷', tokens: ['USDC', 'USDT', 'ETH'] },
  solana: { name: 'Solana', color: 'purple', icon: '◎', tokens: ['USDC', 'USDT', 'SOL'] },
};

// Block explorer base URLs per chain (mainnet)
export const BLOCK_EXPLORERS: Record<string, string> = {
  stellar: 'https://stellar.expert/explorer/public',
  ethereum: 'https://etherscan.io',
  polygon: 'https://polygonscan.com',
  base: 'https://basescan.org',
  bsc: 'https://bscscan.com',
  avalanche: 'https://snowtrace.io',
  tron: 'https://tronscan.org',
  arbitrum: 'https://arbiscan.io',
  solana: 'https://solscan.io',
};

// Testnet block explorer base URLs
export const BLOCK_EXPLORERS_TESTNET: Record<string, string> = {
  stellar: 'https://stellar.expert/explorer/testnet',
  ethereum: 'https://sepolia.etherscan.io',
  polygon: 'https://amoy.polygonscan.com',
  base: 'https://sepolia.basescan.org',
  bsc: 'https://testnet.bscscan.com',
  avalanche: 'https://testnet.snowtrace.io',
  tron: 'https://nile.tronscan.org',
  arbitrum: 'https://sepolia.arbiscan.io',
  solana: 'https://solscan.io?cluster=devnet',
};

/**
 * Get the block explorer transaction URL for a given chain and tx hash.
 * Uses testnet explorers in development, mainnet in production.
 */
export function getExplorerTxUrl(chain: string | null | undefined, txHash: string): string {
  const isTestnet = import.meta.env.DEV || import.meta.env.VITE_USE_TESTNET === 'true';
  const explorers = isTestnet ? BLOCK_EXPLORERS_TESTNET : BLOCK_EXPLORERS;
  const baseUrl = explorers[chain || ''] || explorers['stellar'];

  // Stellar uses a different path format
  if (chain === 'stellar') {
    return `${baseUrl}/tx/${txHash}`;
  }
  // Tron uses a different path format
  if (chain === 'tron') {
    return `${baseUrl}/#/transaction/${txHash}`;
  }
  // Solana uses a different path format
  if (chain === 'solana') {
    return `${baseUrl}/tx/${txHash}`;
  }
  // All EVM chains (ethereum, polygon, base, bsc, avalanche, arbitrum)
  return `${baseUrl}/tx/${txHash}`;
}

/**
 * Get the block explorer address URL for a given chain and address.
 */
export function getExplorerAddressUrl(chain: string | null | undefined, address: string): string {
  const isTestnet = import.meta.env.DEV || import.meta.env.VITE_USE_TESTNET === 'true';
  const explorers = isTestnet ? BLOCK_EXPLORERS_TESTNET : BLOCK_EXPLORERS;
  const baseUrl = explorers[chain || ''] || explorers['stellar'];

  if (chain === 'stellar') {
    return `${baseUrl}/account/${address}`;
  }
  if (chain === 'tron') {
    return `${baseUrl}/#/address/${address}`;
  }
  if (chain === 'solana') {
    return `${baseUrl}/account/${address}`;
  }
  return `${baseUrl}/address/${address}`;
}
