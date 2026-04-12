# Team Role-Based Access Control (RBAC) Implementation Guide

## Overview
This document outlines the complete implementation for realtime role-based team management where root admins can create employee/team member accounts with separate login credentials and granular access control.

## Current State Analysisa

### What Already Exists
- Basic team invitation system (email-based invites)
- Role definitions: OWNER, ADMIN, DEVELOPER, FINANCE, VIEWER
- Team member listing and role management UI
- Basic permission checking on frontend
- Team member CRUD operations

### What's Missing
1. **Separate login accounts for team members** (currently only invitation-based)
2. **Password/credential management for team members**
3. **Realtime permission enforcement on backend**
4. **Granular permission system** (currently only role-based)
5. **Team member onboarding flow**
6. **Activity logging and audit trails**
7. **Session management per team member**
8. **Permission-based API middleware**

---

## Architecture Design

### 1. Authentication Flow

#### Current Flow (Invitation-Based)
```
Root Admin → Invite Member → Email Sent → Member Accepts → Limited Access
```

#### New Flow (Account Creation)
```
Root Admin → Create Team Member Account → Credentials Generated/Set → 
Member Logs In → Full Separate Session → Role-Based Access
```


### 2. Database Schema Requirements

#### New Tables/Fields Needed

**team_members table (enhanced)**
```sql
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    password_hash VARCHAR(255), -- NEW: For separate login
    role VARCHAR(50) NOT NULL, -- owner, admin, developer, finance, viewer
    
    -- Account status
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    invite_pending BOOLEAN DEFAULT true,
    invite_token VARCHAR(255) UNIQUE,
    invite_expires_at TIMESTAMP,
    
    -- Authentication
    last_login TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by UUID REFERENCES team_members(id), -- Who created this member
    
    UNIQUE(merchant_id, email)
);

CREATE INDEX idx_team_members_merchant ON team_members(merchant_id);
CREATE INDEX idx_team_members_email ON team_members(email);
CREATE INDEX idx_team_members_invite_token ON team_members(invite_token);
```

**permissions table (NEW)**
```sql
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'payments.view', 'invoices.create'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- payments, invoices, team, settings, etc.
    created_at TIMESTAMP DEFAULT NOW()
);
```

**role_permissions table (NEW)**
```sql
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(50) NOT NULL,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role, permission_id)
);
```


**team_member_permissions table (NEW - for custom permissions)**
```sql
CREATE TABLE team_member_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted BOOLEAN DEFAULT true, -- true = grant, false = revoke
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES team_members(id),
    UNIQUE(team_member_id, permission_id)
);
```

**activity_logs table (NEW - for audit trail)**
```sql
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- login, logout, create_payment, etc.
    resource_type VARCHAR(50), -- payment, invoice, team_member, etc.
    resource_id VARCHAR(255),
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_merchant ON activity_logs(merchant_id);
CREATE INDEX idx_activity_logs_member ON activity_logs(team_member_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);
```

**sessions table (NEW - for session management)**
```sql
CREATE TABLE team_member_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    revoked_at TIMESTAMP
);

CREATE INDEX idx_sessions_member ON team_member_sessions(team_member_id);
CREATE INDEX idx_sessions_token ON team_member_sessions(token_hash);
```

---

## Required Backend APIs

### 1. Authentication Endpoints

#### POST /api/v1/auth/team/login
**Purpose:** Team member login with email/password

**Request:**
```json
{
  "email": "john@company.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "team_member": {
    "id": "uuid",
    "email": "john@company.com",
    "name": "John Doe",
    "role": "developer",
    "merchant_id": "uuid",
    "merchant_name": "Acme Corp",
    "permissions": ["payments.view", "api_keys.manage"]
  }
}
```


#### POST /api/v1/auth/team/logout
**Purpose:** Logout and revoke session

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### POST /api/v1/auth/team/refresh
**Purpose:** Refresh access token

