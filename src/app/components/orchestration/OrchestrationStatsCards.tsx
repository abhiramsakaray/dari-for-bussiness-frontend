import { BentoGrid, BentoCard } from '../ui/bento-grid';
import { Skeleton } from '../ui/skeleton';
import { Brain, GitBranch, ShieldCheck, DollarSign } from 'lucide-react';
import type { OrchestrationAnalyticsResponse, SavingsResponse } from '../../../types/orchestration.types';
import type { LocalCurrencyAmount } from '../../../services/chainpe';

interface Props {
  analytics: OrchestrationAnalyticsResponse | undefined;
  savings: SavingsResponse | undefined;
  isLoading: boolean;
  localCurrency?: LocalCurrencyAmount | null;
}

export function OrchestrationStatsCards({ analytics, savings, isLoading, localCurrency }: Props) {
  if (isLoading) {
    return (
      <BentoGrid>
        {[1, 2, 3, 4].map((i) => (
          <BentoCard key={i} span={3} hover={false}>
            <Skeleton className="h-24 w-full" />
          </BentoCard>
        ))}
      </BentoGrid>
    );
  }

  const totalDecisions = analytics?.routing_decisions ?? 0;
  const failoversTriggered = analytics?.failovers.failovers_triggered ?? 0;
  const failoversRecovered = analytics?.failovers.failovers_recovered ?? 0;
  const recoveredRevenue = analytics?.failovers.recovered_revenue ?? '0';
  const recoveryRate = failoversTriggered > 0
    ? ((failoversRecovered / failoversTriggered) * 100).toFixed(1)
    : '0';
  const monthlySavings = savings?.month?.saved_amount ?? '0';
  const monthlyTxCount = savings?.month?.transactions_count ?? 0;

  const formatCurrencyValue = (usdcStr: string | number) => {
    const usdc = typeof usdcStr === 'string' ? parseFloat(usdcStr || '0') : usdcStr;
    if (localCurrency) {
      const converted = usdc * localCurrency.exchange_rate;
      return `${localCurrency.local_symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${usdc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const stats = [
    {
      label: 'Routing Decisions',
      value: totalDecisions.toLocaleString(),
      sub: `${analytics?.window_days ?? 30}d window`,
      icon: Brain,
      color: 'text-blue-600',
    },
    {
      label: 'Failover Recovery',
      value: `${recoveryRate}%`,
      sub: `${failoversRecovered}/${failoversTriggered} recovered`,
      icon: GitBranch,
      color: 'text-green-600',
    },
    {
      label: 'Revenue Recovered',
      value: formatCurrencyValue(recoveredRevenue),
      sub: 'via automatic failover',
      icon: ShieldCheck,
      color: 'text-purple-600',
    },
    {
      label: 'Monthly Savings',
      value: formatCurrencyValue(monthlySavings),
      sub: `${monthlyTxCount.toLocaleString()} transactions`,
      icon: DollarSign,
      color: 'text-emerald-600',
    },
  ];

  return (
    <BentoGrid>
      {stats.map((s) => (
        <BentoCard key={s.label} span={3} hover={false}>
          <div className="flex items-start justify-between mb-3">
            <div className="text-[10px] font-mono font-medium uppercase tracking-wide text-muted-foreground">
              {s.label}
            </div>
            <s.icon className={`size-4 ${s.color}`} />
          </div>
          <div className="text-[32px] font-bold tracking-tight text-foreground leading-none mb-3">
            {s.value}
          </div>
          <div className="text-[11px] font-medium text-muted-foreground">
            {s.sub}
          </div>
        </BentoCard>
      ))}
    </BentoGrid>
  );
}
