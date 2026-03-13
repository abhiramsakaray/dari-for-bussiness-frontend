import React from 'react';
import { useMRRARR, useMRRTrend } from '../../../hooks/useAnalytics';
import { formatCurrency } from '../../../lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  UserPlus,
  UserMinus,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export function MRRARRCard() {
  const { data, isLoading, error } = useMRRARR();
  const { data: trend } = useMRRTrend(6);

  if (error) {
    const status = (error as any)?.response?.status;
    if (status === 403) return null; // Feature not available on plan
    return (
      <Card className="border-red-200">
        <CardContent className="py-6 text-center text-muted-foreground">
          Failed to load recurring revenue data
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recurring Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const displayCurrency = data.mrr_local?.currency || 'USD';
  const mrr = Number(data.mrr_local?.amount ?? data.mrr ?? data.mrr_usd ?? 0);
  const arr = Number(data.arr_local?.amount ?? data.arr ?? data.arr_usd ?? 0);
  const rawChange = data.net_revenue_change_pct != null ? Number(data.net_revenue_change_pct) : null;
  const changePct = rawChange != null && Number.isFinite(rawChange) ? rawChange : null;
  const isPositive = changePct !== null && changePct >= 0;

  const trendChartData = trend
    ? {
        labels: trend.points.map((p) =>
          new Date(p.date).toLocaleDateString('en-US', { month: 'short' })
        ),
        datasets: [
          {
            label: `MRR (${displayCurrency})`,
            data: trend.points.map((p: any) => Number(p.mrr ?? p.mrr_local?.amount ?? p.mrr_usd ?? 0)),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
          },
        ],
      }
    : null;

  return (
    <div className="space-y-4">
      {/* MRR / ARR Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(mrr, displayCurrency)}</p>
                {data.mrr_local && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.mrr_local.currency} {Number(data.mrr_local.amount).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
            </div>
            {changePct !== null && (
              <div className="flex items-center gap-1 mt-2">
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{changePct}%
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Annual Recurring Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(arr, displayCurrency)}</p>
                {data.arr_local && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.arr_local.currency} {Number(data.arr_local.amount).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                <p className="text-2xl font-bold">{data.active_subscriptions}</p>
              </div>
              <div className="rounded-full bg-purple-500/10 p-3">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1 text-sm text-green-500">
                <UserPlus className="w-3 h-3" /> +{data.new_this_period}
              </span>
              <span className="flex items-center gap-1 text-sm text-red-500">
                <UserMinus className="w-3 h-3" /> -{data.churned_this_period}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Change</p>
                {changePct !== null ? (
                  <Badge
                    variant={isPositive ? 'default' : 'destructive'}
                    className="text-lg px-3 py-1"
                  >
                    {isPositive ? '+' : ''}{changePct}%
                  </Badge>
                ) : (
                  <p className="text-2xl font-bold text-muted-foreground">N/A</p>
                )}
              </div>
              <div className={`rounded-full p-3 ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {isPositive ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MRR Trend Chart */}
      {trendChartData && (
        <Card>
          <CardHeader>
            <CardTitle>MRR Trend</CardTitle>
            <CardDescription>Monthly recurring revenue over the last {trend?.period_months || 6} months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Line
                data={trendChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => `MRR: ${formatCurrency(Number(ctx.parsed.y ?? 0), displayCurrency)}`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => formatCurrency(Number(value), displayCurrency),
                      },
                    },
                  },
                }}
              />
            </div>
            {/* Subscriber counts below chart */}
            {trend && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-4 pt-4 border-t">
                {trend.points.map((p) => (
                  <div key={p.date} className="text-center">
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.date).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p className="text-sm font-medium">{p.subscription_count} subs</p>
                    <div className="flex justify-center gap-2 text-xs">
                      <span className="text-green-500">+{p.new}</span>
                      <span className="text-red-500">-{p.churned}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MRRARRCard;
