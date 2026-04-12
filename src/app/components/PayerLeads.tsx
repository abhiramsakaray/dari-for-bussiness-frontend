import { BentoLayout } from "./BentoLayout";
import { Card } from "./ui/card";
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
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { chainpeService } from "../../services/chainpe";
import type { PaymentSession } from "../../services/chainpe";
import { useEffect, useState } from "react";
import { Mail, UserCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

export function PayerLeads() {
  const [leads, setLeads] = useState<PaymentSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [includePaid, setIncludePaid] = useState(false);

  const fetchLeads = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await chainpeService.getPayerLeads({ limit: 100, include_paid: includePaid });
      setLeads(response.payments);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch payer leads");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includePaid]);

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success("Email copied to clipboard");
  };

  const copyAllEmails = () => {
    const emails = leads
      .filter((l) => l.payer_email)
      .map((l) => l.payer_email)
      .join(", ");
    if (!emails) {
      toast.error("No emails to copy");
      return;
    }
    navigator.clipboard.writeText(emails);
    toast.success(`${leads.filter((l) => l.payer_email).length} emails copied`);
  };

  return (
    <BentoLayout activePage="payer-leads">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl mb-2 flex items-center gap-3">
              <UserCircle2 className="h-8 w-8 text-primary" />
              Payer Leads
            </h1>
            <p className="text-muted-foreground">
              Customers who filled out their contact info but didn't complete payment — follow up to recover the sale.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={copyAllEmails} className="gap-2">
              <Mail className="h-4 w-4" />
              Copy All Emails
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={fetchLeads}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Controls */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <Switch
              id="include-paid"
              checked={includePaid}
              onCheckedChange={setIncludePaid}
            />
            <Label htmlFor="include-paid" className="cursor-pointer">
              Include completed payments (show everyone who submitted contact info)
            </Label>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-card border-border text-center">
            <p className="text-2xl font-bold">{leads.length}</p>
            <p className="text-sm text-muted-foreground">Total Leads</p>
          </Card>
          <Card className="p-4 bg-card border-border text-center">
            <p className="text-2xl font-bold">{leads.filter((l) => l.payer_email).length}</p>
            <p className="text-sm text-muted-foreground">With Email</p>
          </Card>
          <Card className="p-4 bg-card border-border text-center">
            <p className="text-2xl font-bold">{leads.filter((l) => l.status === "expired").length}</p>
            <p className="text-sm text-muted-foreground">Abandoned</p>
          </Card>
          <Card className="p-4 bg-card border-border text-center">
            <p className="text-2xl font-bold">{leads.filter((l) => l.status === "paid").length}</p>
            <p className="text-sm text-muted-foreground">Converted</p>
          </Card>
        </div>

        {/* Leads Table */}
        <Card className="bg-card border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl">Contact List</h2>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading leads...</div>
            ) : error ? (
              <div className="p-8 text-center text-destructive">{error}</div>
            ) : leads.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No payer leads yet. Once customers fill out their info at checkout, they'll appear here.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Session ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow
                      key={lead.id || lead.session_id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() =>
                        window.location.href = `#/dashboard/payments/${lead.id || lead.session_id}`
                      }
                    >
                      <TableCell>
                        {lead.payer_name ? (
                          <span className="font-medium">{lead.payer_name}</span>
                        ) : (
                          <span className="text-muted-foreground italic">Unknown</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.payer_email ? (
                          <span className="font-mono text-sm">{lead.payer_email}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>${parseFloat(lead.amount_usdc).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            lead.status === "paid"
                              ? "default"
                              : lead.status === "created"
                              ? "secondary"
                              : "destructive"
                          }
                          className={lead.status === "paid" ? "bg-primary/20 text-primary border-primary/30" : ""}
                        >
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {(lead.id || lead.session_id || "").slice(0, 16)}...
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {lead.payer_email && (
                          <button
                            onClick={() => copyEmail(lead.payer_email!)}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1"
                            title="Copy email"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      </div>
    </BentoLayout>
  );
}
