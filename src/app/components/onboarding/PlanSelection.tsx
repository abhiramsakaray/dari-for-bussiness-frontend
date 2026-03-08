import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { Check, ArrowRight, Zap, TrendingUp, Building, Crown } from 'lucide-react';

interface PlanSelectionProps {
  onComplete: (plan: string) => void;
  onBack: () => void;
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    icon: Zap,
    description: 'Perfect for creators and freelancers',
    badge: null,
    features: [
      'Up to $1,000 transaction volume',
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
    price: '$29',
    period: '/month',
    icon: TrendingUp,
    description: 'For startups and small businesses',
    badge: 'Most Popular',
    features: [
      'Up to $50,000 transaction volume',
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
    price: '$99',
    period: '/month',
    icon: Building,
    description: 'For growing companies and SaaS platforms',
    badge: null,
    features: [
      'Up to $500,000 transaction volume',
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

  const handleContinue = () => {
    if (selectedPlan === 'enterprise') {
      toast.info('Our team will contact you to discuss enterprise pricing');
    }
    
    toast.success(`${PLANS.find(p => p.id === selectedPlan)?.name} plan selected!`);
    onComplete(selectedPlan);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Choose your plan</h1>
          <p className="text-muted-foreground text-lg">
            Start free and upgrade as you grow. No credit card required.
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
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
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
            Continue
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
