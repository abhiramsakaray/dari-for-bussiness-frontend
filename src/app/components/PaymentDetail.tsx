import { DashboardLayout } from "./DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { ArrowLeft, ExternalLink, Copy, Clock, CheckCircle2, XCircle, AlertCircle, UserCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { chainpeService, PaymentSession } from "../../services/chainpe";
import { toast } from "sonner";

interface PaymentDetailProps {
  paymentId: string;
}

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

export function PaymentDetail({ paymentId }: PaymentDetailProps) {
  const [payment, setPayment] = useState<PaymentSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayment = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await chainpeService.getSessionStatus(paymentId);
        setPayment(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to fetch payment details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayment();
  }, [paymentId]);

  const status = payment?.status || "created";
  const config = statusConfig[status] || statusConfig.created;

  return (
    <DashboardLayout activePage="payments">
      <div className="space-y-6">
        {/* Back button + header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.location.href = "#/dashboard/payments"}
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
            <Button variant="outline" onClick={() => window.location.href = "#/dashboard/payments"}>
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
                    <p className="text-lg font-semibold capitalize">{status}</p>
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
                <div className="text-right">
                  <p className="text-3xl font-bold">${parseFloat(payment.amount_usdc).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">USDC</p>
                  {payment.amount_fiat && payment.fiat_currency && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ≈ {payment.fiat_currency.toUpperCase()} {parseFloat(payment.amount_fiat).toFixed(2)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payer Details — only when payer submitted contact info */}
            {(payment.payer_name || payment.payer_email) && (
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
                      <DetailRow label="Name" value={payment.payer_name} copyable={payment.payer_name} />
                    </div>
                    <div>
                      <DetailRow label="Email" value={payment.payer_email} copyable={payment.payer_email} />
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
                <DetailRow label="Session ID" value={payment.id} mono copyable={payment.id} />
                <Separator />
                {payment.session_id && payment.session_id !== payment.id && (
                  <>
                    <DetailRow label="Legacy Session ID" value={payment.session_id} mono copyable={payment.session_id} />
                    <Separator />
                  </>
                )}
                <DetailRow label="Order ID" value={payment.order_id} mono copyable={payment.order_id} />
                <Separator />
                <DetailRow label="Amount (USDC)" value={`$${parseFloat(payment.amount_usdc).toFixed(2)}`} />
                <Separator />
                {payment.amount_fiat && (
                  <>
                    <DetailRow
                      label={`Amount (${payment.fiat_currency?.toUpperCase() || "Fiat"})`}
                      value={`${payment.fiat_currency?.toUpperCase() || ""} ${parseFloat(payment.amount_fiat).toFixed(2)}`}
                    />
                    <Separator />
                  </>
                )}
                <DetailRow
                  label="Status"
                  value={
                    <Badge
                      variant={status === "paid" ? "default" : status === "created" ? "secondary" : "destructive"}
                      className={status === "paid" ? "bg-primary/20 text-primary border-primary/30" : ""}
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
                <DetailRow label="Checkout URL" value={
                  payment.checkout_url ? (
                    <a href={payment.checkout_url} target="_blank" rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1 max-w-[200px] truncate">
                      {payment.checkout_url.replace(/^https?:\/\//, "").slice(0, 30)}...
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ) : undefined
                } />
                <Separator />
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
                <DetailRow
                  label="Transaction Hash"
                  value={
                    payment.tx_hash ? (
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${payment.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {payment.tx_hash}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic">No transaction yet</span>
                    )
                  }
                  copyable={payment.tx_hash || undefined}
                />
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
