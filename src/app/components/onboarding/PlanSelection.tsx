import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useMerchantCurrency } from '@/hooks/useMerchantCurrency';
import { onboardingService } from '@/services/onboarding.service';
import { toast } from 'sonner';
import { Check, ArrowRight, Zap, TrendingUp, Building, Crown, Loader2 } from 'lucide-react';

interface PlanSelectionProps {
  onComplete: (plan: string) => void;
  onBack: () => void;
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    period: '/month',
    icon: Zap,
    description: 'Perfect for creators and freelancers',
    badge: null,
    features: [
      'Up to 1,000 transaction volume',
      '2 payment links',
      '5 invoices per month',
      '1 team member',
      'Basic analytics',
      '1% - 1.5% transaction fee',
    ],
    limitations: [
      'No recurring payments',
      'No subscriptions',
      'Limited API access',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '29',
    period: '/month',
    icon: TrendingUp,
    description: 'For startups and small businesses',
    badge: 'Most Popular',
    features: [
      'Up to 50,000 transaction volume',
      'Unlimited payment links',
      'Unlimited invoices',
      '3 team members',
      'Recurring payments & subscriptions',
      'Full API access & webhooks',
      'Custom checkout branding',
      '0.8% - 1% transaction fee',
    ],
    limitations: [],
  },
  {
    id: 'business',
    name: 'Business',
    price: '99',
    period: '/month',
    icon: Building,
    description: 'For growing companies and SaaS platforms',
    badge: null,
    features: [
      'Up to 500,000 transaction volume',
      'Everything in Growth',
      '10 team members',
      'Multi-chain payments',
      'Advanced analytics dashboard',
      'Fraud monitoring',
      'Smart payment retries',
      'Automated reconciliation',
      '0.5% - 0.8% transaction fee',
    ],
    limitations: [],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    icon: Crown,
    description: 'For banks, exchanges, and large enterprises',
    badge: 'Contact Sales',
    features: [
      'Unlimited transaction volume',
      'Everything in Business',
      'Unlimited team members',
      'Dedicated blockchain nodes',
      'White-label payment gateway',
      'SLA guarantees',
      'Dedicated account manager',
      'Priority support',
      '0.2% - 0.5% transaction fee',
    ],
    limitations: [],
  },
];

