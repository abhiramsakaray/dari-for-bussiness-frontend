import { useQuery, useMutation } from '@tanstack/react-query';
import { usageLimitsService, CheckLimitRequest } from '../services/usage-limits.service';
import { toast } from 'sonner';

/** Safely extract a human-readable string from an error. */
function getErrorMessage(error: any): string {
  const detail = error?.response?.data?.detail;
  if (!detail) return error?.message || 'An unexpected error occurred';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((e: any) => e?.msg ?? String(e)).join('; ');
  }
  return String(detail);
}

export function useUsageLimits() {
  const { data: usageData, isLoading, error, refetch } = useQuery({
    queryKey: ['usage-limits'],
    queryFn: usageLimitsService.getUsage,
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
  });

  const checkLimitMutation = useMutation({
    mutationFn: (request: CheckLimitRequest) => usageLimitsService.checkLimit(request),
    onError: (error: any) => {
      toast.error(getErrorMessage(error) || 'Failed to check limit');
    },
  });

  return {
    usageData,
    isLoading,
    error,
    refetch,
    checkLimit: checkLimitMutation.mutateAsync,
    isCheckingLimit: checkLimitMutation.isPending,
  };
}
