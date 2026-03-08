import React, { useState } from 'react';
import { useSubscriptionTracking } from '../../../hooks/useAnalytics';
import { formatCurrency } from '../../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Copy,
  Mail,
  User,
  CreditCard,
  Calendar,
  ArrowRight,
  PauseCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../DashboardLayout';

const SUB_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  active: { color: 'bg-green-500', label: 'Active' },
  paused: { color: 'bg-yellow-500', label: 'Paused' },
  cancelled: { color: 'bg-red-500', label: 'Cancelled' },
  past_due: { color: 'bg-orange-500', label: 'Past Due' },
  trialing: { color: 'bg-blue-500', label: 'Trialing' },
};

const EVENT_ICONS: Record<string, React.ReactNode> = {
  'subscription.created': <Clock className="w-4 h-4 text-blue-400" />,
  'payment.succeeded': <CheckCircle2 className="w-4 h-4 text-green-500" />,
  'payment.failed': <AlertCircle className="w-4 h-4 text-red-500" />,
  'subscription.paused': <PauseCircle className="w-4 h-4 text-yellow-500" />,
  'subscription.resumed': <ArrowRight className="w-4 h-4 text-green-400" />,
  'subscription.cancelled': <XCircle className="w-4 h-4 text-red-400" />,
};

function SubscriptionTrackingView({ subscriptionId }: { subscriptionId: string }) {
  const { data: tracking, isLoading, error } = useSubscriptionTracking(subscriptionId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    const status = (error as any)?.response?.status;
    return (
      <Card className="border-red-200">
        <CardContent className="py-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-muted-foreground">
            {status === 404 ? 'Subscription not found' : 'Failed to load subscription tracking data'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!tracking) return null;

  const statusCfg = SUB_STATUS_CONFIG[tracking.status] || SUB_STATUS_CONFIG.active;

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge className={`${statusCfg.color} text-white px-3 py-1`}>
                {statusCfg.label}
              </Badge>
              <div>
                <p className="text-xl font-bold">{tracking.plan_name}</p>
                <p className="text-sm text-muted-foreground font-mono">{tracking.id}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(tracking.id);
                toast.success('Subscription ID copied');
              }}
            >
              <Copy className="w-4 h-4 mr-1" /> Copy ID
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Paid</p>
            <p className="text-xl font-bold">{formatCurrency(tracking.total_paid_usd, 'USD')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Payments</p>
            <p className="text-xl font-bold">{tracking.payment_count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Failed Payments</p>
            <p className={`text-xl font-bold ${tracking.failed_payment_count > 0 ? 'text-red-500' : ''}`}>
              {tracking.failed_payment_count}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Next Payment</p>
            <p className="text-sm font-medium">
              {tracking.next_payment_at
                ? new Date(tracking.next_payment_at).toLocaleDateString()
                : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Customer & Period Details */}
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              {tracking.customer_email}
            </div>
            {tracking.customer_name && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                {tracking.customer_name}
              </div>
            )}
            <div className="border-t pt-3 mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Current Period
                </span>
                <span>
                  {new Date(tracking.current_period_start).toLocaleDateString()} –{' '}
                  {new Date(tracking.current_period_end).toLocaleDateString()}
                </span>
              </div>
              {tracking.last_payment_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <CreditCard className="w-4 h-4" /> Last Payment
                  </span>
                  <span>{new Date(tracking.last_payment_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Event Timeline */}
        <Card>
          <CardHeader><CardTitle>Event Timeline</CardTitle></CardHeader>
          <CardContent>
            {tracking.events.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No events recorded</p>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-6">
                  {tracking.events.map((event, i) => {
                    const type = (event as any).type || '';
                    const timestamp = (event as any).timestamp || '';
                    const amountUsd = (event as any).amount_usd;
                    return (
                      <div key={i} className="flex gap-3 relative">
                        <div className="z-10 mt-0.5 flex-shrink-0 rounded-full bg-background border-2 border-border p-1">
                          {EVENT_ICONS[type] || <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            {type.replace(/\./g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                          </p>
                          {timestamp && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(timestamp).toLocaleString()}
                            </p>
                          )}
                          {amountUsd != null && (
                            <p className="text-xs text-green-600 font-medium mt-0.5">
                              {formatCurrency(amountUsd, 'USD')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function SubscriptionTracker() {
  const [inputId, setInputId] = useState('');
  const [activeId, setActiveId] = useState('');

  return (
    <DashboardLayout activePage="subscriptions">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Tracking</h1>
          <p className="text-muted-foreground">
            Track the detailed lifecycle and payment history of any subscription
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Enter subscription ID (e.g. sub_xyz789)"
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && inputId.trim()) setActiveId(inputId.trim()); }}
              />
              <Button onClick={() => { if (inputId.trim()) setActiveId(inputId.trim()); }}>
                <Search className="w-4 h-4 mr-2" /> Track
              </Button>
            </div>
          </CardContent>
        </Card>

        {activeId && <SubscriptionTrackingView subscriptionId={activeId} />}
      </div>
    </DashboardLayout>
  );
}

export default SubscriptionTracker;
