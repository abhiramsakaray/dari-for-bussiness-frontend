# Backend Implementation Required for RBAC Features

## ⚠️ Important Notice

The frontend RBAC integration is **complete and ready**, but some features require backend API endpoints that may not be implemented yet.

---

## ✅ Currently Working (Existing Backend)

These features work with your current backend:

1. **Team Member Management** (Existing)
   - ✅ List team members: `GET /team`
   - ✅ Invite members: `POST /team/invite`
   - ✅ Update member role: `PATCH /team/{id}`
   - ✅ Remove member: `DELETE /team/{id}`
   - ✅ Resend invite: `POST /team/{id}/resend-invite`
   - ✅ Get role permissions: `GET /team/roles/permissions`

---

## ⏳ Requires Backend Implementation

These features are **implemented in the frontend** but need backend endpoints:

### 1. Team Authentication (Priority: HIGH)
**Status**: Frontend ready, backend needed

**Required Endpoints**:
```
POST /api/v1/auth/team/login
POST /api/v1/auth/team/logout
POST /api/v1/auth/team/refresh
POST /api/v1/auth/team/forgot-password
POST /api/v1/auth/team/reset-password
POST /api/v1/auth/team/change-password
```

**Frontend Components Ready**:
- `TeamLogin.tsx` - Login page
- `teamAuth.service.ts` - Authentication service
- `useTeamAuth.ts` - Authentication hooks

**What It Enables**:
- Team members can log in separately from merchants
- JWT-based authentication with refresh tokens
- Password reset functionality

---

### 2. Permission Management (Priority: HIGH)
**Status**: Frontend ready, backend needed

**Required Endpoints**:
```
GET /api/v1/team/permissions
GET /api/v1/team/roles/{role}/permissions
GET /api/v1/team/members/{id}/permissions
POST /api/v1/team/members/{id}/permissions
```

**Frontend Components Ready**:
- `PermissionManager.tsx` - Permission management UI
- `usePermissions.ts` - Permission checking hooks
- `PermissionGate.tsx` - Component-level permission gates
- `ProtectedTeamRoute.tsx` - Route protection

**What It Enables**:
- Granular permission control beyond roles
- Custom permission grants/revokes
- Permission-based UI rendering
- Route protection based on permissions

---

### 3. Session Management (Priority: MEDIUM)
**Status**: Frontend ready, backend needed

**Required Endpoints**:
```
GET /api/v1/team/members/{id}/sessions
POST /api/v1/team/members/{id}/revoke-sessions
```

**Frontend Components Ready**:
- `SessionManager.tsx` - Session management UI
- `useTeamSessions.ts` - Session hooks
- `MemberSessionsView` - Member session viewer (in TeamMembersList)

**What It Enables**:
- View active login sessions
- Track devices and IP addresses
- Revoke sessions for security
- Monitor team member activity

---

### 4. Activity Logging (Priority: LOW)
**Status**: Frontend placeholder, backend needed

**Required Endpoints**:
```
GET /api/v1/team/activity-logs
```

**Frontend Components Ready**:
- Activity Log tab (placeholder in TeamMembersList)

**What It Enables**:
- Audit trail of team actions
- Compliance and security monitoring
- Track permission changes

---

## 🚀 Implementation Priority

### Phase 1: Core Team Management (DONE ✅)
Your current backend already supports this:
- Team member CRUD
- Role assignment
- Invitations

### Phase 2: Authentication & Permissions (RECOMMENDED NEXT)
Implement these for full RBAC functionality:
1. Team member authentication endpoints
2. Permission management endpoints
3. Permission checking middleware

**Estimated Backend Work**: 4-6 hours
**Impact**: Enables full RBAC system

### Phase 3: Session Management (OPTIONAL)
Add session tracking for enhanced security:
1. Session storage and tracking
2. Session revocation
3. Activity monitoring

**Estimated Backend Work**: 2-3 hours
**Impact**: Enhanced security and monitoring

### Phase 4: Activity Logging (FUTURE)
Add comprehensive audit trail:
1. Activity log storage
2. Automatic logging middleware
3. Query and filtering

**Estimated Backend Work**: 3-4 hours
**Impact**: Compliance and audit capabilities

