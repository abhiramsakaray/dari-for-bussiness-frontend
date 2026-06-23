import { useState } from 'react';
import { BentoLayout } from '../BentoLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import {
  useGatewayOverview,
  useOrchestrationAnalytics,
  useSavings,
} from '../../../hooks/useOrchestration';
import { GatewayOverviewCards } from './GatewayOverviewCards';
import { OrchestrationStatsCards } from './OrchestrationStatsCards';
import { StrategyDistribution, GatewayDistribution } from './StrategyDistribution';
import { SavingsChart } from './SavingsChart';
import { RecommendationsList } from './RecommendationsList';
import { RoutingRulesPanel } from './RoutingRulesPanel';
import { DecisionsTable } from './DecisionsTable';

export default function OrchestrationDashboard() {
  const [tab, setTab] = useState('overview');

  const { data: gatewayData, isLoading: gatewaysLoading } = useGatewayOverview();
  const { data: analyticsData, isLoading: analyticsLoading } = useOrchestrationAnalytics(30);
  const { data: savingsData, isLoading: savingsLoading } = useSavings();

  return (
    <BentoLayout activePage="orchestration">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-[32px] font-bold tracking-tight text-foreground">
            Payment Orchestration
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Intelligent routing, automatic failover, and cost optimization across all payment gateways
          </p>
        </div>

        {/* Top-level KPI stats */}
        <OrchestrationStatsCards
          analytics={analyticsData}
          savings={savingsData}
          isLoading={analyticsLoading || savingsLoading}
        />

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="overview">Gateways</TabsTrigger>
            <TabsTrigger value="routing">Routing & Rules</TabsTrigger>
            <TabsTrigger value="decisions">Decisions</TabsTrigger>
            <TabsTrigger value="savings">Savings</TabsTrigger>
          </TabsList>

          {/* ── Gateways Tab ──────────────────────────────────────── */}
          <TabsContent value="overview" className="space-y-6">
            <GatewayOverviewCards
              gateways={gatewayData?.gateways}
              isLoading={gatewaysLoading}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <StrategyDistribution analytics={analyticsData} isLoading={analyticsLoading} />
              <GatewayDistribution analytics={analyticsData} isLoading={analyticsLoading} />
            </div>
            <RecommendationsList />
          </TabsContent>

          {/* ── Routing & Rules Tab ───────────────────────────────── */}
          <TabsContent value="routing" className="space-y-6">
            <RoutingRulesPanel />
          </TabsContent>

          {/* ── Decisions Tab ─────────────────────────────────────── */}
          <TabsContent value="decisions" className="space-y-6">
            <DecisionsTable />
          </TabsContent>

          {/* ── Savings Tab ───────────────────────────────────────── */}
          <TabsContent value="savings" className="space-y-6">
            <SavingsChart savings={savingsData} isLoading={savingsLoading} />

            {/* Savings summary cards */}
            {savingsData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(['today', 'month', 'year', 'lifetime'] as const).map((period) => {
                  const s = savingsData[period];
                  if (!s) return null;
                  
                  const amount = parseFloat(s.saved_amount || '0');
                  const count = s.transactions_count ?? 0;
                  
                  return (
                    <div key={period} className="rounded-xl border bg-card p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide capitalize">{period}</p>
                      <p className="text-xl font-bold mt-1">
                        ${isNaN(amount) ? '0.00' : amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {count.toLocaleString()} transactions
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </BentoLayout>
  );
}
