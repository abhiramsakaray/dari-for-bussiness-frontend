import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logoUrl from '../../../assets/logo.png';
import {
  LayoutDashboard,
  CreditCard,
  Plus,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Code,
  Link as LinkIcon,
  FileText,
  RefreshCw,
  BarChart3,
  Users,
  Repeat,
  Wallet,
  Wallet2,
  ArrowUpLeft,
  UserCircle2,
  ChevronDown,
  ChevronRight,
  Tag,
} from "lucide-react";
import { Button } from "./ui/button";

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

interface DashboardLayoutProps {
  children: React.ReactNode;
  activePage: string;
  isAdmin?: boolean;
}

// Which group IDs start expanded
function getDefaultOpenGroups(activePage: string): Record<string, boolean> {
  const allGroups: Record<string, string[]> = {
    payments: ['overview', 'payments', 'payer-leads', 'create', 'payment-links', 'invoices', 'subscriptions', 'coupons', 'refunds'],
    business: ['analytics', 'team', 'wallets', 'withdrawals', 'billing'],
    developer: ['integrations', 'settings'],
  };
  const open: Record<string, boolean> = { payments: true, business: true, developer: false };
  for (const [group, ids] of Object.entries(allGroups)) {
    if (ids.includes(activePage)) open[group] = true;
  }
  return open;
}

export function DashboardLayout({ children, activePage, isAdmin = false }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    () => getDefaultOpenGroups(activePage)
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const subId = params.get('subscription_id');
    const status = params.get('status');
    if (subId && status === 'PENDING_PAYMENT') {
      toast.success('Subscription pending! The network is confirming your transaction.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('merchant_token');
    navigate('/');
  };

  const toggleGroup = (id: string) =>
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));

  const merchantNavGroups: NavGroup[] = [
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      items: [
        { id: 'overview',       label: 'Overview',       icon: LayoutDashboard, href: '/dashboard' },
        { id: 'payments',       label: 'Transactions',   icon: CreditCard,      href: '/dashboard/payments' },
        { id: 'payer-leads',    label: 'Payer Leads',    icon: UserCircle2,     href: '/dashboard/payer-leads' },
        { id: 'create',         label: 'Create Payment', icon: Plus,            href: '/dashboard/create' },
        { id: 'payment-links',  label: 'Payment Links',  icon: LinkIcon,        href: '/payment-links-dashboard' },
        { id: 'invoices',       label: 'Invoices',       icon: FileText,        href: '/invoices-dashboard' },
        { id: 'subscriptions',  label: 'Subscriptions',  icon: Repeat,          href: '/subscriptions-dashboard' },
        { id: 'coupons',        label: 'Promo Codes',    icon: Tag,             href: '/dashboard/coupons' },
        { id: 'refunds',        label: 'Refunds',        icon: RefreshCw,       href: '/refunds' },
      ],
    },
    {
      id: 'business',
      label: 'Business',
      icon: BarChart3,
      items: [
        { id: 'analytics',   label: 'Analytics',    icon: BarChart3,  href: '/analytics-dashboard' },
        { id: 'team',        label: 'Team',         icon: Users,      href: '/team' },
        { id: 'wallets',     label: 'Wallets',      icon: Wallet2,    href: '/wallets' },
        { id: 'withdrawals', label: 'Withdrawals',  icon: ArrowUpLeft,href: '/withdrawals' },
        { id: 'billing',     label: 'Billing',      icon: Wallet,     href: '/billing' },
      ],
    },
    {
      id: 'developer',
      label: 'Developer',
      icon: Code,
      items: [
        { id: 'integrations', label: 'Integrations', icon: Code,     href: '/dashboard/integrations' },
        { id: 'settings',     label: 'Settings',     icon: Settings, href: '/dashboard/settings' },
      ],
    },
  ];

  const adminNavGroups: NavGroup[] = [
    {
      id: 'admin',
      label: 'Admin',
      icon: ShieldCheck,
      items: [
        { id: 'merchants', label: 'Merchants',    icon: ShieldCheck, href: '/admin' },
        { id: 'payments',  label: 'All Payments', icon: CreditCard,  href: '/admin/payments' },
      ],
    },
  ];

  const navGroups = isAdmin ? adminNavGroups : merchantNavGroups;
  const merchantEmail = localStorage.getItem('merchant_email') || 'merchant@dari.io';
  const initials = merchantEmail.slice(0, 2).toUpperCase();

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo - Compact */}
      <div className="h-14 flex items-center px-6 border-b border-border/60 shrink-0">
        <img src={logoUrl} alt="ChainPe" className="h-8 w-auto" />
      </div>

      {/* Navigation - Compact spacing to fit all items */}
      <nav className="flex-1 px-4 py-2 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
        {navGroups.map((group) => {
          const GroupIcon = group.icon;
          const isExpanded = openGroups[group.id] ?? true;
          const hasActive = group.items.some(i => i.id === activePage);

          return (
            <div key={group.id} className="flex flex-col">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition-all duration-150 group ${
                  hasActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <GroupIcon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-xs font-bold uppercase tracking-wider">
                  {group.label}
                </span>
                {isExpanded
                  ? <ChevronDown className="h-3 w-3 opacity-60" />
                  : <ChevronRight className="h-3 w-3 opacity-60" />}
              </button>

              {/* Group Children */}
              {isExpanded && (
                <div className="ml-3 pl-3 border-l-2 border-border/40 flex flex-col gap-0.5 mb-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;
                    return (
                      <Link
                        key={item.id}
                        to={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                          isActive
                            ? 'bg-primary/15 text-primary font-semibold'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                        <span className="truncate">{item.label}</span>
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Section - Compact */}
      <div className="px-4 pb-3 pt-2 border-t border-border/60 shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/40 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-primary">{initials}</span>
          </div>
          <p className="text-xs text-muted-foreground truncate flex-1">{merchantEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-72 border-r border-border/60 bg-card/95 backdrop-blur-sm transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="md:ml-72">
        <main className="p-6 md:p-8">{children}</main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}