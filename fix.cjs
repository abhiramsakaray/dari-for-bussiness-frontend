const fs = require('fs');
const file = 'd:/Projects/Dari for Bussiness/chainpe/chainpe-frontend/src/app/components/analytics/AnalyticsDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add imports
if (!content.includes('useOptimizationInsights')) {
    content = content.replace(
        'import { BentoLayout } from "../BentoLayout";',
        'import { BentoLayout } from "../BentoLayout";\nimport { useOptimizationInsights } from "../../../hooks/useOrchestration";'
    );
}

const lucideToInject = ['Activity', 'Landmark', 'Shield', 'CheckCircle2', 'AlertTriangle', 'Zap', 'ChevronRight'];
for (const icon of lucideToInject) {
    if (!content.includes(icon)) {
        content = content.replace('Clock,', 'Clock,\n  ' + icon + ',');
    }
}

// 2. Insert <PaymentOptimizationCenter /> right before </BentoLayout>
if (!content.includes('<PaymentOptimizationCenter />')) {
    content = content.replace(
        '      </div>\n    </BentoLayout>',
        '      </div>\n      <div className="mt-8 pt-8 border-t border-border">\n        <PaymentOptimizationCenter />\n      </div>\n    </BentoLayout>'
    );
}

// 3. Append the PaymentOptimizationCenter code right before export default AnalyticsDashboard;
const optCode = `
// ─────────────────────────────────────────────────────────────────────────────
// Payment Optimization Center — clean neutral-first design
// ─────────────────────────────────────────────────────────────────────────────

const OPT_SEVERITY: Record<string, { leftBorder: string; icon: React.ReactNode }> = {
  high:   { leftBorder: 'border-l-red-500',    icon: <AlertTriangle className="h-4 w-4 text-red-500   shrink-0 mt-0.5" /> },
  medium: { leftBorder: 'border-l-amber-500',  icon: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" /> },
  low:    { leftBorder: 'border-l-indigo-400', icon: <CheckCircle2  className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" /> },
  info:   { leftBorder: 'border-l-border',     icon: <CheckCircle2  className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /> },
};

function GwStatusPill({ status }: { status: string }) {
  const map: Record<string, { dot: string; label: string; cls: string }> = {
    healthy:  { dot: 'bg-green-500',  label: 'Healthy',  cls: 'text-green-600 dark:text-green-400' },
    degraded: { dot: 'bg-amber-500',  label: 'Degraded', cls: 'text-amber-600 dark:text-amber-400' },
    down:     { dot: 'bg-red-500',    label: 'Down',     cls: 'text-red-600   dark:text-red-400'   },
  };
  const cfg = map[status] ?? { dot: 'bg-muted-foreground', label: 'Unknown', cls: 'text-muted-foreground' };
  return (
    <span className={\`inline-flex items-center gap-1.5 text-xs font-medium \${cfg.cls}\`}>
      <span className={\`h-1.5 w-1.5 rounded-full \${cfg.dot}\`} />
      {cfg.label}
    </span>
  );
}

function MiniBar({ pct, className = 'bg-indigo-500' }: { pct: number; className?: string }) {
  return (
    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
      <div className={\`h-full rounded-full \${className}\`} style={{ width: \`\${Math.min(pct, 100)}%\` }} />
    </div>
  );
}

function OptStatCard({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">{label}</p>
          <span className="text-muted-foreground/50">{icon}</span>
        </div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

function OptHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-500/10 border border-indigo-500/20">
        <Zap className="h-4 w-4 text-indigo-500" />
      </div>
      <div>
        <h2 className="text-base font-semibold leading-tight">Payment Optimization Center</h2>
        <p className="text-xs text-muted-foreground">Dari Orchestration Engine · 30-day window</p>
      </div>
    </div>
  );
}

export function PaymentOptimizationCenter() {
  const { data, isLoading, error } = useOptimizationInsights(30);
  const { currencySymbol } = useMerchantCurrency();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <OptHeader />
        <div className="flex h-36 items-center justify-center gap-3 text-sm text-muted-foreground">
          <div className="h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          Loading…
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <OptHeader />
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No optimization data yet — process payments to start seeing routing insights.
          </CardContent>
        </Card>
      </div>
    );
  }

  const { efficiency, savings, routing, recommendations } = data;

  const scoreLabel =
    efficiency.current_score >= 80 ? 'Excellent' :
    efficiency.current_score >= 60 ? 'Good' :
    efficiency.current_score >= 40 ? 'Fair' : 'Needs work';

  const scoreTextCls =
    efficiency.current_score >= 80 ? 'text-green-600 dark:text-green-400' :
    efficiency.current_score >= 60 ? 'text-foreground' :
    'text-amber-600 dark:text-amber-400';

  return (
    <div className="space-y-5">
      <OptHeader />

      {/* ── KPI row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Routing Efficiency card */}
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Routing Efficiency</p>
              <Activity className="h-4 w-4 text-muted-foreground/50" />
            </div>

            {/* Score + label */}
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className={\`text-3xl font-bold tracking-tight \${scoreTextCls}\`}>
                {efficiency.current_score.toFixed(0)}
              </span>
              <span className="text-sm text-muted-foreground">/100</span>
              <span className={\`ml-auto text-xs font-semibold \${scoreTextCls}\`}>{scoreLabel}</span>
            </div>

            {/* Trend */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
              {efficiency.trend_direction === 'up'   && <TrendingUp   className="h-3 w-3 text-green-500" />}
              {efficiency.trend_direction === 'down' && <TrendingDown className="h-3 w-3 text-red-500"   />}
              <span className={
                efficiency.trend_direction === 'up'   ? 'text-green-600 dark:text-green-400' :
                efficiency.trend_direction === 'down' ? 'text-red-600   dark:text-red-400'   :
                ''
              }>
                {efficiency.trend_pct !== null
                  ? \`\${efficiency.trend_pct > 0 ? '+' : ''}\${efficiency.trend_pct.toFixed(1)}%\`
                  : 'Stable'}
              </span>
              <span>vs prev 30d</span>
            </div>

            {/* Breakdown */}
            <div className="space-y-2">
              {([
                ['Success Rate',   efficiency.breakdown.avg_success_rate  ],
                ['Fee Efficiency', efficiency.breakdown.fee_efficiency_pct],
                ['Uptime',         efficiency.breakdown.uptime_pct        ],
              ] as [string, number][]).map(([lbl, v]) => (
                <div key={lbl} className="flex items-center gap-2">
                  <span className="w-[88px] shrink-0 text-xs text-muted-foreground">{lbl}</span>
                  <MiniBar pct={v} />
                  <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">{v.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Savings cards */}
        <OptStatCard
          label="Saved Today"
          value={\`\${currencySymbol}\${savings.today.saved_amount}\`}
          sub={\`\${savings.today.fee_reduction_pct.toFixed(1)}% fee reduction\`}
          icon={<Landmark className="h-4 w-4" />}
        />
        <OptStatCard
          label="Saved This Month"
          value={\`\${currencySymbol}\${savings.month.saved_amount}\`}
          sub={\`\${savings.month.transactions} transactions\`}
          icon={<Landmark className="h-4 w-4" />}
        />
        <OptStatCard
          label="Annualized Projection"
          value={\`\${currencySymbol}\${savings.annualized_savings}\`}
          sub={\`\${savings.year.fee_reduction_pct.toFixed(1)}% avg reduction\`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* ── Gateway table ─────────────────────────────────────────────────── */}
      {routing.gateways.length > 0 && (
        <Card>
          <div className="px-5 pt-5 pb-3 border-b border-border flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Gateway Performance</span>
            <span className="ml-auto text-xs text-muted-foreground">Live metrics</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Gateway', 'Status', 'Success', 'Latency', 'Uptime', 'AI weight'].map(h => (
                    <th key={h} className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {routing.gateways.map((gw, i) => {
                  const srCls =
                    gw.success_rate >= 95 ? 'text-green-600 dark:text-green-400' :
                    gw.success_rate >= 80 ? '' :
                    'text-amber-600 dark:text-amber-400';
                  const alloc = routing.recommended_allocation[gw.gateway];
                  const isBest = gw.gateway === routing.best_gateway;
                  return (
                    <tr key={gw.gateway} className={\`border-b border-border last:border-0 \${i % 2 ? 'bg-muted/20' : ''}\`}>
                      <td className="px-5 py-3 font-medium capitalize">
                        <span className="flex items-center gap-1.5">
                          {gw.gateway}
                          {isBest && (
                            <span className="rounded border border-indigo-500/30 bg-indigo-500/10 px-1 py-px text-[10px] font-semibold uppercase tracking-wide text-indigo-500">
                              Best
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-3"><GwStatusPill status={gw.health_status} /></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-indigo-500" style={{ width: \`\${gw.success_rate}%\` }} />
                          </div>
                          <span className={\`text-xs tabular-nums font-medium \${srCls}\`}>{gw.success_rate.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 tabular-nums text-muted-foreground text-xs">{gw.avg_latency_ms.toFixed(0)} ms</td>
                      <td className="px-5 py-3 tabular-nums text-muted-foreground text-xs">{gw.uptime_24h.toFixed(1)}%</td>
                      <td className="px-5 py-3">
                        {alloc !== undefined ? (
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-1 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-indigo-500" style={{ width: \`\${alloc}%\` }} />
                            </div>
                            <span className="text-xs tabular-nums text-muted-foreground">{alloc.toFixed(0)}%</span>
                          </div>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Recommendations ───────────────────────────────────────────────── */}
      {recommendations.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Recommendations{' '}
            <span className="font-normal text-muted-foreground">({recommendations.length})</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {recommendations.map((rec) => {
              const cfg = OPT_SEVERITY[rec.severity] ?? OPT_SEVERITY.info;
              return (
                <div
                  key={rec.id}
                  className={\`flex gap-3 rounded-lg border border-l-4 bg-card p-4 \${cfg.leftBorder}\`}
                >
                  {cfg.icon}
                  <div className="min-w-0">
                    <p className="text-sm leading-snug">{rec.message}</p>
                    {rec.action && <p className="mt-1 text-xs text-muted-foreground">{rec.action}</p>}
                    <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground/50">
                      {rec.type.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
`;

if (!content.includes('function PaymentOptimizationCenter')) {
    content = content.replace('export default AnalyticsDashboard;', optCode + '\nexport default AnalyticsDashboard;\n');
}

fs.writeFileSync(file, content);
console.log('Done!');
