# Team RBAC Integration Examples

This document provides practical examples of how to integrate Team RBAC into your existing components.

---

## Example 1: Protecting the Payments Page

### Before (No RBAC)
```typescript
// src/app/components/PaymentsList.tsx
import React from 'react';
import { usePaymentHistory } from '@/hooks/usePaymentHistory';

export const PaymentsList: React.FC = () => {
  const { data: payments } = usePaymentHistory();

  return (
    <div>
      <h1>Payments</h1>
      <button>Create Payment</button>
      <button>Export Data</button>
      {/* Payment list */}
    </div>
  );
};
```

### After (With RBAC)
```typescript
// src/app/components/PaymentsList.tsx
import React from 'react';
import { usePaymentHistory } from '@/hooks/usePaymentHistory';
import { PermissionGate } from '@/app/components/team/PermissionGate';
import { usePermissions } from '@/hooks/usePermissions';

export const PaymentsList: React.FC = () => {
  const { data: payments } = usePaymentHistory();
  const { hasPermission } = usePermissions();

  return (
    <div>
      <h1>Payments</h1>
      
      {/* Only show create button if user has permission */}
      <PermissionGate requiredPermissions={['payments.create']}>
        <button>Create Payment</button>
      </PermissionGate>

      {/* Only show export button if user has permission */}
      <PermissionGate requiredPermissions={['payments.export']}>
        <button>Export Data</button>
      </PermissionGate>

      {/* Payment list - everyone with payments.view can see this */}
      {/* ... */}
    </div>
  );
};
```

### Route Protection
```typescript
// In your router file
import { ProtectedTeamRoute } from '@/app/components/team/ProtectedTeamRoute';

<Route
  path="/payments"
  element={
    <ProtectedTeamRoute requiredPermissions={['payments.view']}>
      <PaymentsList />
    </ProtectedTeamRoute>
  }
/>
```

---

## Example 2: Team Management Page

### Implementation
```typescript
// src/app/components/team/TeamMembersPage.tsx
import React from 'react';
import { useTeamMembers } from '@/hooks/useTeam';
import { PermissionGate } from '@/app/components/team/PermissionGate';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/app/components/ui/button';

export const TeamMembersPage: React.FC = () => {
  const { data: members } = useTeamMembers();
  const { hasPermission, hasRole } = usePermissions();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Team Members</h1>
        
        {/* Only admins and owners can invite */}
        <PermissionGate requiredPermissions={['team.create']}>
          <Button onClick={() => navigate('/team/invite')}>
            Invite Member
          </Button>
        </PermissionGate>
      </div>

      <div className="space-y-4">
        {members?.items.map((member) => (
          <div key={member.id} className="border p-4 rounded">
            <div className="flex justify-between items-center">
              <div>
                <h3>{member.name}</h3>
                <p>{member.email}</p>
                <p>Role: {member.role}</p>
              </div>

              <div className="flex gap-2">
                {/* Only show edit if user has permission */}
                <PermissionGate requiredPermissions={['team.update']}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </PermissionGate>

                {/* Only owners can delete */}
                <PermissionGate requiredRoles={['owner']}>
                  <Button variant="destructive" size="sm">
                    Remove
                  </Button>
                </PermissionGate>

                {/* Only admins and owners can manage permissions */}
                <PermissionGate requiredPermissions={['team.update']}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/team/members/${member.id}/permissions`)}
                  >
                    Manage Permissions
                  </Button>
                </PermissionGate>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## Example 3: Settings Page with Mixed Permissions

### Implementation
```typescript
// src/app/components/Settings.tsx
import React from 'react';
import { PermissionGate } from '@/app/components/team/PermissionGate';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

export const Settings: React.FC = () => {
  return (
    <div>
      <h1>Settings</h1>

      <Tabs defaultValue="general">
        <TabsList>
          {/* Everyone with settings.view can see general */}
          <TabsTrigger value="general">General</TabsTrigger>

          {/* Only users with settings.billing can see billing */}
          <PermissionGate requiredPermissions={['settings.billing']}>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </PermissionGate>

          {/* Only admins can see security */}
          <PermissionGate requiredRoles={['owner', 'admin']}>
            <TabsTrigger value="security">Security</TabsTrigger>
          </PermissionGate>

          {/* Only developers can see API */}
          <PermissionGate requiredPermissions={['api_keys.view']}>
            <TabsTrigger value="api">API</TabsTrigger>
          </PermissionGate>
        </TabsList>

        <TabsContent value="general">
          {/* General settings - read-only for viewers */}
          <PermissionGate 
            requiredPermissions={['settings.update']}
            fallback={<p>You can only view these settings</p>}
          >
            <button>Save Changes</button>
          </PermissionGate>
        </TabsContent>

        <TabsContent value="billing">
          <BillingSettings />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="api">
          <ApiSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

---

## Example 4: Conditional Actions in a Table

### Implementation
```typescript
// src/app/components/InvoicesList.tsx
import React from 'react';
import { useInvoices } from '@/hooks/useInvoices';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGate } from '@/app/components/team/PermissionGate';

