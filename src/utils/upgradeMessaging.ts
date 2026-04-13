/**
 * Dynamic Upgrade Messaging System for DARI
 * Generates contextual, data-driven upgrade prompts based on user behavior and usage
 */

export interface UserUsageData {
  // Payment metrics
  totalPayments: number;
  monthlyVolume: number;
  totalVolume: number;
  averagePaymentValue: number;
  
  // Plan limits
  currentPlan: 'free' | 'growth' | 'business' | 'enterprise';
  paymentLinksUsed: number;
  paymentLinksLimit: number;
  invoicesUsed: number;
  invoicesLimit: number;
  teamMembersUsed: number;
  teamMembersLimit: number;
  
  // Feature usage
  hasUsedSubscriptions: boolean;
  hasUsedCoupons: boolean;
  hasUsedWebhooks: boolean;
  hasUsedAPI: boolean;
  
  // Time-based
  accountAge: number; // days
  lastUpgradePrompt?: Date;
  
  // Currency
  currency: string;
  currencySymbol: string;
}

export interface UpgradeMessage {
  id: string;
  trigger: 'usage_limit' | 'save_money' | 'save_time' | 'roi' | 'social_proof' | 'feature_unlock';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  cta: string;
  secondaryCta?: string;
  targetPlan: 'growth' | 'business' | 'enterprise';
  dismissible: boolean;
  showFreeTrial?: boolean;
}

/**
 * Calculate usage percentage for a resource
 */
function getUsagePercentage(used: number, limit: number): number {
  if (limit === 0 || limit === Infinity) return 0;
  return Math.round((used / limit) * 100);
}

/**
 * Format currency with proper symbol
 */
function formatCurrency(amount: number, symbol: string): string {
  if (amount >= 10000000) { // 1 Crore
    return `${symbol}${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) { // 1 Lakh
    return `${symbol}${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`;
  }
  return `${symbol}${amount.toLocaleString()}`;
}

/**
 * Calculate potential savings based on volume
 */
function calculateSavings(monthlyVolume: number, currentPlan: string): number {
  const feeReduction: Record<string, number> = {
    free: 0.015, // 1.5% to 1%
    growth: 0.005, // 1% to 0.8%
    business: 0.003, // 0.8% to 0.5%
  };
  
  const reduction = feeReduction[currentPlan] || 0;
  return monthlyVolume * reduction;
}

/**
 * Generate usage limit upgrade messages
 */
export function generateUsageLimitMessages(data: UserUsageData): UpgradeMessage[] {
  const messages: UpgradeMessage[] = [];
  
  // Payment Links limit
  const linksUsage = getUsagePercentage(data.paymentLinksUsed, data.paymentLinksLimit);
  if (linksUsage >= 80 && data.currentPlan === 'free') {
    messages.push({
      id: 'payment-links-limit',
      trigger: 'usage_limit',
      urgency: linksUsage >= 95 ? 'critical' : 'high',
      title: linksUsage >= 95 ? '🚨 Payment Links Limit Reached' : '⚠️ Running Low on Payment Links',
      message: `You've used ${data.paymentLinksUsed} of ${data.paymentLinksLimit} payment links (${linksUsage}%). Upgrade to Growth for unlimited links and keep your business running smoothly.`,
      cta: 'Upgrade to Growth',
      secondaryCta: 'View Plans',
      targetPlan: 'growth',
      dismissible: linksUsage < 95,
      showFreeTrial: true,
    });
  }
  
  // Invoices limit
  const invoicesUsage = getUsagePercentage(data.invoicesUsed, data.invoicesLimit);
  if (invoicesUsage >= 80 && data.currentPlan === 'free') {
    messages.push({
      id: 'invoices-limit',
      trigger: 'usage_limit',
      urgency: invoicesUsage >= 95 ? 'critical' : 'high',
      title: invoicesUsage >= 95 ? '🚨 Invoice Limit Reached' : '⚠️ Invoice Limit Almost Full',
      message: `You've created ${data.invoicesUsed} of ${data.invoicesLimit} invoices this month (${invoicesUsage}%). Upgrade for unlimited invoicing and professional billing features.`,
      cta: 'Unlock Unlimited',
      secondaryCta: 'See Pricing',
      targetPlan: 'growth',
      dismissible: invoicesUsage < 95,
      showFreeTrial: true,
    });
  }
  
  // Team members limit
  const teamUsage = getUsagePercentage(data.teamMembersUsed, data.teamMembersLimit);
  if (teamUsage >= 100 && data.currentPlan !== 'enterprise') {
    const nextPlan = data.currentPlan === 'free' ? 'growth' : 'business';
    messages.push({
      id: 'team-limit',
      trigger: 'usage_limit',
      urgency: 'high',
      title: '👥 Need More Team Members?',
      message: `You've reached your team limit (${data.teamMembersUsed}/${data.teamMembersLimit}). Upgrade to ${nextPlan === 'growth' ? 'Growth' : 'Business'} to add more team members and collaborate better.`,
      cta: `Upgrade to ${nextPlan === 'growth' ? 'Growth' : 'Business'}`,
      targetPlan: nextPlan,
      dismissible: true,
    });
  }
  
  // Monthly volume approaching limit
  if (data.monthlyVolume >= 800 && data.currentPlan === 'free') {
    messages.push({
      id: 'volume-limit',
      trigger: 'usage_limit',
      urgency: data.monthlyVolume >= 950 ? 'critical' : 'medium',
      title: '📊 You\'re Growing Fast!',
      message: `You've processed ${formatCurrency(data.monthlyVolume, data.currencySymbol)} this month. You're approaching the ${formatCurrency(1000, data.currencySymbol)} free tier limit. Upgrade now to avoid service interruption.`,
      cta: 'Upgrade Now',
      secondaryCta: 'Learn More',
      targetPlan: 'growth',
      dismissible: data.monthlyVolume < 950,
      showFreeTrial: true,
    });
  }
  
  return messages;
}

