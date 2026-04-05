import { api } from './api';

interface CustomerTransactionList {
  customer_email: string;
  customer_name: string;
  total_transaction_value: string;
  total_transactions: number;
  transactions: Array<{
    id: string;
    type: 'payment' | 'subscription' | 'invoice';
    email: string;
    name: string;
    amount_fiat: string;
    amount_token: string;
    fiat_currency: string;
    token: string;
    chain: string;
    wallet_address: string;
    status: string;
    refundable_amount: string;
    already_refunded: string;
    created_at: string;
  }>;
}

interface RefundCreateRequest {
  amount: number;
  refund_address: string;
  reason: string;
  queue_if_insufficient: boolean;
  force: boolean;
}

class RefundsService {
  /**
   * Get all transactions for a customer by email or phone
   */
  async getCustomerTransactions(
    email?: string,
    phone?: string
  ): Promise<CustomerTransactionList> {
    try {
      console.log('🔍 refundsService.getCustomerTransactions called', { email, phone });
      
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (phone) params.append('phone', phone);

      const url = `/refunds/customer/transactions?${params.toString()}`;
      console.log('📤 Making GET request to:', url);

      const response = await api.get<CustomerTransactionList>(url);

      console.log('✅ Response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error in getCustomerTransactions:', error);
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch customer transactions';

      throw new Error(message);
    }
  }

  /**
   * Check if a payment can be refunded
   */
  async checkRefundEligibility(paymentSessionId: string): Promise<any> {
    try {
      const response = await api.get(
        `/refunds/${paymentSessionId}/eligibility`
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to check refund eligibility';
      throw new Error(message);
    }
  }

  /**
   * Create a refund for a transaction
   */
  async createRefund(
    transactionId: string,
    data: RefundCreateRequest
  ): Promise<any> {
    try {
      console.log('💰 Creating refund with data:', data);
      const response = await api.post(
        `/refunds`,
        {
          payment_session_id: transactionId,
          amount: data.amount,
          refund_address: data.refund_address,
          reason: data.reason,
          queue_if_insufficient: data.queue_if_insufficient,
          force: data.force
        }
      );

      console.log('✅ Refund created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Failed to create refund';

      throw new Error(message);
    }
  }

  /**
   * Get list of refunds for merchant
   */
  async getRefunds(params?: {
    page?: number;
    page_size?: number;
    status?: string;
  }): Promise<any> {
    try {
      const response = await api.get('/refunds', { params });
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to fetch refunds';
      throw new Error(message);
    }
  }

  /**
   * Get a specific refund by ID
   */
  async getRefund(refundId: string): Promise<any> {
    try {
      const response = await api.get(`/refunds/${refundId}`);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to fetch refund details';
      throw new Error(message);
    }
  }

  /**
   * Update a refund status (admin/merchant actions)
   */
  async updateRefund(refundId: string, updates: any): Promise<any> {
    try {
      const response = await api.patch(`/refunds/${refundId}`, updates);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to update refund';
      throw new Error(message);
    }
  }

  /**
   * Cancel a pending refund
   */
  async cancelRefund(refundId: string): Promise<any> {
    try {
      const response = await api.post(
        `/refunds/${refundId}/cancel`
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to cancel refund';
      throw new Error(message);
    }
  }

  /**
   * Process a queued refund immediately
   */
  async processQueuedRefund(refundId: string): Promise<any> {
    try {
      const response = await api.post(
        `/refunds/${refundId}/process`
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to process queued refund';
      throw new Error(message);
    }
  }
}

const refundsService = new RefundsService();
export default refundsService;
