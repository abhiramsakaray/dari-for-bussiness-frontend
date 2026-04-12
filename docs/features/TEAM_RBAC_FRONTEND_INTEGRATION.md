# Team RBAC Frontend Integration - Implementation Complete

## Overview

The Team RBAC (Role-Based Access Control) system has been successfully integrated into your frontend application. This document provides a complete guide on how to use the new features.

## What's Been Implemented

### 1. Services
- **`teamAuth.service.ts`** - Authentication service with JWT token management, auto-refresh, and session handling
- **`team.service.ts`** - Updated with RBAC endpoints for permissions and activity logs

### 2. Hooks
- **`useTeamAuth.ts`** - Authentication hooks (login, logout, password management)
- **`usePermissions.ts`** - Permission checking hooks with wildcard support
- **`useTeamSessions.ts`** - Session management hooks
- **`useTeam.ts`** - Existing team management hooks (already in place)

### 3. Components
- **`TeamLogin.tsx`** - Login page for team members
- **`ProtectedTeamRoute.tsx`** - Route guard with permission/role checking
- **`PermissionGate.tsx`** - Component-level permission gating
- **`SessionManager.tsx`** - Session management UI
- **`TeamDashboard.tsx`** - Example dashboard with permission-based UI
- **`Unauthorized.tsx`** - Access denied page

### 4. Utilities
- **`teamErrorHandler.ts`** - Error handling utilities for API errors

## Quick Start

### 1. Add Routes to Your App

Update your main routing file (e.g., `App.tsx` or router configuration):

```typescript
import { TeamLogin } from '@/app/components/team/TeamLogin';
import { TeamDashboard } from '@/app/components/team/TeamDashboard';
import { ProtectedTeamRoute } from '@/app/components/team/ProtectedTeamRoute';
import { Unauthorized } from '@/app/components/team/Unauthorized';
import { SessionManager } from '@/app/components/team/SessionManager';

// Add these routes
<Route path="/team/login" element={<TeamLogin />} />
<Route path="/team/unauthorized" element={<Unauthorized />} />

<Route
  path="/team/dashboard"
  element={
    <ProtectedTeamRoute>
      <TeamDashboard />
    </ProtectedTeamRoute>
  }
/>

<Route
  path="/team/sessions"
  element={
    <ProtectedTeamRoute>
      <SessionManager />
    </ProtectedTeamRoute>
  }
/>

// Protect existing routes with permissions
<Route
  path="/payments"
  element={
    <ProtectedTeamRoute requiredPermissions={['payments.view']}>
      <PaymentsPage />
    </ProtectedTeamRoute>
  }
/>

<Route
  path="/team/members"
  element={
    <ProtectedTeamRoute requiredPermissions={['team.view']}>
      <TeamMembersPage />
    </ProtectedTeamRoute>
  }
/>
```

### 2. Using Permission Checks in Components

#### Check Permissions in Code

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Check single permission
  if (hasPermission('payments.create')) {
    // Show create button
  }

  // Check any of multiple permissions
  if (hasAnyPermission(['payments.create', 'invoices.create'])) {
    // Show create menu
  }

  // Check all permissions required
  if (hasAllPermissions(['payments.view', 'payments.export'])) {
    // Show export button
  }

  return <div>...</div>;
}
```

#### Hide/Show UI Elements

```typescript
import { PermissionGate } from '@/app/components/team/PermissionGate';

function MyComponent() {
  return (
    <div>
      {/* Only show to users with payments.create permission */}
      <PermissionGate requiredPermissions={['payments.create']}>
        <Button>Create Payment</Button>
      </PermissionGate>

      {/* Show to users with ANY of these permissions */}
      <PermissionGate 
        requiredPermissions={['payments.view', 'invoices.view']}
        requireAll={false}
      >
        <FinancialDashboard />
      </PermissionGate>

      {/* Show to users with ALL of these permissions */}
      <PermissionGate 
        requiredPermissions={['payments.view', 'payments.export']}
        requireAll={true}
      >
        <ExportButton />
      </PermissionGate>

      {/* Show fallback for users without permission */}
      <PermissionGate 
        requiredPermissions={['admin.access']}
        fallback={<p>Admin access required</p>}
      >
        <AdminPanel />
      </PermissionGate>
    </div>
  );
}
```

#### Check Roles

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { hasRole, hasAnyRole } = usePermissions();

  if (hasRole('owner')) {
    // Owner-only features
  }

  if (hasAnyRole(['owner', 'admin'])) {
    // Admin-level features
  }

  return <div>...</div>;
}
```

### 3. Authentication Flow

```typescript
import { useTeamLogin, useTeamLogout } from '@/hooks/useTeamAuth';

function LoginComponent() {
  const loginMutation = useTeamLogin();

  const handleLogin = () => {
    loginMutation.mutate(
      { email: 'user@example.com', password: 'password' },
      {
        onSuccess: () => {
          navigate('/team/dashboard');
        },
      }
    );
  };

  return <button onClick={handleLogin}>Login</button>;
}

function LogoutButton() {
  const logoutMutation = useTeamLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/team/login');
      },
    });
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

### 4. Session Management

```typescript
import { useTeamSessions, useRevokeAllSessions } from '@/hooks/useTeamSessions';

