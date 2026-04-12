import React, { useState } from 'react';
import { useAnalyticsOverview, useRevenueTimeSeries, useConversionMetrics } from '../../../hooks/useAnalytics';
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
} from 'lucide-react';
import { BentoLayout } from "../BentoLayout";
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

  const { data: overview, isLoading: overviewLoading, error: overviewError } = useAnalyticsOverview(period);
  const { data: revenue, isLoading: revenueLoading } = useRevenueTimeSeries(period);
  const { data: conversion } = useConversionMetrics(30);
  const analyticsCurrency = overview?.currency || 'USD';

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

export default AnalyticsDashboard;
