import React, { useState } from 'react';
import { useRefunds, useRetryRefund, useCancelRefund } from '../../../hooks/useRefunds';
import { Refund, RefundStatus } from '../../../types/api.types';
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
import {
  MoreVertical,
  RefreshCw,
  XCircle,
  ExternalLink,
  RotateCcw,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { DashboardLayout } from '../DashboardLayout';

const STATUS_CONFIG: Record<RefundStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  [RefundStatus.PENDING]: { variant: 'outline', icon: <Clock className="w-3 h-3" /> },
  [RefundStatus.PROCESSING]: { variant: 'default', icon: <RefreshCw className="w-3 h-3 animate-spin" /> },
  [RefundStatus.COMPLETED]: { variant: 'default', icon: <CheckCircle className="w-3 h-3" /> },
  [RefundStatus.FAILED]: { variant: 'destructive', icon: <AlertCircle className="w-3 h-3" /> },
};

export function RefundsList() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<RefundStatus | 'all'>('all');

  const { data, isLoading, error } = useRefunds(
    page,
    20,
    statusFilter === 'all' ? undefined : statusFilter
  );

  const retryMutation = useRetryRefund();
  const cancelMutation = useCancelRefund();

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
      <DashboardLayout activePage="refunds">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    const errorStatus = (error as any)?.response?.status;
    const errorMessage = errorStatus === 403 
      ? 'Refunds are not available on your current plan. Please upgrade to access this feature.'
      : 'Error loading refunds. Please try again.';
    
    return (
      <DashboardLayout activePage="refunds">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
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
      </DashboardLayout>
    );
  }

  // Calculate summary stats
  const pending = data?.items?.filter((r) => r.status === RefundStatus.PENDING).length || 0;
  const processing = data?.items?.filter((r) => r.status === RefundStatus.PROCESSING).length || 0;
  const completed = data?.items?.filter((r) => r.status === RefundStatus.COMPLETED).length || 0;
  const failed = data?.items?.filter((r) => r.status === RefundStatus.FAILED).length || 0;

  return (
    <DashboardLayout activePage="refunds">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Refunds</h1>
            <p className="text-muted-foreground">Process and track customer refunds</p>
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
      </div>
    </DashboardLayout>
  );
}

interface RefundRowProps {
  refund: Refund;
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
}

function RefundRow({ refund, onRetry, onCancel }: RefundRowProps) {
  const config = STATUS_CONFIG[refund.status];
  const canRetry = refund.status === RefundStatus.FAILED;
  const canCancel = refund.status === RefundStatus.PENDING;

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
          {refund.status.toUpperCase()}
        </Badge>
        {refund.error_message && (
          <p className="text-xs text-red-500 mt-1">{refund.error_message}</p>
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
