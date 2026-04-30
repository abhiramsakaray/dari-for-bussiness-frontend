// Role-based permissions utility
export enum MerchantRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  FINANCE = 'finance',
  VIEWER = 'viewer',
}

export interface PermissionConfig {
  // Navigation
  canViewOverview: boolean;
  canViewTransactions: boolean;
  canViewPaymentLinks: boolean;
  canViewInvoices: boolean;
  canViewAnalytics: boolean;
  canViewReports: boolean;
  canViewSubscriptions: boolean;
  canViewTeam: boolean;
  canViewSettings: boolean;
  canViewIntegrations: boolean;
  
  // Actions
  canCreatePayments: boolean;
  canRefundPayments: boolean;
  canManageWallets: boolean;
  canManageTeam: boolean;
  canManageBilling: boolean;
  canAccessAPI: boolean;
  canManageWebhooks: boolean;
  canViewFinancialData: boolean;
  canExportData: boolean;
  
  // UI Elements
  canSeeRevenue: boolean;
  canSeeWallets: boolean;
  canSeeFullTransactionDetails: boolean;
}

const ROLE_PERMISSIONS: Record<MerchantRole, PermissionConfig> = {
  [MerchantRole.OWNER]: {
    // Navigation
    canViewOverview: true,
    canViewTransactions: true,
    canViewPaymentLinks: true,
    canViewInvoices: true,
    canViewAnalytics: true,
    canViewReports: true,
    canViewSubscriptions: true,
    canViewTeam: true,
    canViewSettings: true,
    canViewIntegrations: true,
    
    // Actions
    canCreatePayments: true,
    canRefundPayments: true,
    canManageWallets: true,
    canManageTeam: true,
    canManageBilling: true,
    canAccessAPI: true,
    canManageWebhooks: true,
    canViewFinancialData: true,
    canExportData: true,
    
    // UI Elements
    canSeeRevenue: true,
    canSeeWallets: true,
    canSeeFullTransactionDetails: true,
  },
  
  [MerchantRole.ADMIN]: {
    // Navigation
    canViewOverview: true,
    canViewTransactions: true,
    canViewPaymentLinks: true,
    canViewInvoices: true,
    canViewAnalytics: true,
    canViewReports: true,
    canViewSubscriptions: true,
    canViewTeam: true,
    canViewSettings: true,
    canViewIntegrations: true,
    
    // Actions
    canCreatePayments: true,
    canRefundPayments: true,
    canManageWallets: true,
    canManageTeam: true,
    canManageBilling: false, // Only owner can manage billing
    canAccessAPI: true,
    canManageWebhooks: true,
    canViewFinancialData: true,
    canExportData: true,
    
    // UI Elements
    canSeeRevenue: true,
    canSeeWallets: true,
    canSeeFullTransactionDetails: true,
  },
  
  [MerchantRole.DEVELOPER]: {
    // Navigation
    canViewOverview: true,
    canViewTransactions: true,
    canViewPaymentLinks: true,
    canViewInvoices: false,
    canViewAnalytics: true,
    canViewReports: false,
    canViewSubscriptions: true,
    canViewTeam: false,
    canViewSettings: true, // For API keys
    canViewIntegrations: true,
    
    // Actions
    canCreatePayments: true,
    canRefundPayments: false,
    canManageWallets: false,
    canManageTeam: false,
    canManageBilling: false,
    canAccessAPI: true,
    canManageWebhooks: true,
    canViewFinancialData: false, // Can see transaction counts but not revenue
    canExportData: false,
    
    // UI Elements
    canSeeRevenue: false,
    canSeeWallets: false,
    canSeeFullTransactionDetails: true,
  },
  
  [MerchantRole.FINANCE]: {
    // Navigation
    canViewOverview: true,
    canViewTransactions: true,
    canViewPaymentLinks: false,
    canViewInvoices: true,
    canViewAnalytics: true,
    canViewReports: true,
    canViewSubscriptions: true,
    canViewTeam: false,
    canViewSettings: false,
    canViewIntegrations: false,
    
    // Actions
    canCreatePayments: false,
    canRefundPayments: true,
    canManageWallets: false,
    canManageTeam: false,
    canManageBilling: false,
    canAccessAPI: false,
    canManageWebhooks: false,
    canViewFinancialData: true,
    canExportData: true,
    
    // UI Elements
    canSeeRevenue: true,
    canSeeWallets: true,
    canSeeFullTransactionDetails: true,
  },
  
  [MerchantRole.VIEWER]: {
    // Navigation
    canViewOverview: true,
    canViewTransactions: true,
    canViewPaymentLinks: false,
    canViewInvoices: false,
    canViewAnalytics: true,
    canViewReports: false,
    canViewSubscriptions: false,
    canViewTeam: false,
    canViewSettings: false,
    canViewIntegrations: false,
    
    // Actions
    canCreatePayments: false,
    canRefundPayments: false,
    canManageWallets: false,
    canManageTeam: false,
    canManageBilling: false,
    canAccessAPI: false,
    canManageWebhooks: false,
    canViewFinancialData: false,
    canExportData: false,
    
    // UI Elements
    canSeeRevenue: false,
    canSeeWallets: false,
    canSeeFullTransactionDetails: false,
  },
};

export function getUserRole(): MerchantRole | null {
  // Check if team member
  const teamMemberStr = localStorage.getItem('team_member');
  if (teamMemberStr) {
    try {
      const teamMember = JSON.parse(teamMemberStr);
      return teamMember.role as MerchantRole;
    } catch (e) {
      // Failed to parse team member data
    }
  }
  
  // Check if merchant owner (always has owner role)
  const merchantToken = localStorage.getItem('merchant_token');
  if (merchantToken) {
    return MerchantRole.OWNER;
  }
  
  return null;
}

export function getPermissions(): PermissionConfig {
  const role = getUserRole();
  if (!role) {
    // Default to viewer permissions if no role found
    return ROLE_PERMISSIONS[MerchantRole.VIEWER];
  }
  
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[MerchantRole.VIEWER];
}

export function hasPermission(permission: keyof PermissionConfig): boolean {
  const permissions = getPermissions();
  return permissions[permission];
}

export function getUserInfo() {
  // Check if team member
  const teamMemberStr = localStorage.getItem('team_member');
  if (teamMemberStr) {
    try {
      const teamMember = JSON.parse(teamMemberStr);
      return {
        email: teamMember.email,
        name: teamMember.name || teamMember.email.split('@')[0],
        role: teamMember.role as MerchantRole,
        isTeamMember: true,
        organizationName: 'Organization', // Could be fetched from API
      };
    } catch (e) {
      // Failed to parse team member data
    }
  }
  
  // Check if merchant owner
  const merchantEmail = localStorage.getItem('merchant_email');
  const merchantName = localStorage.getItem('merchant_name');
  const organizationName = localStorage.getItem('organization_name');
  
  if (merchantEmail) {
    return {
      email: merchantEmail,
      name: merchantName || merchantEmail.split('@')[0],
      role: MerchantRole.OWNER,
      isTeamMember: false,
      organizationName: organizationName || 'Organization',
    };
  }
  
  return null;
}

export function getRoleLabel(role: MerchantRole): string {
  const labels: Record<MerchantRole, string> = {
    [MerchantRole.OWNER]: 'Owner',
    [MerchantRole.ADMIN]: 'Admin',
    [MerchantRole.DEVELOPER]: 'Developer',
    [MerchantRole.FINANCE]: 'Finance',
    [MerchantRole.VIEWER]: 'Viewer',
  };
  
  return labels[role] || 'Unknown';
}
