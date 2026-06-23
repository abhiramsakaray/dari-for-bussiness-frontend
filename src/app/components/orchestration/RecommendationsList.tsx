import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { RefreshCw, X, Lightbulb, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useRecommendations, useRefreshRecommendations, useDismissRecommendation } from '../../../hooks/useOrchestration';
import type { RecommendationSeverity } from '../../../types/orchestration.types';

const SEVERITY_CONFIG: Record<RecommendationSeverity, {
  icon: typeof Info;
  variant: 'info' | 'pending' | 'warning' | 'destructive';
  color: string;
}> = {
  info: { icon: Info, variant: 'info', color: 'text-blue-600' },
  low: { icon: Lightbulb, variant: 'info', color: 'text-blue-600' },
  medium: { icon: AlertTriangle, variant: 'pending', color: 'text-amber-600' },
  high: { icon: AlertCircle, variant: 'destructive', color: 'text-red-600' },
};

export function RecommendationsList() {
  const { data, isLoading } = useRecommendations();
  const refreshMutation = useRefreshRecommendations();
  const dismissMutation = useDismissRecommendation();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6"><Skeleton className="h-48" /></CardContent>
      </Card>
    );
  }

  const recs = data?.recommendations ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Recommendations</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
          >
            <RefreshCw className={`size-3.5 mr-1.5 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recs.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            No recommendations at this time. Your routing is optimized!
          </p>
        ) : (
          <div className="space-y-3">
            {recs.map((rec) => {
              const cfg = SEVERITY_CONFIG[rec.severity] ?? SEVERITY_CONFIG.info;
              const Icon = cfg.icon;
              return (
                <div
                  key={rec.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  <Icon className={`size-4 mt-0.5 shrink-0 ${cfg.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={cfg.variant}>{rec.severity}</Badge>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        {rec.rec_type?.replace(/_/g, ' ') ?? 'Unknown'}
                      </span>
                    </div>
                    <p className="text-sm">{rec.message}</p>
                    {rec.action && (
                      <p className="text-xs text-muted-foreground mt-1">{rec.action}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() => dismissMutation.mutate(rec.id)}
                    disabled={dismissMutation.isPending}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
