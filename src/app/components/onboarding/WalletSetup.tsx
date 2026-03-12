import React, { useState } from 'react';
import { onboardingService } from '../../../services/onboarding.service';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { Wallet, CheckCircle, Loader2 } from 'lucide-react';
import { extractErrorMessage } from '../../../lib/utils';

interface WalletSetupProps {
  onComplete: () => void;
}

const AVAILABLE_CHAINS = [
  { id: 'stellar', name: 'Stellar', description: 'Fast & low-cost payments' },
  { id: 'ethereum', name: 'Ethereum', description: 'Most widely used blockchain' },
  { id: 'polygon', name: 'Polygon', description: 'Ethereum L2, lower fees' },
  { id: 'base', name: 'Base', description: 'Coinbase L2 solution' },
  { id: 'tron', name: 'Tron', description: 'High throughput network' },
];

const AVAILABLE_TOKENS = [
  { id: 'USDC', name: 'USD Coin', description: 'Circle stablecoin' },
  { id: 'USDT', name: 'Tether', description: 'Most liquid stablecoin' },
  { id: 'PYUSD', name: 'PayPal USD', description: 'PayPal stablecoin' },
];

export function WalletSetup({ onComplete }: WalletSetupProps) {
  const [loading, setLoading] = useState(false);
  const [selectedChains, setSelectedChains] = useState<string[]>([
    'stellar',
    'ethereum',
    'polygon',
    'base',
    'tron',
  ]);
  const [selectedTokens, setSelectedTokens] = useState<string[]>(['USDC', 'USDT', 'PYUSD']);

  const toggleChain = (chainId: string) => {
    setSelectedChains((prev) =>
      prev.includes(chainId) ? prev.filter((c) => c !== chainId) : [...prev, chainId]
    );
  };

  const toggleToken = (tokenId: string) => {
    setSelectedTokens((prev) =>
      prev.includes(tokenId) ? prev.filter((t) => t !== tokenId) : [...prev, tokenId]
    );
  };

  const handleComplete = async () => {
    if (selectedChains.length === 0) {
      toast.error('Please select at least one blockchain');
      return;
    }
    if (selectedTokens.length === 0) {
      toast.error('Please select at least one token');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        chains: selectedChains,
        tokens: selectedTokens,
        auto_generate: true,
      };
      console.log('Completing onboarding with payload:', payload);

      const result = await onboardingService.completeOnboarding(payload);

      // Update API key if new one was generated
      if (result.api_key) {
        localStorage.setItem('api_key', result.api_key);
      }

      toast.success('🎉 Onboarding completed successfully!');

      // Show wallet addresses
      if (result.wallets && result.wallets.length > 0) {
        console.log('Generated wallets:', result.wallets);
      }

      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error: any) {
      console.error('Wallet setup error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error object:', JSON.stringify(error.response, null, 2));

      toast.error(extractErrorMessage(error, 'Failed to complete onboarding'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-3xl">Set up your payment wallets</CardTitle>
          <CardDescription>
            We'll automatically generate secure blockchain wallets for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Blockchain Selection */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Select Blockchains</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AVAILABLE_CHAINS.map((chain) => (
                <div
                  key={chain.id}
                  className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${selectedChains.includes(chain.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                    }`}
                  onClick={() => toggleChain(chain.id)}
                >
                  <Checkbox
                    checked={selectedChains.includes(chain.id)}
                    onCheckedChange={() => toggleChain(chain.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{chain.name}</div>
                    <div className="text-sm text-muted-foreground">{chain.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Token Selection */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Accept Tokens</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {AVAILABLE_TOKENS.map((token) => (
                <div
                  key={token.id}
                  className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${selectedTokens.includes(token.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                    }`}
                  onClick={() => toggleToken(token.id)}
                >
                  <Checkbox
                    checked={selectedTokens.includes(token.id)}
                    onCheckedChange={() => toggleToken(token.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{token.name}</div>
                    <div className="text-sm text-muted-foreground">{token.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="flex gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-1">Auto-generated wallets</p>
                <p>
                  We'll create secure wallet addresses for each blockchain. You can always add more
                  chains and tokens later from your dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Complete Button */}
          <div className="pt-4">
            <Button
              onClick={handleComplete}
              className="w-full"
              size="lg"
              disabled={loading || selectedChains.length === 0 || selectedTokens.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Creating wallets...
                </>
              ) : (
                <>
                  Complete Setup
                  <CheckCircle className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
