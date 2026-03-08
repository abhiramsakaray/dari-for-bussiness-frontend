# Coupon System — Quick Start Examples

## 1. Using the Checkout Coupon Input

### Basic Integration (with 100% Discount Auto-Complete)

```tsx
import { CouponInput } from '@/app/components/checkout/CouponInput';
import { useState } from 'react';

function YourCheckoutPage() {
  const [orderAmount] = useState(100);
  const [finalAmount, setFinalAmount] = useState(100);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [sessionId] = useState('your-payment-session-id'); // From payment session creation
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      
      {/* Your product list, payment details, etc. */}
      
      {/* Coupon Input Component */}
      <CouponInput
        merchantId="your-merchant-uuid-here"
        orderAmount={orderAmount}
        customerEmail="customer@example.com"
        paymentLinkId="optional-payment-link-id"
        sessionId={sessionId} // Required for 100% discount auto-complete
        onApplied={(result) => {
          console.log('Coupon applied:', result);
          setFinalAmount(result.final_amount);
          setAppliedCoupon(result.coupon_code);
          
          // If final_amount is $0, the component will automatically
          // call completeCouponPayment and trigger onPaymentCompleted
        }}
        onRemoved={() => {
          console.log('Coupon removed');
          setFinalAmount(orderAmount);
          setAppliedCoupon(null);
        }}
        onPaymentCompleted={() => {
          // Called when 100% discount payment is completed automatically
          console.log('Free payment completed!');
          setPaymentCompleted(true);
          // Navigate to success page or show confirmation
        }}
        className="mt-4"
      />

      {/* Total Display */}
      {!paymentCompleted && (
        <div className="total-section">
          <h3>Total: ${finalAmount.toFixed(2)}</h3>
          {appliedCoupon && (
            <p className="text-green-600">
              Coupon {appliedCoupon} applied!
            </p>
          )}
          {finalAmount === 0 && (
            <p className="text-green-600 font-bold">
              🎉 Your order is FREE!
            </p>
          )}
        </div>
      )}
      
      {paymentCompleted && (
        <div className="success-message">
          <h2>Payment Completed!</h2>
          <p>Your free order has been processed successfully.</p>
        </div>
      )}
    </div>
  );
}
```

**Key Features:**
- **100% Discount Auto-Complete**: When `final_amount === 0`, the component automatically calls `completeCouponPayment` API without requiring blockchain payment
- **sessionId Required**: Pass the payment session ID to enable auto-complete functionality
- **onPaymentCompleted Callback**: Handle successful free payment completion (e.g., navigate to success page)
- **Real-time UI Updates**: Component shows "Completing your free order..." loading state during API call

---

## 2. Programmatically Applying a Coupon

If you need to apply a coupon without the UI component:

```tsx
import { couponsService } from '@/services/coupons.service';

async function applyCouponProgrammatically() {
  try {
    const result = await couponsService.applyCoupon({
      merchant_id: 'merchant-uuid',
      coupon_code: 'WELCOME10',
      order_amount: 100,
      customer_id: 'customer@example.com',
      payment_link_id: 'optional-link-id',
    });

    if (result.coupon_valid) {
      console.log('Discount:', result.discount_amount);
      console.log('Final amount:', result.final_amount);
      return result;
    } else {
      console.error('Invalid coupon:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Failed to apply coupon:', error);
    return null;
  }
}
```

---

## 3. Completing a 100% Discount Payment

When a coupon provides a 100% discount (final_amount = $0), the payment must be completed via the `completeCouponPayment` API:

```tsx
import { couponsService } from '@/services/coupons.service';

async function completeFreeOrder(sessionId: string, couponCode: string) {
  try {
    const result = await couponsService.completeCouponPayment({
      session_id: sessionId,
      coupon_code: couponCode,
    });

    if (result.status === 'paid') {
      console.log('Free payment completed!');
      console.log('Transaction ID:', result.transaction_id);
      console.log('Amount paid:', result.amount_paid); // Should be 0
      
      // Navigate to success page
      window.location.hash = '#/dashboard/payments';
      return true;
    } else {
      console.error('Payment not completed:', result.message);
      return false;
    }
  } catch (error: any) {
    console.error('Failed to complete free payment:', error.response?.data?.detail);
    return false;
  }
}
```

