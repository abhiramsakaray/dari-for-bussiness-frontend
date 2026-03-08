import { DashboardLayout } from "./DashboardLayout";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
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

export function PaymentsList() {
  const { payments, isLoading } = usePaymentHistory({ limit: 50 });
  const [searchQuery, setSearchQuery] = useState("");

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
    <DashboardLayout activePage="payments">
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
            onClick={() => window.location.href = '#/dashboard/create'}
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
                    <TableHead>Session ID</TableHead>
                    <TableHead>Payer</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>USDC Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tx Hash</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                  <TableRow
                    key={payment.id || payment.session_id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => window.location.href = `#/dashboard/payments/${payment.id || payment.session_id}`}
                  >
                    <TableCell className="font-mono text-sm">
                      {payment.id || payment.session_id}
                      </TableCell>
                      <TableCell>
                        {payment.payer_name || payment.payer_email ? (
                          <div className="text-sm">
                            {payment.payer_name && <div>{payment.payer_name}</div>}
                            {payment.payer_email && <div className="text-muted-foreground">{payment.payer_email}</div>}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{payment.order_id || '-'}</TableCell>
                      <TableCell>${parseFloat(payment.amount_usdc).toFixed(2)}</TableCell>
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