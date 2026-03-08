import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  QrCode,
  Copy,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { PayerDataForm } from "./checkout/PayerDataForm";

interface CheckoutProps {
  sessionId: string;
}

export function Checkout({ sessionId }: CheckoutProps) {
  const [step, setStep] = useState<"payer-data" | "payment">("payment");
  const [status, setStatus] = useState<"waiting" | "processing" | "success" | "expired">(
    "waiting"
  );
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [sessionData] = useState({
    merchant_name: "Demo Store",
    amount_fiat: "100.00",
    fiat_currency: "USD",
    amount_usdc: "100.00",
    stellar_address: "GCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    session_id: sessionId || "pay_demo123",
  });

  // Countdown timer
  useEffect(() => {
    if (status === "waiting" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setStatus("expired");
    }
  }, [timeLeft, status]);

  // Mock payment polling
  useEffect(() => {
    if (status === "waiting" && sessionId !== "demo_session") {
      // Simulate payment detection after 10 seconds
      const mockPayment = setTimeout(() => {
        setStatus("processing");
        setTimeout(() => {
          setStatus("success");
          // Auto redirect after 3 seconds
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 3000);
        }, 2000);
      }, 10000);

      return () => clearTimeout(mockPayment);
    }
  }, [status, sessionId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleCancel = () => {
    window.location.href = "#/dashboard";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <span className="font-bold text-2xl">ChainPe</span>
        </div>

        {/* Checkout Card */}
        {step === "payer-data" ? (
          <PayerDataForm
            sessionId={sessionId}
            onComplete={() => setStep("payment")}
            onSkip={() => setStep("payment")}
          />
        ) : (
        <Card className="p-8 bg-card border-primary/30">
          {/* Merchant Info */}
          <div className="text-center mb-6 pb-6 border-b border-border">
            <p className="text-sm text-muted-foreground mb-1">Payment to</p>
            <h2 className="text-2xl">{sessionData.merchant_name}</h2>
          </div>

          {/* Amount Display */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">
              ${sessionData.amount_fiat} {sessionData.fiat_currency}
            </div>
            <div className="text-muted-foreground">
              ≈ {sessionData.amount_usdc} USDC
            </div>
          </div>

          {/* Status Display */}
          <div className="mb-8">
            {status === "waiting" && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span>Waiting for payment</span>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {formatTime(timeLeft)}
                  </Badge>
                </div>
              </div>
            )}

            {status === "processing" && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Payment detected, confirming...</span>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-green-500">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Payment successful!</span>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Redirecting you back...
                </p>
              </div>
            )}

            {status === "expired" && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-destructive">
                  <X className="h-5 w-5" />
                  <span>Payment session expired</span>
                </div>
              </div>
            )}
          </div>

          {/* QR Code (shown only when waiting) */}
          {status === "waiting" && (
            <>
              <div className="mb-6">
                <div className="bg-white p-6 mx-auto w-64 h-64 flex items-center justify-center border-2 border-border">
                  <div className="text-center">
                    <QrCode className="h-32 w-32 text-gray-800 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">
                      Scan with Stellar wallet
                    </p>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Or copy the address below
                </p>
              </div>

              {/* Stellar Address */}
              <div className="mb-6">
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Stellar Address
                </Label>
                <div className="flex gap-2">
                  <code className="flex-1 px-4 py-3 bg-secondary rounded-md font-mono text-xs overflow-x-auto">
                    {sessionData.stellar_address}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(sessionData.stellar_address)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="mb-6 p-4 bg-secondary border border-border rounded-md">
                <h4 className="text-sm mb-3">How to pay:</h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li>1. Open your Stellar wallet (Freighter, Lobstr, etc.)</li>
                  <li>2. Scan the QR code or copy the address</li>
                  <li>3. Send exactly {sessionData.amount_usdc} USDC</li>
                  <li>4. Wait for confirmation (2-5 seconds)</li>
                </ol>
              </div>

              {/* Freighter Button */}
              <Button
                variant="outline"
                className="w-full mb-4"
                onClick={() =>
                  toast.info("In production, this would open Freighter wallet")
                }
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Pay with Freighter
              </Button>
            </>
          )}

          {/* Cancel Button (only when waiting) */}
          {status === "waiting" && (
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={handleCancel}
            >
              Cancel Payment
            </Button>
          )}

          {/* Retry Button (only when expired) */}
          {status === "expired" && (
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => window.location.href = "#/dashboard/create"}
            >
              Create New Payment
            </Button>
          )}
        </Card>
        )}

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by <span className="text-primary">ChainPe</span> • Secured by
            Stellar
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Session ID: {sessionData.session_id}
          </p>
        </div>
      </div>
    </div>
  );
}

// Label component inline since it's just used here
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}