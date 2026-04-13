import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { BentoLayout } from "./BentoLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import {
  Copy,
  Eye,
  EyeOff,
  Check,
  Wallet2,
  User,
  Key,
  AlertTriangle,
  Globe,
  Mail,
  Building2,
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
      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-1">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, API keys, and payment settings
          </p>
        </div>

        <Tabs defaultValue="account">
          <TabsList className="mb-6">
            <TabsTrigger value="account" className="gap-2">
              <User className="w-4 h-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2">
              <Key className="w-4 h-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="wallets" className="gap-2">
              <Wallet2 className="w-4 h-4" />
              Wallets
            </TabsTrigger>
            <TabsTrigger value="developer" className="gap-2">
              <Key className="w-4 h-4" />
              Developer
            </TabsTrigger>
            <TabsTrigger value="danger" className="gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              Danger Zone
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your business profile and notification settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Loading profile...
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="space-y-6">
                    {/* Business Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
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
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
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

                    <Separator />

                    {/* Webhook URL */}
                    <div className="space-y-1.5">
                      <Label htmlFor="webhook" className="flex items-center gap-2">
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Use these credentials to integrate with your application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Merchant ID */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Merchant ID</Label>
                  <div className="flex gap-2">
                    <code className="flex-1 px-4 py-2.5 bg-muted rounded-md font-mono text-sm truncate">
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
                  <p className="text-xs text-muted-foreground">
                    Your unique merchant identifier
                  </p>
                </div>

                {/* API Key */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">API Key</Label>
                  <div className="flex gap-2">
                    <code className="flex-1 px-4 py-2.5 bg-muted rounded-md font-mono text-sm truncate">
                      {!apiKey
                        ? "Not available"
                        : showApiKey
                        ? apiKey
                        : `${apiKey.substring(0, 10)}${"•".repeat(20)}`}
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
                    Keep this key secret — it grants full API access
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallets Tab */}
          <TabsContent value="wallets">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Blockchain Wallets</CardTitle>
                    <CardDescription>
                      Your auto-generated addresses for receiving crypto payments
                    </CardDescription>
                  </div>
                  <a href="/wallets">
                    <Button variant="outline" size="sm">
                      Full Management →
                    </Button>
                  </a>
                </div>
              </CardHeader>
              <CardContent>
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
                  <div className="space-y-2">
                    {walletsData.wallets.map((wallet) => {
                      const chainInfo = CHAIN_INFO[wallet.chain];
                      const copyId = `wallet_${wallet.id}`;
                      return (
                        <div
                          key={wallet.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-xl w-8 text-center">
                              {chainInfo.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-medium text-sm">
                                  {chainInfo.name}
                                </span>
                                <Badge
                                  variant={wallet.is_active ? "default" : "secondary"}
                                  className={
                                    wallet.is_active
                                      ? "bg-green-500 text-xs py-0"
                                      : "text-xs py-0"
                                  }
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Developer Tab */}
          <TabsContent value="developer">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>API Debugger</CardTitle>
                  <CardDescription>
                    Test API endpoints and diagnose data loading issues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    If you're experiencing issues with data not loading properly, the API Debugger
                    can help identify which endpoints are failing or returning empty data.
                  </p>
                  <Button asChild>
                    <a href="/debug">
                      Open API Debugger →
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Documentation</CardTitle>
                  <CardDescription>
                    Integration guides and API reference
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a
                    href="/dashboard/integrations"
                    className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <p className="font-medium text-sm">Integration Guide</p>
                    <p className="text-xs text-muted-foreground">
                      Learn how to integrate ChainPe SDK into your app
                    </p>
                  </a>
                  <div className="block p-3 border rounded-lg opacity-50 cursor-not-allowed">
                    <p className="font-medium text-sm">API Reference</p>
                    <p className="text-xs text-muted-foreground">Coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger">
            <Card className="border-destructive/40">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  These actions are permanent and cannot be undone
                </CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </BentoLayout>
  );
}
