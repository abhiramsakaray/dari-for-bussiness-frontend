# Unified Transactions - Current Issues & Status

## Date: May 5, 2026

---

## ✅ What's Working

### 1. Currency Display - FIXED
- **Issue**: Was showing "$476.15 INR" instead of "₹476.15 INR"
- **Fix Applied**: Updated PaymentsList.tsx to properly use `merchant_currency_symbol` from backend
- **Status**: ✅ **WORKING** - Now displays "₹476.15 INR" correctly

### 2. Type Column Added
- **Status**: ✅ **WORKING** - Shows "Payment" badge for all transactions
- **Note**: Will show "Subscription" badge when backend sends `transaction_type: "subscription"`

### 3. Payer Fields - FIXED (May 5, 2026)
- **Issue**: Payer column was showing "—" instead of customer names
- **Fix Applied**: Backend updated to include `payer_name` and `payer_email` in `/merchant/payments` response
- **Status**: ✅ **FIXED** - See `docs/development/PAYER_FIELDS_FIX.md` for details
- **Action Required**: Restart backend server to apply changes

### 4. Frontend Code Ready
- **Status**: ✅ **COMPLETE**
- All TypeScript interfaces updated with unified transaction fields
- PaymentsList component ready to display subscription badges
- PaymentDetail component ready to show subscription details
- Console logging added for debugging

---

## ❌ Current Issues

### Issue #1: Payer Column Shows "—" Instead of Customer Name ✅ FIXED

**Status**: ✅ **FIXED** - Backend updated on May 5, 2026

**What Was Wrong:**
- **Payments List**: Was showing "—" in Payer column
- **Payment Detail**: Was showing "Abhiram Sakaray" correctly

**Fix Applied:**
Backend updated `UnifiedTransaction` class to include `payer_name` and `payer_email` fields.

**See**: `docs/development/PAYER_FIELDS_FIX.md` for complete details

**Action Required**: 
- ⚠️ **Restart backend server** to apply the fix
- Then refresh the frontend to see payer names

---

### Issue #2: No Subscription Transactions Visible ⚠️ PENDING

**What We See:**
- **Payments List**: Shows "—" in Payer column
- **Payment Detail**: Shows "Abhiram Sakaray" and "sakarayabhiram@gmail.com" correctly

**Root Cause:**
The `/merchant/payments` (list) endpoint is NOT returning `payer_name` and `payer_email` fields, but the `/merchant/payments/{id}` (detail) endpoint IS returning them.

**Evidence:**
```
List View:     payment.payer_name = undefined
               payment.payer_email = undefined

Detail View:   payment.payer_name = "Abhiram Sakaray"
               payment.payer_email = "sakarayabhiram@gmail.com"
```

**Frontend Code Status:**
- ✅ Frontend checks for: `payer_name`, `customer_name`, `payer_email`, `customer_email`
- ✅ Will display correctly once backend sends the data

**Backend Fix Needed:**
```python
# In merchant_payments.py - GET /merchant/payments endpoint
# Need to include payer_name and payer_email in the response

# Current response (missing payer fields):
{
    "id": "pay_fv0k9ipqgb8tz3cv",
    "amount_fiat": 5.0,
    "merchant_amount_local": 476.15,
    "merchant_currency": "INR",
    "merchant_currency_symbol": "₹",
    # MISSING: payer_name
    # MISSING: payer_email
}

# Expected response:
{
    "id": "pay_fv0k9ipqgb8tz3cv",
    "amount_fiat": 5.0,
    "merchant_amount_local": 476.15,
    "merchant_currency": "INR",
    "merchant_currency_symbol": "₹",
    "payer_name": "Abhiram Sakaray",        # ADD THIS
    "payer_email": "sakarayabhiram@gmail.com"  # ADD THIS
}
```

---

### Issue #2: No Subscription Transactions Visible

