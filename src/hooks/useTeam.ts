import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teamService } from '@/services/team.service';
import { InviteTeamMemberInput, UpdateTeamMemberInput } from '@/types/api.types';
import { toast } from 'sonner';

export const TEAM_QUERY_KEY = 'team';

export function useTeamMembers(page = 1, pageSize = 50) {
  return useQuery({
    queryKey: [TEAM_QUERY_KEY, { page, pageSize }],
    queryFn: () => teamService.listTeamMembers({ page, page_size: pageSize }),
  });
}

export function useTeamMember(memberId: string) {
  return useQuery({
    queryKey: [TEAM_QUERY_KEY, memberId],
    queryFn: () => teamService.getTeamMember(memberId),
    enabled: !!memberId,
  });
}

export function useRolePermissions() {
  return useQuery({
    queryKey: [TEAM_QUERY_KEY, 'permissions'],
    queryFn: () => teamService.getRolePermissions(),
    staleTime: Infinity, // Permissions don't change often
  });
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: InviteTeamMemberInput) => teamService.inviteTeamMember(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEY] });
      toast.success('Invitation sent successfully');
    },
    onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to send invitation');
    },
  });
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, input }: { memberId: string; input: UpdateTeamMemberInput }) =>
      teamService.updateTeamMember(memberId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEY, data.id] });
      toast.success('Team member updated');
    },
    onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to update team member');
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => teamService.removeTeamMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEY] });
      toast.success('Team member removed');
    },
    onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to remove team member');
    },
  });
}

export function useResendInvite() {
  return useMutation({
    mutationFn: (memberId: string) => teamService.resendInvite(memberId),
    onSuccess: () => {
      toast.success('Invitation resent');
    },
    onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to resend invitation');
    },
  });
}

export function useAcceptInvite() {
  return useMutation({
    mutationFn: (token: string) => teamService.acceptInvite(token),
    onSuccess: () => {
      toast.success('Invitation accepted');
    },
    onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
      toast.error(error.response?.data?.detail || 'Failed to accept invitation');
    },
  });
}
