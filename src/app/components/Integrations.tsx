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

function RazorpayLogo() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true" role="img">
      <rect width="48" height="48" rx="14" fill="#0F172A" />
      <path d="M18 12h12l-3 10h7L19 36l4-10h-5l0-14Z" fill="#5B21B6" />
      <path d="M19 36l13-14h-7l3-10h-12l0 14h5l-4 10Z" fill="#14B8A6" opacity="0.9" />
    </svg>
  );
}

function StripeLogo() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true" role="img">
      <rect width="48" height="48" rx="14" fill="#635BFF" />
      <path
        d="M26.2 18.2c-2.1 0-3.3 1-3.3 2.3 0 1.5 1.9 2 4.2 2.8 2.5.9 5.4 2.1 5.4 5.9 0 4.4-3.7 6.7-8.5 6.7-2.2 0-4.7-.5-6.7-1.5l1.1-4.5c1.8.9 4 1.4 5.8 1.4 2 0 3.1-.7 3.1-1.9 0-1.3-1.4-1.8-3.8-2.7-3-1.1-5.8-2.5-5.8-6.1 0-4 3.3-6.5 8.1-6.5 2.1 0 4.3.4 6.2 1.3l-1.1 4.4c-1.7-.8-3.5-1.2-4.7-1.2Z"
        fill="#fff"
      />
    </svg>
  );
}

function getIntegrationLogo(type: string) {
  switch (type.toLowerCase()) {
    case 'razorpay':
      return <RazorpayLogo />;
    case 'stripe':
      return <StripeLogo />;
    default:
      return <Plug className="h-8 w-8 text-gray-600" />;
  }
}

function normalizeIntegration(integration: Integration): Integration {
  return {
    ...integration,
    type: integration.type.toLowerCase(),
    status: integration.status || 'active'
  };
}

function ConnectIntegrationModal({ integration, onClose, onSuccess, apiUrl, token }: ConnectModalProps) {
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const getCredentialFields = (type: string): CredentialField[] => {
    switch (type.toLowerCase()) {
      case 'razorpay':
        return [
          { 
            key: 'razorpay_key_id', 
            label: 'Razorpay Key ID', 
            placeholder: 'rzp_test_xxxxxxxxxxxxx',
            helpText: 'Get this from Razorpay Dashboard → Settings → API Keys',
            required: true
          },
          { 
            key: 'razorpay_key_secret', 
            label: 'Razorpay Key Secret', 
            placeholder: 'xxxxxxxxxxxxx', 
            type: 'password',
            helpText: 'Secret key from Razorpay Dashboard → Settings → API Keys',
            required: true
          },
          { 
            key: 'razorpay_webhook_secret', 
            label: 'Webhook Secret (Optional)', 
            placeholder: 'whsec_xxxxxxxxxxxxx', 
            type: 'password',
            helpText: 'For webhook signature verification',
            required: false
          }
        ];
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
            key: 'publishable_key', 
            label: 'Publishable Key', 
            placeholder: 'pk_live_xxxxx or pk_test_xxxxx', 
            type: 'text',
            helpText: 'Stripe API publishable key',
            required: true
          },
          { 
            key: 'secret_key', 
            label: 'Secret Key', 
            placeholder: 'sk_live_xxxxx or sk_test_xxxxx', 
            type: 'password',
            helpText: 'Stripe API secret key',
            required: true
          }
        ];
      case 'dodo':
        return [
          { key: 'api_key', label: 'API Key', placeholder: 'test_xxxx or live_xxxx', type: 'password', required: true },
          { key: 'webhook_secret', label: 'Webhook Secret', placeholder: 'Optional', type: 'password', required: false },
        ];
      case 'paytm':
        return [
          { key: 'merchant_id', label: 'Merchant ID', placeholder: 'xxxxxx', required: true },
          { key: 'merchant_key', label: 'Merchant Key', placeholder: 'xxxxxx', type: 'password', required: true },
          { key: 'webhook_secret', label: 'Webhook Secret (Optional)', placeholder: 'xxxxxx', type: 'password', required: false },
        ];
      case 'phonepe':
        return [
          { key: 'client_id', label: 'Client ID', placeholder: 'xxxxxx', required: true },
          { key: 'client_secret', label: 'Client Secret', placeholder: 'xxxxxx', type: 'password', required: true },
          { key: 'username', label: 'Webhook Username', placeholder: 'xxxxxx', required: true },
          { key: 'password', label: 'Webhook Password', placeholder: 'xxxxxx', type: 'password', required: true },
        ];
      case 'cashfree':
        return [
          { key: 'app_id', label: 'App ID', placeholder: 'xxxxxx', required: true },
          { key: 'secret_key', label: 'Secret Key', placeholder: 'xxxxxx', type: 'password', required: true },
          { key: 'webhook_secret', label: 'Webhook Secret (Optional)', placeholder: 'xxxxxx', type: 'password', required: false },
        ];
      case 'payu':
        return [
          { key: 'merchant_key', label: 'Merchant Key', placeholder: 'xxxxxx', required: true },
          { key: 'merchant_salt', label: 'Merchant Salt', placeholder: 'xxxxxx', type: 'password', required: true },
          { key: 'webhook_secret', label: 'Webhook Secret (Optional)', placeholder: 'xxxxxx', type: 'password', required: false },
        ];
      case 'ccavenue':
        return [
          { key: 'merchant_id', label: 'Merchant ID', placeholder: 'xxxxxx', required: true },
          { key: 'access_code', label: 'Access Code', placeholder: 'xxxxxx', required: true },
          { key: 'working_key', label: 'Working Key', placeholder: 'xxxxxx', type: 'password', required: true },
        ];
      case 'instamojo':
        return [
          { key: 'api_key', label: 'API Key', placeholder: 'xxxxxx', type: 'password', required: true },
          { key: 'auth_token', label: 'Auth Token', placeholder: 'xxxxxx', type: 'password', required: true },
          { key: 'webhook_secret', label: 'Webhook Secret (Optional)', placeholder: 'xxxxxx', type: 'password', required: false },
        ];
      case 'easebuzz':
        return [
          { key: 'merchant_key', label: 'Merchant Key', placeholder: 'xxxxxx', required: true },
          { key: 'merchant_salt', label: 'Merchant Salt', placeholder: 'xxxxxx', type: 'password', required: true },
          { key: 'webhook_secret', label: 'Webhook Secret (Optional)', placeholder: 'xxxxxx', type: 'password', required: false },
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
      const connectorSet = new Set(['stripe', 'razorpay', 'dodo', 'paytm', 'phonepe', 'cashfree', 'payu', 'ccavenue', 'instamojo', 'easebuzz']);
      if (connectorSet.has(integration.type)) {
        await api.connectWithApiKey(integration.type, credentials);
      } else {
        await api.connect(integration.type, credentials, {
          auto_sync: true,
          sync_interval: 'hourly'
        });
      }
      
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
                Connect {(integration.type === 'stripe' || integration.type === 'razorpay') ? '(API Keys)' : ''}
              </>
            )}
          </Button>
        </div>
        {integration.type === 'stripe' && (
          <p className="text-xs text-muted-foreground mt-4 text-center w-full block">
            Stripe Connect OAuth onboarding will be available in a future release.
          </p>
        )}
        {integration.type === 'razorpay' && (
          <p className="text-xs text-muted-foreground mt-4 text-center w-full block">
            Get your API keys from Razorpay Dashboard → Settings → API Keys
          </p>
        )}
      </Card>
    </div>
  );
}

