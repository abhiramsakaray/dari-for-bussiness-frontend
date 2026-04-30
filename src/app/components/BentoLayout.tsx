import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Menu, 
  X, 
  Search, 
  Bell, 
  ChevronDown,
  LayoutGrid,
  ArrowLeftRight,
  BarChart3,
  FileText,
  Users,
  Settings,
  HelpCircle,
  User,
  Command,
  LogOut,
  Tag,
  Plus,
  UserCircle2,
  Repeat,
  RefreshCw,
  Wallet2,
  ArrowUpLeft,
  Wallet
} from "lucide-react";
import { getPermissions, getUserInfo, getRoleLabel } from "../../utils/rolePermissions";

interface BentoLayoutProps {
  children: React.ReactNode;
  activePage: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
}

interface NavGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: 'payments',
    label: 'Payments',
    icon: LayoutGrid,
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutGrid, href: '/dashboard' },
      { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight, href: '/dashboard/payments' },
      { id: 'payer-leads', label: 'Payer Leads', icon: UserCircle2, href: '/dashboard/payer-leads' },
      { id: 'create', label: 'Create Payment', icon: Plus, href: '/dashboard/create' },
      { id: 'payment-links', label: 'Payment Links', icon: FileText, href: '/payment-links-dashboard' },
      { id: 'invoices', label: 'Invoices', icon: FileText, href: '/invoices-dashboard' },
      { id: 'subscriptions', label: 'Subscriptions', icon: Repeat, href: '/subscriptions-dashboard' },
      { id: 'coupons', label: 'Promo Codes', icon: Tag, href: '/dashboard/coupons' },
      { id: 'refunds', label: 'Refunds', icon: RefreshCw, href: '/refunds' },
    ],
  },
  {
    id: 'business',
    label: 'Business',
    icon: BarChart3,
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics-dashboard' },
      { id: 'reports', label: 'Reports', icon: FileText, href: '/reports' },
      { id: 'team', label: 'Team', icon: Users, href: '/team' },
      { id: 'wallets', label: 'Wallets', icon: Wallet2, href: '/wallets' },
      { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpLeft, href: '/withdrawals' },
      { id: 'billing', label: 'Billing & Plans', icon: Wallet, href: '/billing' },
      { id: 'usage', label: 'Usage & Limits', icon: BarChart3, href: '/usage' },
    ],
  },
  {
    id: 'developer',
    label: 'Developer',
    icon: Settings,
    items: [
      { id: 'development', label: 'Development', icon: FileText, href: '/developer/guide' },
      { id: 'code-with-ai', label: 'Code with AI', icon: Command, href: '/developer/ai' },
      { id: 'integrations', label: 'Integrations', icon: Settings, href: '/dashboard/integrations' },
      { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
    ],
  },
];

const topNavItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid, href: '/dashboard' },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight, href: '/dashboard/payments' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics-dashboard' },
  { id: 'reports', label: 'Reports', icon: FileText, href: '/reports' },
  { id: 'users', label: 'Users', icon: Users, href: '/team' },
];