export const InvoicesList: React.FC = () => {
  const { data: invoices } = useInvoices();
  const { hasPermission } = usePermissions();

  return (
    <table>
      <thead>
        <tr>
          <th>Invoice #</th>
          <th>Customer</th>
          <th>Amount</th>
          <th>Status</th>
          {hasPermission('invoices.update') && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {invoices?.items.map((invoice) => (
          <tr key={invoice.id}>
            <td>{invoice.number}</td>
            <td>{invoice.customer_name}</td>
            <td>${invoice.amount}</td>
            <td>{invoice.status}</td>
            
            {/* Only show actions column if user has any action permission */}
            {hasPermission('invoices.update') && (
              <td>
                <div className="flex gap-2">
                  {/* Edit - requires update permission */}
                  <PermissionGate requiredPermissions={['invoices.update']}>
                    <button>Edit</button>
                  </PermissionGate>

                  {/* Send - requires send permission */}
                  <PermissionGate requiredPermissions={['invoices.send']}>
                    <button>Send</button>
                  </PermissionGate>

                  {/* Delete - requires delete permission */}
                  <PermissionGate requiredPermissions={['invoices.delete']}>
                    <button>Delete</button>
                  </PermissionGate>
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

---

## Example 5: Dashboard with Role-Based Widgets

### Implementation
```typescript
// src/app/components/Dashboard.tsx
import React from 'react';
import { PermissionGate } from '@/app/components/team/PermissionGate';
import { usePermissions } from '@/hooks/usePermissions';

export const Dashboard: React.FC = () => {
  const { currentUser, hasAnyPermission } = usePermissions();

  return (
    <div>
      <h1>Welcome, {currentUser?.name}</h1>
      <p>Role: {currentUser?.role}</p>

      <div className="grid grid-cols-3 gap-4">
        {/* Financial widgets - for finance, admin, owner */}
        <PermissionGate requiredPermissions={['payments.view']}>
          <div className="widget">
            <h3>Total Revenue</h3>
            <p>$123,456</p>
          </div>
        </PermissionGate>

        <PermissionGate requiredPermissions={['payments.view']}>
          <div className="widget">
            <h3>Pending Payments</h3>
            <p>42</p>
          </div>
        </PermissionGate>

        {/* Analytics widget - for those with analytics permission */}
        <PermissionGate requiredPermissions={['analytics.view']}>
          <div className="widget">
            <h3>Conversion Rate</h3>
            <p>3.2%</p>
          </div>
        </PermissionGate>

        {/* Team widget - for admins and owners */}
        <PermissionGate requiredPermissions={['team.view']}>
          <div className="widget">
            <h3>Team Members</h3>
            <p>12</p>
          </div>
        </PermissionGate>

        {/* API widget - for developers */}
        <PermissionGate requiredPermissions={['api_keys.view']}>
          <div className="widget">
            <h3>API Calls Today</h3>
            <p>1,234</p>
          </div>
        </PermissionGate>

        {/* Subscription widget - for those who can view subscriptions */}
        <PermissionGate requiredPermissions={['subscriptions.view']}>
          <div className="widget">
            <h3>Active Subscriptions</h3>
            <p>89</p>
          </div>
        </PermissionGate>
      </div>

      {/* Quick actions based on permissions */}
      <div className="mt-8">
        <h2>Quick Actions</h2>
        <div className="flex gap-2">
          <PermissionGate requiredPermissions={['payments.create']}>
            <button>Create Payment</button>
          </PermissionGate>

          <PermissionGate requiredPermissions={['invoices.create']}>
            <button>Create Invoice</button>
          </PermissionGate>

          <PermissionGate requiredPermissions={['team.create']}>
            <button>Invite Team Member</button>
          </PermissionGate>

          <PermissionGate requiredPermissions={['analytics.export']}>
            <button>Export Report</button>
          </PermissionGate>
        </div>
      </div>
    </div>
  );
};
```

---

## Example 6: Form with Conditional Fields

### Implementation
```typescript
// src/app/components/CreatePayment.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGate } from '@/app/components/team/PermissionGate';

export const CreatePayment: React.FC = () => {
  const { register, handleSubmit } = useForm();
  const { hasPermission } = usePermissions();

  const onSubmit = (data: any) => {
    // Handle payment creation
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Basic fields - everyone can fill */}
      <input {...register('amount')} placeholder="Amount" />
      <input {...register('description')} placeholder="Description" />

      {/* Advanced fields - only for users with specific permissions */}
      <PermissionGate requiredPermissions={['payments.refund']}>
        <label>
          <input type="checkbox" {...register('allow_refund')} />
          Allow Refund
        </label>
      </PermissionGate>

      {/* Admin-only fields */}
      <PermissionGate requiredRoles={['owner', 'admin']}>
        <input {...register('internal_notes')} placeholder="Internal Notes" />
      </PermissionGate>

      {/* Fee override - only for finance and admin */}
      <PermissionGate requiredPermissions={['payments.create', 'settings.billing']} requireAll>
        <input {...register('fee_override')} placeholder="Fee Override %" />
      </PermissionGate>

      <button type="submit">Create Payment</button>
    </form>
  );
};
```

---

## Example 7: Navigation Menu with Permissions

### Implementation
```typescript
// src/app/components/Navigation.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGate } from '@/app/components/team/PermissionGate';

export const Navigation: React.FC = () => {
  const { hasPermission, currentUser } = usePermissions();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', permission: null },
    { label: 'Payments', path: '/payments', permission: 'payments.view' },
    { label: 'Invoices', path: '/invoices', permission: 'invoices.view' },
    { label: 'Subscriptions', path: '/subscriptions', permission: 'subscriptions.view' },
    { label: 'Team', path: '/team', permission: 'team.view' },
    { label: 'Analytics', path: '/analytics', permission: 'analytics.view' },
    { label: 'Settings', path: '/settings', permission: 'settings.view' },
  ];

  return (
    <nav>
      <div className="user-info">
        <p>{currentUser?.name}</p>
        <p className="text-sm">{currentUser?.role}</p>
      </div>

      <ul>
        {menuItems.map((item) => (
          <PermissionGate
            key={item.path}
            requiredPermissions={item.permission ? [item.permission] : []}
          >
            <li>
              <Link to={item.path}>{item.label}</Link>
            </li>
          </PermissionGate>
        ))}
      </ul>

      {/* Admin section */}
      <PermissionGate requiredRoles={['owner', 'admin']}>
        <div className="admin-section">
          <h3>Admin</h3>
          <ul>
            <li><Link to="/admin/users">Users</Link></li>
            <li><Link to="/admin/logs">Activity Logs</Link></li>
            <li><Link to="/admin/settings">System Settings</Link></li>
          </ul>
        </div>
      </PermissionGate>
    </nav>
  );
};
```

---

## Example 8: API Call with Permission Check

### Implementation
```typescript
// src/app/components/PaymentActions.tsx
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';

export const PaymentActions: React.FC<{ paymentId: string }> = ({ paymentId }) => {
  const { hasPermission } = usePermissions();

  const handleRefund = async () => {
    // Check permission before making API call
    if (!hasPermission('payments.refund')) {
      toast.error('You do not have permission to refund payments');
      return;
    }

    try {
      await api.post(`/payments/${paymentId}/refund`);
      toast.success('Payment refunded');
    } catch (error) {
      toast.error('Failed to refund payment');
    }
  };

  const handleExport = async () => {
    if (!hasPermission('payments.export')) {
      toast.error('You do not have permission to export payments');
      return;
    }

    try {
      await api.get(`/payments/${paymentId}/export`);
      toast.success('Payment exported');
    } catch (error) {
      toast.error('Failed to export payment');
    }
  };

  return (
    <div className="flex gap-2">
      {hasPermission('payments.refund') && (
        <button onClick={handleRefund}>Refund</button>
      )}
      
      {hasPermission('payments.export') && (
        <button onClick={handleExport}>Export</button>
      )}
    </div>
  );
};
```

---

## Example 9: Updating Existing Header Component

### Before
```typescript
// src/app/components/Header.tsx
export const Header: React.FC = () => {
  return (
    <header>
      <nav>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/payments">Payments</Link>
        <Link to="/team">Team</Link>
        <Link to="/settings">Settings</Link>
      </nav>
      <button onClick={handleLogout}>Logout</button>
    </header>
  );
};
```

### After
```typescript
// src/app/components/Header.tsx
import { usePermissions } from '@/hooks/usePermissions';
import { useTeamLogout } from '@/hooks/useTeamAuth';
import { PermissionGate } from '@/app/components/team/PermissionGate';

export const Header: React.FC = () => {
  const { currentUser } = usePermissions();
  const logoutMutation = useTeamLogout();

  return (
    <header>
      <nav>
        <Link to="/dashboard">Dashboard</Link>
        
        <PermissionGate requiredPermissions={['payments.view']}>
          <Link to="/payments">Payments</Link>
        </PermissionGate>

        <PermissionGate requiredPermissions={['team.view']}>
          <Link to="/team">Team</Link>
        </PermissionGate>

        <PermissionGate requiredPermissions={['settings.view']}>
          <Link to="/settings">Settings</Link>
        </PermissionGate>
      </nav>

      <div className="user-menu">
        <span>{currentUser?.name} ({currentUser?.role})</span>
        <Link to="/team/sessions">Sessions</Link>
        <button onClick={() => logoutMutation.mutate()}>Logout</button>
      </div>
    </header>
  );
};
```

---

## Example 10: Complex Permission Logic

### Implementation
```typescript
// src/app/components/AdvancedFeature.tsx
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

export const AdvancedFeature: React.FC = () => {
  const { hasPermission, hasAllPermissions, hasAnyPermission, hasRole } = usePermissions();

  // Complex permission logic
  const canManagePayments = hasAllPermissions(['payments.view', 'payments.create', 'payments.refund']);
  const canViewFinancials = hasAnyPermission(['payments.view', 'invoices.view', 'analytics.view']);
  const isAdmin = hasRole('admin') || hasRole('owner');
  const canExport = hasPermission('payments.export') && hasPermission('analytics.export');

  return (
    <div>
      {canManagePayments && (
        <section>
          <h2>Payment Management</h2>
          <p>You have full payment management access</p>
        </section>
      )}

      {canViewFinancials && (
        <section>
          <h2>Financial Overview</h2>
          <p>You can view financial data</p>
        </section>
      )}

      {isAdmin && (
        <section>
          <h2>Admin Tools</h2>
          <p>Admin-only features</p>
        </section>
      )}

      {canExport && (
        <button>Export All Data</button>
      )}
    </div>
  );
};
```

---

## Tips for Integration

### 1. Start Small
Begin by protecting one or two routes, then gradually add more.

### 2. Use Permission Gates Liberally
Don't hesitate to wrap UI elements - it's better to be explicit.

### 3. Check Permissions Before API Calls
Always verify permissions before making state-changing API calls.

### 4. Provide Fallback UI
Use the `fallback` prop to show helpful messages when access is denied.

### 5. Test with Different Roles
Create test accounts for each role and verify the UI behaves correctly.

### 6. Document Custom Permissions
If you add custom permissions, document them for your team.

### 7. Use Loading States
Always handle the loading state from `usePermissions()`.

### 8. Combine with Backend Checks
Frontend checks are for UX - always enforce permissions on the backend.

---

## Common Patterns Summary

| Pattern | Use Case | Example |
|---------|----------|---------|
| Route Protection | Protect entire pages | `<ProtectedTeamRoute>` |
| UI Element Hiding | Hide buttons/sections | `<PermissionGate>` |
| Conditional Rendering | Show/hide based on role | `{hasRole('admin') && ...}` |
| Form Field Control | Show/hide form fields | `<PermissionGate>` around input |
| Action Validation | Check before API call | `if (hasPermission(...))` |
| Menu Filtering | Show relevant menu items | Map + `<PermissionGate>` |
| Table Actions | Conditional action buttons | `<PermissionGate>` in table cell |
| Dashboard Widgets | Role-based widgets | `<PermissionGate>` around widget |

---

**Need more examples? Check the full documentation in `TEAM_RBAC_FRONTEND_INTEGRATION.md`**
