import { GenericPage } from './GenericPage';

export function ApiReferencePage() {
  return (
    <GenericPage
      label="API Reference"
      title="API Documentation"
      subtitle="Complete reference for the Dari API endpoints."
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">Authentication</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            All API requests require authentication using your API key. Include your API key in the Authorization header:
          </p>
          <div className="bg-zinc-900 rounded-lg p-4 font-mono text-sm text-white overflow-x-auto">
            <code>Authorization: Bearer YOUR_API_KEY</code>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">Create Payment</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">POST /v1/payments</span>
          </p>
          <div className="bg-zinc-900 rounded-lg p-4 font-mono text-sm text-white overflow-x-auto mb-4">
            <pre>{`{
  "amount": 99.99,
  "currency": "USD",
  "customerEmail": "customer@example.com",
  "accepted_chains": ["polygon", "base", "bsc"],
  "accepted_tokens": ["USDC", "USDT"],
  "metadata": {
    "order_id": "order_123"
  }
}`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">List Payments</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">GET /v1/payments</span>
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Retrieve a list of all payments with optional filtering by status, date range, and currency.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">Get Payment</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">GET /v1/payments/:id</span>
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Retrieve details of a specific payment by ID.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">Webhooks</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">POST /v1/webhooks</span>
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Configure webhook endpoints to receive real-time notifications for payment events.
          </p>
        </div>

        <div className="mt-8 flex gap-3">
          <a
            href="/developer/guide"
            className="px-6 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
          >
            Full Documentation
          </a>
          <a
            href="/register"
            className="px-6 py-3 bg-transparent border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:border-gray-400 transition-all"
          >
            Get API Key
          </a>
        </div>
      </div>
    </GenericPage>
  );
}