/**
 * Generate save money messages
 */
export function generateSaveMoneyMessages(data: UserUsageData): UpgradeMessage[] {
  const messages: UpgradeMessage[] = [];
  const savings = calculateSavings(data.monthlyVolume, data.currentPlan);
  
  if (savings > 100 && data.currentPlan !== 'enterprise') {
    const nextPlan = data.currentPlan === 'free' ? 'growth' : 'business';
    const monthlySavings = formatCurrency(savings, data.currencySymbol);
    const annualSavings = formatCurrency(savings * 12, data.currencySymbol);
    
    messages.push({
      id: 'fee-savings',
      trigger: 'save_money',
      urgency: 'medium',
      title: '💰 You Could Be Saving Money',
      message: `Based on your ${formatCurrency(data.monthlyVolume, data.currencySymbol)}/month volume, upgrading to ${nextPlan === 'growth' ? 'Growth' : 'Business'} would save you ~${monthlySavings}/month (${annualSavings}/year) in transaction fees.`,
      cta: `Save ${monthlySavings}/mo`,
      secondaryCta: 'See Breakdown',
      targetPlan: nextPlan,
      dismissible: true,
    });
  }
  
  // High volume users
  if (data.monthlyVolume >= 50000 && data.currentPlan !== 'business' && data.currentPlan !== 'enterprise') {
    messages.push({
      id: 'high-volume-savings',
      trigger: 'save_money',
      urgency: 'medium',
      title: '🎯 Unlock Lower Transaction Fees',
      message: `You're processing ${formatCurrency(data.monthlyVolume, data.currencySymbol)}/month. Business plan offers 0.5-0.8% fees vs your current 1-1.5%. That's real savings at scale.`,
      cta: 'Calculate Savings',
      targetPlan: 'business',
      dismissible: true,
    });
  }
  
  return messages;
}

/**
 * Generate save time messages
 */
