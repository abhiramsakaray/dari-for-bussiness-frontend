import React, { ReactNode } from 'react';
import { useBilling } from '../hooks/useBilling';
import { Alert, AlertDescription, AlertTitle } from '../app/components/ui/alert';
import { Button } from '../app/components/ui/button';
import { Lock, TrendingUp } from 'lucide-react';
import { PlanFeatures } from '../services/billing.service';

interface FeatureGateProps {
  feature: keyof PlanFeatures;
  fallback?: ReactNode;
  showUpgrade?: boolean;
  children: ReactNode;
}

export function FeatureGate({ feature, fallback, showUpgrade = true, children }: FeatureGateProps) {
  const { billingInfo, isLoading } = useBilling();

  if (isLoading) {
    return <div className="animate-pulse h-20 bg-muted rounded"></div>;
  }

  // If no billing info, show children (fail open for better UX)
  if (!billingInfo) {
    return <>{children}</>;
  }

  const hasFeature = billingInfo.plan_details.features[feature];

  // If feature is available, show children
  if (hasFeature) {
    return <>{children}</>;
  }

  // If feature is not available, show fallback or upgrade prompt
  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgrade) {
    return (
      <Alert className="border-primary/50">
        <Lock className="h-4 w-4" />
        <AlertTitle>Upgrade Required</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>This feature is not available on your current plan.</span>
          <Button
            size="sm"
            onClick={() => (window.location.hash = '#/billing')}
            className="ml-4"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

interface UsageLimitGateProps {
  usage: number;
  limit: number | null; // null = unlimited
  limitName: string;
  children: ReactNode;
}

export function UsageLimitGate({ usage, limit, limitName, children }: UsageLimitGateProps) {
  const { billingInfo } = useBilling();

  // Unlimited
  if (limit === null) {
    return <>{children}</>;
  }

  // Check if limit exceeded
  if (usage >= limit) {
    return (
      <Alert className="border-destructive/50">
        <Lock className="h-4 w-4" />
        <AlertTitle>Limit Reached</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>
            You've reached your {limitName} limit ({usage}/{limit}).
          </span>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => (window.location.hash = '#/billing')}
            className="ml-4"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}

// Hook to check feature availability
export function useFeatureAccess(feature: keyof PlanFeatures): boolean {
  const { billingInfo } = useBilling();
  
  if (!billingInfo) return true; // Fail open
  
  return billingInfo.plan_details.features[feature] as boolean;
}

// Hook to check usage limits
export function useUsageLimit(
  usage: number,
  limit: number | null
): { canUse: boolean; percentage: number; remaining: number | null } {
  if (limit === null) {
    return { canUse: true, percentage: 0, remaining: null };
  }

  const canUse = usage < limit;
  const percentage = (usage / limit) * 100;
  const remaining = limit - usage;

  return { canUse, percentage, remaining };
}
