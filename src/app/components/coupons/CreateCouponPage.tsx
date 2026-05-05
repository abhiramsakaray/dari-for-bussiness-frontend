import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BentoLayout } from '../BentoLayout';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useCreateCoupon } from '@/hooks/useCoupons';
import { useMerchantCurrency } from '@/hooks/useMerchantCurrency';
import { CreatePromoCodeInput } from '@/types/api.types';
import { Loader2, Tag, ArrowLeft, Calendar, Users, TrendingDown, Shield } from 'lucide-react';
import { toast } from 'sonner';

export function CreateCouponPage() {
  const navigate = useNavigate();
  const createCoupon = useCreateCoupon();
  const { currencySymbol } = useMerchantCurrency();

  const [form, setForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    max_discount_amount: '',
    min_order_amount: '0',
    usage_limit_total: '',
    usage_limit_per_user: '',
    start_date: new Date().toISOString().slice(0, 16),
    expiry_date: '',
    applies_to_subscriptions: false,
    subscription_discount_type: 'first_payment' as 'first_payment' | 'all_payments',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ 
      ...prev, 
      [key]: key === 'applies_to_subscriptions' ? value === 'true' : value 
    }));
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.code.trim()) {
      newErrors.code = 'Coupon code is required';
    } else if (form.code.length < 2 || form.code.length > 50) {
      newErrors.code = 'Code must be 2-50 characters';
    }

    if (!form.discount_value || parseFloat(form.discount_value) <= 0) {
      newErrors.discount_value = 'Discount value must be greater than 0';
    }

    if (form.type === 'percentage' && parseFloat(form.discount_value) > 100) {
      newErrors.discount_value = 'Percentage cannot exceed 100%';
    }

    if (!form.expiry_date) {
      newErrors.expiry_date = 'Expiry date is required';
    } else if (new Date(form.expiry_date) <= new Date(form.start_date)) {
      newErrors.expiry_date = 'Expiry date must be after start date';
    }

    if (form.usage_limit_total && parseInt(form.usage_limit_total) < 1) {
      newErrors.usage_limit_total = 'Usage limit must be at least 1';
    }

    if (form.usage_limit_per_user && parseInt(form.usage_limit_per_user) < 1) {
      newErrors.usage_limit_per_user = 'Per-user limit must be at least 1';
    }

    if (form.applies_to_subscriptions && !form.subscription_discount_type) {
      newErrors.subscription_discount_type = 'Please select a subscription discount type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const payload: CreatePromoCodeInput = {
      code: form.code.toUpperCase().trim(),
      type: form.type,
      discount_value: parseFloat(form.discount_value),
      min_order_amount: parseFloat(form.min_order_amount) || 0,
      start_date: new Date(form.start_date).toISOString(),
      expiry_date: new Date(form.expiry_date).toISOString(),
    };

    if (form.max_discount_amount) {
      payload.max_discount_amount = parseFloat(form.max_discount_amount);
    }
    if (form.usage_limit_total) {
      payload.usage_limit_total = parseInt(form.usage_limit_total);
    }
    if (form.usage_limit_per_user) {
      payload.usage_limit_per_user = parseInt(form.usage_limit_per_user);
    }

    // Add subscription support
    if (form.applies_to_subscriptions) {
      payload.applies_to_subscriptions = true;
      payload.subscription_discount_type = form.subscription_discount_type;
    }

    // Warning for high-value all_payments discounts
    if (
      form.applies_to_subscriptions &&
      form.subscription_discount_type === 'all_payments' &&
      form.type === 'percentage' &&
      parseFloat(form.discount_value) > 50
    ) {
      const confirmed = window.confirm(
        `⚠️ Warning: You are creating a promo code that gives ${form.discount_value}% off ALL recurring payments. ` +
        'This will significantly reduce subscription revenue. Continue?'
      );
      if (!confirmed) {
        return;
      }
    }

    createCoupon.mutate(payload, {
      onSuccess: () => {
        toast.success('Promo code created successfully!');
        navigate('/dashboard/coupons');
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.detail || 'Failed to create coupon');
      },
    });
  };

  const TIPS = [
    { icon: Tag, text: 'Use memorable codes like WELCOME10 or SUMMER25' },
    { icon: Calendar, text: 'Set expiry dates to create urgency' },
    { icon: Users, text: 'Limit per-user usage to prevent abuse' },
    { icon: Shield, text: 'Set minimum order amounts to protect margins' },
  ];

  return (
    <BentoLayout activePage="coupons">
      <form onSubmit={handleSubmit} className="space-y-6 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard/coupons')}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-semibold">Create Promo Code</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-11">
              Create a new discount coupon for your customers
            </p>
          </div>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Coupon Code & Type */}
            <Card className="bg-card border-border p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-4">
                Coupon Details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">
                    Coupon Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    value={form.code}
                    onChange={(e) => updateField('code', e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME10"
                    maxLength={50}
                    className="font-mono"
                  />
                  {errors.code && (
                    <p className="text-sm text-destructive">{errors.code}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    A unique code customers will enter at checkout
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">
                    Discount Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.type}
                    onValueChange={(value) => updateField('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ({currencySymbol})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Discount Value & Max Cap */}
            <Card className="bg-card border-border p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-4">
                Discount Amount
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount_value">
                    Discount Value <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="discount_value"
                      type="number"
                      value={form.discount_value}
                      onChange={(e) => updateField('discount_value', e.target.value)}
                      min="0.01"
                      max={form.type === 'percentage' ? '100' : undefined}
                      step="0.01"
                      placeholder={form.type === 'percentage' ? '10' : '5.00'}
                      className="pr-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                      {form.type === 'percentage' ? '%' : currencySymbol}
                    </span>
                  </div>
                  {errors.discount_value && (
                    <p className="text-sm text-destructive">{errors.discount_value}</p>
                  )}
                </div>

                {form.type === 'percentage' ? (
                  <div className="space-y-2">
                    <Label htmlFor="max_discount_amount">
                      Max Discount Cap ({currencySymbol})
                    </Label>
                    <Input
                      id="max_discount_amount"
                      type="number"
                      value={form.max_discount_amount}
                      onChange={(e) => updateField('max_discount_amount', e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="No cap"
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional maximum amount for % discounts
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="min_order_amount">
                      Min Order Amount ({currencySymbol})
                    </Label>
                    <Input
                      id="min_order_amount"
                      type="number"
                      value={form.min_order_amount}
                      onChange={(e) => updateField('min_order_amount', e.target.value)}
                      min="0"
                      step="0.01"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum order value required
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Subscription Support */}
            <Card className="bg-card border-border p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-4">
                Subscription Support
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="applies_to_subscriptions"
                    checked={form.applies_to_subscriptions}
                    onChange={(e) => updateField('applies_to_subscriptions', e.target.checked.toString())}
                    className="mt-1 h-4 w-4 rounded border-input"
                  />
                  <div className="flex-1">
                    <Label htmlFor="applies_to_subscriptions" className="cursor-pointer font-medium">
                      Can be used for subscription payments
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enable this to allow customers to apply this promo code when subscribing to plans
                    </p>
                  </div>
                </div>

                {form.applies_to_subscriptions && (
                  <div className="space-y-2 pl-7 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Label htmlFor="subscription_discount_type">
                      Subscription Discount Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={form.subscription_discount_type}
                      onValueChange={(value) => updateField('subscription_discount_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first_payment">First Payment Only</SelectItem>
                        <SelectItem value="all_payments">All Recurring Payments</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.subscription_discount_type && (
                      <p className="text-sm text-destructive">{errors.subscription_discount_type}</p>
                    )}
                    <div className={`text-xs p-3 rounded-lg border ${
                      form.subscription_discount_type === 'first_payment'
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300'
                    }`}>
                      {form.subscription_discount_type === 'first_payment' ? (
                        <span>💡 Discount will only apply to the first subscription payment</span>
                      ) : (
                        <span>⚠️ Discount will apply to every recurring payment for the lifetime of the subscription</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Usage Limits & Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Usage Limits */}
              <Card className="bg-card border-border p-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-4">
                  Usage Limits
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="usage_limit_total">Total Uses</Label>
                    <Input
                      id="usage_limit_total"
                      type="number"
                      value={form.usage_limit_total}
                      onChange={(e) => updateField('usage_limit_total', e.target.value)}
                      min="1"
                      placeholder="Unlimited"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usage_limit_per_user">Per User</Label>
                    <Input
                      id="usage_limit_per_user"
                      type="number"
                      value={form.usage_limit_per_user}
                      onChange={(e) => updateField('usage_limit_per_user', e.target.value)}
                      min="1"
                      placeholder="Unlimited"
                    />
                  </div>
                </div>
              </Card>

              {/* Date Range */}
              <Card className="bg-card border-border p-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-4">
                  Valid Period
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">
                      Start Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      value={form.start_date}
                      onChange={(e) => updateField('start_date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiry_date">
                      Expiry Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="expiry_date"
                      type="datetime-local"
                      value={form.expiry_date}
                      onChange={(e) => updateField('expiry_date', e.target.value)}
                    />
                    {errors.expiry_date && (
                      <p className="text-sm text-destructive">{errors.expiry_date}</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Column - Tips & Submit */}
          <div className="space-y-6">
            <Card className="bg-secondary/40 border-border p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-5">
                Best Practices
              </p>
              <div className="space-y-5">
                {TIPS.map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-snug pt-0.5">{text}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 h-12 text-base gap-2"
              disabled={createCoupon.isPending}
            >
              {createCoupon.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Tag className="h-4 w-4" />
                  Create Coupon
                </>
              )}
            </Button>
          </div>

        </div>
      </form>
    </BentoLayout>
  );
}