**Request:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "expires_in": 3600
}
```

#### POST /api/v1/auth/team/forgot-password
**Purpose:** Request password reset

**Request:**
```json
{
  "email": "john@company.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent"
}
```

#### POST /api/v1/auth/team/reset-password
**Purpose:** Reset password with token

**Request:**
```json
{
  "token": "reset_token_here",
  "new_password": "NewSecurePass123!"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

#### POST /api/v1/auth/team/change-password
**Purpose:** Change password (authenticated)

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "current_password": "OldPass123!",
  "new_password": "NewPass123!"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

---

### 2. Team Management Endpoints (Enhanced)

#### POST /api/v1/team/members
**Purpose:** Create team member with account (not just invite)

**Headers:** `Authorization: Bearer <token>`

**Permissions Required:** `team.create` (OWNER, ADMIN only)

**Request:**
```json
{
  "email": "john@company.com",
  "name": "John Doe",
  "role": "developer",
  "send_invite_email": true,
  "auto_generate_password": false,
  "password": "TempPass123!", // Optional if auto_generate_password is false
  "custom_permissions": {
    "grant": ["api_keys.manage"],
    "revoke": ["payments.refund"]
  }
}
```


**Response:**
```json
{
  "id": "uuid",
  "email": "john@company.com",
  "name": "John Doe",
  "role": "developer",
  "is_active": true,
  "invite_pending": true,
  "invite_token": "invite_token_here",
  "temporary_password": "TempPass123!", // Only if auto_generate_password is true
  "created_at": "2024-01-15T10:00:00Z"
}
```

#### GET /api/v1/team/members
**Purpose:** List all team members (existing, enhanced with permissions)

**Headers:** `Authorization: Bearer <token>`

**Permissions Required:** `team.view`

**Query Parameters:**
- `page` (int, default: 1)
- `page_size` (int, default: 50)
- `role` (string, optional filter)
- `is_active` (boolean, optional filter)
- `search` (string, optional - search by name/email)

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "email": "john@company.com",
      "name": "John Doe",
      "role": "developer",
      "is_active": true,
      "invite_pending": false,
      "last_login": "2024-01-15T10:00:00Z",
      "permissions": ["payments.view", "api_keys.manage"],
      "custom_permissions": {
        "granted": ["api_keys.manage"],
        "revoked": []
      },
      "created_at": "2024-01-10T10:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "page_size": 50,
  "pages": 1
}
```

#### GET /api/v1/team/members/{member_id}
**Purpose:** Get specific team member details

**Headers:** `Authorization: Bearer <token>`

**Permissions Required:** `team.view`

**Response:**
```json
{
  "id": "uuid",
  "email": "john@company.com",
  "name": "John Doe",
  "role": "developer",
  "is_active": true,
  "is_email_verified": true,
  "invite_pending": false,
  "last_login": "2024-01-15T10:00:00Z",
  "permissions": ["payments.view", "api_keys.manage"],
  "custom_permissions": {
    "granted": ["api_keys.manage"],
    "revoked": ["payments.refund"]
  },
  "created_at": "2024-01-10T10:00:00Z",
  "created_by": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@company.com"
  }
}
```


#### PATCH /api/v1/team/members/{member_id}
**Purpose:** Update team member (role, permissions, status)

**Headers:** `Authorization: Bearer <token>`

**Permissions Required:** `team.update` (OWNER, ADMIN only)

**Request:**
```json
{
  "role": "finance",
  "is_active": true,
  "name": "John Smith",
  "custom_permissions": {
    "grant": ["invoices.delete"],
    "revoke": ["api_keys.manage"]
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "john@company.com",
  "name": "John Smith",
  "role": "finance",
  "is_active": true,
  "permissions": ["invoices.view", "invoices.create", "invoices.delete"],
  "updated_at": "2024-01-15T10:00:00Z"
}
```

#### DELETE /api/v1/team/members/{member_id}
**Purpose:** Remove team member (soft delete or hard delete)

**Headers:** `Authorization: Bearer <token>`

**Permissions Required:** `team.delete` (OWNER, ADMIN only)

**Response:**
```json
{
  "message": "Team member removed successfully"
}
```

#### POST /api/v1/team/members/{member_id}/reset-password
**Purpose:** Admin resets member password

**Headers:** `Authorization: Bearer <token>`

**Permissions Required:** `team.update` (OWNER, ADMIN only)

**Request:**
```json
{
  "new_password": "NewTempPass123!",
  "send_email": true
}
```

**Response:**
```json
{
  "message": "Password reset successfully",
  "temporary_password": "NewTempPass123!"
}
```

#### POST /api/v1/team/members/{member_id}/revoke-sessions
**Purpose:** Revoke all active sessions for a member

**Headers:** `Authorization: Bearer <token>`

**Permissions Required:** `team.update` (OWNER, ADMIN only)

**Response:**
```json
{
  "message": "All sessions revoked",
  "sessions_revoked": 3
}
```

---

### 3. Permissions Management Endpoints (NEW)

#### GET /api/v1/team/permissions
**Purpose:** List all available permissions

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "permissions": [
    {
      "code": "payments.view",
      "name": "View Payments",
      "description": "View payment transactions and details",
      "category": "payments"
    },
    {
      "code": "payments.create",
      "name": "Create Payments",
      "description": "Create new payment sessions",
      "category": "payments"
    }
  ]
}
```


#### GET /api/v1/team/roles/{role}/permissions
**Purpose:** Get permissions for a specific role

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "role": "developer",
  "permissions": [
    {
      "code": "api_keys.view",
      "name": "View API Keys",
      "category": "integrations"
    },
    {
      "code": "api_keys.manage",
      "name": "Manage API Keys",
      "category": "integrations"
    },
    {
      "code": "webhooks.manage",
      "name": "Manage Webhooks",
      "category": "integrations"
    }
  ]
}
```

#### GET /api/v1/team/members/{member_id}/permissions
**Purpose:** Get effective permissions for a member (role + custom)

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "member_id": "uuid",
  "role": "developer",
  "role_permissions": ["api_keys.view", "api_keys.manage", "webhooks.manage"],
  "custom_granted": ["payments.refund"],
  "custom_revoked": ["api_keys.delete"],
  "effective_permissions": ["api_keys.view", "api_keys.manage", "webhooks.manage", "payments.refund"]
}
```

#### POST /api/v1/team/members/{member_id}/permissions
**Purpose:** Grant or revoke custom permissions

**Headers:** `Authorization: Bearer <token>`

**Permissions Required:** `team.update` (OWNER, ADMIN only)

**Request:**
```json
{
  "grant": ["payments.refund", "invoices.delete"],
  "revoke": ["api_keys.delete"]
}
```

**Response:**
```json
{
  "message": "Permissions updated",
  "effective_permissions": ["api_keys.view", "payments.refund", "invoices.delete"]
}
```

---

### 4. Activity Logs Endpoints (NEW)

#### GET /api/v1/team/activity-logs
**Purpose:** Get activity logs for audit trail

