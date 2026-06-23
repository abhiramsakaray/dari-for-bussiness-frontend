import api from './api';

export interface PaymentSessionData {
  amount: number;
  currency?: string;
  amount_usdc?: number; // For backward compatibility
  order_id?: string;
  success_url: string;
  cancel_url: string;
  metadata?: Record<string, any>;
}

export interface PaymentSession {
  id: string;
  session_id?: string; // For backward compatibility
  merchant_id?: string;
  merchant_name?: string;
  checkout_url: string;
  amount?: number;
  currency?: string;
  amount_usdc: string;
  amount_fiat?: number;
  fiat_currency?: string;
  order_id?: string;
  expires_at: string;
  status: string;
  success_url?: string;
  cancel_url?: string;
  tx_hash?: string;
  created_at?: string;
  paid_at?: string;
  payer_email?: string;
  payer_name?: string;
  customer_email?: string;
  customer_name?: string;
  token?: string;
  chain?: string;
  
  // Coupon tracking fields
  coupon_code?: string | null;
  discount_amount?: number | null;
  amount_paid?: number | null;
  
  // Local currency conversions
  amount_fiat_local?: LocalCurrencyAmount | null;
  discount_amount_local?: LocalCurrencyAmount | null;
  amount_paid_local?: LocalCurrencyAmount | null;
  
  // V3 — Unified Transaction Fields
  transaction_type?: "payment" | "subscription";
  merchant_amount_local?: number | null;
  merchant_currency?: string | null;
  merchant_currency_symbol?: string | null;
  amount_token?: string | null;
  
  // Subscription-specific fields
  subscription_id?: string | null;
  payment_number?: number | null;
  period_start?: string | null;
  period_end?: string | null;
  
  // Refund fields
  refund_count?: number;

  // Raw session metadata (contains stripe_payment_intent_id, card_provider, etc.)
  metadata?: Record<string, any>;

  // ── Settlement Intelligence [ORCH-SETTLE] ──────────────────────────────
  settlement_id?: string | null;
  settlement_status?: string | null;        // SETTLED | PENDING_RECONCILIATION | DISPUTED | REVERSED
  settlement_gross_amount?: string | null;  // Total received on-chain (USDC)
  settlement_platform_fee?: string | null;  // Dari processing fee
  settlement_network_fee?: string | null;   // On-chain gas / relayer cost
  settlement_net_amount?: string | null;    // Merchant payout (gross - fees)
  settlement_chain?: string | null;
  settlement_token?: string | null;
  settlement_tx_hash?: string | null;
  settlement_created_at?: string | null;

  // ── Orchestration Routing Metadata [ORCH-ROUTE] ────────────────────────
  provider_used?: string | null;            // Gateway that processed the payment
  routing_strategy?: string | null;        // rule | smart | failover | only_option
  routing_reason?: string | null;          // Human-readable routing reason
  routing_score?: number | null;           // Composite gateway score at decision time
  alternative_providers?: string[] | null;
  routing_estimated_fee?: string | null;
  routing_estimated_success_rate?: number | null;
  routing_failover_used?: boolean | null;
  routing_candidate_scores?: Array<{
    gateway: string;
    score: number | null;
    success_rate: number | null;
  }> | null;
  routing_decision_id?: string | null;
}

export interface CheckoutSettings {
  primary_color?: string;
  theme?: string;
  require_phone?: boolean;
  require_billing_address?: boolean;
  support_email?: string;
  store_name?: string;
}

export interface MerchantProfile {
  id: string;
  name: string;
  email: string;
  stellar_address?: string;
  webhook_url?: string;
  api_key: string;
  is_active: boolean;
  logo_url?: string;
  checkout_settings?: CheckoutSettings;
  created_at: string;
}

export interface PaymentHistoryParams {
  limit?: number;
  offset?: number;
}

export interface PayerLeadsParams {
  limit?: number;
  offset?: number;
  include_paid?: boolean;
}

