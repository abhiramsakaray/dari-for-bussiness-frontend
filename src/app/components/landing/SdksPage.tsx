import { GenericPage } from './GenericPage';

export function SdksPage() {
  const sdks = [
    {
      name: 'Node.js',
      install: 'npm install daripayments',
      language: 'JavaScript/TypeScript',
    },
    {
      name: 'React',
      install: 'npm install daripayments',
      language: 'React Components',
    },
  ];

  return (
    <GenericPage
      label="SDKs"
      title="SDKs & Libraries"
      subtitle="Official libraries for your favorite languages and frameworks."
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">Official SDKs</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            We provide official SDKs for popular languages and frameworks. All SDKs are open source and actively maintained.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
            {sdks.map((sdk) => (
              <div
                key={sdk.name}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-lg transition-all"
              >
                <h3 className="text-lg font-semibold mb-2 text-black">{sdk.name}</h3>
                <p className="text-xs text-gray-500 mb-4">{sdk.language}</p>
                <div className="bg-zinc-900 rounded-lg p-3 font-mono text-sm text-white overflow-x-auto">
                  <code>{sdk.install}</code>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">Quick Start</h2>
          <div className="bg-zinc-900 rounded-lg p-4 font-mono text-sm text-white overflow-x-auto">
            <pre>{`import { DariApi } from 'daripayments'

const dari = new DariApi(process.env.DARI_API_KEY)

const payment = await dari.payments.createPayment({
  amount: 100,
  currency: 'USD',
  customerEmail: 'customer@example.com',
  accepted_chains: ['polygon', 'base'],
  accepted_tokens: ['USDC', 'USDT']
})

console.log(payment.checkout_url)`}</pre>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <a
            href="/developer/guide"
            className="px-6 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
          >
            View Documentation
          </a>
          <a
            href="https://github.com/Dari-Organization/daripayments-sdk"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-transparent border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:border-gray-400 transition-all"
          >
            GitHub →
          </a>
        </div>
      </div>
    </GenericPage>
  );
}