**Headers:** `Authorization: Bearer <token>`

**Permissions Required:** `team.view_logs` (OWNER, ADMIN only)

**Query Parameters:**
- `page` (int, default: 1)
- `page_size` (int, default: 50)
- `team_member_id` (uuid, optional filter)
- `action` (string, optional filter)
- `resource_type` (string, optional filter)
- `start_date` (ISO datetime, optional)
- `end_date` (ISO datetime, optional)

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "team_member": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@company.com"
      },
      "action": "payment.create",
      "resource_type": "payment",
      "resource_id": "payment_uuid",
      "details": {
        "amount": 100,
        "currency": "USD"
      },
      "ip_address": "192.168.1.1",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "page_size": 50
}
```


#### GET /api/v1/team/members/{member_id}/sessions
**Purpose:** Get active sessions for a team member

**Headers:** `Authorization: Bearer <token>`

**Permissions Required:** `team.view` (OWNER, ADMIN) or own sessions

**Response:**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "last_activity": "2024-01-15T10:00:00Z",
      "expires_at": "2024-01-16T10:00:00Z",
      "created_at": "2024-01-15T09:00:00Z",
      "is_current": true
    }
  ]
}
```

---

### 5. Invitation Flow Endpoints (Enhanced)

#### POST /api/v1/team/members/{member_id}/resend-invite
**Purpose:** Resend invitation email (existing, keep as is)

#### POST /api/v1/team/accept-invite
**Purpose:** Accept invitation and set password

**Request:**
```json
{
  "token": "invite_token_here",
  "password": "SecurePass123!",
  "name": "John Doe" // Optional, can update name
}
```

**Response:**
```json
{
  "message": "Invitation accepted",
  "access_token": "eyJhbGc...",
  "team_member": {
    "id": "uuid",
    "email": "john@company.com",
    "name": "John Doe",
    "role": "developer",
    "merchant_id": "uuid"
  }
}
```

---

## Permission System Design

### Permission Categories and Codes

```javascript
const PERMISSIONS = {
  // Payments
  'payments.view': 'View payment transactions',
  'payments.create': 'Create payment sessions',
  'payments.refund': 'Process refunds',
  'payments.export': 'Export payment data',
  
  // Invoices
  'invoices.view': 'View invoices',
  'invoices.create': 'Create invoices',
  'invoices.update': 'Update invoices',
  'invoices.delete': 'Delete invoices',
  'invoices.send': 'Send invoices to customers',
  
  // Payment Links
  'payment_links.view': 'View payment links',
  'payment_links.create': 'Create payment links',
  'payment_links.update': 'Update payment links',
  'payment_links.delete': 'Delete payment links',
  
  // Subscriptions
  'subscriptions.view': 'View subscriptions',
  'subscriptions.create': 'Create subscription plans',
  'subscriptions.update': 'Update subscriptions',
  'subscriptions.cancel': 'Cancel subscriptions',
  
  // Withdrawals
  'withdrawals.view': 'View withdrawals',
  'withdrawals.create': 'Create withdrawal requests',
  'withdrawals.approve': 'Approve withdrawals',
  
  // Coupons
  'coupons.view': 'View coupons',
  'coupons.create': 'Create coupons',
  'coupons.update': 'Update coupons',
  'coupons.delete': 'Delete coupons',
  
  // Team Management
  'team.view': 'View team members',
  'team.create': 'Add team members',
  'team.update': 'Update team members',
  'team.delete': 'Remove team members',
  'team.view_logs': 'View activity logs',
  
  // API & Integrations
  'api_keys.view': 'View API keys',
  'api_keys.manage': 'Create/delete API keys',
  'webhooks.view': 'View webhooks',
  'webhooks.manage': 'Manage webhooks',
  
  // Analytics
  'analytics.view': 'View analytics dashboard',
  'analytics.export': 'Export analytics data',
  
  // Settings
  'settings.view': 'View settings',
  'settings.update': 'Update settings',
  'settings.billing': 'Manage billing and plans',
  
  // Wallets
  'wallets.view': 'View wallet addresses',
  'wallets.manage': 'Add/remove wallets',
};
```


### Default Role Permissions Mapping

```javascript
const ROLE_PERMISSIONS = {
  owner: [
    // All permissions
    '*'
  ],
  
  admin: [
    'payments.*',
    'invoices.*',
    'payment_links.*',
    'subscriptions.*',
    'withdrawals.view',
    'withdrawals.create',
    'coupons.*',
    'team.*',
    'api_keys.view',
    'webhooks.view',
    'analytics.*',
    'settings.view',
    'settings.update',
    'wallets.view'
  ],
  
  developer: [
    'payments.view',
    'invoices.view',
    'payment_links.view',
    'subscriptions.view',
    'api_keys.*',
    'webhooks.*',
    'analytics.view',
    'settings.view'
  ],
  
  finance: [
    'payments.*',
    'invoices.*',
    'payment_links.view',
    'subscriptions.view',
    'withdrawals.*',
    'coupons.view',
    'analytics.*',
    'settings.view'
  ],
  
  viewer: [
    'payments.view',
    'invoices.view',
    'payment_links.view',
    'subscriptions.view',
    'withdrawals.view',
    'coupons.view',
    'analytics.view',
    'settings.view'
  ]
};
```

---

## Backend Implementation Requirements

### 1. Middleware for Permission Checking

