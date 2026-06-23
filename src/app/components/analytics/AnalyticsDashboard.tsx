import React, { useState } from 'react';
import { useAnalyticsOverview, useRevenueTimeSeries, useConversionMetrics } from '../../../hooks/useAnalytics';
import { useMerchantCurrency } from '../../../hooks/useMerchantCurrency';
import { AnalyticsPeriod } from '../../../types/api.types';
import { formatCurrency, calculatePercentageChange } from '../../../lib/utils';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Target,
  Users,
  BarChart3,
  Clock,
  ChevronRight,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Landmark,
  Activity,
} from 'lucide-react';
import { BentoLayout } from "../BentoLayout";
import { useOptimizationInsights } from "../../../hooks/useOrchestration";
import { MRRARRCard } from './MRRARRCard';
import { CacheStatsCard } from './CacheStatsCard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CHART_COLORS = [
  'rgb(59, 130, 246)',
  'rgb(16, 185, 129)',
  'rgb(251, 191, 36)',
  'rgb(239, 68, 68)',
  'rgb(139, 92, 246)',
  'rgb(236, 72, 153)',
];

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('month');
  const { currency: merchantCurrency } = useMerchantCurrency();

  const { data: overview, isLoading: overviewLoading, error: overviewError } = useAnalyticsOverview(period);
  const { data: revenue, isLoading: revenueLoading } = useRevenueTimeSeries(period);
  const { data: conversion } = useConversionMetrics(30);
  
  // Use merchant's currency from settings, not from analytics data
  const analyticsCurrency = merchantCurrency || overview?.currency || 'USD';

  const totalVolume = overview?.payments?.total_volume ?? overview?.payments?.total_volume_usd ?? 0;
  const avgPayment = overview?.payments?.avg_payment ?? overview?.payments?.avg_payment_usd ?? 0;
  const invoiceVolume = overview?.invoice_volume ?? overview?.invoice_volume_usd ?? 0;

  // Determine active page based on current route
  const currentRoute = window.location.hash.slice(1);
  const activePage = currentRoute.includes('reports') ? 'reports' : 'analytics';

  if (overviewError) {
    const errorStatus = (overviewError as any)?.response?.status;
    const errorMessage = errorStatus === 403
      ? 'Analytics are not available on your current plan. Please upgrade to access this feature.'
      : 'Error loading analytics. Please try again.';

    return (
      <BentoLayout activePage={activePage}>
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {errorStatus === 403 ? 'Access Restricted' : 'Error'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{errorMessage}</p>
            {errorStatus === 403 && (
              <Button className="mt-4" onClick={() => window.location.href = '#/settings'}>
                View Plans & Billing
              </Button>
            )}
          </CardContent>
        </Card>
      </BentoLayout>
    );
  }

  if (overviewLoading) {
    return (
      <BentoLayout activePage={activePage}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </BentoLayout>
    );
  }

  const revenueChartData = revenue
    ? {
      labels: revenue.data.map((d) => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: `Revenue (${analyticsCurrency})`,
          data: revenue.data.map((d) => d.revenue ?? d.volume ?? d.volume_usd ?? 0),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    }
    : null;

  const tokenChartData = overview
    ? {
      labels: overview.volume_by_token.map((t) => t.token),
      datasets: [
        {
          data: overview.volume_by_token.map((t) => t.volume ?? t.volume_usd ?? 0),
          backgroundColor: CHART_COLORS,
        },
      ],
    }
    : null;

  const chainChartData = overview
    ? {
      labels: overview.volume_by_chain.map((c) => c.chain.toUpperCase()),
      datasets: [
        {
          label: `Volume (${analyticsCurrency})`,
          data: overview.volume_by_chain.map((c) => c.volume ?? c.volume_usd ?? 0),
          backgroundColor: 'rgb(59, 130, 246)',
        },
      ],
    }
    : null;

  return (
    <BentoLayout activePage={activePage}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
            <p className="text-muted-foreground">
              Track your payment performance and trends
            </p>
          </div>
          <Select value={period} onValueChange={(value) => setPeriod(value as AnalyticsPeriod)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Volume"
            value={formatCurrency(totalVolume, analyticsCurrency)}
            change={overview?.volume_change_pct}
            icon={<DollarSign className="w-5 h-5" />}
            iconBg="bg-green-500/10"
            iconColor="text-green-500"
          />
          <MetricCard
            title="Payments"
            value={overview?.payments?.total_payments?.toString() || '0'}
            change={overview?.payments_change_pct}
            icon={<CreditCard className="w-5 h-5" />}
            iconBg="bg-blue-500/10"
            iconColor="text-blue-500"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${Number(overview?.payments?.conversion_rate || 0).toFixed(1)}%`}
            icon={<Target className="w-5 h-5" />}
            iconBg="bg-purple-500/10"
            iconColor="text-purple-500"
          />
          <MetricCard
            title="Avg Payment"
            value={formatCurrency(avgPayment, analyticsCurrency)}
            icon={<BarChart3 className="w-5 h-5" />}
            iconBg="bg-orange-500/10"
            iconColor="text-orange-500"
          />
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>Track your payment volume trends</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : revenueChartData ? (
              <div className="h-[300px]">
                <Line
                  data={revenueChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => formatCurrency(Number(value), analyticsCurrency),
                        },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Token & Chain Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Volume by Token</CardTitle>
              <CardDescription>Distribution of payments by cryptocurrency</CardDescription>
            </CardHeader>
            <CardContent>
              {tokenChartData && overview?.volume_by_token.length ? (
                <div className="h-[250px] flex items-center justify-center">
                  <Pie
                    data={tokenChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Volume by Chain</CardTitle>
              <CardDescription>Distribution of payments by blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              {chainChartData && overview?.volume_by_chain.length ? (
                <div className="h-[250px]">
                  <Bar
                    data={chainChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => formatCurrency(Number(value), analyticsCurrency),
                          },
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Conversion & Subscriptions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Conversion Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Metrics</CardTitle>
              <CardDescription>Last 30 days performance</CardDescription>
            </CardHeader>
            <CardContent>
              {conversion ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Sessions</span>
                    <span className="font-semibold">{conversion.total_sessions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-semibold text-green-500">{conversion.completed_sessions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Expired</span>
                    <span className="font-semibold text-red-500">{conversion.expired_sessions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Conversion Rate</span>
                    <span className="font-semibold">{Number(conversion.conversion_rate).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Avg Time to Payment</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {Math.round(conversion.avg_time_to_payment_seconds / 60)} min
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No conversion data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription MRR */}
          {overview && overview.subscription_mrr > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Subscription Metrics</CardTitle>
                <CardDescription>Monthly recurring revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
                    <p className="text-3xl font-bold">{formatCurrency(overview.subscription_mrr, analyticsCurrency)}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Active</p>
                      <p className="text-xl font-semibold">{overview.active_subscriptions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">New</p>
                      <p className="text-xl font-semibold text-green-500">+{overview.new_subscriptions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Churned</p>
                      <p className="text-xl font-semibold text-red-500">-{overview.churned_subscriptions}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoice Metrics */}
          {overview && (
            <Card>
              <CardHeader>
                <CardTitle>Invoice Metrics</CardTitle>
                <CardDescription>Billing performance this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Invoices Sent</span>
                    <span className="font-semibold">{overview.invoices_sent}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Invoices Paid</span>
                    <span className="font-semibold text-green-500">{overview.invoices_paid}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Invoice Volume</span>
                    <span className="font-semibold">{formatCurrency(invoiceVolume, analyticsCurrency)}</span>
                  </div>
                  {overview.invoices_sent > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Collection Rate</span>
                      <span className="font-semibold">
                        {((overview.invoices_paid / overview.invoices_sent) * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* V3 — Recurring Revenue (MRR/ARR) */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recurring Revenue</h2>
          <MRRARRCard />
        </div>

        {/* V3 — Cache Performance */}
        <CacheStatsCard />
      </div>
    </BentoLayout>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

function MetricCard({ title, value, change, icon, iconBg, iconColor }: MetricCardProps) {
  const isPositive = change != null && Number(change) >= 0;
  const isNegative = change != null && Number(change) < 0;
  
  return (
    <Card 
      className={
        isPositive ? 'bg-green-50 border-green-200' : 
        isNegative ? 'bg-red-50 border-red-200' : 
        ''
      }
    >
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className={`p-2 rounded-lg ${iconBg}`}>
            <span className={iconColor}>{icon}</span>
          </div>
        </div>
        <p className="text-2xl font-bold mb-1">{value}</p>
        {change != null && (
          <div className="flex items-center text-sm">
            {isPositive ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600 font-medium">+{Number(change).toFixed(1)}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                <span className="text-red-600 font-medium">{Number(change).toFixed(1)}%</span>
              </>
            )}
            <span className="text-muted-foreground ml-1">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Payment Optimization Center — clean neutral-first design
// ─────────────────────────────────────────────────────────────────────────────

const OPT_SEVERITY: Record<string, { leftBorder: string; icon: React.ReactNode }> = {
  high:   { leftBorder: 'border-l-red-500',    icon: <AlertTriangle className="h-4 w-4 text-red-500   shrink-0 mt-0.5" /> },
  medium: { leftBorder: 'border-l-amber-500',  icon: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" /> },
  low:    { leftBorder: 'border-l-indigo-400', icon: <CheckCircle2  className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" /> },
  info:   { leftBorder: 'border-l-border',     icon: <CheckCircle2  className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /> },
};

function GwStatusPill({ status }: { status: string }) {
  const map: Record<string, { dot: string; label: string; cls: string }> = {
    healthy:  { dot: 'bg-green-500',  label: 'Healthy',  cls: 'text-green-600 dark:text-green-400' },
    degraded: { dot: 'bg-amber-500',  label: 'Degraded', cls: 'text-amber-600 dark:text-amber-400' },
    down:     { dot: 'bg-red-500',    label: 'Down',     cls: 'text-red-600   dark:text-red-400'   },
  };
  const cfg = map[status] ?? { dot: 'bg-muted-foreground', label: 'Unknown', cls: 'text-muted-foreground' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function MiniBar({ pct, className = 'bg-indigo-500' }: { pct: number; className?: string }) {
  return (
    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full ${className}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

function OptStatCard({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">{label}</p>
          <span className="text-muted-foreground/50">{icon}</span>
        </div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

function OptHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-500/10 border border-indigo-500/20">
        <Zap className="h-4 w-4 text-indigo-500" />
      </div>
      <div>
        <h2 className="text-base font-semibold leading-tight">Payment Optimization Center</h2>
        <p className="text-xs text-muted-foreground">Dari Orchestration Engine · 30-day window</p>
      </div>
    </div>
  );
}

export function PaymentOptimizationCenter() {
  const { data, isLoading, error } = useOptimizationInsights(30);
  const { currencySymbol } = useMerchantCurrency();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <OptHeader />
        <div className="flex h-36 items-center justify-center gap-3 text-sm text-muted-foreground">
          <div className="h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          Loading…
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <OptHeader />
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No optimization data yet — process payments to start seeing routing insights.
          </CardContent>
        </Card>
      </div>
    );
  }

  const { efficiency, savings, routing, recommendations } = data;

  const scoreLabel =
    efficiency.current_score >= 80 ? 'Excellent' :
    efficiency.current_score >= 60 ? 'Good' :
    efficiency.current_score >= 40 ? 'Fair' : 'Needs work';

  const scoreTextCls =
    efficiency.current_score >= 80 ? 'text-green-600 dark:text-green-400' :
    efficiency.current_score >= 60 ? 'text-foreground' :
    'text-amber-600 dark:text-amber-400';

  return (
    <div className="space-y-5">
      <OptHeader />

      {/* ── KPI row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Routing Efficiency card */}
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Routing Efficiency</p>
              <Activity className="h-4 w-4 text-muted-foreground/50" />
            </div>

            {/* Score + label */}
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className={`text-3xl font-bold tracking-tight ${scoreTextCls}`}>
                {efficiency.current_score.toFixed(0)}
              </span>
              <span className="text-sm text-muted-foreground">/100</span>
              <span className={`ml-auto text-xs font-semibold ${scoreTextCls}`}>{scoreLabel}</span>
            </div>

            {/* Trend */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
              {efficiency.trend_direction === 'up'   && <TrendingUp   className="h-3 w-3 text-green-500" />}
              {efficiency.trend_direction === 'down' && <TrendingDown className="h-3 w-3 text-red-500"   />}
              <span className={
                efficiency.trend_direction === 'up'   ? 'text-green-600 dark:text-green-400' :
                efficiency.trend_direction === 'down' ? 'text-red-600   dark:text-red-400'   :
                ''
              }>
                {efficiency.trend_pct !== null
                  ? `${efficiency.trend_pct > 0 ? '+' : ''}${efficiency.trend_pct.toFixed(1)}%`
                  : 'Stable'}
              </span>
              <span>vs prev 30d</span>
            </div>

            {/* Breakdown */}
            <div className="space-y-2">
              {([
                ['Success Rate',   efficiency.breakdown.avg_success_rate  ],
                ['Fee Efficiency', efficiency.breakdown.fee_efficiency_pct],
                ['Uptime',         efficiency.breakdown.uptime_pct        ],
              ] as [string, number][]).map(([lbl, v]) => (
                <div key={lbl} className="flex items-center gap-2">
                  <span className="w-[88px] shrink-0 text-xs text-muted-foreground">{lbl}</span>
                  <MiniBar pct={v} />
                  <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">{v.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Savings cards */}
        <OptStatCard
          label="Saved Today"
          value={`${currencySymbol}${savings.today.saved_amount}`}
          sub={`${savings.today.fee_reduction_pct.toFixed(1)}% fee reduction`}
          icon={<Landmark className="h-4 w-4" />}
        />
        <OptStatCard
          label="Saved This Month"
          value={`${currencySymbol}${savings.month.saved_amount}`}
          sub={`${savings.month.transactions} transactions`}
          icon={<Landmark className="h-4 w-4" />}
        />
        <OptStatCard
          label="Annualized Projection"
          value={`${currencySymbol}${savings.annualized_savings}`}
          sub={`${savings.year.fee_reduction_pct.toFixed(1)}% avg reduction`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* ── Gateway table ─────────────────────────────────────────────────── */}
      {routing.gateways.length > 0 && (
        <Card>
          <div className="px-5 pt-5 pb-3 border-b border-border flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Gateway Performance</span>
            <span className="ml-auto text-xs text-muted-foreground">Live metrics</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Gateway', 'Status', 'Success', 'Latency', 'Uptime', 'AI weight'].map(h => (
                    <th key={h} className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {routing.gateways.map((gw, i) => {
                  const srCls =
                    gw.success_rate >= 95 ? 'text-green-600 dark:text-green-400' :
                    gw.success_rate >= 80 ? '' :
                    'text-amber-600 dark:text-amber-400';
                  const alloc = routing.recommended_allocation[gw.gateway];
                  const isBest = gw.gateway === routing.best_gateway;
                  return (
                    <tr key={gw.gateway} className={`border-b border-border last:border-0 ${i % 2 ? 'bg-muted/20' : ''}`}>
                      <td className="px-5 py-3 font-medium capitalize">
                        <span className="flex items-center gap-1.5">
                          {gw.gateway}
                          {isBest && (
                            <span className="rounded border border-indigo-500/30 bg-indigo-500/10 px-1 py-px text-[10px] font-semibold uppercase tracking-wide text-indigo-500">
                              Best
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-3"><GwStatusPill status={gw.health_status} /></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${gw.success_rate}%` }} />
                          </div>
                          <span className={`text-xs tabular-nums font-medium ${srCls}`}>{gw.success_rate.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 tabular-nums text-muted-foreground text-xs">{gw.avg_latency_ms.toFixed(0)} ms</td>
                      <td className="px-5 py-3 tabular-nums text-muted-foreground text-xs">{gw.uptime_24h.toFixed(1)}%</td>
                      <td className="px-5 py-3">
                        {alloc !== undefined ? (
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-1 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${alloc}%` }} />
                            </div>
                            <span className="text-xs tabular-nums text-muted-foreground">{alloc.toFixed(0)}%</span>
                          </div>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Recommendations ───────────────────────────────────────────────── */}
      {recommendations.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Recommendations{' '}
            <span className="font-normal text-muted-foreground">({recommendations.length})</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {recommendations.map((rec) => {
              const cfg = OPT_SEVERITY[rec.severity] ?? OPT_SEVERITY.info;
              return (
                <div
                  key={rec.id}
                  className={`flex gap-3 rounded-lg border border-l-4 bg-card p-4 ${cfg.leftBorder}`}
                >
                  {cfg.icon}
                  <div className="min-w-0">
                    <p className="text-sm leading-snug">{rec.message}</p>
                    {rec.action && <p className="mt-1 text-xs text-muted-foreground">{rec.action}</p>}
                    <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground/50">
                      {rec.type.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsDashboard;

