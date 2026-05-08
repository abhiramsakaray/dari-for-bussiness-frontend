import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AutoRedirectProps {
  children: React.ReactNode;
}

/**
 * Component that checks if user is already logged in
 * and redirects to dashboard if they are
 */
export function AutoRedirect({ children }: AutoRedirectProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('merchant_token');
    const apiKey = localStorage.getItem('api_key');

    // If user is already logged in, redirect to dashboard
    if (token && apiKey) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  return <>{children}</>;
}
