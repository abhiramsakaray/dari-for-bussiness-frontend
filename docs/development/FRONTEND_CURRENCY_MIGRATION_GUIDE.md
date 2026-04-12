# Frontend Currency Migration Guide

## Quick Reference: What to Change

### Current Issues in Frontend

1. **Multiple currency fields**: `amount_fiat`, `amount_usdc`, `amount_local`
2. **Frontend formatting**: Using `formatCurrency()` and `Intl.NumberFormat`
3. **Hardcoded symbols**: `$`, `₹` in components
4. **Inconsistent display**: Some pages show USD, some show local currency
5. **Manual conversions**: Frontend calculates exchange rates

---

## New API Structure (After Backend Changes)

### MonetaryAmount Object
```typescript
interface MonetaryAmount {
  amount: number;           // Amount in merchant's currency
  currency: string;         // "INR", "USD", "EUR", etc.
  symbol: string;           // "₹", "$", "€", etc.
  formatted: string;        // "₹1,234.56" (pre-formatted by backend)
  amount_usd?: number;      // USD equivalent (optional)
  formatted_usd?: string;   // "$12.34" (optional)
  amount_crypto?: number;   // Crypto amount (optional)
  crypto_token?: string;    // "USDC", "USDT" (optional)
  crypto_chain?: string;    // "polygon", "ethereum" (optional)
}
```

---

## Component Migration Examples

### Example 1: Analytics Dashboard

#### Before
```tsx
// src/app/components/analytics/AnalyticsDashboard.tsx
const totalVolume = overview?.payments?.total_volume ?? 
                    overview?.payments?.total_volume_usd ?? 0;
const analyticsCurrency = overview?.currency || 'USD';

<MetricCard
  title="Total Volume"
  value={formatCurrency(totalVolume, analyticsCurrency)}
  change={overview?.volume_change_pct}
/>
```

#### After
```tsx
// src/app/components/analytics/AnalyticsDashboard.tsx
<MetricCard
  title="Total Volume"
  value={overview?.payments?.total_volume?.formatted || '$0.00'}
  valueUsd={overview?.payments?.total_volume?.formatted_usd}
  change={overview?.volume_change_pct}
/>

// Update MetricCard to show USD reference
function MetricCard({ title, value, valueUsd, change }) {
  return (
    <Card>
      <CardContent>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {valueUsd && (
          <p className="text-xs text-muted-foreground">{valueUsd}</p>
        )}
        {/* ... change indicator ... */}
      </CardContent>
    </Card>
  );
}
```

### Example 2: Payment Detail

#### Before
```tsx
// src/app/components/PaymentDetail.tsx
const amountUsd = payment
  ? (typeof payment.amount_fiat === 'number'
    ? payment.amount_fiat
    : Number((payment as any).amount ?? payment.amount_usdc ?? 0))
  : 0;
const amountDual = payment 
  ? displayDualAmount(amountUsd, payment.amount_fiat_local) 
  : { primary: formatCurrency(0, currency), secondary: null };

<div>
  <p className="text-3xl font-bold">{amountDual.primary}</p>
  {amountDual.secondary && (
    <p className="text-sm text-muted-foreground">{amountDual.secondary}</p>
  )}
</div>
```

#### After
```tsx
// src/app/components/PaymentDetail.tsx
<div>
  <p className="text-3xl font-bold">{payment.amount.formatted}</p>
  {payment.amount.formatted_usd && (
    <p className="text-sm text-muted-foreground">
      {payment.amount.formatted_usd}
    </p>
  )}
</div>

// With discount
{payment.discount && (
  <div>
    <p className="text-sm text-muted-foreground line-through">
      {payment.original_amount.formatted}
    </p>
    <p className="text-sm text-green-600">
      -{payment.discount.amount.formatted}
    </p>
    <p className="text-3xl font-bold">
      {payment.final_amount.formatted}
    </p>
  </div>
)}
```

### Example 3: Payments List

#### Before
```tsx
// src/app/components/PaymentsList.tsx
<td>
  {displayAmount(
    payment.amount_fiat || 0,
    payment.amount_fiat_local
  )}
</td>
```

#### After
```tsx
// src/app/components/PaymentsList.tsx
<td>
  <div>
    <span>{payment.amount.formatted}</span>
    {payment.amount.formatted_usd && (
      <span className="text-xs text-muted-foreground ml-2">
        {payment.amount.formatted_usd}
      </span>
    )}
  </div>
</td>
```

### Example 4: Dashboard Overview

#### Before
```tsx
// src/app/components/Dashboard.tsx
const totalRevenue = overview?.payments?.total_volume ?? 0;
const currency = useMerchantCurrency();

<Card>
  <CardTitle>Total Revenue</CardTitle>
  <CardContent>
    {formatCurrency(totalRevenue, currency.currency)}
  </CardContent>
</Card>
```