export function PlanSelection({ onComplete, onBack }: PlanSelectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('free');
  const [isCompleting, setIsCompleting] = useState(false);
  const [onboardingPlans, setOnboardingPlans] = useState<any>(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const { currencySymbol } = useMerchantCurrency();

  // Fetch onboarding plans
  React.useEffect(() => {
    const fetchPlans = async () => {
      try {
        const country = localStorage.getItem('merchant_country') || 'US';
        console.log('Fetching plans for country:', country);
        const plansData = await onboardingService.getPlans(country);
        console.log('Plans data received:', plansData);
        setOnboardingPlans(plansData);
      } catch (error) {
        console.error('Failed to fetch plans:', error);
        toast.error('Failed to load plans');
      } finally {
        setIsLoadingPlans(false);
      }
    };
    
    fetchPlans();
  }, []);

  // Check if returning from payment
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');
    const paymentPending = localStorage.getItem('onboarding_payment_pending');
    const savedPlan = localStorage.getItem('onboarding_plan');
    
    if (paymentSuccess === 'true' && paymentPending === 'true' && savedPlan) {
      // Auto-complete onboarding after successful payment
      setSelectedPlan(savedPlan);
      completeOnboardingAfterPayment(savedPlan);
    }
  }, []);

  const completeOnboardingAfterPayment = async (plan: string) => {
    try {
      setIsCompleting(true);
      
      // Get wallet setup data from localStorage
      const walletData = localStorage.getItem('onboarding_wallet_data');
      
      if (!walletData) {
        toast.error('Wallet setup data not found. Please contact support.');
        return;
      }
      
      const { chains, tokens, auto_generate } = JSON.parse(walletData);
      
      // Complete onboarding with paid plan
      await onboardingService.completeOnboarding({
        plan,
        chains,
        tokens,
        auto_generate
      });
      
      // Clear temporary data
      localStorage.removeItem('onboarding_payment_pending');
      localStorage.removeItem('onboarding_plan');
      localStorage.removeItem('onboarding_wallet_data');
      
      toast.success(`Payment successful! ${PLANS.find(p => p.id === plan)?.name} plan activated!`);
      
      setTimeout(() => {
        onComplete(plan);
      }, 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to complete onboarding');
      setIsCompleting(false);
    }
  };

  // Get plan price from API response (in merchant's local currency)
  const getPlanPrice = (planId: string): { amount: string; currency: string } => {
    // Try to get price from API response first
    const apiPlan = onboardingPlans?.plans?.find((p: any) => p.id === planId);
    if (apiPlan) {
      return {
        amount: apiPlan.monthly_price === 0 ? '0' : apiPlan.monthly_price.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }),
        currency: apiPlan.currency || 'USD'
      };
    }
    
    // Fallback to USD prices if API data not available
    const usdPrices: Record<string, number> = {
      free: 0,
      growth: 29,
      business: 99,
      enterprise: 0,
    };
    
    const price = usdPrices[planId] || 0;
    
    return {
      amount: price === 0 ? '0' : price.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
      currency: 'USD'
    };
  };

  // Get currency symbol from API or use merchant's currency
  const getPlanCurrencySymbol = (planId: string): string => {
    const apiPlan = onboardingPlans?.plans?.find((p: any) => p.id === planId);
    if (apiPlan?.currency_symbol) {
      return apiPlan.currency_symbol;
    }
    return onboardingPlans?.currency_symbol || '$';
  };

  // Format volume limits with currency (only for transaction volume)
  const formatVolumeLimit = (limit: string): string => {
    // Only add currency symbol to transaction volume features
    if (limit.toLowerCase().includes('transaction volume')) {
      const match = limit.match(/(\d[\d,]*)/);
      if (match) {
        return limit.replace(match[0], `${currencySymbol}${match[0]}`);
      }
    }
    return limit;
  };

  const handleContinue = async () => {
    if (selectedPlan === 'enterprise') {
      toast.info('Our team will contact you to discuss enterprise pricing');
      return;
    }
    
    // For paid plans (Growth/Business), redirect to payment first
    if (selectedPlan === 'growth' || selectedPlan === 'business') {
      // Get payment link from onboarding plans
      console.log('Looking for payment link for plan:', selectedPlan);
      console.log('Available plans:', onboardingPlans?.plans);
      
      const plan = onboardingPlans?.plans?.find((p: any) => p.id === selectedPlan);
      console.log('Found plan:', plan);
      
      const paymentLink = plan?.payment_link;
      console.log('Payment link:', paymentLink);
      
      if (paymentLink) {
        // Store the selected plan and onboarding state
        localStorage.setItem('onboarding_plan', selectedPlan);
        localStorage.setItem('onboarding_payment_pending', 'true');
        
        // Redirect to payment with success URL back to onboarding
        const successUrl = `${window.location.origin}/#/onboarding?payment_success=true`;
        console.log('Redirecting to:', `${paymentLink}?success_url=${encodeURIComponent(successUrl)}`);
        window.location.href = `${paymentLink}?success_url=${encodeURIComponent(successUrl)}`;
        return;
      } else {
        console.error('Payment link not found!');
        console.error('Plan object:', plan);
        console.error('All plans:', onboardingPlans);
        toast.error('Payment link not configured. Please contact support.');
        return;
      }
    }
    
    // For free plan, complete onboarding directly
    try {
      setIsCompleting(true);
      
      // Get wallet setup data from localStorage
      const walletData = localStorage.getItem('onboarding_wallet_data');
      
      if (!walletData) {
        toast.error('Wallet setup data not found. Please go back and complete wallet setup.');
        setIsCompleting(false);
        return;
      }
      
      const { chains, tokens, auto_generate } = JSON.parse(walletData);
      
      // Complete onboarding with selected plan
      await onboardingService.completeOnboarding({
        plan: selectedPlan,
        chains,
        tokens,
        auto_generate
      });
      
      // Clear temporary data
      localStorage.removeItem('onboarding_wallet_data');
      
      toast.success(`${PLANS.find(p => p.id === selectedPlan)?.name} plan activated!`);
      onComplete(selectedPlan);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to complete onboarding');
      setIsCompleting(false);
    }
  };

  // Show loading state while fetching billing info or completing onboarding
  if (isLoadingPlans || isCompleting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            {isCompleting ? 'Completing your onboarding...' : 'Loading plans...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Choose your plan</h1>
          <p className="text-muted-foreground text-lg">
            {selectedPlan === 'growth' || selectedPlan === 'business' 
              ? 'Complete payment to activate your plan and continue setup'
              : 'Start free and upgrade as you grow. No credit card required.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            const isPopular = plan.badge === 'Most Popular';

            return (
              <Card
                key={plan.id}
                className={`relative cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary shadow-lg scale-105'
                    : 'border-border hover:border-primary/50'
                } ${isPopular ? 'border-2 border-primary' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="px-3 py-1">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      {plan.id === 'enterprise' ? 'Custom' : `${getPlanCurrencySymbol(plan.id)}${getPlanPrice(plan.id).amount}`}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{formatVolumeLimit(feature)}</span>
                      </div>
                    ))}
                  </div>

                  {isSelected && (
                    <div className="pt-4">
                      <Badge variant="outline" className="w-full justify-center py-2">
                        Selected
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center gap-4">
          <Button variant="outline" size="lg" onClick={onBack}>
            Back
          </Button>
          <Button size="lg" onClick={handleContinue}>
            {selectedPlan === 'growth' || selectedPlan === 'business' 
              ? 'Proceed to Payment' 
              : selectedPlan === 'enterprise'
              ? 'Contact Sales'
              : 'Continue'}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>You can upgrade or downgrade at any time. No hidden fees.</p>
        </div>
      </div>
    </div>
  );
}
