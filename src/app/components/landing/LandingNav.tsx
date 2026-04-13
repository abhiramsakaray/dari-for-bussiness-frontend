import { Link } from 'react-router-dom';

export function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-lg">
      <div className="max-w-[1160px] mx-auto px-6 h-[60px] flex items-center justify-between">
        <Link to="/" className="font-mono text-base font-medium tracking-tight text-black">
          dari<span className="text-gray-500">.business</span>
        </Link>
        <div className="flex items-center gap-8">
          <Link to="/features" className="text-sm text-gray-500 hover:text-black transition-colors hidden md:inline">
            Features
          </Link>
          <Link to="/pricing" className="text-sm text-gray-500 hover:text-black transition-colors hidden md:inline">
            Pricing
          </Link>
          <Link to="/developers" className="text-sm text-gray-500 hover:text-black transition-colors hidden md:inline">
            Developers
          </Link>
          <Link 
            to="/login" 
            className="text-sm text-gray-500 hover:text-black transition-colors hidden md:inline"
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
      </div>
    </nav>
  );
}
