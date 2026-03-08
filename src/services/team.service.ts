import { apiClient } from '@/lib/api-client';
import { generateIdempotencyKey } from '@/lib/utils';
import {
  TeamMember,
  InviteTeamMemberInput,
  UpdateTeamMemberInput,
  RolePermissions,
  PaginatedResponse,
} from '@/types/api.types';

export class TeamService {
  private basePath = '/team';

  async inviteTeamMember(input: InviteTeamMemberInput): Promise<TeamMember> {
    return apiClient.post<TeamMember>(`${this.basePath}/invite`, input, {
      idempotencyKey: generateIdempotencyKey(),
    });
  }

  async listTeamMembers(params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<TeamMember>> {
    return apiClient.get<PaginatedResponse<TeamMember>>(this.basePath, { params });
  }

  async getTeamMember(memberId: string): Promise<TeamMember> {
    return apiClient.get<TeamMember>(`${this.basePath}/${memberId}`);
  }

  async updateTeamMember(memberId: string, input: UpdateTeamMemberInput): Promise<TeamMember> {
    return apiClient.patch<TeamMember>(`${this.basePath}/${memberId}`, input);
  }

  async removeTeamMember(memberId: string): Promise<void> {
    return apiClient.delete<void>(`${this.basePath}/${memberId}`);
  }

  async resendInvite(memberId: string): Promise<void> {
    return apiClient.post<void>(`${this.basePath}/${memberId}/resend-invite`);
  }

  async getRolePermissions(): Promise<RolePermissions[]> {
    return apiClient.get<RolePermissions[]>(`${this.basePath}/roles/permissions`);
  }

  async acceptInvite(token: string): Promise<void> {
    return apiClient.post<void>(`${this.basePath}/accept-invite`, { token });
  }
}

export const teamService = new TeamService();
