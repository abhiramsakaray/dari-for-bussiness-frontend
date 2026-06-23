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
import { useSavings, useOrchestrationAnalytics } from "../../hooks/useOrchestration";
import { OrchestrationStatsCards } from "./orchestration/OrchestrationStatsCards";
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
  const { data: savingsData, isLoading: savingsLoading } = useSavings();
  const { data: analyticsData, isLoading: analyticsLoading } = useOrchestrationAnalytics(30);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Use stats endpoint for accurate metrics across all payments
  const totalVolume = stats?.revenue.total_usdc ?? 0;
  const paymentsToday = stats?.recent.today ?? 0;
  const successRate = stats ? stats.success_rate.toFixed(1) : '0';
  const hasCouponDiscounts = stats && stats.revenue.coupon_payment_count > 0;
  const totalRevenueLocal = stats?.revenue.total_local;
  const totalCouponDiscountLocal = stats?.revenue.total_coupon_discount_local;
  
  // WORKAROUND: Backend is sending swapped values
  // amount_usdc contains INR amount, amount_local is double-converted
  // Fix: Use amount_usdc as the actual local amount
  let revenueDisplay;
  if (totalRevenueLocal && totalRevenueLocal.local_currency !== 'USD') {
    // Backend bug: amount_usdc field contains the actual local currency amount
    const actualLocalAmount = totalRevenueLocal.amount_usdc;
    revenueDisplay = {
      primary: `${totalRevenueLocal.local_symbol}${actualLocalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      secondary: null
    };
  } else {
    revenueDisplay = {
      primary: `$${totalVolume.toFixed(2)}`,
      secondary: null
    };
  }

  // Try to get wallets from either endpoint
  const wallets = walletsData?.wallets || dashboardData?.wallets || [];
  const hasWallets = wallets.length > 0;
  const metricsLoading = (statsLoading && !stats) || (savingsLoading && !savingsData);
  const combinedWalletsLoading = (walletsLoading || dashboardLoading) && !hasWallets;

  return (
    <BentoLayout activePage="overview">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[32px] font-bold tracking-tight text-foreground">Overview</h1>
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



        {/* Orchestration Detailed View */}
        {permissions.canSeeRevenue && (
          <div className="pt-4 mb-4">
            <p className="text-[13px] text-muted-foreground mb-4">Orchestration Impact</p>
            <OrchestrationStatsCards 
              analytics={analyticsData}
              savings={savingsData}
              isLoading={analyticsLoading || savingsLoading}
              localCurrency={totalRevenueLocal}
            />
          </div>
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
