import { DashboardLayout } from '../DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  TrendingUp,
  DollarSign,
  Tag,
  Users,
  Percent,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { useCouponAnalytics } from '@/hooks/useCoupons';
import { formatCurrency } from '@/lib/utils';

export function CouponAnalytics() {
  // Extract coupon ID from hash route: #/dashboard/coupons/{id}/analytics
  const route = window.location.hash.slice(1);
  const match = route.match(/^\/dashboard\/coupons\/([^/]+)\/analytics$/);
  const couponId = match ? match[1] : '';

  const { data, isLoading, error } = useCouponAnalytics(couponId);

  if (isLoading) {
    return (
      <DashboardLayout activePage="coupons">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout activePage="coupons">
        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={() => (window.location.href = '#/dashboard/coupons')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Coupons
          </Button>
          <Card className="border-destructive">
            <CardContent className="py-6 text-center text-muted-foreground">
              Failed to load coupon analytics
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const conversionRate = typeof data.conversion_rate === 'number' 
    ? data.conversion_rate 
    : (data.conversion_rate ? Number(data.conversion_rate) : 0);
  const avgOrderValue =
    data.total_used > 0 && typeof data.revenue_generated === 'number' 
      ? data.revenue_generated / data.total_used 
      : 0;
  const avgDiscount =
    data.total_used > 0 && typeof data.total_discount_given === 'number' 
      ? data.total_discount_given / data.total_used 
      : 0;

  return (
    <DashboardLayout activePage="coupons">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Button
              variant="ghost"
              onClick={() => (window.location.href = '#/dashboard/coupons')}
              className="mb-2 -ml-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Coupons
            </Button>
            <h1 className="text-3xl mb-2">Coupon Analytics</h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono text-lg px-3 py-1">
                {data.code}
              </Badge>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Uses */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Uses</p>
                  <p className="text-3xl font-bold mt-2">{data.total_used}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Tag className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Discount Given */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Discount Given</p>
                  <p className="text-3xl font-bold mt-2">
                    {formatCurrency(data.total_discount_given, 'USD')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Avg: {formatCurrency(avgDiscount, 'USD')} per use
              </p>
            </CardContent>
          </Card>

          {/* Revenue Generated */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue Generated</p>
                  <p className="text-3xl font-bold mt-2 text-green-600 dark:text-green-400">
                    {formatCurrency(data.revenue_generated, 'USD')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Avg: {formatCurrency(avgOrderValue, 'USD')} per order
              </p>
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-3xl font-bold mt-2">
                    {typeof conversionRate === 'number' && !isNaN(conversionRate) 
                      ? `${conversionRate.toFixed(1)}%` 
                      : 'N/A'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Percent className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Coupons that led to payment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>
              Detailed breakdown of coupon usage and impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Coupon Code</span>
                  <code className="text-sm font-bold bg-muted px-2 py-1 rounded">
                    {data.code}
                  </code>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Times Applied</span>
                  <span className="font-semibold">{data.total_used}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">
                    Average Discount per Use
                  </span>
                  <span className="font-semibold">{formatCurrency(avgDiscount, 'USD')}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-muted-foreground">
                    Total Discount Amount
                  </span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    {formatCurrency(data.total_discount_given, 'USD')}
                  </span>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">
                    Average Order Value
                  </span>
                  <span className="font-semibold">{formatCurrency(avgOrderValue, 'USD')}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">
                    Total Revenue Generated
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(data.revenue_generated, 'USD')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Conversion Rate</span>
                  <span className="font-semibold">
                    {typeof conversionRate === 'number' && !isNaN(conversionRate) 
                      ? `${conversionRate.toFixed(2)}%` 
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-muted-foreground">ROI</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {data.total_discount_given > 0 && 
                     typeof data.revenue_generated === 'number' && 
                     typeof data.total_discount_given === 'number'
                      ? `${((data.revenue_generated / data.total_discount_given) * 100).toFixed(0)}%`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights Card */}
        {data.total_used > 0 && (
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {typeof conversionRate === 'number' && !isNaN(conversionRate) && conversionRate > 80 && (
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                    <p>
                      <strong>Great conversion!</strong> {conversionRate.toFixed(0)}% of customers
                      who applied this coupon completed their purchase.
                    </p>
                  </div>
                )}
                {data.total_discount_given > 0 && data.revenue_generated > data.total_discount_given * 3 && (
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 text-green-600 mt-0.5" />
                    <p>
                      <strong>Strong ROI:</strong> This coupon generated{' '}
                      {formatCurrency(data.revenue_generated, 'USD')} in revenue with only{' '}
                      {formatCurrency(data.total_discount_given, 'USD')} in discounts.
                    </p>
                  </div>
                )}
                {typeof avgOrderValue === 'number' && !isNaN(avgOrderValue) && avgOrderValue > 50 && (
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-blue-600 mt-0.5" />
                    <p>
                      The average order value with this coupon is{' '}
                      {formatCurrency(avgOrderValue, 'USD')}, indicating strong customer spending.
                    </p>
                  </div>
                )}
                {data.total_used === 0 && (
                  <div className="flex items-start gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <p className="text-muted-foreground">
                      This coupon hasn't been used yet. Share it with your customers to drive sales!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
