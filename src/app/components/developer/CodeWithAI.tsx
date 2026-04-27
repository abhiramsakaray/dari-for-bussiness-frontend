import { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';
import { BentoLayout } from '../BentoLayout';

export function CodeWithAI() {
  return (
    <BentoLayout activePage="code-with-ai">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Code with AI</h1>
          </div>
          <p className="text-muted-foreground">
            Add Dari Payments to your product with a single AI prompt
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <AIPromptSection />
          <ExamplesSection />
          <TipsSection />
        </div>
      </div>
    </BentoLayout>
  );
}

function AIPromptSection() {
  const [copied, setCopied] = useState(false);

  const prompt = `Instructions for AI Coding Agents

You are integrating daripayments into a project. Follow these rules without exception:

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

// 1. Create plan
const plan = await dari.subscriptions.createPlan({
  name: 'Pro',
  amount: 29.99,
  fiat_currency: 'USD',
  interval: 'month',
  trial_days: 14,
  accepted_chains: ['polygon'],
  accepted_tokens: ['USDC'],
});

// 2. Subscribe customer
const sub = await dari.subscriptions.create(
  { plan_id: plan.id, customer_email: 'user@example.com' },
  { idempotencyKey: \`sub-\${userId}-\${plan.id}\` }
);

// 3. Redirect to checkout
window.location.href = sub.checkout_url;

// 4. Handle webhook
if (event.type === 'subscription.payment_succeeded') {
  await extendAccess(event.data.subscription_id);
}

React Component Modes

// Modal (default) - opens overlay
<PayWithDariButton mode="modal" ... />

// Redirect - redirects immediately
<PayWithDariButton mode="redirect" ... />

// Direct - plain <a> tag, no JS
<PayWithDariButton mode="direct" ... />

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
  console.error('Payment creation failed:', error);
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
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Complete AI Integration Prompt</h2>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Prompt
            </>
          )}
        </button>
      </div>

      <p className="text-muted-foreground">
        Copy this comprehensive prompt and paste it into your AI coding assistant to get complete, production-ready Dari Payments integration with all best practices built-in.
      </p>

      <div className="relative group">
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 max-h-[600px] overflow-y-auto">
          <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono font-bold text-gray-900">
            {prompt}
          </pre>
        </div>
      </div>
    </section>
  );
}

function ExamplesSection() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">How to Use</h2>
        <p className="text-muted-foreground">
          Simple steps to integrate Dari Payments with AI assistance
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-6 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
              1
            </div>
            <div>
              <h3 className="font-semibold mb-2">Copy the Prompt</h3>
              <p className="text-sm text-muted-foreground">
                Click the "Copy Prompt" button above to copy the integration prompt to your clipboard.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
              2
            </div>
            <div>
              <h3 className="font-semibold mb-2">Paste in Your AI Tool</h3>
              <p className="text-sm text-muted-foreground">
                Open your AI coding assistant (Cursor, GitHub Copilot, ChatGPT, Claude, etc.) and paste the prompt.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
              3
            </div>
            <div>
              <h3 className="font-semibold mb-2">Customize for Your Stack</h3>
              <p className="text-sm text-muted-foreground">
                Replace [Your framework] with your actual tech stack (e.g., "Next.js 14", "React + Express", "Vue.js").
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
              4
            </div>
            <div>
              <h3 className="font-semibold mb-2">Review and Implement</h3>
              <p className="text-sm text-muted-foreground">
                The AI will generate the integration code. Review it, make any necessary adjustments, and implement it in your project.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TipsSection() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Supported AI Tools</h2>
        <p className="text-muted-foreground">
          Works with all major AI coding assistants
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {['Cursor', 'GitHub Copilot', 'ChatGPT', 'Claude', 'Codeium', 'Tabnine', 'Replit AI', 'Amazon Q'].map((tool) => (
          <div key={tool} className="p-4 bg-muted/50 rounded-lg text-center text-sm font-medium border border-border hover:border-primary/50 transition-colors">
            {tool}
          </div>
        ))}
      </div>

      <div className="p-6 bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Pro Tip
        </h3>
        <p className="text-sm text-muted-foreground">
          Be specific about your tech stack and framework version for best results. The AI will generate code that matches your project structure and follows your framework's best practices.
        </p>
      </div>
    </section>
  );
}
