import React from 'react';
import { useUsageHistory } from '../../../hooks/useUsageHistory';
import { usageHistoryService } from '../../../services/usage-history.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface UsageHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UsageHistoryModal({ isOpen, onClose }: UsageHistoryModalProps) {
  const { historyData, isLoading, error } = useUsageHistory(6);

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Usage History</DialogTitle>
            <DialogDescription>Loading historical usage data...</DialogDescription>
          </DialogHeader>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !historyData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Usage History</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load usage history. Please try again later.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  const { current_period, past_periods } = historyData;
  const lastPeriod = past_periods[0];

  // Calculate changes
  const volumeChange = lastPeriod
    ? usageHistoryService.calculateChange(current_period.total_volume, lastPeriod.total_volume)
    : 0;
  const linksChange = lastPeriod
    ? current_period.payment_links_created - lastPeriod.payment_links_created
    : 0;
  const invoicesChange = lastPeriod
    ? current_period.invoices_created - lastPeriod.invoices_created
    : 0;

  // Prepare chart data
  const allPeriods = [current_period, ...past_periods].reverse();
  const maxVolume = Math.max(...allPeriods.map(p => p.total_volume));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Usage History</DialogTitle>
          <DialogDescription>
            View your usage trends over the past {past_periods.length + 1} billing periods
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Comparison Table */}
          {lastPeriod && (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Metric</th>
                    <th className="text-right p-3 font-medium">Current Period</th>
                    <th className="text-right p-3 font-medium">Last Period</th>
                    <th className="text-right p-3 font-medium">Change</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3">Transaction Volume</td>
                    <td className="text-right p-3 font-medium">
                      {current_period.currency_symbol}{current_period.total_volume.toFixed(2)}
                    </td>
                    <td className="text-right p-3">
                      {lastPeriod.currency_symbol}{lastPeriod.total_volume.toFixed(2)}
                    </td>
                    <td className={`text-right p-3 font-medium ${volumeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {volumeChange >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {volumeChange >= 0 ? '+' : ''}{volumeChange.toFixed(1)}%
                      </div>
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">Payment Links</td>
                    <td className="text-right p-3 font-medium">
                      {current_period.payment_links_created}
                    </td>
                    <td className="text-right p-3">
                      {lastPeriod.payment_links_created}
                    </td>
                    <td className={`text-right p-3 font-medium ${linksChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {linksChange >= 0 ? '+' : ''}{linksChange}
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">Invoices</td>
                    <td className="text-right p-3 font-medium">
                      {current_period.invoices_created}
                    </td>
                    <td className="text-right p-3">
                      {lastPeriod.invoices_created}
                    </td>
                    <td className={`text-right p-3 font-medium ${invoicesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {invoicesChange >= 0 ? '+' : ''}{invoicesChange}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Usage Chart */}
          <div className="border rounded-lg p-6">
            <h3 className="text-sm font-semibold mb-4">Transaction Volume Trend</h3>
            <div className="flex items-end justify-between gap-2 h-48">
              {allPeriods.map((period, index) => {
                const height = maxVolume > 0 ? (period.total_volume / maxVolume) * 100 : 0;
                const isCurrent = index === allPeriods.length - 1;
                const monthLabel = new Date(period.period_start).toLocaleDateString('en-IN', {
                  month: 'short',
                });

                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center justify-end h-40">
                      <div
                        className={`w-full rounded-t-lg transition-all ${
                          isCurrent ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                        style={{ height: `${height}%` }}
                        title={`${period.currency_symbol}${period.total_volume.toFixed(2)}`}
                      />
                    </div>
                    <div className="text-xs text-center">
                      <div className="font-medium">{monthLabel}</div>
                      <div className="text-muted-foreground">
                        {period.currency_symbol}{period.total_volume.toFixed(0)}
                      </div>
                      {isCurrent && (
                        <div className="text-blue-600 font-semibold text-[10px]">Current</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Past Periods List */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted p-3">
              <h3 className="text-sm font-semibold">Past Billing Periods</h3>
            </div>
            <div className="divide-y">
              {past_periods.map((period, index) => (
                <div key={index} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">
                      {usageHistoryService.formatDate(period.period_start)} -{' '}
                      {usageHistoryService.formatDate(period.period_end)}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase">
                      {period.tier} Plan
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Volume</div>
                      <div className="font-medium">
                        {period.currency_symbol}{period.total_volume.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Links</div>
                      <div className="font-medium">{period.payment_links_created}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Invoices</div>
                      <div className="font-medium">{period.invoices_created}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
