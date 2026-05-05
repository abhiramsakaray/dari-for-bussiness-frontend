import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BusinessDetails } from './BusinessDetails';
import { PlanSelection } from './PlanSelection';
import { WalletSetup } from './WalletSetup';
import { onboardingService } from '../../../services/onboarding.service';
import { Loader2 } from 'lucide-react';

type OnboardingStep = 'loading' | 'business_details' | 'plan_selection' | 'wallet_setup' | 'complete';

export function OnboardingFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>('loading');
  const [selectedPlan, setSelectedPlan] = useState<string>('free');

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      // First check if user is authenticated
      const token = localStorage.getItem('merchant_token');
      const apiKey = localStorage.getItem('api_key');
      
      if (!token || !apiKey) {
        navigate('/login');
        return;
      }

      // Check if returning from payment
      const urlParams = new URLSearchParams(window.location.search);
      const paymentSuccess = urlParams.get('payment_success');
      const paymentPending = localStorage.getItem('onboarding_payment_pending');
      
      if (paymentSuccess === 'true' && paymentPending === 'true') {
        // Payment completed, clear flag and complete onboarding
        localStorage.removeItem('onboarding_payment_pending');
        const plan = localStorage.getItem('onboarding_plan') || 'free';
        setSelectedPlan(plan);
        // Show plan selection to complete
        setStep('plan_selection');
        return;
      }

      const status = await onboardingService.getStatus();

      // Update localStorage with current status
      localStorage.setItem('onboarding_completed', String(status.onboarding_completed));
      localStorage.setItem('onboarding_step', String(status.step));

      if (status.onboarding_completed) {
        // Already completed, redirect to dashboard
        navigate('/dashboard');
        return;
      }

      // Determine which step to show based on backend step
      if (status.step === 1 || !status.business_name) {
        setStep('business_details');
      } else if (status.step === 2 || !status.has_wallets) {
        setStep('wallet_setup');
      } else if (status.step === 3) {
        setStep('plan_selection');
      } else {
        setStep('business_details');
      }
    } catch (error) {
      
      // If error is auth-related, redirect to login
      const err = error as any;
      if (err?.response?.status === 401) {
        navigate('/login');
        return;
      }
      
      // Default to business details if there's an error
      setStep('business_details');
    }
  };

  const handleBusinessDetailsComplete = () => {
    setStep('wallet_setup');
  };

  const handleWalletSetupComplete = () => {
    setStep('plan_selection');
  };

  const handlePlanSelectionComplete = (plan: string) => {
    setSelectedPlan(plan);
    // Clear temporary storage
    localStorage.removeItem('onboarding_plan');
    localStorage.removeItem('onboarding_payment_pending');
    
    // Update localStorage to mark onboarding as completed
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('onboarding_step', '4');
    
    setStep('complete');
    
    // Redirect to dashboard
    setTimeout(() => {
      navigate('/dashboard');
    }, 500);
  };

  const handlePlanSelectionBack = () => {
    setStep('wallet_setup');
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (step === 'business_details') {
    return <BusinessDetails onComplete={handleBusinessDetailsComplete} />;
  }

  if (step === 'wallet_setup') {
    return <WalletSetup onComplete={handleWalletSetupComplete} />;
  }

  if (step === 'plan_selection') {
    return (
      <PlanSelection
        onComplete={handlePlanSelectionComplete}
        onBack={handlePlanSelectionBack}
      />
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">🎉 You're all set!</h1>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return null;
}
