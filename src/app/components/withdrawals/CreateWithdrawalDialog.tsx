import { useState } from "react";
import { useForm } from "react-hook-form";
import { useWithdrawalBalances, useCreateWithdrawal } from "../../../hooks/useWithdrawals";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Plus } from "lucide-react";
import { CreateWithdrawalRequest } from "../../../types/api.types";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  token: z.string().min(1, "Token is required"),
  chain: z.string().min(1, "Chain is required"),
  amount: z.coerce.number().min(0.000001, "Amount must be greater than 0"),
  destination_address: z.string().min(10, "Valid address is required"),
});

export function CreateWithdrawalDialog() {
  const [open, setOpen] = useState(false);
  const { data: rawBalances } = useWithdrawalBalances();
  const createWithdrawal = useCreateWithdrawal();

  // Extract balances using same pattern as Withdrawals.tsx
  const balancesData: any[] = (() => {
    const raw = rawBalances as any;
    const items: any[] = Array.isArray(raw)
      ? raw
      : raw?.balances || raw?.coins || raw?.items || [];

    // If items have chain_balances (CoinBalance format), flatten into per-chain entries
    const result: any[] = [];
    for (const item of items) {
      if (item.chain_balances && Array.isArray(item.chain_balances) && item.chain_balances.length > 0) {
        for (const cb of item.chain_balances) {
          result.push({
            token: cb.token || item.token,
            chain: cb.chain,
            balance: cb.balance,
            available: cb.balance,
            wallet_address: cb.wallet_address,
          });
        }
      } else {
        // WithdrawalBalance format — already has chain/token/available
        result.push(item);
      }
    }
    return result;
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createWithdrawal.mutateAsync({
        amount: values.amount,
        currency: values.token,
        token: values.token,
        chain: values.chain,
        destination_address: values.destination_address,
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      // Error handled in hook toast
    }
  };

  // Show all balance entries that have some available balance
  const availableOptions = balancesData?.filter(b => {
    const avail = b.available ?? b.net_available ?? b.balance ?? 0;
    return avail > 0;
  }) || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> New Withdrawal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Withdrawal</DialogTitle>
          <DialogDescription>
            Withdraw your funds to an external wallet.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      const [token, chain] = val.split(":");
                      field.onChange(token);
                      form.setValue("chain", chain);
                    }}
                    defaultValue={field.value ? `${field.value}:${selectedChain}` : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset to withdraw" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableOptions.map((balance) => {
                        const avail = balance.available ?? balance.net_available ?? balance.balance ?? 0;
                        return (
                          <SelectItem
                            key={`${balance.token}:${balance.chain}`}
                            value={`${balance.token}:${balance.chain}`}
                          >
                            {balance.token} on {balance.chain} (Available: {avail})
                          </SelectItem>
                        );
                      })}
                      {availableOptions.length === 0 && (
                        <div className="p-2 text-sm text-muted-foreground text-center">No available balance</div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="0.00" step="any" type="number" {...field} />
                      {currentBalance && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-7 text-xs"
                          onClick={() => form.setValue("amount", currentBalance.available)}
                        >
                          Max
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="destination_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Address</FormLabel>
                  <FormControl>
                    <Input placeholder="0x..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createWithdrawal.isPending}>
                {createWithdrawal.isPending ? "Submitting..." : "Withdraw Funds"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