**Python/FastAPI Example:**
```python
from functools import wraps
from fastapi import HTTPException, Depends
from typing import List

def require_permissions(*required_permissions: str):
    """Decorator to check if user has required permissions"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user: TeamMember = Depends(get_current_user), **kwargs):
            user_permissions = await get_user_permissions(current_user.id)
            
            for permission in required_permissions:
                if not has_permission(user_permissions, permission):
                    raise HTTPException(
                        status_code=403,
                        detail=f"Missing required permission: {permission}"
                    )
            
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator

# Usage
@router.post("/payments")
@require_permissions("payments.create")
async def create_payment(data: PaymentCreate, current_user: TeamMember = Depends(get_current_user)):
    # Create payment logic
    pass
```

### 2. Permission Resolution Logic

```python
async def get_user_permissions(team_member_id: str) -> List[str]:
    """Get effective permissions for a team member"""
    member = await db.get_team_member(team_member_id)
    
    # Get role-based permissions
    role_permissions = await db.get_role_permissions(member.role)
    
    # Get custom granted permissions
    custom_granted = await db.get_custom_permissions(team_member_id, granted=True)
    
    # Get custom revoked permissions
    custom_revoked = await db.get_custom_permissions(team_member_id, granted=False)
    
    # Combine: role permissions + custom granted - custom revoked
    effective = set(role_permissions) | set(custom_granted) - set(custom_revoked)
    
    return list(effective)

def has_permission(user_permissions: List[str], required: str) -> bool:
    """Check if user has a specific permission (supports wildcards)"""
    # Check for exact match
    if required in user_permissions:
        return True
    
    # Check for wildcard permissions
    if '*' in user_permissions:  # Super admin
        return True
    
    # Check for category wildcards (e.g., 'payments.*')
    category = required.split('.')[0]
    if f"{category}.*" in user_permissions:
        return True
    
    return False
```


### 3. Activity Logging Middleware

```python
async def log_activity(
    team_member_id: str,
    action: str,
    resource_type: str = None,
    resource_id: str = None,
    details: dict = None,
    request: Request = None
):
    """Log user activity for audit trail"""
    await db.create_activity_log({
        'merchant_id': team_member.merchant_id,
        'team_member_id': team_member_id,
        'action': action,
        'resource_type': resource_type,
        'resource_id': resource_id,
        'details': details,
        'ip_address': request.client.host if request else None,
        'user_agent': request.headers.get('user-agent') if request else None
    })

# Usage in endpoints
@router.post("/payments")
async def create_payment(
    data: PaymentCreate,
    current_user: TeamMember = Depends(get_current_user),
    request: Request = None
):
    payment = await payment_service.create(data)
    
    # Log activity
    await log_activity(
        team_member_id=current_user.id,
        action='payment.create',
        resource_type='payment',
        resource_id=payment.id,
        details={'amount': payment.amount, 'currency': payment.currency},
        request=request
    )
    
    return payment
```

### 4. Session Management

```python
import hashlib
import secrets
from datetime import datetime, timedelta

async def create_session(team_member_id: str, request: Request) -> str:
    """Create a new session for team member"""
    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    
    await db.create_session({
        'team_member_id': team_member_id,
        'token_hash': token_hash,
        'ip_address': request.client.host,
        'user_agent': request.headers.get('user-agent'),
        'expires_at': datetime.utcnow() + timedelta(hours=24)
    })
    
    return token

async def validate_session(token: str) -> TeamMember:
    """Validate session token and return team member"""
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    
    session = await db.get_session_by_token(token_hash)
    
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    if session.revoked_at:
        raise HTTPException(status_code=401, detail="Session revoked")
    
    if session.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Update last activity
    await db.update_session(session.id, {'last_activity': datetime.utcnow()})
    
    return await db.get_team_member(session.team_member_id)

async def revoke_all_sessions(team_member_id: str):
    """Revoke all sessions for a team member"""
    await db.revoke_sessions(team_member_id)
```

---

## Frontend Implementation Requirements

### 1. New TypeScript Types

**src/types/api.types.ts (additions)**
```typescript
// Enhanced TeamMember type
export type TeamMember = {
  id: string;
  merchant_id: string;
  email: string;
  name?: string;
  role: MerchantRole;
  is_active: boolean;
  is_email_verified: boolean;
  invite_pending: boolean;
  last_login?: string;
  permissions: string[]; // NEW
  custom_permissions?: { // NEW
    granted: string[];
    revoked: string[];
  };
  created_at: string;
  updated_at?: string;
  created_by?: {
    id: string;
    name: string;
    email: string;
  };
};

// NEW: Permission type
export type Permission = {
  code: string;
  name: string;
  description: string;
  category: string;
};

// NEW: Activity log type
export type ActivityLog = {
  id: string;
  team_member: {
    id: string;
    name: string;
    email: string;
  };
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
};

// NEW: Session type
export type TeamMemberSession = {
  id: string;
  ip_address?: string;
  user_agent?: string;
  last_activity: string;
  expires_at: string;
  created_at: string;
  is_current: boolean;
};

// NEW: Team member creation input
export type CreateTeamMemberInput = {
  email: string;
  name?: string;
  role: MerchantRole;
  send_invite_email?: boolean;
  auto_generate_password?: boolean;
  password?: string;
  custom_permissions?: {
    grant?: string[];
    revoke?: string[];
  };
};
```


### 2. New Service Methods

