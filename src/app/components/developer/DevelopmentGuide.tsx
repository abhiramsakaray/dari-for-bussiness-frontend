import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { BentoLayout } from '../BentoLayout';

export function DevelopmentGuide() {
  return (
    <BentoLayout activePage="development">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Development Guide</h1>
          <p className="text-muted-foreground">
            Complete integration guide for Dari Payments SDK
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <DocSection />
        </div>
      </div>
    </BentoLayout>
  );
}

function DocSection() {
  return (
    <div className="space-y-12">
      {/* Quick Start */}
      <Section title="Quick Start" subtitle="Get started with Dari Payments in minutes">
        <p className="text-muted-foreground mb-6">
          Accept crypto payments across 8+ blockchains with just a few lines of code.
        </p>

        <SubSection title="Installation">
          <CodeBlock
            language="bash"
            code={`npm install daripayments
# or
yarn add daripayments
# or
pnpm add daripayments`}
          />
        </SubSection>

        <SubSection title="Get Your API Key">
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Go to <a href="/dashboard/settings" className="text-primary hover:underline">API Keys</a></li>
            <li>Click "Create New Key"</li>
            <li>Copy your API key (starts with <code className="text-xs bg-muted px-1 py-0.5 rounded">sk_live_</code> or <code className="text-xs bg-muted px-1 py-0.5 rounded">sk_test_</code>)</li>
            <li>Keep it secure - never expose it in client-side code</li>
          </ol>
        </SubSection>
      </Section>

      {/* Basic Integration */}
      <Section title="Basic Integration" subtitle="Three ways to integrate Dari Payments">
        <SubSection title="1. Server-Side Payment Creation (Recommended)">
          <p className="text-sm text-muted-foreground mb-4">
            Create payments securely on your server:
          </p>
          <CodeBlock
            language="typescript"
            title="backend/api/create-payment.ts"
            code={`import { DariApi } from 'daripayments';

const dari = new DariApi(process.env.DARI_API_KEY);

export async function createPayment(req, res) {
  try {
    const payment = await dari.payments.createPayment({
      amount: 99.99,
      currency: 'USD',
      customerEmail: 'customer@example.com',
      accepted_chains: ['polygon', 'base', 'bsc'],
      accepted_tokens: ['USDC', 'USDT'],
      success_url: 'https://yoursite.com/success',
      cancel_url: 'https://yoursite.com/cancel',
    }, { idempotencyKey: \`order-\${orderId}\` });

    res.json({ checkout_url: payment.checkout_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}`}
          />

          <CodeBlock
            language="javascript"
            title="frontend/checkout.js"
            code={`async function handleCheckout() {
  const response = await fetch('/api/create-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: '12345' })
  });

  const { checkout_url } = await response.json();
  window.location.href = checkout_url;
}`}
          />
        </SubSection>

        <SubSection title="2. React Integration">
          <CodeBlock
            language="tsx"
            code={`import { DariProvider, PayWithDariButton } from 'daripayments';

function App() {
  return (
    <DariProvider apiKey={process.env.REACT_APP_DARI_API_KEY}>
      <CheckoutPage />
    </DariProvider>
  );
}

function CheckoutPage() {
  return (
    <PayWithDariButton
      amount={99.99}
      currency="USD"
      customerEmail="customer@example.com"
      chains={['polygon', 'base', 'stellar']}
      onSuccess={(payment) => {
        window.location.href = '/thank-you';
      }}
      onError={(error) => {
        // Handle error
      }}
    />
  );
}`}
          />
        </SubSection>

        <SubSection title="3. Next.js Integration">
          <CodeBlock
            language="typescript"
            title="app/api/payments/route.ts"
            code={`import { DariApi } from 'daripayments';
import { NextResponse } from 'next/server';

const dari = new DariApi(process.env.DARI_API_KEY);

export async function POST(request: Request) {
  const { amount, currency, customerEmail } = await request.json();

  const payment = await dari.payments.createPayment({
    amount,
    currency,
    customerEmail,
    accepted_chains: ['polygon', 'base'],
    accepted_tokens: ['USDC', 'USDT'],
    success_url: \`\${process.env.NEXT_PUBLIC_URL}/success\`,
    cancel_url: \`\${process.env.NEXT_PUBLIC_URL}/cancel\`,
  }, { idempotencyKey: \`payment-\${Date.now()}\` });

  return NextResponse.json({ checkout_url: payment.checkout_url });
}`}
          />

          <CodeBlock
            language="tsx"
            title="app/checkout/page.tsx"
            code={`'use client';

export default function CheckoutPage() {
  async function handleCheckout() {
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 99.99,
        currency: 'USD',
        customerEmail: 'customer@example.com'
      })
    });

    const { checkout_url } = await response.json();
    window.location.href = checkout_url;
  }

  return (
    <button onClick={handleCheckout}>
      Pay with Crypto
    </button>
  );
}`}
          />
        </SubSection>
      </Section>

      {/* Environment Setup */}
      <Section title="Environment Setup" subtitle="Configure your environment variables">
        <CodeBlock
          language="bash"
          title=".env"
          code={`# Get your API key from: https://dashboard.daripay.xyz/api-keys
DARI_API_KEY=sk_live_your_api_key_here

# Generated after webhook setup
DARI_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Optional - for custom deployments
# DARI_API_URL=https://api.daripay.xyz
# DARI_CHECKOUT_HOST=https://pay.daripay.xyz`}
        />

        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
            ⚠️ Security Warning
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Never use <code className="text-xs bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">VITE_</code>, or <code className="text-xs bg-muted px-1 py-0.5 rounded">REACT_APP_</code> prefixes for <code className="text-xs bg-muted px-1 py-0.5 rounded">DARI_API_KEY</code>. Keep it server-side only.
          </p>
        </div>
      </Section>

      {/* Webhook Integration */}
      <Section title="Webhook Integration" subtitle="Receive real-time payment notifications">
        <SubSection title="1. Setup Webhook Endpoint">
          <CodeBlock
            language="typescript"
            title="Express.js"
            code={`import express from 'express';
import { DariApi } from 'daripayments';

const app = express();
const dari = new DariApi(process.env.DARI_API_KEY);

app.post('/webhooks/dari',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const signature = req.headers['x-dari-signature'];

    // Verify signature
    const isValid = dari.webhooks.verifySignature(
      req.body.toString(),
      signature,
      process.env.DARI_WEBHOOK_SECRET
    );

    if (!isValid) {
      return res.status(401).send('Invalid signature');
    }

    const event = JSON.parse(req.body.toString());

    // Handle events
    switch (event.type) {
      case 'payment.completed':
        fulfillOrder(event.data);
        break;
      case 'payment.failed':
        notifyCustomer(event.data);
        break;
    }

    res.json({ received: true });
  }
);`}
          />
        </SubSection>

        <SubSection title="2. Register Webhook">
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
            <li>Go to <a href="/dashboard/settings" className="text-primary hover:underline">Webhooks</a></li>
            <li>Click "Add Endpoint"</li>
            <li>Enter your webhook URL: <code className="text-xs bg-muted px-1 py-0.5 rounded">https://yoursite.com/webhooks/dari</code></li>
            <li>Select events to listen for</li>
            <li>Copy the webhook secret to your <code className="text-xs bg-muted px-1 py-0.5 rounded">.env</code> file</li>
          </ol>
        </SubSection>

        <SubSection title="3. Webhook Events">
          <div className="space-y-2">
            {[
              { event: 'payment.completed', desc: 'Payment successful' },
              { event: 'payment.failed', desc: 'Payment failed' },
              { event: 'payment.expired', desc: 'Payment session expired' },
              { event: 'subscription.payment_succeeded', desc: 'Subscription payment successful' },
              { event: 'subscription.cancelled', desc: 'Subscription cancelled' },
              { event: 'refund.completed', desc: 'Refund processed' },
            ].map(({ event, desc }) => (
              <div key={event} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <code className="text-xs bg-background px-2 py-1 rounded font-mono">{event}</code>
                <span className="text-sm text-muted-foreground">{desc}</span>
              </div>
            ))}
          </div>
        </SubSection>
      </Section>

      {/* Supported Chains & Tokens */}
      <Section title="Supported Blockchains & Tokens" subtitle="Accept payments across multiple chains">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-3">Blockchains</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Polygon (MATIC)</li>
              <li>• Base (ETH)</li>
              <li>• BSC (BNB)</li>
              <li>• Arbitrum (ETH)</li>
              <li>• Stellar (XLM)</li>
              <li>• Tron (TRX)</li>
              <li>• Avalanche (AVAX)</li>
              <li>• Solana (SOL)</li>
            </ul>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-3">Tokens</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• USDC, USDT, DAI, BUSD</li>
              <li>• Native tokens (ETH, MATIC, BNB, etc.)</li>
              <li>• 20+ tokens across all chains</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Resources */}
      <Section title="Resources" subtitle="Additional documentation and support">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'NPM Package', url: 'https://www.npmjs.com/package/daripayments' },
            { title: 'GitHub Repository', url: 'https://github.com/Dari-Organization/daripayments-sdk' },
            { title: 'API Documentation', url: 'https://docs.daripay.xyz' },
            { title: 'Dashboard', url: 'https://dashboard.daripay.xyz' },
          ].map((resource) => (
            <a
              key={resource.title}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <h4 className="font-semibold mb-1">{resource.title}</h4>
              <p className="text-xs text-muted-foreground truncate">{resource.url}</p>
            </a>
          ))}
        </div>

        <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <h4 className="font-semibold mb-2">Need Help?</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Email: <a href="mailto:support@daripay.xyz" className="text-primary hover:underline">support@daripay.xyz</a></li>
            <li>• Documentation: <a href="https://docs.daripay.xyz" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">docs.daripay.xyz</a></li>
            <li>• GitHub Issues: <a href="https://github.com/Dari-Organization/daripayments-sdk/issues" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Report an issue</a></li>
          </ul>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="not-prose">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function CodeBlock({ code, language, title }: { code: string; language: string; title?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {title && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
            <span className="font-mono text-xs text-gray-600">{title}</span>
            <span className="text-xs text-gray-500">{language}</span>
          </div>
        )}
        <div className="relative">
          <pre className="p-4 overflow-x-auto text-sm">
            <code className="text-gray-900 font-mono">{code}</code>
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors opacity-0 group-hover:opacity-100"
            title="Copy code"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
