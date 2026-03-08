import { apiClient } from '@/lib/api-client';
import {
  PromoCode,
  PromoCodeList,
  PromoCodeAnalytics,
  CreatePromoCodeInput,
  UpdatePromoCodeInput,
  ApplyCouponPayload,
  ApplyCouponResult,
  CompleteCouponPaymentPayload,
  CompleteCouponPaymentResult,
} from '@/types/api.types';

export class CouponsService {
  private basePath = '/api/business/promo';

  async createCoupon(input: CreatePromoCodeInput): Promise<PromoCode> {
    return apiClient.post<PromoCode>(`${this.basePath}/create`, input);
  }

  async listCoupons(params?: {
    page?: number;
    page_size?: number;
    status?: 'active' | 'inactive';
  }): Promise<PromoCodeList> {
    return apiClient.get<PromoCodeList>(`${this.basePath}/list`, { params });
  }

  async updateCoupon(couponId: string, input: UpdatePromoCodeInput): Promise<PromoCode> {
    return apiClient.put<PromoCode>(`${this.basePath}/${couponId}`, input);
  }

  async deleteCoupon(couponId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`${this.basePath}/${couponId}`);
  }

  async toggleCouponStatus(
    couponId: string,
    status: 'active' | 'inactive'
  ): Promise<PromoCode> {
    return apiClient.patch<PromoCode>(`${this.basePath}/${couponId}/status`, { status });
  }

  async getCouponAnalytics(couponId: string): Promise<PromoCodeAnalytics> {
    return apiClient.get<PromoCodeAnalytics>(`${this.basePath}/${couponId}/analytics`);
  }

  // Public checkout API (no auth required, but won't fail if token is present)
  async applyCoupon(payload: ApplyCouponPayload): Promise<ApplyCouponResult> {
    return apiClient.post<ApplyCouponResult>('/api/payment/apply-coupon', payload);
  }

  // Complete payment when coupon gives 100% discount (no blockchain payment needed)
  async completeCouponPayment(
    payload: CompleteCouponPaymentPayload
  ): Promise<CompleteCouponPaymentResult> {
    return apiClient.post<CompleteCouponPaymentResult>(
      '/api/payment/complete-coupon-payment',
      payload
    );
  }
}

export const couponsService = new CouponsService();
