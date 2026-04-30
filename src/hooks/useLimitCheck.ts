import { useState } from 'react';
import { useUsageLimits } from './useUsageLimits';
import { LimitAction } from '../services/usage-limits.service';

export interface LimitCheckResult {
  allowed: boolean;
  showUpgradeModal: boolean;
  upgradeModalData: {
    title: string;
    message: string;
    currentPlan: string;
  } | null;
}

export function useLimitCheck() {
  const { checkLimit } = useUsageLimits();
  const [upgradeModalData, setUpgradeModalData] = useState<{
    title: string;
    message: string;
    currentPlan: string;
  } | null>(null);

  const checkActionLimit = async (
    action: LimitAction,
    amount?: number,
    currency?: string
  ): Promise<LimitCheckResult> => {
    try {
      const result = await checkLimit({ action, amount, currency });

      if (!result.allowed) {
        setUpgradeModalData({
          title: getActionTitle(action),
          message: result.message,
          currentPlan: result.plan_name,
        });

        return {
          allowed: false,
          showUpgradeModal: true,
          upgradeModalData: {
            title: getActionTitle(action),
            message: result.message,
            currentPlan: result.plan_name,
          },
        };
      }

      return {
        allowed: true,
        showUpgradeModal: false,
        upgradeModalData: null,
      };
    } catch (error) {
      console.error('Error checking limit:', error);
      // Fail open - allow the action if check fails
      return {
        allowed: true,
        showUpgradeModal: false,
        upgradeModalData: null,
      };
    }
  };

  const closeUpgradeModal = () => {
    setUpgradeModalData(null);
  };

  return {
    checkActionLimit,
    upgradeModalData,
    closeUpgradeModal,
    showUpgradeModal: !!upgradeModalData,
  };
}

function getActionTitle(action: LimitAction): string {
  const titles: Record<LimitAction, string> = {
    create_payment: 'Transaction Volume Limit Reached',
    create_payment_link: 'Payment Link Limit Reached',
    create_invoice: 'Invoice Limit Reached',
    add_team_member: 'Team Member Limit Reached',
    create_subscription_plan: 'Subscription Plan Limit Reached',
    accept_subscription: 'Active Subscription Limit Reached',
  };
  return titles[action];
}
