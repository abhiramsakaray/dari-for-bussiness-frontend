import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  DollarSign,
  Package,
  Search,
  Filter,
  Download,
  Plus,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react";
import { BentoLayout } from "./BentoLayout";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { 
  DataCard, 
  DataCardHeader, 
  DataCardTitle, 
  DataCardContent,
  DataCardDescription 
} from "./ui/data-card";
import { MetricDisplay } from "./ui/metric-display";
import { EmptyState } from "./ui/empty-state";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableCell,
} from "./ui/data-table";

export function DariDesignShowcase() {
  return (
    <BentoLayout activePage="overview">
      <div className="container-dari space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-page-title">Dari Design System</h1>
          <p className="text-body text-muted-foreground">
            Complete implementation of the Dari for Business design system in React + TypeScript + Tailwind CSS
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DataCard>
            <DataCardHeader>
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-foreground" />
              </div>
              <Badge variant="success">ACTIVE</Badge>
            </DataCardHeader>
            <DataCardContent>
              <MetricDisplay
                value="$45,231"
                label="TOTAL REVENUE"
                trend={{ value: 12.5, direction: "up" }}
              />
            </DataCardContent>
          </DataCard>

          <DataCard>
            <DataCardHeader>
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Users className="h-5 w-5 text-foreground" />
              </div>
              <Badge variant="pending">PENDING</Badge>
            </DataCardHeader>
            <DataCardContent>
              <MetricDisplay
                value="2,350"
                label="TOTAL USERS"
                trend={{ value: 8.2, direction: "up" }}
              />
            </DataCardContent>
          </DataCard>

          <DataCard>
            <DataCardHeader>
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-foreground" />
              </div>
              <Badge variant="info">INFO</Badge>
            </DataCardHeader>
            <DataCardContent>
              <MetricDisplay
                value="573"
                label="TRANSACTIONS"
                trend={{ value: 3.1, direction: "down" }}
              />
            </DataCardContent>
          </DataCard>

          <DataCard>
            <DataCardHeader>
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Package className="h-5 w-5 text-foreground" />
              </div>
              <Badge variant="destructive">FAILED</Badge>
            </DataCardHeader>
            <DataCardContent>
              <MetricDisplay
                value="12"
                label="FAILED ORDERS"
                trend={{ value: 2.4, direction: "down" }}
              />
            </DataCardContent>
          </DataCard>
        </div>

        {/* Button Showcase */}
        <DataCard hover={false}>
          <DataCardHeader>
            <DataCardTitle>Button Variants</DataCardTitle>
          </DataCardHeader>
          <DataCardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Primary Button</Button>
              <Button variant="outline">Secondary Button</Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
              <Button variant="destructive">Delete</Button>
              <Button variant="link">Link Button</Button>
              <Button variant="default" disabled>Disabled</Button>
            </div>
          </DataCardContent>
        </DataCard>

        {/* Badge Showcase */}
        <DataCard hover={false}>
          <DataCardHeader>
            <DataCardTitle>Status Badges</DataCardTitle>
          </DataCardHeader>
          <DataCardContent>
            <div className="flex flex-wrap gap-3">
              <Badge variant="success">ACTIVE</Badge>
              <Badge variant="pending">PENDING</Badge>
              <Badge variant="destructive">FAILED</Badge>
              <Badge variant="info">INFO</Badge>
              <Badge variant="warning">WARNING</Badge>
              <Badge variant="default">DEFAULT</Badge>
              <Badge variant="success" pulse>LIVE</Badge>
            </div>
          </DataCardContent>
        </DataCard>

        {/* Form Elements */}
        <DataCard hover={false}>
          <DataCardHeader>
            <DataCardTitle>Form Elements</DataCardTitle>
          </DataCardHeader>
          <DataCardContent>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <Input type="email" placeholder="Enter your email..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-10" placeholder="Search transactions..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Disabled Input</label>
                <Input disabled placeholder="Disabled field" />
              </div>
            </div>
          </DataCardContent>
        </DataCard>

        {/* Data Table */}
        <DataCard hover={false}>
          <DataCardHeader>
            <div className="flex-1">
              <DataCardTitle>Recent Transactions</DataCardTitle>
              <DataCardDescription className="mt-1">
                A list of your recent payment transactions
              </DataCardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                New
              </Button>
            </div>
          </DataCardHeader>
          <DataCardContent>
            <DataTable>
              <DataTableHeader>
                <DataTableRow>
                  <DataTableHead>ID</DataTableHead>
                  <DataTableHead>Customer</DataTableHead>
                  <DataTableHead>Amount</DataTableHead>
                  <DataTableHead>Status</DataTableHead>
                  <DataTableHead>Date</DataTableHead>
                  <DataTableHead className="text-right">Actions</DataTableHead>
                </DataTableRow>
              </DataTableHeader>
              <DataTableBody>
                <DataTableRow>
                  <DataTableCell className="font-mono text-xs">#TXN-001</DataTableCell>
                  <DataTableCell>John Doe</DataTableCell>
                  <DataTableCell className="font-semibold">$1,234.56</DataTableCell>
                  <DataTableCell>
                    <Badge variant="success">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      COMPLETED
                    </Badge>
                  </DataTableCell>
                  <DataTableCell secondary className="font-mono text-xs">
                    2024-04-11
                  </DataTableCell>
                  <DataTableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell className="font-mono text-xs">#TXN-002</DataTableCell>
                  <DataTableCell>Jane Smith</DataTableCell>
                  <DataTableCell className="font-semibold">$856.00</DataTableCell>
                  <DataTableCell>
                    <Badge variant="pending">
                      <Clock className="h-3 w-3 mr-1" />
                      PENDING
                    </Badge>
                  </DataTableCell>
                  <DataTableCell secondary className="font-mono text-xs">
                    2024-04-11
                  </DataTableCell>
                  <DataTableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell className="font-mono text-xs">#TXN-003</DataTableCell>
                  <DataTableCell>Bob Johnson</DataTableCell>
                  <DataTableCell className="font-semibold">$432.10</DataTableCell>
                  <DataTableCell>
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      FAILED
                    </Badge>
                  </DataTableCell>
                  <DataTableCell secondary className="font-mono text-xs">
                    2024-04-10
                  </DataTableCell>
                  <DataTableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DataTableCell>
                </DataTableRow>
              </DataTableBody>
            </DataTable>
          </DataCardContent>
        </DataCard>

        {/* Empty State */}
        <DataCard hover={false}>
          <DataCardHeader>
            <DataCardTitle>Empty State Example</DataCardTitle>
          </DataCardHeader>
          <DataCardContent>
            <EmptyState
              icon={AlertCircle}
              title="No data found"
              description="Get started by creating your first transaction or importing existing data."
              action={{
                label: "Create Transaction",
                onClick: () => alert("Create clicked!"),
              }}
            />
          </DataCardContent>
        </DataCard>

        {/* Typography Showcase */}
        <DataCard hover={false}>
          <DataCardHeader>
            <DataCardTitle>Typography System</DataCardTitle>
          </DataCardHeader>
          <DataCardContent className="space-y-6">
            <div>
              <h1 className="text-page-title mb-2">Page Title (32-48px)</h1>
              <p className="text-metadata font-mono text-muted-foreground">
                Font: Sora, Weight: 700, Letter-spacing: -0.04em
              </p>
            </div>
            <div>
              <h2 className="text-section-title mb-2">Section Title (20-26px)</h2>
              <p className="text-metadata font-mono text-muted-foreground">
                Font: Sora, Weight: 700, Letter-spacing: -0.035em
              </p>
            </div>
            <div>
              <h3 className="text-card-title mb-2">Card Title (14-15px)</h3>
              <p className="text-metadata font-mono text-muted-foreground">
                Font: Sora, Weight: 600, Letter-spacing: -0.02em
              </p>
            </div>
            <div>
              <p className="text-body mb-2">
                Body text with proper line height and spacing for optimal readability.
                This follows the Dari design system specifications.
              </p>
              <p className="text-metadata font-mono text-muted-foreground">
                Font: Sora, Weight: 300/400, Line-height: 1.6-1.7
              </p>
            </div>
            <div>
              <span className="text-label">LABEL TEXT</span>
              <p className="text-metadata font-mono text-muted-foreground mt-2">
                Font: DM Mono, Weight: 500, Uppercase
              </p>
            </div>
          </DataCardContent>
        </DataCard>

        {/* Color Palette */}
        <DataCard hover={false}>
          <DataCardHeader>
            <DataCardTitle>Color Palette</DataCardTitle>
          </DataCardHeader>
          <DataCardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="h-20 rounded-lg bg-foreground mb-2"></div>
                <p className="text-xs font-mono">#09090B</p>
                <p className="text-xs text-muted-foreground">Primary</p>
              </div>
              <div>
                <div className="h-20 rounded-lg bg-muted-foreground mb-2"></div>
                <p className="text-xs font-mono">#71717A</p>
                <p className="text-xs text-muted-foreground">Secondary</p>
              </div>
              <div>
                <div className="h-20 rounded-lg bg-success mb-2"></div>
                <p className="text-xs font-mono">#22c55e</p>
                <p className="text-xs text-muted-foreground">Success</p>
              </div>
              <div>
                <div className="h-20 rounded-lg bg-destructive mb-2"></div>
                <p className="text-xs font-mono">#ef4444</p>
                <p className="text-xs text-muted-foreground">Error</p>
              </div>
            </div>
          </DataCardContent>
        </DataCard>
      </div>
    </BentoLayout>
  );
}