const ALLOWED_INTEGRATION_TYPES = new Set(['razorpay', 'stripe', 'dodo', 'paytm', 'phonepe', 'cashfree', 'payu', 'ccavenue', 'instamojo', 'easebuzz']);

// Default integrations to show if backend doesn't return any
const DEFAULT_INTEGRATIONS: Integration[] = [
  {
    type: 'razorpay',
    name: 'Razorpay',
    description: 'Accept payments via Razorpay with automated order sync and payment links'
  },
  {
    type: 'stripe',
    name: 'Stripe',
    description: 'Connect your Stripe account for unified payment processing and reporting'
  },
  { type: 'dodo', name: 'Dodo Payments', description: 'Accept payments via Dodo Payments API' },
  { type: 'paytm', name: 'Paytm', description: 'Accept payments via Paytm Payment Gateway' },
  { type: 'phonepe', name: 'PhonePe', description: 'Accept payments via PhonePe Standard Checkout' },
  { type: 'cashfree', name: 'Cashfree', description: 'Accept payments via Cashfree Payment Gateway' },
  { type: 'payu', name: 'PayU', description: 'Accept payments via PayU Payment Gateway' },
  { type: 'ccavenue', name: 'CCAvenue', description: 'Accept payments via CCAvenue Payment Gateway' },
  { type: 'instamojo', name: 'Instamojo', description: 'Accept payments via Instamojo Payment Gateway' },
  { type: 'easebuzz', name: 'Easebuzz', description: 'Accept payments via Easebuzz Payment Gateway' }
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
    
    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      handleOAuthCallback('stripe', code, state);
    }
  }, []);

  const handleOAuthCallback = async (provider: string, code: string, state: string) => {
    setLoading(true);
    const api = new IntegrationsAPI(apiUrl, token);
    try {
      await api.handleConnectorOAuthCallback(provider, code, state);
      toast.success(`${provider} connected successfully!`);
      // Remove query parameters to clean up URL
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
      loadIntegrations(); // Refresh list
    } catch (error: any) {
      toast.error(error.message || `Failed to connect ${provider}`);
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    } finally {
      setLoading(false);
    }
  };

  const loadIntegrations = async () => {
    setLoading(true);
    const api = new IntegrationsAPI(apiUrl, token);
    
    try {
      const connectorTypes = ['stripe', 'razorpay', 'dodo', 'paytm', 'phonepe', 'cashfree', 'payu', 'ccavenue', 'instamojo', 'easebuzz'];
      const [available, status, ...connectorStatuses] = await Promise.all([
        api.listAvailable(),
        api.getStatus(),
        ...connectorTypes.map(type => 
          api.getConnectorStatus(type)
             .then(data => ({ type, data }))
             .catch(() => ({ type, data: { is_connected: false } }))
        )
      ]);
      
      // Combine backend data with frontend defaults (for connectors like Stripe)
      const backendIntegrations = (available.integrations || []).filter((integration: any) =>
        ALLOWED_INTEGRATION_TYPES.has(integration.type.toLowerCase())
      );
      const combined = backendIntegrations.map(normalizeIntegration);
      
      DEFAULT_INTEGRATIONS.forEach(defaultInt => {
        if (!combined.some((i: any) => i.type === defaultInt.type)) {
          combined.push(normalizeIntegration(defaultInt));
        }
      });

      const filtered = combined.filter((integration: any) =>
        ALLOWED_INTEGRATION_TYPES.has(integration.type.toLowerCase())
      );

      setAvailableIntegrations(filtered);
      
      const connected = (status.integrations || [])
        .filter((integration: Integration) => ALLOWED_INTEGRATION_TYPES.has(integration.type.toLowerCase()))
        .map(normalizeIntegration);
        
      connectorStatuses.forEach((statusObj, idx) => {
        const { type, data } = statusObj;
        if (data && data.is_connected) {
          connected.push({
            id: -1 - idx,
            type: type,
            name: DEFAULT_INTEGRATIONS.find(i => i.type === type)?.name || type,
            status: data.is_active ? 'active' : 'inactive',
            last_sync: data.last_health_check,
            config: { metadata: { environment: data.environment || 'live', account_id: data.connected_account_id } }
          });
        }
      });

      setConnectedIntegrations(connected);
    } catch (error: any) {
      // Keep default integrations on error
      setAvailableIntegrations(DEFAULT_INTEGRATIONS);
    } finally {
      setLoading(false);
    }
  };

  const getIntegrationIcon = (type: string) => {
    return getIntegrationLogo(type);
  };

  const isConnectedIntegration = (type: string) =>
    connectedIntegrations.some((conn) => conn.type.toLowerCase() === type.toLowerCase());

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

  const handleConnect = async (integration: Integration) => {
    const connectorSet = new Set(['stripe', 'razorpay', 'dodo', 'paytm', 'phonepe', 'cashfree', 'payu', 'ccavenue', 'instamojo', 'easebuzz']);
    if (connectorSet.has(integration.type)) {
      // Show connection modal for API keys
      setShowConnectModal(integration);
      return;
    }
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

  const handleDisconnect = async (integrationId: number, type: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return;
    
    const api = new IntegrationsAPI(apiUrl, token);
    
    try {
      const connectorSet = new Set(['stripe', 'razorpay', 'dodo', 'paytm', 'phonepe', 'cashfree', 'payu', 'ccavenue', 'instamojo', 'easebuzz']);
      if (connectorSet.has(type)) {
        await api.disconnectConnector(type);
      } else {
        await api.disconnect(integrationId);
      }
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
                      {getIntegrationLogo(integration.type)}
                    </div>
                    {getStatusBadge(integration.status)}
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 capitalize">{integration.type}</h3>
                  
                  {/* Provider Metadata Display */}
                  {integration.type === 'stripe' && integration.config?.metadata && (
                    <div className="mb-4 text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md border border-border/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-foreground">{integration.config.metadata.business_name || 'Connected Account'}</span>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{integration.config.metadata.environment}</Badge>
                      </div>
                      <div className="flex items-center text-xs gap-1 opacity-80">
                        <Plug className="h-3 w-3" />
                        <span className="font-mono">{integration.config.metadata.stripe_account_id}</span>
                      </div>
                    </div>
                  )}

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
                      onClick={() => handleDisconnect(integration.id!, integration.type)}
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
                const isConnected = isConnectedIntegration(integration.type);
                const connectedIntegration = connectedIntegrations.find(
                  (conn) => conn.type.toLowerCase() === integration.type.toLowerCase()
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
                        {getIntegrationLogo(integration.type)}
                      </div>
                      {isConnected && connectedIntegration && getStatusBadge(connectedIntegration.status)}
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
                      {integration.description || `Connect your ${integration.name} account`}
                    </p>
                    
                    <Button 
                      className="w-full"
                      onClick={() => handleConnect(integration)}
                      disabled={isConnected}
                      variant={isConnected ? "secondary" : "default"}
                    >
                      {isConnected ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Connected
                        </>
                      ) : (
                        <>
                          <Plug className="h-4 w-4 mr-2" />
                          Connect {integration.name} {(integration.type === 'stripe' || integration.type === 'razorpay') ? '(API Keys)' : ''}
                        </>
                      )}
                    </Button>
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