**src/services/team.service.ts (additions)**
```typescript
export class TeamService {
  // ... existing methods ...

  // NEW: Create team member with account
  async createTeamMember(input: CreateTeamMemberInput): Promise<TeamMember> {
    return apiClient.post<TeamMember>(`${this.basePath}/members`, input, {
      idempotencyKey: generateIdempotencyKey(),
    });
  }

  // NEW: Get all permissions
  async getAllPermissions(): Promise<Permission[]> {
    return apiClient.get<Permission[]>(`${this.basePath}/permissions`);
  }

  // NEW: Get role permissions
  async getRolePermissions(role: MerchantRole): Promise<Permission[]> {
    return apiClient.get<Permission[]>(`${this.basePath}/roles/${role}/permissions`);
  }

  // NEW: Get member permissions
  async getMemberPermissions(memberId: string): Promise<{
    role_permissions: string[];
    custom_granted: string[];
    custom_revoked: string[];
    effective_permissions: string[];
  }> {
    return apiClient.get(`${this.basePath}/members/${memberId}/permissions`);
  }

  // NEW: Update member permissions
  async updateMemberPermissions(
    memberId: string,
    permissions: { grant?: string[]; revoke?: string[] }
  ): Promise<{ effective_permissions: string[] }> {
    return apiClient.post(
      `${this.basePath}/members/${memberId}/permissions`,
      permissions
    );
  }

  // NEW: Reset member password (admin)
  async resetMemberPassword(
    memberId: string,
    newPassword: string,
    sendEmail: boolean = true
  ): Promise<{ temporary_password?: string }> {
    return apiClient.post(`${this.basePath}/members/${memberId}/reset-password`, {
      new_password: newPassword,
      send_email: sendEmail,
    });
  }

  // NEW: Revoke member sessions
  async revokeMemberSessions(memberId: string): Promise<{ sessions_revoked: number }> {
    return apiClient.post(`${this.basePath}/members/${memberId}/revoke-sessions`);
  }

  // NEW: Get member sessions
  async getMemberSessions(memberId: string): Promise<TeamMemberSession[]> {
    return apiClient.get<TeamMemberSession[]>(`${this.basePath}/members/${memberId}/sessions`);
  }

  // NEW: Get activity logs
  async getActivityLogs(params?: {
    page?: number;
    page_size?: number;
    team_member_id?: string;
    action?: string;
    resource_type?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<ActivityLog>> {
    return apiClient.get<PaginatedResponse<ActivityLog>>(
      `${this.basePath}/activity-logs`,
      { params }
    );
  }
}
```

### 3. New Authentication Service

**src/services/team-auth.service.ts (NEW)**
```typescript
import { apiClient } from '@/lib/api-client';

export interface TeamLoginInput {
  email: string;
  password: string;
}

export interface TeamLoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  team_member: {
    id: string;
    email: string;
    name?: string;
    role: string;
    merchant_id: string;
    merchant_name: string;
    permissions: string[];
  };
}

export class TeamAuthService {
  private basePath = '/auth/team';

  async login(input: TeamLoginInput): Promise<TeamLoginResponse> {
    return apiClient.post<TeamLoginResponse>(`${this.basePath}/login`, input);
  }

  async logout(): Promise<void> {
    return apiClient.post<void>(`${this.basePath}/logout`);
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
    return apiClient.post(`${this.basePath}/refresh`, { refresh_token: refreshToken });
  }

  async forgotPassword(email: string): Promise<void> {
    return apiClient.post<void>(`${this.basePath}/forgot-password`, { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    return apiClient.post<void>(`${this.basePath}/reset-password`, {
      token,
      new_password: newPassword,
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return apiClient.post<void>(`${this.basePath}/change-password`, {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }
}

export const teamAuthService = new TeamAuthService();
```


### 4. Permission Hook

**src/hooks/usePermissions.ts (NEW)**
```typescript
import { useMemo } from 'react';
import { useMerchantStore } from '@/stores/merchant-store';
import { MerchantRole } from '@/types/api.types';

export function usePermissions() {
  const role = useMerchantStore((state) => state.role);
  const permissions = useMerchantStore((state) => state.permissions);

  const hasPermission = useMemo(() => {
    return (required: string): boolean => {
      if (!permissions || permissions.length === 0) {
        // Fallback to role-based check if permissions not loaded
        return hasRolePermission(role, required);
      }

      // Check for exact match
      if (permissions.includes(required)) return true;

      // Check for wildcard
      if (permissions.includes('*')) return true;

      // Check for category wildcard (e.g., 'payments.*')
      const category = required.split('.')[0];
      if (permissions.includes(`${category}.*`)) return true;

      return false;
    };
  }, [permissions, role]);

  const hasAnyPermission = useMemo(() => {
    return (requiredPermissions: string[]): boolean => {
      return requiredPermissions.some((perm) => hasPermission(perm));
    };
  }, [hasPermission]);

  const hasAllPermissions = useMemo(() => {
    return (requiredPermissions: string[]): boolean => {
      return requiredPermissions.every((perm) => hasPermission(perm));
    };
  }, [hasPermission]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions,
    role,
  };
}

// Fallback role-based permission check
function hasRolePermission(role: MerchantRole | null, required: string): boolean {
  if (!role) return false;

  const rolePermissions: Record<MerchantRole, string[]> = {
    [MerchantRole.OWNER]: ['*'],
    [MerchantRole.ADMIN]: [
      'payments.*',
      'invoices.*',
      'payment_links.*',
      'subscriptions.*',
      'withdrawals.view',
      'withdrawals.create',
      'coupons.*',
      'team.*',
      'analytics.*',
      'settings.view',
      'settings.update',
    ],
    [MerchantRole.DEVELOPER]: [
      'payments.view',
      'invoices.view',
      'api_keys.*',
      'webhooks.*',
      'analytics.view',
    ],
    [MerchantRole.FINANCE]: [
      'payments.*',
      'invoices.*',
      'withdrawals.*',
      'analytics.*',
    ],
    [MerchantRole.VIEWER]: [
      'payments.view',
      'invoices.view',
      'payment_links.view',
      'subscriptions.view',
      'analytics.view',
    ],
  };

  const perms = rolePermissions[role] || [];

  if (perms.includes('*')) return true;
  if (perms.includes(required)) return true;

  const category = required.split('.')[0];
  if (perms.includes(`${category}.*`)) return true;

  return false;
}
```

