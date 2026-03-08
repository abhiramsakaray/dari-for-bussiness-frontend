import { apiClient } from '@/lib/api-client';
import { generateIdempotencyKey } from '@/lib/utils';
import {
  PaymentLink,
  CreatePaymentLinkInput,
  UpdatePaymentLinkInput,
  PaymentLinkAnalytics,
  PaginatedResponse,
} from '@/types/api.types';

export class PaymentLinksService {
  private basePath = '/payment-links';

  async createPaymentLink(input: CreatePaymentLinkInput): Promise<PaymentLink> {
    return apiClient.post<PaymentLink>(this.basePath, input, {
      idempotencyKey: generateIdempotencyKey(),
    });
  }

  async listPaymentLinks(params?: {
    page?: number;
    page_size?: number;
    is_active?: boolean;
  }): Promise<PaginatedResponse<PaymentLink>> {
    const data = await apiClient.get<any>(this.basePath, { params });
    // Backend returns { links, total, page, page_size } -- map to { items, ... }
    return {
      items: data.links || [],
      total: data.total || 0,
      page: data.page || 1,
      page_size: data.page_size || 20,
      pages: Math.ceil((data.total || 0) / (data.page_size || 20)),
    };
  }

  async getPaymentLink(linkId: string): Promise<PaymentLink> {
    return apiClient.get<PaymentLink>(`${this.basePath}/${linkId}`);
  }

  async updatePaymentLink(linkId: string, input: UpdatePaymentLinkInput): Promise<PaymentLink> {
    return apiClient.patch<PaymentLink>(`${this.basePath}/${linkId}`, input);
  }

  async deactivatePaymentLink(linkId: string): Promise<void> {
    return apiClient.delete<void>(`${this.basePath}/${linkId}`);
  }

  async getPaymentLinkAnalytics(linkId: string): Promise<PaymentLinkAnalytics> {
    return apiClient.get<PaymentLinkAnalytics>(`${this.basePath}/${linkId}/analytics`);
  }
}

export const paymentLinksService = new PaymentLinksService();
