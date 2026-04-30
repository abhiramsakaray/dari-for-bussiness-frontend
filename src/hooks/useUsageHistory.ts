import { useQuery } from '@tanstack/react-query';
import { usageHistoryService } from '../services/usage-history.service';

export function useUsageHistory(limit: number = 6) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['usage-history', limit],
    queryFn: () => usageHistoryService.getHistory(limit),
    retry: 1,
    staleTime: 60000, // Cache for 1 minute
  });

  return {
    historyData: data,
    isLoading,
    error,
    refetch,
  };
}
