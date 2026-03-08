import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentLinksService } from '@/services/payment-links.service';
import { CreatePaymentLinkInput, UpdatePaymentLinkInput } from '@/types/api.types';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/utils';

export const PAYMENT_LINKS_QUERY_KEY = 'payment-links';

export function usePaymentLinks(page = 1, pageSize = 20, isActive?: boolean) {
  return useQuery({
    queryKey: [PAYMENT_LINKS_QUERY_KEY, { page, pageSize, isActive }],
    queryFn: () =>
      paymentLinksService.listPaymentLinks({
        page,
        page_size: pageSize,
        is_active: isActive,
      }),
  });
}

export function usePaymentLink(linkId: string) {
  return useQuery({
    queryKey: [PAYMENT_LINKS_QUERY_KEY, linkId],
    queryFn: () => paymentLinksService.getPaymentLink(linkId),
    enabled: !!linkId,
  });
}

export function usePaymentLinkAnalytics(linkId: string) {
  return useQuery({
    queryKey: [PAYMENT_LINKS_QUERY_KEY, linkId, 'analytics'],
    queryFn: () => paymentLinksService.getPaymentLinkAnalytics(linkId),
    enabled: !!linkId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useCreatePaymentLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePaymentLinkInput) => paymentLinksService.createPaymentLink(input),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_LINKS_QUERY_KEY] });
      toast.success('Payment link created successfully');

      // Copy to clipboard
      try {
        await copyToClipboard(data.checkout_url);
        toast.info('Link copied to clipboard');
      } catch {
        // Clipboard copy failed, not critical
      }
    },
    onError: (error: Error & { response?: { data?: { detail?: string | any } } }) => {
      console.error('Payment link creation error:', error.response?.data);
      const errorMsg = typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : JSON.stringify(error.response?.data?.detail || error.message);
      toast.error(errorMsg || 'Failed to create payment link');
    },
  });
}

export function useUpdatePaymentLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ linkId, input }: { linkId: string; input: UpdatePaymentLinkInput }) =>
      paymentLinksService.updatePaymentLink(linkId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_LINKS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PAYMENT_LINKS_QUERY_KEY, data.id] });
      toast.success('Payment link updated');
    },
    onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to update payment link');
    },
  });
}

export function useDeactivatePaymentLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkId: string) => paymentLinksService.deactivatePaymentLink(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_LINKS_QUERY_KEY] });
      toast.success('Payment link deactivated');
    },
    onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to deactivate payment link');
    },
  });
}
