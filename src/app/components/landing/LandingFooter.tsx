import { Link } from 'react-router-dom';

export function LandingFooter() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-[1160px] mx-auto px-6">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-14 border-b border-gray-200">
          <div>
            <Link to="/" className="font-mono text-sm text-gray-500 inline-block mb-4">
              dari.business
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm mb-5">
              Accept stablecoin payments globally. Built for businesses that move at the speed of money.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="font-mono text-xs text-gray-500 border border-gray-200 px-3 py-1 rounded-full flex items-center gap-2 bg-white">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Live on Ethereum
              </span>
              <span className="font-mono text-xs text-gray-500 border border-gray-200 px-3 py-1 rounded-full bg-white">
                Solana
              </span>
              <span className="font-mono text-xs text-gray-500 border border-gray-200 px-3 py-1 rounded-full bg-white">
                Polygon
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-black tracking-tight mb-2">
              Stay updated
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Get the latest updates on features, integrations, and platform news.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-black outline-none focus:border-gray-400 transition-colors"
              />
              <button className="px-5 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:opacity-80 transition-opacity whitespace-nowrap">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-2">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-gray-200">
          <div className="flex flex-col gap-3">
            <div className="text-xs font-semibold text-black tracking-wider uppercase font-mono mb-1">
              Product
            </div>
            <Link to="/features" className="text-sm text-gray-500 hover:text-black transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-sm text-gray-500 hover:text-black transition-colors">
              Pricing
            </Link>
            <Link to="/analytics" className="text-sm text-gray-500 hover:text-black transition-colors">
              Analytics
            </Link>
            <Link to="/payment-links" className="text-sm text-gray-500 hover:text-black transition-colors">
              Payment Links
            </Link>
            <Link to="/subscriptions" className="text-sm text-gray-500 hover:text-black transition-colors">
              Subscriptions
            </Link>
            <Link to="/invoicing" className="text-sm text-gray-500 hover:text-black transition-colors">
              Invoicing
            </Link>
            <Link to="/multi-chain" className="text-sm text-gray-500 hover:text-black transition-colors">
              Multi-chain Routing
            </Link>
            <Link to="/fraud-monitoring" className="text-sm text-gray-500 hover:text-black transition-colors">
              Fraud Monitoring
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-xs font-semibold text-black tracking-wider uppercase font-mono mb-1">
              Developers
            </div>
            <Link to="/developers" className="text-sm text-gray-500 hover:text-black transition-colors">
              Documentation
            </Link>
            <Link to="/api-reference" className="text-sm text-gray-500 hover:text-black transition-colors">
              API Reference
            </Link>
            <Link to="/sdks" className="text-sm text-gray-500 hover:text-black transition-colors">
              SDKs & Libraries
            </Link>
            <Link to="/webhooks" className="text-sm text-gray-500 hover:text-black transition-colors">
              Webhooks
            </Link>
            <Link to="/changelog" className="text-sm text-gray-500 hover:text-black transition-colors">
              Changelog
            </Link>
            <Link to="/status" className="text-sm text-gray-500 hover:text-black transition-colors">
              Status Page
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-xs font-semibold text-black tracking-wider uppercase font-mono mb-1">
              Company
            </div>
            <Link to="/about" className="text-sm text-gray-500 hover:text-black transition-colors">
              About
            </Link>
            <Link to="/blog" className="text-sm text-gray-500 hover:text-black transition-colors">
              Blog
            </Link>
            <Link to="/careers" className="text-sm text-gray-500 hover:text-black transition-colors flex items-center gap-2">
              Careers
              <span className="font-mono text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded text-[9px] tracking-wider">
                HIRING
              </span>
            </Link>
            <Link to="/partners" className="text-sm text-gray-500 hover:text-black transition-colors">
              Partners
            </Link>
            <Link to="/press" className="text-sm text-gray-500 hover:text-black transition-colors">
              Press Kit
            </Link>
            <Link to="/contact" className="text-sm text-gray-500 hover:text-black transition-colors">
              Contact
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-xs font-semibold text-black tracking-wider uppercase font-mono mb-1">
              Legal
            </div>
            <Link to="/privacy-policy" className="text-sm text-gray-500 hover:text-black transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-sm text-gray-500 hover:text-black transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookie-policy" className="text-sm text-gray-500 hover:text-black transition-colors">
              Cookie Policy
            </Link>
            <Link to="/aml-policy" className="text-sm text-gray-500 hover:text-black transition-colors">
              AML Policy
            </Link>
            <Link to="/compliance" className="text-sm text-gray-500 hover:text-black transition-colors">
              Compliance
            </Link>
            <Link to="/security" className="text-sm text-gray-500 hover:text-black transition-colors">
              Security
            </Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between py-6 gap-4">
          <p className="text-xs text-gray-400 font-mono">
            © 2024 Dari for Business. All rights reserved.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-gray-500 mr-1">Supported:</span>
            <span className="font-mono text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded bg-white text-[9px] tracking-wider">
              ETH
            </span>
            <span className="font-mono text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded bg-white text-[9px] tracking-wider">
              SOL
            </span>
            <span className="font-mono text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded bg-white text-[9px] tracking-wider">
              POLYGON
            </span>
            <span className="font-mono text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded bg-white text-[9px] tracking-wider">
              USDC
            </span>
            <span className="font-mono text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded bg-white text-[9px] tracking-wider">
              USDT
            </span>
          </div>
          <div className="flex gap-2">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 border border-gray-200 rounded-lg bg-white flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-black transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 border border-gray-200 rounded-lg bg-white flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-black transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
