import { BentoLayout } from "./BentoLayout";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { IntegrationsAPI } from "../../services/integrations-api";
import { 
  ShoppingBag, 
  FileText, 
  Calculator, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Plug,
  Trash2,
  AlertCircle
} from "lucide-react";

interface Integration {
  id?: number;
  type: string;
  name: string;
  description?: string;
  status?: 'active' | 'inactive' | 'error';
  last_sync?: string;
  config?: any;
}

interface ConnectModalProps {
  integration: Integration;
  onClose: () => void;
  onSuccess: () => void;
  apiUrl: string;
  token: string;
}

interface CredentialField {
  key: string;
  label: string;
  placeholder: string;
  type?: string;
  helpText?: string;
  required?: boolean;
  defaultValue?: string;
}

function ConnectIntegrationModal({ integration, onClose, onSuccess, apiUrl, token }: ConnectModalProps) {
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const getCredentialFields = (type: string): CredentialField[] => {
    switch (type.toLowerCase()) {
      case 'shopify':
        return [
          { 
            key: 'shop_domain', 
            label: 'Shop Domain', 
            placeholder: 'your-store.myshopify.com',
            helpText: 'Your Shopify store domain (e.g., my-store.myshopify.com)',
            required: true
          },
          { 
            key: 'access_token', 
            label: 'Admin API Access Token', 
            placeholder: 'shpat_xxxxxxxxxxxxx', 
            type: 'password',
            helpText: 'Get this from Shopify Admin → Settings → Apps → Develop apps',
            required: true
          }
        ];
      case 'tally':
        return [
          { 
            key: 'tally_url', 
            label: 'Tally Server URL', 
            placeholder: 'http://localhost:9000',
            defaultValue: 'http://localhost:9000',
            helpText: 'URL where Tally is running. Use localhost:9000 if on this computer.',
            required: true
          }
        ];
      case 'zoho':
        return [
          { 
            key: 'access_token', 
            label: 'Access Token', 
            placeholder: '1000.xxxxxxxxxxxxx',
            type: 'password',
            helpText: 'OAuth access token from Zoho API Console',
            required: true
          },
          { 
            key: 'organization_id', 
            label: 'Organization ID', 
            placeholder: '123456789',
            helpText: 'Found in Zoho Books → Settings → Organization',
            required: true
          },
          { 
            key: 'refresh_token', 
            label: 'Refresh Token (Optional)', 
            placeholder: '1000.xxxxxxxxxxxxx', 
            type: 'password',
            helpText: 'For automatic token refresh when access token expires',
            required: false
          },
          { 
            key: 'client_id', 
            label: 'Client ID (Optional)', 
            placeholder: 'xxxxxxxxxxxxx',
            helpText: 'From Zoho API Console, needed for token refresh',
            required: false
          },
          { 
            key: 'client_secret', 
            label: 'Client Secret (Optional)', 
            placeholder: 'xxxxxxxxxxxxx', 
            type: 'password',
            helpText: 'From Zoho API Console, needed for token refresh',
            required: false
          }
        ];
      case 'woocommerce':
        return [
          { 
            key: 'store_url', 
            label: 'Store URL', 
            placeholder: 'https://mystore.com',
            helpText: 'Your WooCommerce store URL',
            required: true
          },
          { 
            key: 'consumer_key', 
            label: 'Consumer Key', 
            placeholder: 'ck_xxxxx',
            helpText: 'WooCommerce API consumer key',
            required: true
          },
          { 
            key: 'consumer_secret', 
            label: 'Consumer Secret', 
            placeholder: 'cs_xxxxx', 
            type: 'password',
            helpText: 'WooCommerce API consumer secret',
            required: true
          }
        ];
      case 'quickbooks':
        return [
          { 
            key: 'access_token', 
            label: 'Access Token', 
            placeholder: 'OAuth access token',
            type: 'password',
            helpText: 'OAuth access token from QuickBooks',
            required: true
          },
          { 
            key: 'refresh_token', 
            label: 'Refresh Token', 
            placeholder: 'OAuth refresh token', 
            type: 'password',
            helpText: 'OAuth refresh token from QuickBooks',
            required: true
          },
          { 
            key: 'realm_id', 
            label: 'Company ID (Realm ID)', 
            placeholder: 'Your Company ID',
            helpText: 'QuickBooks company/realm ID',
            required: true
          },
          { 
            key: 'client_id', 
            label: 'Client ID', 
            placeholder: 'Your QuickBooks Client ID',
            helpText: 'App client ID from QuickBooks Developer',
            required: true
          },
          { 
            key: 'client_secret', 
            label: 'Client Secret', 
            placeholder: 'Your Client Secret', 
            type: 'password',
            helpText: 'App client secret from QuickBooks Developer',
            required: true
          }
        ];
      case 'stripe':
        return [
          { 
            key: 'api_key', 
            label: 'Secret Key', 
            placeholder: 'sk_live_xxxxx or sk_test_xxxxx', 
            type: 'password',
            helpText: 'Stripe API secret key',
            required: true
          },
          { 
            key: 'webhook_secret', 
            label: 'Webhook Secret (Optional)', 
            placeholder: 'whsec_xxxxx', 
            type: 'password',
            helpText: 'Stripe webhook signing secret',
            required: false
          }
        ];
      default:
        return [
          { 
            key: 'api_key', 
            label: 'API Key', 
            placeholder: 'Enter API Key', 
            type: 'password',
            required: true
          }
        ];
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    const api = new IntegrationsAPI(apiUrl, token);

    try {
      await api.connect(integration.type, credentials, {
        auto_sync: true,
        sync_interval: 'hourly'
      });
      
      toast.success(`${integration.name} connected successfully!`);
      onSuccess();
    } catch (error: any) {
      // Display detailed error message from backend
      const errorMessage = error.message || 'Failed to connect';
      toast.error(errorMessage, {
        duration: 5000,
        description: 'Please check your credentials and try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const fields = getCredentialFields(integration.type);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-md p-6 shadow-2xl border-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Connect {integration.name}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XCircle className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4 mb-6">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium mb-2">
                {field.label}
                {!field.required && <span className="text-muted-foreground ml-1">(Optional)</span>}
              </label>
              <input
                type={field.type || 'text'}
                placeholder={field.placeholder}
                value={credentials[field.key] || field.defaultValue || ''}
                onChange={(e) => setCredentials({ ...credentials, [field.key]: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {field.helpText && (
                <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleConnect} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Plug className="h-4 w-4 mr-2" />
                Connect
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Default integrations to show if backend doesn't return any
const DEFAULT_INTEGRATIONS: Integration[] = [
  {
    type: 'shopify',
    name: 'Shopify',
    description: 'Sync orders and create payment links for your Shopify store automatically'
  },
  {
    type: 'tally',
    name: 'Tally ERP',
    description: 'Export transactions and reconcile payments with your Tally accounting system'
  },
  {
    type: 'zoho',
    name: 'Zoho Books',
    description: 'Create invoices and sync financial data with Zoho Books seamlessly'
  },
  {
    type: 'woocommerce',
    name: 'WooCommerce',
    description: 'Accept crypto payments on your WooCommerce store with automatic order sync'
  },
  {
    type: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync payments and invoices with QuickBooks for streamlined accounting'
  },
  {
    type: 'stripe',
    name: 'Stripe',
    description: 'Connect your Stripe account for unified payment processing and reporting'
  }
];

export function Integrations() {
  const [availableIntegrations, setAvailableIntegrations] = useState<Integration[]>(DEFAULT_INTEGRATIONS);
  const [connectedIntegrations, setConnectedIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState<Integration | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const token = localStorage.getItem('merchant_token') || '';

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setLoading(true);
    const api = new IntegrationsAPI(apiUrl, token);
    
    try {
      const [available, status] = await Promise.all([
        api.listAvailable(),
        api.getStatus()
      ]);
      
      // Use backend data if available, otherwise use defaults
      setAvailableIntegrations(
        available.integrations && available.integrations.length > 0 
          ? available.integrations 
          : DEFAULT_INTEGRATIONS
      );
      setConnectedIntegrations(status.integrations || []);
    } catch (error: any) {
      // Keep default integrations on error
      setAvailableIntegrations(DEFAULT_INTEGRATIONS);
    } finally {
      setLoading(false);
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'shopify':
        return <ShoppingBag className="h-8 w-8 text-green-600" />;
      case 'tally':
        return <Calculator className="h-8 w-8 text-blue-600" />;
      case 'zoho':
        return <FileText className="h-8 w-8 text-orange-600" />;
      case 'woocommerce':
        return <ShoppingBag className="h-8 w-8 text-purple-600" />;
      case 'quickbooks':
        return <FileText className="h-8 w-8 text-green-700" />;
      case 'stripe':
        return <Plug className="h-8 w-8 text-indigo-600" />;
      default:
        return <Plug className="h-8 w-8 text-gray-600" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Inactive</Badge>;
    }
  };

  const handleConnect = (integration: Integration) => {
    setShowConnectModal(integration);
  };

  const handleSync = async (integrationId: number, type: string) => {
    const api = new IntegrationsAPI(apiUrl, token);
    
    try {
      toast.info('Starting sync...');
      await api.sync(integrationId, 'orders', {});
      toast.success('Sync completed successfully!');
      loadIntegrations();
    } catch (error: any) {
      toast.error('Sync failed: ' + error.message);
    }
  };

  const handleDisconnect = async (integrationId: number) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return;
    
    const api = new IntegrationsAPI(apiUrl, token);
    
    try {
      await api.disconnect(integrationId);
      toast.success('Integration disconnected');
      loadIntegrations();
    } catch (error: any) {
      toast.error('Failed to disconnect: ' + error.message);
    }
  };

  return (
    <BentoLayout activePage="integrations">
      <div className="max-w-6xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl mb-2">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your business tools and automate workflows
          </p>
        </div>

        {/* Connected Integrations */}
        {connectedIntegrations.length > 0 && (
          <div>
            <h2 className="text-xl mb-4">Connected Integrations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedIntegrations.map((integration) => (
                <Card key={integration.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      {getIntegrationIcon(integration.type)}
                    </div>
                    {getStatusBadge(integration.status)}
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 capitalize">{integration.type}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Last sync: {integration.last_sync ? new Date(integration.last_sync).toLocaleString() : 'Never'}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSync(integration.id!, integration.type)}
                      className="flex-1"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Sync
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDisconnect(integration.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Integrations */}
        <div>
          <h2 className="text-xl mb-4">Available Integrations</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableIntegrations.map((integration) => {
                const isConnected = connectedIntegrations.some(
                  (conn) => conn.type === integration.type
                );
                
                return (
                  <Card 
                    key={integration.type} 
                    className={`p-6 hover:shadow-lg transition-all ${
                      isConnected ? 'border-primary/50 bg-primary/5' : 'hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
                        {getIntegrationIcon(integration.type)}
                      </div>
                      {isConnected && (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
                      {integration.description || `Connect your ${integration.name} account`}
                    </p>
                    
                    {!isConnected ? (
                      <Button 
                        className="w-full"
                        onClick={() => handleConnect(integration)}
                      >
                        <Plug className="h-4 w-4 mr-2" />
                        Connect {integration.name}
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            const connected = connectedIntegrations.find(c => c.type === integration.type);
                            if (connected?.id) handleSync(connected.id, integration.type);
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Sync
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const connected = connectedIntegrations.find(c => c.type === integration.type);
                            if (connected?.id) handleDisconnect(connected.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Connect Modal */}
        {showConnectModal && (
          <ConnectIntegrationModal
            integration={showConnectModal}
            onClose={() => setShowConnectModal(null)}
            onSuccess={() => {
              setShowConnectModal(null);
              loadIntegrations();
            }}
            apiUrl={apiUrl}
            token={token}
          />
        )}
      </div>
    </BentoLayout>
  );
}
