import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { GatewayHealthBadge } from './GatewayHealthBadge';
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableCell,
} from '../ui/data-table';
import { Eye } from 'lucide-react';
import { useRoutingDecisions, useRoutingDecisionDetail } from '../../../hooks/useOrchestration';
import { formatDateTime } from '../../../lib/utils';
import type { RoutingStrategy } from '../../../types/orchestration.types';

const STRATEGY_BADGE: Record<RoutingStrategy, { label: string; variant: 'info' | 'success' | 'pending' | 'default' }> = {
  smart: { label: 'Smart', variant: 'info' },
  rule: { label: 'Rule', variant: 'success' },
  failover: { label: 'Failover', variant: 'pending' },
  only_option: { label: 'Single', variant: 'default' },
};

function DecisionDetailDialog({ decisionId, onClose }: { decisionId: string; onClose: () => void }) {
  const { data: detail, isLoading } = useRoutingDecisionDetail(decisionId);

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Routing Decision Detail</DialogTitle>
      </DialogHeader>
      {isLoading ? (
        <Skeleton className="h-48" />
      ) : detail ? (
        <div className="space-y-4">
          {/* Explanation */}
          {detail.explanation && (
            <div className="rounded-lg border p-4 space-y-3">
              <p className="font-medium">{detail.explanation.headline}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Success Rate:</span>{' '}
                  <span className="font-medium">{detail.explanation.success_rate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Fee:</span>{' '}
                  <span className="font-medium">{detail.explanation.fee}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Latency:</span>{' '}
                  <span className="font-medium">{detail.explanation.latency}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Uptime:</span>{' '}
                  <span className="font-medium">{detail.explanation.uptime}</span>
                </div>
              </div>

              {/* Score Breakdown */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Score Breakdown</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {Object.entries(detail.explanation.score_breakdown).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}:</span>
                      <span className={`font-mono ${key === 'risk_penalty' && val > 0 ? 'text-red-600' : ''}`}>
                        {key === 'risk_penalty' ? `-${val}` : val.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk */}
              {detail.explanation.risk.risk_level !== 'none' && (
                <div className="rounded bg-red-50 p-2 text-sm">
                  <span className="font-medium text-red-700">
                    Risk: {detail.explanation.risk.risk_level}
                  </span>
                  {detail.explanation.risk.reasons.length > 0 && (
                    <ul className="list-disc list-inside text-red-600 mt-1">
                      {detail.explanation.risk.reasons.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Candidates */}
          {detail.candidates && detail.candidates.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">All Candidates</p>
              <div className="space-y-2">
                {detail.candidates.map((c) => (
                  <div key={c.gateway} className="flex items-center justify-between rounded border p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{c.gateway}</span>
                      <GatewayHealthBadge status={c.health_status} />
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span>Score: <span className="font-mono text-foreground">{c.score.toFixed(1)}</span></span>
                      <span>{(c.success_rate * 100).toFixed(1)}%</span>
                      <span>{c.fee_pct.toFixed(2)}%</span>
                      <span>{c.avg_latency_ms.toFixed(0)}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground border-t pt-3">
            <div>Amount: {detail.amount ? `$${detail.amount}` : 'N/A'}</div>
            <div>Currency: {detail.currency ?? 'N/A'}</div>
            <div>Country: {detail.country ?? 'N/A'}</div>
            <div>Method: {detail.payment_method ?? 'N/A'}</div>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">Decision not found</p>
      )}
    </DialogContent>
  );
}

export function DecisionsTable() {
  const { data, isLoading } = useRoutingDecisions(50);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6"><Skeleton className="h-64" /></CardContent>
      </Card>
    );
  }

  const decisions = data?.decisions ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Recent Routing Decisions</CardTitle>
      </CardHeader>
      <CardContent>
        {decisions.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            No routing decisions recorded yet
          </p>
        ) : (
          <>
            <DataTable>
              <DataTableHeader>
                <DataTableRow>
                  <DataTableHead>Time</DataTableHead>
                  <DataTableHead>Strategy</DataTableHead>
                  <DataTableHead>Selected</DataTableHead>
                  <DataTableHead>Final</DataTableHead>
                  <DataTableHead>Score</DataTableHead>
                  <DataTableHead>Amount</DataTableHead>
                  <DataTableHead>Reason</DataTableHead>
                  <DataTableHead></DataTableHead>
                </DataTableRow>
              </DataTableHeader>
              <DataTableBody>
                {decisions.map((d) => {
                  const strat = STRATEGY_BADGE[d.strategy] ?? STRATEGY_BADGE.smart;
                  return (
                    <DataTableRow key={d.id}>
                      <DataTableCell className="text-xs whitespace-nowrap">
                        {formatDateTime(d.created_at)}
                      </DataTableCell>
                      <DataTableCell>
                        <Badge variant={strat.variant}>{strat.label}</Badge>
                      </DataTableCell>
                      <DataTableCell className="capitalize font-medium">{d.selected_gateway}</DataTableCell>
                      <DataTableCell className="capitalize">
                        {d.final_gateway ?? d.selected_gateway}
                        {d.failover_used && (
                          <Badge variant="pending" className="ml-1.5">failover</Badge>
                        )}
                      </DataTableCell>
                      <DataTableCell className="font-mono">
                        {d.score != null ? d.score.toFixed(1) : '-'}
                      </DataTableCell>
                      <DataTableCell>
                        {d.amount ? `$${parseFloat(d.amount).toFixed(2)}` : '-'}
                      </DataTableCell>
                      <DataTableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                        {d.reason?.join(', ') ?? '-'}
                      </DataTableCell>
                      <DataTableCell>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedId(d.id)}>
                          <Eye className="size-3.5" />
                        </Button>
                      </DataTableCell>
                    </DataTableRow>
                  );
                })}
              </DataTableBody>
            </DataTable>

            {/* Detail Dialog */}
            <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
              {selectedId && (
                <DecisionDetailDialog
                  decisionId={selectedId}
                  onClose={() => setSelectedId(null)}
                />
              )}
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
}
