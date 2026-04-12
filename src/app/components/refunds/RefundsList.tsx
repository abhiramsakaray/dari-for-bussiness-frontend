import React, { useState, useEffect } from 'react';
import { useRefunds, useRetryRefund, useCancelRefund, useCreateRefund, useRefundEligibility, useProcessQueuedRefunds, useTriggerRefundScheduler } from '../../../hooks/useRefunds';
import { Refund, RefundStatus, RefundEligibility, CreateRefundInput } from '../../../types/api.types';
import { formatCurrency, formatDate, truncateAddress } from '../../../lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import RefundForm from '../../../components/RefundForm';
import {
  MoreVertical,
  RefreshCw,
  XCircle,
  ExternalLink,
  RotateCcw,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Timer,
  DollarSign,
  Zap,
  Wallet,
} from 'lucide-react';
import { BentoLayout } from "../BentoLayout";

const STATUS_CONFIG: Record<RefundStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  [RefundStatus.PENDING]: { variant: 'outline', icon: <Clock className="w-3 h-3" /> },
  [RefundStatus.PROCESSING]: { variant: 'default', icon: <RefreshCw className="w-3 h-3 animate-spin" /> },
  [RefundStatus.COMPLETED]: { variant: 'default', icon: <CheckCircle className="w-3 h-3" /> },
  [RefundStatus.FAILED]: { variant: 'destructive', icon: <AlertCircle className="w-3 h-3" /> },
  [RefundStatus.QUEUED]: { variant: 'secondary', icon: <Timer className="w-3 h-3" /> },
  [RefundStatus.INSUFFICIENT_FUNDS]: { variant: 'destructive', icon: <DollarSign className="w-3 h-3" /> },
};

