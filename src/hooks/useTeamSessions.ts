import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { teamAuthService } from '@/services/teamAuth.service';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';

export interface TeamSession {
  id: string;
  ip_address: string;
  user_agent: string;
  last_activity: string;
  expires_at: string;
  is_current: boolean;
}

export const SESSIONS_QUERY_KEY = 'team-sessions';

export function useTeamSessions(memberId?: string) {
  const currentUser = teamAuthService.getCurrentUser();
  const targetMemberId = memberId || currentUser?.id;

  return useQuery({
    queryKey: [SESSIONS_QUERY_KEY, targetMemberId],
    queryFn: async () => {
      if (!targetMemberId) throw new Error('No member ID available');
      const response = await apiClient.get<{ sessions: TeamSession[] }>(
        `/api/v1/team/members/${targetMemberId}/sessions`
      );
      return response.sessions;
    },
    enabled: !!targetMemberId,
  });
}

export function useRevokeAllSessions() {
  const queryClient = useQueryClient();
  const currentUser = teamAuthService.getCurrentUser();

  return useMutation({
    mutationFn: async (memberId?: string) => {
      const targetMemberId = memberId || currentUser?.id;
      if (!targetMemberId) throw new Error('No member ID available');

      const response = await apiClient.post<{ message: string; sessions_revoked: number }>(
        `/api/v1/team/members/${targetMemberId}/revoke-sessions`,
        {}
      );
      return response;
    },
    onSuccess: (data, memberId) => {
      queryClient.invalidateQueries({ queryKey: [SESSIONS_QUERY_KEY] });
      toast.success(`${data.sessions_revoked} session(s) revoked`);

      // If revoking own sessions, logout
      if (!memberId || memberId === currentUser?.id) {
        setTimeout(() => {
          teamAuthService.logout();
          window.location.href = '#/team/login';
        }, 1000);
      }
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to revoke sessions'));
    },
  });
}
