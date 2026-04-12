# Backend API Quick Reference - Team RBAC

## Priority APIs to Implement

### 🔴 Critical (Must Have First)

#### 1. Team Member Authentication
```
POST /api/v1/auth/team/login
POST /api/v1/auth/team/logout
POST /api/v1/auth/team/refresh
```

#### 2. Team Member Account Creation
```
POST /api/v1/team/members
- Creates account with password
- Returns temporary password if auto-generated
- Sends invitation email
```

#### 3. Permission Checking Middleware
```python
@require_permissions("payments.create")
async def create_payment(...):
    pass
```

#### 4. Get Member Permissions
```
GET /api/v1/team/members/{id}/permissions
- Returns effective permissions (role + custom)
```

### 🟡 Important (Phase 2)

#### 5. Password Management
```
POST /api/v1/auth/team/forgot-password
POST /api/v1/auth/team/reset-password
POST /api/v1/auth/team/change-password
POST /api/v1/team/members/{id}/reset-password (admin)
```

#### 6. Permission Management
```
GET /api/v1/team/permissions (list all)
GET /api/v1/team/roles/{role}/permissions
POST /api/v1/team/members/{id}/permissions (grant/revoke)
```

#### 7. Session Management
```
GET /api/v1/team/members/{id}/sessions
POST /api/v1/team/members/{id}/revoke-sessions
```

### 🟢 Nice to Have (Phase 3)

#### 8. Activity Logging
```
GET /api/v1/team/activity-logs
- Automatic logging via middleware
```

---

## Database Schema Priority

### Must Create First:
1. `team_members` table updates (add password_hash, auth fields)
2. `permissions` table
3. `role_permissions` table
4. `team_member_sessions` table

### Can Add Later:
5. `team_member_permissions` table (custom permissions)
6. `activity_logs` table

---

## Permission Codes to Seed

```javascript
// Minimum viable permissions
const CORE_PERMISSIONS = [
  // Payments
  'payments.view',
  'payments.create',
  'payments.refund',
  
  // Invoices
  'invoices.view',
  'invoices.create',
  'invoices.update',
  'invoices.delete',
  
  // Team
  'team.view',
  'team.create',
  'team.update',
  'team.delete',
  
  // API Keys
  'api_keys.view',
  'api_keys.manage',
  
  // Analytics
  'analytics.view',
  
  // Settings
  'settings.view',
  'settings.update',
];
```

---

## Example Request/Response

### Create Team Member
```bash
POST /api/v1/team/members
Authorization: Bearer <admin_token>

{
  "email": "john@company.com",
  "name": "John Doe",
  "role": "developer",
  "auto_generate_password": true,
  "send_invite_email": true
}

# Response
{
  "id": "uuid",
  "email": "john@company.com",
  "name": "John Doe",
  "role": "developer",
  "temporary_password": "Abc123!@#Xyz",
  "invite_token": "token_here",
  "created_at": "2024-01-15T10:00:00Z"
}
```

### Team Member Login
```bash
POST /api/v1/auth/team/login

{
  "email": "john@company.com",
  "password": "Abc123!@#Xyz"
}

# Response
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 3600,
  "team_member": {
    "id": "uuid",
    "email": "john@company.com",
    "name": "John Doe",
    "role": "developer",
    "merchant_id": "uuid",
    "merchant_name": "Acme Corp",
    "permissions": ["payments.view", "api_keys.manage", "webhooks.manage"]
  }
}
```

### Check Permissions
```bash
GET /api/v1/team/members/{id}/permissions
Authorization: Bearer <token>

# Response
{
  "role": "developer",
  "role_permissions": ["payments.view", "api_keys.manage"],
  "custom_granted": ["payments.refund"],
  "custom_revoked": [],
  "effective_permissions": ["payments.view", "api_keys.manage", "payments.refund"]
}
```

---

## Implementation Notes

### JWT Token Structure
```json
{
  "sub": "team_member_id",
  "email": "john@company.com",
  "merchant_id": "uuid",
  "role": "developer",
  "permissions": ["payments.view", "api_keys.manage"],
  "type": "team_member",
  "exp": 1234567890
}
```

### Permission Check Logic
```python
def has_permission(user_permissions: List[str], required: str) -> bool:
    # Exact match
    if required in user_permissions:
        return True
    
    # Wildcard (super admin)
    if '*' in user_permissions:
        return True
    
    # Category wildcard (e.g., 'payments.*')
    category = required.split('.')[0]
    if f"{category}.*" in user_permissions:
        return True
    
    return False
```

### Activity Logging
```python
# Log every state-changing action
await log_activity(
    team_member_id=current_user.id,
    action='payment.create',
    resource_type='payment',
    resource_id=payment.id,
    details={'amount': payment.amount},
    request=request
)
```

---

## Testing Endpoints

```bash
# 1. Create team member (as admin)
curl -X POST http://localhost:8000/api/v1/team/members \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","role":"developer","auto_generate_password":true}'

# 2. Login as team member
curl -X POST http://localhost:8000/api/v1/auth/team/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"<temp_password>"}'

# 3. Get permissions
curl -X GET http://localhost:8000/api/v1/team/members/<id>/permissions \
  -H "Authorization: Bearer <team_member_token>"

# 4. Try protected endpoint
curl -X POST http://localhost:8000/api/v1/payments \
  -H "Authorization: Bearer <team_member_token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"currency":"USD"}'
```

---

## Questions for Backend Team?

1. Which database are you using? (PostgreSQL, MySQL, etc.)
2. Which authentication library? (JWT, OAuth, etc.)
3. Do you have existing middleware for auth?
4. Do you want 2FA support in first version?
5. Session storage preference? (Database, Redis, etc.)
6. Rate limiting implementation? (Redis, in-memory, etc.)

