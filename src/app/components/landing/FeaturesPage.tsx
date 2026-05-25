import { GenericPage } from './GenericPage';

export function FeaturesPage() {
  return (
    <GenericPage
      label="Features"
      title="Everything You Need to Accept Crypto Payments"
      subtitle="A complete payment infrastructure for stablecoins. Built for developers, designed for businesses."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
        {[
          {
            title: 'Instant Settlement',
            desc: 'Funds land in your wallet the moment a payment clears. No T+2 delays, no chargebacks.',
          },
          {
            title: 'Multi-chain Support',
            desc: 'Accept USDC and USDT across Ethereum, Solana, Polygon, BSC, and more.',
          },
          {
            title: 'Payment Links',
            desc: 'Generate shareable payment links in seconds. No code required.',
          },
          {
            title: 'Subscription Billing',
            desc: 'Recurring stablecoin payments with smart retry logic and webhooks.',
          },
          {
            title: 'Analytics Dashboard',
            desc: 'Real-time revenue tracking, transaction history, and chain-level insights.',
          },
          {
            title: 'Developer APIs',
            desc: 'REST APIs, webhooks, and SDKs to embed payments into any product.',
          },
          {
            title: 'Invoicing',
            desc: 'Create and send professional invoices with crypto payment options.',
          },
          {
            title: 'Team Management',
            desc: 'Role-based access control for your team members.',
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-lg transition-all"
          >
            <h3 className="text-sm font-semibold tracking-tight mb-2 text-black">
              {feature.title}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-20 not-prose">
        <h2 className="text-2xl font-bold tracking-tight mb-8 text-black">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'What stablecoins does Dari support?', a: 'Dari supports USDC, USDT, PYUSD, EURC, and AUDD across all supported blockchains.' },
            { q: 'Which blockchains can I accept payments on?', a: 'We support Ethereum, Solana, Polygon, BSC, Arbitrum, Base, Avalanche, and Stellar with more chains coming soon.' },
            { q: 'How fast is settlement?', a: 'Payments settle in approximately 2 seconds on average. Funds are available instantly in your connected wallet with no T+2 delays.' },
            { q: 'Do I need blockchain expertise to use Dari?', a: 'No. Dari handles all blockchain complexity behind the scenes. You integrate via simple REST APIs and manage everything through our intuitive dashboard.' },
          ].map((faq) => (
            <details key={faq.q} className="bg-white border border-gray-200 rounded-xl group">
              <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-sm font-semibold text-black hover:bg-gray-50 rounded-xl transition-colors">
                {faq.q}
                <span className="text-gray-400 group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <p className="px-6 pb-4 text-xs text-gray-500 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </GenericPage>
  );
}