**What We See:**
- All transactions show "Payment" badge
- No "Subscription" badges visible
- Console logs show: `transaction_type: undefined` for all payments

**Root Cause:**
The `/merchant/payments` endpoint is NOT returning the `transaction_type` field.

**Evidence from Backend Logs:**
```
INFO - Fetching payment sessions for merchant
INFO - Enriching 2 items with currency: INR (₹)
INFO - Found 2 payment sessions for merchant
```

The backend is only returning "payment sessions" - not unified transactions that include subscriptions.

**Frontend Code Status:**
- ✅ Frontend checks for `transaction_type === "subscription"`
- ✅ Will show purple "Subscription" badge when backend sends the field
- ✅ Will display subscription details (payment #, period dates)

**Backend Fix Needed:**
The `UnifiedTransaction` class already has `transaction_type` field, but it needs to be properly set:

```python
# In unified_transaction_service.py - get_unified_transactions()

# For regular payments:
transactions.append(UnifiedTransaction(
    transaction_type="payment",  # Make sure this is set
    # ... other fields
))

# For subscription payments:
transactions.append(UnifiedTransaction(
    transaction_type="subscription",  # Make sure this is set
    subscription_id=sub_payment.subscription_id,
    payment_number=sub_payment.payment_number,
    period_start=sub_payment.period_start,
    period_end=sub_payment.period_end,
    # ... other fields
))
```

**Verification Needed:**
1. Check if `get_unified_transactions()` is actually being called by `/merchant/payments`
2. Verify `transaction_type` is being set in the UnifiedTransaction constructor
3. Check if there are any subscription payments in the database for this merchant

---

### Issue #3: Revenue Discrepancy ⚠️ INVESTIGATING

**What We See:**
- **Dashboard Overview**: Shows "₹90,687.53" total revenue
- **Payments List**: Shows only 2 payments of ₹476.15 each = ₹952.30 total

**Possible Causes:**
1. `/merchant/payments/stats` endpoint includes historical/test data
2. Stats endpoint includes all-time revenue, not just visible payments
3. Stats endpoint might be including subscription revenue that's not visible in list

**Investigation Needed:**
- Check what `/merchant/payments/stats` is returning
- Verify if it's showing all-time revenue vs current period
- Check if subscription payments are included in stats but not in list

**Backend Verification Needed:**
```bash
# Check the stats endpoint response
GET /merchant/payments/stats

# Should return:
{
    "revenue": {
        "total_usdc": 10.0,  # Should match sum of visible payments
        "total_local": {
            "amount_local": 952.30,  # Should be 2 × 476.15
            "local_currency": "INR",
            "local_symbol": "₹"
        }
    }
}
```

---

## 🔍 Debugging Steps

### For Backend Developer:

1. **Check `/merchant/payments` Response:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/merchant/payments?limit=50
```

Verify the response includes:
- ✅ `merchant_amount_local`
- ✅ `merchant_currency`
- ✅ `merchant_currency_symbol`
- ❌ `transaction_type` (MISSING)
- ❌ `payer_name` (MISSING)
- ❌ `payer_email` (MISSING)
- ❌ `subscription_id` (MISSING for subscription payments)
- ❌ `payment_number` (MISSING for subscription payments)

2. **Check if Unified Transaction Service is Being Used:**
```python
# In app/routes/merchant_payments.py
# The GET /merchant/payments endpoint should call:
from app.services.unified_transaction_service import get_unified_transactions

@router.get("/merchant/payments")
async def list_payments(...):
    # Should use this:
    transactions = await get_unified_transactions(merchant_id, ...)
    
    # NOT this:
    # sessions = db.query(PaymentSession).filter(...)
```

3. **Verify Subscription Payments Exist:**
```sql
-- Check if there are any subscription payments
SELECT COUNT(*) FROM subscription_payments 
WHERE subscription_id IN (
    SELECT id FROM subscriptions WHERE merchant_id = '<merchant_id>'
);
```

---

## 📋 Backend Checklist

### ✅ Completed:
- [x] Include `payer_name` and `payer_email` in `/merchant/payments` response
- [x] Update `UnifiedTransaction` class with payer fields
- [x] Populate payer fields for both regular and subscription payments

### ⚠️ To Fix Unified Transactions:

- [ ] **Verify** `/merchant/payments` endpoint is calling `get_unified_transactions()`
- [ ] **Ensure** `transaction_type` field is being set correctly:
  - [ ] Set to `"payment"` for regular payment sessions
  - [ ] Set to `"subscription"` for subscription payments
- [ ] **Verify** subscription payments are being queried and included
- [ ] For subscription payments, ensure these fields are populated:
  - [ ] `subscription_id`
  - [ ] `payment_number`
  - [ ] `period_start`
  - [ ] `period_end`
- [ ] **Test** with a merchant that has both regular payments AND subscription payments
- [ ] **Verify** `/merchant/payments/stats` calculates revenue correctly

---

## 🎯 Expected Behavior After Fix

### Payments List Should Show:

| Type | Session ID | Payer | Amount | Status |
|------|-----------|-------|--------|--------|
| 💳 Payment | pay_fv0k9... | Abhiram Sakaray<br>sakarayabhiram@gmail.com | ₹476.15 INR<br>$5.00 USD | PAID |
| 🔄 Subscription | sub_pay_abc... | John Doe<br>john@example.com | ₹2,761.67 INR<br>$29.00 USD<br><small>Payment #1 (May 5 - Jun 5)</small> | PAID |

### Dashboard Should Show:
- **Total Revenue**: Sum of all visible payments (not inflated)
- **Active Subscriptions**: Count from subscriptions table
- **MRR**: From analytics endpoint (already working)

---

## 📝 Frontend Changes Already Made

### Files Modified:
1. ✅ `src/types/api.types.ts` - Added unified transaction fields
2. ✅ `src/services/chainpe.ts` - Updated PaymentSession interface
3. ✅ `src/app/components/PaymentsList.tsx` - Added subscription badge, fixed currency
4. ✅ `src/app/components/PaymentDetail.tsx` - Added subscription details card
5. ✅ `src/app/components/subscriptions/SubscriptionsDashboard.tsx` - Uses MRR from analytics
6. ✅ `src/app/components/analytics/MRRARRCard.tsx` - Fixed MRR display

### Console Logs Added:
The frontend now logs:
```javascript
💳 Payments in component: 2
💳 First payment full object: { ... }
💳 Payer fields: { payer_name: undefined, payer_email: undefined, ... }
💳 Transaction types: ["undefined", "undefined"]
🔍 First payment from API: { ... }
🔍 Has transaction_type? undefined
🔍 Has merchant_currency? INR
🔍 Has merchant_currency_symbol? ₹
```

Check browser console to see what the backend is actually sending!

---

## 🚀 Next Steps

### Immediate Actions:
1. ✅ **DONE**: Backend updated with payer fields fix
2. ⚠️ **ACTION REQUIRED**: Restart backend server to apply payer fields fix
3. ⚠️ **VERIFY**: Check if payer names now appear in payments list after restart

### Remaining Work:
1. **Backend**: Verify `transaction_type` is being set in `get_unified_transactions()`
2. **Backend**: Ensure subscription payments are included in unified list
3. **Test**: Create a subscription payment and verify it appears with purple badge
4. **Test**: Verify revenue numbers match between dashboard and payments list
5. **Document**: Update this file once all issues are resolved

---

## 📚 Related Documentation

- `docs/development/PAYER_FIELDS_FIX.md` - Details of payer fields fix (May 5, 2026)
- `docs/development/UNIFIED_TRANSACTIONS_IMPLEMENTATION.md` - Frontend implementation guide
- `app/services/unified_transaction_service.py` - Backend unified transaction service
