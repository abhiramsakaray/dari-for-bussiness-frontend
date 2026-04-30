import React, { useState } from 'react';
import { useBilling } from '../../../hooks/useBilling';
import { useMerchantCurrency } from '../../../hooks/useMerchantCurrency';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle, TrendingUp, Link as LinkIcon, FileText, Users, History } from 'lucide-react';
import { BentoLayout } from '../BentoLayout';
import { BillingPeriodCard } from './BillingPeriodCard';
import { UsageHistoryModal } from './UsageHistoryModal';

export function UsageDashboard() {
  const { billingInfo, isLoading, error } = useBilling();
  const { currencySymbol } = useMerchantCurrency();
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  if (isLoading) {
    return (
      <BentoLayout activePage="usage">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </BentoLayout>
    );
  }

  if (error || !billingInfo) {
    return (
      <BentoLayout activePage="usage">
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load usage information
              {error && <div className="mt-2 text-xs font-mono">Error: {(error as Error).message}</div>}
            </AlertDescription>
          </Alert>
        </div>
      </BentoLayout>
    );
  }

  // Calculate usage percentages
  const usagePercentages = {
    volume: billingInfo.monthly_volume_limit
      ? (billingInfo.current_volume / billingInfo.monthly_volume_limit) * 100
      : 0,
    paymentLinks: billingInfo.payment_link_limit
      ? (billingInfo.current_payment_links / billingInfo.payment_link_limit) * 100
      : 0,
    invoices: billingInfo.invoice_limit
      ? (billingInfo.current_invoices / billingInfo.invoice_limit) * 100
      : 0,
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 90) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const formatLimit = (value: number | null) => {
    return value === null ? 'Unlimited' : value.toLocaleString();
  };

  // Check for warnings (90%+) and limits reached (100%)
  const hasWarnings = 
    usagePercentages.volume >= 90 ||
    usagePercentages.paymentLinks >= 90 ||
    usagePercentages.invoices >= 90;

  const hasLimitsReached = 
    usagePercentages.volume >= 100 ||
    usagePercentages.paymentLinks >= 100 ||
    usagePercentages.invoices >= 100;

  const getPlanName = () => {
    const names = {
      free: 'Free Plan',
      growth: 'Growth Plan',
      business: 'Business Plan',
      enterprise: 'Enterprise Plan'
    };
    return names[billingInfo.tier] || 'Current Plan';
  };

  return (
    <BentoLayout activePage="usage">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Usage & Limits</h1>
            <p className="text-muted-foreground">
              Track your current usage against {getPlanName()} limits
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowHistoryModal(true)}
            className="gap-2"
          >
            <History className="w-4 h-4" />
            View Past Usage
          </Button>
        </div>

        {/* Billing Period Card */}
        {billingInfo.current_period_start && billingInfo.current_period_end && (
          <BillingPeriodCard
            periodStart={billingInfo.current_period_start}
            periodEnd={billingInfo.current_period_end}
          />
        )}

        {/* Warning Banners */}
        {hasWarnings && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">⚠️ Approaching Limit</AlertTitle>
            <AlertDescription className="text-yellow-700">
              <p className="mb-4">You're approaching your plan limits. Upgrade now to avoid service interruption.</p>
              <Button
                onClick={() => window.location.href = '/billing'}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Upgrade Plan
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {hasLimitsReached && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">🚫 Limit Reached</AlertTitle>
            <AlertDescription className="text-red-700">
              <p className="mb-4">You've reached your plan limit. Upgrade now to continue accepting payments and using services.</p>
              <Button
                onClick={() => window.location.href = '/billing'}
                variant="destructive"
              >
                Upgrade Now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Usage Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
            <CardDescription>
              Track your current usage against plan limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transaction Volume */}
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Transaction Volume</span>
                <span className="text-sm text-muted-foreground">
                  {currencySymbol}{billingInfo.current_volume.toLocaleString()} /{' '}
                  {billingInfo.monthly_volume_limit
                    ? `${currencySymbol}${billingInfo.monthly_volume_limit.toLocaleString()}`
                    : 'Unlimited'}
                </span>
              </div>
              {billingInfo.monthly_volume_limit && (
                <Progress value={usagePercentages.volume} />
              )}
              {usagePercentages.volume >= 90 && usagePercentages.volume < 100 && (
                <p className="text-yellow-600 text-sm mt-2">
                  ⚠️ You've used {usagePercentages.volume.toFixed(1)}% of your limit
                </p>
              )}
              {usagePercentages.volume >= 100 && (
                <p className="text-red-600 text-sm mt-2">
                  🚫 Limit reached. Upgrade to continue accepting payments.
                </p>
              )}
            </div>

            {/* Payment Links */}
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Payment Links
                </span>
                <span className="text-sm text-muted-foreground">
                  {billingInfo.current_payment_links} / {formatLimit(billingInfo.payment_link_limit)}
                </span>
              </div>
              {billingInfo.payment_link_limit && (
                <Progress value={usagePercentages.paymentLinks} />
              )}
              {usagePercentages.paymentLinks >= 90 && usagePercentages.paymentLinks < 100 && (
                <p className="text-yellow-600 text-sm mt-2">
                  ⚠️ You've used {usagePercentages.paymentLinks.toFixed(1)}% of your limit
                </p>
              )}
              {usagePercentages.paymentLinks >= 100 && (
                <p className="text-red-600 text-sm mt-2">
                  🚫 Limit reached. Upgrade to create more payment links.
                </p>
              )}
            </div>

            {/* Invoices */}
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Invoices
                </span>
                <span className="text-sm text-muted-foreground">
                  {billingInfo.current_invoices} / {formatLimit(billingInfo.invoice_limit)}
                </span>
              </div>
              {billingInfo.invoice_limit && (
                <Progress value={usagePercentages.invoices} />
              )}
              {usagePercentages.invoices >= 90 && usagePercentages.invoices < 100 && (
                <p className="text-yellow-600 text-sm mt-2">
                  ⚠️ You've used {usagePercentages.invoices.toFixed(1)}% of your limit
                </p>
              )}
              {usagePercentages.invoices >= 100 && (
                <p className="text-red-600 text-sm mt-2">
                  🚫 Limit reached. Upgrade to create more invoices.
                </p>
              )}
            </div>

            {/* Team Members */}
            {billingInfo.team_member_limit && (
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Team Members
                  </span>
                  <span className="text-sm text-muted-foreground">
                    1 / {billingInfo.team_member_limit}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage History Modal */}
        <UsageHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
        />
      </div>
    </BentoLayout>
  );
}
