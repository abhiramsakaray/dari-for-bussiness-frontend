import { Link } from 'react-router-dom';
import { LandingLayout } from './LandingLayout';
import { useEffect } from 'react';

export function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page Not Found | Dari Payments';
    
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, nofollow');
    
    return () => {
      robotsMeta?.setAttribute('content', 'index, follow');
    };
  }, []);

  return (
    <LandingLayout>
      <div className="pt-40 pb-20 bg-white">
        <div className="max-w-[1160px] mx-auto px-6 text-center">
          <p className="font-mono text-xs text-gray-500 tracking-widest uppercase mb-4">404</p>
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-black">Page not found</h1>
          <p className="text-base text-gray-500 max-w-md mx-auto leading-relaxed mb-10">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              to="/"
              className="px-7 py-3.5 bg-black text-white rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity inline-block"
            >
              Back to Home
            </Link>
            <Link
              to="/features"
              className="px-7 py-3.5 bg-transparent border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:border-gray-400 hover:text-black transition-all inline-block"
            >
              View Features
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {[
              { to: '/pricing', label: 'Pricing' },
              { to: '/developers', label: 'Developers' },
              { to: '/about', label: 'About Us' },
              { to: '/contact', label: 'Contact' },
              { to: '/payment-links', label: 'Payment Links' },
              { to: '/subscriptions', label: 'Subscriptions' },
              { to: '/security', label: 'Security' },
              { to: '/status', label: 'Status' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-gray-500 hover:text-black transition-colors py-2"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