export function generateSaveTimeMessages(data: UserUsageData): UpgradeMessage[] {
  const messages: UpgradeMessage[] = [];
  
  // Subscription automation
  if (data.totalPayments >= 10 && !data.hasUsedSubscriptions && data.currentPlan === 'free') {
    messages.push({
      id: 'subscription-automation',
      trigger: 'save_time',
      urgency: 'low',
      title: '⏰ Automate Recurring Payments',
      message: `You've processed ${data.totalPayments} payments manually. Set up subscriptions to automate recurring billing and save hours every month.`,
      cta: 'Try Subscriptions',
      secondaryCta: 'Learn How',
      targetPlan: 'growth',
      dismissible: true,
      showFreeTrial: true,
    });
  }
  
  // API automation
  if (data.totalPayments >= 20 && !data.hasUsedAPI && data.currentPlan === 'free') {
    messages.push({
      id: 'api-automation',
      trigger: 'save_time',
      urgency: 'low',
      title: '🚀 Automate with API Integration',
      message: `Creating ${data.totalPayments} payments manually? Integrate our API and automate your entire payment flow. Save hours every week.`,
      cta: 'Get API Access',
      targetPlan: 'growth',
      dismissible: true,
    });
  }
  
  // Team collaboration
  if (data.teamMembersUsed === 1 && data.totalPayments >= 30 && data.currentPlan === 'free') {
    messages.push({
      id: 'team-collaboration',
      trigger: 'save_time',
      urgency: 'low',
      title: '👥 Scale with Your Team',
      message: `Managing ${data.totalPayments} payments alone? Add team members to distribute work, set permissions, and move faster.`,
      cta: 'Add Team Members',
      targetPlan: 'growth',
      dismissible: true,
    });
  }
  
  return messages;
}

/**
 * Generate ROI messages
 */
export function generateROIMessages(data: UserUsageData): UpgradeMessage[] {
  const messages: UpgradeMessage[] = [];
  
  // Strong growth trajectory
  if (data.monthlyVolume >= 5000 && data.currentPlan === 'free') {
    const projectedAnnual = data.monthlyVolume * 12;
    const savings = calculateSavings(data.monthlyVolume, 'free') * 12;
    
    messages.push({
      id: 'growth-roi',
      trigger: 'roi',
      urgency: 'medium',
      title: '📈 Your Business is Growing',
      message: `You processed ${formatCurrency(data.monthlyVolume, data.currencySymbol)} this month. At this rate, you'll do ${formatCurrency(projectedAnnual, data.currencySymbol)} annually. Upgrade now to save ${formatCurrency(savings, data.currencySymbol)}/year in fees and unlock growth features.`,
      cta: 'Upgrade & Save',
      secondaryCta: 'View ROI',
      targetPlan: 'growth',
      dismissible: true,
      showFreeTrial: true,
    });
  }
  
  // High transaction count
  if (data.totalPayments >= 50 && data.currentPlan === 'free') {
    messages.push({
      id: 'transaction-roi',
      trigger: 'roi',
      urgency: 'medium',
      title: '🎯 You\'re a Power User',
      message: `${data.totalPayments} payments processed! You're clearly serious about this. Upgrade to Growth for advanced analytics, webhooks, and priority support to scale even faster.`,
      cta: 'Unlock Pro Features',
      targetPlan: 'growth',
      dismissible: true,
      showFreeTrial: true,
    });
  }
  
  // Enterprise-ready volume
  if (data.monthlyVolume >= 500000 && data.currentPlan !== 'enterprise') {
    messages.push({
      id: 'enterprise-roi',
      trigger: 'roi',
      urgency: 'high',
      title: '🏢 Ready for Enterprise?',
      message: `Processing ${formatCurrency(data.monthlyVolume, data.currencySymbol)}/month? Get 0.2-0.5% fees, dedicated support, SLA guarantees, and custom integrations with Enterprise.`,
      cta: 'Talk to Sales',
      targetPlan: 'enterprise',
      dismissible: true,
    });
  }
  
  return messages;
}

/**
 * Generate social proof messages
 */
export function generateSocialProofMessages(data: UserUsageData): UpgradeMessage[] {
  const messages: UpgradeMessage[] = [];
  
  // New user onboarding
  if (data.accountAge <= 7 && data.totalPayments < 5 && data.currentPlan === 'free') {
    messages.push({
      id: 'social-proof-onboarding',
      trigger: 'social_proof',
      urgency: 'low',
      title: '🌟 Join 500+ Growing Businesses',
      message: `Businesses on Growth plan process 3x more payments and save an average of ₹15K/month in fees. Start your 7-day free trial today.`,
      cta: 'Start Free Trial',
      targetPlan: 'growth',
      dismissible: true,
      showFreeTrial: true,
    });
  }
  
  // Active user
  if (data.totalPayments >= 20 && data.currentPlan === 'free') {
    messages.push({
      id: 'social-proof-active',
      trigger: 'social_proof',
      urgency: 'low',
      title: '✨ Trusted by 500+ Businesses',
      message: `Companies like yours upgraded to Growth and saw 40% faster payment collection with automated subscriptions and smart retry logic.`,
      cta: 'See Success Stories',
      secondaryCta: 'Upgrade Now',
      targetPlan: 'growth',
      dismissible: true,
    });
  }
  
  return messages;
}