### 5. Permission Guard Component

**src/components/PermissionGuard.tsx (NEW)**
```typescript
import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  permission: string | string[];
  requireAll?: boolean; // If true, requires all permissions; if false, requires any
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({
  permission,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions();

  const hasAccess = Array.isArray(permission)
    ? requireAll
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission)
    : hasPermission(permission);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```


### 6. Enhanced Merchant Store

**src/stores/merchant-store.ts (updates)**
```typescript
interface MerchantState {
  // ... existing fields ...
  permissions: string[]; // NEW
  teamMemberId: string | null; // NEW - for team member login
  
  setMerchant: (data: {
    apiKey: string;
    merchantId: string;
    merchantName: string;
    email: string;
    role: MerchantRole;
    permissions?: string[]; // NEW
    teamMemberId?: string; // NEW
  }) => void;
  
  setPermissions: (permissions: string[]) => void; // NEW
}

export const useMerchantStore = create<MerchantState>()(
  persist(
    (set) => ({
      // ... existing state ...
      permissions: [],
      teamMemberId: null,
      
      setMerchant: (data) =>
        set({
          ...data,
          permissions: data.permissions || [],
          isAuthenticated: true,
        }),
      
      setPermissions: (permissions) => set({ permissions }),
      
      clearMerchant: () =>
        set({
          apiKey: null,
          merchantId: null,
          merchantName: null,
          email: null,
          role: null,
          permissions: [],
          teamMemberId: null,
          isAuthenticated: false,
          currency: 'USD',
          currencySymbol: '$',
        }),
    }),
    {
      name: 'dari-merchant-store',
    }
  )
);
```

---

## User Journey Flows

### Journey 1: Root Admin Creates Team Member Account

1. **Admin navigates to Team page**
   - Clicks "Invite Member" button

2. **Create Team Member Modal opens**
   - Fields:
     - Email (required)
     - Name (optional)
     - Role (dropdown: Admin, Developer, Finance, Viewer)
     - Password option:
       - [ ] Auto-generate password (system creates secure password)
       - [ ] Set custom password (admin enters password)
     - [ ] Send invitation email (checked by default)
     - Custom Permissions (optional, advanced section)
       - Grant additional permissions
       - Revoke specific permissions

3. **Admin submits form**
   - Backend creates team member account
   - If auto-generate: Returns temporary password
   - If send email: Sends invitation with login instructions
   - Shows success message with credentials (if applicable)

4. **Team member receives email**
   - Email contains:
     - Welcome message
     - Login URL
     - Temporary password (if auto-generated)
     - Instructions to change password on first login

### Journey 2: Team Member First Login

1. **Team member visits login page**
   - Enters email and temporary password
   - Clicks "Login"

2. **System validates credentials**
   - If first login with temp password:
     - Redirects to "Change Password" page
     - Must set new secure password
   - If invite token exists:
     - Shows "Complete Setup" page
     - Can update name, set password

3. **After password set**
   - Redirects to dashboard
   - Shows role-appropriate interface
   - Only sees features they have permission for

### Journey 3: Team Member Daily Usage

1. **Team member logs in**
   - Standard login with email/password
   - Session created (24-hour expiry)

2. **Navigates dashboard**
   - Sidebar shows only permitted features
   - Buttons/actions hidden if no permission
   - API calls automatically checked for permissions

3. **Attempts unauthorized action**
   - UI prevents action (button disabled/hidden)
   - If API called directly: Returns 403 Forbidden
   - Shows toast: "You don't have permission for this action"

### Journey 4: Admin Manages Team Member

1. **Admin views team member list**
   - Sees all members with roles and status
   - Can filter by role, status, search by name/email

2. **Admin clicks member actions menu**
   - Options:
     - Change Role
     - Manage Permissions (custom)
     - Reset Password
     - View Sessions
     - View Activity Log
     - Revoke All Sessions
     - Deactivate/Remove

3. **Admin changes role**
   - Selects new role from dropdown
   - Sees permission changes preview
   - Confirms change
   - Member's permissions update immediately

4. **Admin manages custom permissions**
   - Opens permissions modal
   - Sees role permissions (read-only)
   - Can grant additional permissions
   - Can revoke specific role permissions
   - Saves changes
   - Member's access updates in realtime


### Journey 5: Security - Password Reset

1. **Team member forgets password**
   - Clicks "Forgot Password" on login page
   - Enters email
   - Receives reset email

2. **Clicks reset link in email**
   - Opens reset password page
   - Token validated
   - Enters new password (with strength requirements)
   - Submits

