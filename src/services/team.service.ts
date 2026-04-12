import { apiClient } from '@/lib/api-client';
import { generateIdempotencyKey } from '@/lib/utils';
import {
  TeamMember,
  InviteTeamMemberInput,
  UpdateTeamMemberInput,
  RolePermissions,
  PaginatedResponse,
} from '@/types/api.types';

export interface Permission {
  code: string;
  name: string;
  description: string;
  category: string;
}

export interface MemberPermissions {
  member_id: string;
  role: string;
  role_permissions: string[];
  custom_granted: string[];
  custom_revoked: string[];
  effective_permissions: string[];
}

export interface UpdatePermissionsInput {
  grant?: string[];
  revoke?: string[];
}

export interface ActivityLog {
  id: string;
  team_member: {
    id: string;
    email: string;
    name: string;
  };
  action: string;
  details: Record<string, any>;
  ip_address: string;
  created_at: string;
}

export interface CreateMemberInput {
  email: string;
  name: string;
  role: string;
  auto_generate_password?: boolean;
  password?: string;
}

export interface CreateMemberResponse extends TeamMember {
  temporary_password?: string;
  message: string;
}

export class TeamService {
  private basePath = '/team';
  private rbacBasePath = '/api/v1/team';

  // Use legacy endpoint for invitation (existing functionality)
  async inviteTeamMember(input: InviteTeamMemberInput): Promise<TeamMember> {
    return apiClient.post<TeamMember>(`${this.basePath}/invite`, input, {
      idempotencyKey: generateIdempotencyKey(),
    });
  }

  // Use new RBAC endpoint for direct account creation with password
  async createTeamMember(input: CreateMemberInput): Promise<CreateMemberResponse> {
    return apiClient.post<CreateMemberResponse>(`${this.rbacBasePath}/members`, input, {
      idempotencyKey: generateIdempotencyKey(),
    });
  }

  // Use legacy endpoint for listing (existing functionality)
  async listTeamMembers(params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<TeamMember>> {
    const response = await apiClient.get<any>(this.basePath, { params });
    
    // Backend returns 'members' but we expect 'items'
    // Transform the response to match expected structure
    return {
      items: response.members || response.items || [],
      total: response.total || 0,
      page: response.page || params?.page || 1,
      page_size: response.page_size || params?.page_size || 50,
    };
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

  // RBAC Permission Methods
  async getAllPermissions(): Promise<Permission[]> {
    const response = await apiClient.get<{ permissions: Permission[] }>(
      `${this.rbacBasePath}/permissions`
    );
    return response.permissions;
  }

  async getRolePermissionsList(role: string): Promise<Permission[]> {
    const response = await apiClient.get<{ role: string; permissions: Permission[] }>(
      `${this.rbacBasePath}/roles/${role}/permissions`
    );
    return response.permissions;
  }

  async getMemberPermissions(memberId: string): Promise<MemberPermissions> {
    return apiClient.get<MemberPermissions>(
      `${this.rbacBasePath}/members/${memberId}/permissions`
    );
  }

  async updateMemberPermissions(
    memberId: string,
    input: UpdatePermissionsInput
  ): Promise<MemberPermissions> {
    return apiClient.post<MemberPermissions>(
      `${this.rbacBasePath}/members/${memberId}/permissions`,
      input
    );
  }

  // Activity Logs
  async getActivityLogs(params?: {
    page?: number;
    page_size?: number;
    team_member_id?: string;
    action?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<ActivityLog>> {
    return apiClient.get<PaginatedResponse<ActivityLog>>(
      `${this.rbacBasePath}/activity-logs`,
      { params }
    );
  }
}

export const teamService = new TeamService();
