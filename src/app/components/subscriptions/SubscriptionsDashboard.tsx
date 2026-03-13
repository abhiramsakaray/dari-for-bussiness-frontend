import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  useSubscriptionPlans,
  useSubscriptions,
  useCreateSubscriptionPlan,
  useCreateSubscription,
  useCancelSubscription,
  usePauseSubscription,
  useResumeSubscription,
  useUpdateSubscriptionPlan,
  useDeactivateSubscriptionPlan,
  useExtendTrial,
  useEndTrial,
  useCollectPayment,
  useUpdatePaymentMethod,
} from '../../../hooks/useSubscriptions';
import {
  SubscriptionPlan,
  Subscription,
  SubscriptionStatus,
  SubscriptionInterval,
  CreateSubscriptionPlanInput,
  CreateSubscriptionInput,
  TrialType,
} from '../../../types/api.types';
import { useMerchantCurrency } from '../../../hooks/useMerchantCurrency';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Plus,
  MoreVertical,
  Pause,
  Play,
  Edit2,
  Trash2,
  Copy,
  Share2,
  XCircle,
  Users,
  CreditCard,
  TrendingUp,
  Gift,
  Timer,
  Wallet,
  Zap,
} from 'lucide-react';
import { DashboardLayout } from '../DashboardLayout';

const STATUS_VARIANTS: Record<SubscriptionStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  [SubscriptionStatus.ACTIVE]: 'default',
  [SubscriptionStatus.PAUSED]: 'outline',
  [SubscriptionStatus.CANCELLED]: 'secondary',
  [SubscriptionStatus.PAST_DUE]: 'destructive',
  [SubscriptionStatus.TRIALING]: 'default',
};

const SUPPORTED_CHAINS = ['polygon', 'ethereum', 'bsc', 'avalanche', 'arbitrum'];
const SUPPORTED_TOKENS = ['USDC', 'USDT', 'DAI', 'WETH', 'WBTC'];