export function BentoLayout({ children, activePage }: BentoLayoutProps) {
  const navigate = useNavigate();
  // Get user permissions
  const permissions = getPermissions();
  const userInfo = getUserInfo();
  
  // Persist sidebar state in localStorage
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebar_open');
    return saved !== null ? saved === 'true' : true;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved !== null ? saved === 'true' : false;
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('sidebar_expanded_groups');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrate old 'settings' group to 'developer'
        if ('settings' in parsed && !('developer' in parsed)) {
          parsed.developer = parsed.settings;
          delete parsed.settings;
          localStorage.setItem('sidebar_expanded_groups', JSON.stringify(parsed));
        }
        return parsed;
      } catch {
        // Fallback to defaults if parsing fails
      }
    }
    return {
      payments: true,
      business: true,
      developer: true, // Changed to true so Developer group is expanded by default
    };
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebar_open', String(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Save expanded groups state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar_expanded_groups', JSON.stringify(expandedGroups));
  }, [expandedGroups]);

  // Get real user data from localStorage or userInfo
  const merchantEmail = userInfo?.email || localStorage.getItem('merchant_email') || 'user@dari.io';
  const merchantName = userInfo?.name || localStorage.getItem('merchant_name') || merchantEmail.split('@')[0];
  const organizationName = userInfo?.organizationName || localStorage.getItem('organization_name') || 'Organization';
  const userRole = userInfo?.role ? getRoleLabel(userInfo.role) : 'Admin';
  
  // Generate initials from email or name
  const getInitials = (email: string) => {
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };
  
  const initials = getInitials(merchantEmail);

  // Filter navigation items based on permissions
  const filteredNavGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      switch (item.id) {
        case 'overview':
          return permissions.canViewOverview;
        case 'transactions':
          return permissions.canViewTransactions;
        case 'payer-leads':
          return permissions.canViewTransactions; // Same permission as transactions
        case 'create':
          return permissions.canViewTransactions; // Can create if can view transactions
        case 'payment-links':
          return permissions.canViewPaymentLinks;
        case 'invoices':
          return permissions.canViewInvoices;
        case 'subscriptions':
          return permissions.canViewSubscriptions;
        case 'coupons':
          return true; // Available to all
        case 'refunds':
          return permissions.canViewTransactions; // Same as transactions
        case 'analytics':
          return permissions.canViewAnalytics;
        case 'reports':
          return permissions.canViewReports;
        case 'team':
          return permissions.canViewTeam;
        case 'wallets':
          return true; // Available to all
        case 'withdrawals':
          return true; // Available to all
        case 'billing':
          return permissions.canManageBilling;
        case 'usage':
          return permissions.canManageBilling; // Same permission as billing
        case 'development':
          return true; // Available to all
        case 'code-with-ai':
          return true; // Available to all
        case 'settings':
          return permissions.canViewSettings;
        case 'integrations':
          return permissions.canViewIntegrations;
        default:
          return true;
      }
    })
  })).filter(group => group.items.length > 0); // Remove empty groups

  const filteredTopNavItems = topNavItems.filter(item => {
    switch (item.id) {
      case 'overview':
        return permissions.canViewOverview;
      case 'transactions':
        return permissions.canViewTransactions;
      case 'analytics':
        return permissions.canViewAnalytics;
      case 'reports':
        return permissions.canViewReports;
      case 'users':
        return permissions.canViewTeam;
      default:
        return true;
    }
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
        setMobileMenuOpen(false);
      } else if (window.innerWidth >= 768) {
        setSidebarOpen(true);
        setMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleLogout = () => {
    // Clear both merchant and team member tokens
    localStorage.removeItem('merchant_token');
    localStorage.removeItem('team_access_token');
    localStorage.removeItem('team_refresh_token');
    localStorage.removeItem('team_member');
    navigate('/');
  };

  const sidebarWidth = sidebarCollapsed ? 80 : 280;

  return (
    <div className="min-h-screen bg-white">
      {/* Glassmorphism Navbar */}
      <nav 
        className="fixed top-0 left-0 right-0 h-16 z-[200] px-6"
        style={{
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        }}
      >
        <div className="h-full flex items-center justify-between">
          {/* Left Zone */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-dari"
              aria-label="Toggle sidebar"
            >
              {(mobileMenuOpen || (sidebarOpen && !sidebarCollapsed)) ? (
                <X className="h-6 w-6 text-foreground transition-transform duration-250" />
              ) : (
                <Menu className="h-6 w-6 text-foreground transition-transform duration-250" />
              )}
            </button>
            <Link to="/dashboard" className="flex items-center">
              <img src="/daripayments_green_logo.png" alt="Dari Payments" className="h-7" />
            </Link>
          </div>

          {/* Center Zone - Desktop Nav */}
          <div className="hidden lg:flex items-center gap-9">
            {filteredTopNavItems.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className={`text-[13px] font-medium transition-dari ${
                  activePage === item.id
                    ? 'text-foreground border-b-2 border-foreground pb-0.5'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Zone */}
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-dari">
              <Search className="h-5 w-5 text-muted-foreground" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-dari relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
            </button>
            
            <div className="w-px h-5 bg-border mx-1"></div>

            {/* Account Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted transition-dari"
              >
                <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
                  <span className="text-[12px] font-mono font-medium text-white">{initials}</span>
                </div>
                <span className="hidden md:block text-[13px] font-medium text-foreground">{merchantName}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Panel */}
              {dropdownOpen && (
                <div 
                  className="absolute top-[calc(100%+8px)] right-0 w-[220px] bg-card border border-border rounded-[14px] p-2 z-[300] animate-in fade-in slide-in-from-top-2 duration-180"
                  style={{
                    boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)'
                  }}
                >
                  {/* Header */}
                  <div className="px-3 py-2.5 mb-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center shrink-0">
                        <span className="text-[12px] font-mono font-medium text-white">{initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-foreground truncate">{merchantName}</div>
                        <div className="text-[11px] font-mono text-muted-foreground truncate">{merchantEmail}</div>
                      </div>
                    </div>
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-muted border border-border">
                      <span className="text-[10px] font-mono text-foreground">{organizationName} · Pro</span>
                    </div>
                  </div>

                  <div className="h-px bg-border my-1.5"></div>

                  {/* Logout Button */}
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive-bg transition-dari text-left"
                  >
                    <LogOut className="h-4 w-4 text-destructive shrink-0" />
                    <div className="text-[13px] font-medium text-destructive">Log out</div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] bg-white z-[100] transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
          mobileMenuOpen ? 'translate-x-0' : window.innerWidth < 768 ? '-translate-x-full' : 'translate-x-0'
        }`}
        style={{
          width: window.innerWidth < 768 ? '280px' : `${sidebarWidth}px`
        }}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Nav Items */}
          <div className="flex-1 px-3 py-5 space-y-1 overflow-y-auto overflow-x-hidden">
            {filteredNavGroups.map((group) => {
              const isExpanded = expandedGroups[group.id];

              return (
                <div key={group.id} className="mb-2">
                  {/* Group Header */}
                  {!sidebarCollapsed && (
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-mono font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-dari"
                    >
                      <span className="truncate">{group.label}</span>
                      <ChevronDown 
                        className={`h-3 w-3 transition-transform duration-200 flex-shrink-0 ${isExpanded ? '' : '-rotate-90'}`}
                      />
                    </button>
                  )}

                  {/* Group Items */}
                  {(isExpanded || sidebarCollapsed) && (
                    <div className={sidebarCollapsed ? '' : 'ml-2 space-y-0.5'}>
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activePage === item.id;
                        
                        return (
                          <Link
                            key={item.id}
                            to={item.href}
                            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] transition-dari group relative ${
                              isActive
                                ? 'bg-foreground text-white'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            } ${sidebarCollapsed ? 'justify-center' : ''}`}
                            title={sidebarCollapsed ? item.label : undefined}
                          >
                            <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-white' : ''}`} />
                            {!sidebarCollapsed && (
                              <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                            )}
                            
                            {/* Tooltip for collapsed state */}
                            {sidebarCollapsed && (
                              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-foreground text-white text-[12px] font-mono rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[400]">
                                {item.label}
                              </div>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Profile */}
          {!sidebarCollapsed && (
            <div className="border-t border-border p-3">
              <div className="flex items-center gap-2.5 px-2 py-2">
                <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-mono font-medium text-white">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-foreground truncate">{merchantName}</div>
                  <div className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-muted">
                    <span className="text-[10px] font-mono text-muted-foreground">{userRole}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {sidebarCollapsed && (
            <div className="border-t border-border p-3 flex justify-center">
              <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center">
                <span className="text-[11px] font-mono font-medium text-white">{initials}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && window.innerWidth < 768 && (
        <div
          className="fixed inset-0 bg-black/30 z-[90] md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main
        className="transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] min-h-[calc(100vh-64px)]"
        style={{
          marginLeft: window.innerWidth < 768 ? 0 : `${sidebarWidth}px`,
          padding: window.innerWidth < 768 ? '96px 16px 16px' : '96px 40px 40px'
        }}
      >
        {children}
      </main>
    </div>
  );
}
