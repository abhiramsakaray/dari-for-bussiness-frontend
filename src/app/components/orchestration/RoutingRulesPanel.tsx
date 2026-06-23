import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Plus, Trash2 } from 'lucide-react';
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableCell,
} from '../ui/data-table';
import { useRoutingRules, useCreateRoutingRule, useDeleteRoutingRule } from '../../../hooks/useOrchestration';
import type { CreateRoutingRuleInput } from '../../../types/orchestration.types';

const GATEWAYS = ['stripe', 'checkout', 'razorpay', 'dodo', 'paytm', 'phonepe', 'cashfree', 'payu', 'ccavenue', 'instamojo', 'easebuzz', 'web3'];
const PAYMENT_METHODS = ['card', 'upi', 'netbanking', 'wallet', 'crypto'];

const emptyForm: CreateRoutingRuleInput = {
  priority: 100,
  target_gateway: 'stripe',
};

export function RoutingRulesPanel() {
  const { data, isLoading } = useRoutingRules();
  const createMutation = useCreateRoutingRule();
  const deleteMutation = useDeleteRoutingRule();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateRoutingRuleInput>({ ...emptyForm });

  const handleCreate = () => {
    const payload: CreateRoutingRuleInput = {
      priority: form.priority,
      target_gateway: form.target_gateway,
    };
    if (form.country) payload.country = form.country;
    if (form.currency) payload.currency = form.currency;
    if (form.payment_method) payload.payment_method = form.payment_method;
    if (form.min_amount) payload.min_amount = form.min_amount;
    if (form.max_amount) payload.max_amount = form.max_amount;

    createMutation.mutate(payload, {
      onSuccess: () => {
        setOpen(false);
        setForm({ ...emptyForm });
      },
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6"><Skeleton className="h-48" /></CardContent>
      </Card>
    );
  }

  const rules = data?.rules ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Routing Rules</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-3.5 mr-1.5" /> Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Routing Rule</DialogTitle>
                <DialogDescription>
                  Define conditions to route payments to a specific gateway. Lower priority numbers execute first.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Input
                      type="number"
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 100 })}
                    />
                  </div>
                  <div>
                    <Label>Target Gateway</Label>
                    <Select
                      value={form.target_gateway}
                      onValueChange={(v) => setForm({ ...form, target_gateway: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {GATEWAYS.map((g) => (
                          <SelectItem key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Country (ISO 3166)</Label>
                    <Input
                      placeholder="e.g. IN, US"
                      value={form.country ?? ''}
                      onChange={(e) => setForm({ ...form, country: e.target.value || undefined })}
                    />
                  </div>
                  <div>
                    <Label>Currency (ISO 4217)</Label>
                    <Input
                      placeholder="e.g. INR, USD"
                      value={form.currency ?? ''}
                      onChange={(e) => setForm({ ...form, currency: e.target.value || undefined })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select
                    value={form.payment_method ?? 'any'}
                    onValueChange={(v) => setForm({ ...form, payment_method: v === 'any' ? undefined : v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Min Amount</Label>
                    <Input
                      type="number"
                      placeholder="No minimum"
                      value={form.min_amount ?? ''}
                      onChange={(e) => setForm({ ...form, min_amount: e.target.value || undefined })}
                    />
                  </div>
                  <div>
                    <Label>Max Amount</Label>
                    <Input
                      type="number"
                      placeholder="No maximum"
                      value={form.max_amount ?? ''}
                      onChange={(e) => setForm({ ...form, max_amount: e.target.value || undefined })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Rule'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {rules.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            No custom routing rules. The smart routing engine will handle all decisions.
          </p>
        ) : (
          <DataTable>
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead>Priority</DataTableHead>
                <DataTableHead>Gateway</DataTableHead>
                <DataTableHead>Country</DataTableHead>
                <DataTableHead>Currency</DataTableHead>
                <DataTableHead>Method</DataTableHead>
                <DataTableHead>Amount Range</DataTableHead>
                <DataTableHead>Status</DataTableHead>
                <DataTableHead></DataTableHead>
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {rules.map((rule) => (
                <DataTableRow key={rule.id}>
                  <DataTableCell className="font-mono">{rule.priority}</DataTableCell>
                  <DataTableCell className="capitalize font-medium">{rule.target_gateway}</DataTableCell>
                  <DataTableCell>{rule.country ?? 'Any'}</DataTableCell>
                  <DataTableCell>{rule.currency ?? 'Any'}</DataTableCell>
                  <DataTableCell className="capitalize">{rule.payment_method ?? 'Any'}</DataTableCell>
                  <DataTableCell>
                    {rule.min_amount || rule.max_amount
                      ? `${rule.min_amount ?? '0'} - ${rule.max_amount ?? '∞'}`
                      : 'Any'}
                  </DataTableCell>
                  <DataTableCell>
                    <Badge variant={rule.is_active ? 'success' : 'default'}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </DataTableCell>
                  <DataTableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(rule.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="size-3.5 text-muted-foreground" />
                    </Button>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        )}
      </CardContent>
    </Card>
  );
}
