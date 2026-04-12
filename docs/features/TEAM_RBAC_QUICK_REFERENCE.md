# Team RBAC Quick Reference Card

## 🚀 Quick Start

### 1. Login
```typescript
import { useTeamLogin } from '@/hooks/useTeamAuth';

const loginMutation = useTeamLogin();
loginMutation.mutate({ email, password });
```

### 2. Protect Routes
```typescript
import { ProtectedTeamRoute } from '@/app/components/team/ProtectedTeamRoute';

<Route
  path="/payments"
  element={
    <ProtectedTeamRoute requiredPermissions={['payments.view']}>
      <PaymentsPage />
    </ProtectedTeamRoute>
  }
/>
```

### 3. Hide/Show UI
```typescript
import { PermissionGate } from '@/app/components/team/PermissionGate';

<PermissionGate requiredPermissions={['payments.create']}>
  <Button>Create Payment</Button>
</PermissionGate>
```

### 4. Check Permissions in Code
```typescript
import { usePermissions } from '@/hooks/usePermissions';

const { hasPermission } = usePermissions();

if (hasPermission('payments.create')) {
  // Show feature
}
```

## 📋 Common Patterns

### Pattern 1: Protected Page
```typescript
<Route
  path="/admin"
  element={
    <ProtectedTeamRoute requiredRoles={['owner', 'admin']}>
      <AdminPage />
    </ProtectedTeamRoute>
  }
/>
```

### Pattern 2: Conditional Rendering
```typescript
const { hasPermission, hasRole } = usePermissions();

return (
  <div>
    {hasPermission('payments.create') && <CreateButton />}
    {hasRole('owner') && <AdminPanel />}
  </div>
);
```

### Pattern 3: Multiple Permissions (ANY)
```typescript
<PermissionGate 
  requiredPermissions={['payments.view', 'invoices.view']}
  requireAll={false}
>
  <FinancialDashboard />
</PermissionGate>
```

### Pattern 4: Multiple Permissions (ALL)
```typescript
<PermissionGate 
  requiredPermissions={['payments.view', 'payments.export']}
  requireAll={true}
>
  <ExportButton />
</PermissionGate>
```

### Pattern 5: Fallback UI
```typescript
<PermissionGate 
  requiredPermissions={['admin.access']}
  fallback={<p>Admin access required</p>}
>
  <AdminPanel />
</PermissionGate>
```

## 🔑 Permission Categories

| Category | Example Permissions |
|----------|-------------------|
| **Payments** | `payments.view`, `payments.create`, `payments.refund` |
| **Invoices** | `invoices.view`, `invoices.create`, `invoices.send` |
| **Payment Links** | `payment_links.view`, `payment_links.create` |
| **Subscriptions** | `subscriptions.view`, `subscriptions.cancel` |
| **Team** | `team.view`, `team.create`, `team.delete` |
| **API Keys** | `api_keys.view`, `api_keys.manage` |
| **Webhooks** | `webhooks.view`, `webhooks.manage` |
| **Analytics** | `analytics.view`, `analytics.export` |
| **Settings** | `settings.view`, `settings.update` |

## 👥 Roles

| Role | Permissions | Use Case |
|------|------------|----------|
| **Owner** | `*` (all) | Full system access |
| **Admin** | Most permissions | Day-to-day management |
| **Developer** | API/webhooks + view | Integration work |
| **Finance** | Payments/invoices/withdrawals | Financial operations |
| **Viewer** | View-only | Read-only access |

## 🎯 Wildcard Matching

```typescript
// User has "payments.*"
hasPermission('payments.view')    // ✅ true
hasPermission('payments.create')  // ✅ true
hasPermission('payments.refund')  // ✅ true
hasPermission('invoices.view')    // ❌ false

// User has "*"
hasPermission('anything')         // ✅ true (Owner)
```

## 🔐 Authentication Hooks

```typescript
// Login
const loginMutation = useTeamLogin();
loginMutation.mutate({ email, password });

// Logout
const logoutMutation = useTeamLogout();
logoutMutation.mutate();

// Change Password
const changePasswordMutation = useChangePassword();
changePasswordMutation.mutate({ currentPassword, newPassword });

// Forgot Password
const forgotPasswordMutation = useForgotPassword();
forgotPasswordMutation.mutate(email);

// Reset Password
const resetPasswordMutation = useResetPassword();
resetPasswordMutation.mutate({ token, newPassword });

// Get Current User
const currentUser = useCurrentTeamMember();
// Returns: { id, email, name, role, merchant_id }

// Check Authentication
const isAuthenticated = useIsTeamAuthenticated();
```

## 🛡️ Permission Hooks

