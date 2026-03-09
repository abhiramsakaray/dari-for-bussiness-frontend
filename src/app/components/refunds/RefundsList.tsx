import React, { useState, useEffect } from 'react';
import { useRefunds, useRetryRefund, useCancelRefund, useCreateRefund, useRefundEligibility, useProcessQueuedRefunds } from '../../../hooks/useRefunds';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
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
  Wallet,
  Timer,
  DollarSign,
} from 'lucide-react';
import { DashboardLayout } from '../DashboardLayout';

const STATUS_CONFIG: Record<RefundStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  [RefundStatus.PENDING]: { variant: 'outline', icon: <Clock className="w-3 h-3" /> },
  [RefundStatus.PROCESSING]: { variant: 'default', icon: <RefreshCw className="w-3 h-3 animate-spin" /> },
  [RefundStatus.COMPLETED]: { variant: 'default', icon: <CheckCircle className="w-3 h-3" /> },
  [RefundStatus.FAILED]: { variant: 'destructive', icon: <AlertCircle className="w-3 h-3" /> },
  [RefundStatus.QUEUED]: { variant: 'secondary', icon: <Timer className="w-3 h-3" /> },
  [RefundStatus.INSUFFICIENT_FUNDS]: { variant: 'destructive', icon: <DollarSign className="w-3 h-3" /> },
};

function formatSettlement(status: string): string {
  switch (status) {
    case 'in_platform': return 'Funds in ChainPe';
    case 'settled_external': return 'Settled to external wallet';
    case 'partially_settled': return 'Partially settled';
    default: return status;
  }
}

