// integrations-api.ts
export class IntegrationsAPI {
  private baseURL: string;
  private token: string;

  constructor(baseURL: string, token: string) {
    this.baseURL = baseURL.replace(/\/api\/v1\/?$/, '');
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      const errorMessage = typeof error.detail === 'string' ? error.detail : (error.message || `API Error: ${response.statusText}`);
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // List available integrations
  async listAvailable() {
    return this.request('/integrations/available');
  }

  // Connect a new integration
  async connect(integrationType: string, credentials: any, config: any = {}) {
    return this.request('/integrations/connect', {
      method: 'POST',
      body: JSON.stringify({
        integration_type: integrationType,
        credentials,
        config,
      }),
    });
  }

  // Get integration status
  async getStatus() {
    return this.request('/integrations/status');
  }

  // Disconnect integration
  async disconnect(integrationId: number) {
    return this.request(`/integrations/disconnect/${integrationId}`, {
      method: 'POST',
    });
  }

  // Trigger sync
  async sync(integrationId: number, syncType: string, params: any = {}) {
    return this.request(`/integrations/sync/${integrationId}`, {
      method: 'POST',
      body: JSON.stringify({
        sync_type: syncType,
        params,
      }),
    });
  }

  // Shopify specific
  async shopifySyncOrders(integrationId: number, sinceId?: number) {
    const params = sinceId ? `?since_id=${sinceId}` : '';
    return this.request(`/integrations/shopify/sync-orders/${integrationId}${params}`, {
      method: 'POST',
    });
  }

  // Tally specific
  async tallyExport(integrationId: number, transaction: any) {
    return this.request(`/integrations/tally/export/${integrationId}`, {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  // Zoho specific
  async zohoCreateInvoice(integrationId: number, invoiceData: any) {
    return this.request(`/integrations/zoho/create-invoice/${integrationId}`, {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  }
  
  // Get OAuth URL for a specific connector (e.g., 'stripe')
  async getConnectorOAuthUrl(provider: string) {
    return this.request(`/connectors/${provider}/oauth-url`);
  }

  // Connect provider with API keys
  async connectWithApiKey(provider: string, credentials: { publishable_key: string; secret_key: string }) {
    return this.request(`/connectors/${provider}/api-key`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Handle OAuth callback
  async handleConnectorOAuthCallback(provider: string, code: string, state: string) {
    return this.request(`/connectors/${provider}/callback`, {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    });
  }
}

