import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Loader2, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import { couponsService } from '@/services/coupons.service';
import { ApplyCouponResult } from '@/types/api.types';
import { extractErrorMessage } from '@/lib/utils';

interface CouponInputProps {
  merchantId: string;
  orderAmount: number;
  customerEmail?: string;
  paymentLinkId?: string;
  sessionId?: string; // Payment session ID for 100% discount auto-complete
  onApplied: (result: ApplyCouponResult) => void;
  onRemoved?: () => void;
  onPaymentCompleted?: () => void; // Called when 100% discount payment is completed
  className?: string;
}

export function CouponInput({
  merchantId,
  orderAmount,
  customerEmail,
  paymentLinkId,
  sessionId,
  onApplied,
  onRemoved,
  onPaymentCompleted,
  className = '',
}: CouponInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApplyCouponResult | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [completingPayment, setCompletingPayment] = useState(false);

  const applyCoupon = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const data = await couponsService.applyCoupon({
        merchant_id: merchantId,
        payment_link_id: paymentLinkId,
        coupon_code: code.trim().toUpperCase(),
        order_amount: orderAmount,
        customer_id: customerEmail,
      });

      setResult(data);

      if (data.coupon_valid) {
        onApplied(data);

        // Auto-complete payment if 100% discount and sessionId is provided
        if (data.final_amount === 0 && sessionId) {
          await handleFreePaymentComplete(data.coupon_code!);
        }
      }
    } catch (error: any) {
      // Handle rate limiting (429)
      if (error.response?.status === 429) {
        setResult({
          coupon_valid: false,
          discount_amount: 0,
          final_amount: orderAmount,
          coupon_code: null,
          discount_type: null,
          message: 'Too many attempts. Please wait a moment.',
        });
      } else {
        setResult({
          coupon_valid: false,
          discount_amount: 0,
          final_amount: orderAmount,
          coupon_code: null,
          discount_type: null,
          message: extractErrorMessage(error, 'Network error. Please try again.'),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFreePaymentComplete = async (couponCode: string) => {
    if (!sessionId) return;

    setCompletingPayment(true);
    try {
      const result = await couponsService.completeCouponPayment({
        session_id: sessionId,
        coupon_code: couponCode,
      });

      if (result.status === 'paid') {
        onPaymentCompleted?.();
      }
    } catch (error: any) {
      // Show error to user
      setResult(prev => prev ? {
        ...prev,
        message: extractErrorMessage(error, 'Failed to complete payment. Please try again.'),
      } : null);
    } finally {
      setCompletingPayment(false);
    }
  };

  const removeCoupon = () => {
    setCode('');
    setResult(null);
    setShowInput(false);
    onRemoved?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !result?.coupon_valid && !loading) {
      applyCoupon();
    }
  };

  return (
    <div className={className}>
      {/* Toggle Button - shown when no coupon is applied */}
      {!showInput && !result?.coupon_valid && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInput(true)}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          <Tag className="w-4 h-4 mr-2" />
          Have a promo code?
        </Button>
      )}

      {/* Input Area */}
      {(showInput || result) && !result?.coupon_valid && (
        <Card className="p-4 bg-muted/30 border-dashed">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="Enter promo code"
                maxLength={50}
                disabled={loading}
                className="flex-1 font-mono"
              />
              <Button
                onClick={applyCoupon}
                disabled={!code.trim() || loading}
                size="default"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Apply'
                )}
              </Button>
            </div>

            {/* Error Message */}
            {result && !result.coupon_valid && (
              <div className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{result.message}</span>
              </div>
            )}

            {/* Cancel Button */}
            {!result && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowInput(false);
                  setCode('');
                }}
                className="text-xs text-muted-foreground"
              >
                Cancel
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Applied Coupon Summary */}
      {result?.coupon_valid && (
        <Card className="p-4 bg-green-500/10 border-green-500/30">
          <div className="space-y-3">
            {/* Success Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-700 dark:text-green-300">
                  Coupon Applied
                </span>
              </div>
              {!completingPayment && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeCoupon}
                  className="h-auto p-0 text-muted-foreground hover:text-foreground hover:bg-transparent"
                >
                  Remove
                </Button>
              )}
            </div>

            {/* Coupon Code Badge */}
            <Badge
              variant="secondary"
              className="font-mono text-sm bg-green-600/20 text-green-700 dark:text-green-300"
            >
              {result.coupon_code}
            </Badge>

            {/* 100% Discount - Payment Completing Message */}
            {completingPayment && (
              <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-md">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Completing your free order...
                </span>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="space-y-2 pt-2 border-t border-green-500/20">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order Amount</span>
                <span className="font-medium">
                  ${orderAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600 dark:text-green-400">
                  Discount ({result.discount_type === 'percentage' ? 'Promo' : 'Fixed'})
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  -${result.discount_amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-green-500/20">
                <span>Total</span>
                <span className={result.final_amount === 0 ? 'text-green-600 dark:text-green-400' : 'text-primary'}>
                  ${result.final_amount.toFixed(2)}
                </span>
              </div>
              {result.final_amount === 0 && !completingPayment && (
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                  🎉 Your order is free with this coupon!
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