#### After
```tsx
// src/app/components/Dashboard.tsx
<Card>
  <CardTitle>Total Revenue</CardTitle>
  <CardContent>
    <div className="text-3xl font-bold">
      {overview?.payments?.total_volume?.formatted || '$0.00'}
    </div>
    {overview?.payments?.total_volume?.formatted_usd && (
      <div className="text-sm text-muted-foreground">
        {overview?.payments?.total_volume?.formatted_usd}
      </div>
    )}
  </CardContent>
</Card>
```

### Example 5: Wallet Dashboard

#### Before
```tsx
// src/app/components/Wallets.tsx
const totalBalance = dashboard?.total_balance_usdc ?? 0;
const localBalance = dashboard?.total_balance_local;

<div>
  {localBalance ? (
    <>
      <p>{localBalance.display_local}</p>
      <p className="text-sm">{formatCurrency(totalBalance, 'USD')}</p>
    </>
  ) : (
    <p>{formatCurrency(totalBalance, 'USD')}</p>
  )}
</div>
```

#### After
```tsx
// src/app/components/Wallets.tsx
<div>
  <p className="text-3xl font-bold">
    {dashboard?.total_balance?.formatted || '$0.00'}
  </p>
  {dashboard?.total_balance?.formatted_usd && (
    <p className="text-sm text-muted-foreground">
      {dashboard?.total_balance?.formatted_usd}
    </p>
  )}
</div>
```

---

## Files to Update

### 1. Type Definitions
**File**: `src/types/api.types.ts`

```typescript
// Add new interface
export interface MonetaryAmount {
  amount: number;
  currency: string;
  symbol: string;
  formatted: string;
  amount_usd?: number;
  formatted_usd?: string;
  amount_crypto?: number;
  crypto_token?: string;
  crypto_chain?: string;
}

// Update PaymentSession
export interface PaymentSession {
  id: string;
  amount: MonetaryAmount;  // Changed from amount_fiat
  discount?: {
    code: string;
    amount: MonetaryAmount;
    percentage: number;
  };
  final_amount: MonetaryAmount;  // Changed from amount_paid
  status: string;
  // ... other fields
}

// Update AnalyticsOverview
export interface AnalyticsOverview {
  payments: {
    total_volume: MonetaryAmount;  // Changed from number
    total_payments: number;
    avg_payment: MonetaryAmount;   // Changed from number
    conversion_rate: number;
  };
  // ... other fields
}

// Similar updates for:
// - Invoice
// - SubscriptionPlan
// - Withdrawal
// - WalletBalance
// - MRRARRData
```

### 2. Utility Functions
**File**: `src/lib/utils.ts`

```typescript
// DEPRECATE these functions (mark for removal)
// @deprecated Use amount.formatted from API response
export function formatCurrency(amount: number, currency = 'USD'): string {
  console.warn('formatCurrency is deprecated. Use amount.formatted from API.');
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// @deprecated Use amount.formatted from API response
export function displayAmount(
  amountUsd: number,
  localAmount: LocalCurrencyAmount | null | undefined
): string {
  console.warn('displayAmount is deprecated. Use amount.formatted from API.');
  // ... existing code
}

// @deprecated Use amount.formatted and amount.formatted_usd from API response
export function displayDualAmount(
  amountUsd: number,
  localAmount: LocalCurrencyAmount | null | undefined
): { primary: string; secondary: string | null } {
  console.warn('displayDualAmount is deprecated. Use amount.formatted from API.');
  // ... existing code
}

// ADD new helper function
export function formatMonetaryAmount(
  amount: MonetaryAmount | null | undefined,
  showUsd: boolean = true
): { primary: string; secondary: string | null } {
  if (!amount) {
    return { primary: '$0.00', secondary: null };
  }
  
  return {
    primary: amount.formatted,
    secondary: showUsd ? amount.formatted_usd || null : null,
  };
}
```

### 3. Components to Update

#### Analytics Components
- `src/app/components/analytics/AnalyticsDashboard.tsx`
- `src/app/components/analytics/MRRARRCard.tsx`
- `src/app/components/analytics/PaymentTracker.tsx`
- `src/app/components/analytics/SubscriptionTracker.tsx`

#### Payment Components
- `src/app/components/PaymentsList.tsx`
- `src/app/components/PaymentDetail.tsx`
- `src/app/components/CreatePayment.tsx`
- `src/app/components/Dashboard.tsx`

#### Wallet Components
- `src/app/components/Wallets.tsx`
- `src/app/components/withdrawals/Withdrawals.tsx`
- `src/app/components/withdrawals/WithdrawalsList.tsx`

