import React, { useState } from 'react';
import { usePaymentLinks, useDeactivatePaymentLink } from '../../../hooks/usePaymentLinks';
import { useMerchantCurrency } from '../../../hooks/useMerchantCurrency';
import { PaymentLink } from '../../../types/api.types';
import { formatCurrency, formatDate, copyToClipboard } from '../../../lib/utils';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Copy, ExternalLink, Edit, Trash2, BarChart3, MoreVertical, Plus, Link } from 'lucide-react';
import { toast } from 'sonner';
import { BentoLayout } from "../BentoLayout";

// Removed navigateTo helper - using direct hash assignment for clarity

export function PaymentLinksList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = usePaymentLinks(page, 20);
  const deactivateMutation = useDeactivatePaymentLink();
  const { currency } = useMerchantCurrency();

  const handleCopy = async (url: string) => {
    try {
      await copyToClipboard(url);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleDeactivate = (linkId: string) => {
    if (window.confirm('Are you sure you want to deactivate this payment link?')) {
      deactivateMutation.mutate(linkId);
    }
  };

  if (isLoading) {
    return (
      <BentoLayout activePage="payment-links">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </BentoLayout>
    );
  }

  if (error) {
    const errorStatus = (error as any)?.response?.status;
    const errorMessage = errorStatus === 403 
      ? 'Payment Links are not available on your current plan. Please upgrade to access this feature.'
      : 'Error loading payment links. Please try again.';
    
    return (
      <BentoLayout activePage="payment-links">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <Link className="w-5 h-5" />
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
    <BentoLayout activePage="payment-links">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment Links</h1>
            <p className="text-muted-foreground">
              Create and manage shareable payment links
            </p>
          </div>
          <Button onClick={() => window.location.hash = '#/payment-links/new'}>
            <Plus className="w-4 h-4 mr-2" />
            Create Payment Link
          </Button>
        </div>

      {!data?.items?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3 mb-4">
              <ExternalLink className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No payment links yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first payment link to start accepting crypto payments
            </p>
            <Button onClick={() => window.location.hash = '#/payment-links/new'}>
              <Plus className="w-4 h-4 mr-2" />
              Create Payment Link
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Payment Links ({data?.total})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Payments</TableHead>
                  <TableHead>Collected</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items.map((link) => (
                  <PaymentLinkRow
                    key={link.id}
                    link={link}
                    currency={currency}
                    onCopy={handleCopy}
                    onDeactivate={handleDeactivate}
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

interface PaymentLinkRowProps {
  link: PaymentLink;
  currency: string;
  onCopy: (url: string) => void;
  onDeactivate: (id: string) => void;
}

function PaymentLinkRow({ link, currency, onCopy, onDeactivate }: PaymentLinkRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div>
          <a
            href={`#/payment-links/${link.id}`}
            className="font-medium hover:underline"
          >
            {link.name}
          </a>
          {link.description && (
            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
              {link.description}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        {link.is_amount_fixed && link.amount_fiat
          ? formatCurrency(link.amount_fiat, link.fiat_currency)
          : 'Variable'}
      </TableCell>
      <TableCell>{link.view_count.toLocaleString()}</TableCell>
      <TableCell>{link.payment_count.toLocaleString()}</TableCell>
      <TableCell>{formatCurrency(link.total_collected_usd, currency)}</TableCell>
      <TableCell>
        <Badge variant={link.is_active ? 'default' : 'secondary'}>
          {link.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(link.created_at)}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onCopy(link.checkout_url)}
            title="Copy link"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => window.open(link.checkout_url, '_blank')}
            title="Open checkout"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.location.hash = `#/payment-links/${link.id}/analytics`}>
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.hash = `#/payment-links/${link.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {link.is_active && (
                <DropdownMenuItem
                  onClick={() => onDeactivate(link.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deactivate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default PaymentLinksList;
