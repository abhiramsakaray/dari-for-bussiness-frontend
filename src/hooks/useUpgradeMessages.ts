import { useState, useEffect, useMemo } from 'react';
import { usePaymentStats } from './usePaymentHistory';
import { useMerchantProfile } from './useMerchantProfile';
import { useMerchantCurrency } from './useMerchantCurrency';
import {
  getUpgradeMessages,
  getDashboardBanner,
  type UserUsageData,
  type UpgradeMessage,
} from '../utils/upgradeMessaging';

const DISMISSED_MESSAGES_KEY = 'dismissed_upgrade_messages';
const LAST_PROMPT_KEY = 'last_upgrade_prompt';

export function useUpgradeMessages() {
  const { stats, isLoading: statsLoading } = usePaymentStats();
  const { profile, isLoading: profileLoading } = useMerchantProfile();
  const { currency, currencySymbol } = useMerchantCurrency();
  
  const [dismissedMessages, setDismissedMessages] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(DISMISSED_MESSAGES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Build user usage data
  const usageData: UserUsageData | null = useMemo(() => {
    if (!stats || !profile) return null;

    // Get last prompt time
    let lastUpgradePrompt: Date | undefined;
    try {
      const stored = localStorage.getItem(LAST_PROMPT_KEY);
      if (stored) {
        lastUpgradePrompt = new Date(stored);
      }
    } catch {
      // ignore
    }

    // Calculate account age
    const accountAge = profile.created_at
      ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Determine current plan (you may need to adjust this based on your data structure)
    const currentPlan = (profile.subscription_plan || 'free') as 'free' | 'growth' | 'business' | 'enterprise';

    // Get plan limits (adjust based on your actual plan structure)
    const planLimits = {
      free: { paymentLinks: 2, invoices: 5, teamMembers: 1 },
      growth: { paymentLinks: Infinity, invoices: Infinity, teamMembers: 3 },
      business: { paymentLinks: Infinity, invoices: Infinity, teamMembers: 10 },
      enterprise: { paymentLinks: Infinity, invoices: Infinity, teamMembers: Infinity },
    };

    const limits = planLimits[currentPlan];

    return {
      totalPayments: stats.total_count || 0,
      monthlyVolume: stats.revenue?.total_usdc || 0,
      totalVolume: stats.revenue?.total_usdc || 0,
      averagePaymentValue: stats.total_count > 0 
        ? (stats.revenue?.total_usdc || 0) / stats.total_count 
        : 0,
      
      currentPlan,
      paymentLinksUsed: 0, // You'll need to fetch this from your API
      paymentLinksLimit: limits.paymentLinks,
      invoicesUsed: 0, // You'll need to fetch this from your API
      invoicesLimit: limits.invoices,
      teamMembersUsed: 1, // You'll need to fetch this from your API
      teamMembersLimit: limits.teamMembers,
      
      hasUsedSubscriptions: false, // You'll need to track this
      hasUsedCoupons: (stats.revenue?.coupon_payment_count || 0) > 0,
      hasUsedWebhooks: !!profile.webhook_url,
      hasUsedAPI: false, // You'll need to track this
      
      accountAge,
      lastUpgradePrompt,
      
      currency,
      currencySymbol,
    };
  }, [stats, profile, currency, currencySymbol]);

  // Get all messages
  const allMessages = useMemo(() => {
    if (!usageData) return [];
    return getUpgradeMessages(usageData);
  }, [usageData]);

  // Filter out dismissed messages
  const activeMessages = useMemo(() => {
    return allMessages.filter(msg => !dismissedMessages.includes(msg.id));
  }, [allMessages, dismissedMessages]);

  // Get dashboard banner
  const dashboardBanner = useMemo(() => {
    if (!usageData) return null;
    const banner = getDashboardBanner(usageData);
    if (banner && dismissedMessages.includes(banner.id)) {
      return null;
    }
    return banner;
  }, [usageData, dismissedMessages]);

  // Dismiss a message
  const dismissMessage = (messageId: string) => {
    const updated = [...dismissedMessages, messageId];
    setDismissedMessages(updated);
    localStorage.setItem(DISMISSED_MESSAGES_KEY, JSON.stringify(updated));
    
    // Update last prompt time
    localStorage.setItem(LAST_PROMPT_KEY, new Date().toISOString());
  };

  // Clear all dismissed messages (for testing or reset)
  const clearDismissed = () => {
    setDismissedMessages([]);
    localStorage.removeItem(DISMISSED_MESSAGES_KEY);
  };

  return {
    messages: activeMessages,
    dashboardBanner,
    dismissMessage,
    clearDismissed,
    isLoading: statsLoading || profileLoading,
    usageData,
  };
}
