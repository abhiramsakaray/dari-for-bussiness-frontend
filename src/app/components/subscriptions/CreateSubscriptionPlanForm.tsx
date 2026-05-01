import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { subscriptionsService } from '../../../services/subscriptions.service';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BentoLayout } from "../BentoLayout";
import { ArrowLeft, Plus, Trash2, Info, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';
import { SubscriptionInterval, TrialType } from '../../../types/api.types';
import { toast } from 'sonner';
import { useLimitCheck } from '../../../hooks/useLimitCheck';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const CURRENCIES = [
  { code: 'USD', label: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', label: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', label: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'AED', label: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
];

const AVAILABLE_TOKENS = ['USDC', 'USDT', 'XLM', 'ETH', 'MATIC'];
const AVAILABLE_CHAINS = ['stellar', 'polygon', 'ethereum', 'base', 'bsc', 'avalanche', 'arbitrum', 'solana'];

const INTERVALS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const createPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  fiat_currency: z.string().min(1),
  interval: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  interval_count: z.number().int().positive().default(1),
  trial_days: z.number().int().min(0).default(0),
  trial_type: z.enum(['free', 'reduced_price']).optional(),
  trial_price: z.number().min(0).optional(),
  setup_fee: z.number().min(0).optional(),
  max_billing_cycles: z.number().int().positive().optional(),
  accepted_tokens: z.array(z.string()).min(1, 'Select at least one token'),
  accepted_chains: z.array(z.string()).min(1, 'Select at least one chain'),
  features: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

type CreatePlanFormData = z.infer<typeof createPlanSchema>;

export function CreateSubscriptionPlanForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [featureInput, setFeatureInput] = React.useState('');
  const [features, setFeatures] = React.useState<string[]>([]);
  const { checkActionLimit } = useLimitCheck();
  const [limitCheckResult, setLimitCheckResult] = React.useState<{ allowed: boolean; message?: string } | null>(null);

  // Check limit on component mount
  React.useEffect(() => {
    const checkLimit = async () => {
      const result = await checkActionLimit('create_subscription_plan');
      setLimitCheckResult({
        allowed: result.allowed,
        message: result.upgradeModalData?.message,
      });
    };
    checkLimit();
  }, []);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatePlanFormData>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      amount: 0,
      fiat_currency: 'USD',
      interval: 'monthly',
      interval_count: 1,
      trial_days: 0,
      setup_fee: 0,
      accepted_tokens: ['USDC'],
      accepted_chains: ['polygon'],
    },
  });

  const amount = watch('amount') || 0;
  const fiatCurrency = watch('fiat_currency') || 'USD';
  const interval = watch('interval') || 'monthly';
  const intervalCount = watch('interval_count') || 1;
  const trialDays = watch('trial_days') || 0;
  const trialType = watch('trial_type');
  const trialPrice = watch('trial_price') || 0;
  const setupFee = watch('setup_fee') || 0;
  const acceptedTokens = watch('accepted_tokens');
  const acceptedChains = watch('accepted_chains');

  const selectedCurrency = CURRENCIES.find(c => c.code === fiatCurrency) ?? CURRENCIES[0];

  const toggleArrayValue = (
    field: 'accepted_tokens' | 'accepted_chains',
    value: string,
    currentValues: string[]
  ) => {
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    setValue(field, newValues, { shouldValidate: true });
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const formatIntervalDisplay = (interval: string, count: number) => {
    const intervalLabel = INTERVALS.find(i => i.value === interval)?.label || interval;
    if (count === 1) return intervalLabel;
    return `Every ${count} ${intervalLabel}`;
  };

  const onSubmit = async (data: CreatePlanFormData) => {
    // Check limit before submitting
    const limitCheck = await checkActionLimit('create_subscription_plan');
    if (!limitCheck.allowed) {
      // Show toast with the limit message
      toast.error('Subscription Plan Limit Reached', {
        description: limitCheck.upgradeModalData?.message || 'Please upgrade your plan to create more subscription plans',
        duration: 5000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const input: any = {
        name: data.name,
        amount: data.amount,
        fiat_currency: data.fiat_currency,
        interval: data.interval as SubscriptionInterval,
        interval_count: data.interval_count,
        trial_days: data.trial_days,
        accepted_tokens: data.accepted_tokens,
        accepted_chains: data.accepted_chains,
      };

      if (data.description?.trim()) input.description = data.description.trim();
      if (data.trial_type) input.trial_type = data.trial_type as TrialType;
      if (data.trial_price !== undefined && data.trial_price > 0) input.trial_price = data.trial_price;
      if (data.setup_fee !== undefined && data.setup_fee > 0) input.setup_fee = data.setup_fee;
      if (data.max_billing_cycles) input.max_billing_cycles = data.max_billing_cycles;
      if (features.length > 0) input.features = features;

      await subscriptionsService.createPlan(input);
      toast.success('Subscription plan created successfully!');
      window.location.href = '/subscriptions-dashboard';
    } catch (error: any) {
      // Handle 403 Forbidden - tier limit reached
      if (error.status === 403 || error.response?.status === 403) {
        const errorMessage = error.message || error.response?.data?.detail || 'Subscription plan limit reached';
        toast.error(errorMessage, {
          duration: 6000,
          description: 'Upgrade your plan to create more subscription plans',
        });
      } else {
        toast.error(error.message || 'Failed to create subscription plan');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BentoLayout activePage="subscriptions">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.location.href = '/subscriptions-dashboard'}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Subscription Plan</h1>
            <p className="text-muted-foreground">Define a recurring billing plan for your customers</p>
          </div>
        </div>

        {/* Limit Warning Banner */}
        {limitCheckResult && !limitCheckResult.allowed && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Subscription Plan Limit Reached</AlertTitle>
            <AlertDescription>
              {limitCheckResult.message || 'You have reached your subscription plan limit. Please upgrade your plan to create more subscription plans.'}
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/billing'}
                >
                  Upgrade Plan
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Plan name, description, and pricing details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Pro Plan, Enterprise"
                    {...register('name')}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fiat_currency">Currency *</Label>
                  <Controller
                    name="fiat_currency"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.flag} {currency.label} ({currency.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what's included in this plan..."
                  rows={3}
                  {...register('description')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Billing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Billing Cycle</CardTitle>
              <CardDescription>Set the recurring price and billing frequency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {selectedCurrency.symbol}
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      className="pl-8"
                      {...register('amount', { valueAsNumber: true })}
                    />
                  </div>
                  {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interval">Billing Interval *</Label>
                  <Controller
                    name="interval"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {INTERVALS.map((int) => (
                            <SelectItem key={int.value} value={int.value}>
                              {int.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interval_count">Interval Count</Label>
                  <Input
                    id="interval_count"
                    type="number"
                    min="1"
                    {...register('interval_count', { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatIntervalDisplay(interval, intervalCount)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="setup_fee">Setup Fee (Optional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {selectedCurrency.symbol}
                    </span>
                    <Input
                      id="setup_fee"
                      type="number"
                      step="0.01"
                      min="0"
                      className="pl-8"
                      {...register('setup_fee', { valueAsNumber: true })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">One-time fee charged at subscription start</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_billing_cycles">Max Billing Cycles (Optional)</Label>
                  <Input
                    id="max_billing_cycles"
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    {...register('max_billing_cycles', { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">Leave empty for unlimited billing</p>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Recurring charge:</span>
                  <span className="font-semibold">
                    {formatCurrency(amount, fiatCurrency)} / {formatIntervalDisplay(interval, intervalCount)}
                  </span>
                </div>
                {setupFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Setup fee:</span>
                    <span className="font-semibold">{formatCurrency(setupFee, fiatCurrency)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Trial Period */}
          <Card>
            <CardHeader>
              <CardTitle>Trial Period (Optional)</CardTitle>
              <CardDescription>Offer a trial period to new subscribers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trial_days">Trial Days</Label>
                  <Input
                    id="trial_days"
                    type="number"
                    min="0"
                    placeholder="0"
                    {...register('trial_days', { valueAsNumber: true })}
                  />
                </div>

                {trialDays > 0 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="trial_type">Trial Type</Label>
                      <Controller
                        name="trial_type"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free Trial</SelectItem>
                              <SelectItem value="reduced_price">Reduced Price</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    {trialType === 'reduced_price' && (
                      <div className="space-y-2">
                        <Label htmlFor="trial_price">Trial Price</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {selectedCurrency.symbol}
                          </span>
                          <Input
                            id="trial_price"
                            type="number"
                            step="0.01"
                            min="0"
                            className="pl-8"
                            {...register('trial_price', { valueAsNumber: true })}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {trialDays > 0 && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Customers will get {trialDays} days of {trialType === 'free' ? 'free' : 'discounted'} access
                    {trialType === 'reduced_price' && trialPrice > 0 && ` at ${formatCurrency(trialPrice, fiatCurrency)}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Accepted Payment Methods</CardTitle>
              <CardDescription>Select which tokens and chains to accept</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Accepted Tokens *</Label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TOKENS.map((token) => (
                    <div key={token} className="flex items-center space-x-2">
                      <Checkbox
                        id={`token-${token}`}
                        checked={acceptedTokens.includes(token)}
                        onCheckedChange={() => toggleArrayValue('accepted_tokens', token, acceptedTokens)}
                      />
                      <Label htmlFor={`token-${token}`} className="cursor-pointer font-normal">
                        {token}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.accepted_tokens && (
                  <p className="text-sm text-red-500">{errors.accepted_tokens.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Accepted Chains *</Label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_CHAINS.map((chain) => (
                    <div key={chain} className="flex items-center space-x-2">
                      <Checkbox
                        id={`chain-${chain}`}
                        checked={acceptedChains.includes(chain)}
                        onCheckedChange={() => toggleArrayValue('accepted_chains', chain, acceptedChains)}
                      />
                      <Label htmlFor={`chain-${chain}`} className="cursor-pointer font-normal capitalize">
                        {chain}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.accepted_chains && (
                  <p className="text-sm text-red-500">{errors.accepted_chains.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Features (Optional)</CardTitle>
              <CardDescription>List the features included in this plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Unlimited API calls, Priority support"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                />
                <Button type="button" onClick={addFeature} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {features.length > 0 && (
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.href = '/subscriptions-dashboard'}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || (limitCheckResult && !limitCheckResult.allowed)}
            >
              {isSubmitting ? 'Creating...' : 'Create Subscription Plan'}
            </Button>
          </div>
        </form>
      </div>
    </BentoLayout>
  );
}

export default CreateSubscriptionPlanForm;
