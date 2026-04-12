import { useState, useEffect } from "react";
import { BentoLayout } from "./BentoLayout";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Copy, ExternalLink, RefreshCw, Zap, ArrowRight, CheckCircle2, Wallet, Link2, Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useChainPe } from "../../hooks/useChainPe";
import { PaymentSession } from "../../services/chainpe";
import { QRCodeSVG } from 'qrcode.react';

const CURRENCIES = [
  { code: "USD", label: "US Dollar",          symbol: "$",   flag: "🇺🇸" },
  { code: "EUR", label: "Euro",               symbol: "€",   flag: "🇪🇺" },
  { code: "GBP", label: "British Pound",      symbol: "£",   flag: "🇬🇧" },
  { code: "AED", label: "UAE Dirham",         symbol: "د.إ", flag: "🇦🇪" },
  { code: "INR", label: "Indian Rupee",       symbol: "₹",   flag: "🇮🇳" },
  { code: "SGD", label: "Singapore Dollar",   symbol: "S$",  flag: "🇸🇬" },
  { code: "MYR", label: "Malaysian Ringgit",  symbol: "RM",  flag: "🇲🇾" },
  { code: "PKR", label: "Pakistani Rupee",    symbol: "₨",   flag: "🇵🇰" },
  { code: "BDT", label: "Bangladeshi Taka",   symbol: "৳",   flag: "🇧🇩" },
  { code: "CAD", label: "Canadian Dollar",    symbol: "CA$", flag: "🇨🇦" },
  { code: "AUD", label: "Australian Dollar",  symbol: "A$",  flag: "🇦🇺" },
  { code: "JPY", label: "Japanese Yen",       symbol: "¥",   flag: "🇯🇵" },
  { code: "SAR", label: "Saudi Riyal",        symbol: "﷼",   flag: "🇸🇦" },
  { code: "TRY", label: "Turkish Lira",       symbol: "₺",   flag: "🇹🇷" },
];

const STEPS = [
  { icon: Zap,          text: "Set amount & pick currency" },
  { icon: Link2,        text: "Receive a unique checkout URL" },
  { icon: ArrowRight,   text: "Redirect your customer" },
  { icon: Wallet,       text: "Customer pays with Stellar wallet" },
  { icon: Bell,         text: "Webhook fires on completion" },
];

function generateOrderId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const rand = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `ORD-${rand}`;
}

function copy(text: string, label = "Copied!") {
  navigator.clipboard.writeText(text);
  toast.success(label);
}