3. **Password reset successful**
   - All existing sessions revoked
   - Redirects to login
   - Logs in with new password

### Journey 6: Admin Security Actions

1. **Admin suspects compromised account**
   - Opens team member details
   - Clicks "View Sessions"
   - Sees all active sessions with:
     - IP address
     - Device/browser info
     - Last activity time
     - Location (if available)

2. **Admin revokes sessions**
   - Clicks "Revoke All Sessions"
   - Confirms action
   - All sessions immediately invalidated
   - Team member must log in again

3. **Admin resets password**
   - Clicks "Reset Password"
   - Chooses:
     - Auto-generate secure password
     - Set custom password
   - [ ] Send email to member
   - Submits
   - Member's password changed
   - All sessions revoked

---

## UI Component Requirements

### 1. Enhanced Team Member Creation Modal

**Features:**
- Email input with validation
- Name input (optional)
- Role selector (dropdown)
- Password options:
  - Radio: Auto-generate / Set custom
  - Password input (if custom selected)
  - Password strength indicator
- Send invitation email checkbox
- Advanced section (collapsible):
  - Custom permissions manager
  - Grant additional permissions (multi-select)
  - Revoke specific permissions (multi-select)
- Preview of effective permissions
- Submit button

### 2. Team Member Detail View

**Features:**
- Member info card:
  - Avatar/initials
  - Name, email
  - Role badge
  - Status (Active/Inactive)
  - Last login
  - Created date
- Permissions section:
  - Role permissions (read-only list)
  - Custom granted permissions (with remove option)
  - Custom revoked permissions (with restore option)
  - "Manage Permissions" button
- Sessions section:
  - List of active sessions
  - Session details (IP, device, last activity)
  - "Revoke All Sessions" button
- Activity section:
  - Recent activity log
  - Filter by action type
  - "View Full Log" button
- Actions:
  - Change Role
  - Reset Password
  - Deactivate/Activate
  - Remove Member

### 3. Permissions Manager Modal

**Features:**
- Two-column layout:
  - Left: Available permissions (grouped by category)
  - Right: Current permissions
- Role permissions section (read-only, highlighted)
- Custom permissions section:
  - Granted (green badges with X to remove)
  - Revoked (red badges with X to restore)
- Search/filter permissions
- Category filters (Payments, Invoices, Team, etc.)
- "Grant Permission" button (opens selector)
- "Revoke Permission" button (opens selector)
- Preview of effective permissions
- Save/Cancel buttons

### 4. Activity Log Viewer

**Features:**
- Table view with columns:
  - Timestamp
  - Team Member (name + avatar)
  - Action (with icon)
  - Resource (type + ID)
  - Details (expandable)
  - IP Address
- Filters:
  - Date range picker
  - Team member selector
  - Action type selector
  - Resource type selector
- Search bar
- Export button (CSV/JSON)
- Pagination
- Real-time updates (optional)

### 5. Session Manager

**Features:**
- List of active sessions
- Each session shows:
  - Device icon (desktop/mobile/tablet)
  - Browser name and version
  - IP address
  - Location (city, country)
  - Last activity (relative time)
  - "Current Session" badge (if applicable)
  - "Revoke" button
- "Revoke All Other Sessions" button
- Auto-refresh every 30 seconds

### 6. Team Member Login Page

**Features:**
- Separate from merchant login
- URL: `/team/login` or `/login?type=team`
- Email input
- Password input
- "Forgot Password" link
- "Login" button
- Different branding/messaging:
  - "Team Member Login"
  - "Access your team account"
- No "Register" link (only admins create accounts)

### 7. First Login / Password Setup

**Features:**
- Welcome message
- Name input (if not set)
- Current password input (if temp password)
- New password input
- Confirm password input
- Password requirements checklist:
  - [ ] At least 8 characters
  - [ ] Contains uppercase letter
  - [ ] Contains lowercase letter
  - [ ] Contains number
  - [ ] Contains special character
- "Complete Setup" button
- Auto-login after setup


---

## Security Considerations

### 1. Password Requirements
- Minimum 8 characters
- Must contain: uppercase, lowercase, number, special character
- Cannot be common passwords (check against list)
- Cannot be same as email
- Password history (prevent reuse of last 5 passwords)

### 2. Session Security
- JWT tokens with short expiry (1 hour)
- Refresh tokens with longer expiry (7 days)
- Secure, httpOnly cookies for tokens
- CSRF protection
- Session binding to IP address (optional, configurable)
- Automatic session cleanup (expired sessions)

### 3. Rate Limiting
- Login attempts: 5 per 15 minutes per email
- Password reset: 3 per hour per email
- API calls: Based on role (e.g., 1000/hour for viewer, 10000/hour for admin)

### 4. Account Lockout
- After 5 failed login attempts: Lock for 15 minutes
- After 10 failed attempts: Lock for 1 hour
- After 20 failed attempts: Lock until admin unlocks

### 5. Audit Trail
- Log all authentication events (login, logout, failed attempts)
- Log all permission changes
- Log all sensitive actions (password resets, role changes)
- Retain logs for compliance (90 days minimum)

### 6. Two-Factor Authentication (Future Enhancement)
- Optional 2FA for team members
- TOTP-based (Google Authenticator, Authy)
- Backup codes
- Admin can enforce 2FA for specific roles

---

## Implementation Phases