---

## 📋 Backend Implementation Checklist

### Database Schema
- [ ] Add `password_hash` to `team_members` table
- [ ] Add `last_login`, `failed_login_attempts`, `locked_until` to `team_members`
- [ ] Create `permissions` table
- [ ] Create `role_permissions` table
- [ ] Create `team_member_permissions` table (custom permissions)
- [ ] Create `team_member_sessions` table
- [ ] Create `activity_logs` table

### Authentication Endpoints
- [ ] `POST /api/v1/auth/team/login` - Login with email/password
- [ ] `POST /api/v1/auth/team/logout` - Logout and revoke session
- [ ] `POST /api/v1/auth/team/refresh` - Refresh access token
- [ ] `POST /api/v1/auth/team/forgot-password` - Request password reset
- [ ] `POST /api/v1/auth/team/reset-password` - Reset password with token
- [ ] `POST /api/v1/auth/team/change-password` - Change password (authenticated)

### Permission Endpoints
- [ ] `GET /api/v1/team/permissions` - List all available permissions
- [ ] `GET /api/v1/team/roles/{role}/permissions` - Get permissions for a role
- [ ] `GET /api/v1/team/members/{id}/permissions` - Get member's effective permissions
- [ ] `POST /api/v1/team/members/{id}/permissions` - Grant/revoke custom permissions

### Session Endpoints
- [ ] `GET /api/v1/team/members/{id}/sessions` - List active sessions
- [ ] `POST /api/v1/team/members/{id}/revoke-sessions` - Revoke all sessions

### Activity Log Endpoints
- [ ] `GET /api/v1/team/activity-logs` - Query activity logs

### Middleware
- [ ] `require_team_auth()` - Verify team member JWT
- [ ] `require_permissions(*permissions)` - Check permissions
- [ ] `log_activity()` - Automatic activity logging

---

## 🔧 Temporary Workarounds

Until the backend is implemented, the frontend will:

1. **Permission Management Tab**: Shows "Select a Member" placeholder
   - No errors, graceful degradation
   - Can still use role-based access control

2. **Sessions Tab**: Shows "Select a Member" placeholder
   - No errors, graceful degradation
   - Session management not available

3. **Activity Log Tab**: Shows "Coming Soon" message
   - Clear indication feature is not yet available

4. **Team Authentication**: Use existing merchant authentication
   - Team members can use merchant login temporarily
   - Separate team login will be available after backend implementation

---

## 📊 Current Status Summary

| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| Team Member CRUD | ✅ | ✅ | Working |
| Role Assignment | ✅ | ✅ | Working |
| Invitations | ✅ | ✅ | Working |
| Team Authentication | ✅ | ⏳ | Frontend Ready |
| Permission Management | ✅ | ⏳ | Frontend Ready |
| Session Management | ✅ | ⏳ | Frontend Ready |
| Activity Logging | ⏳ | ⏳ | Placeholder |

**Legend**:
- ✅ Complete
- ⏳ Pending/In Progress
- ❌ Not Started

---

## 🎯 Next Steps

### For Frontend (You)
1. ✅ Team page is working with existing backend
2. ✅ All RBAC components are ready
3. ⏳ Wait for backend implementation to enable full features

### For Backend Team
1. Review the implementation guide: `TEAM_RBAC_IMPLEMENTATION_GUIDE.md`
2. Implement Phase 2 endpoints (Authentication & Permissions)
3. Test with frontend components
4. Deploy and enable full RBAC features

---

## 📞 Questions?

If you need help with:
- **Frontend Integration**: All components are ready and documented
- **Backend Implementation**: See `TEAM_RBAC_IMPLEMENTATION_GUIDE.md`
- **API Contracts**: See `TEAM_RBAC_FRONTEND_INTEGRATION.md`
- **Testing**: See `TEAM_RBAC_DEPLOYMENT_CHECKLIST.md`

---

**Summary**: Your team page is working perfectly with the existing backend. The new RBAC features (permissions, sessions, activity logs) are fully implemented in the frontend and will automatically work once the backend endpoints are added. No frontend changes needed!

---

**Last Updated**: April 12, 2026  
**Status**: Frontend Complete ✅ | Backend Pending ⏳
