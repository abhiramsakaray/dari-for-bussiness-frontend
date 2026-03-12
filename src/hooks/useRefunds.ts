import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { refundsService } from '@/services/refunds.service';
import { CreateRefundInput, RefundStatus } from '@/types/api.types';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';

export const REFUNDS_QUERY_KEY = 'refunds';
export const PAYMENTS_QUERY_KEY = 'payments';

export function useRefunds(
  page = 1,
  pageSize = 20,
  status?: RefundStatus,
  paymentSessionId?: string
) {
  return useQuery({
    queryKey: [REFUNDS_QUERY_KEY, { page, pageSize, status, paymentSessionId }],
    queryFn: () =>
      refundsService.listRefunds({
        page,
        page_size: pageSize,
        status,
        payment_session_id: paymentSessionId,
      }),
  });
}

export function useRefund(refundId: string) {
  return useQuery({
    queryKey: [REFUNDS_QUERY_KEY, refundId],
    queryFn: () => refundsService.getRefund(refundId),
    enabled: !!refundId,
  });
}

export function useRefundEligibility(paymentSessionId: string) {
  return useQuery({
    queryKey: [REFUNDS_QUERY_KEY, 'eligibility', paymentSessionId],
    queryFn: () => refundsService.checkEligibility(paymentSessionId),
    enabled: !!paymentSessionId,
  });
}

export function useCreateRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRefundInput) => refundsService.createRefund(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [REFUNDS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEY] });
      if (data.status === 'queued') {
        toast.success('Refund queued — will process when funds are available');
      } else {
        toast.success('Refund initiated successfully');
      }
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to create refund'));
    },
  });
}

export function useCancelRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (refundId: string) => refundsService.cancelRefund(refundId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REFUNDS_QUERY_KEY] });
      toast.success('Refund cancelled');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to cancel refund'));
    },
  });
}

export function useRetryRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (refundId: string) => refundsService.retryRefund(refundId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REFUNDS_QUERY_KEY] });
      toast.success('Retrying refund...');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to retry refund'));
    },
  });
}

export function useProcessQueuedRefunds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => refundsService.processQueued(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REFUNDS_QUERY_KEY] });
      toast.success('Queued refunds are being processed');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to process queued refunds'));
    },
  });
}
