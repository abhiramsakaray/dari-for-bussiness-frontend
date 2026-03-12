import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionsService } from '@/services/subscriptions.service';
import {
  CreateSubscriptionPlanInput,
  UpdateSubscriptionPlanInput,
  CreateSubscriptionInput,
  SubscriptionStatus,
} from '@/types/api.types';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';

export const SUBSCRIPTION_PLANS_QUERY_KEY = 'subscription-plans';
export const SUBSCRIPTIONS_QUERY_KEY = 'subscriptions';

// ============================================================================
// PLANS HOOKS
// ============================================================================

export function useSubscriptionPlans(page = 1, pageSize = 20, isActive?: boolean) {
  return useQuery({
    queryKey: [SUBSCRIPTION_PLANS_QUERY_KEY, { page, pageSize, isActive }],
    queryFn: () =>
      subscriptionsService.listPlans({
        page,
        page_size: pageSize,
        is_active: isActive,
      }),
  });
}

export function useSubscriptionPlan(planId: string) {
  return useQuery({
    queryKey: [SUBSCRIPTION_PLANS_QUERY_KEY, planId],
    queryFn: () => subscriptionsService.getPlan(planId),
    enabled: !!planId,
  });
}

export function useCreateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSubscriptionPlanInput) => subscriptionsService.createPlan(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_PLANS_QUERY_KEY] });
      toast.success('Plan created successfully');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to create plan'));
    },
  });
}

export function useUpdateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, input }: { planId: string; input: UpdateSubscriptionPlanInput }) =>
      subscriptionsService.updatePlan(planId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_PLANS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_PLANS_QUERY_KEY, data.id] });
      toast.success('Plan updated');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to update plan'));
    },
  });
}

export function useDeactivateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => subscriptionsService.deactivatePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_PLANS_QUERY_KEY] });
      toast.success('Plan deactivated');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to deactivate plan'));
    },
  });
}

// ============================================================================
// SUBSCRIPTIONS HOOKS
// ============================================================================

export function useSubscriptions(
  page = 1,
  pageSize = 20,
  status?: SubscriptionStatus,
  planId?: string
) {
  return useQuery({
    queryKey: [SUBSCRIPTIONS_QUERY_KEY, { page, pageSize, status, planId }],
    queryFn: () =>
      subscriptionsService.listSubscriptions({
        page,
        page_size: pageSize,
        status,
        plan_id: planId,
      }),
  });
}

export function useSubscription(subscriptionId: string) {
  return useQuery({
    queryKey: [SUBSCRIPTIONS_QUERY_KEY, subscriptionId],
    queryFn: () => subscriptionsService.getSubscription(subscriptionId),
    enabled: !!subscriptionId,
  });
}

export function useSubscriptionPayments(subscriptionId: string, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: [SUBSCRIPTIONS_QUERY_KEY, subscriptionId, 'payments', { page, pageSize }],
    queryFn: () =>
      subscriptionsService.getSubscriptionPayments(subscriptionId, {
        page,
        page_size: pageSize,
      }),
    enabled: !!subscriptionId,
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSubscriptionInput) => subscriptionsService.createSubscription(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_PLANS_QUERY_KEY] });
      toast.success('Subscription created');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to create subscription'));
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subscriptionId,
      immediate,
      reason,
    }: {
      subscriptionId: string;
      immediate?: boolean;
      reason?: string;
    }) => subscriptionsService.cancelSubscription(subscriptionId, immediate, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTIONS_QUERY_KEY] });
      toast.success('Subscription cancelled');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to cancel subscription'));
    },
  });
}

export function usePauseSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionId: string) => subscriptionsService.pauseSubscription(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTIONS_QUERY_KEY] });
      toast.success('Subscription paused');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to pause subscription'));
    },
  });
}

export function useResumeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionId: string) => subscriptionsService.resumeSubscription(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTIONS_QUERY_KEY] });
      toast.success('Subscription resumed');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to resume subscription'));
    },
  });
}

// ============================================================================
// TRIAL MANAGEMENT HOOKS
// ============================================================================

export function useExtendTrial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subscriptionId, extraDays }: { subscriptionId: string; extraDays: number }) =>
      subscriptionsService.extendTrial(subscriptionId, extraDays),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTIONS_QUERY_KEY] });
      toast.success('Trial extended');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to extend trial'));
    },
  });
}

export function useEndTrial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionId: string) => subscriptionsService.endTrial(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTIONS_QUERY_KEY] });
      toast.success('Trial ended — subscription converted to paid');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to end trial'));
    },
  });
}

// ============================================================================
// PAYMENT METHOD & COLLECTION HOOKS
// ============================================================================

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subscriptionId,
      data,
    }: {
      subscriptionId: string;
      data: { wallet_address: string; chain: string; token: string };
    }) => subscriptionsService.updatePaymentMethod(subscriptionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTIONS_QUERY_KEY] });
      toast.success('Payment method updated');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to update payment method'));
    },
  });
}

export function useCollectPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionId: string) => subscriptionsService.collectPayment(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTIONS_QUERY_KEY] });
      toast.success('Payment collection initiated');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to collect payment'));
    },
  });
}

export function useRenewSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionId: string) => subscriptionsService.renewSubscription(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTIONS_QUERY_KEY] });
      toast.success('Subscription renewed');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to renew subscription'));
    },
  });
}
