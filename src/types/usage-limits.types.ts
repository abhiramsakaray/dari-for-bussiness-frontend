/**
 * Type definitions for Usage Limits feature
 * 
 * These types ensure type safety across the usage limits implementation.
 */

export type LimitAction = 
  | 'create_payment'
  | 'create_payment_link'
  | 'create_invoice'
  | 'add_team_member'
  | 'create_subscription_plan'
  | 'accept_subscription';

export type LimitType = 
  | 'transaction_volume'
  | 'payment_links'
  | 'invoices'
  | 'team_members'
  | 'subscription_plans'
  | 'active_subscriptions';

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

export interface LimitCheckResult {
  allowed: boolean;
  showUpgradeModal: boolean;
  upgradeModalData: {
    title: string;
    message: string;
    currentPlan: string;
  } | null;
}

/**
 * Plan tier type
 */
export type PlanTier = 'free' | 'growth' | 'business' | 'enterprise';

/**
 * Plan limits by tier
 */
export interface PlanLimits {
  free: {
    transaction_volume: 120; // USD
    payment_links: 5;
    invoices: 5;
    team_members: 1;
    subscription_plans: 0;
    active_subscriptions: 0;
  };
  growth: {
    transaction_volume: 600; // USD
    payment_links: 15;
    invoices: 15;
    team_members: 3;
    subscription_plans: 3;
    active_subscriptions: 100;
  };
  business: {
    transaction_volume: 6000; // USD
    payment_links: 100;
    invoices: 100;
    team_members: 25;
    subscription_plans: 10;
    active_subscriptions: null; // Unlimited
  };
  enterprise: {
    transaction_volume: null; // Unlimited
    payment_links: null; // Unlimited
    invoices: null; // Unlimited
    team_members: null; // Unlimited
    subscription_plans: null; // Unlimited
    active_subscriptions: null; // Unlimited
  };
}

/**
 * Supported currencies for transaction volume limits
 */
export type SupportedCurrency = 
  | 'USD'
  | 'INR'
  | 'EUR'
  | 'GBP'
  | 'AED'
  | 'SAR';

/**
 * Currency conversion rates (example structure)
 */
export interface CurrencyRates {
  USD: 1;
  INR: number;
  EUR: number;
  GBP: number;
  AED: number;
  SAR: number;
}