export interface PaymentHistoryResponse {
  total: number;
  payments: PaymentSession[];
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  merchant_category?: string;
  stellar_address?: string;
  webhook_url?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  api_key: string;
  onboarding_completed?: boolean;
  onboarding_step?: number;
  merchant_id?: string;
  name?: string;
}

export interface PaymentStats {
  total_sessions: number;
  sessions_by_status: {
    paid: number;
    pending: number;
    expired: number;
  };
  revenue: {
    total_usdc: number;
    currency: string;
    total_coupon_discount: number;
    coupon_payment_count: number;
    total_local: LocalCurrencyAmount | null;
    total_coupon_discount_local: LocalCurrencyAmount | null;
  };
  recent: {
    today: number;
    this_week: number;
  };
  success_rate: number;
}

export interface LocalCurrencyAmount {
  amount_usdc: number;
  amount_local: number;
  local_currency: string;
  local_symbol: string;
  exchange_rate: number;
  display_local: string;
}

export const chainpeService = {
  // Create payment session
  createSession: async (paymentData: PaymentSessionData): Promise<PaymentSession> => {
    const response = await api.post('/api/sessions/create', paymentData);
    return response.data;
  },

  // Get session status (payment detail)
  getSessionStatus: async (sessionId: string): Promise<PaymentSession> => {
    // Try merchant/payments endpoint first (correct endpoint)
    try {
      const response = await api.get(`/merchant/payments/${sessionId}`);
      return response.data;
    } catch (error: any) {
      // Fallback to old endpoint for backward compatibility
      if (error.response?.status === 404) {
        const response = await api.get(`/api/sessions/${sessionId}`);
        return response.data;
      }
      throw error;
    }
  },

  // Get merchant profile
  getMerchantProfile: async (): Promise<MerchantProfile> => {
    const response = await api.get('/merchant/profile');
    return response.data;
  },

  // Update merchant profile
  updateMerchantProfile: async (data: Partial<MerchantProfile>): Promise<MerchantProfile> => {
    const response = await api.put('/merchant/profile', data);
    return response.data;
  },

  // Upload merchant logo
  uploadLogo: async (file: File): Promise<{ message: string, logo_url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/merchant/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get payment history
  getPaymentHistory: async (params: PaymentHistoryParams = {}): Promise<PaymentHistoryResponse> => {
    const response = await api.get('/merchant/payments', { params });
    const data = response.data;
    
    // Debug: Log the first payment to see what fields are returned
    if (import.meta.env.DEV && data?.payments?.[0]) {
      console.log('🔍 First payment from API:', data.payments[0]);
      console.log('🔍 Has transaction_type?', data.payments[0].transaction_type);
      console.log('🔍 Has merchant_currency?', data.payments[0].merchant_currency);
      console.log('🔍 Has merchant_currency_symbol?', data.payments[0].merchant_currency_symbol);
      console.log('🔍 Has merchant_amount_local?', data.payments[0].merchant_amount_local);
    }
    
    // Handle multiple backend response formats
    const payments = Array.isArray(data) ? data
      : Array.isArray(data?.payments) ? data.payments
      : Array.isArray(data?.sessions) ? data.sessions
      : Array.isArray(data?.items) ? data.items
      : [];
    return {
      total: data?.total ?? payments.length,
      payments,
    };
  },

  // Get payer leads (sessions where customer submitted contact info but didn't pay)
  getPayerLeads: async (params: PayerLeadsParams = {}): Promise<PaymentHistoryResponse> => {
    const response = await api.get('/merchant/payments/payer-leads', { params });
    const data = response.data;
    const payments = Array.isArray(data) ? data
      : Array.isArray(data?.payments) ? data.payments
      : Array.isArray(data?.sessions) ? data.sessions
      : Array.isArray(data?.items) ? data.items
      : [];
    return {
      total: data?.total ?? payments.length,
      payments,
    };
  },

  // Get payment statistics (totals, success rate, today's count)
  getPaymentStats: async (): Promise<PaymentStats> => {
    const response = await api.get('/merchant/payments/stats');
    return response.data;
  },

  // Merchant auth - register
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Merchant auth - login
  login: async (data: AuthCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; network: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};
