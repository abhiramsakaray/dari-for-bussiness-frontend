import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWalletDashboard } from '../../hooks/useWallets';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Copy, Check, Wallet, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { CHAIN_INFO, type ChainType } from '../../services/wallets.service';
import { BentoLayout } from "./BentoLayout";

export default function Wallets() {
  const { data: dashboard, isLoading, error, refetch, isFetching } = useWalletDashboard();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  if (isLoading) {
    return (
      <BentoLayout activePage="wallets">
        <div className="container mx-auto p-6 animate-pulse">
            <div className="h-40 bg-muted rounded-lg mb-8"></div>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-lg"></div>)}
             </div>
        </div>
      </BentoLayout>
    );
  }

  if (error || !dashboard) {
    return (
       <BentoLayout activePage="wallets">
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Wallets & Balances</h1>
            <div className="p-8 text-center border rounded-lg bg-red-50 text-red-600">
                Failed to load wallet dashboard. Please try again later.
            </div>
        </div>
       </BentoLayout>
    );
  }

  return (
    <BentoLayout activePage="wallets">
      <div className="container mx-auto space-y-8">
        <div className="flex items-start justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Wallets & Balances</h1>
                <p className="text-muted-foreground">Manage your funds and wallet addresses across all chains.</p>
            </div>
            <div className="flex items-center gap-2">
                {dashboard.balance_source === 'onchain' ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <span className="mr-1">●</span> Live
                    </Badge>
                ) : (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <span className="mr-1">⚠</span> Cached
                    </Badge>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isFetching}
                >
                    <RefreshCw className={`w-4 h-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>
        </div>

        {/* Total Balance Card */}
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col mb-4">
                    <span className="text-4xl font-bold text-primary">
                        {dashboard.total_balance_local.display_local}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                        ≈ ${dashboard.total_balance_usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
                        <Badge variant="outline" className="text-xs font-normal">
                             1 USD = {dashboard.exchange_rate} {dashboard.local_currency}
                        </Badge>
                    </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-background/50 rounded-lg border">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Available (Net)</div>
                        <div className="font-semibold text-green-600 text-lg">
                             {dashboard.net_available_local.display_local}
                        </div>
                    </div>
                    <div className="p-3 bg-background/50 rounded-lg border">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Pending Withdrawals</div>
                        <div className="font-semibold text-amber-600 text-lg">
                             {dashboard.pending_withdrawals_local.display_local}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Coin Breakdown */}
        <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5" /> Assets Breakdown
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
                {dashboard.coins.map((coin) => (
                    <Card key={coin.token}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-bold text-muted-foreground">{coin.token}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {coin.balance_local?.display_local ?? '₹0.00'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {coin.balance_usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {coin.token}
                            </p>

                            {/* Per-chain breakdown */}
                            {coin.chain_balances && coin.chain_balances.filter(cb => cb.balance > 0).length > 0 && (
                                <div className="mt-3 pt-3 border-t space-y-2">
                                    {coin.chain_balances
                                        .filter(cb => cb.balance > 0)
                                        .map(cb => {
                                            const chainInfo = CHAIN_INFO[cb.chain as ChainType];
                                            if (!chainInfo) {
                                                console.warn(`Unknown chain: ${cb.chain}`);
                                                return null;
                                            }
                                            return (
                                                <div key={`${cb.chain}-${cb.token}`} className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-muted-foreground">{chainInfo.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{cb.balance.toFixed(2)} {cb.token}</span>
                                                        <span className="text-muted-foreground font-mono" title={cb.wallet_address}>
                                                            {cb.wallet_address.slice(0, 6)}…{cb.wallet_address.slice(-4)}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>

        {/* Wallets List */}
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <ArrowDownLeft className="w-5 h-5" /> Deposit Addresses
                </h2>
                <Button variant="outline" size="sm" asChild>
                    <Link to="/dashboard/settings">Manage Wallets</Link>
                </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
                {dashboard.wallets.map((wallet) => {
                    const chainInfo = CHAIN_INFO[wallet.chain];
                    const isCopied = copiedId === wallet.chain;
                    
                    if (!wallet.is_active || !chainInfo) return null;

                    return (
                        <Card key={wallet.chain} className="overflow-hidden">
                            <CardHeader className="bg-muted/30 py-3">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <CardTitle className="text-sm font-medium">{chainInfo.name}</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md border font-mono text-sm relative group">
                                    <span className="truncate flex-1 text-xs sm:text-sm">
                                        {wallet.wallet_address}
                                    </span>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 shrink-0 hover:bg-background"
                                        onClick={() => copyToClipboard(wallet.wallet_address, wallet.chain)}
                                    >
                                        {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Send only supported tokens ({chainInfo.tokens?.join(', ') || 'USDC, USDT'}) on {chainInfo.name} network.
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
      </div>
    </BentoLayout>
  );
}
