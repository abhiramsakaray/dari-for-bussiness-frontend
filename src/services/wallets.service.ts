import api from './api';
import { BalanceDashboardResponse } from '../types/api.types';

export type ChainType = 'stellar' | 'ethereum' | 'polygon' | 'base' | 'tron';

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
export const CHAIN_INFO: Record<ChainType, { name: string; color: string; icon: string; tokens?: string[] }> = {
  stellar: { name: 'Stellar', color: 'blue', icon: '⭐', tokens: ['USDC', 'XLM'] },
  ethereum: { name: 'Ethereum', color: 'purple', icon: '⟠', tokens: ['USDC', 'USDT', 'ETH'] },
  polygon: { name: 'Polygon', color: 'violet', icon: '⬡', tokens: ['USDC', 'USDT', 'MATIC'] },
  base: { name: 'Base', color: 'indigo', icon: '🔵', tokens: ['USDC', 'ETH'] },
  tron: { name: 'Tron', color: 'red', icon: '◆', tokens: ['USDT', 'TRX'] },
};
