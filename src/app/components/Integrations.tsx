import { DashboardLayout } from "./DashboardLayout";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Code, Copy, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

export function Integrations() {
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const apiKey = localStorage.getItem('api_key') || 'YOUR_API_KEY';
  const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;

  return (
    <DashboardLayout activePage="integrations">
      <div className="max-w-5xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl mb-2">E-commerce Integration</h1>
          <p className="text-muted-foreground">
            Add crypto payments to your store in minutes
          </p>
        </div>

        {/* Quick Start */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h2 className="text-xl mb-4 flex items-center gap-2">
            <Code className="h-5 w-5" />
            Quick Start - One API Call
          </h2>
          <div className="space-y-4">
            <div className="bg-secondary/50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{`POST ${baseUrl}/integrations/create-checkout
Content-Type: application/json

{
  "api_key": "${apiKey}",
  "amount": "50.00",
  "currency": "USD",
  "order_id": "ORDER-123",
  "customer_email": "customer@example.com",
  "success_url": "https://yourstore.com/success",
  "cancel_url": "https://yourstore.com/cancel"
}`}</pre>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyCode(`curl -X POST ${baseUrl}/integrations/create-checkout \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_key": "${apiKey}",
    "amount": "50.00",
    "currency": "USD",
    "order_id": "ORDER-123",
    "success_url": "https://yourstore.com/success",
    "cancel_url": "https://yourstore.com/cancel"
  }'`)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy cURL Command
            </Button>
          </div>
        </Card>

        {/* Platform Tabs */}
        <Tabs defaultValue="shopify" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="shopify">Shopify</TabsTrigger>
            <TabsTrigger value="woocommerce">WooCommerce</TabsTrigger>
            <TabsTrigger value="custom">Custom Site</TabsTrigger>
            <TabsTrigger value="api">API Docs</TabsTrigger>
          </TabsList>

          {/* Shopify */}
          <TabsContent value="shopify" className="space-y-4">
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg mb-4">Shopify Integration - 3 Simple Steps</h3>
              
              {/* Step 1 */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center rounded">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">Add ChainPe Script to Theme</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      File: <code className="bg-secondary px-2 py-1 rounded text-xs">layout/theme.liquid</code>
                      <br />Add before closing <code className="bg-secondary px-2 py-1 rounded text-xs">&lt;/body&gt;</code> tag
                    </p>
                    <div className="bg-secondary p-4 rounded-lg font-mono text-xs overflow-x-auto">
                      <pre>{`<!-- ChainPe Crypto Payment Integration -->
<script>
  window.ChainPe = {
    apiKey: '${apiKey}',
    apiUrl: '${baseUrl}',
    
    createCheckout: function(amount, currency, orderId, customerEmail) {
      return fetch(this.apiUrl + '/integrations/create-checkout', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          api_key: this.apiKey,
          amount: amount,
          currency: currency,
          order_id: orderId,
          customer_email: customerEmail,
          success_url: window.location.origin + '/pages/payment-success',
          cancel_url: window.location.origin + '/cart'
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        }
      });
    }
  };
  
  function payWithChainPe() {
    {% if template contains 'cart' %}
      const cartTotal = {{ cart.total_price | money_without_currency | json }};
      const currency = {{ cart.currency.iso_code | json }};
      const cartId = 'SHOPIFY-' + Date.now();
      const email = {{ customer.email | default: '' | json }};
      
      window.ChainPe.createCheckout(cartTotal, currency, cartId, email);
    {% endif %}
  }
</script>`}</pre>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => copyCode(`<!-- ChainPe Script -->
<script>
  window.ChainPe = {
    apiKey: '${apiKey}',
    apiUrl: '${baseUrl}',
    createCheckout: function(amount, currency, orderId, customerEmail) {
      return fetch(this.apiUrl + '/integrations/create-checkout', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          api_key: this.apiKey,
          amount: amount,
          currency: currency,
          order_id: orderId,
          customer_email: customerEmail,
          success_url: window.location.origin + '/pages/payment-success',
          cancel_url: window.location.origin + '/cart'
        })
      }).then(res => res.json()).then(data => {
        if (data.checkout_url) window.location.href = data.checkout_url;
      });
    }
  };
  function payWithChainPe() {
    const cartTotal = {{ cart.total_price | money_without_currency | json }};
    const currency = {{ cart.currency.iso_code | json }};
    window.ChainPe.createCheckout(cartTotal, currency, 'SHOPIFY-' + Date.now(), '');
  }
</script>`)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Script
                    </Button>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center rounded">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">Add Payment Button to Cart</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      File: <code className="bg-secondary px-2 py-1 rounded text-xs">sections/main-cart.liquid</code>
                      <br />Add after cart summary section
                    </p>
                    <div className="bg-secondary p-4 rounded-lg font-mono text-xs overflow-x-auto">
                      <pre>{`{%- unless cart.empty? -%}
  <div class="cart-page__chainpe" style="padding-top: 20px;">
    <button 
      onclick="payWithChainPe()" 
      class="button button--primary"
      style="background: #000; color: #fff; padding: 16px; width: 100%; 
             border: none; cursor: pointer; font-weight: 600; font-size: 16px;">
      💰 Pay with Crypto (USDC/XLM)
    </button>
    <p style="text-align: center; margin-top: 8px; font-size: 12px; color: #666;">
      Fast, secure payments on Stellar blockchain
    </p>
  </div>
{%- endunless -%}`}</pre>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => copyCode(`{%- unless cart.empty? -%}
  <div class="cart-page__chainpe" style="padding-top: 20px;">
    <button onclick="payWithChainPe()" class="button button--primary"
      style="background: #000; color: #fff; padding: 16px; width: 100%; border: none; cursor: pointer; font-weight: 600; font-size: 16px;">
      💰 Pay with Crypto (USDC/XLM)
    </button>
    <p style="text-align: center; margin-top: 8px; font-size: 12px; color: #666;">
      Fast, secure payments on Stellar blockchain
    </p>
  </div>
{%- endunless -%}`)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Button Code
                    </Button>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center rounded">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">Create Success Page (Optional)</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Create page: <code className="bg-secondary px-2 py-1 rounded text-xs">pages/payment-success</code>
                    </p>
                    <div className="bg-secondary p-4 rounded-lg font-mono text-xs overflow-x-auto">
                      <pre>{`<div style="max-width: 600px; margin: 80px auto; text-align: center;">
  <h1 style="font-size: 48px; margin-bottom: 20px;">✅</h1>
  <h2 style="font-size: 32px; margin-bottom: 16px;">Payment Successful!</h2>
  <p style="font-size: 18px; color: #666; margin-bottom: 32px;">
    Your crypto payment has been confirmed on the blockchain.
  </p>
  <a href="/" class="button button--primary">Continue Shopping</a>
</div>`}</pre>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => copyCode(`<div style="max-width: 600px; margin: 80px auto; text-align: center; padding: 40px;">
  <h1 style="font-size: 48px; margin-bottom: 20px;">✅</h1>
  <h2 style="font-size: 32px; margin-bottom: 16px;">Payment Successful!</h2>
  <p style="font-size: 18px; color: #666; margin-bottom: 32px;">
    Your crypto payment has been confirmed on the blockchain.
  </p>
  <a href="/" class="button button--primary" style="background: #000; color: #fff; padding: 16px 32px; text-decoration: none; display: inline-block;">
    Continue Shopping
  </a>
</div>`)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Success Page
                    </Button>
                  </div>
                </div>
              </div>

              {/* Setup Instructions */}
              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="font-semibold mb-2 text-sm">📝 How to Edit Shopify Theme</h4>
                <ol className="text-xs text-muted-foreground space-y-1 ml-4 list-decimal">
                  <li>Go to <strong>Shopify Admin → Online Store → Themes</strong></li>
                  <li>Click <strong>Actions → Edit code</strong></li>
                  <li>Find the file in left sidebar and paste the code</li>
                  <li>Replace <code className="bg-secondary px-1 rounded">{apiKey}</code> with your actual API key</li>
                  <li>Click <strong>Save</strong></li>
                </ol>
              </div>

              {/* Testing */}
              <div className="mt-4 p-4 bg-secondary/50 border border-border rounded-lg">
                <h4 className="font-semibold mb-2 text-sm">🧪 Testing Your Integration</h4>
                <ol className="text-xs text-muted-foreground space-y-1 ml-4 list-decimal">
                  <li>Add items to cart and go to cart page</li>
                  <li>Click "Pay with Crypto" button</li>
                  <li>You'll be redirected to ChainPe checkout</li>
                  <li>Complete payment with USDC or XLM</li>
                  <li>Redirected back to success page ✅</li>
                </ol>
              </div>
            </Card>
          </TabsContent>

          {/* WooCommerce */}
          <TabsContent value="woocommerce" className="space-y-4">
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg mb-4">WooCommerce Integration</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Add to your payment gateway class:</p>
                  <div className="bg-secondary p-4 rounded-lg font-mono text-xs overflow-x-auto">
                    <pre>{`public function process_payment($order_id) {
  $order = wc_get_order($order_id);
  
  $response = wp_remote_post('${baseUrl}/integrations/create-checkout', array(
    'body' => json_encode(array(
      'api_key' => '${apiKey}',
      'amount' => $order->get_total(),
      'currency' => get_woocommerce_currency(),
      'order_id' => $order->get_id(),
      'customer_email' => $order->get_billing_email(),
      'success_url' => $this->get_return_url($order),
      'cancel_url' => wc_get_checkout_url()
    )),
    'headers' => array('Content-Type' => 'application/json')
  ));
  
  $data = json_decode(wp_remote_retrieve_body($response));
  
  return array(
    'result' => 'success',
    'redirect' => $data->checkout_url
  );
}`}</pre>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => copyCode(`public function process_payment($order_id) {
  $order = wc_get_order($order_id);
  $response = wp_remote_post('${baseUrl}/integrations/create-checkout', array(
    'body' => json_encode(array(
      'api_key' => '${apiKey}',
      'amount' => $order->get_total(),
      'currency' => get_woocommerce_currency(),
      'order_id' => $order->get_id(),
      'success_url' => $this->get_return_url($order),
      'cancel_url' => wc_get_checkout_url()
    )),
    'headers' => array('Content-Type' => 'application/json')
  ));
  $data = json_decode(wp_remote_retrieve_body($response));
  return array('result' => 'success', 'redirect' => $data->checkout_url);
}`)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Custom Site */}
          <TabsContent value="custom" className="space-y-4">
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg mb-4">Custom Website Integration</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">JavaScript/Frontend:</p>
                  <div className="bg-secondary p-4 rounded-lg font-mono text-xs overflow-x-auto">
                    <pre>{`async function createCheckout(amount, orderId) {
  const response = await fetch('${baseUrl}/integrations/create-checkout', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      api_key: '${apiKey}',
      amount: amount,
      currency: 'USD',
      order_id: orderId,
      success_url: window.location.origin + '/success',
      cancel_url: window.location.origin + '/cancel'
    })
  });
  
  const data = await response.json();
  window.location.href = data.checkout_url;
}

// Usage
document.getElementById('payButton').onclick = () => {
  createCheckout('50.00', 'ORDER-123');
};`}</pre>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => copyCode(`async function createCheckout(amount, orderId) {
  const response = await fetch('${baseUrl}/integrations/create-checkout', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      api_key: '${apiKey}',
      amount: amount,
      currency: 'USD',
      order_id: orderId,
      success_url: window.location.origin + '/success',
      cancel_url: window.location.origin + '/cancel'
    })
  });
  const data = await response.json();
  window.location.href = data.checkout_url;
}`)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Python/Backend:</p>
                  <div className="bg-secondary p-4 rounded-lg font-mono text-xs overflow-x-auto">
                    <pre>{`import requests

def create_checkout(amount, order_id):
    response = requests.post('${baseUrl}/integrations/create-checkout', json={
        'api_key': '${apiKey}',
        'amount': amount,
        'currency': 'USD',
        'order_id': order_id,
        'success_url': 'https://yoursite.com/success',
        'cancel_url': 'https://yoursite.com/cancel'
    })
    
    data = response.json()
    return data['checkout_url']`}</pre>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => copyCode(`import requests

def create_checkout(amount, order_id):
    response = requests.post('${baseUrl}/integrations/create-checkout', json={
        'api_key': '${apiKey}',
        'amount': amount,
        'currency': 'USD',
        'order_id': order_id,
        'success_url': 'https://yoursite.com/success',
        'cancel_url': 'https://yoursite.com/cancel'
    })
    return response.json()['checkout_url']`)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* API Docs */}
          <TabsContent value="api" className="space-y-4">
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg mb-4">API Endpoints</h3>
              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm font-mono">POST /integrations/create-checkout</code>
                    <Badge>Create</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Create a new checkout session</p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm font-mono">GET /integrations/verify/{"{session_id}"}</code>
                    <Badge variant="outline">Verify</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Verify payment status</p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm font-mono">GET /integrations/payment-button</code>
                    <Badge variant="secondary">Widget</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Get embeddable payment button</p>
                </div>

                <Button
                  className="w-full"
                  onClick={() => window.open(`${baseUrl}/docs`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Full API Documentation
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg mb-4">Webhooks</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Receive real-time notifications when payments are completed
              </p>
              <div className="bg-secondary p-4 rounded-lg font-mono text-xs overflow-x-auto">
                <pre>{`{
  "event": "payment.completed",
  "session_id": "pay_xxx",
  "amount": "50.00",
  "currency": "USD",
  "paid_amount": "50.00",
  "paid_asset": "USDC",
  "transaction_hash": "abc123...",
  "status": "completed",
  "metadata": {
    "order_id": "ORDER-123",
    "customer_email": "customer@example.com"
  },
  "timestamp": "2025-12-19T10:35:00Z"
}`}</pre>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Your API Key */}
        <Card className="p-6 bg-card border-primary/20">
          <h3 className="text-lg mb-4">Your API Key</h3>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-4 py-3 bg-secondary rounded-md font-mono text-sm">
              {apiKey}
            </code>
            <Button
              variant="outline"
              onClick={() => copyCode(apiKey)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            ⚠️ Keep your API key secure. Never expose it in client-side code for production.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
