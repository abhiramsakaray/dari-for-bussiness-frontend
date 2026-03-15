import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, AlertTriangle, Wallet, ShieldCheck, History } from 'lucide-react';
import { DashboardLayout } from '../DashboardLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { extractErrorMessage, formatDate, truncateAddress } from '@/lib/utils';
import { useMerchantStore } from '@/stores/merchant-store';
import {
  web3SubscriptionsService,
  type AuthorizeWeb3SubscriptionRequest,
  type MandateSigningDataResponse,
  type Web3Interval,
  type Web3Subscription,
} from '@/services/web3-subscriptions.service';
import { SubscriptionInterval } from '@/types/api.types';

type CheckoutState =
  | 'initial'
  | 'wallet_connected'
  | 'approval'
  | 'signing'
  | 'authorizing'
  | 'success';

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<any>;
  on?: (event: string, listener: (...args: any[]) => void) => void;
  removeListener?: (event: string, listener: (...args: any[]) => void) => void;
};

const POLYGON_AMOY_CHAIN_ID = 80002;
const POLYGON_AMOY_CHAIN_HEX = '0x13882';
const POLYGON_AMOY_RPC_URL = 'https://rpc-amoy.polygon.technology';
const SUBSCRIPTION_CONTRACT_POLYGON =
  import.meta.env.VITE_SUBSCRIPTION_CONTRACT_POLYGON ||
  '0xf6dE451A98764a5f08389e72F83AC7594E4e3045';

const TOKEN_DEFAULTS = [
  {
    symbol: 'USDC',
    address:
      import.meta.env.VITE_POLYGON_TESTNET_USDC_ADDRESS ||
      import.meta.env.POLYGON_TESTNET_USDC_ADDRESS ||
      '',
    decimals: 6,
  },
  {
    symbol: 'USDT',
    address:
      import.meta.env.VITE_POLYGON_TESTNET_USDT_ADDRESS ||
      import.meta.env.POLYGON_TESTNET_USDT_ADDRESS ||
      '',
    decimals: 6,
  },
].filter((token) => token.address);

const INTERVAL_SECONDS: Record<Web3Interval, number> = {
  daily: 86400,
  weekly: 604800,
  monthly: 2592000,
  quarterly: 7776000,
  yearly: 31536000,
};

const PLAN_INTERVAL_TO_WEB3: Record<SubscriptionInterval, Web3Interval> = {
  [SubscriptionInterval.DAILY]: 'daily',
  [SubscriptionInterval.WEEKLY]: 'weekly',
  [SubscriptionInterval.MONTHLY]: 'monthly',
  [SubscriptionInterval.QUARTERLY]: 'quarterly',
  [SubscriptionInterval.YEARLY]: 'yearly',
};

interface ParsedRouteParams {
  merchantIdFromQuery: string;
  planIdFromQuery: string;
}

function parseRouteParams(): ParsedRouteParams {
  const hashValue = window.location.hash || '';
  const query = hashValue.includes('?') ? hashValue.split('?')[1] : '';
  const searchParams = new URLSearchParams(query || '');

  return {
    merchantIdFromQuery: searchParams.get('merchant_id') || '',
    planIdFromQuery: searchParams.get('plan_id') || '',
  };
}

function getEthereumProvider(): EthereumProvider | null {
  return (window as any).ethereum || null;
}

function normalizeAddress(address: string): string {
  return address.trim().toLowerCase();
}

function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

function toHexUint256(value: bigint): string {
  const hex = value.toString(16);
  return hex.padStart(64, '0');
}

function toHexAddress(address: string): string {
  return address.toLowerCase().replace(/^0x/, '').padStart(64, '0');
}

function parseUnits(amount: string, decimals: number): bigint {
  const [wholeRaw, fractionRaw = ''] = amount.trim().split('.');
  const whole = wholeRaw || '0';
  const fraction = (fractionRaw + '0'.repeat(decimals)).slice(0, decimals);

  if (!/^\d+$/.test(whole) || !/^\d*$/.test(fractionRaw)) {
    throw new Error('Invalid amount format');
  }

  return BigInt(whole) * BigInt(10 ** decimals) + BigInt(fraction || '0');
}