export function RefundsList() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<RefundStatus | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<'form' | 'eligibility'>('form');
  const [eligibilityPaymentId, setEligibilityPaymentId] = useState('');
  const [refundForm, setRefundForm] = useState<CreateRefundInput>({
    payment_session_id: '',
    refund_address: '',
    amount: undefined,
    reason: '',
  });

  const { data, isLoading, error } = useRefunds(
    page,
    20,
    statusFilter === 'all' ? undefined : statusFilter
  );

  const { data: eligibility, isLoading: eligibilityLoading, error: eligibilityError } =
    useRefundEligibility(eligibilityPaymentId);

  const retryMutation = useRetryRefund();
  const cancelMutation = useCancelRefund();
  const createMutation = useCreateRefund();
  const processQueuedMutation = useProcessQueuedRefunds();

  // When eligibility loads, prefill amount
  useEffect(() => {
    if (eligibility && eligibility.max_refundable > 0) {
      setRefundForm((f) => ({
        ...f,
        amount: eligibility.max_refundable,
      }));
    }
  }, [eligibility]);

  const handleRetry = (refundId: string) => {
    retryMutation.mutate(refundId);
  };

  const handleCancel = (refundId: string) => {
    if (window.confirm('Are you sure you want to cancel this refund?')) {
      cancelMutation.mutate(refundId);
    }
  };

  const handleCheckEligibility = () => {
    if (!refundForm.payment_session_id) return;
    setEligibilityPaymentId(refundForm.payment_session_id);
    setDialogStep('eligibility');
  };

  const handleCreateRefund = (force = false, queue = false) => {
    if (!refundForm.payment_session_id || !refundForm.refund_address) return;
    createMutation.mutate(
      {
        payment_session_id: refundForm.payment_session_id,
        refund_address: refundForm.refund_address,
        amount: refundForm.amount || undefined,
        reason: refundForm.reason || undefined,
        force,
        queue_if_insufficient: queue,
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setDialogStep('form');
          setEligibilityPaymentId('');
          setRefundForm({ payment_session_id: '', refund_address: '', amount: undefined, reason: '' });
        },
      }
    );
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setDialogStep('form');
      setEligibilityPaymentId('');
      setRefundForm({ payment_session_id: '', refund_address: '', amount: undefined, reason: '' });
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
  const queued = data?.items?.filter((r) => r.status === RefundStatus.QUEUED).length || 0;
  const insufficientFunds = data?.items?.filter((r) => r.status === RefundStatus.INSUFFICIENT_FUNDS).length || 0;

  return (
    <DashboardLayout activePage="refunds">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Refunds</h1>
            <p className="text-muted-foreground">Process and track customer refunds</p>
          </div>
          <div className="flex gap-2">
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
            <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Issue Refund
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Issue Refund</DialogTitle>
                  <DialogDescription>
                    {dialogStep === 'form'
                      ? 'Enter payment details to check eligibility and process a refund.'
                      : 'Review eligibility and choose how to process the refund.'}
                  </DialogDescription>
                </DialogHeader>

                {dialogStep === 'form' ? (
                  <>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="payment_session_id">Payment Session ID *</Label>
                        <Input
                          id="payment_session_id"
                          placeholder="Enter payment session ID"
                          value={refundForm.payment_session_id}
                          onChange={(e) => setRefundForm((f) => ({ ...f, payment_session_id: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="refund_address">Refund Address *</Label>
                        <Input
                          id="refund_address"
                          placeholder="Wallet address to send refund to"
                          value={refundForm.refund_address}
                          onChange={(e) => setRefundForm((f) => ({ ...f, refund_address: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reason">Reason (optional)</Label>
                        <Textarea
                          id="reason"
                          placeholder="Reason for refund"
                          value={refundForm.reason ?? ''}
                          onChange={(e) => setRefundForm((f) => ({ ...f, reason: e.target.value }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => handleDialogOpenChange(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCheckEligibility}
                        disabled={!refundForm.payment_session_id || !refundForm.refund_address}
                      >
                        Check Eligibility
                      </Button>
                    </DialogFooter>
                  </>
                ) : (
                  <>
                    <div className="space-y-4 py-4">
                      {eligibilityLoading && (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          <span className="ml-2 text-sm text-muted-foreground">Checking eligibility...</span>
                        </div>
                      )}

                      {eligibilityError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4">
                          <p className="text-sm text-red-600 dark:text-red-400">
                            Failed to check eligibility. The payment may not exist or may not be eligible for refund.
                          </p>
                        </div>
                      )}

                      {eligibility && (
                        <>
                          <div className={`rounded-lg border p-4 ${eligibility.sufficient_balance ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20'}`}>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Settlement</span>
                                <span className="font-medium">{formatSettlement(eligibility.settlement_status)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Your Balance</span>
                                <span className="font-medium">${eligibility.merchant_balance.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Max Refundable</span>
                                <span className="font-medium">${eligibility.max_refundable.toFixed(2)}</span>
                              </div>
                              {eligibility.already_refunded > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Already Refunded</span>
                                  <span className="font-medium">${eligibility.already_refunded.toFixed(2)}</span>
                                </div>
                              )}
                              <p className="pt-2 text-muted-foreground border-t">{eligibility.message}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="refund_amount">Refund Amount</Label>
                            <Input
                              id="refund_amount"
                              type="number"
                              step="0.01"
                              min="0"
                              max={eligibility.max_refundable}
                              value={refundForm.amount ?? ''}
                              onChange={(e) =>
                                setRefundForm((f) => ({
                                  ...f,
                                  amount: e.target.value ? Number(e.target.value) : undefined,
                                }))
                              }
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <DialogFooter className="flex-col gap-2 sm:flex-row">
                      <Button variant="outline" onClick={() => setDialogStep('form')}>
                        Back
                      </Button>

                      {eligibility?.sufficient_balance && (
                        <Button
                          onClick={() => handleCreateRefund(false, false)}
                          disabled={createMutation.isPending}
                        >
                          {createMutation.isPending ? 'Processing...' : 'Refund from Balance'}
                        </Button>
                      )}

                      {eligibility && !eligibility.sufficient_balance && eligibility.can_queue && (
                        <Button
                          variant="secondary"
                          onClick={() => handleCreateRefund(false, true)}
                          disabled={createMutation.isPending}
                        >
                          <Timer className="w-4 h-4 mr-2" />
                          {createMutation.isPending ? 'Processing...' : 'Queue Refund (7 days)'}
                        </Button>
                      )}

                      {eligibility?.can_force_external && (
                        <Button
                          variant="outline"
                          onClick={() => handleCreateRefund(true, false)}
                          disabled={createMutation.isPending}
                        >
                          <Wallet className="w-4 h-4 mr-2" />
                          {createMutation.isPending ? 'Processing...' : 'Refund via External Wallet'}
                        </Button>
                      )}

                      {eligibility && !eligibility.eligible && (
                        <p className="text-sm text-red-500">{eligibility.message}</p>
                      )}
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
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
