// ============================================================================
// COMMON TYPES
// ============================================================================

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

export type ApiError = {
  detail: string;
  code?: string;
};

// ============================================================================
// PAYMENT LINKS
// ============================================================================

export type PaymentLink = {
  id: string;
  merchant_id: string;
  name: string;
  description?: string;
  amount_fiat?: number;
  fiat_currency: string;
  is_amount_fixed: boolean;
  accepted_tokens: string[];
  accepted_chains: string[];
  success_url?: string;
  cancel_url?: string;
  is_active: boolean;
  is_single_use: boolean;
  expires_at?: string;
  view_count: number;
  payment_count: number;
  total_collected_usd: number;
  checkout_url: string;
  created_at: string;
  updated_at?: string;
};

export type CreatePaymentLinkInput = {
  name: string;
  description?: string;
  amount_fiat?: number;
  fiat_currency?: string;
  is_amount_fixed?: boolean;
  accepted_tokens: string[];
  accepted_chains: string[];
  success_url?: string;
  cancel_url?: string;
  is_single_use?: boolean;
  expires_at?: string;
};

export type UpdatePaymentLinkInput = Partial<Omit<CreatePaymentLinkInput, 'accepted_tokens' | 'accepted_chains'>> & {
  is_active?: boolean;
};

export type PaymentLinkAnalytics = {
  link_id: string;
  views: number;
  payments: number;
  conversion_rate: number;
  total_collected_usd: number;
  recent_payments: PaymentSession[];
};

// ============================================================================
// INVOICES
// ============================================================================

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export type InvoiceLineItem = {
  description: string;
  quantity: number;
  unit_price: number;
  total?: number;
};

export type Invoice = {
  id: string;
  invoice_number: string;
  merchant_id: string;
  customer_email: string;
  customer_name?: string;
  customer_address?: string;
  description?: string;
  line_items: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  fiat_currency: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  sent_at?: string;
  viewed_at?: string;
  paid_at?: string;
  payment_session_id?: string;
  payment_url?: string;
  accepted_tokens: string[];
  accepted_chains: string[];
  notes?: string;
  terms?: string;
  created_at: string;
  updated_at?: string;
};

export type CreateInvoiceInput = {
  customer_email: string;
  customer_name?: string;
  customer_address?: string;
  description?: string;
  line_items: InvoiceLineItem[];
  tax?: number;
  discount?: number;
  due_date: string;
  accepted_tokens: string[];
  accepted_chains: string[];
  notes?: string;
  terms?: string;
  send_immediately?: boolean;
};

export type UpdateInvoiceInput = Partial<CreateInvoiceInput>;

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
}

export enum SubscriptionInterval {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export type TrialType = 'free' | 'reduced_price';

export type SubscriptionPlan = {
  id: string;
  merchant_id: string;
  name: string;
  description?: string;
  amount: number;
  fiat_currency: string;
  interval: SubscriptionInterval;
  interval_count: number;
  trial_days: number;
  trial_type?: TrialType;
  trial_price?: number;
  setup_fee?: number;
  max_billing_cycles?: number;
  accepted_tokens: string[];
  accepted_chains: string[];
  features?: string[];
  metadata?: Record<string, any>;
  is_active: boolean;
  subscriber_count: number;
  subscribe_url?: string;
  created_at: string;
  updated_at?: string;
};

export type Subscription = {
  id: string;
  plan_id: string;
  plan_name: string;
  merchant_id: string;
  customer_email: string;
  customer_name?: string;
  customer_id?: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  // Trial info
  trial_start?: string;
  trial_end?: string;
  trial_type?: TrialType;
  is_in_trial: boolean;
  trial_days_remaining?: number;
  // Payment stats
  total_payments_collected: number;
  total_revenue?: number;
  next_payment_at?: string;
  next_payment_url?: string;
  next_payment_amount?: number;
  // Customer payment method
  customer_wallet_address?: string;
  customer_chain?: string;
  customer_token?: string;
  has_payment_method: boolean;
  // Cancellation
  cancel_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  paused_at?: string;
  created_at: string;
  updated_at?: string;
};

export type SubscriptionPayment = {
  id: string;
  subscription_id: string;
  payment_session_id: string;
  amount: number;
  fiat_currency: string;
  status: string;
  period_start: string;
  period_end: string;
  paid_at?: string;
  created_at: string;
};

export type CreateSubscriptionPlanInput = {
  name: string;
  description?: string;
  amount: number;
  fiat_currency?: string;
  interval: SubscriptionInterval;
  interval_count?: number;
  trial_days?: number;
  trial_type?: TrialType;
  trial_price?: number;
  setup_fee?: number;
  max_billing_cycles?: number;
  accepted_tokens: string[];
  accepted_chains: string[];
  features?: string[];
  metadata?: Record<string, any>;
};

export type UpdateSubscriptionPlanInput = Partial<CreateSubscriptionPlanInput> & {
  is_active?: boolean;
};

export type CreateSubscriptionInput = {
  plan_id: string;
  customer_email: string;
  customer_name?: string;
  customer_id?: string;
  customer_wallet_address?: string;
  customer_chain?: string;
  customer_token?: string;
  skip_trial?: boolean;
  custom_trial_days?: number;
  metadata?: Record<string, any>;
};

// ============================================================================
// REFUNDS
// ============================================================================

export enum RefundStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  QUEUED = 'queued',
  INSUFFICIENT_FUNDS = 'insufficient_funds',
}

