import { useState } from "react";
import { useForm } from "react-hook-form";
import { useWithdrawalBalances, useWithdrawalLimits, useCreateWithdrawal } from "../../../hooks/useWithdrawals";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { TrendingDown, DollarSign, ArrowRight, Info } from "lucide-react";
import { WithdrawalsList } from "./WithdrawalsList";
import { BentoLayout } from "../BentoLayout";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const formSchema = z.object({
  token: z.string().min(1, "Token is required"),
  chain: z.string().min(1, "Chain is required"),
  amount: z.coerce.number().min(0.000001, "Amount must be greater than 0"),
  destination_address: z.string().min(10, "Valid address is required"),
});

export function Withdrawals() {
  const { data: rawBalances, isLoading: loadingBalances } = useWithdrawalBalances();
  const { data: limits, isLoading: loadingLimits } = useWithdrawalLimits();
  const createWithdrawal = useCreateWithdrawal();

  // Extract balances - the API returns { balances: [...], coins: [...] }
  // We need chain-specific data from coins[].chain_balances
  const balancesData: any[] = (() => {
    const raw = rawBalances as any;
    
    // If we have coins with chain_balances, use that
    if (raw?.coins && Array.isArray(raw.coins)) {
      const result: any[] = [];
      for (const coin of raw.coins) {
        if (coin.chain_balances && Array.isArray(coin.chain_balances)) {
          for (const cb of coin.chain_balances) {
            result.push({
              token: cb.token.toUpperCase(),
              chain: cb.chain,
              balance: cb.balance,
              available: cb.balance,
              wallet_address: cb.wallet_address,
            });
          }
        }
      }
      return result;
    }
    
    // Fallback: if balances array exists but no chain info, we can't proceed
    return [];
  })();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: "",
      chain: "",
      amount: 0,
      destination_address: "",
    },
  });

  const selectedToken = form.watch("token");
  const selectedChain = form.watch("chain");
  const currentBalance = balancesData?.find(
    (b) => b.token === selectedToken && b.chain === selectedChain
  );

  const availableOptions = balancesData?.filter(b => {
    const avail = b.available ?? b.net_available ?? b.balance ?? 0;
    return avail > 0;
  }) || [];

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createWithdrawal.mutateAsync({
        amount: values.amount,
        currency: values.token,
        token: values.token,
        chain: values.chain,
        destination_address: values.destination_address,
      });
      form.reset();
    } catch (error) {
      // Error handled in hook toast
    }
  };

  const setMaxAmount = () => {
    if (currentBalance) {
      const avail = currentBalance.available ?? currentBalance.net_available ?? currentBalance.balance ?? 0;
      form.setValue("amount", avail);
    }
  };

  return (
    <BentoLayout activePage="withdrawals">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Withdrawals</h1>
          <p className="text-muted-foreground mt-1">
            Transfer funds from your Dari balance to your external wallet
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
          {/* Left Side - Limits & Info */}
          <div className="space-y-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-primary" />
                  Daily Withdrawal Limit
                </CardTitle>
                <CardDescription className="mt-1">
                  Resets at midnight UTC
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      {limits?.daily_remaining_local?.display_local || `${limits?.currency || ""} ${limits?.remaining?.toLocaleString() ?? "..."}`}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Available today
                    </p>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Daily Limit</span>
                      <span className="font-medium">
                        {limits?.daily_limit_local?.display_local || limits?.daily_limit}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Account Tier & Fees
                </CardTitle>
                <CardDescription className="mt-1">
                  Your current withdrawal tier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-base px-3 py-1 capitalize">
                      {limits?.tier || "Standard"}
                    </Badge>
                  </div>
                  <div className="pt-3 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Percentage Fee</span>
                      <span className="font-medium">{limits?.fee_percentage}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fixed Fee</span>
                      <span className="font-medium">{limits?.fee_fixed} {limits?.currency}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Important Information
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Withdrawals are processed within 24 hours</p>
                <p>• Ensure the destination address is correct</p>
                <p>• Network fees may apply</p>
                <p>• Minimum withdrawal varies by token</p>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Withdrawal Form */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl">Create Withdrawal</CardTitle>
              <CardDescription>
                Enter the details below to withdraw funds to your external wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Asset Selection */}
                <div className="space-y-2">
                  <Label htmlFor="asset">Select Asset & Chain</Label>
                  <Select
                    value={selectedToken && selectedChain ? `${selectedToken}:${selectedChain}` : ""}
                    onValueChange={(val) => {
                      const [token, chain] = val.split(":");
                      form.setValue("token", token);
                      form.setValue("chain", chain);
                    }}
                  >
                    <SelectTrigger id="asset" className="h-12">
                      <SelectValue placeholder="Choose token and chain" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableOptions.map((balance) => {
                        const avail = balance.available ?? balance.net_available ?? balance.balance ?? 0;
                        return (
                          <SelectItem
                            key={`${balance.token}:${balance.chain}`}
                            value={`${balance.token}:${balance.chain}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{balance.token.toUpperCase()}</span>
                              <span className="text-muted-foreground">on</span>
                              <Badge variant="outline" className="capitalize text-xs">{balance.chain}</Badge>
                              <span className="text-muted-foreground text-xs">
                                (Available: {avail.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })})
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                      {availableOptions.length === 0 && (
                        <div className="p-4 text-sm text-muted-foreground text-center">No available balance</div>
                      )}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.token && (
                    <p className="text-sm text-destructive">{form.formState.errors.token.message}</p>
                  )}
                  {form.formState.errors.chain && (
                    <p className="text-sm text-destructive">{form.formState.errors.chain.message}</p>
                  )}
                </div>

                {/* Amount Input - Large and Centered */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      step="any"
                      placeholder="0.00"
                      className="h-24 text-center text-5xl font-bold pr-24"
                      {...form.register("amount")}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={setMaxAmount}
                      disabled={!currentBalance}
                    >
                      Max
                    </Button>
                  </div>
                  {currentBalance && (
                    <p className="text-sm text-muted-foreground text-center">
                      Available: {(currentBalance.available ?? currentBalance.net_available ?? currentBalance.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {currentBalance.token.toUpperCase()}
                    </p>
                  )}
                  {form.formState.errors.amount && (
                    <p className="text-sm text-destructive text-center">{form.formState.errors.amount.message}</p>
                  )}
                </div>

                {/* Destination Address */}
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination Address</Label>
                  <Input
                    id="destination"
                    placeholder="Enter wallet address (e.g., 0x...)"
                    className="h-12 font-mono text-sm"
                    {...form.register("destination_address")}
                  />
                  {form.formState.errors.destination_address && (
                    <p className="text-sm text-destructive">{form.formState.errors.destination_address.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-lg"
                  disabled={createWithdrawal.isPending}
                >
                  {createWithdrawal.isPending ? (
                    "Processing..."
                  ) : (
                    <>
                      Withdraw Funds
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Recent Withdrawals */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Withdrawals</h2>
          <WithdrawalsList />
        </div>
      </div>
    </BentoLayout>
  );
}



