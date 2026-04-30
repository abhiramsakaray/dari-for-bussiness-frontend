import React, { useState } from 'react';
import { useFeeStats, usePlatformWallets, useCollectAllFees } from '../../../hooks/useFeeCollection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  AlertCircle,
  Wallet,
  TrendingUp,
  DollarSign,
  Activity,
  RefreshCw,
} from 'lucide-react';

export function FeeCollectionDashboard() {
  const [selectedDays, setSelectedDays] = useState(30);
  const { data: stats, isLoading: statsLoading, error: statsError } = useFeeStats(selectedDays);
  const { data: wallets, isLoading: walletsLoading } = usePlatformWallets();
  const collectAllMutation = useCollectAllFees();

  const handleCollectAll = () => {
    if (confirm('Collect fees for all merchants today?')) {
      collectAllMutation.mutate(undefined, {
        onSuccess: (data) => {
          alert(data.message);
        },
        onError: (error) => {
          alert(`Error: ${(error as Error).message}`);
        },
      });
    }
  };

  if (statsLoading || walletsLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load fee collection data. Please ensure you have admin access.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-3">
        <Select
          value={selectedDays.toString()}
          onValueChange={(value) => setSelectedDays(parseInt(value))}
        >
          <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleCollectAll}
              disabled={collectAllMutation.isPending}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${collectAllMutation.isPending ? 'animate-spin' : ''}`} />
              Collect All Fees
            </Button>
          </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats?.total_volume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                Last {selectedDays} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fees Collected</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${stats?.total_estimated_fees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.average_fee_percent}% average fee rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Wallets</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {wallets?.configured_count} / {wallets?.total_chains}
              </div>
              <p className="text-xs text-muted-foreground">
                Chains configured
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Wallets */}
        {wallets && (
          <Card>
            <CardHeader>
              <CardTitle>Platform Wallets</CardTitle>
              <CardDescription>
                Fee collection addresses for each blockchain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(wallets.platform_wallets).map(([chain, address]) => (
                  <div key={chain} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">
                        {chain}
                      </Badge>
                      <code className="text-xs font-mono">{address}</code>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(address);
                        alert('Address copied!');
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fee Statistics by Chain */}
        {stats && stats.stats_by_chain.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Fee Statistics by Chain</CardTitle>
              <CardDescription>
                Breakdown of fees collected across different blockchains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium">Chain</th>
                      <th className="text-left p-3 font-medium">Token</th>
                      <th className="text-right p-3 font-medium">Transactions</th>
                      <th className="text-right p-3 font-medium">Volume</th>
                      <th className="text-right p-3 font-medium">Fees Collected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.stats_by_chain.map((stat, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">
                          <Badge variant="outline" className="capitalize">
                            {stat.chain}
                          </Badge>
                        </td>
                        <td className="p-3 font-medium">{stat.token}</td>
                        <td className="text-right p-3">{stat.transaction_count}</td>
                        <td className="text-right p-3">
                          ${stat.volume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="text-right p-3 font-semibold text-green-600">
                          ${stat.estimated_fees.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted font-semibold">
                    <tr>
                      <td colSpan={2} className="p-3">Total</td>
                      <td className="text-right p-3">
                        {stats.stats_by_chain.reduce((sum, s) => sum + s.transaction_count, 0)}
                      </td>
                      <td className="text-right p-3">
                        ${stats.total_volume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-right p-3 text-green-600">
                        ${stats.total_estimated_fees.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Alert */}
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            Fees are automatically collected daily at 1 AM UTC. Merchants receive settlement emails with transaction details.
          </AlertDescription>
        </Alert>
      </div>
  );
}
