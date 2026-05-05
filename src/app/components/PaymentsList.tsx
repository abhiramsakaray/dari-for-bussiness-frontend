import { BentoLayout } from "./BentoLayout";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Tag, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { usePaymentHistory } from "../../hooks/usePaymentHistory";
import { useState } from "react";
import { displayAmount, displayDualAmount } from "../../lib/utils";
import { getExplorerTxUrl } from "../../services/wallets.service";
import { diagnoseCurrencyEncoding } from "../../utils/diagnostics";

export function PaymentsList() {
  const navigate = useNavigate();
  const { payments, isLoading } = usePaymentHistory({ limit: 50 });
  const [searchQuery, setSearchQuery] = useState("");

  // Debug: Log payments data
  if (import.meta.env.DEV && payments && payments.length > 0) {
    console.log('💳 Payments in component:', payments.length);
    console.log('💳 First payment full object:', JSON.stringify(payments[0], null, 2));
    console.log('💳 Payer fields:', {
      payer_name: payments[0].payer_name,
      payer_email: payments[0].payer_email,
      customer_name: payments[0].customer_name,
      customer_email: payments[0].customer_email,
    });
    console.log('💳 Transaction types:', payments.map(p => p.transaction_type || 'undefined'));
  }

  // Filter payments based on search - with safety check
  const filteredPayments = (payments || []).filter(payment => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      payment.id?.toLowerCase().includes(q) ||
      payment.session_id?.toLowerCase().includes(q) ||
      payment.tx_hash?.toLowerCase().includes(q) ||
      payment.order_id?.toLowerCase().includes(q) ||
      payment.status?.toLowerCase().includes(q)
    );
  });

  return (
    <BentoLayout activePage="payments">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl mb-2">Payments</h1>
            <p className="text-muted-foreground">
              View and manage all payment sessions
            </p>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigate('/dashboard/create')}
          >
            Create Payment
          </Button>
        </div>

        {/* Search */}
        <Card className="p-4 bg-card border-border">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by session ID, tx hash, order ID..."
                className="pl-10 bg-input-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Payments Table */}
        <Card className="bg-card border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl">All Payments</h2>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading payments...
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {searchQuery ? 'No payments match your search.' : 'No payments yet. Create your first payment to get started!'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Session ID</TableHead>
                    <TableHead>Payer</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tx Hash</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => {
                    const hasDiscount = payment.coupon_code !== null && payment.coupon_code !== undefined;
                    const isSubscription = payment.transaction_type === "subscription";
                    
                    // Use merchant currency if available
                    let dual;
                    if (payment.merchant_amount_local && payment.merchant_currency && payment.merchant_currency_symbol) {
                      // Backend provided merchant currency enrichment
                      dual = {
                        primary: `${payment.merchant_currency_symbol}${payment.merchant_amount_local.toFixed(2)} ${payment.merchant_currency}`,
                        secondary: payment.amount_usdc ? `$${parseFloat(payment.amount_usdc).toFixed(2)} USD` : null
                      };
                    } else {
                      // Fallback to existing logic
                      const displayAmountValue = parseFloat(payment.amount_usdc || payment.amount_fiat?.toString() || '0');
                      dual = displayDualAmount(displayAmountValue, payment.amount_fiat_local);
                    }
                    
                    // Debug: Diagnose currency encoding for first payment (development only)
                    if (import.meta.env.DEV && filteredPayments.indexOf(payment) === 0) {
                      diagnoseCurrencyEncoding(payment);
                    }
                    
                    return (
                    <TableRow
                      key={payment.id || payment.session_id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/dashboard/payments/${payment.id || payment.session_id}`)}
                    >
                      <TableCell>
                        {isSubscription ? (
                          <Badge variant="default" className="bg-purple-500 hover:bg-purple-600 gap-1">
                            <RefreshCw className="w-3 h-3" />
                            Subscription
                          </Badge>
                        ) : (
                          <Badge variant="outline">Payment</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {payment.id || payment.session_id}
                      </TableCell>
                      <TableCell>
                        {(payment.payer_name || payment.customer_name || payment.payer_email || payment.customer_email) ? (
                          <div className="text-sm">
                            {(payment.payer_name || payment.customer_name) && <div>{payment.payer_name || payment.customer_name}</div>}
                            {(payment.payer_email || payment.customer_email) && <div className="text-muted-foreground">{payment.payer_email || payment.customer_email}</div>}
                          </div>
                        ) : (
                          <span className="text-muted-foreground" title="Payer info not available in list view">—</span>
                        )}
                      </TableCell>
                      <TableCell>{payment.order_id || '-'}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{dual.primary}</div>
                          {dual.secondary && (
                            <div className="text-xs text-muted-foreground">{dual.secondary}</div>
                          )}
                          {hasDiscount && payment.discount_amount && (
                            <div className="text-xs space-y-0.5">
                              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <Tag className="w-3 h-3" />
                                <span>-{displayAmount(payment.discount_amount, payment.discount_amount_local)}</span>
                                <span className="font-mono">({payment.coupon_code})</span>
                              </div>
                              <div className="text-muted-foreground">
                                {payment.status?.toLowerCase() === 'paid' ? 'Paid' : 'Payable'}: {displayAmount(payment.amount_paid || 0, payment.amount_paid_local)}
                              </div>
                            </div>
                          )}
                          {isSubscription && payment.payment_number && (
                            <div className="text-xs text-muted-foreground">
                              Payment #{payment.payment_number}
                              {payment.period_start && payment.period_end && (
                                <span className="ml-1">
                                  ({new Date(payment.period_start).toLocaleDateString()} - {new Date(payment.period_end).toLocaleDateString()})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === "paid"
                              ? "success"
                              : payment.status === "created"
                              ? "pending"
                              : "destructive"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {payment.tx_hash ? (
                          <a
                            href={getExplorerTxUrl(payment.chain, payment.tx_hash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {payment.tx_hash.slice(0, 12)}...
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {payment.created_at ? new Date(payment.created_at).toLocaleString() : '-'}
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      </div>
    </BentoLayout>
  );
}
