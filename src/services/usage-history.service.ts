import api from './api';

export interface PeriodUsage {
  period_start: string;
  period_end: string;
  tier: string;
  total_volume: number;
  volume_limit: number;
  payment_links_created: number;
  invoices_created: number;
  currency: string;
  currency_symbol: string;
}

export interface UsageHistoryResponse {
  current_period: PeriodUsage;
  past_periods: PeriodUsage[];
}

export const usageHistoryService = {
  // Get historical usage
  getHistory: async (limit: number = 6): Promise<UsageHistoryResponse> => {
    const response = await api.get<UsageHistoryResponse>(
      `/subscription/usage/history?limit=${limit}`
    );
    return response.data;
  },

  // Calculate days remaining in period
  getDaysRemaining: (periodEnd: string): number => {
    const end = new Date(periodEnd);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  },

  // Calculate period progress percentage
  getPeriodProgress: (periodStart: string, periodEnd: string): number => {
    const start = new Date(periodStart).getTime();
    const end = new Date(periodEnd).getTime();
    const now = new Date().getTime();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  },

  // Format date for display
  formatDate: (dateString: string, locale: string = 'en-IN'): string => {
    return new Date(dateString).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  },

  // Calculate usage change percentage
  calculateChange: (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },
};
