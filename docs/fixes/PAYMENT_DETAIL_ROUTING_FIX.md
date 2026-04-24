# Payment Detail Routing Fix

## Problem

The payment detail page was showing empty data and making requests to `/merchant/payments/` (without the payment ID) instead of `/merchant/payments/{paymentId}`.

Console showed:
```javascript
Sending request: {
  method: 'GET',
  url: '/merchant/payments/',  // ❌ Missing payment ID
  fullURL: 'http://localhost:8000/merchant/payments/'
}
```

## Root Cause

The `PaymentDetail` component was receiving `paymentId=""` (empty string) as a prop from the route definition, instead of extracting it from the URL parameters using React Router's `useParams()` hook.

**In AppRouter.tsx:**
```tsx
// ❌ Wrong - hardcoded empty string
<Route 
  path="/dashboard/payments/:paymentId" 
  element={<PaymentDetail paymentId="" />}  // Empty string!
/>
```

## Fix Applied

### 1. Updated Route Definition

**File**: `src/app/AppRouter.tsx`

Removed the hardcoded empty `paymentId` prop:

```tsx
// ✅ Correct - let component extract from URL
<Route 
  path="/dashboard/payments/:paymentId" 
  element={<ProtectedRoute><PaymentDetail /></ProtectedRoute>}
/>
```

### 2. Updated PaymentDetail Component

**File**: `src/app/components/PaymentDetail.tsx`

Changed from receiving `paymentId` as a prop to extracting it from URL params:

**Before:**
```tsx
interface PaymentDetailProps {
  paymentId: string;
}

export function PaymentDetail({ paymentId }: PaymentDetailProps) {
  // paymentId was always empty string ""
}
```

**After:**
```tsx
import { useParams } from "react-router-dom";

export function PaymentDetail() {
  const { paymentId } = useParams<{ paymentId: string }>();
  
  // Validate paymentId exists
  if (!paymentId) {
    return <ErrorView message="No payment ID provided" />;
  }
  
  // Now paymentId is correctly extracted from URL
}
```

### 3. Updated App.tsx

**File**: `src/app/App.tsx`

Removed the prop passing:

```tsx
// ✅ Correct
case !!paymentDetailMatch:
  return <ProtectedRoute><PaymentDetail /></ProtectedRoute>;
```

## How It Works Now

1. User clicks on a payment in the list
2. Navigates to `/dashboard/payments/pay_abc123`
3. React Router matches the route pattern `/dashboard/payments/:paymentId`
4. `PaymentDetail` component uses `useParams()` to extract `pay_abc123`
5. Makes API call to `/merchant/payments/pay_abc123` ✅
6. Displays the correct payment details

## Testing

After applying these fixes:

1. Go to Payments list
2. Click on any payment
3. Should navigate to `/dashboard/payments/{payment_id}`
4. Payment details should load correctly
5. Check console - should see:
   ```javascript
   Sending request: {
     method: 'GET',
     url: '/merchant/payments/pay_abc123',  // ✅ Has payment ID
   }
   ```

## Before vs After

### Before (Broken)
```
URL: /dashboard/payments/pay_abc123
API Call: GET /merchant/payments/  ❌ (missing ID)
Result: Shows empty data or list of all payments
```

### After (Fixed)
```
URL: /dashboard/payments/pay_abc123
API Call: GET /merchant/payments/pay_abc123  ✅ (correct ID)
Result: Shows specific payment details
```

## Related Issues Fixed

This fix also resolves:
- ✅ Payment detail page showing empty/default data
- ✅ API calls to wrong endpoint
- ✅ "Not Found" errors when viewing payment details
- ✅ Confusion between list endpoint and detail endpoint

## Files Modified

1. `src/app/AppRouter.tsx` - Removed hardcoded empty paymentId prop
2. `src/app/components/PaymentDetail.tsx` - Use useParams() instead of props
3. `src/app/App.tsx` - Removed paymentId prop passing

## No Restart Required

These are TypeScript/React changes, so hot module replacement should work. Just refresh the page if needed.

## Verification Checklist

- [ ] Can navigate to payment detail page
- [ ] URL shows correct payment ID
- [ ] API call includes payment ID in path
- [ ] Payment details display correctly
- [ ] No 404 errors in console
- [ ] All payment fields show correct data

---

**Status**: ✅ FIXED

The payment detail page now correctly extracts the payment ID from the URL and makes the proper API call to fetch payment details.
