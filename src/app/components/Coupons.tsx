import { useState } from 'react';
import { BentoLayout } from "./BentoLayout";
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Plus, Power, PowerOff, Trash2, Edit, TrendingUp, Calendar, Users } from 'lucide-react';
import { useCoupons, useToggleCouponStatus, useDeleteCoupon } from '@/hooks/useCoupons';
import { useMerchantCurrency } from '@/hooks/useMerchantCurrency';
import { CreateCouponModal } from './coupons/CreateCouponModal';
import { PromoCode } from '@/types/api.types';

export function Coupons() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | undefined>(undefined);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  const { data, isLoading } = useCoupons(page, 20, statusFilter);
  const toggleStatus = useToggleCouponStatus();
  const deleteCoupon = useDeleteCoupon();
  const { currencySymbol } = useMerchantCurrency();

  const coupons = data?.promo_codes || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const handleToggleStatus = (coupon: PromoCode) => {
    const newStatus = coupon.status === 'active' ? 'inactive' : 'active';
    toggleStatus.mutate({ couponId: coupon.id, status: newStatus });
  };

  const handleDeleteClick = (couponId: string) => {
    setCouponToDelete(couponId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (couponToDelete) {
      deleteCoupon.mutate(couponToDelete);
      setDeleteDialogOpen(false);
      setCouponToDelete(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const getDiscountDisplay = (coupon: PromoCode) => {
    if (coupon.type === 'percentage') {
      const maxCap = coupon.max_discount_amount
        ? ` (max ${currencySymbol}${coupon.max_discount_amount})`
        : '';
      return `${coupon.discount_value}%${maxCap}`;
    }
    return `${currencySymbol}${coupon.discount_value}`;
  };

  return (
    <BentoLayout activePage="coupons">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl mb-2">Promo Codes</h1>
            <p className="text-muted-foreground">
              Create and manage discount coupons for your customers
            </p>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Coupon
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4 bg-card border-border">
          <div className="flex gap-4 items-center">
            <span className="text-sm text-muted-foreground">Filter by status:</span>
            <Select
              value={statusFilter || 'all'}
              onValueChange={(value) =>
                setStatusFilter(value === 'all' ? undefined : (value as 'active' | 'inactive'))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Coupons</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {total > 0 && (
              <span className="text-sm text-muted-foreground ml-auto">
                {total} total coupon{total !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </Card>

        {/* Coupons Table */}
        <Card className="bg-card border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl">All Coupons</h2>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading coupons...
              </div>
            ) : coupons.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No coupons yet. Create your first coupon to offer discounts!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Min Order</TableHead>
                    <TableHead>Used / Limit</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id} className="hover:bg-muted/50">
                      <TableCell>
                        <code className="text-sm font-bold bg-muted px-2 py-1 rounded">
                          {coupon.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {coupon.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {getDiscountDisplay(coupon)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {currencySymbol}{coupon.min_order_amount}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{coupon.used_count}</span>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-muted-foreground">
                            {coupon.usage_limit_total ?? '∞'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {formatDate(coupon.start_date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">to</span>
                            <span
                              className={
                                isExpired(coupon.expiry_date)
                                  ? 'text-destructive'
                                  : 'text-muted-foreground'
                              }
                            >
                              {formatDate(coupon.expiry_date)}
                            </span>
                          </div>
                          {isExpired(coupon.expiry_date) && (
                            <Badge variant="destructive" className="w-fit text-xs px-1 py-0">
                              Expired
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={coupon.status === 'active' ? 'default' : 'secondary'}
                          className={
                            coupon.status === 'active'
                              ? 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30'
                              : ''
                          }
                        >
                          {coupon.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleStatus(coupon)}
                                  disabled={toggleStatus.isPending}
                                >
                                  {coupon.status === 'active' ? (
                                    <PowerOff className="w-4 h-4" />
                                  ) : (
                                    <Power className="w-4 h-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {coupon.status === 'active' ? 'Disable' : 'Enable'}
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    (window.location.href = `#/dashboard/coupons/${coupon.id}/analytics`)
                                  }
                                >
                                  <TrendingUp className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Analytics</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(coupon.id)}
                                  disabled={deleteCoupon.isPending}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Create Coupon Modal */}
        {showCreate && (
          <CreateCouponModal
            open={showCreate}
            onClose={() => setShowCreate(false)}
            onSuccess={() => {
              setShowCreate(false);
              setPage(1); // Reset to first page to see new coupon
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this coupon? This action cannot be undone.
                The coupon will be soft-deleted and will no longer appear in your list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCouponToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </BentoLayout>
  );
}
