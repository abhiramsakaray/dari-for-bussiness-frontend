import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { GatewayHealthBadge } from './GatewayHealthBadge';
import { Skeleton } from '../ui/skeleton';
import { Activity, DollarSign, Zap, Clock } from 'lucide-react';
import type { GatewayPerformance } from '../../../types/orchestration.types';
import { useMerchantCurrency } from '../../../hooks/useMerchantCurrency';

function GatewayCard({ gw }: { gw: GatewayPerformance }) {
  const { currencySymbol } = useMerchantCurrency();
  const successPct = ((gw.success_rate ?? 0) * 100).toFixed(1);
  const errorPct = ((gw.health?.error_rate ?? 0) * 100).toFixed(2);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold capitalize">{gw.gateway}</CardTitle>
          <GatewayHealthBadge status={gw.health?.status ?? 'down'} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Success rate */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Activity className="size-3.5" /> Success Rate
          </span>
          <span className="font-medium">{successPct}%</span>
        </div>

        {/* Transactions */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Zap className="size-3.5" /> Transactions
          </span>
          <span className="font-medium">{(gw.transactions ?? 0).toLocaleString()}</span>
        </div>

        {/* Volume */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <DollarSign className="size-3.5" /> Volume
          </span>
          <span className="font-medium">{currencySymbol}{parseFloat(gw.volume || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>

        {/* Latency */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="size-3.5" /> Avg Latency
          </span>
          <span className="font-medium">{(gw.latency?.avg_ms ?? 0).toFixed(0)}ms</span>
        </div>

        {/* Uptime */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Uptime (24h)</span>
          <span className="font-medium">{(gw.health?.uptime_percentage ?? 0).toFixed(2)}%</span>
        </div>

        {/* Error rate */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Error Rate</span>
          <span className={`font-medium ${parseFloat(errorPct) > 5 ? 'text-red-600' : ''}`}>
            {errorPct}%
          </span>
        </div>

        {/* Fees */}
        <div className="flex items-center justify-between text-sm border-t pt-2">
          <span className="text-muted-foreground">Total Fees</span>
          <span className="font-medium">{currencySymbol}{parseFloat(gw.fees || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function GatewayOverviewCards({
  gateways,
  isLoading,
}: {
  gateways: GatewayPerformance[] | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-48" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!gateways?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No gateway data available. Connect payment gateways to see performance metrics.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {gateways.map((gw) => (
        <GatewayCard key={gw.gateway} gw={gw} />
      ))}
    </div>
  );
}
