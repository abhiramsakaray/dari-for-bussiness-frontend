import { GenericPage } from './GenericPage';

export function WebhooksPage() {
  const events = [
    { name: 'payment.created', description: 'A new payment was created' },
    { name: 'payment.completed', description: 'Payment was successfully completed' },
    { name: 'payment.failed', description: 'Payment failed or was rejected' },
    { name: 'subscription.created', description: 'New subscription was created' },
    { name: 'subscription.renewed', description: 'Subscription was renewed' },
    { name: 'subscription.cancelled', description: 'Subscription was cancelled' },
  ];

  return (
    <GenericPage
      label="Webhooks"
      title="Webhooks"
      subtitle="Real-time notifications for payment events."
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">How Webhooks Work</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Webhooks allow you to receive real-time notifications when events happen in your Dari account.
            When an event occurs, we'll send a POST request to your configured endpoint with the event data.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">Available Events</h2>
          <div className="space-y-3 not-prose">
            {events.map((event) => (
              <div
                key={event.name}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all"
              >
                <div className="font-mono text-sm text-black mb-1">{event.name}</div>
                <div className="text-xs text-gray-500">{event.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">Example Handler</h2>
          <div className="bg-zinc-900 rounded-lg p-4 font-mono text-sm text-white overflow-x-auto">
            <pre>{`app.post('/webhook', (req, res) => {
  const { event, data } = req.body
  
  switch(event) {
    case 'payment.completed':
      fulfillOrder(data.metadata.order_id)
      break
    case 'payment.failed':
      notifyCustomer(data.customer_email)
      break
  }
  
  res.status(200).send('OK')
})`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">Webhook Security</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            All webhook requests include a signature in the <code className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">X-Dari-Signature</code> header.
            Verify this signature to ensure the request came from Dari.
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
            Get Started
          </a>
        </div>
      </div>
    </GenericPage>
  );
}