export function CreatePayment() {
  const [formData, setFormData] = useState({
    amount: "",
    orderId: generateOrderId(),
    currency: "USD",
    successUrl: `${window.location.origin}/#/dashboard?payment=success`,
    cancelUrl: `${window.location.origin}/#/dashboard?payment=cancelled`,
  });
  const [sessionData, setSessionData] = useState<PaymentSession | null>(null);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [ratesLoading, setRatesLoading] = useState(false);
  // Store original fiat amount alongside the session for the success screen
  const [lastFiatInfo, setLastFiatInfo] = useState<{ amount: string; currency: string } | null>(null);
  const { createPayment, loading, error } = useChainPe();

  // Fetch USD-based exchange rates once on mount
  useEffect(() => {
    setRatesLoading(true);
    fetch("https://open.er-api.com/v6/latest/USD")
      .then(r => r.json())
      .then(data => {
        if (data?.rates) setRates(data.rates);
      })
      .catch(() => {/* silently fall back to treating amount as USD */})
      .finally(() => setRatesLoading(false));
  }, []);

  const selectedCurrency = CURRENCIES.find(c => c.code === formData.currency) ?? CURRENCIES[0];
  const set = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  // Convert fiat → USDC (USD ≈ USDC 1:1)
  const fiatToUsdc = (fiatAmount: number, currency: string): number => {
    if (currency === "USD") return fiatAmount;
    const rate = rates[currency]; // rate = how many units of currency per 1 USD
    if (!rate) return fiatAmount; // fallback: treat as USD if rate unknown
    return fiatAmount / rate;
  };

  const usdcPreview = (() => {
    const n = parseFloat(formData.amount);
    if (!formData.amount || isNaN(n)) return null;
    return fiatToUsdc(n, formData.currency);
  })();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const fiatAmount = parseFloat(formData.amount);
    const usdcAmount = fiatToUsdc(fiatAmount, formData.currency);
    try {
      const session = await createPayment({
        amount: parseFloat(usdcAmount.toFixed(6)),
        order_id: formData.orderId || undefined,
        success_url: formData.successUrl,
        cancel_url: formData.cancelUrl,
        metadata: { currency: formData.currency, fiat_amount: fiatAmount },
      });
      if (session) {
        setLastFiatInfo({ amount: formData.amount, currency: formData.currency });
        setSessionData(session);
        toast.success("Payment session created!");
      }
    } catch (err) {
      console.error("Payment creation failed:", err);
    }
  };

  /* ─── SUCCESS STATE ─────────────────────────────────────────── */
  if (sessionData) {
    return (
      <BentoLayout activePage="create">
        <div className="h-[calc(100vh-7rem)] flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between shrink-0">
            <div>
              <h1 className="text-2xl font-semibold">Payment Created</h1>
              <p className="text-sm text-muted-foreground">Share the checkout link with your customer</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSessionData(null)}>
              + New Payment
            </Button>
          </div>

          <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-4 min-h-0">
            {/* Status + Amount */}
            <Card className="bg-primary/5 border-primary/30 p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-primary text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" />
                <span className="capitalize">{sessionData.status}</span>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                {lastFiatInfo && lastFiatInfo.currency !== "USD" ? (
                  <>
                    <p className="text-base text-muted-foreground font-medium">
                      {CURRENCIES.find(c => c.code === lastFiatInfo.currency)?.symbol}{parseFloat(lastFiatInfo.amount).toLocaleString()} {lastFiatInfo.currency}
                    </p>
                    <p className="text-5xl font-bold tracking-tight mt-1">${parseFloat(sessionData.amount_usdc).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground mt-1">USDC (converted)</p>
                  </>
                ) : (
                  <>
                    <p className="text-5xl font-bold tracking-tight">${parseFloat(sessionData.amount_usdc).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground mt-1">USDC</p>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Expires&nbsp;{new Date(sessionData.expires_at).toLocaleString()}
              </p>
            </Card>

            {/* Session ID */}
            <Card className="bg-card border-border p-6 flex flex-col gap-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Session ID</p>
              <code className="flex-1 text-sm font-mono break-all leading-relaxed text-foreground">
                {sessionData.id || sessionData.session_id}
              </code>
              <Button size="sm" variant="outline" className="gap-2"
                onClick={() => copy(sessionData.id || sessionData.session_id || "", "Session ID copied")}>
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
            </Card>

            {/* QR — spans both rows */}
            <Card className="bg-card border-border p-6 flex flex-col items-center justify-between gap-4 row-span-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium self-start">Scan to Pay</p>
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <QRCodeSVG value={sessionData.checkout_url} size={180} level="H" includeMargin />
              </div>
              <p className="text-xs text-center text-muted-foreground">Scan with any Stellar-compatible wallet</p>
            </Card>

            {/* Checkout URL */}
            <Card className="bg-card border-border p-6 flex flex-col gap-3 col-span-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Checkout URL</p>
              <code className="flex-1 text-sm font-mono text-primary break-all leading-relaxed">
                {sessionData.checkout_url}
              </code>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-2"
                  onClick={() => copy(sessionData.checkout_url, "URL copied")}>
                  <Copy className="h-3.5 w-3.5" /> Copy URL
                </Button>
                <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90 gap-2"
                  onClick={() => window.open(sessionData.checkout_url, '_blank')}>
                  <ExternalLink className="h-3.5 w-3.5" /> Open Page
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </BentoLayout>
    );
  }

  /* ─── CREATE FORM ────────────────────────────────────────────── */
  return (
    <BentoLayout activePage="create">
      <form onSubmit={handleCreate} className="h-[calc(100vh-7rem)] flex flex-col gap-4 overflow-hidden">
        <div className="shrink-0">
          <h1 className="text-2xl font-semibold">Create Payment</h1>
          <p className="text-sm text-muted-foreground">Generate a new payment session for your customer</p>
        </div>

        {error && (
          <div className="shrink-0 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Bento grid */}
        <div className="flex-1 grid grid-cols-3 grid-rows-3 gap-4 min-h-0">

          {/* ── AMOUNT + CURRENCY ── col-span-2 row 1 */}
          <Card className="col-span-2 bg-card border-border p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Amount & Currency</p>
              <div className="flex items-center gap-2">
                {ratesLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                <span className="text-xl" aria-hidden>{selectedCurrency.flag}</span>
              </div>
            </div>
            <div className="flex gap-3 items-center flex-1">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground pointer-events-none select-none">
                  {selectedCurrency.symbol}
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => set('amount', e.target.value)}
                  required
                  className="pl-10 h-14 bg-input-background text-2xl font-light tracking-tight"
                />
              </div>
              <Select value={formData.currency} onValueChange={(v) => set('currency', v)}>
                <SelectTrigger className="w-52 bg-input-background h-14 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span className="font-mono font-semibold">{c.code}</span>
                        <span className="text-muted-foreground text-xs">{c.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Live USDC conversion preview */}
            {usdcPreview !== null && formData.currency !== "USD" && (
              <div className="flex items-center gap-2 px-1">
                <span className="text-sm text-muted-foreground">=</span>
                <span className="text-sm font-semibold text-primary">
                  ${usdcPreview.toFixed(4)} USDC
                </span>
                {!rates[formData.currency] && (
                  <span className="text-xs text-yellow-500">(rate unavailable — treated as USD)</span>
                )}
              </div>
            )}
          </Card>

          {/* ── HOW IT WORKS ── col 3, row-span-3 */}
          <Card className="col-start-3 row-span-3 bg-secondary/40 border-border p-6 flex flex-col gap-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">How it works</p>
            <div className="flex-1 flex flex-col justify-center gap-5">
              {STEPS.map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-snug pt-0.5">{text}</p>
                </div>
              ))}
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 h-12 text-base gap-2"
              disabled={loading}
            >
              {loading ? "Creating..." : <>Create Session <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </Card>

          {/* ── ORDER ID ── col-span-2 row 2 */}
          <Card className="col-span-2 bg-card border-border p-6 flex flex-col gap-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Order ID <span className="normal-case">(optional)</span></p>
            <div className="flex gap-2 flex-1 items-center">
              <Input
                id="orderId"
                placeholder="ORD-XXXXXXXX"
                value={formData.orderId}
                onChange={(e) => set('orderId', e.target.value)}
                className="bg-input-background font-mono flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                title="Regenerate Order ID"
                className="shrink-0 h-10 w-10"
                onClick={() => set('orderId', generateOrderId())}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Auto-generated — click ↻ to regenerate, or type your own</p>
          </Card>

          {/* ── SUCCESS URL ── col 1 row 3 */}
          <Card className="bg-card border-border p-5 flex flex-col gap-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Success URL</p>
            <Input
              id="successUrl"
              type="url"
              value={formData.successUrl}
              onChange={(e) => set('successUrl', e.target.value)}
              required
              className="bg-input-background text-sm flex-1"
              placeholder="https://mystore.com/success"
            />
            <p className="text-xs text-muted-foreground">Redirect after payment completes</p>
          </Card>

          {/* ── CANCEL URL ── col 2 row 3 */}
          <Card className="bg-card border-border p-5 flex flex-col gap-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Cancel URL</p>
            <Input
              id="cancelUrl"
              type="url"
              value={formData.cancelUrl}
              onChange={(e) => set('cancelUrl', e.target.value)}
              required
              className="bg-input-background text-sm flex-1"
              placeholder="https://mystore.com/cancel"
            />
            <p className="text-xs text-muted-foreground">Redirect if payment is abandoned</p>
          </Card>

        </div>
      </form>
    </BentoLayout>
  );
}

