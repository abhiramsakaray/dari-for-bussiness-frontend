import api from './api';

export interface UsageLimits {
  transaction_volume: number | null;
  payment_links: number | null;
  invoices: number | null;
  team_members: number | null;
  subscription_plans: number | null;
  active_subscriptions: number | null;
}

export interface UsageData {
  transaction_volume: number;
  payment_links: number;
  invoices: number;
  team_members: number;
  subscription_plans: number;
  active_subscriptions: number;
}

export interface UsagePercentages {
  transaction_volume: number;
  payment_links: number;
  invoices: number;
  team_members: number;
  subscription_plans: number;
  active_subscriptions: number;
}

export interface UsageWarnings {
  transaction_volume: boolean;
  payment_links: boolean;
  invoices: boolean;
  team_members: boolean;
  subscription_plans: boolean;
  active_subscriptions: boolean;
}

export interface UsageResponse {
  plan: string;
  plan_name: string;
  currency: string;
  limits: UsageLimits;
  usage: UsageData;
  percentages: UsagePercentages;
  warnings: UsageWarnings;
  at_limit: UsageWarnings;
}

export type LimitAction = 
  | 'create_payment'
  | 'create_payment_link'
  | 'create_invoice'
  | 'add_team_member'
  | 'create_subscription_plan'
  | 'accept_subscription';

export interface CheckLimitRequest {
  action: LimitAction;
  amount?: number;
  currency?: string;
}

export interface CheckLimitResponse {
  allowed: boolean;
  current_usage: number;
  limit: number | null;
  percentage: number;
  warning_90: boolean;
  at_limit: boolean;
  message: string;
  plan_name: string;
  upgrade_required: boolean;
}

export interface LimitExceededError {
  error: 'limit_exceeded';
  message: string;
  limit_type: string;
  current_usage: number;
  limit: number;
  plan: string;
  currency: string;
  upgrade_url: string;
}

export const usageLimitsService = {
  // Get current usage and limits
  getUsage: async (): Promise<UsageResponse> => {
    const response = await api.get<UsageResponse>('/api/v1/merchants/usage');
    return response.data;
  },

  // Check if a specific action is allowed
  checkLimit: async (request: CheckLimitRequest): Promise<CheckLimitResponse> => {
    const response = await api.post<CheckLimitResponse>('/api/v1/merchants/check-limit', request);
    return response.data;
  },

  // Helper to format currency
  formatCurrency: (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  // Helper to format limit (handles null for unlimited)
  formatLimit: (value: number | null): string => {
    return value === null ? 'Unlimited' : value.toLocaleString();
  },

  // Helper to get progress bar color based on percentage
  getProgressColor: (percentage: number): string => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 90) return 'bg-yellow-500';
    return 'bg-blue-500';
  },

  // Helper to check if any warnings exist
  hasAnyWarnings: (warnings: UsageWarnings): boolean => {
    return Object.values(warnings).some(w => w);
  },

  // Helper to check if any limits are reached
  hasAnyLimitsReached: (atLimit: UsageWarnings): boolean => {
    return Object.values(atLimit).some(a => a);
  },
};