export type RefundEligibility = {
  eligible: boolean;
  payment_session_id: string;
  max_refundable: number;
  already_refunded: number;
  merchant_balance: number;
  sufficient_balance: boolean;
  settlement_status: 'in_platform' | 'settled_external' | 'partially_settled';
  message: string;
  can_queue: boolean;
  can_force_external: boolean;
};

export type Refund = {
  id: string;
  payment_session_id: string;
  merchant_id: string;
  amount: number;
  token: string;
  chain: string;
  refund_address: string;
  status: RefundStatus;
  reason?: string;
  tx_hash?: string;
  error_message?: string;
  refund_source?: 'platform_balance' | 'external_wallet';
  settlement_status?: 'in_platform' | 'settled_external' | 'partially_settled';
  merchant_balance_at_request?: number;
  failure_reason?: string;
  queued_until?: string;
  created_at: string;
  completed_at?: string;
  processed_at?: string;
  updated_at?: string;
};

export type CreateRefundInput = {
  payment_session_id: string;
  amount?: number;
  refund_address: string;
  reason?: string;
  force?: boolean;
  queue_if_insufficient?: boolean;
};

// ============================================================================
// ANALYTICS
// ============================================================================

export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'year';

export type AnalyticsOverview = {
  period_start: string;
  period_end: string;
  period: AnalyticsPeriod;
  payments: {
    total_payments: number;
    successful_payments: number;
    failed_payments: number;
    total_volume_usd: number;
    avg_payment_usd: number;
    conversion_rate: number;
    total_coupon_discount?: number; // Total discount given via coupons
    coupon_payment_count?: number; // Number of payments with coupons
  };
  volume_by_token: {
    token: string;
    volume_usd: number;
    payment_count: number;
  }[];
  volume_by_chain: {
    chain: string;
    volume_usd: number;
    payment_count: number;
  }[];
  invoices_sent: number;
  invoices_paid: number;
  invoice_volume_usd: number;
  active_subscriptions: number;
  new_subscriptions: number;
  churned_subscriptions: number;
  subscription_mrr: number;
  payments_change_pct: number;
  volume_change_pct: number;
};

export type RevenueDataPoint = {
  date: string;
  volume_usd: number;
  payment_count: number;
};

export type RevenueTimeSeries = {
  period: string;
  interval: string;
  data: RevenueDataPoint[];
};

export type ConversionMetrics = {
  period_days: number;
  total_sessions: number;
  completed_sessions: number;
  expired_sessions: number;
  conversion_rate: number;
  avg_time_to_payment_seconds: number;
};

export type ChainAnalytics = {
  chain: string;
  volume_usd: number;
  payment_count: number;
  avg_confirmation_time_seconds: number;
};

// ============================================================================
// TEAM MANAGEMENT
// ============================================================================

export enum MerchantRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  FINANCE = 'finance',
  VIEWER = 'viewer',
}

export type TeamMember = {
  id: string;
  merchant_id: string;
  email: string;
  name?: string;
  role: MerchantRole;
  is_active: boolean;
  invite_pending: boolean;
  last_login?: string;
  created_at: string;
  updated_at?: string;
};

export type InviteTeamMemberInput = {
  email: string;
  name?: string;
  role: MerchantRole;
};

export type UpdateTeamMemberInput = {
  role?: MerchantRole;
  is_active?: boolean;
  name?: string;
};

export type RolePermissions = {
  role: MerchantRole;
  permissions: string[];
  description: string;
};

// ============================================================================
// PAYMENT SESSIONS (Existing, for reference)
// ============================================================================

