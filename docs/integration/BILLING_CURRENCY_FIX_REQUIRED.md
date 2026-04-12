# Billing Currency Fix Required

## 🔴 Critical Issue

The billing page shows hardcoded USD prices ($0, $29, $99) but displays them with the user's currency symbol (₹ for INR).

**Current Behavior:**
```
User in India sees:
₹0, ₹29, ₹99  ← Wrong! These are USD prices with INR symbol
```

**Expected Behavior:**
```
User in India should see:
₹0, ₹2,400, ₹8,200  ← Correct INR prices
```

---

## 🔍 Root Cause

The frontend has hardcoded USD prices:

```typescript
// In Billing.tsx
const prices = { 
  free: 0,        // $0 USD
  growth: 29,     // $29 USD
  business: 99,   // $99 USD
  enterprise: 'Custom' 
};
```

But uses the user's currency symbol:
```typescript
{currencySymbol}${prices[planId]}
// Results in: ₹29 (INR symbol with USD price!)
```

---

## ✅ Solution: Backend Must Provide Prices

The backend should return plan prices in the user's currency.

### Backend API Changes Required

#### Option 1: Add Prices to Billing Info Response

Update `GET /billing` endpoint to include plan prices:

```json
{
  "tier": "growth",
  "status": "active",
  "monthly_price": 2400,
  "currency": "INR",
  "transaction_fee_percent": 0.9,
  "current_period_start": "2026-03-05",
  "current_period_end": "2026-04-05",
  
  // Add this:
  "available_plans": {
    "free": {
      "name": "Free",
      "price": 0,
      "currency": "INR",
      "features": [...]
    },
    "growth": {
      "name": "Growth",
      "price": 2400,
      "currency": "INR",
      "features": [...]
    },
    "business": {
      "name": "Business",
      "price": 8200,
      "currency": "INR",
      "features": [...]
    },
    "enterprise": {
      "name": "Enterprise",
      "price": null,
      "currency": "INR",
      "contact_sales": true
    }
  }
}
```

#### Option 2: Separate Plans Endpoint

Create new endpoint `GET /billing/plans`:

```json
{
  "currency": "INR",
  "plans": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "billing_period": "month",
      "features": {
        "transaction_fee": 2.9,
        "monthly_volume_limit": 10000,
        "payment_links": 5,
        "invoices": 10,
        "team_members": 1
      }
    },
    {
      "id": "growth",
      "name": "Growth",
      "price": 2400,
      "billing_period": "month",
      "features": {
        "transaction_fee": 0.9,
        "monthly_volume_limit": 50000,
        "payment_links": null,
        "invoices": null,
        "team_members": 3
      }
    },
    {
      "id": "business",
      "name": "Business",
      "price": 8200,
      "billing_period": "month",
      "features": {
        "transaction_fee": 0.5,
        "monthly_volume_limit": null,
        "payment_links": null,
        "invoices": null,
        "team_members": 10
      }
    },
    {
      "id": "enterprise",
      "name": "Enterprise",
      "price": null,
      "billing_period": "month",
      "contact_sales": true,
      "features": {
        "transaction_fee": "custom",
        "monthly_volume_limit": null,
        "payment_links": null,
        "invoices": null,
        "team_members": null
      }
    }
  ]
}
```

---

## 💰 Currency Conversion Logic

### Backend Implementation

```python
# In your billing service

PLAN_PRICES_USD = {
    'free': 0,
    'growth': 29,
    'business': 99,
    'enterprise': None
}

CURRENCY_RATES = {
    'USD': 1.0,
    'INR': 83.0,  # 1 USD = 83 INR
    'EUR': 0.92,  # 1 USD = 0.92 EUR
    'GBP': 0.79,  # 1 USD = 0.79 GBP
    # Add more currencies
}

def get_plan_price_in_currency(plan_id: str, currency: str) -> float:
    """Convert plan price to user's currency"""
    usd_price = PLAN_PRICES_USD.get(plan_id)
    
    if usd_price is None:  # Enterprise
        return None
    
    if usd_price == 0:  # Free plan
        return 0
    
    rate = CURRENCY_RATES.get(currency, 1.0)
    converted_price = usd_price * rate
    
    # Round to nearest 100 for INR, 10 for others
    if currency == 'INR':
        return round(converted_price / 100) * 100
    else:
        return round(converted_price, 2)

# Example usage
def get_billing_info(merchant_id: str):
    merchant = get_merchant(merchant_id)
    currency = merchant.currency or 'USD'
    
    billing_info = {
        # ... existing fields ...
        'available_plans': {
            'free': {
                'price': get_plan_price_in_currency('free', currency),
                'currency': currency
            },
            'growth': {
                'price': get_plan_price_in_currency('growth', currency),
                'currency': currency
            },
            'business': {
                'price': get_plan_price_in_currency('business', currency),
                'currency': currency
            },
            'enterprise': {
                'price': None,
                'currency': currency,
                'contact_sales': True
            }
        }
    }
    
    return billing_info
```

### Example Conversions

| Plan | USD | INR (×83) | EUR (×0.92) | GBP (×0.79) |
|------|-----|-----------|-------------|-------------|
| Free | $0 | ₹0 | €0 | £0 |
| Growth | $29 | ₹2,400 | €27 | £23 |
| Business | $99 | ₹8,200 | €91 | £78 |
| Enterprise | Custom | Custom | Custom | Custom |

---

## 🔧 Frontend Changes Required

### Update Billing Component

