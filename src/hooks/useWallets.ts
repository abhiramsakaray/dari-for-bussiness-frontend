import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletsService, type ChainType } from '../services/wallets.service';

export const useWallets = () => {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: walletsService.getAllWallets,
  });
};

export const useWalletDashboard = () => {
  return useQuery({
    queryKey: ['wallets', 'dashboard'],
    queryFn: walletsService.getDashboard,
  });
};

export const useWalletByChain = (chain: ChainType) => {
  return useQuery({
    queryKey: ['wallet', chain],
    queryFn: () => walletsService.getWalletByChain(chain),
    enabled: !!chain,
  });
};

export const useToggleWalletStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ walletId, isActive }: { walletId: string; isActive: boolean }) =>
      walletsService.toggleWalletStatus(walletId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
};
