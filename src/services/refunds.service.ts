import { apiClient } from '@/lib/api-client';
import { generateIdempotencyKey } from '@/lib/utils';
import {
  Refund,
  RefundEligibility,
  CreateRefundInput,
  PaginatedResponse,
  RefundStatus,
} from '@/types/api.types';

export class RefundsService {
  private basePath = '/refunds';

  async checkEligibility(paymentSessionId: string): Promise<RefundEligibility> {
    return apiClient.get<RefundEligibility>(`${this.basePath}/eligibility/${paymentSessionId}`);
  }

  async createRefund(input: CreateRefundInput): Promise<Refund> {
    return apiClient.post<Refund>(this.basePath, input, {
      idempotencyKey: generateIdempotencyKey(),
    });
  }

  async listRefunds(params?: {
    page?: number;
    page_size?: number;
    status?: RefundStatus;
    payment_session_id?: string;
  }): Promise<PaginatedResponse<Refund>> {
    const data = await apiClient.get<any>(this.basePath, { params });
    // Backend returns { refunds, total } -- map to { items, ... }
    const pageSize = params?.page_size || 20;
    return {
      items: data.refunds || [],
      total: data.total || 0,
      page: params?.page || 1,
      page_size: pageSize,
      pages: Math.ceil((data.total || 0) / pageSize),
    };
  }

  async getRefund(refundId: string): Promise<Refund> {
    return apiClient.get<Refund>(`${this.basePath}/${refundId}`);
  }

  async cancelRefund(refundId: string): Promise<Refund> {
    return apiClient.post<Refund>(`${this.basePath}/${refundId}/cancel`);
  }

  async retryRefund(refundId: string): Promise<Refund> {
    return apiClient.post<Refund>(`${this.basePath}/${refundId}/retry`);
  }

  async processQueued(): Promise<void> {
    return apiClient.post<void>(`${this.basePath}/process-queued`);
  }

  async triggerScheduler(): Promise<any> {
    return apiClient.post<any>('/admin/scheduler/refunds/trigger');
  }
}

export const refundsService = new RefundsService();
