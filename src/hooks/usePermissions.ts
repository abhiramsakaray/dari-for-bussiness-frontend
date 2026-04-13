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
      try {
        const response = await apiClient.get<{ permissions: Permission[] }>(
          '/api/v1/team/roles/permissions'
        );
        return response.permissions;
      } catch (error: any) {
        console.error('Error fetching all permissions:', error);
        
        // If we get a 401/403, return a default set of permissions for display
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          console.warn('Using default permissions list due to auth error');
          
          // Return a basic set of permissions for UI display
          return [
            { code: 'payments.read', name: 'View Payments', description: 'View payment transactions', category: 'payments' },
            { code: 'payments.write', name: 'Create Payments', description: 'Create and manage payments', category: 'payments' },
            { code: 'invoices.read', name: 'View Invoices', description: 'View invoices', category: 'invoices' },
            { code: 'invoices.write', name: 'Manage Invoices', description: 'Create and manage invoices', category: 'invoices' },
            { code: 'team.read', name: 'View Team', description: 'View team members', category: 'team' },
            { code: 'team.write', name: 'Manage Team', description: 'Manage team members and roles', category: 'team' },
            { code: 'analytics.read', name: 'View Analytics', description: 'View analytics and reports', category: 'analytics' },
            { code: 'settings.read', name: 'View Settings', description: 'View account settings', category: 'settings' },
            { code: 'settings.write', name: 'Manage Settings', description: 'Manage account settings', category: 'settings' },
          ] as Permission[];
        }
        
        throw error;
      }
    },
    staleTime: Infinity, // Permissions list doesn't change often
    retry: false, // Don't retry on auth errors
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
    retry: false,
  });
}

// Hook to get permissions for a specific member
export function useMemberPermissions(memberId?: string) {
  const currentUser = teamAuthService.getCurrentUser();
  const targetMemberId = memberId || currentUser?.id;

  return useQuery({
    queryKey: [PERMISSIONS_QUERY_KEY, 'member', targetMemberId],
    queryFn: async () => {
      if (!targetMemberId) {
        console.error('useMemberPermissions: No member ID available');
        throw new Error('No member ID available');
      }
      
      console.log('Fetching permissions for member:', targetMemberId);
      
      try {
        // Get member details which includes role and permissions
        console.log('Fetching member details from /api/v1/team/' + targetMemberId);
        const member = await apiClient.get<any>(
          `/api/v1/team/${targetMemberId}`
        );
        
        console.log('Member details received:', member);
        
        // Try to get role permissions - this might fail with 401 for merchants
        let rolePermissions: string[] = [];
        try {
          console.log('Fetching role permissions for role:', member.role);
          const rolePerms = await apiClient.get<{ role: string; permissions: Permission[] }>(
            `/api/v1/team/roles/${member.role}/permissions`
          );
          rolePermissions = rolePerms.permissions.map((p: Permission) => p.code);
          console.log('Role permissions received:', rolePermissions);
        } catch (roleError: any) {
          // If role permissions fetch fails, use default permissions based on role
          console.warn('Could not fetch role permissions, using defaults. Error:', roleError?.response?.status);
          
          // Default permissions by role (fallback)
          const defaultPermissions: Record<string, string[]> = {
            owner: ['*'],
            admin: ['payments.*', 'team.*', 'settings.*', 'analytics.*'],
            developer: ['payments.*', 'webhooks.*', 'api_keys.*'],
            finance: ['payments.read', 'invoices.*', 'analytics.read'],
            viewer: ['payments.read', 'analytics.read'],
          };
          
          rolePermissions = defaultPermissions[member.role] || [];
          console.log('Using default permissions:', rolePermissions);
        }
        
        // Construct member permissions response
        const result = {
          member_id: targetMemberId,
          role: member.role,
          role_permissions: rolePermissions,
          custom_granted: member.custom_granted_permissions || [],
          custom_revoked: member.custom_revoked_permissions || [],
          effective_permissions: member.effective_permissions || rolePermissions,
        } as MemberPermissions;
        
        console.log('Final member permissions:', result);
        return result;
      } catch (error: any) {
        console.error('Error fetching member permissions:', error);
        console.error('Error details:', {
          status: error?.response?.status,
          data: error?.response?.data,
          message: error?.message,
        });
        throw error;
      }
    },
    enabled: !!targetMemberId,
    retry: false,
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
