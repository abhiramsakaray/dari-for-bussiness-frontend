import { apiClient } from '@/lib/api-client';
import { generateIdempotencyKey } from '@/lib/utils';
import {
  SubscriptionPlan,
  Subscription,
  SubscriptionPayment,
  CreateSubscriptionPlanInput,
  UpdateSubscriptionPlanInput,
  CreateSubscriptionInput,
  PaginatedResponse,
  SubscriptionStatus,
} from '@/types/api.types';

export class SubscriptionsService {
  private basePath = '/subscriptions';

  // Plans
  async createPlan(input: CreateSubscriptionPlanInput): Promise<SubscriptionPlan> {
    return apiClient.post<SubscriptionPlan>(`${this.basePath}/plans`, input, {
      idempotencyKey: generateIdempotencyKey(),
    });
  }

  async listPlans(params?: {
    page?: number;
    page_size?: number;
    is_active?: boolean;
  }): Promise<PaginatedResponse<SubscriptionPlan>> {
    const data = await apiClient.get<any>(`${this.basePath}/plans`, { params });
    
    // Handle different response formats from backend
    let items: SubscriptionPlan[] = [];
    
    if (Array.isArray(data)) {
      // Backend returns raw array: [SubscriptionPlan, ...]
      items = data;
    } else if (data.plans && Array.isArray(data.plans)) {
      // Backend returns: { plans: [SubscriptionPlan, ...] }
      items = data.plans;
    } else if (data.items && Array.isArray(data.items)) {
      // Backend returns paginated: { items: [...], total, page, ... }
      items = data.items;
    }
    
    return {
      items,
      total: data.total || items.length,
      page: data.page || 1,
      page_size: data.page_size || items.length,
      pages: data.pages || Math.ceil(items.length / (data.page_size || items.length || 1)),
    };
  }

  async getPlan(planId: string): Promise<SubscriptionPlan> {
    return apiClient.get<SubscriptionPlan>(`${this.basePath}/plans/${planId}`);
  }

  async updatePlan(planId: string, input: UpdateSubscriptionPlanInput): Promise<SubscriptionPlan> {
    return apiClient.patch<SubscriptionPlan>(`${this.basePath}/plans/${planId}`, input);
  }

  async deactivatePlan(planId: string): Promise<void> {
    return apiClient.delete<void>(`${this.basePath}/plans/${planId}`);
  }

  // Subscriptions
  async createSubscription(input: CreateSubscriptionInput): Promise<Subscription> {
    return apiClient.post<Subscription>(this.basePath, input, {
      idempotencyKey: generateIdempotencyKey(),
    });
  }

  async listSubscriptions(params?: {
    page?: number;
    page_size?: number;
    status?: SubscriptionStatus;
    plan_id?: string;
    customer_email?: string;
  }): Promise<PaginatedResponse<Subscription>> {
    const data = await apiClient.get<any>(this.basePath, { params });
    
    // Handle different response formats from backend
    let items: Subscription[] = [];
    
    if (Array.isArray(data)) {
      // Backend returns raw array: [Subscription, ...]
      items = data;
    } else if (data.subscriptions && Array.isArray(data.subscriptions)) {
      // Backend returns: { subscriptions: [Subscription, ...], total, ... }
      items = data.subscriptions;
    } else if (data.items && Array.isArray(data.items)) {
      // Backend returns paginated: { items: [...], total, page, ... }
      items = data.items;
    }
    
    return {
      items,
      total: data.total || items.length,
      page: data.page || 1,
      page_size: data.page_size || items.length || 20,
      pages: data.pages || Math.ceil((data.total || items.length) / (data.page_size || items.length || 20)),
    };
  }

  async getSubscription(subscriptionId: string): Promise<Subscription> {
    return apiClient.get<Subscription>(`${this.basePath}/${subscriptionId}`);
  }

  async cancelSubscription(
    subscriptionId: string,
    cancelImmediately = false,
    reason?: string
  ): Promise<Subscription> {
    return apiClient.post<Subscription>(`${this.basePath}/${subscriptionId}/cancel`, {
      cancel_immediately: cancelImmediately,
      reason,
    });
  }

  async pauseSubscription(subscriptionId: string): Promise<Subscription> {
    return apiClient.post<Subscription>(`${this.basePath}/${subscriptionId}/pause`);
  }

  async resumeSubscription(subscriptionId: string): Promise<Subscription> {
    return apiClient.post<Subscription>(`${this.basePath}/${subscriptionId}/resume`);
  }

  // Trial management
  async extendTrial(subscriptionId: string, extraDays: number): Promise<Subscription> {
    return apiClient.post<Subscription>(`${this.basePath}/${subscriptionId}/extend-trial`, {
      extra_days: extraDays,
    });
  }

  async endTrial(subscriptionId: string): Promise<Subscription> {
    return apiClient.post<Subscription>(`${this.basePath}/${subscriptionId}/end-trial`);
  }

  // Payment method
  async updatePaymentMethod(
    subscriptionId: string,
    data: { wallet_address: string; chain: string; token: string }
  ): Promise<Subscription> {
    return apiClient.put<Subscription>(`${this.basePath}/${subscriptionId}/payment-method`, data);
  }

  // Payment collection
  async collectPayment(subscriptionId: string): Promise<void> {
    return apiClient.post<void>(`${this.basePath}/${subscriptionId}/collect-payment`);
  }

  async renewSubscription(subscriptionId: string): Promise<Subscription> {
    return apiClient.post<Subscription>(`${this.basePath}/${subscriptionId}/renew`);
  }

  async getSubscriptionPayments(
    subscriptionId: string,
    params?: { page?: number; page_size?: number }
  ): Promise<PaginatedResponse<SubscriptionPayment>> {
    return apiClient.get<PaginatedResponse<SubscriptionPayment>>(
      `${this.basePath}/${subscriptionId}/payments`,
      { params }
    );
  }

  // Utility methods
  formatInterval(interval: string, count: number): string {
    const intervalDisplay = interval.charAt(0).toUpperCase() + interval.slice(1);
    if (count === 1) return intervalDisplay;
    return `Every ${count} ${interval}s`;
  }
}

export const subscriptionsService = new SubscriptionsService();
