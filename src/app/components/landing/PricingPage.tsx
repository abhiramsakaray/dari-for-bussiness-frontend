import { LandingLayout } from './LandingLayout';
import { PageHeader } from './PageHeader';

export function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: 'Free',
      period: 'forever',
      fee: '1% – 1.5% per tx',
      features: [
        'Up to $120/mo volume',
        '5 payment links',
        '5 invoices / month',
        '1 team member',
        '0 subscription plans',
        '0 active subscriptions',
        'Basic dashboard',
        'Dari-branded checkout',
        'Email support',
      ],
      cta: 'Get started',
      variant: 'outline' as const,
    },
    {
      name: 'Growth',
      price: '$29',
      period: 'per month',
      fee: '0.8% – 1% per tx',
      features: [
        'Up to $600/mo volume',
        '15 payment links',
        '15 invoices / month',
        '3 team members',
        '3 subscription plans',
        '100 active subscriptions',
        'Recurring & subscriptions',
        'Full API + Webhooks',
        'Custom checkout branding',
        'CSV exports',
        'Priority support',
      ],
      cta: 'Get started',
      variant: 'dark' as const,
      featured: true,
    },
    {
      name: 'Business',
      price: '$99',
      period: 'per month',
      fee: '0.5% – 0.8% per tx',
      features: [
        'Up to $6,000/mo volume',
        '100 payment links',
        '100 invoices / month',
        '25 team members',
        '10 subscription plans',
        'Unlimited active subscriptions',
        'Multi-chain payments',
        'Auto fee routing',
        'Advanced analytics',
        'Fraud monitoring',
        'Smart payment retries',
        'Automated reconciliation',
      ],
      cta: 'Get started',
      variant: 'outline' as const,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      fee: 'Custom pricing',
      features: [
        'Unlimited volume',
        'Unlimited payment links',
        'Unlimited invoices',
        'Unlimited team members',
        'Unlimited subscription plans',
        'Unlimited active subscriptions',
        'White-label solution',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantees',
        'Priority support',
        'On-premise deployment',
      ],
      cta: 'Contact sales',
      variant: 'outline' as const,
    },
  ];

  return (
    <LandingLayout>
      <PageHeader
        label="Pricing"
        title="Start free. Scale as you grow."
        subtitle="Transparent, tiered pricing. No hidden fees. Cancel anytime."
      />

      <section className="py-20 bg-white">
        <div className="max-w-[1160px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white border ${
                  plan.featured ? 'border-2 border-black' : 'border-gray-200'
                } rounded-2xl p-6 flex flex-col relative hover:border-gray-300 hover:shadow-lg transition-all`}
              >
                {plan.featured && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 font-mono text-[9px] text-white bg-black px-3 py-1 rounded-b-lg tracking-widest">
                    MOST POPULAR
                  </div>
                )}
                <div className="text-xs font-mono text-gray-500 tracking-widest uppercase mb-3">
                  {plan.name}
                </div>
                <div className="text-4xl font-bold tracking-tight mb-0.5 text-black">
                  {plan.price}
                </div>
                <div className="text-xs text-gray-500 font-mono mb-4">
                  {plan.period}
                </div>
                <div className="font-mono text-xs text-gray-500 border border-gray-200 px-3 py-1 rounded inline-block mb-5">
                  {plan.fee}
                </div>
                <hr className="border-gray-200 mb-5" />
                <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="text-xs text-gray-600 flex gap-2 items-start leading-relaxed"
                    >
                      <span className="text-gray-300 font-mono flex-shrink-0 text-xs mt-0.5">
                        —
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.name === 'Enterprise' ? '#/contact' : '#/register'}
                  className={`w-full py-3 rounded-lg text-sm font-medium text-center transition-all ${
                    plan.variant === 'dark'
                      ? 'bg-black text-white hover:opacity-80'
                      : 'bg-transparent border border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
