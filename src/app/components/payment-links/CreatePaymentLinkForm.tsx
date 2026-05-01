import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePaymentLink } from '../../../hooks/usePaymentLinks';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BentoLayout } from "../BentoLayout";
import { ArrowLeft } from 'lucide-react';

// Removed navigateTo helper - using direct hash assignment for clarity

const AVAILABLE_TOKENS = ['USDC', 'USDT', 'XLM', 'ETH', 'MATIC', 'DAI'];
const AVAILABLE_CHAINS = ['stellar', 'polygon', 'ethereum', 'base', 'bsc', 'avalanche', 'tron', 'arbitrum', 'solana'];

const CURRENCIES = [
  { code: 'USD', label: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', label: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', label: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'AED', label: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'SGD', label: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'MYR', label: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'PKR', label: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰' },
  { code: 'BDT', label: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'SAR', label: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
  { code: 'TRY', label: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
];

const createPaymentLinkSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500).optional(),
  amount_fiat: z.number().positive('Amount must be positive').optional(),
  fiat_currency: z.string().min(1, 'Currency is required'),
  is_amount_fixed: z.boolean(),
  accepted_tokens: z.array(z.string()).min(1, 'Select at least one token'),
  accepted_chains: z.array(z.string()).min(1, 'Select at least one chain'),
  success_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  cancel_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  is_single_use: z.boolean(),
  expires_at: z.string().optional(),
});

type CreatePaymentLinkFormData = z.infer<typeof createPaymentLinkSchema>;

export function CreatePaymentLinkForm() {
  const createMutation = useCreatePaymentLink();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreatePaymentLinkFormData>({
    resolver: zodResolver(createPaymentLinkSchema),
    defaultValues: {
      is_amount_fixed: true,
      is_single_use: false,
      accepted_tokens: ['USDC'],
      accepted_chains: ['polygon'],
      fiat_currency: 'USD',
    },
  });

  const isAmountFixed = watch('is_amount_fixed');
  const acceptedTokens = watch('accepted_tokens');
  const acceptedChains = watch('accepted_chains');
  const fiatCurrency = watch('fiat_currency') || 'USD';
  
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

  const onSubmit = async (data: CreatePaymentLinkFormData) => {
    const input: any = {
      name: data.name,
      is_amount_fixed: data.is_amount_fixed,
      accepted_tokens: data.accepted_tokens,
      accepted_chains: data.accepted_chains,
      is_single_use: data.is_single_use,
      fiat_currency: data.fiat_currency,
    };

    // Only include optional fields if they have non-empty values
    if (data.description?.trim()) {
      input.description = data.description.trim();
    }
    if (data.is_amount_fixed && data.amount_fiat) {
      input.amount_fiat = data.amount_fiat;
    }
    if (data.success_url?.trim()) {
      input.success_url = data.success_url.trim();
    }
    if (data.cancel_url?.trim()) {
      input.cancel_url = data.cancel_url.trim();
    }
    if (data.expires_at?.trim()) {
      input.expires_at = data.expires_at.trim();
    }

    await createMutation.mutateAsync(input);
    window.location.href = '/payment-links-dashboard';
  };

  return (
    <BentoLayout activePage="payment-links">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.location.href = '/payment-links-dashboard'}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Payment Link</h1>
            <p className="text-muted-foreground">
              Create a shareable link to accept crypto payments
            </p>
          </div>
        </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Set up your payment link details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Link Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., Monthly Subscription"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="What is this payment for?"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Amount</CardTitle>
            <CardDescription>Set a fixed amount or let customers choose</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Controller
                name="is_amount_fixed"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="is_amount_fixed"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="is_amount_fixed">Fixed amount</Label>
            </div>

            {isAmountFixed && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount_fiat">Amount *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {selectedCurrency.symbol}
                    </span>
                    <Input
                      id="amount_fiat"
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="pl-10"
                      {...register('amount_fiat', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.amount_fiat && (
                    <p className="text-sm text-red-500">{errors.amount_fiat.message}</p>
                  )}
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
                  {errors.fiat_currency && (
                    <p className="text-sm text-red-500">{errors.fiat_currency.message}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accepted Payments</CardTitle>
            <CardDescription>Choose which tokens and chains to accept</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Accepted Tokens *</Label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {AVAILABLE_TOKENS.map((token) => (
                  <div
                    key={token}
                    className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      acceptedTokens.includes(token)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleArrayValue('accepted_tokens', token, acceptedTokens)}
                  >
                    <span className="font-medium">{token}</span>
                  </div>
                ))}
              </div>
              {errors.accepted_tokens && (
                <p className="text-sm text-red-500">{errors.accepted_tokens.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Accepted Chains *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AVAILABLE_CHAINS.map((chain) => (
                  <div
                    key={chain}
                    className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors capitalize ${
                      acceptedChains.includes(chain)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleArrayValue('accepted_chains', chain, acceptedChains)}
                  >
                    <span className="font-medium">{chain}</span>
                  </div>
                ))}
              </div>
              {errors.accepted_chains && (
                <p className="text-sm text-red-500">{errors.accepted_chains.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Redirect URLs</CardTitle>
            <CardDescription>Where to send customers after payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="success_url">Success Redirect URL</Label>
              <Input
                id="success_url"
                {...register('success_url')}
                type="url"
                placeholder="https://yoursite.com/success"
              />
              {errors.success_url && (
                <p className="text-sm text-red-500">{errors.success_url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cancel_url">Cancel Redirect URL</Label>
              <Input
                id="cancel_url"
                {...register('cancel_url')}
                type="url"
                placeholder="https://yoursite.com/cancel"
              />
              {errors.cancel_url && (
                <p className="text-sm text-red-500">{errors.cancel_url.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Controller
                name="is_single_use"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="is_single_use"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="is_single_use">
                Single use (deactivate after first payment)
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
              <Input
                id="expires_at"
                type="datetime-local"
                {...register('expires_at')}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Payment Link'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.href = '/payment-links-dashboard'}
          >
            Cancel
          </Button>
        </div>
      </form>
      </div>
    </BentoLayout>
  );
}

export default CreatePaymentLinkForm;