### Phase 1: Backend Foundation (Week 1-2)
- [ ] Database schema updates
- [ ] Authentication endpoints (login, logout, refresh)
- [ ] Password management (reset, change)
- [ ] Session management
- [ ] Permission system implementation
- [ ] Middleware for permission checking
- [ ] Activity logging system

### Phase 2: Team Management APIs (Week 2-3)
- [ ] Enhanced team member CRUD
- [ ] Permission management endpoints
- [ ] Activity log endpoints
- [ ] Session management endpoints
- [ ] Invitation flow updates

### Phase 3: Frontend Core (Week 3-4)
- [ ] TypeScript types updates
- [ ] Service layer updates
- [ ] Permission hook
- [ ] Permission guard component
- [ ] Store updates
- [ ] Team member login page
- [ ] First login / password setup flow

### Phase 4: Team Management UI (Week 4-5)
- [ ] Enhanced team member creation modal
- [ ] Team member detail view
- [ ] Permissions manager modal
- [ ] Activity log viewer
- [ ] Session manager
- [ ] Role change flow

### Phase 5: Integration & Testing (Week 5-6)
- [ ] Permission enforcement across all features
- [ ] UI updates (hide/show based on permissions)
- [ ] End-to-end testing
- [ ] Security testing
- [ ] Performance testing
- [ ] Documentation

### Phase 6: Polish & Launch (Week 6-7)
- [ ] Bug fixes
- [ ] UI/UX improvements
- [ ] Admin documentation
- [ ] User documentation
- [ ] Migration scripts (if needed)
- [ ] Production deployment

---

## Testing Checklist

### Authentication Tests
- [ ] Team member can login with email/password
- [ ] Invalid credentials rejected
- [ ] Account lockout after failed attempts
- [ ] Password reset flow works
- [ ] First login password setup works
- [ ] Session expiry works
- [ ] Refresh token works
- [ ] Logout revokes session

### Permission Tests
- [ ] Role permissions correctly assigned
- [ ] Custom permissions can be granted
- [ ] Custom permissions can be revoked
- [ ] Permission wildcards work
- [ ] Permission checks on API endpoints work
- [ ] UI elements hidden without permission
- [ ] 403 errors for unauthorized actions

### Team Management Tests
- [ ] Admin can create team member
- [ ] Admin can update team member role
- [ ] Admin can manage custom permissions
- [ ] Admin can reset member password
- [ ] Admin can revoke sessions
- [ ] Admin can view activity logs
- [ ] Admin can deactivate member
- [ ] Admin can remove member
- [ ] Non-admin cannot access team management

### Security Tests
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting works
- [ ] Session hijacking prevention
- [ ] Password strength enforcement
- [ ] Sensitive data not logged
- [ ] Audit trail complete

---

## Migration Strategy

### For Existing Team Members (Invitation-based)

1. **Data Migration Script**
   ```sql
   -- Add password_hash column (nullable initially)
   ALTER TABLE team_members ADD COLUMN password_hash VARCHAR(255);
   
   -- Generate invite tokens for existing members without passwords
   UPDATE team_members 
   SET invite_token = gen_random_uuid()::text,
       invite_expires_at = NOW() + INTERVAL '7 days',
       invite_pending = true
   WHERE password_hash IS NULL;
   ```

2. **Email Campaign**
   - Send email to all existing team members
   - Subject: "Action Required: Set Your Password"
   - Content:
     - Explain new login system
     - Provide setup link with token
     - Deadline (7 days)
     - Support contact

3. **Grace Period**
   - Allow 30 days for transition
   - During grace period:
     - Old invitation system still works
     - New account system available
   - After grace period:
     - Only new system works
     - Admins must reset passwords for non-migrated members

---

## API Endpoint Summary

### Authentication
- `POST /api/v1/auth/team/login` - Team member login
- `POST /api/v1/auth/team/logout` - Logout
- `POST /api/v1/auth/team/refresh` - Refresh token
- `POST /api/v1/auth/team/forgot-password` - Request password reset
- `POST /api/v1/auth/team/reset-password` - Reset password
- `POST /api/v1/auth/team/change-password` - Change password

### Team Management
- `POST /api/v1/team/members` - Create team member
- `GET /api/v1/team/members` - List team members
- `GET /api/v1/team/members/{id}` - Get team member
- `PATCH /api/v1/team/members/{id}` - Update team member
- `DELETE /api/v1/team/members/{id}` - Remove team member
- `POST /api/v1/team/members/{id}/reset-password` - Admin reset password
- `POST /api/v1/team/members/{id}/revoke-sessions` - Revoke sessions
- `GET /api/v1/team/members/{id}/sessions` - Get sessions
- `POST /api/v1/team/members/{id}/resend-invite` - Resend invite
- `POST /api/v1/team/accept-invite` - Accept invitation

### Permissions
- `GET /api/v1/team/permissions` - List all permissions
- `GET /api/v1/team/roles/{role}/permissions` - Get role permissions
- `GET /api/v1/team/members/{id}/permissions` - Get member permissions
- `POST /api/v1/team/members/{id}/permissions` - Update member permissions

### Activity Logs
- `GET /api/v1/team/activity-logs` - Get activity logs

---

## Conclusion

This implementation provides a complete role-based access control system with:

✅ Separate login accounts for team members
✅ Granular permission system
✅ Realtime permission enforcement
✅ Activity logging and audit trails
✅ Session management
✅ Security best practices
✅ Comprehensive admin controls
✅ User-friendly interfaces

The system is designed to be scalable, secure, and maintainable, with clear separation between backend and frontend responsibilities.