```typescript
// In Billing.tsx

export function Billing() {
  const { billingInfo, isLoading, error } = useBilling();
  const { currencySymbol } = useMerchantCurrency();

  // Get plan prices from backend
  const getPlanPrice = (planId: PlanTier) => {
    // Check if backend provides prices
    if (billingInfo?.available_plans?.[planId]) {
      return billingInfo.available_plans[planId].price;
    }
    
    // Fallback to hardcoded USD (temporary)
    const fallbackPrices = { 
      free: 0, 
      growth: 29, 
      business: 99, 
      enterprise: null 
    };
    return fallbackPrices[planId];
  };

  return (
    // ... rest of component
    <div className="text-2xl font-bold">
      {getPlanPrice(planId) !== null 
        ? `${currencySymbol}${getPlanPrice(planId).toLocaleString()}` 
        : 'Custom'}
    </div>
  );
}
```

### Update Billing Service

```typescript
// In billing.service.ts

export interface PlanInfo {
  id: string;
  name: string;
  price: number | null;
  currency: string;
  contact_sales?: boolean;
  features: {
    transaction_fee: number | string;
    monthly_volume_limit: number | null;
    payment_links: number | null;
    invoices: number | null;
    team_members: number | null;
  };
}

export interface BillingInfo {
  // ... existing fields ...
  available_plans?: {
    free: PlanInfo;
    growth: PlanInfo;
    business: PlanInfo;
    enterprise: PlanInfo;
  };
}
```

---

## 📋 Implementation Checklist

### Backend Tasks
- [ ] Add currency conversion logic
- [ ] Update `GET /billing` to include `available_plans`
- [ ] OR create `GET /billing/plans` endpoint
- [ ] Store currency exchange rates
- [ ] Update rates periodically (daily/weekly)
- [ ] Round prices appropriately per currency
- [ ] Add currency to plan response
- [ ] Test with different currencies

### Frontend Tasks
- [ ] Update `BillingInfo` interface
- [ ] Update `Billing.tsx` to use backend prices
- [ ] Remove hardcoded prices
- [ ] Add fallback for missing prices
- [ ] Format prices with locale
- [ ] Test with different currencies
- [ ] Handle null prices (Enterprise)

### Testing
- [ ] Test with USD user
- [ ] Test with INR user
- [ ] Test with EUR user
- [ ] Test with GBP user
- [ ] Verify price formatting
- [ ] Verify currency symbols
- [ ] Test plan upgrades
- [ ] Test enterprise contact

---

## 🎯 Expected Results

### Before (Broken)
```
User Currency: INR (₹)
Free Plan: ₹0 ✅ (correct)
Growth Plan: ₹29 ❌ (should be ₹2,400)
Business Plan: ₹99 ❌ (should be ₹8,200)
```

### After (Fixed)
```
User Currency: INR (₹)
Free Plan: ₹0 ✅
Growth Plan: ₹2,400 ✅
Business Plan: ₹8,200 ✅
Enterprise: Custom ✅
```

### For USD Users
```
User Currency: USD ($)
Free Plan: $0 ✅
Growth Plan: $29 ✅
Business Plan: $99 ✅
Enterprise: Custom ✅
```

---

## 🚨 Temporary Workaround

Until backend is updated, the frontend will:
1. Show USD prices with user's currency symbol (current behavior)
2. Add a note: "Prices shown in USD equivalent"
3. Display actual charged amount on checkout

**Not recommended** - Should fix properly with backend changes.

---

## 📝 API Contract

### Request
```
GET /billing
Authorization: Bearer {token}
```

### Response
```json
{
  "tier": "growth",
  "status": "active",
  "monthly_price": 2400,
  "currency": "INR",
  "transaction_fee_percent": 0.9,
  "current_period_start": "2026-03-05T00:00:00Z",
  "current_period_end": "2026-04-05T00:00:00Z",
  "current_volume": 201,
  "monthly_volume_limit": 50000,
  "current_payment_links": 0,
  "payment_link_limit": null,
  "current_invoices": 0,
  "invoice_limit": null,
  "team_member_limit": 3,
  
  "available_plans": {
    "free": {
      "id": "free",
      "name": "Free",
      "price": 0,
      "currency": "INR",
      "billing_period": "month",
      "features": {
        "transaction_fee": 2.9,
        "monthly_volume_limit": 10000,
        "payment_links": 5,
        "invoices": 10,
        "team_members": 1
      }
    },
    "growth": {
      "id": "growth",
      "name": "Growth",
      "price": 2400,
      "currency": "INR",
      "billing_period": "month",
      "features": {
        "transaction_fee": 0.9,
        "monthly_volume_limit": 50000,
        "payment_links": null,
        "invoices": null,
        "team_members": 3
      }
    },
    "business": {
      "id": "business",
      "name": "Business",
      "price": 8200,
      "currency": "INR",
      "billing_period": "month",
      "features": {
        "transaction_fee": 0.5,
        "monthly_volume_limit": null,
        "payment_links": null,
        "invoices": null,
        "team_members": 10
      }
    },
    "enterprise": {
      "id": "enterprise",
      "name": "Enterprise",
      "price": null,
      "currency": "INR",
      "billing_period": "month",
      "contact_sales": true,
      "features": {
        "transaction_fee": "custom",
        "monthly_volume_limit": null,
        "payment_links": null,
        "invoices": null,
        "team_members": null
      }
    }
  }
}
```

---

## 🎉 Summary

**Problem**: Hardcoded USD prices shown with user's currency symbol

**Solution**: Backend must provide prices in user's currency

**Action Required**: 
1. Backend: Add currency conversion and include prices in API response
2. Frontend: Use backend prices instead of hardcoded values

**Priority**: HIGH - Affects pricing transparency and user trust

---

**Created**: April 12, 2026  
**Status**: 🔴 Backend Fix Required  
**Priority**: HIGH  
**Impact**: All users with non-USD currency
