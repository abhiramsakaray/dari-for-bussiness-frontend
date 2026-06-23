import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import type { SavingsResponse } from '../../../types/orchestration.types';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { formatDate } from '../../../lib/utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export function SavingsChart({
  savings,
  isLoading,
}: {
  savings: SavingsResponse | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6"><Skeleton className="h-72" /></CardContent>
      </Card>
    );
  }

  const details = Array.isArray(savings?.detail_30d) ? savings.detail_30d : [];

  if (details.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Cost Savings (30 Days)</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          No savings data available yet
        </CardContent>
      </Card>
    );
  }

  const labels = details.map((d) => formatDate(d.period_date));
  const savedData = details.map((d) => parseFloat(d.saved_amount || '0'));
  const actualData = details.map((d) => parseFloat(d.actual_fee_paid || '0'));
  const worstData = details.map((d) => parseFloat(d.worst_possible_fee || '0'));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Cost Savings (30 Days)</CardTitle>
        <CardDescription>
          Actual fees paid vs. worst-case routing costs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <Bar
            data={{
              labels,
              datasets: [
                {
                  label: 'Actual Fee',
                  data: actualData,
                  backgroundColor: 'rgb(59, 130, 246)',
                  borderRadius: 4,
                },
                {
                  label: 'Worst Case',
                  data: worstData,
                  backgroundColor: 'rgb(229, 231, 235)',
                  borderRadius: 4,
                },
                {
                  label: 'Saved',
                  data: savedData,
                  backgroundColor: 'rgb(16, 185, 129)',
                  borderRadius: 4,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16 } },
                tooltip: {
                  callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: $${ctx.parsed.y.toFixed(2)}`,
                  },
                },
              },
              scales: {
                x: { grid: { display: false } },
                y: {
                  beginAtZero: true,
                  ticks: { callback: (v) => `$${v}` },
                },
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
