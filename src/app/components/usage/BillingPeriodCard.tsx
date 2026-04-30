import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calendar, Clock } from 'lucide-react';
import { usageHistoryService } from '../../../services/usage-history.service';

interface BillingPeriodCardProps {
  periodStart: string;
  periodEnd: string;
}

export function BillingPeriodCard({ periodStart, periodEnd }: BillingPeriodCardProps) {
  const daysRemaining = usageHistoryService.getDaysRemaining(periodEnd);
  const progress = usageHistoryService.getPeriodProgress(periodStart, periodEnd);
  const startDate = usageHistoryService.formatDate(periodStart);
  const endDate = usageHistoryService.formatDate(periodEnd);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5" />
          Current Billing Period
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Period</div>
          <div className="text-sm font-medium">
            {startDate} - {endDate}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Days Remaining
          </div>
          <div className="text-sm font-semibold">
            {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Period Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {daysRemaining <= 5 && (
          <div className="text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            ⚠️ Your billing period ends in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}. Usage will reset on {endDate}.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