export function RefundsList() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<RefundStatus | 'all'>('all');
  const [showRefundForm, setShowRefundForm] = useState(false);

  const token = localStorage.getItem('merchant_token');

  // If no token, redirect to login
  if (!token) {
    return (
      <BentoLayout activePage="refunds">
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You need to be logged in to view refunds.
            </p>
            <Button onClick={() => window.location.href = '#/login'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </BentoLayout>
    );
  }

  const { data, isLoading, error } = useRefunds(
    page,
    20,
    statusFilter === 'all' ? undefined : statusFilter
  );

  const retryMutation = useRetryRefund();
  const cancelMutation = useCancelRefund();
  const processQueuedMutation = useProcessQueuedRefunds();
  const triggerSchedulerMutation = useTriggerRefundScheduler();

  const handleRetry = (refundId: string) => {
    retryMutation.mutate(refundId);
  };

  const handleCancel = (refundId: string) => {
    if (window.confirm('Are you sure you want to cancel this refund?')) {
      cancelMutation.mutate(refundId);
    }
  };

  if (isLoading) {
    return (
      <BentoLayout activePage="refunds">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </BentoLayout>
    );
  }

  if (error) {
    const errorStatus = (error as any)?.response?.status;
    const errorData = (error as any)?.response?.data;
    
    let errorMessage = 'Error loading refunds. Please try again.';
    let errorTitle = 'Error';
    
    if (errorStatus === 401) {
      errorMessage = 'Your session has expired. Please log in again.';
      errorTitle = 'Session Expired';
    } else if (errorStatus === 403) {
      errorMessage = 'Refunds are not available on your current plan. Please upgrade to access this feature.';
      errorTitle = 'Access Restricted';
    } else if (errorStatus === 400) {
      errorMessage = errorData?.detail || 'Invalid request. Please check your configuration.';
      errorTitle = 'Bad Request';
    }
    
    return (
      <BentoLayout activePage="refunds">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {errorTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{errorMessage}</p>
            {errorStatus === 401 && (
              <Button onClick={() => window.location.href = '#/login'}>
                Go to Login
              </Button>
            )}
            {errorStatus === 403 && (
              <Button onClick={() => window.location.href = '#/settings'}>
                View Plans & Billing
              </Button>
            )}
            {errorStatus === 400 && (
              <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded">
                <p className="font-mono">{JSON.stringify(errorData, null, 2)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </BentoLayout>
    );
  }

  // Calculate summary stats
  const pending = data?.items?.filter((r) => r.status === RefundStatus.PENDING).length || 0;
  const processing = data?.items?.filter((r) => r.status === RefundStatus.PROCESSING).length || 0;
  const completed = data?.items?.filter((r) => r.status === RefundStatus.COMPLETED).length || 0;
  const failed = data?.items?.filter((r) => r.status === RefundStatus.FAILED).length || 0;
  const queued = data?.items?.filter((r) => r.status === RefundStatus.QUEUED).length || 0;
  const insufficientFunds = data?.items?.filter((r) => r.status === RefundStatus.INSUFFICIENT_FUNDS).length || 0;

  return (
    <BentoLayout activePage="refunds">
      <div className="space-y-6">
        {showRefundForm ? (
          <RefundForm onBack={() => setShowRefundForm(false)} />
        ) : (
          <>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Refunds</h1>
            <p className="text-muted-foreground">Process and track customer refunds</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => triggerSchedulerMutation.mutate()}
              disabled={triggerSchedulerMutation.isPending}
              title="Manually trigger the automatic refund scheduler to process all pending refunds"
            >
              <Zap className={`w-4 h-4 mr-2 ${triggerSchedulerMutation.isPending ? 'animate-spin' : ''}`} />
              Process Pending
            </Button>
            {(queued > 0 || insufficientFunds > 0) && (
              <Button
                variant="outline"
                onClick={() => processQueuedMutation.mutate()}
                disabled={processQueuedMutation.isPending}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${processQueuedMutation.isPending ? 'animate-spin' : ''}`} />
                Process Queued
              </Button>
            )}
            <Button onClick={() => setShowRefundForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Issue Refund
            </Button>
          </div>
        </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold">{pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Processing</span>
            </div>
            <p className="text-2xl font-bold">{processing}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <p className="text-2xl font-bold">{completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Failed</span>
            </div>
            <p className="text-2xl font-bold">{failed}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as RefundStatus | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={RefundStatus.PENDING}>Pending</SelectItem>
            <SelectItem value={RefundStatus.PROCESSING}>Processing</SelectItem>
            <SelectItem value={RefundStatus.COMPLETED}>Completed</SelectItem>
            <SelectItem value={RefundStatus.FAILED}>Failed</SelectItem>
            <SelectItem value={RefundStatus.QUEUED}>Queued</SelectItem>
            <SelectItem value={RefundStatus.INSUFFICIENT_FUNDS}>Insufficient Funds</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!data?.items?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3 mb-4">
              <RotateCcw className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No refunds</h3>
            <p className="text-muted-foreground text-center">
              Refunds will appear here when processed
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Refunds ({data?.total})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Refund ID</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Token/Chain</TableHead>
                  <TableHead>Refund Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items.map((refund) => (
                  <RefundRow
                    key={refund.id}
                    refund={refund}
                    onRetry={handleRetry}
                    onCancel={handleCancel}
                  />
                ))}
              </TableBody>
            </Table>

            {data && data.pages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="py-2 px-4 text-sm text-muted-foreground">
                  Page {page} of {data.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === data.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
          </>
        )}
      </div>
    </BentoLayout>
  );
}

interface RefundRowProps {
  refund: Refund;
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
}

function RefundRow({ refund, onRetry, onCancel }: RefundRowProps) {
  const config = STATUS_CONFIG[refund.status] || { 
    variant: 'outline' as const, 
    icon: <AlertCircle className="w-3 h-3" /> 
  };
  const canRetry = refund.status === RefundStatus.FAILED || refund.status === RefundStatus.INSUFFICIENT_FUNDS;
  const canCancel = refund.status === RefundStatus.PENDING || refund.status === RefundStatus.QUEUED;

  return (
    <TableRow>
      <TableCell className="font-mono text-sm">{refund.id.slice(0, 12)}...</TableCell>
      <TableCell>
        <a
          href={`#/payments/${refund.payment_session_id}`}
          className="font-mono text-sm hover:underline"
        >
          {refund.payment_session_id.slice(0, 12)}...
        </a>
      </TableCell>
      <TableCell className="font-semibold">{refund.amount} {refund.token}</TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{refund.token}</span>
          <span className="text-xs text-muted-foreground capitalize">{refund.chain}</span>
        </div>
      </TableCell>
      <TableCell className="font-mono text-sm" title={refund.refund_address}>
        {truncateAddress(refund.refund_address, 6)}
      </TableCell>
      <TableCell>
        <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
          {config.icon}
          {refund.status.replace('_', ' ').toUpperCase()}
        </Badge>
        {refund.error_message && (
          <p className="text-xs text-red-500 mt-1">{refund.error_message}</p>
        )}
        {refund.failure_reason && !refund.error_message && (
          <p className="text-xs text-red-500 mt-1">{refund.failure_reason}</p>
        )}
        {refund.status === RefundStatus.QUEUED && refund.queued_until && (
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
            Expires {new Date(refund.queued_until).toLocaleDateString()}
          </p>
        )}
      </TableCell>
      <TableCell className="text-sm">
        {refund.refund_source === 'external_wallet' ? (
          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            <Wallet className="w-3 h-3" /> External
          </span>
        ) : refund.refund_source === 'platform_balance' ? (
          <span>Platform</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(refund.created_at)}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          {refund.tx_hash && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => window.open(`https://explorer.example.com/tx/${refund.tx_hash}`, '_blank')}
              title="View transaction"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
          {(canRetry || canCancel) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canRetry && (
                  <DropdownMenuItem onClick={() => onRetry(refund.id)}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry Refund
                  </DropdownMenuItem>
                )}
                {canCancel && (
                  <DropdownMenuItem onClick={() => onCancel(refund.id)} className="text-red-600">
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Refund
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export default RefundsList;
