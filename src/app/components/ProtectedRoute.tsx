import { useEffect, useState } from 'react';
import { onboardingService } from '../../services/onboarding.service';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresOnboarding?: boolean; // If true, redirect to onboarding if not completed
}

export function ProtectedRoute({ children, requiresOnboarding = true }: ProtectedRouteProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('merchant_token');
    const apiKey = localStorage.getItem('api_key');

    if (!token || !apiKey) {
      // Not logged in, redirect to login
      console.warn('No auth tokens found, redirecting to login');
      window.location.href = '/login';
      return;
    }

    if (requiresOnboarding) {
      try {
        // Check onboarding status from backend
        const status = await onboardingService.getStatus();
        
        // Update localStorage with fresh data
        localStorage.setItem('onboarding_completed', String(status.onboarding_completed));
        localStorage.setItem('onboarding_step', String(status.step));
        
        if (!status.onboarding_completed) {
          // Onboarding not completed, redirect to onboarding
          console.warn('Onboarding not completed, redirecting to onboarding flow');
          window.location.href = '/onboarding';
          return;
        }

        // All checks passed
        setIsAuthorized(true);
        setIsChecking(false);
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        
        // Fallback to localStorage check
        const localOnboardingCompleted = localStorage.getItem('onboarding_completed');
        
        if (localOnboardingCompleted === 'false') {
          window.location.href = '/onboarding';
          return;
        }
        
        // Allow access if check fails but localStorage says completed
        setIsAuthorized(true);
        setIsChecking(false);
      }
    } else {
      // No onboarding check required, just verify auth
      setIsAuthorized(true);
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
