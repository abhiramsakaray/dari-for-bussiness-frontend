import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  const productLinks = [
    { to: '/payment-links', label: 'Payment Links', desc: 'Accept crypto in one click' },
    { to: '/subscriptions', label: 'Subscriptions', desc: 'Recurring stablecoin billing' },
    { to: '/invoicing', label: 'Invoicing', desc: 'Professional blockchain invoices' },
    { to: '/multi-chain', label: 'Multi-chain', desc: 'One integration, all networks' },
    { to: '/analytics', label: 'Analytics', desc: 'Real-time payment intelligence' },
    { to: '/fraud-monitoring', label: 'Fraud Detection', desc: 'Blockchain-powered security' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-lg" aria-label="Main navigation">
      <div className="max-w-[1160px] mx-auto px-6 h-[60px] flex items-center justify-between">
        <Link to="/" className="flex items-center" aria-label="Dari Payments Home">
          <img src="/daripayments_green_logo.png" alt="Dari Payments - Stablecoin Payment Infrastructure" className="h-8" />
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {/* Products Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setProductsOpen(true)}
            onMouseLeave={() => setProductsOpen(false)}
          >
            <button 
              className="text-sm text-gray-500 hover:text-black transition-colors flex items-center gap-1"
              aria-expanded={productsOpen}
              aria-haspopup="true"
            >
              Products
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${productsOpen ? 'rotate-180' : ''}`} />
            </button>
            {productsOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[420px]">
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 grid grid-cols-2 gap-1">
                  {productLinks.map((link) => (
                    <Link 
                      key={link.to}
                      to={link.to} 
                      className="flex flex-col px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                      onClick={() => setProductsOpen(false)}
                    >
                      <span className="text-sm font-medium text-gray-800 group-hover:text-black">{link.label}</span>
                      <span className="text-xs text-gray-400">{link.desc}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link to="/features" className="text-sm text-gray-500 hover:text-black transition-colors">
            Features
          </Link>
          <Link to="/pricing" className="text-sm text-gray-500 hover:text-black transition-colors">
            Pricing
          </Link>
          <Link to="/developers" className="text-sm text-gray-500 hover:text-black transition-colors">
            Developers
          </Link>
          <Link 
            to="/login" 
            className="text-sm text-gray-500 hover:text-black transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-black bg-transparent hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            Get started →
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-3">
          <Link
            to="/register"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-black bg-transparent hover:border-gray-400 transition-all"
          >
            Sign up
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-black transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="max-w-[1160px] mx-auto px-6 py-4 flex flex-col gap-1">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-mono px-2 pt-2 pb-1">Products</p>
            {productLinks.map((link) => (
              <Link 
                key={link.to}
                to={link.to} 
                className="text-sm text-gray-600 hover:text-black transition-colors py-2 px-2 rounded-lg hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-gray-100" />
            <Link 
              to="/features" 
              className="text-sm text-gray-600 hover:text-black transition-colors py-2 px-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className="text-sm text-gray-600 hover:text-black transition-colors py-2 px-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              to="/developers" 
              className="text-sm text-gray-600 hover:text-black transition-colors py-2 px-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Developers
            </Link>
            <Link 
              to="/login" 
              className="text-sm text-gray-600 hover:text-black transition-colors py-2 px-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
