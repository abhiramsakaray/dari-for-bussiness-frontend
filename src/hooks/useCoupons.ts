import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { couponsService } from '@/services/coupons.service';
import { CreatePromoCodeInput, UpdatePromoCodeInput } from '@/types/api.types';
import { toast } from 'sonner';

export const COUPONS_QUERY_KEY = 'coupons';

// List coupons with pagination and filters
export function useCoupons(page = 1, pageSize = 20, status?: 'active' | 'inactive') {
  return useQuery({
    queryKey: [COUPONS_QUERY_KEY, { page, pageSize, status }],
    queryFn: () =>
      couponsService.listCoupons({
        page,
        page_size: pageSize,
        status,
      }),
  });
}

// Get coupon analytics
export function useCouponAnalytics(couponId: string) {
  return useQuery({
    queryKey: [COUPONS_QUERY_KEY, couponId, 'analytics'],
    queryFn: () => couponsService.getCouponAnalytics(couponId),
    enabled: !!couponId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Create coupon mutation
export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePromoCodeInput) => couponsService.createCoupon(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COUPONS_QUERY_KEY] });
      toast.success('Coupon created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Failed to create coupon';
      toast.error(message);
    },
  });
}

// Update coupon mutation
export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ couponId, input }: { couponId: string; input: UpdatePromoCodeInput }) =>
      couponsService.updateCoupon(couponId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COUPONS_QUERY_KEY] });
      toast.success('Coupon updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Failed to update coupon';
      toast.error(message);
    },
  });
}

// Delete coupon mutation
export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (couponId: string) => couponsService.deleteCoupon(couponId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COUPONS_QUERY_KEY] });
      toast.success('Coupon deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Failed to delete coupon';
      toast.error(message);
    },
  });
}

// Toggle coupon status mutation
export function useToggleCouponStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ couponId, status }: { couponId: string; status: 'active' | 'inactive' }) =>
      couponsService.toggleCouponStatus(couponId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [COUPONS_QUERY_KEY] });
      const statusText = variables.status === 'active' ? 'enabled' : 'disabled';
      toast.success(`Coupon ${statusText} successfully`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Failed to update coupon status';
      toast.error(message);
    },
  });
}
