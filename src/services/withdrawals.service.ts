import { api } from './api';
import {
  Withdrawal,
  WithdrawalBalance,
  WithdrawalLimitResponse,
  CreateWithdrawalRequest,
  WithdrawalFilters,
  PaginatedResponse
} from '../types/api.types';

export const withdrawalsService = {
  getBalances: async (): Promise<WithdrawalBalance[]> => {
    // Use merchant/wallets/balance endpoint which includes chain-specific data
    const response = await api.get('/merchant/wallets/balance');
    return response.data;
  },

  getLimits: async (): Promise<WithdrawalLimitResponse> => {
    const response = await api.get('/withdrawals/limits');
    return response.data;
  },

  getAll: async (params?: WithdrawalFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<Withdrawal>> => {
    const response = await api.get('/withdrawals', { params });
    const data = response.data;
    // Backend returns { withdrawals, total, page, per_page, total_pages } -- map to { items, ... }
    return {
      items: data.withdrawals || [],
      total: data.total || 0,
      page: data.page || 1,
      page_size: data.per_page || 10,
      pages: data.total_pages || 1,
    };
  },

  getOne: async (id: string): Promise<Withdrawal> => {
    const response = await api.get(`/withdrawals/${id}`);
    return response.data;
  },

  create: async (data: CreateWithdrawalRequest): Promise<Withdrawal> => {
    const response = await api.post('/withdrawals', data);
    return response.data;
  },

  cancel: async (id: string): Promise<void> => {
    await api.post(`/withdrawals/${id}/cancel`);
  }
};
