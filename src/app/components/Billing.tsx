import React, { useState } from 'react';
import { useBilling } from '../../hooks/useBilling';
import { useMerchantCurrency } from '../../hooks/useMerchantCurrency';
import { BentoLayout } from "./BentoLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  TrendingUp,
  Users,
  FileText,
  Link as LinkIcon,
  Zap,
  AlertCircle,
  Crown,
  Building,
} from 'lucide-react';
import { PlanTier } from '../../services/billing.service';

export function Billing() {
  const { billingInfo, isLoading, error, changePlan, isChangingPlan } = useBilling();
  const { currencySymbol } = useMerchantCurrency();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<PlanTier | null>(null);

  if (isLoading) {
    return (
      <BentoLayout activePage="billing">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </BentoLayout>
    );
  }

  if (!billingInfo) {
    return (
      <BentoLayout activePage="billing">
        <div className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load billing information
              {error && <div className="mt-2 text-xs font-mono">Error: {error.message}</div>}
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

  const CHAINPE_PLAN_URLS: Record<string, string> = {
    growth: 'https://api.daripay.xyz/subscribe/plan_QzdDtYYNk8VvEw8g',
    business: 'https://api.daripay.xyz/subscribe/plan_pcLCq5HLYGafUGhq',
  };

  const handlePlanChange = (planId: PlanTier) => {
    if (planId === 'growth' || planId === 'business') {
      const checkoutUrl = CHAINPE_PLAN_URLS[planId];
      const successUrl = `${window.location.origin}/dashboard/billing`;
      window.location.href = `${checkoutUrl}?success_url=${encodeURIComponent(successUrl)}`;
      return;
    }
    setSelectedPlanForUpgrade(planId);
  };

  const confirmPlanChange = () => {
    if (selectedPlanForUpgrade) {
      changePlan(selectedPlanForUpgrade);
      setSelectedPlanForUpgrade(null);
    }
  };

  const handleCancelSubscription = () => {
    setShowCancelDialog(false);
  };

  const getPlanIcon = (planId: PlanTier) => {
    switch (planId) {
      case 'free':
        return Zap;
      case 'growth':
        return TrendingUp;
      case 'business':
        return Building;
      case 'enterprise':
        return Crown;
      default:
        return Zap;
    }
  };

  const getPlanName = (tier: PlanTier) => {
    const names = {
      free: 'Free',
      growth: 'Growth',
      business: 'Business',
      enterprise: 'Enterprise'
    };
    return names[tier];
  };

  return (
    <BentoLayout activePage="billing">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Billing & Plans</h1>
          <p className="text-muted-foreground">
            Manage your subscription and view your usage
          </p>
        </div>

        {/* Current Plan Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Plan</CardTitle>
              <Badge variant={billingInfo.status === 'active' ? 'default' : 'secondary'}>
                {billingInfo.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3">
                {React.createElement(getPlanIcon(billingInfo.tier), {
                  className: 'w-8 h-8 text-primary',
                })}
                <div>
                  <h3 className="text-2xl font-bold">{getPlanName(billingInfo.tier)}</h3>
                  <p className="text-sm text-muted-foreground">
                    Transaction fee: {billingInfo.transaction_fee_percent}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {currencySymbol}{billingInfo.monthly_price}
                </div>
                <div className="text-sm text-muted-foreground">
                  per month
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Billing period: {new Date(billingInfo.current_period_start).toLocaleDateString()} - {new Date(billingInfo.current_period_end).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        {/* Usage Stats */}
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
              <div className="flex justify-between text-sm">
                <span className="font-medium">Transaction Volume</span>
                <span className="text-muted-foreground">
                  {currencySymbol}{billingInfo.current_volume.toLocaleString()} /{' '}
                  {billingInfo.monthly_volume_limit
                    ? `${currencySymbol}${billingInfo.monthly_volume_limit.toLocaleString()}`
                    : 'Unlimited'}
                </span>
              </div>
              {billingInfo.monthly_volume_limit && <Progress value={usagePercentages.volume} />}
            </div>

            {/* Payment Links */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Payment Links
                </span>
                <span className="text-muted-foreground">
                  {billingInfo.current_payment_links} /{' '}
                  {billingInfo.payment_link_limit ?? 'Unlimited'}
                </span>
              </div>
              {billingInfo.payment_link_limit && (
                <Progress value={usagePercentages.paymentLinks} />
              )}
            </div>

            {/* Invoices */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Invoices
                </span>
                <span className="text-muted-foreground">
                  {billingInfo.current_invoices} / {billingInfo.invoice_limit ?? 'Unlimited'}
                </span>
              </div>
              {billingInfo.invoice_limit && <Progress value={usagePercentages.invoices} />}
            </div>

            {/* Team Members */}
            {billingInfo.team_member_limit && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Team Members
                  </span>
                  <span className="text-muted-foreground">
                    1 / {billingInfo.team_member_limit}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>
              Choose the plan that best fits your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(['free', 'growth', 'business', 'enterprise'] as PlanTier[]).map((planId) => {
                const isCurrent = billingInfo.tier === planId;
                const PlanIcon = getPlanIcon(planId);
                const prices = { free: 0, growth: 29, business: 99, enterprise: 'Custom' };
                
                return (
                  <Card key={planId} className={isCurrent ? 'border-primary' : ''}>
                    <CardHeader>
                      <PlanIcon className="w-6 h-6 mb-2" />
                      <CardTitle className="text-lg">{getPlanName(planId)}</CardTitle>
                      <div className="text-2xl font-bold">
                        {typeof prices[planId] === 'number' ? `${currencySymbol}${prices[planId]}` : prices[planId]}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isCurrent ? (
                        <Badge variant="default" className="w-full justify-center">
                          Current Plan
                        </Badge>
                      ) : (
                        <Button
                          variant={planId === 'enterprise' ? 'default' : 'outline'}
                          className="w-full"
                          onClick={() => handlePlanChange(planId)}
                          disabled={isChangingPlan}
                        >
                          {planId === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Confirmation Dialog */}
      <AlertDialog open={!!selectedPlanForUpgrade} onOpenChange={() => setSelectedPlanForUpgrade(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Plan Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change to the {selectedPlanForUpgrade && getPlanName(selectedPlanForUpgrade)} plan?
              {selectedPlanForUpgrade === 'enterprise' && (
                <span className="mt-2 block">Our sales team will contact you to discuss enterprise pricing.</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPlanChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? You'll lose access to premium features
              at the end of your billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelSubscription} className="bg-destructive">
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </BentoLayout>
  );
}
