import { GenericPage } from './GenericPage';

export function FeaturesPage() {
  return (
    <GenericPage
      label="Features"
      title="Everything you need to accept crypto payments"
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
    </GenericPage>
  );
}
