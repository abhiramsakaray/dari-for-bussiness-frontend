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
    const response = await api.get('/withdrawals/balance');
    return response.data;
  },

  getLimits: async (): Promise<WithdrawalLimitResponse> => {
    const response = await api.get('/withdrawals/limits');
    return response.data;
  },

  getAll: async (params?: WithdrawalFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<Withdrawal>> => {
    const response = await api.get('/withdrawals', { params });
    return response.data;
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
