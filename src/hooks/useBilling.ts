import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingService, PlanTier } from '../services/billing.service';
import { toast } from 'sonner';

/** Safely extract a human-readable string from an Axios error. */
function getErrorMessage(error: any): string {
  const detail = error?.response?.data?.detail;
  if (!detail) return error?.message || 'An unexpected error occurred';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    // FastAPI 422 validation errors: [{type, loc, msg, input}, ...]
    return detail.map((e: any) => e?.msg ?? String(e)).join('; ');
  }
  return String(detail);
}

export function useBilling() {
  const queryClient = useQueryClient();

  const { data: billingInfo, isLoading, error } = useQuery({
    queryKey: ['billing'],
    queryFn: billingService.getBillingInfo,
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
  });

  const { data: usage } = useQuery({
    queryKey: ['billing', 'usage'],
    queryFn: billingService.getUsage,
    retry: 1,
  });

  const changePlanMutation = useMutation({
    mutationFn: (planId: PlanTier) => billingService.changePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] });
      toast.success('Plan changed successfully!');
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error) || 'Failed to change plan');
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: billingService.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] });
      toast.success('Subscription will be canceled at the end of the billing period');
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error) || 'Failed to cancel subscription');
    },
  });

  const reactivateSubscriptionMutation = useMutation({
    mutationFn: billingService.reactivateSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] });
      toast.success('Subscription reactivated!');
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error) || 'Failed to reactivate subscription');
    },
  });

  return {
    billingInfo,
    usage,
    isLoading,
    error,
    changePlan: changePlanMutation.mutate,
    cancelSubscription: cancelSubscriptionMutation.mutate,
    reactivateSubscription: reactivateSubscriptionMutation.mutate,
    isChangingPlan: changePlanMutation.isPending,
  };
}
