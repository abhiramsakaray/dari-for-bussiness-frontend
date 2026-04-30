import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { apiClient } from '../../lib/api-client';
import { toast } from 'sonner';
import { extractErrorMessage } from '../../lib/utils';

interface EndpointTest {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST';
  useApiClient?: boolean;
}

const ENDPOINTS_TO_TEST: EndpointTest[] = [
  { name: 'Wallets Dashboard', endpoint: '/merchant/wallets/dashboard', method: 'GET' },
  { name: 'All Wallets', endpoint: '/merchant/wallets', method: 'GET' },
  { name: 'Payment History', endpoint: '/merchant/payments?limit=10', method: 'GET' },
  { name: 'Payment Stats', endpoint: '/merchant/payments/stats', method: 'GET' },
  { name: 'Analytics Overview', endpoint: '/analytics/overview?period=month', method: 'GET', useApiClient: true },
  { name: 'Billing Info', endpoint: '/billing/info', method: 'GET' },
  { name: 'Payment Links', endpoint: '/payment-links', method: 'GET', useApiClient: true },
  { name: 'Invoices', endpoint: '/invoices', method: 'GET', useApiClient: true },
  { name: 'Subscriptions Plans', endpoint: '/subscriptions/plans', method: 'GET', useApiClient: true },
  { name: 'Refunds', endpoint: '/refunds', method: 'GET', useApiClient: true },
];

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'empty' | 'pending';
  message: string;
  data?: any;
  error?: string;
}

export function ApiDebugger() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const runTests = async () => {
    setTesting(true);
    setResults([]);

    const testResults: TestResult[] = [];

    // Check auth tokens first
    const merchantToken = localStorage.getItem('merchant_token');
    const apiKey = localStorage.getItem('api_key');
    const email = localStorage.getItem('merchant_email');

    if (!merchantToken || !apiKey) {
      testResults.push({
        name: 'Authentication',
        status: 'error',
        message: 'Missing authentication tokens. Please login again.',
        error: 'No merchant_token or api_key found in localStorage',
      });
      setResults(testResults);
      setTesting(false);
      return;
    }

    testResults.push({
      name: 'Authentication',
      status: 'success',
      message: `Logged in as ${email}`,
      data: { hasToken: true, hasApiKey: true },
    });

    // Test each endpoint
    for (const endpoint of ENDPOINTS_TO_TEST) {
      try {

        const startTime = Date.now();
        let response;

        if (endpoint.useApiClient) {
          response = await apiClient.get(endpoint.endpoint);
        } else {
          const axiosResponse = await api.get(endpoint.endpoint);
          response = axiosResponse.data;
        }

        const duration = Date.now() - startTime;
        const data = response as any;

        // Check if response has data
        let status: 'success' | 'empty' = 'success';
        let message = `Success (${duration}ms)`;

        // Check for empty data patterns
        if (Array.isArray(data) && data.length === 0) {
          status = 'empty';
          message = 'No data returned (empty array)';
        } else if (typeof data === 'object') {
          const hasData = Object.values(data).some(val => {
            if (Array.isArray(val)) return val.length > 0;
            if (typeof val === 'number') return val !== 0;
            if (typeof val === 'object' && val !== null) {
              return Object.keys(val).length > 0;
            }
            return !!val;
          });

          if (!hasData) {
            status = 'empty';
            message = 'No data returned (all values are empty/zero)';
          }
        }

        testResults.push({
          name: endpoint.name,
          status,
          message,
          data,
        });

      } catch (error: any) {

        const errorMessage = extractErrorMessage(error, 'Unknown error');

        testResults.push({
          name: endpoint.name,
          status: 'error',
          message: errorMessage,
          error: JSON.stringify({
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
          }, null, 2),
        });
      }

      // Update results after each test
      setResults([...testResults]);

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setTesting(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'empty':
        return <XCircle className="w-4 h-4 text-amber-500" />;
      case 'pending':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants: Record<TestResult['status'], any> = {
      success: 'default',
      error: 'destructive',
      empty: 'secondary',
      pending: 'outline',
    };
    return variants[status] || 'outline';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">🔍 API Debugger</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Test API endpoints to diagnose data loading issues
            </p>
          </div>
          <Button
            onClick={runTests}
            disabled={testing}
            size="lg"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Run Tests
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Click "Run Tests" to check API connectivity and data availability
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {result.message}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadge(result.status)}>
                      {result.status}
                    </Badge>
                    {(result.data || result.error) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setShowDetails(
                            showDetails === result.name ? null : result.name
                          )
                        }
                      >
                        {showDetails === result.name ? 'Hide' : 'Details'}
                      </Button>
                    )}
                  </div>
                </div>

                {showDetails === result.name && (
                  <div className="mt-4 p-3 bg-muted rounded-md overflow-hidden">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold">Response Data:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const text = result.error || JSON.stringify(result.data, null, 2);
                          navigator.clipboard.writeText(text);
                          toast.success('Copied to clipboard');
                        }}
                      >
                        Copy JSON
                      </Button>
                    </div>
                    <pre className="text-xs overflow-auto max-h-96 whitespace-pre-wrap break-words">
                      {result.error
                        ? result.error
                        : JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-semibold mb-2">📊 Summary</h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-green-600 font-bold text-xl">
                  {results.filter(r => r.status === 'success').length}
                </div>
                <div className="text-muted-foreground">Success</div>
              </div>
              <div>
                <div className="text-amber-600 font-bold text-xl">
                  {results.filter(r => r.status === 'empty').length}
                </div>
                <div className="text-muted-foreground">Empty</div>
              </div>
              <div>
                <div className="text-red-600 font-bold text-xl">
                  {results.filter(r => r.status === 'error').length}
                </div>
                <div className="text-muted-foreground">Errors</div>
              </div>
              <div>
                <div className="text-blue-600 font-bold text-xl">
                  {results.length}
                </div>
                <div className="text-muted-foreground">Total</div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-muted rounded-lg text-sm">
          <h4 className="font-semibold mb-2">💡 Troubleshooting Tips:</h4>
          <ul className="space-y-1 text-muted-foreground list-disc list-inside">
            <li>
              <strong>Empty responses:</strong> Backend is working but no data has been created yet. Try creating payments, invoices, etc.
            </li>
            <li>
              <strong>401/403 errors:</strong> Authentication issue. Re-login to refresh tokens.
            </li>
            <li>
              <strong>404 errors:</strong> Endpoint not found. Backend might need updating.
            </li>
            <li>
              <strong>500 errors:</strong> Backend server error. Check backend logs.
            </li>
            <li>
              <strong>Network errors:</strong> Backend server might not be running on localhost:8000
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
