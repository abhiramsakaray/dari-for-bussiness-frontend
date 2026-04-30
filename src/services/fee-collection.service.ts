import api from './api';

export interface PlatformWallet {
  stellar: string;
  polygon: string;
  ethereum: string;
  tron?: string;
  solana?: string;
}

export interface PlatformWalletsResponse {
  platform_wallets: PlatformWallet;
  configured_count: number;
  total_chains: number;
}

export interface ChainStats {
  chain: string;
  token: string;
  transaction_count: number;
  volume: number;
  estimated_fees: number;
}

export interface FeeStatsResponse {
  period_days: number;
  start_date: string;
  end_date: string;
  total_volume: number;
  total_estimated_fees: number;
  average_fee_percent: number;
  stats_by_chain: ChainStats[];
}

export interface FeeByChainToken {
  chain: string;
  token: string;
  total_fee: number;
  transaction_count: number;
  total_volume: number;
}

export interface TransactionDetail {
  payment_id: string;
  chain: string;
  token: string;
  amount: number;
  fee: number;
  paid_at: string;
}

export interface MerchantFeeReportResponse {
  merchant_id: string;
  merchant_name: string;
  fee_percent: number;
  period_start: string;
  period_end: string;
  total_transactions: number;
  fees_by_chain_token: FeeByChainToken[];
  transaction_details: TransactionDetail[];
}

export interface CollectionResult {
  chain: string;
  token: string;
  amount: number;
  status: string;
  tx_hash?: string;
}

export interface CollectFeesResponse {
  success: boolean;
  message: string;
  fee_data: {
    merchant_id: string;
    merchant_name: string;
    fee_percent: number;
    total_transactions: number;
    fees_by_chain_token: FeeByChainToken[];
  };
  collection_results: CollectionResult[];
}

export interface CollectAllFeesResponse {
  success: boolean;
  message: string;
}

export const feeCollectionService = {
  // Get platform wallets
  getPlatformWallets: async (): Promise<PlatformWalletsResponse> => {
    const response = await api.get<PlatformWalletsResponse>('/admin/fees/platform-wallets');
    return response.data;
  },

  // Get fee statistics
  getFeeStats: async (days: number = 30): Promise<FeeStatsResponse> => {
    const response = await api.get<FeeStatsResponse>(`/admin/fees/stats?days=${days}`);
    return response.data;
  },

  // Get merchant fee report
  getMerchantFeeReport: async (
    merchantId: string,
    startDate: string,
    endDate: string
  ): Promise<MerchantFeeReportResponse> => {
    const response = await api.get<MerchantFeeReportResponse>(
      `/admin/fees/report/${merchantId}?start_date=${startDate}&end_date=${endDate}`
    );
    return response.data;
  },

  // Manually collect fees for a merchant
  collectFees: async (merchantId: string, date: string): Promise<CollectFeesResponse> => {
    const response = await api.post<CollectFeesResponse>('/admin/fees/collect', {
      merchant_id: merchantId,
      date,
    });
    return response.data;
  },

  // Collect fees for all merchants
  collectAllFees: async (date?: string): Promise<CollectAllFeesResponse> => {
    const url = date ? `/admin/fees/collect-all?date=${date}` : '/admin/fees/collect-all';
    const response = await api.post<CollectAllFeesResponse>(url);
    return response.data;
  },

  // Format date for API
  formatDate: (date: Date): string => {
    return date.toISOString().split('T')[0];
  },

  // Get date range for last N days
  getDateRange: (days: number): { startDate: string; endDate: string } => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return {
      startDate: feeCollectionService.formatDate(startDate),
      endDate: feeCollectionService.formatDate(endDate),
    };
  },
};
