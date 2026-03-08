import { apiClient } from '@/lib/api-client';
import {
  AnalyticsOverview,
  AnalyticsPeriod,
  RevenueTimeSeries,
  ConversionMetrics,
  ChainAnalytics,
  MRRARRResponse,
  MRRTrendResponse,
  PaymentTrackingResponse,
  SubscriptionTrackingResponse,
  CacheStatsResponse,
} from '@/types/api.types';

export class AnalyticsService {
  private basePath = '/analytics';

  async getOverview(period: AnalyticsPeriod = 'month'): Promise<AnalyticsOverview> {
    return apiClient.get<AnalyticsOverview>(`${this.basePath}/overview`, {
      params: { period },
    });
  }

  async getRevenue(period: AnalyticsPeriod = 'month'): Promise<RevenueTimeSeries> {
    return apiClient.get<RevenueTimeSeries>(`${this.basePath}/revenue`, {
      params: { period },
    });
  }

  async getConversionMetrics(days = 30): Promise<ConversionMetrics> {
    return apiClient.get<ConversionMetrics>(`${this.basePath}/conversion`, {
      params: { days },
    });
  }

  async getChainAnalytics(days = 30): Promise<ChainAnalytics[]> {
    return apiClient.get<ChainAnalytics[]>(`${this.basePath}/chains`, {
      params: { days },
    });
  }

  async getTokenAnalytics(days = 30) {
    return apiClient.get(`${this.basePath}/tokens`, {
      params: { days },
    });
  }

  async getCustomerAnalytics(days = 30) {
    return apiClient.get(`${this.basePath}/customers`, {
      params: { days },
    });
  }

  // V3 — MRR / ARR
  async getMRRARR(): Promise<MRRARRResponse> {
    return apiClient.get<MRRARRResponse>(`${this.basePath}/mrr-arr`);
  }

  async getMRRTrend(months = 6): Promise<MRRTrendResponse> {
    return apiClient.get<MRRTrendResponse>(`${this.basePath}/mrr-trend`, {
      params: { months },
    });
  }

  // V3 — Payment Tracking
  async trackPayment(sessionId: string): Promise<PaymentTrackingResponse> {
    return apiClient.get<PaymentTrackingResponse>(
      `${this.basePath}/payments/${sessionId}/track`
    );
  }

  // V3 — Subscription Tracking
  async trackSubscription(subscriptionId: string): Promise<SubscriptionTrackingResponse> {
    return apiClient.get<SubscriptionTrackingResponse>(
      `${this.basePath}/subscriptions/${subscriptionId}/track`
    );
  }

  // V3 — Cache Stats
  async getCacheStats(): Promise<CacheStatsResponse> {
    return apiClient.get<CacheStatsResponse>(`${this.basePath}/cache/stats`);
  }
}

export const analyticsService = new AnalyticsService();
