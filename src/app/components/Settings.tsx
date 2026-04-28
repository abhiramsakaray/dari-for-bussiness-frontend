import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { BentoLayout } from "./BentoLayout";
import { 
  BentoGrid, 
  BentoCard,
  BentoCardHeader,
  BentoCardTitle,
  BentoCardSubtitle,
  BentoCardContent 
} from "./ui/bento-grid";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import {
  Copy,
  Eye,
  EyeOff,
  Check,
  Wallet2,
  Key,
  AlertTriangle,
  Globe,
  Mail,
  Building2,
  Code,
  FileText,
} from "lucide-react";
import { useMerchantProfile } from "../../hooks/useMerchantProfile";
import { useWallets } from "../../hooks/useWallets";
import { CHAIN_INFO } from "../../services/wallets.service";

export function Settings() {
  const { profile, isLoading, updateProfile } = useMerchantProfile();
  const { data: walletsData, isLoading: walletsLoading } = useWallets();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    webhookUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        webhookUrl: profile.webhook_url || "",
      });
    }
  }, [profile]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        webhook_url: formData.webhookUrl || undefined,
      });
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const apiKey = localStorage.getItem("api_key");
  const CopyIcon = ({ id }: { id: string }) =>
    copiedId === id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />;

  return (
    <BentoLayout activePage="settings">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Manage your account, API keys, and payment settings
          </p>
        </div>

        {/* Account Information */}
        <BentoGrid>
          <BentoCard span={8}>
            <BentoCardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <BentoCardTitle>Account Information</BentoCardTitle>
              </div>
              <BentoCardSubtitle>Your business profile and notification settings</BentoCardSubtitle>
            </BentoCardHeader>
            <BentoCardContent>
              {isLoading ? (
                <div className="py-8 text-center text-muted-foreground">
                  Loading profile...
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-5">
                  {/* Business Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Business Name
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="name"
                        value={formData.name}
                        disabled
                        className="bg-muted font-medium"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(formData.name, "name")}
                        disabled={!formData.name}
                      >
                        <CopyIcon id="name" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Contact support to change your business name
                    </p>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Used for login and notifications
                    </p>
                  </div>

                  {/* Webhook URL */}
                  <div className="space-y-2">
                    <Label htmlFor="webhook" className="text-sm font-medium flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      Webhook URL
                    </Label>
                    <Input
                      id="webhook"
                      type="url"
                      value={formData.webhookUrl}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, webhookUrl: e.target.value }))
                      }
                      placeholder="https://yourstore.com/api/webhook"
                    />
                    <p className="text-xs text-muted-foreground">
                      Receive real-time payment status notifications at this URL
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              )}
            </BentoCardContent>
          </BentoCard>

          {/* API Keys */}
          <BentoCard span={4}>
            <BentoCardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <BentoCardTitle>API Keys</BentoCardTitle>
              </div>
              <BentoCardSubtitle>Your authentication credentials</BentoCardSubtitle>
            </BentoCardHeader>
            <BentoCardContent className="space-y-5">
              {/* Merchant ID */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Merchant ID</Label>
                <div className="flex gap-2">
                  <code className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-xs truncate">
                    {profile?.id || "Loading..."}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      profile?.id && copyToClipboard(profile.id, "merchant_id")
                    }
                    disabled={!profile?.id}
                  >
                    <CopyIcon id="merchant_id" />
                  </Button>
                </div>
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">API Key</Label>
                <div className="flex gap-2">
                  <code className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-xs truncate">
                    {!apiKey
                      ? "Not available"
                      : showApiKey
                      ? apiKey
                      : `${apiKey.substring(0, 8)}${"•".repeat(16)}`}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setShowApiKey(!showApiKey)}
                    disabled={!apiKey}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => apiKey && copyToClipboard(apiKey, "api_key")}
                    disabled={!apiKey}
                  >
                    <CopyIcon id="api_key" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Keep this secret — grants full API access
                </p>
              </div>
            </BentoCardContent>
          </BentoCard>
        </BentoGrid>

        {/* Wallets */}
        <BentoGrid>
          <BentoCard span={12}>
            <BentoCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Wallet2 className="h-5 w-5 text-primary" />
                    <BentoCardTitle>Blockchain Wallets</BentoCardTitle>
                  </div>
                  <BentoCardSubtitle>Your auto-generated addresses for receiving crypto payments</BentoCardSubtitle>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard/wallets'}>
                  Full Management →
                </Button>
              </div>
            </BentoCardHeader>
            <BentoCardContent>
              {walletsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : !walletsData || walletsData.wallets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Wallet2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">No wallets configured</p>
                  <p className="text-sm mt-1">
                    Complete onboarding to generate wallet addresses
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {walletsData.wallets.map((wallet) => {
                    const chainInfo = CHAIN_INFO[wallet.chain];
                    if (!chainInfo) return null;
                    const copyId = `wallet_${wallet.id}`;
                    return (
                      <div
                        key={wallet.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {chainInfo.name}
                              </span>
                              <Badge
                                variant={wallet.is_active ? "success" : "default"}
                                className="text-xs py-0"
                              >
                                {wallet.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <code className="text-xs text-muted-foreground font-mono truncate block">
                              {wallet.wallet_address}
                            </code>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-2 shrink-0"
                          onClick={() => copyToClipboard(wallet.wallet_address, copyId)}
                        >
                          {copiedId === copyId ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </BentoCardContent>
          </BentoCard>
        </BentoGrid>

        {/* Developer Tools */}
        <BentoGrid>
          <BentoCard span={6}>
            <BentoCardHeader>
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                <BentoCardTitle>API Debugger</BentoCardTitle>
              </div>
              <BentoCardSubtitle>Test endpoints and diagnose issues</BentoCardSubtitle>
            </BentoCardHeader>
            <BentoCardContent>
              <p className="text-sm text-muted-foreground mb-4">
                If you're experiencing issues with data not loading properly, the API Debugger
                can help identify which endpoints are failing or returning empty data.
              </p>
              <Button onClick={() => window.location.href = '/dashboard/debug'}>
                Open API Debugger →
              </Button>
            </BentoCardContent>
          </BentoCard>

          <BentoCard span={6}>
            <BentoCardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <BentoCardTitle>Documentation</BentoCardTitle>
              </div>
              <BentoCardSubtitle>Integration guides and API reference</BentoCardSubtitle>
            </BentoCardHeader>
            <BentoCardContent className="space-y-3">
              <button
                onClick={() => window.location.href = '/developer/guide'}
                className="w-full text-left p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <p className="font-medium text-sm">Development Guide</p>
                <p className="text-xs text-muted-foreground">
                  Complete integration guide with code examples
                </p>
              </button>
              <button
                onClick={() => window.location.href = '/developer/ai'}
                className="w-full text-left p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <p className="font-medium text-sm">Code with AI</p>
                <p className="text-xs text-muted-foreground">
                  One-prompt integration with AI coding assistants
                </p>
              </button>
            </BentoCardContent>
          </BentoCard>
        </BentoGrid>

        {/* Danger Zone */}
        <BentoGrid>
          <BentoCard span={12} className="border-destructive/40">
            <BentoCardHeader>
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <BentoCardTitle className="text-destructive">Danger Zone</BentoCardTitle>
              </div>
              <BentoCardSubtitle>These actions are permanent and cannot be undone</BentoCardSubtitle>
            </BentoCardHeader>
            <BentoCardContent>
              <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg bg-destructive/5">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </BentoCardContent>
          </BentoCard>
        </BentoGrid>
      </div>
    </BentoLayout>
  );
}
