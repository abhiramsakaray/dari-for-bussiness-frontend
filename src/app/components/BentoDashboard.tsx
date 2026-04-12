import { BentoLayout } from "./BentoLayout";
import {
  BentoGrid,
  BentoCard,
  BentoCardHeader,
  BentoCardTitle,
  BentoCardSubtitle,
  BentoCardContent,
  BentoKPICard,
} from "./ui/bento-grid";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableCell,
} from "./ui/data-table";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  FileText,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

export function BentoDashboard() {
  return (
    <BentoLayout activePage="overview">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight text-foreground">
              Overview
            </h1>
            <p className="text-[13px] text-muted-foreground mt-1">
              Welcome back, Nour. Here's what's happening with your properties today.
            </p>
          </div>
          <Button>
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
        </div>

        {/* Row 1 - KPI Cards */}
        <BentoGrid>
          <BentoKPICard
            label="TOTAL REVENUE"
            value="$2.4M"
            trend={{ value: 12.5, direction: "up" }}
          />
          <BentoKPICard
            label="ACTIVE LEASES"
            value="847"
            trend={{ value: 3.2, direction: "up" }}
          />
          <BentoKPICard
            label="PENDING PAYMENTS"
            value="23"
            trend={{ value: 8.1, direction: "down" }}
          />
          <BentoKPICard
            label="OCCUPANCY RATE"
            value="94.2%"
            trend={{ value: 2.3, direction: "up" }}
          />
        </BentoGrid>

        {/* Row 2 - Chart + Breakdown */}
        <BentoGrid>
          {/* Revenue Overview Chart */}
          <BentoCard span={8} rowSpan={2}>
            <BentoCardHeader>
              <div>
                <BentoCardTitle>Revenue Overview</BentoCardTitle>
                <BentoCardSubtitle>Monthly revenue trend for 2024</BentoCardSubtitle>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Month
                </Button>
                <Button variant="ghost" size="sm">
                  Year
                </Button>
              </div>
            </BentoCardHeader>
            <BentoCardContent>
              <div className="h-[280px] flex items-end justify-between gap-2">
                {/* Simple bar chart visualization */}
                {[65, 78, 82, 90, 75, 88, 95, 85, 92, 88, 94, 98].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary/80"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </BentoCardContent>
          </BentoCard>

          {/* Portfolio Breakdown */}
          <BentoCard span={4} rowSpan={2}>
            <BentoCardHeader>
              <div>
                <BentoCardTitle>Portfolio Breakdown</BentoCardTitle>
                <BentoCardSubtitle>By property type</BentoCardSubtitle>
              </div>
            </BentoCardHeader>
            <BentoCardContent>
              {/* Donut Chart Placeholder */}
              <div className="flex items-center justify-center h-40 mb-6">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#dcfce7"
                      strokeWidth="20"
                      strokeDasharray="75.4 251.2"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#fee2e2"
                      strokeWidth="20"
                      strokeDasharray="62.8 251.2"
                      strokeDashoffset="-75.4"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#fef3c7"
                      strokeWidth="20"
                      strokeDasharray="50.2 251.2"
                      strokeDashoffset="-138.2"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#dbeafe"
                      strokeWidth="20"
                      strokeDasharray="62.8 251.2"
                      strokeDashoffset="-188.4"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">847</div>
                      <div className="text-[10px] font-mono text-muted-foreground">TOTAL</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#dcfce7]"></div>
                    <span className="text-[13px] text-foreground">Residential</span>
                  </div>
                  <span className="text-[13px] font-semibold text-foreground">45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#fee2e2]"></div>
                    <span className="text-[13px] text-foreground">Commercial</span>
                  </div>
                  <span className="text-[13px] font-semibold text-foreground">30%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#fef3c7]"></div>
                    <span className="text-[13px] text-foreground">Retail</span>
                  </div>
                  <span className="text-[13px] font-semibold text-foreground">15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#dbeafe]"></div>
                    <span className="text-[13px] text-foreground">Industrial</span>
                  </div>
                  <span className="text-[13px] font-semibold text-foreground">10%</span>
                </div>
              </div>
            </BentoCardContent>
          </BentoCard>
        </BentoGrid>

        {/* Row 3 - Recent Transactions */}
        <BentoGrid>
          <BentoCard span={12} hover={false}>
            <BentoCardHeader>
              <div>
                <BentoCardTitle>Recent Transactions</BentoCardTitle>
                <BentoCardSubtitle>Latest payment activities across all properties</BentoCardSubtitle>
              </div>
              <Button variant="outline" size="sm">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </BentoCardHeader>
            <BentoCardContent>
              <DataTable>
                <DataTableHeader>
                  <DataTableRow>
                    <DataTableHead>Transaction ID</DataTableHead>
                    <DataTableHead>Tenant</DataTableHead>
                    <DataTableHead>Property</DataTableHead>
                    <DataTableHead>Amount</DataTableHead>
                    <DataTableHead>Status</DataTableHead>
                    <DataTableHead>Date</DataTableHead>
                  </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                  <DataTableRow>
                    <DataTableCell className="font-mono text-xs">#TXN-2847</DataTableCell>
                    <DataTableCell>Ahmed Al-Rashid</DataTableCell>
                    <DataTableCell secondary>Marina Tower A-401</DataTableCell>
                    <DataTableCell className="font-semibold">$4,500</DataTableCell>
                    <DataTableCell>
                      <Badge variant="success">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        COMPLETED
                      </Badge>
                    </DataTableCell>
                    <DataTableCell secondary className="font-mono text-xs">
                      Apr 11, 2026
                    </DataTableCell>
                  </DataTableRow>
                  <DataTableRow>
                    <DataTableCell className="font-mono text-xs">#TXN-2846</DataTableCell>
                    <DataTableCell>Sarah Johnson</DataTableCell>
                    <DataTableCell secondary>Business Park B-205</DataTableCell>
                    <DataTableCell className="font-semibold">$8,200</DataTableCell>
                    <DataTableCell>
                      <Badge variant="pending">
                        <Clock className="h-3 w-3 mr-1" />
                        PENDING
                      </Badge>
                    </DataTableCell>
                    <DataTableCell secondary className="font-mono text-xs">
                      Apr 11, 2026
                    </DataTableCell>
                  </DataTableRow>
                  <DataTableRow>
                    <DataTableCell className="font-mono text-xs">#TXN-2845</DataTableCell>
                    <DataTableCell>Mohammed Hassan</DataTableCell>
                    <DataTableCell secondary>Retail Plaza C-12</DataTableCell>
                    <DataTableCell className="font-semibold">$3,750</DataTableCell>
                    <DataTableCell>
                      <Badge variant="success">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        COMPLETED
                      </Badge>
                    </DataTableCell>
                    <DataTableCell secondary className="font-mono text-xs">
                      Apr 10, 2026
                    </DataTableCell>
                  </DataTableRow>
                  <DataTableRow>
                    <DataTableCell className="font-mono text-xs">#TXN-2844</DataTableCell>
                    <DataTableCell>Fatima Al-Zahra</DataTableCell>
                    <DataTableCell secondary>Garden Villas D-8</DataTableCell>
                    <DataTableCell className="font-semibold">$5,100</DataTableCell>
                    <DataTableCell>
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        FAILED
                      </Badge>
                    </DataTableCell>
                    <DataTableCell secondary className="font-mono text-xs">
                      Apr 10, 2026
                    </DataTableCell>
                  </DataTableRow>
                </DataTableBody>
              </DataTable>
            </BentoCardContent>
          </BentoCard>
        </BentoGrid>

        {/* Row 4 - Quick Actions + Upcoming Renewals */}
        <BentoGrid>
          {/* Quick Actions */}
          <BentoCard span={6}>
            <BentoCardHeader>
              <div>
                <BentoCardTitle>Quick Actions</BentoCardTitle>
                <BentoCardSubtitle>Common tasks and shortcuts</BentoCardSubtitle>
              </div>
            </BentoCardHeader>
            <BentoCardContent>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-start gap-2 p-4 rounded-xl border border-border hover:border-border-hover hover:bg-muted/40 transition-dari text-left">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-foreground">New Invoice</div>
                    <div className="text-[11px] text-muted-foreground">Create billing</div>
                  </div>
                </button>

                <button className="flex flex-col items-start gap-2 p-4 rounded-xl border border-border hover:border-border-hover hover:bg-muted/40 transition-dari text-left">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-foreground">Add Tenant</div>
                    <div className="text-[11px] text-muted-foreground">Register new</div>
                  </div>
                </button>

                <button className="flex flex-col items-start gap-2 p-4 rounded-xl border border-border hover:border-border-hover hover:bg-muted/40 transition-dari text-left">
                  <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-foreground">Schedule Visit</div>
                    <div className="text-[11px] text-muted-foreground">Property tour</div>
                  </div>
                </button>

                <button className="flex flex-col items-start gap-2 p-4 rounded-xl border border-border hover:border-border-hover hover:bg-muted/40 transition-dari text-left">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-foreground">View Reports</div>
                    <div className="text-[11px] text-muted-foreground">Analytics</div>
                  </div>
                </button>
              </div>
            </BentoCardContent>
          </BentoCard>

          {/* Upcoming Renewals */}
          <BentoCard span={6}>
            <BentoCardHeader>
              <div>
                <BentoCardTitle>Upcoming Renewals</BentoCardTitle>
                <BentoCardSubtitle>Leases expiring in next 30 days</BentoCardSubtitle>
              </div>
              <Badge variant="warning">12 PENDING</Badge>
            </BentoCardHeader>
            <BentoCardContent>
              <div className="space-y-3">
                {[
                  { tenant: "Ahmed Al-Rashid", property: "Marina Tower A-401", days: 5 },
                  { tenant: "Sarah Johnson", property: "Business Park B-205", days: 12 },
                  { tenant: "Mohammed Hassan", property: "Retail Plaza C-12", days: 18 },
                  { tenant: "Fatima Al-Zahra", property: "Garden Villas D-8", days: 24 },
                ].map((renewal, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-border-hover transition-dari"
                  >
                    <div className="flex-1">
                      <div className="text-[13px] font-medium text-foreground">{renewal.tenant}</div>
                      <div className="text-[11px] text-muted-foreground">{renewal.property}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[13px] font-semibold text-foreground">{renewal.days} days</div>
                      <div className="text-[10px] font-mono text-muted-foreground">REMAINING</div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCardContent>
          </BentoCard>
        </BentoGrid>
      </div>
    </BentoLayout>
  );
}
