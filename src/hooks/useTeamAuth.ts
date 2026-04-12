import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamAuthService, LoginCredentials } from '@/services/teamAuth.service';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';

export function useTeamLogin() {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => teamAuthService.login(credentials),
    onSuccess: () => {
      toast.success('Logged in successfully');
    },
    onError: (error: any) => {
      if (error.response?.status === 423) {
        const detail = error.response.data?.detail;
        toast.error(detail?.message || 'Account is locked');
      } else if (error.response?.status === 401) {
        toast.error('Invalid email or password');
      } else {
        toast.error(extractErrorMessage(error, 'Login failed'));
      }
    },
  });
}

export function useTeamLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => teamAuthService.logout(),
    onSuccess: () => {
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Logout failed'));
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => teamAuthService.forgotPassword(email),
    onSuccess: () => {
      toast.success('If an account exists, a reset link has been sent');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to send reset link'));
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      teamAuthService.resetPassword(token, newPassword),
    onSuccess: () => {
      toast.success('Password reset successfully');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to reset password'));
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => teamAuthService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to change password'));
    },
  });
}

export function useCurrentTeamMember() {
  return teamAuthService.getCurrentUser();
}

export function useIsTeamAuthenticated() {
  return teamAuthService.isAuthenticated();
}
