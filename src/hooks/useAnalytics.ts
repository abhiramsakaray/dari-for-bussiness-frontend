import { useMutation, useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import { checkoutService } from '@/services/checkout.service';
import { AnalyticsPeriod, PayerDataCollect } from '@/types/api.types';
import { toast } from 'sonner';

export const ANALYTICS_QUERY_KEY = 'analytics';

export function useAnalyticsOverview(period: AnalyticsPeriod = 'month') {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'overview', period],
    queryFn: () => analyticsService.getOverview(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRevenueTimeSeries(period: AnalyticsPeriod = 'month') {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'revenue', period],
    queryFn: () => analyticsService.getRevenue(period),
    staleTime: 5 * 60 * 1000,
  });
}

export function useConversionMetrics(days = 30) {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'conversion', days],
    queryFn: () => analyticsService.getConversionMetrics(days),
    staleTime: 5 * 60 * 1000,
  });
}

export function useChainAnalytics(days = 30) {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'chains', days],
    queryFn: () => analyticsService.getChainAnalytics(days),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTokenAnalytics(days = 30) {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'tokens', days],
    queryFn: () => analyticsService.getTokenAnalytics(days),
    staleTime: 5 * 60 * 1000,
  });
}

// V3 — MRR / ARR
export function useMRRARR() {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'mrr-arr'],
    queryFn: () => analyticsService.getMRRARR(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMRRTrend(months = 6) {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'mrr-trend', months],
    queryFn: () => analyticsService.getMRRTrend(months),
    staleTime: 5 * 60 * 1000,
  });
}

// V3 — Payment Tracking
export function usePaymentTracking(sessionId: string) {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'payment-track', sessionId],
    queryFn: () => analyticsService.trackPayment(sessionId),
    enabled: !!sessionId,
    staleTime: 30 * 1000,
  });
}

// V3 — Subscription Tracking
export function useSubscriptionTracking(subscriptionId: string) {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'subscription-track', subscriptionId],
    queryFn: () => analyticsService.trackSubscription(subscriptionId),
    enabled: !!subscriptionId,
    staleTime: 60 * 1000,
  });
}

// V3 — Cache Stats
export function useCacheStats() {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEY, 'cache-stats'],
    queryFn: () => analyticsService.getCacheStats(),
    staleTime: 10 * 1000,
  });
}

// V3 — Payer Data
export function useSubmitPayerData() {
  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: PayerDataCollect }) =>
      checkoutService.submitPayerData(sessionId, data),
    onSuccess: () => {
      toast.success('Information submitted');
    },
    onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to submit payer data');
    },
  });
}

// V3 — Payment Tokenization
export function useTokenizeCheckout() {
  return useMutation({
    mutationFn: (sessionId: string) => checkoutService.tokenize(sessionId),
    onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Tokenization failed');
    },
  });
}

export function useResolveToken(sessionId: string, token: string) {
  return useQuery({
    queryKey: ['checkout', 'resolve-token', sessionId, token],
    queryFn: () => checkoutService.resolveToken(sessionId, token),
    enabled: !!sessionId && !!token,
  });
}