/**
 * Generate feature unlock messages
 */
export function generateFeatureUnlockMessages(data: UserUsageData): UpgradeMessage[] {
  const messages: UpgradeMessage[] = [];
  
  // Webhooks for automation
  if (data.totalPayments >= 15 && !data.hasUsedWebhooks && data.currentPlan === 'free') {
    messages.push({
      id: 'webhooks-unlock',
      trigger: 'feature_unlock',
      urgency: 'low',
      title: '🔔 Real-time Payment Notifications',
      message: `Get instant webhooks when payments complete. Automate order fulfillment, send receipts, and update your systems in real-time.`,
      cta: 'Enable Webhooks',
      targetPlan: 'growth',
      dismissible: true,
      showFreeTrial: true,
    });
  }
  
  // Advanced analytics
  if (data.totalPayments >= 25 && data.currentPlan === 'free') {
    messages.push({
      id: 'analytics-unlock',
      trigger: 'feature_unlock',
      urgency: 'low',
      title: '📊 Unlock Advanced Analytics',
      message: `Track MRR/ARR, conversion rates, customer lifetime value, and more. Make data-driven decisions with Growth plan analytics.`,
      cta: 'See Analytics',
      targetPlan: 'growth',
      dismissible: true,
    });
  }
  
  // Fraud monitoring
  if (data.monthlyVolume >= 10000 && data.currentPlan !== 'business' && data.currentPlan !== 'enterprise') {
    messages.push({
      id: 'fraud-monitoring-unlock',
      trigger: 'feature_unlock',
      urgency: 'medium',
      title: '🛡️ Protect Your Revenue',
      message: `Processing ${formatCurrency(data.monthlyVolume, data.currencySymbol)}/month? Business plan includes fraud monitoring, risk assessment, and automatic flagging to protect your business.`,
      cta: 'Add Protection',
      targetPlan: 'business',
      dismissible: true,
    });
  }
  
  return messages;
}

/**
 * Get all relevant upgrade messages for a user
 */
export function getUpgradeMessages(data: UserUsageData): UpgradeMessage[] {
  // Don't show upgrade prompts too frequently
  if (data.lastUpgradePrompt) {
    const hoursSinceLastPrompt = (Date.now() - data.lastUpgradePrompt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastPrompt < 24) {
      return [];
    }
  }
  
  const allMessages = [
    ...generateUsageLimitMessages(data),
    ...generateSaveMoneyMessages(data),
    ...generateSaveTimeMessages(data),
    ...generateROIMessages(data),
    ...generateSocialProofMessages(data),
    ...generateFeatureUnlockMessages(data),
  ];
  
  // Sort by urgency
  const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  allMessages.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
  
  // Return top 3 most relevant messages
  return allMessages.slice(0, 3);
}

/**
 * Get a single banner message for dashboard
 */
export function getDashboardBanner(data: UserUsageData): UpgradeMessage | null {
  const messages = getUpgradeMessages(data);
  
  // Return highest priority message
  return messages.find(m => m.urgency === 'critical' || m.urgency === 'high') || messages[0] || null;
}

/**
 * Email subject lines for upgrade campaigns
 */
export function getEmailSubjectLines(data: UserUsageData): string[] {
  const subjects: string[] = [];
  
  if (data.monthlyVolume >= 5000) {
    subjects.push(`Save ${formatCurrency(calculateSavings(data.monthlyVolume, data.currentPlan) * 12, data.currencySymbol)}/year on transaction fees`);
  }
  
  if (data.totalPayments >= 20) {
    subjects.push(`You've processed ${data.totalPayments} payments - time to upgrade?`);
  }
  
  subjects.push(
    '🚀 Unlock unlimited payments + 7-day free trial',
    `Your business processed ${formatCurrency(data.monthlyVolume, data.currencySymbol)} this month`,
    '3 features you\'re missing on the free plan',
    'Lower fees + better features = more profit',
    '500+ businesses trust DARI Growth plan'
  );
  
  return subjects;
}
