import { useState, useEffect, useRef } from "react";
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
  LogOut
} from "lucide-react";

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
      { id: 'overview', label: 'Overview', icon: LayoutGrid, href: '#/dashboard' },
      { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight, href: '#/dashboard/payments' },
      { id: 'payment-links', label: 'Payment Links', icon: FileText, href: '#/payment-links' },
      { id: 'invoices', label: 'Invoices', icon: FileText, href: '#/invoices' },
    ],
  },
  {
    id: 'business',
    label: 'Business',
    icon: BarChart3,
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '#/analytics' },
      { id: 'reports', label: 'Reports', icon: FileText, href: '#/reports' },
      { id: 'subscriptions', label: 'Subscriptions', icon: Users, href: '#/subscriptions' },
      { id: 'team', label: 'Team', icon: Users, href: '#/team' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    items: [
      { id: 'settings', label: 'Settings', icon: Settings, href: '#/dashboard/settings' },
      { id: 'integrations', label: 'Integrations', icon: Settings, href: '#/dashboard/integrations' },
      { id: 'help', label: 'Help & Support', icon: HelpCircle, href: '#/dashboard/settings' },
    ],
  },
];

const topNavItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid, href: '#/dashboard' },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight, href: '#/dashboard/payments' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '#/analytics' },
  { id: 'reports', label: 'Reports', icon: FileText, href: '#/reports' },
  { id: 'users', label: 'Users', icon: Users, href: '#/team' },
];

export function BentoLayout({ children, activePage }: BentoLayoutProps) {
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
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    payments: true,
    business: true,
    settings: false,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebar_open', String(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Get real user data from localStorage
  const merchantEmail = localStorage.getItem('merchant_email') || 'user@dari.io';
  const merchantName = localStorage.getItem('merchant_name') || merchantEmail.split('@')[0];
  const organizationName = localStorage.getItem('organization_name') || 'Organization';
  
  // Generate initials from email or name
  const getInitials = (email: string) => {
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };
  
  const initials = getInitials(merchantEmail);

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
    localStorage.removeItem('merchant_token');
    window.location.href = '#/';
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
            <div className="font-mono text-[17px] font-semibold text-foreground">
              dari.
            </div>
          </div>

          {/* Center Zone - Desktop Nav */}
          <div className="hidden lg:flex items-center gap-9">
            {topNavItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`text-[13px] font-medium transition-dari ${
                  activePage === item.id
                    ? 'text-foreground border-b-2 border-foreground pb-0.5'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </a>
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

                  {/* Menu Items */}
                  <button className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-dari text-left">
                    <Users className="h-4 w-4 text-foreground mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="text-[13px] font-medium text-foreground">Team</div>
                      <div className="text-[12px] text-muted-foreground">Manage members & roles</div>
                    </div>
                  </button>

                  <button className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-dari text-left">
                    <User className="h-4 w-4 text-foreground mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="text-[13px] font-medium text-foreground">My Account</div>
                      <div className="text-[12px] text-muted-foreground">Profile, security, billing</div>
                    </div>
                  </button>

                  <button className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-dari text-left">
                    <div className="flex items-center gap-3">
                      <Command className="h-4 w-4 text-foreground shrink-0" />
                      <div className="text-[13px] font-medium text-foreground">Keyboard shortcuts</div>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">⌘K</span>
                  </button>

                  <div className="h-px bg-border my-1.5"></div>

                  {/* Danger Item */}
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
            {navGroups.map((group) => {
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
                          <a
                            key={item.id}
                            href={item.href}
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
                          </a>
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
                    <span className="text-[10px] font-mono text-muted-foreground">Admin</span>
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
