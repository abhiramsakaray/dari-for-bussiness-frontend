import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { withdrawalsService } from '../services/withdrawals.service';
import { CreateWithdrawalRequest, WithdrawalFilters } from '../types/api.types';
import { toast } from 'sonner';
import { extractErrorMessage } from '../lib/utils';

export function useWithdrawalBalances() {
  return useQuery({
    queryKey: ['withdrawals', 'balances'],
    queryFn: withdrawalsService.getBalances,
  });
}

export function useWithdrawalLimits() {
  return useQuery({
    queryKey: ['withdrawals', 'limits'],
    queryFn: withdrawalsService.getLimits,
  });
}

export function useWithdrawals(params?: WithdrawalFilters & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['withdrawals', 'list', params],
    queryFn: () => withdrawalsService.getAll(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWithdrawalRequest) => withdrawalsService.create(data),
    onSuccess: (newWithdrawal) => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals', 'balances'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals', 'limits'] });
      toast.success(`Withdrawal of ${newWithdrawal.amount} ${newWithdrawal.token} initiated`);
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to create withdrawal"));
    }
  });
}

export function useCancelWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => withdrawalsService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals', 'balances'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals', 'list'] });
      toast.success("Withdrawal cancelled");
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, "Failed to cancel withdrawal"));
    }
  });
}
