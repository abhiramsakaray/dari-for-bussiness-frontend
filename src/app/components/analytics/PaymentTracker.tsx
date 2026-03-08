import React, { useState } from 'react';
import { usePaymentTracking } from '../../../hooks/useAnalytics';
import { formatCurrency } from '../../../lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  ExternalLink,
  Copy,
  Mail,
  User,
  Hash,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../DashboardLayout';

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  created: { color: 'bg-gray-500', icon: <Clock className="w-4 h-4" />, label: 'Created' },
  pending: { color: 'bg-yellow-500', icon: <Clock className="w-4 h-4" />, label: 'Pending' },
  paid: { color: 'bg-green-500', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Paid' },
  confirmed: { color: 'bg-green-600', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Confirmed' },
  expired: { color: 'bg-red-500', icon: <AlertCircle className="w-4 h-4" />, label: 'Expired' },
  failed: { color: 'bg-red-600', icon: <AlertCircle className="w-4 h-4" />, label: 'Failed' },
};

const EVENT_ICONS: Record<string, React.ReactNode> = {
  created: <Clock className="w-4 h-4 text-gray-400" />,
  payer_data_collected: <User className="w-4 h-4 text-blue-400" />,
  payment_detected: <Hash className="w-4 h-4 text-yellow-500" />,
  payment_confirmed: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  payment_failed: <AlertCircle className="w-4 h-4 text-red-500" />,
  expired: <AlertCircle className="w-4 h-4 text-red-400" />,
};

function PaymentTrackingView({ sessionId }: { sessionId: string }) {
  const { data: tracking, isLoading, error } = usePaymentTracking(sessionId);

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
            {status === 404 ? 'Payment session not found' : 'Failed to load payment tracking data'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!tracking) return null;

  const statusCfg = STATUS_CONFIG[tracking.status] || STATUS_CONFIG.pending;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge className={`${statusCfg.color} text-white px-3 py-1`}>
                <span className="flex items-center gap-1">
                  {statusCfg.icon}
                  {statusCfg.label}
                </span>
              </Badge>
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(tracking.amount_fiat, tracking.fiat_currency)}
                </p>
                <p className="text-sm text-muted-foreground font-mono">{tracking.session_id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(tracking.session_id);
                  toast.success('Session ID copied');
                }}
              >
                <Copy className="w-4 h-4 mr-1" /> Copy ID
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Details */}
        <Card>
          <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {tracking.token && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Token</span>
                <span className="font-medium">{tracking.token}</span>
              </div>
            )}
            {tracking.chain && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chain</span>
                <span className="font-medium capitalize">{tracking.chain}</span>
              </div>
            )}
            {tracking.tx_hash && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">TX Hash</span>
                <span className="font-mono text-sm flex items-center gap-1">
                  {tracking.tx_hash.slice(0, 12)}...
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      navigator.clipboard.writeText(tracking.tx_hash!);
                      toast.success('TX hash copied');
                    }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </span>
              </div>
            )}
            {tracking.block_number && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Block</span>
                <span className="font-mono">{tracking.block_number}</span>
              </div>
            )}
            {tracking.confirmations !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confirmations</span>
                <Badge variant="outline">{tracking.confirmations}</Badge>
              </div>
            )}
            <div className="border-t pt-3 mt-3">
              {tracking.payer_email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {tracking.payer_email}
                </div>
              )}
              {tracking.payer_name && (
                <div className="flex items-center gap-2 text-sm mt-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                  {tracking.payer_name}
                </div>
              )}
            </div>
            <div className="border-t pt-3 mt-3 space-y-1 text-sm text-muted-foreground">
              <p>Created: {new Date(tracking.created_at).toLocaleString()}</p>
              {tracking.paid_at && <p>Paid: {new Date(tracking.paid_at).toLocaleString()}</p>}
              {tracking.expires_at && <p>Expires: {new Date(tracking.expires_at).toLocaleString()}</p>}
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
                  {tracking.events.map((event, i) => (
                    <div key={i} className="flex gap-3 relative">
                      <div className="z-10 mt-0.5 flex-shrink-0 rounded-full bg-background border-2 border-border p-1">
                        {EVENT_ICONS[event.type] || <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm capitalize">
                          {event.type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                        {event.data && Object.keys(event.data).length > 0 && (
                          <div className="mt-1 text-xs bg-muted rounded px-2 py-1">
                            {Object.entries(event.data).map(([k, v]) => (
                              <span key={k} className="mr-3">
                                <span className="text-muted-foreground">{k}:</span>{' '}
                                <span className="font-mono">{String(v)}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function PaymentTracker() {
  const [inputId, setInputId] = useState('');
  const [activeId, setActiveId] = useState('');

  return (
    <DashboardLayout activePage="analytics">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Tracking</h1>
          <p className="text-muted-foreground">
            Track the detailed lifecycle of any payment session
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Enter payment session ID (e.g. ps_abc123)"
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

        {activeId && <PaymentTrackingView sessionId={activeId} />}
      </div>
    </DashboardLayout>
  );
}

export default PaymentTracker;
