import React, { useState } from 'react';
import { useMerchantFeeReport, useCollectFees } from '../../../hooks/useFeeCollection';
import { feeCollectionService } from '../../../services/fee-collection.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { AlertCircle, Download, RefreshCw } from 'lucide-react';

interface MerchantFeeReportProps {
  merchantId?: string;
}

export function MerchantFeeReport({ merchantId: initialMerchantId }: MerchantFeeReportProps) {
  const [merchantId, setMerchantId] = useState(initialMerchantId || '');
  const [dateRange, setDateRange] = useState(() => {
    const { startDate, endDate } = feeCollectionService.getDateRange(30);
    return { startDate, endDate };
  });
  const [searchTriggered, setSearchTriggered] = useState(false);

  const { data: report, isLoading, error } = useMerchantFeeReport(
    merchantId,
    dateRange.startDate,
    dateRange.endDate,
    searchTriggered && !!merchantId
  );

  const collectFeesMutation = useCollectFees();

  const handleSearch = () => {
    if (merchantId) {
      setSearchTriggered(true);
    }
  };

  const handleCollectFees = () => {
    if (!merchantId) return;
    
    const today = feeCollectionService.formatDate(new Date());
    if (confirm(`Collect fees for merchant ${merchantId} for today (${today})?`)) {
      collectFeesMutation.mutate(
        { merchantId, date: today },
        {
          onSuccess: (data) => {
            alert(`Success: ${data.message}`);
          },
          onError: (error) => {
            alert(`Error: ${(error as Error).message}`);
          },
        }
      );
    }
  };

  const exportToCSV = () => {
    if (!report) return;

    const headers = ['Chain', 'Token', 'Transactions', 'Volume', 'Fees'];
    const rows = report.fees_by_chain_token.map(item => [
      item.chain,
      item.token,
      item.transaction_count,
      item.total_volume.toFixed(2),
      item.total_fee.toFixed(2),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fee-report-${merchantId}-${dateRange.startDate}-${dateRange.endDate}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Merchant Fee Report</CardTitle>
          <CardDescription>
            View detailed fee collection report for a specific merchant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="merchantId">Merchant ID</Label>
              <Input
                id="merchantId"
                placeholder="Enter merchant ID"
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSearch} disabled={!merchantId || isLoading}>
              {isLoading ? 'Loading...' : 'Search'}
            </Button>
            {report && (
              <>
                <Button variant="outline" onClick={exportToCSV} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCollectFees}
                  disabled={collectFeesMutation.isPending}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${collectFeesMutation.isPending ? 'animate-spin' : ''}`} />
                  Collect Fees
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load merchant report. Please check the merchant ID and try again.
          </AlertDescription>
        </Alert>
      )}

      {report && (
        <>
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{report.merchant_name}</CardTitle>
                  <CardDescription>Merchant ID: {report.merchant_id}</CardDescription>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {report.fee_percent}% Fee Rate
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Period</div>
                  <div className="text-sm font-medium">
                    {new Date(report.period_start).toLocaleDateString()} -{' '}
                    {new Date(report.period_end).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Total Transactions</div>
                  <div className="text-2xl font-bold">{report.total_transactions}</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Total Fees</div>
                  <div className="text-2xl font-bold text-green-600">
                    ${report.fees_by_chain_token
                      .reduce((sum, item) => sum + item.total_fee, 0)
                      .toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fees by Chain */}
          <Card>
            <CardHeader>
              <CardTitle>Fees by Chain & Token</CardTitle>
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
                      <th className="text-right p-3 font-medium">Fees</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.fees_by_chain_token.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">
                          <Badge variant="outline" className="capitalize">
                            {item.chain}
                          </Badge>
                        </td>
                        <td className="p-3 font-medium">{item.token}</td>
                        <td className="text-right p-3">{item.transaction_count}</td>
                        <td className="text-right p-3">
                          ${item.total_volume.toFixed(2)}
                        </td>
                        <td className="text-right p-3 font-semibold text-green-600">
                          ${item.total_fee.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Details */}
          {report.transaction_details && report.transaction_details.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
                <CardDescription>
                  Individual transactions with fee breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="text-left p-3 font-medium">Payment ID</th>
                        <th className="text-left p-3 font-medium">Chain</th>
                        <th className="text-left p-3 font-medium">Token</th>
                        <th className="text-right p-3 font-medium">Amount</th>
                        <th className="text-right p-3 font-medium">Fee</th>
                        <th className="text-left p-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.transaction_details.map((tx, index) => (
                        <tr key={index} className="border-t hover:bg-muted/50">
                          <td className="p-3">
                            <code className="text-xs">{tx.payment_id}</code>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="capitalize text-xs">
                              {tx.chain}
                            </Badge>
                          </td>
                          <td className="p-3">{tx.token}</td>
                          <td className="text-right p-3">${tx.amount.toFixed(2)}</td>
                          <td className="text-right p-3 text-green-600">${tx.fee.toFixed(2)}</td>
                          <td className="p-3 text-xs">
                            {new Date(tx.paid_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
