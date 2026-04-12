import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { teamAuthService } from '@/services/teamAuth.service';

export interface MemberPermissions {
  member_id: string;
  role: string;
  role_permissions: string[];
  custom_granted: string[];
  custom_revoked: string[];
  effective_permissions: string[];
}

export interface Permission {
  code: string;
  name: string;
  description: string;
  category: string;
}

export const PERMISSIONS_QUERY_KEY = 'team-permissions';

// Hook to get all available permissions
export function useAllPermissions() {
  return useQuery({
    queryKey: [PERMISSIONS_QUERY_KEY, 'all'],
    queryFn: async () => {
      const response = await apiClient.get<{ permissions: Permission[] }>(
        '/api/v1/team/permissions'
      );
      return response.permissions;
    },
    staleTime: Infinity, // Permissions list doesn't change often
  });
}

// Hook to get permissions for a specific role
export function useRolePermissions(role: string) {
  return useQuery({
    queryKey: [PERMISSIONS_QUERY_KEY, 'role', role],
    queryFn: async () => {
      const response = await apiClient.get<{ role: string; permissions: Permission[] }>(
        `/api/v1/team/roles/${role}/permissions`
      );
      return response.permissions;
    },
    enabled: !!role,
    staleTime: Infinity,
  });
}

// Hook to get permissions for a specific member
export function useMemberPermissions(memberId?: string) {
  const currentUser = teamAuthService.getCurrentUser();
  const targetMemberId = memberId || currentUser?.id;

  return useQuery({
    queryKey: [PERMISSIONS_QUERY_KEY, 'member', targetMemberId],
    queryFn: async () => {
      if (!targetMemberId) throw new Error('No member ID available');
      return apiClient.get<MemberPermissions>(
        `/api/v1/team/members/${targetMemberId}/permissions`
      );
    },
    enabled: !!targetMemberId,
  });
}

// Main hook for permission checking
export function usePermissions() {
  const currentUser = teamAuthService.getCurrentUser();
  const { data: memberPermissions, isLoading } = useMemberPermissions();

  const permissions = memberPermissions?.effective_permissions || [];

  const hasPermission = (required: string): boolean => {
    // Owner has all permissions
    if (permissions.includes('*')) return true;

    // Exact match
    if (permissions.includes(required)) return true;

    // Category wildcard match (e.g., "payments.*" matches "payments.view")
    const category = required.split('.')[0];
    if (permissions.includes(`${category}.*`)) return true;

    return false;
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some((perm) => hasPermission(perm));
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every((perm) => hasPermission(perm));
  };

  const hasRole = (role: string): boolean => {
    return currentUser?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return currentUser ? roles.includes(currentUser.role) : false;
  };

  return {
    permissions,
    loading: isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    currentUser,
    memberPermissions,
  };
}