export type PaymentSession = {
  id: string;
  merchant_id: string;
  merchant_name?: string;
  amount_fiat: number;
  fiat_currency: string;
  status: string;
  customer_email?: string;
  payer_email?: string | null;
  payer_name?: string | null;
  metadata?: Record<string, unknown>;
  checkout_url: string;
  created_at: string;
  expires_at: string;
  paid_at?: string | null;
  token?: string | null;
  chain?: string | null;
  tx_hash?: string | null;
  amount_usdc?: string | null;
  
  // Coupon tracking fields
  coupon_code?: string | null;
  discount_amount?: number | null;
  amount_paid?: number | null; // Actual amount paid (amount_fiat - discount_amount)
  
  // Local currency conversions
  amount_fiat_local?: LocalCurrencyAmount | null;
  discount_amount_local?: LocalCurrencyAmount | null;
  amount_paid_local?: LocalCurrencyAmount | null;
};

// ============================================================================
// WEBHOOK EVENTS
// ============================================================================

export type WebhookEventType =
  | 'payment.created'
  | 'payment.confirmed'
  | 'payment.failed'
  | 'payment.expired'
  | 'invoice.created'
  | 'invoice.sent'
  | 'invoice.viewed'
  | 'invoice.paid'
  | 'invoice.overdue'
  | 'invoice.cancelled'
  | 'subscription.created'
  | 'subscription.activated'
  | 'subscription.renewed'
  | 'subscription.payment_failed'
  | 'subscription.paused'
  | 'subscription.resumed'
  | 'subscription.cancelled'
  | 'refund.created'
  | 'refund.completed'
  | 'refund.failed';

export type WebhookEvent = {
  id: string;
  event: WebhookEventType;
  created_at: string;
  data: Record<string, unknown>;
};

// ============================================================================
// WITHDRAWALS
// ============================================================================

export interface LocalCurrencyAmount {
  amount_usdc: number;
  amount_local: number;
  local_currency: string;
  local_symbol: string;
  exchange_rate: number;
  display_local: string;
}

export interface CoinBalance {
  token: string;
  balance_usdc: number;
  balance_local: LocalCurrencyAmount;
}

export interface WalletInfo {
  chain: string;
  wallet_address: string;
  is_active: boolean;
}

export interface BalanceDashboardResponse {
  total_balance_usdc: number;
  total_balance_local: LocalCurrencyAmount;
  local_currency: string;
  local_symbol: string;
  exchange_rate: number;
  coins: CoinBalance[];
  wallets: WalletInfo[];
  pending_withdrawals_usdc: number;
  pending_withdrawals_local: LocalCurrencyAmount;
  net_available_usdc: number;
  net_available_local: LocalCurrencyAmount;
}

export type WithdrawalStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";

export interface WithdrawalBalance {
  token: string;
  chain: string;
  balance: number;
  pending_deductions: number;
  available: number;
  usd_value: number;
  icon?: string;
  // Local currency fields
  available_local?: LocalCurrencyAmount;
  net_available?: number;
  net_available_local?: LocalCurrencyAmount;
}

export interface WithdrawalLimitResponse {
  tier: string;
  currency: string;
  daily_limit: number;
  daily_limit_local?: LocalCurrencyAmount;
  daily_used: number;
  daily_used_local?: LocalCurrencyAmount;
  remaining: number;
  daily_remaining_local?: LocalCurrencyAmount;
  fee_percentage: number;
  fee_fixed: number;
  min_withdrawal: number;
}

