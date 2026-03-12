import { useEffect, useState } from "react";
import { DashboardLayout } from "./DashboardLayout";
import { Card } from "./ui/card";
import { TrendingUp, DollarSign, CheckCircle, Clock, Wallet2, Copy, Check, Tag } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { usePaymentHistory, usePaymentStats } from "../../hooks/usePaymentHistory";
import { useWallets, useWalletDashboard } from "../../hooks/useWallets";
import { useMerchantCurrency } from "../../hooks/useMerchantCurrency";
import { CHAIN_INFO } from "../../services/wallets.service";
import { toast } from "sonner";
import { displayAmount, displayDualAmount, hasLocalCurrency } from "../../lib/utils";

export function Dashboard() {
  const { payments, isLoading } = usePaymentHistory({ limit: 10 });
  const { stats } = usePaymentStats();
  const { data: walletsData, isLoading: walletsLoading } = useWallets();
  const { data: dashboardData } = useWalletDashboard(); // Get dashboard data too
  const { currency, currencySymbol } = useMerchantCurrency();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Use stats endpoint for accurate metrics across all payments
  const totalVolume = stats?.revenue.total_usdc ?? 0;
  const paymentsToday = stats?.recent.today ?? 0;
  const successRate = stats ? stats.success_rate.toFixed(1) : '0';
  const hasCouponDiscounts = stats && stats.revenue.coupon_payment_count > 0;
  const totalRevenueLocal = stats?.revenue.total_local;
  const totalCouponDiscountLocal = stats?.revenue.total_coupon_discount_local;
  const revenueDisplay = displayDualAmount(totalVolume, totalRevenueLocal);

  // Try to get wallets from either endpoint
  const wallets = walletsData?.wallets || dashboardData?.wallets || [];
  const hasWallets = wallets.length > 0;

  return (
    <DashboardLayout activePage="overview">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl mb-2">Overview</h1>
          <p className="text-muted-foreground">
            Monitor your payment activity and performance
          </p>
        </div>

        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl mb-1">{revenueDisplay.primary}</div>
            {revenueDisplay.secondary && (
              <div className="text-sm text-muted-foreground mb-1">{revenueDisplay.secondary}</div>
            )}
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </Card>

          {hasCouponDiscounts && (
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <Tag className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="text-2xl mb-1">
                {displayAmount(stats.revenue.total_coupon_discount, totalCouponDiscountLocal)}
              </div>
              <p className="text-sm text-muted-foreground">
                Coupon Discounts ({stats.revenue.coupon_payment_count} payments)
              </p>
            </Card>
          )}

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-2xl mb-1">{paymentsToday}</div>
            <p className="text-sm text-muted-foreground">Payments Today</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-2xl mb-1">{successRate}%</div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-2xl mb-1">~3.1s</div>
            <p className="text-sm text-muted-foreground">Avg Settlement Time</p>
          </Card>
        </div>

        {/* Wallet Widget */}
        <Card className="bg-card border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-xl mb-1">Your Wallets</h2>
              <p className="text-sm text-muted-foreground">Quick access to your blockchain addresses</p>
            </div>
            <a href="#/wallets">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </a>
          </div>
          <div className="p-6">
            {walletsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading wallets...</div>
            ) : !hasWallets ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wallet2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">No wallets configured yet</p>
                  <p className="text-xs">
                    Complete <a href="#/onboarding" className="text-primary hover:underline">onboarding</a> to set up your wallets
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {wallets.slice(0, 5).map((wallet) => {
                    const chainInfo = CHAIN_INFO[wallet.chain as keyof typeof CHAIN_INFO];
                    const walletId = (wallet as any).id || `wallet-${wallet.chain}`;
                    const isCopied = copiedId === walletId;

                    const copyToClipboard = async () => {
                      try {
                        await navigator.clipboard.writeText(wallet.wallet_address);
                        setCopiedId(walletId);
                        toast.success('Wallet address copied');
                        setTimeout(() => setCopiedId(null), 2000);
                      } catch (err) {
                        toast.error('Failed to copy address');
                      }
                    };

                    return (
                      <div
                        key={walletId}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="text-xl">{chainInfo?.icon || '🔗'}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{chainInfo?.name || wallet.chain}</span>
                              <Badge
                                variant={wallet.is_active ? 'default' : 'secondary'}
                                className={wallet.is_active ? 'bg-green-500 text-xs' : 'text-xs'}
                              >
                                {wallet.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="font-mono text-xs text-muted-foreground truncate">
                              {wallet.wallet_address}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={copyToClipboard}
                          disabled={isCopied}
                        >
                          {isCopied ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    );
                  })}
                  {wallets.length > 5 && (
                    <div className="text-center pt-2">
                      <a href="#/wallets" className="text-sm text-primary hover:underline">
                        View {wallets.length - 5} more wallets →
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

        {/* Recent Payments */}
        <Card className="bg-card border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl">Recent Payments</h2>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading payments...
              </div>
            ) : (payments || []).length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No payments yet. Create your first payment to get started!
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tx Hash</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(payments || []).map((payment) => (
                      <TableRow
                        key={payment.id || payment.session_id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => window.location.href = `#/dashboard/payments/${payment.id || payment.session_id}`}
                      >
                        <TableCell className="font-mono text-sm">
                          {payment.id || payment.session_id}
                        </TableCell>
                        <TableCell>{displayDualAmount(
                          payment.amount_fiat || parseFloat(payment.amount_usdc || '0'),
                          payment.amount_fiat_local
                        ).primary}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              payment.status === "paid"
                                ? "default"
                                : payment.status === "created"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className={
                              payment.status === "paid"
                                ? "bg-primary/20 text-primary border-primary/30"
                                : ""
                            }
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {payment.tx_hash ? (
                            <a
                              href={`https://stellar.expert/explorer/testnet/tx/${payment.tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
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
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>
      </div>
    </DashboardLayout>
  );
}