**When to use:**
- After applying a coupon where `final_amount === 0`
- Automatically handled by `CouponInput` component when `sessionId` prop is provided
- Manual calls useful for custom checkout flows

---

## 4. Creating a Coupon Programmatically

```tsx
import { useCreateCoupon } from '@/hooks/useCoupons';

function MyComponent() {
  const createCoupon = useCreateCoupon();

  const handleCreateCoupon = () => {
    createCoupon.mutate({
      code: 'SUMMER25',
      type: 'percentage',
      discount_value: 25,
      max_discount_amount: 50, // Max $50 off
      min_order_amount: 100,   // Min order $100
      usage_limit_total: 1000, // 1000 total uses
      usage_limit_per_user: 1, // Once per user
      start_date: new Date().toISOString(),
      expiry_date: new Date('2026-09-01').toISOString(),
    });
  };

  return (
    <button onClick={handleCreateCoupon}>
      Create Summer Sale Coupon
    </button>
  );
}
```

---

## 5. Fetching and Displaying Coupons

```tsx
import { useCoupons } from '@/hooks/useCoupons';

function MyCouponsWidget() {
  const { data, isLoading } = useCoupons(1, 10, 'active');

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h3>Active Coupons</h3>
      <ul>
        {data?.promo_codes.map((coupon) => (
          <li key={coupon.id}>
            <strong>{coupon.code}</strong>
            {': '}
            {coupon.type === 'percentage'
              ? `${coupon.discount_value}% off`
              : `$${coupon.discount_value} off`}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 6. Toggling Coupon Status

```tsx
import { useToggleCouponStatus } from '@/hooks/useCoupons';

function ToggleCouponButton({ coupon }) {
  const toggleStatus = useToggleCouponStatus();

  const handleToggle = () => {
    const newStatus = coupon.status === 'active' ? 'inactive' : 'active';
    toggleStatus.mutate({
      couponId: coupon.id,
      status: newStatus,
    });
  };

  return (
    <button onClick={handleToggle} disabled={toggleStatus.isPending}>
      {coupon.status === 'active' ? 'Disable' : 'Enable'} Coupon
    </button>
  );
}
```

---

## 6. Viewing Coupon Analytics

```tsx
import { useCouponAnalytics } from '@/hooks/useCoupons';
import { formatCurrency } from '@/lib/utils';

function CouponStatsCard({ couponId }: { couponId: string }) {
  const { data, isLoading } = useCouponAnalytics(couponId);

  if (isLoading) return <div>Loading analytics...</div>;
  if (!data) return null;

  return (
    <div className="stats-card">
      <h4>{data.code}</h4>
      <div className="stat">
        <label>Total Uses:</label>
        <span>{data.total_used}</span>
      </div>
      <div className="stat">
        <label>Discount Given:</label>
        <span>{formatCurrency(data.total_discount_given, 'USD')}</span>
      </div>
      <div className="stat">
        <label>Revenue Generated:</label>
        <span>{formatCurrency(data.revenue_generated, 'USD')}</span>
      </div>
      <div className="stat">
        <label>Conversion Rate:</label>
        <span>
          {data.conversion_rate !== null
            ? `${data.conversion_rate.toFixed(1)}%`
            : 'N/A'}
        </span>
      </div>
    </div>
  );
}
```

---

## 7. Deleting a Coupon

```tsx
import { useDeleteCoupon } from '@/hooks/useCoupons';

function DeleteCouponButton({ couponId }: { couponId: string }) {
  const deleteCoupon = useDeleteCoupon();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      deleteCoupon.mutate(couponId);
    }
  };

  return (
    <button onClick={handleDelete} disabled={deleteCoupon.isPending}>
      Delete
    </button>
  );
}
```

---

## 8. Custom Validation Before Applying Coupon

```tsx
import { couponsService } from '@/services/coupons.service';