#### Invoice Components
- `src/app/components/invoices/InvoicesList.tsx`
- `src/app/components/invoices/CreateInvoiceForm.tsx`

#### Subscription Components
- `src/app/components/subscriptions/SubscriptionsDashboard.tsx`
- `src/app/components/subscriptions/Web3SubscriptionCheckoutPage.tsx`

#### Other Components
- `src/app/components/Billing.tsx`
- `src/app/components/Coupons.tsx`
- `src/app/components/coupons/CouponAnalytics.tsx`

---

## Search & Replace Patterns

### Pattern 1: Simple Amount Display
```bash
# Find
formatCurrency(payment.amount_fiat, currency)

# Replace with
payment.amount.formatted
```

### Pattern 2: Dual Amount Display
```bash
# Find
displayAmount(payment.amount_fiat, payment.amount_fiat_local)

# Replace with
payment.amount.formatted
```

### Pattern 3: Amount with USD Reference
```bash
# Find
<div>{formatCurrency(amount, 'USD')}</div>

# Replace with
<div>
  <span>{amount.formatted}</span>
  {amount.formatted_usd && (
    <span className="text-sm text-muted-foreground ml-2">
      {amount.formatted_usd}
    </span>
  )}
</div>
```

---

## Testing Checklist

### Visual Testing
- [ ] All amounts display in correct currency (INR, not USD)
- [ ] Currency symbols are correct (₹, not $)
- [ ] Number formatting matches locale (1,23,456.78 for INR)
- [ ] USD reference shows when available
- [ ] No hardcoded $ symbols visible

### Functional Testing
- [ ] Analytics page shows correct currency
- [ ] Payment list shows correct currency
- [ ] Payment detail shows correct currency
- [ ] Wallet balance shows correct currency
- [ ] Invoice amounts show correct currency
- [ ] Subscription prices show correct currency
- [ ] Withdrawal amounts show correct currency
- [ ] Charts use correct currency labels
- [ ] Exports use correct currency

### Edge Cases
- [ ] Zero amounts display correctly
- [ ] Negative amounts display correctly (refunds)
- [ ] Very large amounts display correctly
- [ ] Very small amounts display correctly
- [ ] Missing currency data shows fallback

---

## Migration Steps

### Step 1: Update Type Definitions
1. Add `MonetaryAmount` interface
2. Update all interfaces to use `MonetaryAmount`
3. Mark old fields as deprecated

### Step 2: Update Utility Functions
1. Add deprecation warnings to old functions
2. Create new helper functions
3. Update imports

### Step 3: Update Components (Page by Page)
1. Start with Analytics (most complex)
2. Then Payments
3. Then Wallets
4. Then Invoices
5. Then Subscriptions
6. Finally, smaller components

### Step 4: Remove Old Code
1. Remove deprecated utility functions
2. Remove old type definitions
3. Remove unused imports
4. Clean up comments

### Step 5: Testing
1. Test each page individually
2. Test navigation between pages
3. Test with different currencies
4. Test edge cases

---

## Common Pitfalls

### ❌ Don't Do This
```tsx
// Using old formatCurrency
<div>{formatCurrency(payment.amount_fiat, 'USD')}</div>

// Hardcoded symbols
<div>$1,234.56</div>

// Manual conversion
<div>{(payment.amount_usdc * 82.85).toFixed(2)}</div>

// Assuming USD
<div>{payment.amount} USD</div>
```

### ✅ Do This
```tsx
// Use pre-formatted string from API
<div>{payment.amount.formatted}</div>

// Show USD reference if available
<div>
  <span>{payment.amount.formatted}</span>
  {payment.amount.formatted_usd && (
    <span className="text-muted-foreground">
      ({payment.amount.formatted_usd})
    </span>
  )}
</div>

// Use currency from API
<div>{payment.amount.formatted}</div>

// Show crypto amount if available
{payment.amount.amount_crypto && (
  <div className="text-sm">
    {payment.amount.amount_crypto} {payment.amount.crypto_token}
  </div>
)}
```

---

## Summary

### Before Migration
- ❌ 15+ different ways to display amounts
- ❌ Hardcoded currency symbols
- ❌ Frontend currency conversions
- ❌ Inconsistent formatting
- ❌ Mixed USD/local currency

### After Migration
- ✅ Single way to display amounts: `amount.formatted`
- ✅ Backend-provided symbols
- ✅ Backend currency conversions
- ✅ Consistent formatting everywhere
- ✅ Merchant's preferred currency

### Benefits
- **Simpler Code**: Just use `amount.formatted`
- **Consistent UX**: Same currency everywhere
- **Accurate**: Backend handles conversions
- **Maintainable**: One place to update
- **Scalable**: Easy to add new currencies

This migration will make the frontend cleaner, more maintainable, and production-ready!
