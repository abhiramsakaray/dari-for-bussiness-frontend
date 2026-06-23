import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import type { OrchestrationAnalyticsResponse } from '../../../types/orchestration.types';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const STRATEGY_COLORS: Record<string, string> = {
  smart: 'rgb(59, 130, 246)',
  rule: 'rgb(139, 92, 246)',
  failover: 'rgb(251, 191, 36)',
  only_option: 'rgb(156, 163, 175)',
};

const STRATEGY_LABELS: Record<string, string> = {
  smart: 'Smart Routing',
  rule: 'Custom Rules',
  failover: 'Failover',
  only_option: 'Single Gateway',
};

export function StrategyDistribution({
  analytics,
  isLoading,
}: {
  analytics: OrchestrationAnalyticsResponse | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6"><Skeleton className="h-64" /></CardContent>
      </Card>
    );
  }

  const strategies = analytics?.by_strategy ?? {};
  const labels = Object.keys(strategies).map((k) => STRATEGY_LABELS[k] ?? k);
  const values = Object.values(strategies);
  const colors = Object.keys(strategies).map((k) => STRATEGY_COLORS[k] ?? 'rgb(200,200,200)');

  if (values.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-sm">Routing Strategy Distribution</CardTitle></CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          No routing decisions yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Routing Strategy Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center">
          <Doughnut
            data={{
              labels,
              datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 0,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16 } },
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function GatewayDistribution({
  analytics,
  isLoading,
}: {
  analytics: OrchestrationAnalyticsResponse | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6"><Skeleton className="h-64" /></CardContent>
      </Card>
    );
  }

  const byGateway = analytics?.by_gateway ?? {};
  const labels = Object.keys(byGateway).map((g) => g.charAt(0).toUpperCase() + g.slice(1));
  const values = Object.values(byGateway);

  const GATEWAY_COLORS = [
    'rgb(99, 102, 241)',
    'rgb(16, 185, 129)',
    'rgb(245, 158, 11)',
    'rgb(236, 72, 153)',
    'rgb(59, 130, 246)',
  ];

  if (values.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-sm">Gateway Usage Distribution</CardTitle></CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          No routing data yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Gateway Usage Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center">
          <Doughnut
            data={{
              labels,
              datasets: [{
                data: values,
                backgroundColor: GATEWAY_COLORS.slice(0, values.length),
                borderWidth: 0,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16 } },
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
