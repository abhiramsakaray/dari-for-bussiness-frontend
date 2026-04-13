import { LandingLayout } from './LandingLayout';
import { Link } from 'react-router-dom';

export function NewLanding() {
  return (
    <LandingLayout>
      {/* Hero Section */}
      <section id="hero" className="pt-40 pb-20 relative overflow-hidden bg-white">
        <div className="max-w-[1160px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 border border-gray-300 rounded-full px-4 py-1.5 text-xs text-gray-500 font-mono mb-7 bg-white">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Now live · Ethereum, Solana & Polygon
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6 text-black">
                Accept Stablecoin Payments. Instantly.
              </h1>
              <p className="text-base text-gray-500 max-w-md leading-relaxed mb-10">
                Payment links, subscriptions, APIs — built for global businesses that move at the speed of money.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link
                  to="/register"
                  className="px-7 py-3.5 bg-black text-white rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity inline-block"
                >
                  Start for Free
                </Link>
                <Link
                  to="/developers"
                  className="px-7 py-3.5 bg-transparent border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:border-gray-400 hover:text-black transition-all inline-block"
                >
                  View Docs →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Ticker */}
      <div className="border-t border-b border-gray-200 py-5 overflow-hidden bg-white">
        <div className="flex items-center gap-0">
          <span className="font-mono text-xs text-gray-500 whitespace-nowrap tracking-widest uppercase px-6 flex-shrink-0 border-r border-gray-200">
            Supported
          </span>
          <div className="flex-1 overflow-hidden relative">
            <div className="flex gap-0 animate-scroll">
              {['USDT', 'USDC', 'ERC-20', 'SOL', 'POLYGON', 'BEP-20', 'TRON', 'ARBITRUM', 'BASE', 'OPTIMISM'].map((token, i) => (
                <span
                  key={i}
                  className="font-mono text-xs text-gray-500 border border-gray-200 px-4 py-1.5 rounded-md whitespace-nowrap tracking-wider mx-1.5 bg-white hover:border-gray-400 hover:text-black transition-all"
                >
                  {token}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section id="cta" className="py-24 bg-white">
        <div className="max-w-[1160px] mx-auto px-6">
          <div className="bg-black rounded-3xl p-20 relative overflow-hidden min-h-[360px] flex flex-col items-center justify-center text-center">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500"></div>
            </div>
            <div className="relative z-10">
              <p className="font-mono text-xs text-white tracking-widest uppercase mb-4">
                Get started
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-white">
                Start accepting payments<br />globally in minutes.
              </h2>
              <p className="text-base text-white mb-9">
                Free forever. No credit card. No blockchain expertise needed.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link
                  to="/register"
                  className="px-7 py-3.5 bg-white text-black rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity inline-block"
                >
                  Start for Free
                </Link>
                <Link
                  to="/developers"
                  className="px-7 py-3.5 bg-transparent border border-white/40 text-white rounded-xl text-sm font-medium hover:border-white transition-all inline-block"
                >
                  Read the docs →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-[1160px] mx-auto px-6">
          <div className="mb-14">
            <p className="font-mono text-xs text-gray-500 tracking-widest uppercase mb-4">
              Platform
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-black">
              Everything you need<br />to accept crypto.
            </h2>
            <p className="text-sm text-gray-500 max-w-lg">
              One unified platform for stablecoin payments — no blockchain expertise required.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {/* Instant Settlement - Wide */}
            <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl p-8 hover:border-gray-300 hover:shadow-lg transition-all">
              <div className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center mb-5 bg-white">
                <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div className="text-sm font-semibold tracking-tight mb-2 text-black">
                Instant Settlement
              </div>
              <div className="text-xs text-gray-500 leading-relaxed">
                Funds land in your wallet the moment a payment clears. No T+2 delays, no chargebacks, no intermediaries.
              </div>
              <div className="font-mono text-4xl font-light text-black mt-5 mb-0.5 tracking-tight">
                ~2s
              </div>
              <div className="text-xs text-gray-500 font-mono">
                // avg. settlement time
              </div>
            </div>

            {/* Analytics */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-gray-300 hover:shadow-lg transition-all">
              <div className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center mb-5 bg-white">
                <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div className="text-sm font-semibold tracking-tight mb-2 text-black">
                Analytics Dashboard
              </div>
              <div className="text-xs text-gray-500 leading-relaxed">
                Real-time revenue tracking, transaction history, and chain-level insights.
              </div>
              <div className="flex items-end gap-1 h-14 mt-5">
                {[28, 48, 38, 72, 52, 88, 62, 78, 44, 95].map((height, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t ${i % 3 === 0 ? 'bg-black' : i % 2 === 0 ? 'bg-gray-400' : 'bg-gray-200'}`}
                    style={{ height: `${height}%` }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Payment Links */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-gray-300 hover:shadow-lg transition-all">
              <div className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center mb-5 bg-white">
                <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <div className="text-sm font-semibold tracking-tight mb-2 text-black">
                Payment Links
              </div>
              <div className="text-xs text-gray-500 leading-relaxed">
                Generate a shareable payment link in seconds. No code, no wallet setup needed for your customers.
              </div>
            </div>

            {/* Subscriptions */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-gray-300 hover:shadow-lg transition-all">
              <div className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center mb-5 bg-white">
                <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
              </div>
              <div className="text-sm font-semibold tracking-tight mb-2 text-black">
                Subscription Billing
              </div>
              <div className="text-xs text-gray-500 leading-relaxed">
                Recurring stablecoin payments with smart retry logic, auto-routing, and webhook notifications.
              </div>
            </div>

            {/* Multi-chain - Wide */}
            <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl p-8 hover:border-gray-300 hover:shadow-lg transition-all">
              <div className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center mb-5 bg-white">
                <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div className="text-sm font-semibold tracking-tight mb-2 text-black">
                Multi-chain Payments
              </div>
              <div className="text-xs text-gray-500 leading-relaxed">
                Accept USDC and USDT across every major network. Dari automatically routes transactions through the lowest-fee chain.
              </div>
              <div className="flex gap-2 flex-wrap mt-5">
                {['Ethereum', 'Solana', 'Polygon', 'BSC', 'TRON', 'Arbitrum', 'Base'].map((chain) => (
                  <span
                    key={chain}
                    className="font-mono text-xs text-gray-500 border border-gray-200 px-3 py-1 rounded-full bg-white"
                  >
                    {chain}
                  </span>
                ))}
              </div>
            </div>

            {/* APIs */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-gray-300 hover:shadow-lg transition-all">
              <div className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center mb-5 bg-white">
                <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <div className="text-sm font-semibold tracking-tight mb-2 text-black">
                APIs & Webhooks
              </div>
              <div className="text-xs text-gray-500 leading-relaxed">
                REST APIs, real-time webhooks, and SDKs to embed payments into any product.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 bg-white">
        <div className="max-w-[1160px] mx-auto px-6">
          <div className="text-center max-w-lg mx-auto mb-16">
            <p className="font-mono text-xs text-gray-500 tracking-widest uppercase mb-4">
              Process
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-black">
              Three steps.<br />That's it.
            </h2>
            <p className="text-sm text-gray-500">
              From setup to settled — the simplest way to accept stablecoin payments.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                num: '01',
                title: 'Create a payment',
                desc: 'Generate a payment link or call the API. Set the amount, currency, expiry, and metadata.',
              },
              {
                num: '02',
                title: 'Customer pays',
                desc: 'Your customer pays from any wallet on any supported chain — no gas needed on their end.',
                tags: ['USDC', 'USDT'],
              },
              {
                num: '03',
                title: 'Funds settle instantly',
                desc: 'Payment confirms in ~2 seconds. No intermediaries, no delays. Funds are yours immediately.',
              },
            ].map((step) => (
              <div key={step.num} className="text-center px-7 relative z-10">
                <div className="w-14 h-14 rounded-full border border-gray-200 bg-white flex items-center justify-center font-mono text-xs text-gray-500 mx-auto mb-6 shadow-sm">
                  {step.num}
                </div>
                <div className="text-sm font-semibold mb-2.5 tracking-tight text-black">
                  {step.title}
                </div>
                <div className="text-xs text-gray-500 leading-relaxed">
                  {step.desc}
                </div>
                {step.tags && (
                  <div className="flex gap-1.5 justify-center mt-4">
                    {step.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-xs px-3 py-1 rounded bg-white text-gray-500 border border-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 22s linear infinite;
          width: max-content;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </LandingLayout>
  );
}
