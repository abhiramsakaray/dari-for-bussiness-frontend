# Frontend Fixes Applied - May 5, 2026

## Summary
Applied frontend fixes to properly display merchant currency amounts without double conversion or unwanted USD display.

## Changes Made

### 1. Dashboard.tsx - Revenue Display Fix
**File**: `src/app/components/Dashboard.tsx`  
**Lines**: 42-50

**Problem**: Was using `displayDualAmount()` which could apply unwanted conversions.

**Solution**: Directly use the `display_local` field from the backend response.

```typescript
// Before
const revenueDisplay = displayDualAmount(totalVolume, totalRevenueLocal);

// After
const revenueDisplay = totalRevenueLocal 
  ? { primary: totalRevenueLocal.display_local, secondary: null }
  : { primary: `$${totalVolume.toFixed(2)}`, secondary: null };
```

**Why**: The backend already sends the formatted display string (e.g., "₹3,707.97"), so we should use it directly instead of doing any client-side conversion.

### 2. PaymentsList.tsx - Remove USD Secondary Display
**File**: `src/app/components/PaymentsList.tsx`  
**Lines**: 124-126

**Problem**: Was showing both merchant currency AND USD (e.g., "₹476.15 INR" with "$5.00 USD" below).

**Solution**: Show ONLY merchant currency, no secondary USD display.

```typescript
// Before
dual = {
  primary: `${payment.merchant_currency_symbol}${payment.merchant_amount_local.toFixed(2)} ${payment.merchant_currency}`,
  secondary: payment.amount_usdc ? `$${parseFloat(payment.amount_usdc).toFixed(2)} USD` : null
};

// After
dual = {
  primary: `${payment.merchant_currency_symbol}${payment.merchant_amount_local.toFixed(2)}`,
  secondary: null
};
```

**Why**: User requested "Don't show USD secondary amount - When merchant currency is provided, only show that currency, not USD conversion"

## What's Still Broken

### Revenue Calculation (Backend Issue)
The Dashboard still shows **₹353,109.98** instead of **₹3,707.97** because the backend is sending the wrong value in the `total_local.amount_local` field.

**Evidence**:
- Backend logs show correct calculation: `💰 TOTAL REVENUE: 3707.97 INR`
- Frontend receives: `total_local.display_local = "₹353,109.98"` (95x inflation)
- The backend is applying exchange rate conversion when it shouldn't

**Required Backend Fix**: See `docs/development/REVENUE_CALCULATION_BUG.md`

## Testing

### What Works Now ✅
1. **Payments List**: Shows only merchant currency (₹476.15) without USD secondary
2. **Transaction Type Badges**: Both "Payment" and "Subscription" use same outline style
3. **Payer Information**: Shows correctly in list view (after backend restart)

### What's Still Broken ❌
1. **Dashboard Total Revenue**: Shows ₹353,109.98 instead of ₹3,707.97 (backend issue)
2. **Individual Payment Amounts**: May show wrong amounts if backend is sending inflated values

## Next Steps

1. **Backend Team**: Fix the `/merchant/payments/stats` endpoint
   - Use the already-calculated local amount
   - Don't apply exchange rate conversion (it's already in local currency)
   - See `REVENUE_CALCULATION_BUG.md` for details

2. **After Backend Fix**: 
   - Restart backend: `pm2 restart dari-api`
   - Hard refresh frontend: Ctrl+Shift+R
   - Verify Dashboard shows ₹3,707.97

## Files Modified
- ✅ `src/app/components/Dashboard.tsx` - Direct display_local usage
- ✅ `src/app/components/PaymentsList.tsx` - Removed USD secondary display
- ✅ `docs/development/REVENUE_CALCULATION_BUG.md` - Backend fix documentation
- ✅ `docs/development/FRONTEND_FIXES_APPLIED.md` - This file
