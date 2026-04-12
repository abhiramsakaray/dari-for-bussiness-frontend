import React from 'react';
import { Navigate } from 'react-router-dom';
import { teamAuthService } from '@/services/teamAuth.service';
import { usePermissions } from '@/hooks/usePermissions';

interface ProtectedTeamRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  requireAll?: boolean;
}

export const ProtectedTeamRoute: React.FC<ProtectedTeamRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  requireAll = false,
}) => {
  const { hasAnyPermission, hasAllPermissions, hasAnyRole, loading } = usePermissions();

  // Check authentication
  if (!teamAuthService.isAuthenticated()) {
    return <Navigate to="/team/login" replace />;
  }

  // Show loading state while checking permissions
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check role requirements
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <Navigate to="/team/unauthorized" replace />;
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      return <Navigate to="/team/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};
