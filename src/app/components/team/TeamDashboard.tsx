import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { useTeamLogout } from '@/hooks/useTeamAuth';
import { PermissionGate } from './PermissionGate';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import {
  CreditCard,
  FileText,
  Link2,
  Users,
  Settings,
  BarChart3,
  Key,
  Webhook,
  LogOut,
  Shield,
} from 'lucide-react';

export const TeamDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, hasPermission, memberPermissions } = usePermissions();
  const logoutMutation = useTeamLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/team/login');
      },
    });
  };

  const menuItems = [
    {
      title: 'Payments',
      description: 'View and manage payment transactions',
      icon: CreditCard,
      permission: 'payments.view',
      path: '/payments',
    },
    {
      title: 'Invoices',
      description: 'Create and manage invoices',
      icon: FileText,
      permission: 'invoices.view',
      path: '/invoices',
    },
    {
      title: 'Payment Links',
      description: 'Generate payment links',
      icon: Link2,
      permission: 'payment_links.view',
      path: '/payment-links',
    },
    {
      title: 'Team Management',
      description: 'Manage team members and permissions',
      icon: Users,
      permission: 'team.view',
      path: '/team/members',
    },
    {
      title: 'Analytics',
      description: 'View business analytics and reports',
      icon: BarChart3,
      permission: 'analytics.view',
      path: '/analytics',
    },
    {
      title: 'API Keys',
      description: 'Manage API keys and integrations',
      icon: Key,
      permission: 'api_keys.view',
      path: '/integrations',
    },
    {
      title: 'Webhooks',
      description: 'Configure webhook endpoints',
      icon: Webhook,
      permission: 'webhooks.view',
      path: '/webhooks',
    },
    {
      title: 'Settings',
      description: 'Configure account settings',
      icon: Settings,
      permission: 'settings.view',
      path: '/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Team Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {currentUser?.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser?.email}</p>
                <Badge variant="secondary" className="mt-1">
                  {currentUser?.role}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/team/sessions')}
              >
                <Shield className="h-4 w-4 mr-2" />
                Sessions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Permissions Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Permissions</CardTitle>
            <CardDescription>
              You have access to the following areas based on your role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {memberPermissions?.effective_permissions.slice(0, 10).map((perm) => (
                <Badge key={perm} variant="outline">
                  {perm}
                </Badge>
              ))}
              {memberPermissions && memberPermissions.effective_permissions.length > 10 && (
                <Badge variant="secondary">
                  +{memberPermissions.effective_permissions.length - 10} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <PermissionGate
              key={item.title}
              requiredPermissions={[item.permission]}
              fallback={
                <Card className="opacity-50 cursor-not-allowed">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <item.icon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription className="text-xs">
                          No access
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              }
            >
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(item.path)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <item.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {item.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </PermissionGate>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <PermissionGate requiredPermissions={['payments.create']}>
              <Button onClick={() => navigate('/payments/create')}>
                Create Payment
              </Button>
            </PermissionGate>

            <PermissionGate requiredPermissions={['invoices.create']}>
              <Button variant="outline" onClick={() => navigate('/invoices/create')}>
                Create Invoice
              </Button>
            </PermissionGate>

            <PermissionGate requiredPermissions={['team.create']}>
              <Button variant="outline" onClick={() => navigate('/team/invite')}>
                Invite Team Member
              </Button>
            </PermissionGate>

            <PermissionGate requiredPermissions={['analytics.export']}>
              <Button variant="outline" onClick={() => navigate('/analytics/export')}>
                Export Analytics
              </Button>
            </PermissionGate>
          </div>
        </div>
      </main>
    </div>
  );
};
