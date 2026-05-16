import { LandingLayout } from './LandingLayout';
import { Link } from 'react-router-dom';
import { SEO, organizationSchema, websiteSchema } from '../../../components/SEO';

const supportedBlockchains = [
  { name: 'Ethereum', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=032' },
  { name: 'Base', icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png' },
  { name: 'Solana', icon: 'https://cryptologos.cc/logos/solana-sol-logo.svg?v=032' },
  { name: 'Polygon', icon: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=032' },
  { name: 'BNB Chain', icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=032' },
  { name: 'Arbitrum', icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=032' },
  { name: 'Avalanche', icon: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg?v=032' },
  { name: 'Stellar', icon: 'https://cryptologos.cc/logos/stellar-xlm-logo.svg?v=032' },
];

const supportedStablecoins = [
  { name: 'USDC', icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png' },
  { name: 'USDT', icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png' },
  { name: 'PYUSD', icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6c3ea9036406852006290770BEdFcAbA0e23A0e8/logo.png' },
  { name: 'EURC', icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c/logo.png' },
  { name: 'AUDD', icon: 'https://pbs.twimg.com/profile_images/1970637798224138240/ZtQsnSTb_400x400.jpg' },
];

const supportedWallets = [
  { name: 'MetaMask', domain: 'metamask.io' },
  { name: 'Trust Wallet', domain: 'trustwallet.com' },
  { name: 'Coinbase Wallet', domain: 'coinbase.com' },
  { name: 'Phantom', domain: 'phantom.app' },
  { name: 'Rabby', domain: 'rabby.io' },
  { name: 'Exodus', domain: 'exodus.com' },
  { name: 'Rainbow', domain: 'rainbow.me' },
  { name: 'Backpack', domain: 'backpack.app' },
  { name: 'Ledger', domain: 'ledger.com' },
  { name: 'Trezor', domain: 'trezor.io' },
  { name: 'OKX Wallet', domain: 'okx.com' },
  { name: 'SafePal', domain: 'safepal.com' },
  { name: 'Bitget Wallet', domain: 'web3.bitget.com' },
  { name: 'TokenPocket', domain: 'tokenpocket.pro' },
  { name: 'MathWallet', domain: 'mathwallet.org', customIcon: 'https://avatars.githubusercontent.com/u/38073584?v=4' },
  { name: 'Atomic Wallet', domain: 'atomicwallet.io' },
  { name: 'LOBSTR', domain: 'lobstr.co' },
];

export function NewLanding() {
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema,
      websiteSchema,
      {
        '@type': 'WebPage',
        '@id': 'https://daripay.xyz/#webpage',
        url: 'https://daripay.xyz/',
        name: 'Dari Payments — Stablecoin Payment Infrastructure',
        description: 'Accept crypto payments with Dari. Multi-chain payment gateway for stablecoins (USDC, USDT). Payment links, invoicing, subscriptions, and more.',
        inLanguage: 'en-US',
      },
    ],
  };

  return (
    <>
      <SEO
        title="Dari Payments — Stablecoin Payment Infrastructure"
        description="Accept crypto payments with Dari. Multi-chain payment gateway for stablecoins (USDC, USDT). Payment links, invoicing, subscriptions, and more. Start accepting crypto in minutes."
        keywords="crypto payments, stablecoin payments, USDC payments, USDT payments, crypto payment gateway, blockchain payments, web3 payments, crypto invoicing, crypto subscriptions, payment links, multi-chain payments, polygon payments, ethereum payments, stellar payments, solana payments"
        url="https://daripay.xyz"
        structuredData={combinedSchema}
      />
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

      {/* Integrations Grid */}
      <div className="py-24 bg-white border-t border-b border-gray-200">
        <div className="max-w-[1160px] mx-auto px-6 text-center">
          <p className="font-mono text-xs text-gray-500 tracking-widest uppercase mb-6">Compatible Ecosystem</p>
          <h3 className="text-3xl lg:text-4xl font-bold tracking-tight text-black mb-32">Works with your favorite wallets & chains</h3>
          
          {/* Stablecoins Grid */}
          <div className="mb-20">
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-16">Supported Stablecoins</h4>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-12">
              {supportedStablecoins.map((coin, i) => (
                <div key={i} className="flex flex-col items-center gap-5 transition-all cursor-default grayscale hover:grayscale-0 hover:scale-105 duration-300 w-24">
                  <img src={coin.icon} alt={coin.name} className={`w-16 h-16 object-contain ${coin.name === 'AUDD' ? 'rounded-full' : ''}`} />
                  <span className="text-sm font-medium text-gray-600 text-center">{coin.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Blockchains Grid */}
          <div className="mb-20">
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-16">Supported Chains</h4>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-12">
              {supportedBlockchains.map((chain, i) => (
                <div key={i} className="flex flex-col items-center gap-5 transition-all cursor-default grayscale hover:grayscale-0 hover:scale-105 duration-300 w-24">
                  <img src={chain.icon} alt={chain.name} className="w-16 h-16 object-contain" />
                  <span className="text-sm font-medium text-gray-600 text-center">{chain.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Wallets Marquee */}
          <div className="relative">
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-16">Supported Wallets</h4>
            <div className="relative flex overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
              <div className="flex w-max animate-scroll-left hover:pause pb-4 pt-2">
                {[...supportedWallets, ...supportedWallets, ...supportedWallets].map((wallet, i) => (
                  <div key={i} className="flex flex-col items-center gap-5 mx-6 transition-all cursor-default grayscale hover:grayscale-0 hover:scale-105 duration-300 w-24">
                    <img src={wallet.customIcon || `https://icon.horse/icon/${wallet.domain}`} alt={wallet.name} className="w-16 h-16 object-contain" />
                    <span className="text-sm font-medium text-gray-600 text-center leading-tight">{wallet.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section id="cta" className="py-24 bg-white">
        <div className="max-w-[1160px] mx-auto px-6">
          <div 
            className="bg-black rounded-3xl p-20 relative overflow-hidden min-h-[360px] flex flex-col items-center justify-center text-center"
            style={{
              backgroundImage: 'url(/grad1.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/20"></div>
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
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
        .animate-scroll-left {
          animation: scroll-left 45s linear infinite;
        }
        .hover\\:pause:hover {
          animation-play-state: paused;
        }
      `}</style>
    </LandingLayout>
    </>
  );
}