function SessionsComponent() {
  const { data: sessions } = useTeamSessions();
  const revokeAllMutation = useRevokeAllSessions();

  const handleRevokeAll = () => {
    if (confirm('Revoke all sessions? You will be logged out.')) {
      revokeAllMutation.mutate();
    }
  };

  return (
    <div>
      <h2>Active Sessions: {sessions?.length}</h2>
      <button onClick={handleRevokeAll}>Revoke All</button>
    </div>
  );
}
```

## Available Permissions

### Payment Permissions
- `payments.view` - View payment transactions
- `payments.create` - Create payment sessions
- `payments.refund` - Process refunds
- `payments.export` - Export payment data

### Invoice Permissions
- `invoices.view` - View invoices
- `invoices.create` - Create invoices
- `invoices.update` - Update invoices
- `invoices.delete` - Delete invoices
- `invoices.send` - Send invoices to customers

### Payment Link Permissions
- `payment_links.view` - View payment links
- `payment_links.create` - Create payment links
- `payment_links.update` - Update payment links
- `payment_links.delete` - Delete payment links

### Subscription Permissions
- `subscriptions.view` - View subscriptions
- `subscriptions.create` - Create subscription plans
- `subscriptions.update` - Update subscriptions
- `subscriptions.cancel` - Cancel subscriptions

### Team Permissions
- `team.view` - View team members
- `team.create` - Add team members
- `team.update` - Update team members
- `team.delete` - Remove team members
- `team.view_logs` - View activity logs

### API & Integration Permissions
- `api_keys.view` - View API keys
- `api_keys.manage` - Create/delete API keys
- `webhooks.view` - View webhooks
- `webhooks.manage` - Manage webhooks

### Analytics Permissions
- `analytics.view` - View analytics dashboard
- `analytics.export` - Export analytics data

### Settings Permissions
- `settings.view` - View settings
- `settings.update` - Update settings
- `settings.billing` - Manage billing and plans

### Wildcard Permissions
- `*` - All permissions (Owner role)
- `payments.*` - All payment permissions
- `invoices.*` - All invoice permissions
- etc.

## Role Hierarchy

1. **Owner** - Full access (`*`)
2. **Admin** - Most permissions except some withdrawals
3. **Developer** - API/webhook management, view-only for business data
4. **Finance** - Full payment/invoice/withdrawal access
5. **Viewer** - View-only access to all resources

## Environment Variables

Make sure your `.env` file includes:

```bash
VITE_API_URL=http://localhost:8000  # Development
# VITE_API_URL=https://api.yourapp.com  # Production
```

## Token Storage

Tokens are stored in localStorage:
- `team_access_token` - JWT access token (1 hour expiry)
- `team_refresh_token` - Refresh token (7 days expiry)
- `team_member` - Current user info

For production, consider using httpOnly cookies for enhanced security.

## Auto Token Refresh

The authentication service automatically:
1. Adds access token to all requests
2. Intercepts 401 errors
3. Attempts to refresh the token
4. Retries the original request
5. Redirects to login if refresh fails

## Error Handling

```typescript
import { handleTeamApiError } from '@/utils/teamErrorHandler';

try {
  await someApiCall();
} catch (error) {
  const errorMessage = handleTeamApiError(error);
  toast.error(errorMessage);
}
```

## Security Best Practices

1. **Always check permissions on backend** - Frontend checks are for UX only
2. **Use HTTPS in production** - Protect tokens in transit
3. **Implement CSRF protection** - Add CSRF tokens to state-changing requests
4. **Monitor sessions** - Use SessionManager to track active sessions
5. **Revoke sessions on password change** - Force re-authentication
6. **Set short token expiry** - 1 hour for access tokens
7. **Rotate refresh tokens** - Issue new refresh token on each refresh

## Testing

### Test Login Flow
```bash
# Navigate to http://localhost:5173/team/login
# Enter credentials
# Should redirect to /team/dashboard
```

### Test Permission Checks
```bash
# Login as different roles
# Verify UI elements show/hide based on permissions
# Verify routes are protected
```

### Test Session Management
```bash
# Navigate to /team/sessions
# Verify active sessions are listed
# Test "Revoke All Sessions"
# Should logout and redirect to login
```

## Troubleshooting

### Token Refresh Loop
If you experience infinite refresh attempts:
- Check that `_retry` flag is set correctly
- Verify refresh token is valid
- Check backend refresh endpoint

### Permission Check Fails
If permission checks don't work:
- Verify user is authenticated
- Check that permissions are loaded (not loading state)
- Verify wildcard matching logic
- Check backend returns correct permissions

### CORS Errors
If API requests are blocked:
- Verify VITE_API_URL is correct
- Check backend CORS configuration
- Ensure credentials are included in requests

## Next Steps

1. **Add more protected routes** - Wrap existing routes with `ProtectedTeamRoute`
2. **Add permission gates** - Use `PermissionGate` to hide/show UI elements
3. **Implement activity logging** - Track user actions for audit trails
4. **Add password reset flow** - Create UI for forgot/reset password
5. **Add session timeout warning** - Warn users before session expires
6. **Implement MFA** - Add two-factor authentication for enhanced security

## Support

For issues or questions:
- Check the backend API documentation at `/api/v1/docs`
- Review activity logs for debugging
- Contact backend team for permission-related issues

---

**Implementation Date**: April 12, 2026  
**Version**: 1.0.0  
**Status**: ✅ Complete and Ready to Use