export interface Withdrawal {
  id: string;
  merchant_id: string;
  amount: number;
  amount_local?: LocalCurrencyAmount;
  token_amount: number;
  fee: number;
  fee_local?: LocalCurrencyAmount;
  total_deducted: number;
  currency: string;
  chain: string;
  destination_address: string;
  status: WithdrawalStatus;
  tx_hash?: string;
  failure_reason?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateWithdrawalRequest {
  amount: number;
  currency: string;
  chain: string;
  destination_address: string;
  notes?: string;
}

export interface WithdrawalFilters {
  status?: WithdrawalStatus;
  currency?: string;
  chain?: string;
  start_date?: string;
  end_date?: string;
}

// ============================================================================
// V3 — MRR / ARR ANALYTICS
// ============================================================================

export interface MRRLocalCurrency {
  amount: string;
  currency: string;
  rate: string;
}

export interface MRRARRResponse {
  mrr_usd: string;
  arr_usd: string;
  mrr_local: MRRLocalCurrency | null;
  arr_local: MRRLocalCurrency | null;
  active_subscriptions: number;
  new_this_period: number;
  churned_this_period: number;
  net_revenue_change_pct: string | null;
  period: string;
}

export interface MRRTrendPoint {
  date: string;
  mrr_usd: number;
  subscription_count: number;
  new: number;
  churned: number;
}

export interface MRRTrendResponse {
  points: MRRTrendPoint[];
  period_months: number;
}

// ============================================================================
// V3 — PAYMENT TRACKING
// ============================================================================

export interface PaymentEvent {
  type: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

export interface PaymentTrackingResponse {
  session_id: string;
  status: string;
  amount_fiat: number;
  fiat_currency: string;
  token: string | null;
  chain: string | null;
  tx_hash: string | null;
  block_number: number | null;
  confirmations: number | null;
  payer_email: string | null;
  payer_name: string | null;
  created_at: string;
  paid_at: string | null;
  expires_at: string | null;
  events: PaymentEvent[];
}

// ============================================================================
// V3 — SUBSCRIPTION TRACKING
// ============================================================================

export interface SubscriptionTrackingResponse {
  id: string;
  plan_name: string;
  customer_email: string;
  customer_name: string | null;
  status: string;
  current_period_start: string;
  current_period_end: string;
  next_payment_at: string | null;
  last_payment_at: string | null;
  failed_payment_count: number;
  total_paid_usd: number;
  payment_count: number;
  events: Record<string, unknown>[];
}

// ============================================================================
// V3 — PAYER DATA COLLECTION
// ============================================================================

export interface PayerDataCollect {
  email?: string;
  name?: string;
  phone?: string;
  billing_address_line1?: string;
  billing_address_line2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_postal_code?: string;
  billing_country?: string;
  shipping_address_line1?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  custom_fields?: Record<string, unknown>;
}

export interface PayerDataResponse {
  email: string | null;
  name: string | null;
  phone: string | null;
  billing_address_line1: string | null;
  billing_city: string | null;
  billing_state: string | null;
  billing_postal_code: string | null;
  billing_country: string | null;
  custom_fields: Record<string, unknown> | null;
}

// ============================================================================
// V3 — PAYMENT TOKENIZATION
// ============================================================================

export interface TokenizeCheckoutResponse {
  payment_token: string;
  expires_in_seconds: number;
  signature: string;
}

export interface ResolvedTokenData {
  session_id: string;
  amount_fiat: string;
  fiat_currency: string;
  amount_token: string;
  token: string;
  chain: string;
  merchant_id: string;
}

// ============================================================================
// V3 — CACHE STATS
// ============================================================================

export interface CacheRegionStats {
  size: number;
  max_size: number;
  ttl: number;
  hits: number;
  misses: number;
}

export interface CacheStatsResponse {
  regions: Record<string, CacheRegionStats>;
}

// ============================================================================
// PROMO CODES / COUPONS
// ============================================================================

export type CouponType = 'percentage' | 'fixed';
export type CouponStatus = 'active' | 'inactive' | 'deleted';

export interface PromoCode {
  id: string;
  code: string;
  type: CouponType;
  discount_value: number;
  max_discount_amount: number | null;
  min_order_amount: number;
  usage_limit_total: number | null;
  usage_limit_per_user: number | null;
  used_count: number;
  start_date: string;
  expiry_date: string;
  status: CouponStatus;
  created_at: string;
  updated_at: string | null;
}

export interface CreatePromoCodeInput {
  code: string;
  type: CouponType;
  discount_value: number;
  max_discount_amount?: number;
  min_order_amount?: number;
  usage_limit_total?: number;
  usage_limit_per_user?: number;
  start_date: string; // ISO datetime
  expiry_date: string; // ISO datetime
}

export interface UpdatePromoCodeInput {
  discount_value?: number;
  max_discount_amount?: number;
  min_order_amount?: number;
  usage_limit_total?: number;
  usage_limit_per_user?: number;
  expiry_date?: string;
  status?: 'active' | 'inactive';
}

export interface PromoCodeList {
  promo_codes: PromoCode[];
  total: number;
}

export interface PromoCodeAnalytics {
  promo_code_id: string;
  code: string;
  total_used: number;
  total_discount_given: number;
  revenue_generated: number;
  conversion_rate: number | null;
}

export interface ApplyCouponPayload {
  merchant_id: string;
  payment_link_id?: string;
  coupon_code: string;
  order_amount: number;
  customer_id?: string;
}

export interface ApplyCouponResult {
  coupon_valid: boolean;
  discount_amount: number;
  final_amount: number;
  coupon_code: string | null;
  discount_type: CouponType | null;
  message: string;
}

export interface CompleteCouponPaymentPayload {
  session_id: string;
  coupon_code: string;
}

export interface CompleteCouponPaymentResult {
  status: string;
  message: string;
  session_id: string;
  coupon_code: string;
}