async function applyWithCustomValidation(
  couponCode: string,
  orderAmount: number,
  merchantId: string
) {
  // Your custom pre-checks
  if (orderAmount < 10) {
    return { error: 'Order amount too low for coupons' };
  }

  try {
    const result = await couponsService.applyCoupon({
      merchant_id: merchantId,
      coupon_code: couponCode,
      order_amount: orderAmount,
      customer_id: 'customer@example.com',
    });

    if (result.coupon_valid) {
      // Your custom post-checks
      if (result.discount_amount < 1) {
        return { error: 'Discount too small' };
      }

      return { success: true, result };
    } else {
      return { error: result.message };
    }
  } catch (error) {
    return { error: 'Network error' };
  }
}
```

---

## 9. Showing Available Coupons to Customers

```tsx
import { useCoupons } from '@/hooks/useCoupons';

function AvailableCouponsDisplay() {
  const { data } = useCoupons(1, 5, 'active');
  const now = new Date();

  const validCoupons = data?.promo_codes.filter(
    (c) => new Date(c.start_date) <= now && new Date(c.expiry_date) > now
  ) || [];

  if (validCoupons.length === 0) return null;

  return (
    <div className="available-coupons">
      <h4>Available Discounts:</h4>
      <div className="coupon-list">
        {validCoupons.map((coupon) => (
          <div key={coupon.id} className="coupon-badge">
            <code>{coupon.code}</code>
            <span>
              {coupon.type === 'percentage'
                ? `${coupon.discount_value}% off`
                : `$${coupon.discount_value} off`}
            </span>
            {coupon.min_order_amount > 0 && (
              <small>Min order: ${coupon.min_order_amount}</small>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 10. Creating Bulk Coupons

```tsx
import { useCreateCoupon } from '@/hooks/useCoupons';

function BulkCouponCreator() {
  const createCoupon = useCreateCoupon();

  const createWelcomeCoupons = async () => {
    const coupons = [
      { code: 'WELCOME10', discount_value: 10 },
      { code: 'WELCOME20', discount_value: 20 },
      { code: 'WELCOME50', discount_value: 50 },
    ];

    for (const coupon of coupons) {
      createCoupon.mutate({
        code: coupon.code,
        type: 'percentage',
        discount_value: coupon.discount_value,
        min_order_amount: 50,
        usage_limit_per_user: 1,
        start_date: new Date().toISOString(),
        expiry_date: new Date('2026-12-31').toISOString(),
      });

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  return (
    <button onClick={createWelcomeCoupons}>
      Create Welcome Coupons
    </button>
  );
}
```

---

## Common Use Cases

### **Flash Sale (24-hour coupon)**
```tsx
{
  code: 'FLASH24',
  type: 'percentage',
  discount_value: 30,
  max_discount_amount: 100,
  usage_limit_total: 500,
  start_date: new Date().toISOString(),
  expiry_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
}
```

### **First-time Customer**
```tsx
{
  code: 'FIRST10',
  type: 'percentage',
  discount_value: 10,
  usage_limit_per_user: 1,
  min_order_amount: 0,
  start_date: new Date().toISOString(),
  expiry_date: new Date('2027-12-31').toISOString(),
}
```

### **Free Shipping (fixed discount)**
```tsx
{
  code: 'FREESHIP',
  type: 'fixed',
  discount_value: 5.99, // Shipping cost
  min_order_amount: 25,
  start_date: new Date().toISOString(),
  expiry_date: new Date('2026-12-31').toISOString(),
}
```

### **VIP Customer Exclusive**
```tsx
{
  code: 'VIP25',
  type: 'percentage',
  discount_value: 25,
  usage_limit_total: null, // Unlimited
  usage_limit_per_user: null, // Unlimited per user
  start_date: new Date().toISOString(),
  expiry_date: new Date('2027-12-31').toISOString(),
}
```

---

## Tips & Best Practices

1. **Always validate** coupon results before proceeding to payment
2. **Show clear messaging** to users about why a coupon failed
3. **Log analytics** to track which coupons drive the most conversions
4. **Set expiry dates** to create urgency
5. **Use per-user limits** to prevent abuse
6. **Test rate limiting** handling in checkout flow
7. **Display available coupons** to increase usage
8. **Monitor ROI** via analytics dashboard
9. **Disable unused coupons** instead of deleting them
10. **Use descriptive codes** (e.g., SUMMER25, not XYZ123)

---

## Need Help?

- Check [COUPON_SYSTEM.md](./COUPON_SYSTEM.md) for full documentation
- Review the API integration guide (provided by backend team)
- Test in development environment first
- Monitor analytics for insights

