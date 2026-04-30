import React from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle } from 'lucide-react';

export interface LimitWarningBannerProps {
  limitType: string;
  percentage: number;
  upgradeUrl?: string;
}

export function LimitWarningBanner({
  limitType,
  percentage,
  upgradeUrl = '/billing',
}: LimitWarningBannerProps) {
  if (percentage < 90) return null;

  return (
    <Alert className="bg-yellow-50 border-l-4 border-yellow-400 mb-4">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
        <AlertDescription className="ml-3 text-sm text-yellow-700">
          You've used <strong>{percentage.toFixed(1)}%</strong> of your {limitType} limit.
          <a
            href={upgradeUrl}
            className="font-medium underline ml-2 hover:text-yellow-800"
          >
            Upgrade to continue
          </a>
        </AlertDescription>
      </div>
    </Alert>
  );
}
