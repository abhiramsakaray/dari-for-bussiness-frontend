import { useState } from 'react';
import { GenericPage } from './GenericPage';
import { Copy, Check, Sparkles, FileText, BookOpen, Terminal, Shield, ArrowRight } from 'lucide-react';

export function PublicDocsPage() {
  const [activeTab, setActiveTab] = useState<'guide' | 'ai'>('guide');

  return (
    <GenericPage
      label="Documentation"
      title="Developer Hub — APIs, SDKs & AI Integration"
      subtitle="Accept stablecoin payments across multiple chains. Integrate with our step-by-step developer guides or build instantly with AI coding agents."
      path="docs"
    >
      <div className="not-prose max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1.5 bg-gray-50 border border-gray-200 rounded-xl mb-12 max-w-md">
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'guide'
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            <FileText className="h-4 w-4" />
            Developer Guide
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'ai'
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Code with AI
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'guide' ? <PublicDevelopmentGuide /> : <PublicCodeWithAI />}
      </div>
    </GenericPage>
  );
}

/* ==========================================================================
   DEVELOPER GUIDE TAB COMPONENT
   ========================================================================== */

function PublicDevelopmentGuide() {
  return (
    <div className="space-y-12">
      {/* Quick Start */}
      <Section title="Quick Start" subtitle="Get started with Dari Payments in minutes">
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
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
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 mb-4">
            <li>Go to <a href="/register" className="text-black underline hover:no-underline font-medium">Create a Free Account</a></li>
            <li>Navigate to Dashboard → Settings → API Keys</li>
            <li>Click "Create New Key"</li>
            <li>Copy your API key (starts with <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono font-semibold">sk_live_</code> or <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono font-semibold">sk_test_</code>)</li>
            <li>Keep it secure - never expose it in client-side code</li>
          </ol>
        </SubSection>
      </Section>

      {/* Basic Integration */}
      <Section title="Basic Integration" subtitle="Three ways to integrate Dari Payments">
        <SubSection title="1. Server-Side Payment Creation (Recommended)">
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
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
    }, { idempotencyKey: \`order-\${req.body.orderId}\` });

    res.json({ checkout_url: payment.checkout_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}`}
          />

          <p className="text-sm text-gray-600 my-4 leading-relaxed">
            On the client side, make a POST request and redirect the user:
          </p>
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
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            Use pre-built React components in your web app:
          </p>
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
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            Full API Route & Page setup for Next.js App Router:
          </p>
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
    <button onClick={handleCheckout} className="px-6 py-3 bg-black text-white rounded-lg">
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
          code={`# Get your API key from Dashboard -> Settings -> API Keys
DARI_API_KEY=sk_live_your_api_key_here

# Generated after webhook setup
DARI_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Optional - for custom deployments
# DARI_API_URL=https://api.daripay.xyz
# DARI_CHECKOUT_HOST=https://pay.daripay.xyz`}
        />

        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800 font-semibold flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-amber-700" />
            ⚠️ Security Warning
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Never use <code className="text-xs bg-white border px-1 py-0.5 rounded font-mono font-medium text-amber-800">NEXT_PUBLIC_</code>, <code className="text-xs bg-white border px-1 py-0.5 rounded font-mono font-medium text-amber-800">VITE_</code>, or <code className="text-xs bg-white border px-1 py-0.5 rounded font-mono font-medium text-amber-800">REACT_APP_</code> prefixes for <code className="text-xs bg-white border px-1 py-0.5 rounded font-mono font-medium text-amber-800">DARI_API_KEY</code>. Keep it server-side only.
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

        <SubSection title="2. Webhook Events">
          <div className="space-y-2">
            {[
              { event: 'payment.completed', desc: 'Payment successful' },
              { event: 'payment.failed', desc: 'Payment failed' },
              { event: 'payment.expired', desc: 'Payment session expired' },
              { event: 'subscription.payment_succeeded', desc: 'Subscription payment successful' },
              { event: 'subscription.cancelled', desc: 'Subscription cancelled' },
              { event: 'refund.completed', desc: 'Refund processed' },
            ].map(({ event, desc }) => (
              <div key={event} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-150 rounded-lg">
                <code className="text-xs bg-white border border-gray-200 px-2 py-1 rounded font-mono font-semibold text-gray-800">{event}</code>
                <span className="text-xs text-gray-500 font-medium">{desc}</span>
              </div>
            ))}
          </div>
        </SubSection>
      </Section>

      {/* Supported Chains */}
      <Section title="Supported Blockchains & Tokens" subtitle="Accept payments across multiple chains">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
            <h4 className="font-semibold mb-3 text-black">Blockchains</h4>
            <ul className="space-y-2 text-sm text-gray-600 font-medium">
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
          <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
            <h4 className="font-semibold mb-3 text-black">Tokens</h4>
            <ul className="space-y-2 text-sm text-gray-600 font-medium">
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
            { title: 'Get Started (Register)', url: '/register' },
          ].map((resource) => (
            <a
              key={resource.title}
              href={resource.url}
              target={resource.url.startsWith('http') ? '_blank' : undefined}
              rel={resource.url.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <h4 className="font-semibold mb-1 text-black text-sm">{resource.title}</h4>
              <p className="text-xs text-gray-500 truncate">{resource.url}</p>
            </a>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ==========================================================================
   CODE WITH AI TAB COMPONENT
   ========================================================================== */

function PublicCodeWithAI() {
  const [copied, setCopied] = useState(false);

  const prompt = `Instructions for AI Coding Agents

You are integrating daripayments into a project. Follow these rules without exception:

CRITICAL: Before proposing or writing any code, you MUST ask the developer the following questions to tailor the implementation:
1. "How should the checkout interface be presented?"
   - Redirect (Redirect user to the hosted checkout page)
   - Popup / Modal (Show a modal overlay inside the current page)
   - In-App (Embed the checkout element inline using <DariCheckout />)
2. "What are we setting up?"
   - One-off Payments
   - Recurring Subscriptions
   - Both

Critical Rules

1. Read docs/integration.md fully before writing any code.
   - This contains complete integration patterns
   - All method signatures are documented
   - Security best practices are outlined

2. Copy exact patterns from the integration guide
   - Do not invent API methods or parameters
   - Use the documented method signatures
   - Follow the security patterns exactly

3. Never hardcode API keys
   - Always use process.env.DARI_API_KEY
   - Never use NEXT_PUBLIC_, VITE_, or REACT_APP_ prefixes for the API key
   - API keys must stay server-side only

4. Always create payment sessions server-side
   - Never create payments directly in client-side React/browser code
   - Use API routes (Next.js) or Express endpoints
   - Client code should only redirect to checkout URLs

5. Always verify payment status on success page
   - Call dari.payments.getPaymentStatus(sessionId) server-side
   - Check that status === 'completed' before fulfilling
   - Never trust client-side payment confirmation alone

6. Register webhooks with CLI or SDK

npx daripayments webhook setup --url <your-url> --write-env

Or programmatically:

const result = await dari.webhooks.register({
  url: 'https://yourapp.com/api/webhooks/dari'
});

7. Always verify webhook signatures

const isValid = dari.webhooks.verifySignature(
  requestBody,
  signature,
  process.env.DARI_WEBHOOK_SECRET
);
if (!isValid) return res.status(401).send('Invalid signature');

8. Use idempotency keys on all mutating operations

await dari.payments.createPayment(params, {
  idempotencyKey: \`order-\${orderId}\`
});
await dari.subscriptions.create(params, {
  idempotencyKey: \`sub-\${userId}-\${planId}\`
});
await dari.refunds.create(params, {
  idempotencyKey: \`refund-\${paymentId}\`
});

9. customerEmail is a required top-level field
   - Not inside metadata
   - Must be a valid email address
   - SDK validates email format automatically

await dari.payments.createPayment({
  amount: 99.99,
  currency: 'USD',
  customerEmail: 'user@example.com', // Required here
  metadata: { orderId: '123' }, // Not here
});

10. Check TypeScript types when unsure
    - The SDK is fully typed
    - Use IDE autocomplete
    - Do not guess method signatures

Common Patterns

SDK Initialization

// Import and initialize the SDK server-side
import { DariApi } from 'daripayments';

const dari = new DariApi(process.env.DARI_API_KEY);

Payment Flow

// 1. Server-side: Create payment
const payment = await dari.payments.createPayment(
  { amount, currency, customerEmail, ... },
  { idempotencyKey: \`order-\${orderId}\` }
);

// 2. Client-side: Redirect
window.location.href = payment.checkout_url;

// 3. Success page: Verify (server-side)
const status = await dari.payments.getPaymentStatus(sessionId);
if (status.status === 'completed') {
  await fulfillOrder(orderId);
}

// 4. Webhook: Handle async notification
if (event.type === 'payment.completed') {
  await fulfillOrder(event.data.metadata.orderId);
}

Subscription Flow

// 1. Create subscription plan
const plan = await dari.subscriptions.createPlan({
  name: 'Pro Plan',
  amount: 29.99,
  fiat_currency: 'USD',
  interval: 'month',
  trial_days: 14,
  accepted_chains: ['polygon', 'base'],
  accepted_tokens: ['USDC', 'USDT'],
});

// 2. Subscribe a customer
const sub = await dari.subscriptions.create(
  { plan_id: plan.id, customer_email: 'user@example.com' },
  { idempotencyKey: \`sub-\${userId}-\${plan.id}\` }
);

// 3. Redirect client to hosted checkout or mount embedded checkout UI
window.location.href = sub.checkout_url;

// 4. Handle webhook event on success
if (event.type === 'subscription.payment_succeeded') {
  await extendAccess(event.data.subscription_id);
}

React Integration Modes

// 1. Popup / Modal (default) - opens overlay modal in React
<PayWithDariButton mode="modal" ... />

// 2. Redirect - redirects to the checkout session page immediately
<PayWithDariButton mode="redirect" ... />

// 3. In-App / Embedded - embeds checkout UI directly using the checkout component
<DariCheckout sessionId={sessionId} onSuccess={onSuccess} onError={onError} />

Environment Setup

Always create .env file:

DARI_API_KEY=sk_live_xxx
DARI_WEBHOOK_SECRET=whsec_xxx
DARI_API_URL=https://api.daripay.xyz  # optional
DARI_CHECKOUT_HOST=https://pay.daripay.xyz  # optional

Add to .gitignore:

.env
.env.local
.env.*.local

Available Components
- PayWithDariButton - Button with modal/redirect/direct modes
- DariCheckout - Embedded checkout component
- MultiGatewayButton - Multi-gateway selector
- DariProvider - React context provider

Available Hooks
- usePayment() - Payment lifecycle management
- useSubscription() - Subscription management
- useRefund() - Refund operations
- useCheckoutUrl() - Headless checkout URL fetching

Webhook Events

All available events:

payment.completed
payment.failed
payment.expired
payment.refunded
subscription.created
subscription.payment_succeeded
subscription.payment_failed
subscription.cancelled
subscription.paused
subscription.resumed
subscription.trial_ending
invoice.created
invoice.paid
refund.created
refund.completed

Error Handling

Always wrap API calls in try-catch:

try {
  const payment = await dari.payments.createPayment(...);
} catch (error) {
  // Handle error appropriately
}

Testing

Use test mode API keys:

DARI_API_KEY=sk_test_xxx  # Test mode

When in Doubt
1. Check docs/integration.md
2. Check TypeScript types
3. Look at examples in the integration guide
4. Do not guess - ask for clarification

What NOT to Do
- Hardcode API keys in source code
- Create payments client-side
- Skip payment verification on success page
- Skip webhook signature verification
- Forget idempotency keys
- Put customerEmail in metadata
- Use NEXT_PUBLIC_ prefix for API key
- Guess method signatures

What TO Do
- Use environment variables
- Create payments server-side
- Verify payment status before fulfilling
- Verify webhook signatures
- Use idempotency keys
- Put customerEmail as top-level field
- Keep API key server-side only
- Check TypeScript types`;

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-indigo-600 animate-pulse" />
          <h2 className="text-2xl font-bold text-black">Code with AI Prompt</h2>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Copy this comprehensive prompt and paste it into your AI coding assistant (Cursor, Claude, Copilot, ChatGPT) to get a complete, robust Dari Payments integration.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-black text-sm">Full Instructions for AI</h3>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:opacity-90 transition-opacity rounded-lg text-xs font-semibold shadow-sm"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-300" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy Prompt
            </>
          )}
        </button>
      </div>

      <div className="relative group">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 max-h-[500px] overflow-y-auto">
          <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono font-medium text-gray-800">
            {prompt}
          </pre>
        </div>
      </div>

      {/* Usage steps */}
      <div>
        <h3 className="text-lg font-bold text-black mb-4">How to Use</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center mb-3">1</div>
            <h4 className="font-semibold text-black text-sm mb-1">Copy the Prompt</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Click the "Copy Prompt" button above to capture all SDK patterns.</p>
          </div>
          <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center mb-3">2</div>
            <h4 className="font-semibold text-black text-sm mb-1">Paste into AI Agent</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Open your favorite AI coding assistant and paste the copied prompt.</p>
          </div>
          <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center mb-3">3</div>
            <h4 className="font-semibold text-black text-sm mb-1">Answer Questions</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Let the AI ask you for your stack preferences and get production-ready code.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   SHARED DOCUMENTATION UTILS
   ========================================================================== */

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-gray-150 pb-8 last:border-0 last:pb-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1 text-black">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-md font-bold text-gray-900">{title}</h3>
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
    <div className="relative group overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-100">
          <span className="font-mono text-xs text-gray-600 font-semibold">{title}</span>
          <span className="text-xs text-gray-400 font-semibold font-mono">{language}</span>
        </div>
      )}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-xs leading-relaxed">
          <code className="text-gray-800 font-mono font-medium whitespace-pre">{code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2.5 right-2.5 p-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
          title="Copy code"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-gray-600" />
          )}
        </button>
      </div>
    </div>
  );
}
