import { useWithdrawalBalances, useWithdrawalLimits } from "../../../hooks/useWithdrawals";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Wallet, Info, Activity } from "lucide-react";
import { CreateWithdrawalDialog } from "./CreateWithdrawalDialog";
import { WithdrawalsList } from "./WithdrawalsList";
import { BentoLayout } from "../BentoLayout";

export function Withdrawals() {
  const { data: balances, isLoading: loadingBalances } = useWithdrawalBalances();
  const { data: limits, isLoading: loadingLimits } = useWithdrawalLimits();

  return (
    <BentoLayout activePage="withdrawals">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Withdrawals</h1>
            <p className="text-muted-foreground">
              Manage your funds and process withdrawals.
            </p>
          </div>
          <CreateWithdrawalDialog />
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Limit</CardTitle>
              <Info className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                 {limits?.daily_limit_local ? (
                    limits.daily_remaining_local?.display_local
                 ) : (
                    `${limits?.currency || ""} ${limits?.remaining?.toLocaleString() ?? "Loading..."}`
                 )}
              </div>
              <p className="text-xs text-muted-foreground">
                Remaining today (Limit: {
                    limits?.daily_limit_local ? limits.daily_limit_local.display_local : limits?.daily_limit
                })
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tier Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {limits?.tier || "Standard"}
              </div>
              <p className="text-xs text-muted-foreground">
                Fee: {limits?.fee_percentage}% + {limits?.fee_fixed} {limits?.currency}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Balances List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loadingBalances && <div className="col-span-3 text-center py-4">Loading Balances...</div>}
            {(Array.isArray(balances) ? balances : (balances as any)?.balances || (balances as any)?.coins || (balances as any)?.items || []).map((bal: any) => (
                <Card key={`${bal.token}-${bal.chain}`} className="border-l-4 border-l-primary/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <span>{bal.token}</span>
                            <span className="text-muted-foreground font-normal text-xs bg-muted px-2 py-0.5 rounded-full capitalize">{bal.chain}</span>
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {bal.available_local ? (
                            <>
                                <div className="text-2xl font-bold">
                                    {bal.available_local.display_local}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    ≈ {bal.available.toLocaleString()} {bal.token}
                                </div>
                            </>
                        ) : (
                            <div className="text-2xl font-bold">
                                {bal.available.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{bal.token}</span>
                            </div>
                        )}
                        
                        <div className="mt-3 pt-3 border-t text-xs flex justify-between">
                            <span className="text-muted-foreground">Pending</span>
                            <span className="font-medium text-amber-600 dark:text-amber-500">
                                {bal.pending_deductions} {bal.token}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

        <h2 className="text-xl font-semibold mt-8">Recent Withdrawals</h2>
        <WithdrawalsList />
      </div>
    </BentoLayout>
  );
}
