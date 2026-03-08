import React from 'react';
import { useCacheStats } from '../../../hooks/useAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Database,
  Zap,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

export function CacheStatsCard() {
  const { data, isLoading, error } = useCacheStats();

  if (error) {
    const status = (error as any)?.response?.status;
    if (status === 403) return null;
    return (
      <Card className="border-red-200">
        <CardContent className="py-6 text-center text-muted-foreground">
          <AlertCircle className="w-5 h-5 mx-auto mb-2" />
          Failed to load cache stats
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" /> Server Cache
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.regions || Object.keys(data.regions).length === 0) return null;

  const regions = Object.entries(data.regions);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" /> Server Cache Performance
        </CardTitle>
        <CardDescription>Cached endpoint hit/miss statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {regions.map(([name, stats]) => {
            const total = stats.hits + stats.misses;
            const hitRate = total > 0 ? ((stats.hits / total) * 100) : 0;
            const usageRate = stats.max_size > 0 ? ((stats.size / stats.max_size) * 100) : 0;

            return (
              <div key={name} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{name}</span>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {stats.ttl}s TTL
                    </Badge>
                  </div>
                  <Badge
                    variant={hitRate >= 80 ? 'default' : hitRate >= 50 ? 'secondary' : 'destructive'}
                  >
                    {hitRate.toFixed(1)}% hit rate
                  </Badge>
                </div>

                {/* Hit Rate Bar */}
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-green-500" /> Hits: {stats.hits}
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-red-400" /> Misses: {stats.misses}
                    </span>
                  </div>
                  <Progress value={hitRate} className="h-2" />
                </div>

                {/* Storage usage */}
                <div className="text-xs text-muted-foreground">
                  Storage: {stats.size} / {stats.max_size} entries ({usageRate.toFixed(1)}%)
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default CacheStatsCard;