function formatUnits(value: bigint, decimals: number): string {
  const base = BigInt(10 ** decimals);
  const whole = value / base;
  const fraction = value % base;
  if (fraction === BigInt(0)) {
    return whole.toString();
  }
  const fractionStr = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${whole.toString()}.${fractionStr}`;
}

function extractStatusCode(error: any): number | undefined {
  return error?.response?.status;
}

function getFriendlyError(error: any, fallback: string): string {
  const status = extractStatusCode(error);
  if (status === 400) {
    return extractErrorMessage(error, fallback);
  }
  if (status && status >= 500) {
    return 'Server error. Please retry in a few seconds.';
  }
  return extractErrorMessage(error, fallback);
}

interface PlanSummaryCardProps {
  plan: any | null;
  selectedChain: string;
  selectedTokenSymbol: string;
  selectedTokenAddress: string;
  amountDisplay: string;
  interval: Web3Interval;
}

function PlanSummaryCard({
  plan,
  selectedChain,
  selectedTokenSymbol,
  selectedTokenAddress,
  amountDisplay,
  interval,
}: PlanSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Summary</CardTitle>
        <CardDescription>
          {plan ? 'Plan metadata from backend' : 'Custom recurring subscription setup'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Plan</span>
          <span className="font-medium">{plan?.name || 'Custom Plan'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-medium">{amountDisplay}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Interval</span>
          <span className="font-medium capitalize">{interval}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Chain</span>
          <Badge variant="outline">{selectedChain}</Badge>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Token</span>
          <div className="text-right">
            <div className="font-medium">{selectedTokenSymbol || 'Select token'}</div>
            <div className="text-xs text-muted-foreground">{selectedTokenAddress || '-'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface WalletSectionProps {
  walletAddress: string;
  walletChainId: number | null;
  selectedChainId: number;
  onConnect: () => void;
  onSwitchNetwork: () => void;
  loading: boolean;
}

function WalletSection({
  walletAddress,
  walletChainId,
  selectedChainId,
  onConnect,
  onSwitchNetwork,
  loading,
}: WalletSectionProps) {
  const mismatch = walletAddress && walletChainId !== selectedChainId;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!walletAddress ? (
          <Button onClick={onConnect} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Connect Wallet
          </Button>
        ) : (
          <>
            <div className="text-sm">
              <p className="text-muted-foreground">Connected address</p>
              <p className="font-medium">{truncateAddress(walletAddress, 6)}</p>
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground">Wallet network</p>
              <p className={mismatch ? 'font-medium text-amber-600' : 'font-medium'}>
                Chain ID {walletChainId ?? '-'}
              </p>
            </div>
            {mismatch ? (
              <Button variant="outline" onClick={onSwitchNetwork}>
                Switch to Polygon Amoy (80002)
              </Button>
            ) : (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Network OK</Badge>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface TokenApprovalSectionProps {
  allowanceRaw: bigint;
  requiredRaw: bigint;
  tokenSymbol: string;
  tokenDecimals: number;
  spender: string;
  onRefresh: () => void;
  onApprove: () => void;
  approving: boolean;
  disabled: boolean;
}

function TokenApprovalSection({
  allowanceRaw,
  requiredRaw,
  tokenSymbol,
  tokenDecimals,
  spender,
  onRefresh,
  onApprove,
  approving,
  disabled,
}: TokenApprovalSectionProps) {
  const sufficient = allowanceRaw >= requiredRaw;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Approval</CardTitle>
        <CardDescription>
          Allowance must be equal or greater than the required billing amount.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="rounded-md border p-3 bg-muted/30">
          <p className="text-muted-foreground">Spender</p>
          <p className="font-mono break-all text-xs">{spender}</p>
          <p className="text-muted-foreground mt-2">Required amount</p>
          <p className="font-medium">
            {formatUnits(requiredRaw, tokenDecimals)} {tokenSymbol}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-md border p-3">
          <span>Current allowance</span>
          <span className="font-medium">
            {formatUnits(allowanceRaw, tokenDecimals)} {tokenSymbol}
          </span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onRefresh} disabled={disabled || approving}>
            Refresh Status
          </Button>
          {!sufficient ? (
            <Button onClick={onApprove} disabled={disabled || approving}>
              {approving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Approve Token
            </Button>
          ) : (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Allowance Confirmed</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface MandateSignatureSectionProps {
  onSignAndAuthorize: () => void;
  disabled: boolean;
  state: CheckoutState;
  lockMessage: string;
}

function MandateSignatureSection({
  onSignAndAuthorize,
  disabled,
  state,
  lockMessage,
}: MandateSignatureSectionProps) {
  const isWorking = state === 'signing' || state === 'authorizing';
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Mandate Signature and Authorization
        </CardTitle>
        <CardDescription>
          Fetches EIP-712 typed data from backend, signs it, then submits to authorize endpoint.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {lockMessage ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800 text-sm">
            {lockMessage}
          </div>
        ) : null}

        <Button onClick={onSignAndAuthorize} disabled={disabled || isWorking} className="w-full">
          {isWorking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {state === 'signing'
            ? 'Awaiting Signature'
            : state === 'authorizing'
              ? 'Authorizing Subscription'
              : 'Sign Mandate and Authorize'}
        </Button>
      </CardContent>
    </Card>
  );
}

interface SuccessPanelProps {
  subscription: Web3Subscription;
  onViewSubscriptions: () => void;
  onCancel: () => void;
}

function SuccessPanel({ subscription, onViewSubscriptions, onCancel }: SuccessPanelProps) {
  const id = String(subscription.subscription_id || subscription.id || '-');
  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="text-green-700 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Subscription Created
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subscription ID</span>
          <span className="font-medium">{id}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Next payment</span>
          <span className="font-medium">
            {subscription.next_payment_date ? formatDate(String(subscription.next_payment_date)) : '-'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Chain</span>
          <span className="font-medium">{String(subscription.chain || '-')}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Token</span>
          <span className="font-medium">{String(subscription.token_symbol || '-')}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-medium">{String(subscription.amount ?? '-')}</span>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onViewSubscriptions}>View My Subscriptions</Button>
          <Button variant="destructive" onClick={onCancel}>Cancel Subscription</Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface SubscriptionHistoryPanelProps {
  loading: boolean;
  items: Web3Subscription[];
  onRefresh: () => void;
  onCancel: (subscriptionId: string) => void;
  disableCancel: boolean;
}

function SubscriptionHistoryPanel({
  loading,
  items,
  onRefresh,
  onCancel,
  disableCancel,
}: SubscriptionHistoryPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-4 w-4" />
          My Subscriptions
        </CardTitle>
        <CardDescription>
          Data from GET /web3-subscriptions/user/{'{wallet_address}'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" onClick={onRefresh} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Refresh
        </Button>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No subscriptions found for this wallet.</p>
        ) : (
          <div className="space-y-2">
            {items.map((sub) => {
              const id = String(sub.subscription_id || sub.id || '');
              return (
                <div key={id} className="rounded-md border p-3 text-sm flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{id}</p>
                    <p className="text-muted-foreground capitalize">
                      {String(sub.status || 'unknown')} • {String(sub.chain || '-')} • {String(sub.token_symbol || '-')}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={disableCancel}
                    onClick={() => onCancel(id)}
                  >
                    Cancel
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface Web3SubscriptionCheckoutPageProps {
  planId?: string;
}

export default function Web3SubscriptionCheckoutPage({ planId = '' }: Web3SubscriptionCheckoutPageProps) {
  const { merchantId: merchantIdFromStore } = useMerchantStore();
  const parsed = useMemo(() => parseRouteParams(), []);

  const [checkoutState, setCheckoutState] = useState<CheckoutState>('initial');
  const [isPageLoading, setIsPageLoading] = useState(false);

  const [plan, setPlan] = useState<any | null>(null);
  const [resolvedPlanId, setResolvedPlanId] = useState(planId || parsed.planIdFromQuery);

  const [walletAddress, setWalletAddress] = useState('');
  const [walletChainId, setWalletChainId] = useState<number | null>(null);

  const [selectedChain, setSelectedChain] = useState('polygon');
  const [selectedTokenAddress, setSelectedTokenAddress] = useState(TOKEN_DEFAULTS[0]?.address || '');
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState(TOKEN_DEFAULTS[0]?.symbol || 'USDC');

  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [maxPayments, setMaxPayments] = useState('0');

  const [customAmount, setCustomAmount] = useState('');
  const [customInterval, setCustomInterval] = useState<Web3Interval>('monthly');

  const [allowanceRaw, setAllowanceRaw] = useState<bigint>(BigInt(0));
  const [checkingAllowance, setCheckingAllowance] = useState(false);
  const [approving, setApproving] = useState(false);

  const [signature, setSignature] = useState('');
  const [signingNonce, setSigningNonce] = useState('');
  const [latestSigningNonce, setLatestSigningNonce] = useState('');

  const [authorizeLock, setAuthorizeLock] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');
  const [activeSubscription, setActiveSubscription] = useState<Web3Subscription | null>(null);

  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState<Web3Subscription[]>([]);

  const tokenMeta = useMemo(() => {
    return TOKEN_DEFAULTS.find((t) => normalizeAddress(t.address) === normalizeAddress(selectedTokenAddress));
  }, [selectedTokenAddress]);

  const tokenDecimals = tokenMeta?.decimals ?? 6;

  const effectivePlanId = resolvedPlanId || '';
  const hasPlanFlow = Boolean(effectivePlanId);
  const resolvedMerchantId = parsed.merchantIdFromQuery || merchantIdFromStore || '';

  const resolvedInterval = useMemo<Web3Interval>(() => {
    if (!hasPlanFlow || !plan?.interval) {
      return customInterval;
    }

    const mapped = PLAN_INTERVAL_TO_WEB3[plan.interval as SubscriptionInterval];
    return mapped || customInterval;
  }, [customInterval, hasPlanFlow, plan]);

  const amountDecimal = useMemo(() => {
    if (hasPlanFlow) {
      return Number(plan?.amount || 0);
    }
    return Number(customAmount || 0);
  }, [customAmount, hasPlanFlow, plan]);

  const amountRaw = useMemo(() => {
    if (!Number.isFinite(amountDecimal) || amountDecimal <= 0) {
      return BigInt(0);
    }
    try {
      return parseUnits(String(amountDecimal), tokenDecimals);
    } catch {
      return BigInt(0);
    }
  }, [amountDecimal, tokenDecimals]);

  const mismatchNetwork = walletAddress && walletChainId !== POLYGON_AMOY_CHAIN_ID;
  const allowanceSufficient = allowanceRaw >= amountRaw && amountRaw > BigInt(0);

  const pendingStorageKey = useMemo(
    () => (walletAddress ? `web3-subscription-pending:${walletAddress}` : ''),
    [walletAddress]
  );

  const loadPlan = useCallback(async (targetPlanId: string) => {
    if (!targetPlanId) {
      setPlan(null);
      return;
    }

    setIsPageLoading(true);
    try {
      const data = await web3SubscriptionsService.getPlan(targetPlanId);
      setPlan(data);

      if (Array.isArray(data?.accepted_tokens) && data.accepted_tokens.length > 0) {
        const firstToken = TOKEN_DEFAULTS.find((t) => t.symbol === data.accepted_tokens[0]);
        if (firstToken) {
          setSelectedTokenAddress(firstToken.address);
          setSelectedTokenSymbol(firstToken.symbol);
        }
      }

      if (Array.isArray(data?.accepted_chains) && data.accepted_chains.length > 0) {
        setSelectedChain(String(data.accepted_chains[0]));
      }
    } catch (error: any) {
      toast.error(getFriendlyError(error, 'Failed to load plan metadata'));
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  const readWalletChain = useCallback(async () => {
    const provider = getEthereumProvider();
    if (!provider) return;

    try {
      const chainHex = await provider.request({ method: 'eth_chainId' });
      setWalletChainId(Number.parseInt(chainHex, 16));
    } catch {
      setWalletChainId(null);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    const provider = getEthereumProvider();
    if (!provider) {
      toast.error('No EVM wallet detected. Install MetaMask or a compatible wallet.');
      return;
    }

    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const account = Array.isArray(accounts) ? accounts[0] : '';
      if (!account) {
        toast.error('No wallet account selected');
        return;
      }

      setWalletAddress(account);
      await readWalletChain();
      setCheckoutState('wallet_connected');
    } catch (error: any) {
      toast.error(getFriendlyError(error, 'Wallet connection failed'));
    }
  }, [readWalletChain]);

  const switchToAmoy = useCallback(async () => {
    const provider = getEthereumProvider();
    if (!provider) return;

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_AMOY_CHAIN_HEX }],
      });
      await readWalletChain();
      toast.success('Switched to Polygon Amoy');
    } catch (error: any) {
      if (error?.code === 4902) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: POLYGON_AMOY_CHAIN_HEX,
              chainName: 'Polygon Amoy Testnet',
              nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
              rpcUrls: [POLYGON_AMOY_RPC_URL],
              blockExplorerUrls: ['https://amoy.polygonscan.com/'],
            },
          ],
        });
        await readWalletChain();
      } else {
        toast.error(getFriendlyError(error, 'Failed to switch network'));
      }
    }
  }, [readWalletChain]);

  const fetchAllowance = useCallback(async () => {
    if (!walletAddress || !isValidAddress(selectedTokenAddress)) {
      setAllowanceRaw(BigInt(0));
      return;
    }

    const provider = getEthereumProvider();
    if (!provider) return;

    setCheckingAllowance(true);
    try {
      const data = `0xdd62ed3e${toHexAddress(walletAddress)}${toHexAddress(
        SUBSCRIPTION_CONTRACT_POLYGON
      )}`;

      const result = await provider.request({
        method: 'eth_call',
        params: [
          {
            to: selectedTokenAddress,
            data,
          },
          'latest',
        ],
      });

      const parsedValue = BigInt(result || '0x0');
      setAllowanceRaw(parsedValue);

      if (parsedValue < amountRaw) {
        setCheckoutState('approval');
      } else if (walletAddress) {
        setCheckoutState('wallet_connected');
      }
    } catch (error: any) {
      toast.error(getFriendlyError(error, 'Failed to read token allowance'));
    } finally {
      setCheckingAllowance(false);
    }
  }, [amountRaw, selectedTokenAddress, walletAddress]);

  const approveToken = useCallback(async () => {
    const provider = getEthereumProvider();
    if (!provider || !walletAddress) return;

    setApproving(true);
    try {
      const approveData = `0x095ea7b3${toHexAddress(SUBSCRIPTION_CONTRACT_POLYGON)}${toHexUint256(amountRaw)}`;

      await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: walletAddress,
            to: selectedTokenAddress,
            data: approveData,
          },
        ],
      });

      toast.success('Approve transaction submitted');
      await fetchAllowance();
    } catch (error: any) {
      toast.error(getFriendlyError(error, 'Token approval failed'));
    } finally {
      setApproving(false);
    }
  }, [amountRaw, fetchAllowance, selectedTokenAddress, walletAddress]);

  const validateBeforeSignature = useCallback((): string | null => {
    if (!walletAddress) return 'Wallet is not connected.';
    if (mismatchNetwork) return 'Selected chain does not match wallet network.';
    if (!isValidAddress(selectedTokenAddress)) return 'Token address is invalid.';
    if (!Number.isFinite(amountDecimal) || amountDecimal <= 0) return 'Amount must be greater than 0.';
    if (!resolvedInterval || !INTERVAL_SECONDS[resolvedInterval]) return 'Interval is invalid.';
    if (!hasPlanFlow && !resolvedMerchantId) return 'merchant_id is required when plan_id is absent.';
    if (!allowanceSufficient) return 'Token approval is required before signing.';
    return null;
  }, [
    allowanceSufficient,
    amountDecimal,
    hasPlanFlow,
    mismatchNetwork,
    resolvedInterval,
    resolvedMerchantId,
    selectedTokenAddress,
    walletAddress,
  ]);

  const fetchHistory = useCallback(async () => {
    if (!walletAddress) return;

    setHistoryLoading(true);
    try {
      const data = await web3SubscriptionsService.getUserSubscriptions(walletAddress);
      setHistoryItems(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(getFriendlyError(error, 'Failed to fetch user subscriptions'));
    } finally {
      setHistoryLoading(false);
    }
  }, [walletAddress]);

  const runAuthorizeFlow = useCallback(async () => {
    const provider = getEthereumProvider();
    if (!provider || authorizeLock) return;

    const validationError = validateBeforeSignature();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setAuthorizeLock(true);
    setPendingMessage('Authorization in progress. Please do not close this tab.');

    try {
      setCheckoutState('signing');

      const signingPayload = {
        subscriber: walletAddress,
        merchant_id: resolvedMerchantId,
        token_address: selectedTokenAddress,
        amount: amountRaw.toString(),
        interval: INTERVAL_SECONDS[resolvedInterval],
        max_payments: Number(maxPayments || '0') || 0,
        chain: selectedChain as 'polygon',
        chain_id: POLYGON_AMOY_CHAIN_ID,
      };

      const signingData: MandateSigningDataResponse =
        await web3SubscriptionsService.getMandateSigningData(signingPayload);

      const nonce = String(signingData.nonce || '');
      if (!nonce) {
        throw new Error('Missing nonce in signing-data response');
      }

      setLatestSigningNonce(nonce);

      const typedData = {
        domain: signingData.domain,
        types: signingData.types,
        primaryType: signingData.primaryType,
        message: signingData.message,
      };

      const signed = await provider.request({
        method: 'eth_signTypedData_v4',
        params: [walletAddress, JSON.stringify(typedData)],
      });

      if (!signed) {
        throw new Error('Wallet returned an empty signature');
      }

      setSignature(String(signed));
      setSigningNonce(nonce);

      setCheckoutState('authorizing');

      if (pendingStorageKey) {
        localStorage.setItem(
          pendingStorageKey,
          JSON.stringify({
            started_at: new Date().toISOString(),
            wallet: walletAddress,
            nonce,
          })
        );
      }

      const authorizePayload: AuthorizeWeb3SubscriptionRequest = {
        signature: String(signed),
        subscriber_address: walletAddress,
        nonce,
        plan_id: hasPlanFlow ? effectivePlanId : undefined,
        merchant_id: hasPlanFlow ? undefined : resolvedMerchantId,
        token_address: selectedTokenAddress,
        token_symbol: selectedTokenSymbol,
        amount: hasPlanFlow ? undefined : amountDecimal,
        interval: resolvedInterval,
        chain: selectedChain as 'polygon',
        chain_id: POLYGON_AMOY_CHAIN_ID,
        max_payments: Number(maxPayments || '0') || 0,
        customer_email: customerEmail || undefined,
        customer_name: customerName || undefined,
      };

      if (!authorizePayload.signature) {
        throw new Error('Signature is required before authorize');
      }
      if (!authorizePayload.nonce || nonce !== latestSigningNonce) {
        throw new Error('Signing nonce changed. Please sign again.');
      }
      if (!allowanceSufficient) {
        throw new Error('Allowance check failed. Please approve token again.');
      }

      const authorized = await web3SubscriptionsService.authorize(authorizePayload);
      setActiveSubscription(authorized);
      setCheckoutState('success');
      toast.success('Subscription authorized successfully');
      await fetchHistory();
    } catch (error: any) {
      if (error?.code === 4001 || error?.message?.includes('User rejected')) {
        toast.error('Signature was canceled');
      } else {
        toast.error(getFriendlyError(error, 'Failed to authorize subscription'));
      }

      if (walletAddress) {
        setCheckoutState('wallet_connected');
      }
    } finally {
      setAuthorizeLock(false);
      setPendingMessage('');
      if (pendingStorageKey) {
        localStorage.removeItem(pendingStorageKey);
      }
    }
  }, [
    allowanceSufficient,
    amountDecimal,
    amountRaw,
    authorizeLock,
    customerEmail,
    customerName,
    effectivePlanId,
    fetchHistory,
    hasPlanFlow,
    latestSigningNonce,
    maxPayments,
    pendingStorageKey,
    resolvedInterval,
    resolvedMerchantId,
    selectedChain,
    selectedTokenAddress,
    selectedTokenSymbol,
    validateBeforeSignature,
    walletAddress,
  ]);

  const cancelSubscription = useCallback(
    async (subscriptionId: string) => {
      if (!walletAddress || !subscriptionId) {
        return;
      }

      try {
        await web3SubscriptionsService.cancelUserSubscription({
          subscription_id: subscriptionId,
          subscriber_address: walletAddress,
        });
        toast.success('Subscription canceled');

        if (activeSubscription && String(activeSubscription.subscription_id || activeSubscription.id) === subscriptionId) {
          setActiveSubscription(null);
        }

        await fetchHistory();
      } catch (error: any) {
        toast.error(getFriendlyError(error, 'Cancel request failed'));
      }
    },
    [activeSubscription, fetchHistory, walletAddress]
  );

  useEffect(() => {
    loadPlan(effectivePlanId);
  }, [effectivePlanId, loadPlan]);

  useEffect(() => {
    const provider = getEthereumProvider();
    if (!provider?.on) return;

    const handleAccountsChanged = (accounts: string[]) => {
      const nextAccount = Array.isArray(accounts) ? accounts[0] : '';
      setWalletAddress(nextAccount || '');
      setCheckoutState(nextAccount ? 'wallet_connected' : 'initial');
    };

    const handleChainChanged = (chainHex: string) => {
      setWalletChainId(Number.parseInt(chainHex, 16));
    };

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);

    return () => {
      provider.removeListener?.('accountsChanged', handleAccountsChanged);
      provider.removeListener?.('chainChanged', handleChainChanged);
    };
  }, []);

  useEffect(() => {
    if (walletAddress) {
      fetchAllowance();
      fetchHistory();
    }
  }, [fetchAllowance, fetchHistory, walletAddress]);

  useEffect(() => {
    if (!pendingStorageKey) return;

    const pendingRaw = localStorage.getItem(pendingStorageKey);
    if (!pendingRaw) return;

    setPendingMessage('An earlier authorization attempt is still marked pending.');
  }, [pendingStorageKey]);

  const amountDisplay = useMemo(() => {
    if (!Number.isFinite(amountDecimal) || amountDecimal <= 0) {
      return '-';
    }
    return `${amountDecimal} ${selectedTokenSymbol}`;
  }, [amountDecimal, selectedTokenSymbol]);

  return (
    <DashboardLayout activePage="subscriptions">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet Recurring Billing</h1>
          <p className="text-muted-foreground">
            EIP-712 mandate signing and backend authorization for Web3 subscriptions.
          </p>
        </div>

        <PlanSummaryCard
          plan={plan}
          selectedChain={selectedChain}
          selectedTokenSymbol={selectedTokenSymbol}
          selectedTokenAddress={selectedTokenAddress}
          amountDisplay={amountDisplay}
          interval={resolvedInterval}
        />

        <Card>
          <CardHeader>
            <CardTitle>Subscription Checkout</CardTitle>
            <CardDescription>
              Initial state inputs: wallet, customer details, chain/token, and optional max payments.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer-name">Customer name (optional)</Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Jane Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-email">Customer email (optional)</Label>
                <Input
                  id="customer-email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="jane@example.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Chain</Label>
                <Select value={selectedChain} onValueChange={setSelectedChain}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select chain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="polygon">Polygon (Amoy 80002)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Token</Label>
                <Select
                  value={selectedTokenAddress}
                  onValueChange={(address) => {
                    setSelectedTokenAddress(address);
                    const token = TOKEN_DEFAULTS.find(
                      (entry) => normalizeAddress(entry.address) === normalizeAddress(address)
                    );
                    if (token) {
                      setSelectedTokenSymbol(token.symbol);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    {TOKEN_DEFAULTS.map((token) => (
                      <SelectItem key={token.address} value={token.address}>
                        {token.symbol} - {truncateAddress(token.address, 6)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-payments">Max payments (0 = unlimited)</Label>
                <Input
                  id="max-payments"
                  type="number"
                  min={0}
                  value={maxPayments}
                  onChange={(e) => setMaxPayments(e.target.value)}
                />
              </div>
            </div>

            {!hasPlanFlow ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-amount">Amount</Label>
                  <Input
                    id="custom-amount"
                    type="number"
                    min={0}
                    step="0.000001"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="10"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Interval</Label>
                  <Select value={customInterval} onValueChange={(value) => setCustomInterval(value as Web3Interval)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : null}

            {!hasPlanFlow ? (
              <div className="text-xs text-muted-foreground rounded-md border p-3 bg-muted/30">
                <strong>Custom flow requirement:</strong> merchant_id is required when plan_id is absent.
                <div className="mt-1">Resolved merchant_id: {resolvedMerchantId || 'Not found'}</div>
              </div>
            ) : null}

            {isPageLoading ? (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading plan metadata...
              </div>
            ) : null}
          </CardContent>
        </Card>

        <WalletSection
          walletAddress={walletAddress}
          walletChainId={walletChainId}
          selectedChainId={POLYGON_AMOY_CHAIN_ID}
          onConnect={connectWallet}
          onSwitchNetwork={switchToAmoy}
          loading={checkingAllowance}
        />

        <TokenApprovalSection
          allowanceRaw={allowanceRaw}
          requiredRaw={amountRaw}
          tokenSymbol={selectedTokenSymbol}
          tokenDecimals={tokenDecimals}
          spender={SUBSCRIPTION_CONTRACT_POLYGON}
          onRefresh={fetchAllowance}
          onApprove={approveToken}
          approving={approving}
          disabled={!walletAddress || mismatchNetwork || checkingAllowance}
        />

        {mismatchNetwork ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 text-amber-800 p-3 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Wallet network does not match selected chain. Please switch network before signing.
          </div>
        ) : null}

        <MandateSignatureSection
          onSignAndAuthorize={runAuthorizeFlow}
          disabled={
            !walletAddress ||
            mismatchNetwork ||
            !allowanceSufficient ||
            authorizeLock ||
            !isValidAddress(selectedTokenAddress)
          }
          state={checkoutState}
          lockMessage={pendingMessage}
        />

        {checkoutState === 'success' && activeSubscription ? (
          <SuccessPanel
            subscription={activeSubscription}
            onViewSubscriptions={fetchHistory}
            onCancel={() => {
              const id = String(activeSubscription.subscription_id || activeSubscription.id || '');
              if (id) {
                cancelSubscription(id);
              }
            }}
          />
        ) : null}

        <SubscriptionHistoryPanel
          loading={historyLoading}
          items={historyItems}
          onRefresh={fetchHistory}
          onCancel={cancelSubscription}
          disableCancel={authorizeLock}
        />

        <div className="text-xs text-muted-foreground rounded-md border p-3 bg-muted/30 space-y-1">
          <p>Security notes:</p>
          <p>1. No private keys are stored in frontend.</p>
          <p>2. Typed data is signed only from backend response.</p>
          <p>3. Nonce is fetched fresh before each signature attempt.</p>
          <p>4. Authorize button is locked during submission to prevent double-submit.</p>
        </div>

        <div className="hidden">
          {signature}
          {signingNonce}
          {latestSigningNonce}
        </div>
      </div>
    </DashboardLayout>
  );
}
