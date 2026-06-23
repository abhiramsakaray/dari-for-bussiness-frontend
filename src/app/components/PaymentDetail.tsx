import { BentoLayout } from "./BentoLayout";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { ArrowLeft, ExternalLink, Copy, Clock, CheckCircle2, XCircle, AlertCircle, UserCircle2, Tag, Download, FileText, RefreshCw, Landmark, Zap, TrendingUp, Shield, GitBranch } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { chainpeService, PaymentSession } from "../../services/chainpe";
import { toast } from "sonner";
import { displayAmount, displayDualAmount, extractErrorMessage, formatCurrency } from "../../lib/utils";
import { getExplorerTxUrl } from "../../services/wallets.service";
import { useMerchantCurrency } from "../../hooks/useMerchantCurrency";

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  paid: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/30",
  },
  created: {
    icon: <Clock className="h-5 w-5" />,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/30",
  },
  pending: {
    icon: <Clock className="h-5 w-5" />,
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/30",
  },
  expired: {
    icon: <XCircle className="h-5 w-5" />,
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/30",
  },
  failed: {
    icon: <AlertCircle className="h-5 w-5" />,
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/30",
  },
};

function DetailRow({ label, value, mono, copyable }: { label: string; value: React.ReactNode; mono?: boolean; copyable?: string }) {
  const handleCopy = () => {
    if (copyable) {
      navigator.clipboard.writeText(copyable);
      toast.success("Copied to clipboard");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm ${mono ? "font-mono" : ""} break-all text-right`}>
          {value || <span className="text-muted-foreground">—</span>}
        </span>
        {copyable && (
          <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export function PaymentDetail() {
  const navigate = useNavigate();
  const { paymentId } = useParams<{ paymentId: string }>();
  const [payment, setPayment] = useState<PaymentSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);
  const { currency } = useMerchantCurrency();

  // Validate paymentId exists
  if (!paymentId) {
    return (
      <BentoLayout activePage="payments">
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard/payments')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payments
          </Button>
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Invalid Payment ID</h2>
              <p className="text-muted-foreground">No payment ID was provided in the URL.</p>
            </CardContent>
          </Card>
        </div>
      </BentoLayout>
    );
  }

  const handleGenerateReceipt = async () => {
    if (!payment || payment.status?.toLowerCase() !== 'paid') {
      toast.error('Receipt can only be generated for paid payments');
      return;
    }

    setIsGeneratingReceipt(true);
    try {
      const token = localStorage.getItem('merchant_token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(
        `${API_BASE_URL}/receipts/payment/${payment.id || payment.session_id}/generate?send_email=false`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to generate receipt');
      }

      const receiptData = await response.json();
      toast.success('Receipt generated successfully!');
      
      // Automatically download the receipt
      handleDownloadReceipt(receiptData.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate receipt');
    } finally {
      setIsGeneratingReceipt(false);
    }
  };

  const handleDownloadReceipt = async (receiptId?: string) => {
    if (!payment) return;

    setIsDownloadingReceipt(true);
    try {
      const token = localStorage.getItem('merchant_token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || '';
      
      // If receiptId is provided, use it; otherwise try to fetch receipt for this payment
      let downloadUrl = '';
      if (receiptId) {
        downloadUrl = `${API_BASE_URL}/receipts/${receiptId}/download`;
      } else {
        // Try to get existing receipt for this payment
        const listResponse = await fetch(`${API_BASE_URL}/receipts?payment_session_id=${payment.id || payment.session_id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (listResponse.ok) {
          const receipts = await listResponse.json();
          if (receipts.items && receipts.items.length > 0) {
            downloadUrl = `${API_BASE_URL}/receipts/${receipts.items[0].id}/download`;
          } else {
            // No receipt exists, generate one first
            await handleGenerateReceipt();
            return;
          }
        } else {
          // Can't check, try to generate
          await handleGenerateReceipt();
          return;
        }
      }

      const response = await fetch(downloadUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to download receipt');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${payment.id || payment.session_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Receipt downloaded successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to download receipt');
    } finally {
      setIsDownloadingReceipt(false);
    }
  };

  useEffect(() => {
    const fetchPayment = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await chainpeService.getSessionStatus(paymentId);
        setPayment(data);
      } catch (err: any) {
        setError(extractErrorMessage(err, "Failed to fetch payment details"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayment();
  }, [paymentId]);

  const status = payment?.status?.toLowerCase() || "created";
  const config = statusConfig[status] || statusConfig.created;
  const canonicalSessionId = payment?.id || payment?.session_id || paymentId;
  const isSubscription = payment?.transaction_type === "subscription";
  
  // Use merchant currency if available
  const displayAmountValue = payment?.merchant_amount_local ?? Number(payment?.amount_usdc ?? payment?.amount_fiat ?? 0);
  const displayCurrency = payment?.merchant_currency || payment?.fiat_currency || currency;
  const displaySymbol = payment?.merchant_currency_symbol || "$";
  
  const amountDual = payment?.merchant_amount_local && payment?.merchant_currency_symbol
    ? {
        primary: `${payment.merchant_currency_symbol}${payment.merchant_amount_local.toFixed(2)}`,
        secondary: null
      }
    : payment 
      ? displayDualAmount(displayAmountValue, payment.amount_fiat_local, payment.fiat_currency, payment.amount_fiat) 
      : { primary: formatCurrency(0, currency), secondary: null };

  return (
    <BentoLayout activePage="payments">
      <div className="space-y-6">
        {/* Back button + header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard/payments')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Payment Details</h1>
            <p className="text-sm text-muted-foreground font-mono">{paymentId}</p>
          </div>
        </div>

        {isLoading ? (
          <Card className="bg-card border-border p-12 text-center text-muted-foreground">
            Loading payment details...
          </Card>
        ) : error ? (
          <Card className="bg-card border-border p-12 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={() => navigate('/dashboard/payments')}>
              Back to Payments
            </Button>
          </Card>
        ) : payment ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status card - prominent */}
            <Card className={`lg:col-span-3 border ${config.bg}`}>
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
                <div className="flex items-center gap-3">
                  <div className={config.color}>{config.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold capitalize">{status}</p>
                      {isSubscription && (
                        <Badge variant="outline" className="gap-1">
                          <RefreshCw className="w-3 h-3" />
                          Subscription
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {status === "paid" && payment.paid_at
                        ? `Paid on ${new Date(payment.paid_at).toLocaleString()}`
                        : status === "expired"
                        ? "This payment session has expired"
                        : status === "created"
                        ? "Waiting for customer to complete payment"
                        : "Payment is being processed"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right space-y-2">
                    {payment.coupon_code && payment.discount_amount ? (
                      // Show coupon breakdown
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground line-through">
                          {displayAmount(payment.amount_fiat || 0, payment.amount_fiat_local, payment.fiat_currency)}
                        </div>
                        <div className="flex items-center justify-end gap-2 text-green-600 dark:text-green-400">
                          <Tag className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            -{displayAmount(payment.discount_amount, payment.discount_amount_local, payment.fiat_currency)}
                          </span>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {payment.coupon_code}
                          </Badge>
                        </div>
                        <div className="text-3xl font-bold">
                          {displayAmount(payment.amount_paid || 0, payment.amount_paid_local, payment.fiat_currency)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {status === 'paid' ? 'Amount Paid' : 'Amount Payable'}
                        </p>
                      </div>
                    ) : (
                      // No coupon - show standard amount
                      <>
                        <p className="text-3xl font-bold">
                          {amountDual.primary}
                        </p>
                        {amountDual.secondary && (
                          <p className="text-sm text-muted-foreground">
                            {amountDual.secondary}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  {status === "paid" && (
                    <Button
                      onClick={() => handleDownloadReceipt()}
                      disabled={isGeneratingReceipt || isDownloadingReceipt}
                      className="bg-primary hover:bg-primary/90 gap-2"
                    >
                      {isGeneratingReceipt || isDownloadingReceipt ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          {isGeneratingReceipt ? 'Generating...' : 'Downloading...'}
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Download Receipt
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {(payment.payer_name || payment.payer_email || payment.customer_name || payment.customer_email) && (
              <Card className="bg-card border-border lg:col-span-3">
                <CardHeader className="border-b border-border">
                  <CardTitle className="flex items-center gap-2">
                    <UserCircle2 className="h-5 w-5 text-primary" />
                    Payer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                    <div>
                      <DetailRow
                        label="Name"
                        value={payment.payer_name || payment.customer_name}
                        copyable={payment.payer_name || payment.customer_name}
                      />
                    </div>
                    <div>
                      <DetailRow
                        label="Email"
                        value={payment.payer_email || payment.customer_email}
                        copyable={payment.payer_email || payment.customer_email}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subscription Details */}
            {isSubscription && payment.subscription_id && (
              <Card className="bg-card border-border lg:col-span-3">
                <CardHeader className="border-b border-border">
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-purple-500" />
                    Subscription Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <DetailRow 
                        label="Payment Number" 
                        value={payment.payment_number ? `#${payment.payment_number}` : undefined} 
                      />
                    </div>
                    <div>
                      <DetailRow 
                        label="Period Start" 
                        value={payment.period_start ? new Date(payment.period_start).toLocaleDateString() : undefined} 
                      />
                    </div>
                    <div>
                      <DetailRow 
                        label="Period End" 
                        value={payment.period_end ? new Date(payment.period_end).toLocaleDateString() : undefined} 
                      />
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Subscription ID</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">{payment.subscription_id}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/dashboard/subscriptions/${payment.subscription_id}`)}
                      >
                        View Subscription →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Information */}
            <Card className="bg-card border-border lg:col-span-2">
              <CardHeader className="border-b border-border">
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <DetailRow label="Session ID" value={canonicalSessionId} mono copyable={canonicalSessionId} />
                <Separator />
                {payment.id && payment.session_id && payment.session_id !== payment.id && (
                  <>
                    <DetailRow label="Legacy Session ID" value={payment.session_id} mono copyable={payment.session_id} />
                    <Separator />
                  </>
                )}
                <DetailRow label="Order ID" value={payment.order_id} mono copyable={payment.order_id} />
                <Separator />
                
                {/* Amount Details with Coupon Breakdown */}
                {payment.coupon_code && payment.discount_amount ? (
                  <>
                    <DetailRow 
                      label="Original Amount" 
                      value={displayAmount(payment.amount_fiat || 0, payment.amount_fiat_local, payment.fiat_currency)} 
                    />
                    <Separator />
                    <DetailRow 
                      label="Coupon Code" 
                      value={
                        <Badge variant="secondary" className="font-mono">
                          {payment.coupon_code}
                        </Badge>
                      } 
                    />
                    <Separator />
                    <DetailRow 
                      label="Discount" 
                      value={
                        <span className="text-green-600 dark:text-green-400">
                          -{displayAmount(payment.discount_amount, payment.discount_amount_local, payment.fiat_currency)}
                        </span>
                      } 
                    />
                    <Separator />
                    <DetailRow 
                      label={status === 'paid' ? 'Amount Paid' : 'Amount Payable'}
                      value={
                        <span className="font-semibold">
                          {displayAmount(payment.amount_paid || 0, payment.amount_paid_local, payment.fiat_currency)}
                        </span>
                      } 
                    />
                    <Separator />
                  </>
                ) : (
                  <>
                    <DetailRow 
                      label="Amount" 
                      value={amountDual.primary}
                    />
                    <Separator />
                  </>
                )}
                
                {amountDual.secondary && (
                  <>
                    <DetailRow 
                      label="Amount (USD)" 
                      value={amountDual.secondary}
                    />
                    <Separator />
                  </>
                )}
                
                <DetailRow
                  label="Status"
                  value={
                    <Badge
                      variant={status === "paid" ? "success" : status === "created" ? "pending" : "destructive"}
                    >
                      {status}
                    </Badge>
                  }
                />
                <Separator />
                <DetailRow
                  label="Created At"
                  value={payment.created_at ? new Date(payment.created_at).toLocaleString() : undefined}
                />
                <Separator />
                <DetailRow
                  label="Paid At"
                  value={payment.paid_at ? new Date(payment.paid_at).toLocaleString() : undefined}
                />
                <Separator />
                <DetailRow
                  label="Expires At"
                  value={payment.expires_at ? new Date(payment.expires_at).toLocaleString() : undefined}
                />
              </CardContent>
            </Card>

            {/* Merchant & URLs */}
            <Card className="bg-card border-border">
              <CardHeader className="border-b border-border">
                <CardTitle>Merchant & URLs</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-0">
                {payment.merchant_name && (
                  <>
                    <DetailRow label="Merchant" value={payment.merchant_name} />
                    <Separator />
                  </>
                )}
                {payment.merchant_id && (
                  <>
                    <DetailRow label="Merchant ID" value={payment.merchant_id} mono copyable={payment.merchant_id} />
                    <Separator />
                  </>
                )}
                <DetailRow label="Success URL" value={
                  payment.success_url ? (
                    <span className="max-w-[200px] truncate block text-right" title={payment.success_url}>
                      {payment.success_url}
                    </span>
                  ) : undefined
                } />
                <Separator />
                <DetailRow label="Cancel URL" value={
                  payment.cancel_url ? (
                    <span className="max-w-[200px] truncate block text-right" title={payment.cancel_url}>
                      {payment.cancel_url}
                    </span>
                  ) : undefined
                } />
              </CardContent>
            </Card>

            {/* Transaction Details */}
            <Card className="bg-card border-border lg:col-span-3">
              <CardHeader className="border-b border-border">
                <CardTitle>Transaction Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Stripe card payment */}
                {payment.metadata?.stripe_payment_intent_id ? (
                  <>
                    <DetailRow
                      label="Payment Method"
                      value={
                        <span className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 text-xs font-semibold border border-violet-500/20">
                            💳 Card
                          </span>
                          <span className="text-muted-foreground text-xs capitalize">
                            {payment.metadata?.card_provider || "Stripe"}
                          </span>
                        </span>
                      }
                    />
                    <Separator />
                    <DetailRow
                      label="Stripe Payment ID"
                      value={
                        <a
                          href={`https://dashboard.stripe.com/test/payments/${payment.metadata.stripe_payment_intent_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1 font-mono text-xs"
                        >
                          {payment.metadata.stripe_payment_intent_id}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      }
                      copyable={payment.metadata.stripe_payment_intent_id}
                    />
                  </>
                ) : payment.tx_hash ? (
                  /* On-chain payment */
                  <DetailRow
                    label="Transaction Hash"
                    value={
                      <a
                        href={getExplorerTxUrl(payment.chain, payment.tx_hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {payment.tx_hash}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    }
                    copyable={payment.tx_hash}
                  />
                ) : (
                  /* No payment yet */
                  <DetailRow
                    label="Transaction Hash"
                    value={
                      <span className="text-muted-foreground italic">No transaction yet</span>
                    }
                  />
                )}

                {/* Chain info for on-chain payments */}
                {payment.chain && !payment.metadata?.stripe_payment_intent_id && (
                  <>
                    <Separator />
                    <DetailRow
                      label="Network"
                      value={
                        <span className="capitalize font-medium">{payment.chain}</span>
                      }
                    />
                  </>
                )}
              </CardContent>
            </Card>

            {/* ── Payment Economics Card ── */}
            {payment.settlement_gross_amount && (
              <Card className="bg-card border-border lg:col-span-2">
                <CardHeader className="border-b border-border">
                  <CardTitle className="flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-emerald-500" />
                    Payment Economics
                    {payment.settlement_status && (
                      <Badge
                        variant={payment.settlement_status === 'SETTLED' ? 'success' : 'pending'}
                        className="ml-auto text-xs"
                      >
                        {payment.settlement_status}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Fee Breakdown */}
                  <div className="space-y-0">
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm text-muted-foreground">Gross Amount</span>
                      <span className="font-semibold text-sm">
                        {payment.settlement_token} {payment.settlement_gross_amount}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm text-muted-foreground">Platform Fee</span>
                      <span className="text-sm text-orange-400">− {payment.settlement_token} {payment.settlement_platform_fee}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm text-muted-foreground">Network Fee</span>
                      <span className="text-sm text-yellow-400">− {payment.settlement_token} {payment.settlement_network_fee}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center py-3 rounded-lg bg-emerald-500/10 px-3 -mx-3">
                      <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        Net Settlement
                      </span>
                      <span className="font-bold text-emerald-400">
                        {payment.settlement_token} {payment.settlement_net_amount}
                      </span>
                    </div>
                  </div>
                  {/* Settlement metadata */}
                  {(payment.settlement_chain || payment.settlement_tx_hash) && (
                    <>
                      <Separator className="mt-4" />
                      {payment.settlement_chain && (
                        <DetailRow label="Settlement Chain" value={
                          <span className="capitalize font-medium">{payment.settlement_chain}</span>
                        } />
                      )}
                      {payment.settlement_tx_hash && (
                        <>
                          <Separator />
                          <DetailRow
                            label="Settlement Tx"
                            value={
                              <span className="font-mono text-xs break-all">
                                {payment.settlement_tx_hash.slice(0, 20)}…
                              </span>
                            }
                            mono
                            copyable={payment.settlement_tx_hash}
                          />
                        </>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ── Orchestration Insights Card ── */}
            {payment.provider_used && (
              <Card className="bg-card border-border">
                <CardHeader className="border-b border-border">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-violet-500" />
                    Orchestration Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-0">
                  <DetailRow
                    label="Provider Used"
                    value={
                      <Badge variant="outline" className="capitalize font-semibold">
                        {payment.provider_used}
                      </Badge>
                    }
                  />
                  <Separator />
                  <DetailRow
                    label="Routing Strategy"
                    value={
                      <span className="capitalize text-sm">{payment.routing_strategy?.replace('_', ' ')}</span>
                    }
                  />
                  {payment.routing_reason && (
                    <>
                      <Separator />
                      <DetailRow
                        label="Routing Reason"
                        value={<span className="text-sm text-right max-w-[200px]">{payment.routing_reason}</span>}
                      />
                    </>
                  )}
                  {typeof payment.routing_score === 'number' && (
                    <>
                      <Separator />
                      <DetailRow
                        label="Gateway Score"
                        value={
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                            <span className="font-semibold text-sm">{payment.routing_score.toFixed(1)}</span>
                          </span>
                        }
                      />
                    </>
                  )}
                  {payment.routing_failover_used && (
                    <>
                      <Separator />
                      <DetailRow
                        label="Failover"
                        value={
                          <Badge variant="secondary" className="text-amber-400 border-amber-400/30 bg-amber-400/10">
                            Triggered
                          </Badge>
                        }
                      />
                    </>
                  )}
                  {payment.alternative_providers && payment.alternative_providers.length > 0 && (
                    <>
                      <Separator />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-1">
                        <span className="text-sm text-muted-foreground">Alternatives</span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {payment.alternative_providers.map(p => (
                            <Badge key={p} variant="outline" className="text-xs capitalize">{p}</Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {payment.routing_candidate_scores && payment.routing_candidate_scores.length > 0 && (
                    <>
                      <Separator />
                      <div className="py-3">
                        <p className="text-xs text-muted-foreground mb-2">Candidate Scores</p>
                        <div className="space-y-1.5">
                          {payment.routing_candidate_scores.map(c => (
                            <div key={c.gateway} className="flex items-center gap-2">
                              <span className="text-xs capitalize w-20 truncate">{c.gateway}</span>
                              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                                  style={{ width: `${Math.min((c.score || 0), 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-8 text-right">{(c.score || 0).toFixed(0)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {payment.routing_decision_id && (
                    <>
                      <Separator />
                      <DetailRow
                        label="Decision ID"
                        value={<span className="font-mono text-xs">{payment.routing_decision_id.slice(0, 12)}…</span>}
                        mono
                        copyable={payment.routing_decision_id}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            )}

          </div>
        ) : null}
      </div>
    </BentoLayout>
  );
}