export function SubscriptionsDashboard() {
  const { currency } = useMerchantCurrency();
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [plansPage] = useState(1);
  const [subscriptionsPage] = useState(1);

  // Dialog state
  const [showNewPlanDialog, setShowNewPlanDialog] = useState(false);
  const [showEditPlanDialog, setShowEditPlanDialog] = useState(false);
  const [showDeletePlanDialog, setShowDeletePlanDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showNewSubDialog, setShowNewSubDialog] = useState(false);

  // New Plan form state
  const [planForm, setPlanForm] = useState<{
    name: string;
    description: string;
    amount: string;
    fiat_currency: string;
    interval: SubscriptionInterval;
    interval_count: string;
    trial_days: string;
    trial_type: TrialType;
    trial_price: string;
    setup_fee: string;
    max_billing_cycles: string;
    accepted_tokens: string[];
    accepted_chains: string[];
    features: string;
    is_active?: boolean;
  }>({
    name: '',
    description: '',
    amount: '',
    fiat_currency: 'USD',
    interval: SubscriptionInterval.MONTHLY,
    interval_count: '1',
    trial_days: '0',
    trial_type: 'free',
    trial_price: '',
    setup_fee: '0',
    max_billing_cycles: '',
    accepted_tokens: ['USDC'],
    accepted_chains: ['polygon'],
    features: '',
    is_active: true,
  });

  // New Subscription form state
  const [subForm, setSubForm] = useState<{
    plan_id: string;
    customer_email: string;
    customer_name: string;
    customer_wallet_address: string;
    customer_chain: string;
    customer_token: string;
    skip_trial: boolean;
    custom_trial_days: string;
  }>({
    plan_id: '',
    customer_email: '',
    customer_name: '',
    customer_wallet_address: '',
    customer_chain: '',
    customer_token: '',
    skip_trial: false,
    custom_trial_days: '',
  });

  const { data: plansData, isLoading: plansLoading, error: plansError } = useSubscriptionPlans(plansPage, 20);
  const { data: subscriptionsData, isLoading: subscriptionsLoading, error: subscriptionsError } = useSubscriptions(
    subscriptionsPage,
    20
  );

  const createPlanMutation = useCreateSubscriptionPlan();
  const updatePlanMutation = useUpdateSubscriptionPlan();
  const deactivatePlanMutation = useDeactivateSubscriptionPlan();
  const createSubMutation = useCreateSubscription();
  const cancelMutation = useCancelSubscription();
  const pauseMutation = usePauseSubscription();
  const resumeMutation = useResumeSubscription();
  const extendTrialMutation = useExtendTrial();
  const endTrialMutation = useEndTrial();
  const collectPaymentMutation = useCollectPayment();
  const updatePaymentMethodMutation = useUpdatePaymentMethod();

  // Check for 403 errors
  const error = plansError || subscriptionsError;
  if (error) {
    const errorStatus = (error as any)?.response?.status;
    const errorMessage = errorStatus === 403
      ? 'Subscriptions are not available on your current plan. Please upgrade to access this feature.'
      : 'Error loading subscriptions. Please try again.';

    return (
      <DashboardLayout activePage="subscriptions">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {errorStatus === 403 ? 'Access Restricted' : 'Error'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{errorMessage}</p>
            {errorStatus === 403 && (
              <Button className="mt-4" onClick={() => { window.location.hash = '/billing'; }}>
                View Plans &amp; Billing
              </Button>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const handleCancel = (subscriptionId: string) => {
    if (window.confirm('Are you sure you want to cancel this subscription?')) {
      cancelMutation.mutate({ subscriptionId, immediate: false });
    }
  };

  const handlePause = (subscriptionId: string) => {
    pauseMutation.mutate(subscriptionId);
  };

  const handleResume = (subscriptionId: string) => {
    resumeMutation.mutate(subscriptionId);
  };

  const handleExtendTrial = (subscriptionId: string) => {
    const daysStr = window.prompt('How many extra days to extend the trial?', '7');
    if (daysStr) {
      const days = parseInt(daysStr, 10);
      if (!isNaN(days) && days > 0) {
        extendTrialMutation.mutate({ subscriptionId, extraDays: days });
      }
    }
  };

  const handleEndTrial = (subscriptionId: string) => {
    if (window.confirm('End trial and convert to paid subscription?')) {
      endTrialMutation.mutate(subscriptionId);
    }
  };

  const handleCollectPayment = (subscriptionId: string) => {
    if (window.confirm('Attempt to collect payment for this subscription now?')) {
      collectPaymentMutation.mutate(subscriptionId);
    }
  };

  const handleUpdatePaymentMethod = (subscriptionId: string) => {
    const wallet = window.prompt('Enter customer wallet address:');
    if (wallet) {
      const chain = window.prompt('Enter chain (e.g., ethereum, polygon):');
      const token = window.prompt('Enter token (e.g., USDT, USDC):');
      if (chain && token) {
        updatePaymentMethodMutation.mutate({
          subscriptionId,
          data: { wallet_address: wallet, chain, token },
        });
      }
    }
  };

  const handleCreatePlan = () => {
    const input: CreateSubscriptionPlanInput = {
      name: planForm.name,
      description: planForm.description || undefined,
      amount: parseFloat(planForm.amount),
      fiat_currency: planForm.fiat_currency,
      interval: planForm.interval,
      interval_count: parseInt(planForm.interval_count) || 1,
      trial_days: parseInt(planForm.trial_days) || 0,
      trial_type: planForm.trial_type,
      trial_price: planForm.trial_type === 'reduced_price' && planForm.trial_price ? parseFloat(planForm.trial_price) : undefined,
      setup_fee: parseFloat(planForm.setup_fee) || 0,
      max_billing_cycles: planForm.max_billing_cycles ? parseInt(planForm.max_billing_cycles) : undefined,
      accepted_tokens: planForm.accepted_tokens,
      accepted_chains: planForm.accepted_chains,
      features: planForm.features ? planForm.features.split('\n').filter(Boolean) : undefined,
    };
    createPlanMutation.mutate(input, {
      onSuccess: () => {
        setShowNewPlanDialog(false);
        setPlanForm({
          name: '', description: '', amount: '', fiat_currency: 'USD',
          interval: SubscriptionInterval.MONTHLY, interval_count: '1',
          trial_days: '0', trial_type: 'free', trial_price: '', setup_fee: '0',
          max_billing_cycles: '', accepted_tokens: ['USDC'], accepted_chains: ['polygon'], features: '',
        });
      },
    });
  };

  const handleCreateSubscription = () => {
    const input: CreateSubscriptionInput = {
      plan_id: subForm.plan_id,
      customer_email: subForm.customer_email,
      customer_name: subForm.customer_name || undefined,
      customer_wallet_address: subForm.customer_wallet_address || undefined,
      customer_chain: subForm.customer_chain || undefined,
      customer_token: subForm.customer_token || undefined,
      skip_trial: subForm.skip_trial,
      custom_trial_days: subForm.custom_trial_days ? parseInt(subForm.custom_trial_days) : undefined,
    };
    createSubMutation.mutate(input, {
      onSuccess: () => {
        setShowNewSubDialog(false);
        setSubForm({ plan_id: '', customer_email: '', customer_name: '', customer_wallet_address: '', customer_chain: '', customer_token: '', skip_trial: false, custom_trial_days: '' });
      },
    });
  };

  const toggleToken = (token: string) => {
    setPlanForm((f) => ({
      ...f,
      accepted_tokens: f.accepted_tokens.includes(token)
        ? f.accepted_tokens.filter((t) => t !== token)
        : [...f.accepted_tokens, token],
    }));
  };

  const toggleChain = (chain: string) => {
    setPlanForm((f) => ({
      ...f,
      accepted_chains: f.accepted_chains.includes(chain)
        ? f.accepted_chains.filter((c) => c !== chain)
        : [...f.accepted_chains, chain],
    }));
  };

  // Calculate summary stats
  const activePlans = plansData?.items?.filter((p) => p.is_active).length || 0;
  const activeSubscriptions =
    subscriptionsData?.items?.filter((s) => s.status === SubscriptionStatus.ACTIVE).length || 0;
  const totalMRR =
    subscriptionsData?.items
      ?.filter((s) => s.status === SubscriptionStatus.ACTIVE)
      .reduce((sum) => sum + 0, 0) || 0;

  const inputCls = 'w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring';
  const labelCls = 'block text-sm font-medium mb-1';

  return (
    <DashboardLayout activePage="subscriptions">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
            <p className="text-muted-foreground">
              Manage recurring billing with crypto payments
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowNewPlanDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Plan
            </Button>
            <Button onClick={() => setShowNewSubDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Subscription
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Plans</p>
                  <p className="text-2xl font-bold">{activePlans}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Subscribers</p>
                  <p className="text-2xl font-bold">{activeSubscriptions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalMRR, currency)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions" className="space-y-4">
            {subscriptionsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : !subscriptionsData?.items?.length ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    <Users className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No subscriptions yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create plans and start subscribing customers
                  </p>
                  <Button onClick={() => setShowNewSubDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Subscription
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>All Subscriptions ({subscriptionsData?.total})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Current Period</TableHead>
                        <TableHead>Next Payment</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptionsData?.items.map((subscription) => (
                        <SubscriptionRow
                          key={subscription.id}
                          subscription={subscription}
                          onPause={handlePause}
                          onResume={handleResume}
                          onCancel={handleCancel}
                          onExtendTrial={handleExtendTrial}
                          onEndTrial={handleEndTrial}
                          onCollectPayment={handleCollectPayment}
                          onUpdatePaymentMethod={handleUpdatePaymentMethod}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="plans" className="space-y-4">
            {plansLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : !plansData?.items?.length ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    <CreditCard className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No plans yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create a subscription plan to get started
                  </p>
                  <Button onClick={() => setShowNewPlanDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Plan
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plansData?.items.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onEdit={(p) => {
                      setSelectedPlan(p);
                      setPlanForm({
                        name: p.name,
                        description: p.description || '',
                        amount: p.amount.toString(),
                        fiat_currency: p.fiat_currency,
                        interval: p.interval,
                        interval_count: p.interval_count.toString(),
                        trial_days: p.trial_days.toString(),
                        trial_type: (p.trial_type as TrialType) || 'free',
                        trial_price: p.trial_price?.toString() || '',
                        setup_fee: p.setup_fee?.toString() || '',
                        max_billing_cycles: p.max_billing_cycles?.toString() || '',
                        accepted_tokens: ['USDC'],
                        accepted_chains: ['polygon'],
                        features: (p.features || []).join('\n'),
                        is_active: p.is_active,
                      });
                      setShowEditPlanDialog(true);
                    }}
                    onDelete={(p) => {
                      setSelectedPlan(p);
                      setShowDeletePlanDialog(true);
                    }}
                    onShare={(p) => {
                      const subscribeUrl = p.subscribe_url || `${window.location.origin}/#/subscribe/${p.id}`;
                      navigator.clipboard.writeText(subscribeUrl);
                      toast.success('Subscription link copied to clipboard!');
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ── New Plan Dialog ── */}
      <Dialog open={showNewPlanDialog} onOpenChange={setShowNewPlanDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Subscription Plan</DialogTitle>
            <DialogDescription>
              Define a recurring billing plan for your customers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className={labelCls}>Plan Name *</label>
              <input
                className={inputCls}
                placeholder="e.g. Pro Monthly"
                value={planForm.name}
                onChange={(e) => setPlanForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <input
                className={inputCls}
                placeholder="Short plan description"
                value={planForm.description}
                onChange={(e) => setPlanForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Amount *</label>
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="29.99"
                  value={planForm.amount}
                  onChange={(e) => setPlanForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelCls}>Currency</label>
                <select
                  className={inputCls}
                  value={planForm.fiat_currency}
                  onChange={(e) => setPlanForm((f) => ({ ...f, fiat_currency: e.target.value }))}
                >
                  {['USD', 'EUR', 'GBP', 'INR'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Billing Interval *</label>
                <select
                  className={inputCls}
                  value={planForm.interval}
                  onChange={(e) => setPlanForm((f) => ({ ...f, interval: e.target.value as SubscriptionInterval }))}
                >
                  {Object.values(SubscriptionInterval).map((i) => (
                    <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Interval Count</label>
                <input
                  className={inputCls}
                  type="number"
                  min="1"
                  value={planForm.interval_count}
                  onChange={(e) => setPlanForm((f) => ({ ...f, interval_count: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Trial Days</label>
              <input
                className={inputCls}
                type="number"
                min="0"
                value={planForm.trial_days}
                onChange={(e) => setPlanForm((f) => ({ ...f, trial_days: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Trial Type</label>
                <select
                  className={inputCls}
                  value={planForm.trial_type}
                  onChange={(e) => setPlanForm((f) => ({ ...f, trial_type: e.target.value as TrialType }))}
                >
                  <option value="free">Free</option>
                  <option value="reduced_price">Reduced Price</option>
                </select>
              </div>
              {planForm.trial_type === 'reduced_price' && (
                <div>
                  <label className={labelCls}>Trial Price</label>
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 4.99"
                    value={planForm.trial_price}
                    onChange={(e) => setPlanForm((f) => ({ ...f, trial_price: e.target.value }))}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Setup Fee (one-time)</label>
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  step="0.01"
                  value={planForm.setup_fee}
                  onChange={(e) => setPlanForm((f) => ({ ...f, setup_fee: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelCls}>Max Billing Cycles</label>
                <input
                  className={inputCls}
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={planForm.max_billing_cycles}
                  onChange={(e) => setPlanForm((f) => ({ ...f, max_billing_cycles: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Accepted Tokens</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {SUPPORTED_TOKENS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleToken(t)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${planForm.accepted_tokens.includes(t)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:border-primary'
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Accepted Chains</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {SUPPORTED_CHAINS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleChain(c)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors capitalize ${planForm.accepted_chains.includes(c)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:border-primary'
                      }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Features (one per line)</label>
              <textarea
                className={`${inputCls} min-h-[80px] resize-none`}
                placeholder="Unlimited access&#10;Priority support&#10;Custom branding"
                value={planForm.features}
                onChange={(e) => setPlanForm((f) => ({ ...f, features: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPlanDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlan}
              disabled={!planForm.name || !planForm.amount || createPlanMutation.isPending}
            >
              {createPlanMutation.isPending ? 'Creating…' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Plan Dialog ── */}
      <Dialog open={showEditPlanDialog} onOpenChange={setShowEditPlanDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Subscription Plan</DialogTitle>
            <DialogDescription>
              Update your subscription plan details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className={labelCls}>Plan Name *</label>
              <input
                className={inputCls}
                placeholder="e.g. Pro Monthly"
                value={planForm.name}
                onChange={(e) => setPlanForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <input
                className={inputCls}
                placeholder="Short plan description"
                value={planForm.description}
                onChange={(e) => setPlanForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Amount *</label>
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="29.99"
                  value={planForm.amount}
                  onChange={(e) => setPlanForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelCls}>Currency</label>
                <select
                  className={inputCls}
                  value={planForm.fiat_currency}
                  onChange={(e) => setPlanForm((f) => ({ ...f, fiat_currency: e.target.value }))}
                >
                  {['USD', 'EUR', 'GBP', 'INR'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Billing Interval</label>
                <select
                  className={inputCls}
                  value={planForm.interval}
                  onChange={(e) => setPlanForm((f) => ({ ...f, interval: e.target.value as SubscriptionInterval }))}
                >
                  <option value="day">Daily</option>
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Trial Days</label>
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  placeholder="0"
                  value={planForm.trial_days}
                  onChange={(e) => setPlanForm((f) => ({ ...f, trial_days: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Features (one per line)</label>
              <textarea
                className={`${inputCls} min-h-[80px] resize-none`}
                placeholder="Unlimited access&#10;Priority support&#10;Custom branding"
                value={planForm.features}
                onChange={(e) => setPlanForm((f) => ({ ...f, features: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-is-active"
                checked={planForm.is_active}
                onChange={(e) => setPlanForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="edit-is-active" className="text-sm">
                Plan is active (visible to customers)
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditPlanDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!selectedPlan) return;
                const featuresArray = planForm.features
                  .split('\n')
                  .map((f) => f.trim())
                  .filter(Boolean);
                await updatePlanMutation.mutateAsync({
                  planId: selectedPlan.id,
                  input: {
                    name: planForm.name,
                    description: planForm.description || undefined,
                    amount: parseFloat(planForm.amount),
                    fiat_currency: planForm.fiat_currency,
                    trial_days: parseInt(planForm.trial_days, 10),
                    features: featuresArray,
                    is_active: planForm.is_active,
                  },
                });
                setShowEditPlanDialog(false);
              }}
              disabled={!planForm.name || !planForm.amount || updatePlanMutation.isPending}
            >
              {updatePlanMutation.isPending ? 'Updating…' : 'Update Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Plan Confirmation Dialog ── */}
      <Dialog open={showDeletePlanDialog} onOpenChange={setShowDeletePlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subscription Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPlan?.name}"? This will deactivate the plan and prevent new subscriptions. Existing subscriptions will continue.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeletePlanDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!selectedPlan) return;
                await deactivatePlanMutation.mutateAsync(selectedPlan.id);
                setShowDeletePlanDialog(false);
              }}
              disabled={deactivatePlanMutation.isPending}
            >
              {deactivatePlanMutation.isPending ? 'Deleting…' : 'Delete Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── New Subscription Dialog ── */}
      <Dialog open={showNewSubDialog} onOpenChange={setShowNewSubDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Subscription</DialogTitle>
            <DialogDescription>
              Subscribe a customer to one of your plans.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className={labelCls}>Plan *</label>
              <select
                className={inputCls}
                value={subForm.plan_id}
                onChange={(e) => setSubForm((f) => ({ ...f, plan_id: e.target.value }))}
              >
                <option value="">Select a plan…</option>
                {plansData?.items?.filter((p) => p.is_active).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatCurrency(p.amount, p.fiat_currency)}/{p.interval}
                  </option>
                ))}
              </select>
              {!plansData?.items?.filter((p) => p.is_active).length && (
                <p className="text-xs text-muted-foreground mt-1">
                  No active plans found. Create a plan first.
                </p>
              )}
            </div>

            <div>
              <label className={labelCls}>Customer Email *</label>
              <input
                className={inputCls}
                type="email"
                placeholder="customer@example.com"
                value={subForm.customer_email}
                onChange={(e) => setSubForm((f) => ({ ...f, customer_email: e.target.value }))}
              />
            </div>

            <div>
              <label className={labelCls}>Customer Name</label>
              <input
                className={inputCls}
                placeholder="John Doe"
                value={subForm.customer_name}
                onChange={(e) => setSubForm((f) => ({ ...f, customer_name: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="skip_trial"
                type="checkbox"
                checked={subForm.skip_trial}
                onChange={(e) => setSubForm((f) => ({ ...f, skip_trial: e.target.checked }))}
                className="h-4 w-4 rounded border"
              />
              <label htmlFor="skip_trial" className="text-sm">Skip trial period</label>
            </div>

            {!subForm.skip_trial && (
              <div>
                <label className={labelCls}>Custom Trial Days (override plan default)</label>
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  placeholder="Use plan default"
                  value={subForm.custom_trial_days}
                  onChange={(e) => setSubForm((f) => ({ ...f, custom_trial_days: e.target.value }))}
                />
              </div>
            )}

            <div className="border-t pt-4 mt-2">
              <p className="text-sm font-medium mb-3">Customer Payment Method (optional)</p>
              <div>
                <label className={labelCls}>Wallet Address</label>
                <input
                  className={inputCls}
                  placeholder="Customer wallet address"
                  value={subForm.customer_wallet_address}
                  onChange={(e) => setSubForm((f) => ({ ...f, customer_wallet_address: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className={labelCls}>Chain</label>
                  <select
                    className={inputCls}
                    value={subForm.customer_chain}
                    onChange={(e) => setSubForm((f) => ({ ...f, customer_chain: e.target.value }))}
                  >
                    <option value="">Select chain</option>
                    {SUPPORTED_CHAINS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Token</label>
                  <select
                    className={inputCls}
                    value={subForm.customer_token}
                    onChange={(e) => setSubForm((f) => ({ ...f, customer_token: e.target.value }))}
                  >
                    <option value="">Select token</option>
                    {SUPPORTED_TOKENS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewSubDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateSubscription}
              disabled={!subForm.plan_id || !subForm.customer_email || createSubMutation.isPending}
            >
              {createSubMutation.isPending ? 'Creating…' : 'Create Subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

interface SubscriptionRowProps {
  subscription: Subscription;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onExtendTrial: (id: string) => void;
  onEndTrial: (id: string) => void;
  onCollectPayment: (id: string) => void;
  onUpdatePaymentMethod: (id: string) => void;
}

function SubscriptionRow({ subscription, onPause, onResume, onCancel, onExtendTrial, onEndTrial, onCollectPayment, onUpdatePaymentMethod }: SubscriptionRowProps) {
  const isActive = subscription.status === SubscriptionStatus.ACTIVE;
  const isPaused = subscription.status === SubscriptionStatus.PAUSED;
  const isTrialing = subscription.status === SubscriptionStatus.TRIALING || subscription.is_in_trial;

  return (
    <TableRow>
      <TableCell>
        <div>
          <p className="font-medium">{subscription.customer_name || 'No name'}</p>
          <p className="text-sm text-muted-foreground">{subscription.customer_email}</p>
        </div>
      </TableCell>
      <TableCell>{subscription.plan_name}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Badge variant={STATUS_VARIANTS[subscription.status]}>
            {subscription.status.replace('_', ' ').toUpperCase()}
          </Badge>
          {isTrialing && (
            <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-950/20 flex items-center gap-1">
              <Gift className="w-3 h-3" />
              {subscription.trial_days_remaining != null
                ? `${subscription.trial_days_remaining}d left`
                : 'Trial'}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {subscription.next_payment_at ? (
          <div>
            <p>{formatDate(subscription.next_payment_at)}</p>
            {subscription.next_payment_amount != null && (
              <p className="text-xs">${Number(subscription.next_payment_amount).toFixed(2)}</p>
            )}
          </div>
        ) : '-'}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isTrialing && (
              <>
                <DropdownMenuItem onClick={() => onExtendTrial(subscription.id)}>
                  <Timer className="w-4 h-4 mr-2" />
                  Extend Trial
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEndTrial(subscription.id)}>
                  <Zap className="w-4 h-4 mr-2" />
                  Convert to Paid
                </DropdownMenuItem>
              </>
            )}
            {isActive && (
              <>
                <DropdownMenuItem onClick={() => onCollectPayment(subscription.id)}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Collect Payment
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPause(subscription.id)}>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </DropdownMenuItem>
              </>
            )}
            {isPaused && (
              <DropdownMenuItem onClick={() => onResume(subscription.id)}>
                <Play className="w-4 h-4 mr-2" />
                Resume
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onUpdatePaymentMethod(subscription.id)}>
              <Wallet className="w-4 h-4 mr-2" />
              {subscription.has_payment_method ? 'Update' : 'Set'} Payment Method
            </DropdownMenuItem>
            {(isActive || isPaused || isTrialing) && (
              <DropdownMenuItem onClick={() => onCancel(subscription.id)} className="text-red-600">
                <XCircle className="w-4 h-4 mr-2" />
                Cancel
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

interface PlanCardProps {
  plan: SubscriptionPlan;
  onEdit?: (plan: SubscriptionPlan) => void;
  onDelete?: (plan: SubscriptionPlan) => void;
  onShare?: (plan: SubscriptionPlan) => void;
}

function PlanCard({ plan, onEdit, onDelete, onShare }: PlanCardProps) {
  return (
    <Card className={!plan.is_active ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description || 'No description'}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={plan.is_active ? 'default' : 'secondary'}>
              {plan.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(plan)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare?.(plan)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Subscribe Link
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(plan)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Plan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-3xl font-bold">
            {formatCurrency(plan.amount, plan.fiat_currency)}
            <span className="text-sm font-normal text-muted-foreground">
              /{plan.interval}
            </span>
          </p>
        </div>

        {plan.features && plan.features.length > 0 && (
          <ul className="space-y-1">
            {plan.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1 h-1 bg-primary rounded-full"></span>
                {feature}
              </li>
            ))}
            {plan.features.length > 3 && (
              <li className="text-sm text-muted-foreground">
                +{plan.features.length - 3} more features
              </li>
            )}
          </ul>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">
            {plan.subscriber_count} subscriber{plan.subscriber_count !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            {plan.setup_fee != null && plan.setup_fee > 0 && (
              <span className="text-xs text-muted-foreground">Setup: {formatCurrency(plan.setup_fee, plan.fiat_currency)}</span>
            )}
            {plan.trial_days > 0 && (
              <span className="text-xs text-muted-foreground">
                {plan.trial_days}d {plan.trial_type === 'reduced_price' ? `trial @ ${formatCurrency(plan.trial_price ?? 0, plan.fiat_currency)}` : 'free trial'}
              </span>
            )}
            {plan.max_billing_cycles != null && (
              <span className="text-xs text-muted-foreground">Max {plan.max_billing_cycles} cycles</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SubscriptionsDashboard;
