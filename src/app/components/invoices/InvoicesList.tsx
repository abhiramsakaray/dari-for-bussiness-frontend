import React, { useState } from 'react';
import { useInvoices, useSendInvoice, useCancelInvoice } from '../../../hooks/useInvoices';
import { Invoice, InvoiceStatus } from '../../../types/api.types';
import { formatCurrency, formatDate, getStatusColor } from '../../../lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { FileText, Send, Eye, MoreVertical, Plus, Copy, XCircle, ExternalLink } from 'lucide-react';
import { BentoLayout } from "../BentoLayout";

// Removed navigateTo helper - using direct hash assignment for clarity

const STATUS_VARIANTS: Record<InvoiceStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  [InvoiceStatus.DRAFT]: 'secondary',
  [InvoiceStatus.SENT]: 'default',
  [InvoiceStatus.VIEWED]: 'outline',
  [InvoiceStatus.PAID]: 'default',
  [InvoiceStatus.OVERDUE]: 'destructive',
  [InvoiceStatus.CANCELLED]: 'secondary',
};

export function InvoicesList() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');

  const { data, isLoading, error } = useInvoices(
    page,
    20,
    statusFilter === 'all' ? undefined : statusFilter
  );

  const sendInvoiceMutation = useSendInvoice();
  const cancelInvoiceMutation = useCancelInvoice();

  const handleSend = (invoiceId: string) => {
    sendInvoiceMutation.mutate({ invoiceId });
  };

  const handleCancel = (invoiceId: string) => {
    if (window.confirm('Are you sure you want to cancel this invoice?')) {
      cancelInvoiceMutation.mutate(invoiceId);
    }
  };

  if (isLoading) {
    return (
      <BentoLayout activePage="invoices">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </BentoLayout>
    );
  }

  if (error) {
    const errorStatus = (error as any)?.response?.status;
    const errorMessage = errorStatus === 403 
      ? 'Invoices are not available on your current plan. Please upgrade to access this feature.'
      : 'Error loading invoices. Please try again.';
    
    return (
      <BentoLayout activePage="invoices">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {errorStatus === 403 ? 'Access Restricted' : 'Error'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{errorMessage}</p>
            {errorStatus === 403 && (
              <Button className="mt-4" onClick={() => window.location.href = '#/settings'}>
                View Plans & Billing
              </Button>
            )}
          </CardContent>
        </Card>
      </BentoLayout>
    );
  }

  return (
    <BentoLayout activePage="invoices">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">
              Create and manage invoices for your customers
            </p>
          </div>
          <Button onClick={() => window.location.href = '/invoices-dashboard/new'}>
            <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as InvoiceStatus | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={InvoiceStatus.DRAFT}>Draft</SelectItem>
            <SelectItem value={InvoiceStatus.SENT}>Sent</SelectItem>
            <SelectItem value={InvoiceStatus.VIEWED}>Viewed</SelectItem>
            <SelectItem value={InvoiceStatus.PAID}>Paid</SelectItem>
            <SelectItem value={InvoiceStatus.OVERDUE}>Overdue</SelectItem>
            <SelectItem value={InvoiceStatus.CANCELLED}>Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!data?.items?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3 mb-4">
              <FileText className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first invoice to bill your customers
            </p>
            <Button onClick={() => window.location.href = '/invoices-dashboard/new'}>
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Invoices ({data?.total})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items.map((invoice) => (
                  <InvoiceRow
                    key={invoice.id}
                    invoice={invoice}
                    onSend={handleSend}
                    onCancel={handleCancel}
                  />
                ))}
              </TableBody>
            </Table>

            {data && data.pages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="py-2 px-4 text-sm text-muted-foreground">
                  Page {page} of {data.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === data.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </BentoLayout>
  );
}

interface InvoiceRowProps {
  invoice: Invoice;
  onSend: (id: string) => void;
  onCancel: (id: string) => void;
}

function InvoiceRow({ invoice, onSend, onCancel }: InvoiceRowProps) {
  const isOverdue = invoice.status === InvoiceStatus.OVERDUE;

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <a
            href={`/invoices-dashboard/${invoice.id}`}
            className="font-mono font-medium hover:underline"
          >
            {invoice.invoice_number}
          </a>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{invoice.customer_name || 'No name'}</p>
          <p className="text-sm text-muted-foreground">{invoice.customer_email}</p>
        </div>
      </TableCell>
      <TableCell className="font-semibold">
        {formatCurrency(invoice.total, invoice.fiat_currency)}
      </TableCell>
      <TableCell>
        <Badge variant={STATUS_VARIANTS[invoice.status]}>
          {invoice.status.toUpperCase()}
        </Badge>
      </TableCell>
      <TableCell className={isOverdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'}>
        {formatDate(invoice.due_date)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(invoice.created_at)}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => window.location.href = `/invoices-dashboard/${invoice.id}`}
            title="View invoice"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {invoice.status === InvoiceStatus.DRAFT && (
                <DropdownMenuItem onClick={() => onSend(invoice.id)}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invoice
                </DropdownMenuItem>
              )}
              {invoice.payment_url && (
                <DropdownMenuItem onClick={() => window.open(invoice.payment_url, '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Payment Link
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => window.location.href = `/invoices-dashboard/${invoice.id}/edit`}>
                <Copy className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {invoice.status !== InvoiceStatus.CANCELLED && invoice.status !== InvoiceStatus.PAID && (
                <DropdownMenuItem onClick={() => onCancel(invoice.id)} className="text-red-600">
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default InvoicesList;
