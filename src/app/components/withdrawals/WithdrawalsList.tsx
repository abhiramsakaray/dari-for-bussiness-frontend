import { useState } from "react";
import { useWithdrawals, useCancelWithdrawal } from "../../../hooks/useWithdrawals";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { AlertCircle, ArrowUpRight, Ban, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

// Helper function to get blockchain explorer URL
const getExplorerUrl = (chain: string, txHash: string): string => {
  const explorers: Record<string, string> = {
    ethereum: `https://etherscan.io/tx/${txHash}`,
    polygon: `https://polygonscan.com/tx/${txHash}`,
    bsc: `https://bscscan.com/tx/${txHash}`,
    arbitrum: `https://arbiscan.io/tx/${txHash}`,
    base: `https://basescan.org/tx/${txHash}`,
    avalanche: `https://snowtrace.io/tx/${txHash}`,
    stellar: `https://stellar.expert/explorer/public/tx/${txHash}`,
    solana: `https://solscan.io/tx/${txHash}`,
    tron: `https://tronscan.org/#/transaction/${txHash}`,
  };
  return explorers[chain.toLowerCase()] || `https://etherscan.io/tx/${txHash}`;
};

export function WithdrawalsList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useWithdrawals({ page, limit: 10 });
  const cancelWithdrawal = useCancelWithdrawal();

  const handleCancel = (id: string) => {
    if (confirm("Are you sure you want to cancel this withdrawal?")) {
      cancelWithdrawal.mutate(id);
    }
  };

  const statusIcons = {
    pending: <Clock className="w-4 h-4 text-orange-500" />,
    processing: <ArrowUpRight className="w-4 h-4 text-blue-500" />,
    completed: <CheckCircle className="w-4 h-4 text-green-500" />,
    failed: <AlertCircle className="w-4 h-4 text-red-500" />,
    cancelled: <Ban className="w-4 h-4 text-gray-500" />,
  };

  const statusColors = {
    pending: "secondary",
    processing: "default",
    completed: "success", // shadcn badge variant? default/secondary/destructive/outline usually. Let's use outline for success-like or add class
    failed: "destructive",
    cancelled: "outline",
  } as const;

  if (isLoading) {
    return <div className="text-center py-8">Loading withdrawals...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Error loading withdrawals: {(error as Error).message}
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-8 text-muted-foreground">No data available</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.items?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                No withdrawals found
              </TableCell>
            </TableRow>
          ) : (
            data?.items?.map((withdrawal) => (
              <TableRow key={withdrawal.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {statusIcons[withdrawal.status]}
                    <span className="capitalize">{withdrawal.status}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {withdrawal.amount_local ? (
                      <div>
                        {withdrawal.amount_local.display_local}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({withdrawal.amount} {withdrawal.token})
                        </span>
                      </div>
                    ) : (
                      <span>
                        {withdrawal.amount} {withdrawal.token}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {withdrawal.chain}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-mono text-xs truncate max-w-[150px]" title={withdrawal.destination_address}>
                    {withdrawal.destination_address}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(withdrawal.created_at), "PP p")}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {withdrawal.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleCancel(withdrawal.id)}
                      disabled={cancelWithdrawal.isPending}
                    >
                      Cancel
                    </Button>
                  )}
                  {withdrawal.status === "completed" && withdrawal.tx_hash && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(getExplorerUrl(withdrawal.chain, withdrawal.tx_hash!), '_blank')}
                    >
                      View Tx
                    </Button>
                  )}
                  {withdrawal.status === "failed" && withdrawal.failure_reason && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => alert(withdrawal.failure_reason)}
                      className="text-muted-foreground"
                    >
                      Details
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
