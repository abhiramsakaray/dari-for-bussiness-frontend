import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feeCollectionService } from '../services/fee-collection.service';

export function usePlatformWallets() {
  return useQuery({
    queryKey: ['platform-wallets'],
    queryFn: () => feeCollectionService.getPlatformWallets(),
    staleTime: 300000, // Cache for 5 minutes
  });
}

export function useFeeStats(days: number = 30) {
  return useQuery({
    queryKey: ['fee-stats', days],
    queryFn: () => feeCollectionService.getFeeStats(days),
    staleTime: 60000, // Cache for 1 minute
  });
}

export function useMerchantFeeReport(
  merchantId: string,
  startDate: string,
  endDate: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['merchant-fee-report', merchantId, startDate, endDate],
    queryFn: () => feeCollectionService.getMerchantFeeReport(merchantId, startDate, endDate),
    enabled: enabled && !!merchantId && !!startDate && !!endDate,
    staleTime: 60000,
  });
}

export function useCollectFees() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ merchantId, date }: { merchantId: string; date: string }) =>
      feeCollectionService.collectFees(merchantId, date),
    onSuccess: () => {
      // Invalidate fee stats to refresh data
      queryClient.invalidateQueries({ queryKey: ['fee-stats'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-fee-report'] });
    },
  });
}

export function useCollectAllFees() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (date?: string) => feeCollectionService.collectAllFees(date),
    onSuccess: () => {
      // Invalidate all fee-related queries
      queryClient.invalidateQueries({ queryKey: ['fee-stats'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-fee-report'] });
    },
  });
}
