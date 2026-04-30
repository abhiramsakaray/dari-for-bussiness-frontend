import api from './api';

export type PlanTier = 'free' | 'growth' | 'business' | 'enterprise';

// Plan features structure from backend
export interface PlanFeaturesInfo {
  transaction_fee: string;
  monthly_volume_limit: number | null;
  payment_links: number | null;
  invoices: number | null;
  team_members: number | null;
}

// Individual plan info from backend
export interface PlanInfo {
  id: string;
  name: string;
  price: number;
  currency: string;
  billing_period: string;
  features: PlanFeaturesInfo;
}

// Actual API response structure
export interface BillingInfo {
  tier: PlanTier;
  status: 'active' | 'canceled' | 'past_due' | 'trial';
  monthly_price: number;
  currency: string; // Merchant's currency (e.g., "USD", "INR", "EUR")
  transaction_fee_percent: number;
  monthly_volume_limit: number | null;
  payment_link_limit: number | null;
  invoice_limit: number | null;
  team_member_limit: number | null;
  current_volume: number;
  current_payment_links: number;
  current_invoices: number;
  current_period_start: string; // ISO date string
  current_period_end: string; // ISO date string
  trial_ends_at: string | null;
  available_plans?: Record<string, PlanInfo>; // All plans in merchant's currency
}

// Plan features for display
export interface PlanFeatures {
  monthly_volume_limit: number | null; // null = unlimited
  payment_links_limit: number | null;
  invoices_limit: number | null;
  team_members_limit: number | null;
  has_recurring_payments: boolean;
  has_subscriptions: boolean;
  has_full_api_access: boolean;
  has_webhooks: boolean;
  has_custom_branding: boolean;
  has_multi_chain: boolean;
  has_advanced_analytics: boolean;
  has_fraud_monitoring: boolean;
  has_white_label: boolean;
  has_dedicated_support: boolean;
  transaction_fee_min: number; // percentage
  transaction_fee_max: number; // percentage
}

export interface PlanDetails {
  id: PlanTier;
  name: string;
  price: number; // in cents, 0 for free
  currency: string; // NEW: Currency code for the price
  period: 'month' | 'year';
  features: PlanFeatures;
  description: string;
}

export interface Subscription {
  id: string;
  merchant_id: string;
  plan: PlanTier;
  status: 'active' | 'canceled' | 'past_due' | 'trial';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
  created_at: string;
  updated_at: string;
}

export interface UsageStats {
  current_period_start: string;
  current_period_end: string;
  transaction_volume: number;
  payment_links_created: number;
  invoices_created: number;
  team_members_count: number;
  api_calls_count: number;
}

// Old interface kept for legacy code
export interface BillingInfoLegacy {
  subscription: Subscription;
  plan_details: PlanDetails;
  usage: UsageStats;
  available_plans: PlanDetails[];
}

export const billingService = {
  // Get current billing information
  getBillingInfo: async () => {
    const response = await api.get<BillingInfo>('/billing/info');
    return response.data;
  },

  // Get available plans
  getAvailablePlans: async () => {
    const response = await api.get<PlanDetails[]>('/billing/plans');
    return response.data;
  },

  // Upgrade/downgrade plan
  changePlan: async (planId: PlanTier) => {
    const response = await api.post<{ message: string; subscription: Subscription }>(
      '/billing/change-plan',
      { plan: planId }
    );
    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async () => {
    const response = await api.post<{ message: string; subscription: Subscription }>(
      '/billing/cancel'
    );
    return response.data;
  },

  // Reactivate subscription
  reactivateSubscription: async () => {
    const response = await api.post<{ message: string; subscription: Subscription }>(
      '/billing/reactivate'
    );
    return response.data;
  },

  // Get usage statistics
  getUsage: async () => {
    const response = await api.get<UsageStats>('/billing/usage');
    return response.data;
  },

  // Check if feature is available for current plan
  hasFeature: (features: PlanFeatures, feature: keyof PlanFeatures): boolean => {
    return features[feature] as boolean;
  },

  // Check if limit is exceeded
  isLimitExceeded: (
    usage: number,
    limit: number | null
  ): boolean => {
    if (limit === null) return false; // unlimited
    return usage >= limit;
  },
};

// Helper to get plan display info
export const PLAN_INFO: Record<PlanTier, { name: string; color: string }> = {
  free: { name: 'Free', color: 'gray' },
  growth: { name: 'Growth', color: 'blue' },
  business: { name: 'Business', color: 'purple' },
  enterprise: { name: 'Enterprise', color: 'gold' },
};
