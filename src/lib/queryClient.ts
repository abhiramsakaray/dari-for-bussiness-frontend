import { QueryClient } from '@tanstack/react-query';

// Create a client with optimized caching settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      // Refetch on window focus
      refetchOnWindowFocus: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Retry failed requests
      retry: 1,
      // Refetch interval (background refresh every 5 minutes)
      refetchInterval: 5 * 60 * 1000, // 5 minutes
      // Only refetch if data is stale
      refetchIntervalInBackground: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

// Query keys for consistent caching
export const queryKeys = {
  // Payments
  payments: ['payments'] as const,
  payment: (id: string) => ['payment', id] as const,
  paymentsList: (filters?: any) => ['payments', 'list', filters] as const,
  
  // Analytics
  analytics: ['analytics'] as const,
  analyticsOverview: (period: string) => ['analytics', 'overview', period] as const,
  analyticsRevenue: (period: string) => ['analytics', 'revenue', period] as const,
  analyticsConversion: (days: number) => ['analytics', 'conversion', days] as const,
  
  // Team
  team: ['team'] as const,
  teamMembers: ['team', 'members'] as const,
  
  // Wallets
  wallets: ['wallets'] as const,
  
  // Invoices
  invoices: ['invoices'] as const,
  invoice: (id: string) => ['invoice', id] as const,
  
  // Subscriptions
  subscriptions: ['subscriptions'] as const,
  subscription: (id: string) => ['subscription', id] as const,
  
  // Coupons
  coupons: ['coupons'] as const,
  coupon: (id: string) => ['coupon', id] as const,
  
  // Payment Links
  paymentLinks: ['payment-links'] as const,
  paymentLink: (id: string) => ['payment-link', id] as const,
  
  // Refunds
  refunds: ['refunds'] as const,
  
  // Withdrawals
  withdrawals: ['withdrawals'] as const,
  
  // Payer Leads
  payerLeads: ['payer-leads'] as const,
  
  // Receipts
  receipts: ['receipts'] as const,
  receipt: (id: string) => ['receipt', id] as const,
};