```typescript
const {
  permissions,              // string[] - All effective permissions
  loading,                  // boolean - Loading state
  hasPermission,           // (perm: string) => boolean
  hasAnyPermission,        // (perms: string[]) => boolean
  hasAllPermissions,       // (perms: string[]) => boolean
  hasRole,                 // (role: string) => boolean
  hasAnyRole,              // (roles: string[]) => boolean
  currentUser,             // Current user object
  memberPermissions,       // Full permission details
} = usePermissions();
```

## 📱 Session Management

```typescript
// Get Sessions
const { data: sessions } = useTeamSessions();

// Revoke All Sessions
const revokeAllMutation = useRevokeAllSessions();
revokeAllMutation.mutate();
```

## 🎨 Components

### TeamLogin
```typescript
import { TeamLogin } from '@/app/components/team/TeamLogin';
<Route path="/team/login" element={<TeamLogin />} />
```

### ProtectedTeamRoute
```typescript
import { ProtectedTeamRoute } from '@/app/components/team/ProtectedTeamRoute';

<ProtectedTeamRoute 
  requiredPermissions={['payments.view']}
  requiredRoles={['admin']}
  requireAll={false}
>
  <YourComponent />
</ProtectedTeamRoute>
```

### PermissionGate
```typescript
import { PermissionGate } from '@/app/components/team/PermissionGate';

<PermissionGate 
  requiredPermissions={['payments.create']}
  fallback={<NoAccessMessage />}
>
  <CreateButton />
</PermissionGate>
```

### SessionManager
```typescript
import { SessionManager } from '@/app/components/team/SessionManager';
<Route path="/team/sessions" element={<SessionManager />} />
```

### TeamDashboard
```typescript
import { TeamDashboard } from '@/app/components/team/TeamDashboard';
<Route path="/team/dashboard" element={<TeamDashboard />} />
```

### Unauthorized
```typescript
import { Unauthorized } from '@/app/components/team/Unauthorized';
<Route path="/team/unauthorized" element={<Unauthorized />} />
```

### PermissionManager
```typescript
import { PermissionManager } from '@/app/components/team/PermissionManager';
<PermissionManager memberId="uuid" memberName="John Doe" />
```

## 🔧 Error Handling

```typescript
import { handleTeamApiError } from '@/utils/teamErrorHandler';

try {
  await someApiCall();
} catch (error) {
  const message = handleTeamApiError(error);
  toast.error(message);
}
```

## 📦 Token Storage

```typescript
// Stored in localStorage:
team_access_token    // JWT access token (1 hour)
team_refresh_token   // Refresh token (7 days)
team_member          // User info JSON
```

## 🌐 API Endpoints

```typescript
// Authentication
POST   /api/v1/auth/team/login
POST   /api/v1/auth/team/logout
POST   /api/v1/auth/team/refresh
POST   /api/v1/auth/team/forgot-password
POST   /api/v1/auth/team/reset-password
POST   /api/v1/auth/team/change-password

// Permissions
GET    /api/v1/team/permissions
GET    /api/v1/team/roles/{role}/permissions
GET    /api/v1/team/members/{id}/permissions
POST   /api/v1/team/members/{id}/permissions

// Sessions
GET    /api/v1/team/members/{id}/sessions
POST   /api/v1/team/members/{id}/revoke-sessions

// Activity Logs
GET    /api/v1/team/activity-logs
```

## ⚡ Performance Tips

1. **Permission checks are cached** - usePermissions uses React Query
2. **Token refresh is automatic** - No manual intervention needed
3. **Permissions load once** - Stale time set to Infinity
4. **Parallel requests** - Multiple permission checks don't cause multiple API calls

## 🐛 Common Issues

### Issue: Permission check always returns false
**Solution**: Ensure user is authenticated and permissions are loaded
```typescript
const { hasPermission, loading } = usePermissions();
if (loading) return <Loading />;
if (hasPermission('payments.view')) { ... }
```

### Issue: Token refresh loop
**Solution**: Check `_retry` flag is set in interceptor

### Issue: CORS errors
**Solution**: Verify VITE_API_URL and backend CORS config

### Issue: Unauthorized after login
**Solution**: Check token is stored in localStorage with correct key

## 📚 Full Documentation

See `TEAM_RBAC_FRONTEND_INTEGRATION.md` for complete documentation.

---

**Quick Links**:
- 📖 [Full Integration Guide](./TEAM_RBAC_FRONTEND_INTEGRATION.md)
- 🏗️ [Architecture Diagram](./TEAM_RBAC_ARCHITECTURE_DIAGRAM.md)
- 📋 [Backend API Reference](./TEAM_RBAC_IMPLEMENTATION_GUIDE.md)
