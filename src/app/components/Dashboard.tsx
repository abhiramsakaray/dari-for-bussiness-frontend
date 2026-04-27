import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BentoLayout } from "./BentoLayout";
import { 
  BentoGrid, 
  BentoCard, 
  BentoKPICard,
  BentoCardHeader,
  BentoCardTitle,
  BentoCardSubtitle,
  BentoCardContent 
} from "./ui/bento-grid";
import { Skeleton } from "./ui/skeleton";
import { TrendingUp, DollarSign, CheckCircle, Clock, Wallet2, Copy, Check, Tag, ArrowUpRight } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableCell,
} from "./ui/data-table";
import { usePaymentHistory, usePaymentStats } from "../../hooks/usePaymentHistory";
import { useWallets, useWalletDashboard } from "../../hooks/useWallets";
import { CHAIN_INFO, getExplorerTxUrl } from "../../services/wallets.service";
import { toast } from "sonner";
import { displayAmount, displayDualAmount } from "../../lib/utils";
import { getPermissions } from "../../utils/rolePermissions";

export function Dashboard() {
  const navigate = useNavigate();
  const permissions = getPermissions();
  const { payments, isLoading } = usePaymentHistory({ limit: 10 });
  const { stats, isLoading: statsLoading } = usePaymentStats();
  const { data: walletsData, isLoading: walletsLoading } = useWallets();
  const { data: dashboardData, isLoading: dashboardLoading } = useWalletDashboard();
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
  const metricsLoading = statsLoading && !stats;
  const combinedWalletsLoading = (walletsLoading || dashboardLoading) && !hasWallets;

  return (
    <BentoLayout activePage="overview">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight text-foreground">Overview</h1>
            <p className="text-[13px] text-muted-foreground mt-1">
              Monitor your payment activity and performance
            </p>
          </div>
        </div>

        {/* Row 1 - KPI Metrics */}
        <BentoGrid>
          {metricsLoading ? (
            <>
              <BentoCard span={3}>
                <Skeleton className="h-32" />
              </BentoCard>
              <BentoCard span={3}>
                <Skeleton className="h-32" />
              </BentoCard>
              <BentoCard span={3}>
                <Skeleton className="h-32" />
              </BentoCard>
              <BentoCard span={3}>
                <Skeleton className="h-32" />
              </BentoCard>
            </>
          ) : (
            <>
              {permissions.canSeeRevenue ? (
                <BentoKPICard
                  label="TOTAL REVENUE"
                  value={revenueDisplay.primary}
                  trend={{ value: 12.5, direction: "up" }}
                />
              ) : (
                <BentoKPICard
                  label="TOTAL PAYMENTS"
                  value={stats?.total_count?.toString() || '0'}
                  trend={{ value: 12.5, direction: "up" }}
                />
              )}
              
              {hasCouponDiscounts && permissions.canSeeRevenue ? (
                <BentoKPICard
                  label="COUPON DISCOUNTS"
                  value={displayAmount(stats.revenue.total_coupon_discount, totalCouponDiscountLocal)}
                />
              ) : (
                <BentoKPICard
                  label="PAYMENTS TODAY"
                  value={paymentsToday.toString()}
                />
              )}
              
              <BentoKPICard
                label="SUCCESS RATE"
                value={`${successRate}%`}
                trend={{ value: 5.2, direction: "up" }}
              />
              
              <BentoKPICard
                label="AVG SETTLEMENT"
                value="~3.1s"
              />
            </>
          )}
        </BentoGrid>

        {/* Row 2 - Wallets Widget */}
        {permissions.canSeeWallets && (
          <BentoGrid>
            <BentoCard span={12} hover={false}>
              <BentoCardHeader>
                <div>
                  <BentoCardTitle>Your Wallets</BentoCardTitle>
                  <BentoCardSubtitle>Quick access to your blockchain addresses</BentoCardSubtitle>
                </div>
                <a href="/wallets">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Button>
                </a>
              </BentoCardHeader>
              <BentoCardContent>
                {combinedWalletsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <Skeleton className="w-6 h-6 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-64" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-8" />
                      </div>
                    ))}
                  </div>
                ) : !hasWallets ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wallet2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">No wallets configured yet</p>
                    <p className="text-xs">
                      Complete <Link to="/onboarding" className="text-primary hover:underline">onboarding</Link> to set up your wallets
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
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/40 transition-dari"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="text-xl">{chainInfo?.icon || '🔗'}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{chainInfo?.name || wallet.chain}</span>
                                <Badge
                                  variant={wallet.is_active ? 'success' : 'default'}
                                  className="text-xs"
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
                        <Link to="/wallets" className="text-sm text-primary hover:underline">
                          View {wallets.length - 5} more wallets →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </BentoCardContent>
            </BentoCard>
          </BentoGrid>
        )}

        {/* Row 3 - Recent Payments */}
        <BentoGrid>
          <BentoCard span={12} hover={false}>
            <BentoCardHeader>
              <div>
                <BentoCardTitle>Recent Payments</BentoCardTitle>
                <BentoCardSubtitle>Latest payment transactions</BentoCardSubtitle>
              </div>
            </BentoCardHeader>
            <BentoCardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((idx) => (
                    <div key={idx} className="grid grid-cols-5 gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  ))}
                </div>
              ) : (payments || []).length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <p className="text-[15px] font-semibold mb-2">No payments yet</p>
                  <p className="text-[13px]">Create your first payment to get started!</p>
                </div>
              ) : (
                <DataTable>
                  <DataTableHeader>
                    <DataTableRow>
                      <DataTableHead>Session ID</DataTableHead>
                      <DataTableHead>Amount</DataTableHead>
                      <DataTableHead>Status</DataTableHead>
                      <DataTableHead>Tx Hash</DataTableHead>
                      <DataTableHead>Created At</DataTableHead>
                    </DataTableRow>
                  </DataTableHeader>
                  <DataTableBody>
                    {(payments || []).map((payment) => (
                      <DataTableRow
                        key={payment.id || payment.session_id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/dashboard/payments/${payment.id || payment.session_id}`)}
                      >
                        <DataTableCell className="font-mono text-xs">
                          {payment.id || payment.session_id}
                        </DataTableCell>
                        <DataTableCell className="font-semibold">
                          {permissions.canSeeRevenue ? (
                            displayDualAmount(
                              parseFloat(payment.amount_usdc || payment.amount_fiat || '0'),
                              payment.amount_fiat_local
                            ).primary
                          ) : (
                            <span className="text-muted-foreground">***</span>
                          )}
                        </DataTableCell>
                        <DataTableCell>
                          <Badge
                            variant={
                              payment.status === "paid"
                                ? "success"
                                : payment.status === "created"
                                  ? "pending"
                                  : "destructive"
                            }
                          >
                            {payment.status.toUpperCase()}
                          </Badge>
                        </DataTableCell>
                        <DataTableCell className="font-mono text-xs">
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
                        </DataTableCell>
                        <DataTableCell secondary className="font-mono text-xs">
                          {payment.created_at ? new Date(payment.created_at).toLocaleString() : '-'}
                        </DataTableCell>
                      </DataTableRow>
                    ))}
                  </DataTableBody>
                </DataTable>
              )}
            </BentoCardContent>
          </BentoCard>
        </BentoGrid>
      </div>
    </BentoLayout>
  );
}
