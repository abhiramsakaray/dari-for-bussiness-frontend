import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-lg">
      <div className="max-w-[1160px] mx-auto px-6 h-[60px] flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/daripayments_green_logo.png" alt="Dari Payments" className="h-8" />
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
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
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="max-w-[1160px] mx-auto px-6 py-4 flex flex-col gap-4">
            <Link 
              to="/features" 
              className="text-sm text-gray-600 hover:text-black transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className="text-sm text-gray-600 hover:text-black transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              to="/developers" 
              className="text-sm text-gray-600 hover:text-black transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Developers
            </Link>
            <Link 
              to="/login" 
              className="text-sm text-gray-600 hover:text-black transition-colors py-2"
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
