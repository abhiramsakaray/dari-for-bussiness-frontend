import { Badge } from '../ui/badge';
import type { GatewayHealthStatus } from '../../../types/orchestration.types';

const STATUS_MAP: Record<GatewayHealthStatus, { label: string; variant: 'success' | 'pending' | 'destructive' }> = {
  healthy: { label: 'Healthy', variant: 'success' },
  degraded: { label: 'Degraded', variant: 'pending' },
  down: { label: 'Down', variant: 'destructive' },
};

export function GatewayHealthBadge({ status }: { status: GatewayHealthStatus }) {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP.down;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
