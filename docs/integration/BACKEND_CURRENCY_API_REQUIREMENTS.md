# Backend Currency API Requirements

## Executive Summary

The frontend currently uses **mixed currency handling** with frontend-based conversions and hardcoded symbols. This document outlines the required backend API changes to provide **production-quality, backend-driven currency handling**.

---

## Current Problems

### 1. **Mixed Currency Sources**
- Some APIs return `amount_fiat` (USD)
- Some APIs return `amount_usdc` (stablecoin)
- Some APIs return `amount_local` (merchant's local currency)
- Frontend has to guess which field to use

### 2. **Frontend-Based Conversions**
- Frontend uses `Intl.NumberFormat` for currency formatting
- Exchange rates not consistent
- Hardcoded currency symbols (`$`, `₹`, etc.)
- No centralized currency management

### 3. **Inconsistent API Responses**
- Some endpoints return `LocalCurrencyAmount` objects
- Some endpoints return only USD amounts
- Some endpoints return both, some return neither
- No standard structure

---

## Required Backend Changes

### 1. **Standardized Currency Response Structure**

All monetary amounts in API responses should follow this structure:

```typescript
interface MonetaryAmount {
  // Primary amount in merchant's preferred currency
  amount: number;
  currency: string;        // ISO 4217 code (e.g., "USD", "INR", "EUR")
  symbol: string;          // Currency symbol (e.g., "$", "₹", "€")
  formatted: string;       // Pre-formatted string (e.g., "₹1,234.56")
  
  // Optional: USD equivalent for reference
  amount_usd?: number;
  formatted_usd?: string;  // Pre-formatted USD (e.g., "$12.34")
  
  // Optional: Original crypto amount
  amount_crypto?: number;
  crypto_token?: string;   // e.g., "USDC", "USDT"
  crypto_chain?: string;   // e.g., "polygon", "ethereum"
}
```

### 2. **Merchant Currency Preference**

Add merchant currency preference to merchant profile:

```typescript
// GET /merchants/me
{
  "id": "merchant_123",
  "email": "merchant@example.com",
  "name": "Merchant Name",
  "currency_preference": {
    "currency": "INR",
    "symbol": "₹",
    "locale": "en-IN",
    "decimal_places": 2
  },
  // ... other fields
}
```

### 3. **Update All Monetary Fields**

Replace all instances of:
- `amount_fiat` → `amount` (MonetaryAmount)
- `amount_usdc` → Include in `amount_crypto`
- `amount_local` → This becomes the primary `amount`
- `fiat_currency` → Part of MonetaryAmount
- `local_currency` → Part of MonetaryAmount

---

## API Endpoints to Update

### Analytics APIs

#### 1. GET /analytics/overview
**Current Response:**
```json
{
  "payments": {
    "total_volume": 1234.56,
    "total_volume_usd": 1234.56,
    "total_payments": 100
  },
  "currency": "USD",
  "volume_change_pct": 12.5
}
```

**Required Response:**
```json
{
  "payments": {
    "total_volume": {
      "amount": 102345.67,
      "currency": "INR",
      "symbol": "₹",
      "formatted": "₹1,02,345.67",
      "amount_usd": 1234.56,
      "formatted_usd": "$1,234.56"
    },
    "total_payments": 100,
    "avg_payment": {
      "amount": 1023.46,
      "currency": "INR",
      "symbol": "₹",
      "formatted": "₹1,023.46",
      "amount_usd": 12.35,
      "formatted_usd": "$12.35"
    }
  },
  "volume_change_pct": 12.5,
  "merchant_currency": {
    "currency": "INR",
    "symbol": "₹",
    "locale": "en-IN"
  }
}
```

#### 2. GET /analytics/revenue
**Current Response:**
```json
{
  "data": [
    {
      "date": "2026-04-01",
      "revenue": 1234.56,
      "volume_usd": 1234.56
    }
  ]
}
```

**Required Response:**
```json
{
  "data": [
    {
      "date": "2026-04-01",
      "revenue": {
        "amount": 102345.67,
        "currency": "INR",
        "symbol": "₹",
        "formatted": "₹1,02,345.67",
        "amount_usd": 1234.56,
        "formatted_usd": "$1,234.56"
      }
    }
  ],
  "merchant_currency": {
    "currency": "INR",
    "symbol": "₹"
  }
}
```

#### 3. GET /analytics/mrr-arr
**Current Response:**
```json
{
  "mrr_usd": "123.45",
  "arr_usd": "1481.40",
  "mrr_local": {
    "amount": "10234.56",
    "currency": "INR",
    "rate": "82.85"
  },
  "arr_local": {
    "amount": "122814.72",
    "currency": "INR",
    "rate": "82.85"
  }
}
```

**Required Response:**
```json
{
  "mrr": {
    "amount": 10234.56,
    "currency": "INR",
    "symbol": "₹",
    "formatted": "₹10,234.56",
    "amount_usd": 123.45,
    "formatted_usd": "$123.45"
  },
  "arr": {
    "amount": 122814.72,
    "currency": "INR",
    "symbol": "₹",
    "formatted": "₹1,22,814.72",
    "amount_usd": 1481.40,
    "formatted_usd": "$1,481.40"
  },
  "active_subscriptions": 5,
  "new_this_period": 2,
  "churned_this_period": 1
}
```

---

### Payment APIs

#### 4. GET /payments/sessions
**Current Response:**
```json
{
  "items": [
    {
      "id": "pay_123",
      "amount_fiat": 10.00,
      "fiat_currency": "USD",
      "amount_usdc": "10.00",
      "status": "paid",
      "amount_fiat_local": {
        "amount_usdc": 10.00,
        "amount_local": 828.50,
        "local_currency": "INR",
        "local_symbol": "₹",
        "exchange_rate": 82.85,
        "display_local": "₹828.50"
      }
    }
  ]
}
```

**Required Response:**
```json
{
  "items": [
    {
      "id": "pay_123",
      "amount": {
        "amount": 828.50,
        "currency": "INR",
        "symbol": "₹",
        "formatted": "₹828.50",
        "amount_usd": 10.00,
        "formatted_usd": "$10.00",
        "amount_crypto": 10.00,
        "crypto_token": "USDC",
        "crypto_chain": "polygon"
      },
      "status": "paid",
      "created_at": "2026-04-09T13:22:26Z",
      "paid_at": "2026-04-09T13:25:30Z"
    }
  ],
  "merchant_currency": {
    "currency": "INR",
    "symbol": "₹"
  }
}
```

#### 5. GET /payments/sessions/{session_id}
**Current Response:**
```json
{
  "id": "pay_123",
  "amount_fiat": 10.00,
  "fiat_currency": "USD",
  "amount_usdc": "10.00",
  "status": "paid",
  "coupon_code": "SAVE10",
  "discount_amount": 1.00,
  "amount_paid": 9.00,
  "amount_fiat_local": { /* ... */ },
  "discount_amount_local": { /* ... */ },
  "amount_paid_local": { /* ... */ }
}
```

**Required Response:**
```json
{
  "id": "pay_123",
  "original_amount": {
    "amount": 828.50,
    "currency": "INR",
    "symbol": "₹",
    "formatted": "₹828.50",
    "amount_usd": 10.00,
    "formatted_usd": "$10.00"
  },
  "discount": {
    "code": "SAVE10",
    "amount": {
      "amount": 82.85,
      "currency": "INR",
      "symbol": "₹",
      "formatted": "₹82.85",
      "amount_usd": 1.00,
      "formatted_usd": "$1.00"
    },
    "percentage": 10
  },
  "final_amount": {
    "amount": 745.65,
    "currency": "INR",
    "symbol": "₹",
    "formatted": "₹745.65",
    "amount_usd": 9.00,
    "formatted_usd": "$9.00",
    "amount_crypto": 9.00,
    "crypto_token": "USDC",
    "crypto_chain": "polygon"
  },
  "status": "paid",
  "tx_hash": "0x123...",
  "merchant_currency": {
    "currency": "INR",
    "symbol": "₹"
  }
}
```

---

### Wallet & Balance APIs

#### 6. GET /wallets/dashboard
**Current Response:**
```json
{
  "total_balance_usdc": 1234.56,
  "total_balance_local": {
    "amount_usdc": 1234.56,
    "amount_local": 102345.67,
    "local_currency": "INR",
    "local_symbol": "₹",
    "exchange_rate": 82.85,
    "display_local": "₹1,02,345.67"
  },
  "local_currency": "INR",
  "local_symbol": "₹"
}
```

**Required Response:**
```json
{
  "total_balance": {
    "amount": 102345.67,
    "currency": "INR",
    "symbol": "₹",
    "formatted": "₹1,02,345.67",
    "amount_usd": 1234.56,
    "formatted_usd": "$1,234.56"
  },
  "wallets": [
    {
      "chain": "polygon",
      "address": "0x123...",
      "balance": {
        "amount": 82850.00,
        "currency": "INR",
        "symbol": "₹",
        "formatted": "₹82,850.00",
        "amount_usd": 1000.00,
        "formatted_usd": "$1,000.00",
        "amount_crypto": 1000.00,
        "crypto_token": "USDC"
      }
    }
  ],
  "merchant_currency": {
    "currency": "INR",
    "symbol": "₹",
    "locale": "en-IN"
  }
}
```

---

### Invoice APIs

#### 7. GET /invoices
**Current Response:**
```json
{
  "items": [
    {
      "id": "inv_123",
      "amount": 100.00,
      "discount": 10.00,
      "total": 90.00,
      "fiat_currency": "USD",
      "status": "paid"
    }
  ]
}
```

**Required Response:**
```json
{
  "items": [
    {
      "id": "inv_123",
      "subtotal": {
        "amount": 8285.00,
        "currency": "INR",
        "symbol": "₹",
        "formatted": "₹8,285.00",
        "amount_usd": 100.00,
        "formatted_usd": "$100.00"
      },
      "discount": {
        "amount": 828.50,
        "currency": "INR",
        "symbol": "₹",
        "formatted": "₹828.50",
        "amount_usd": 10.00,
        "formatted_usd": "$10.00"
      },
      "total": {
        "amount": 7456.50,
        "currency": "INR",
        "symbol": "₹",
        "formatted": "₹7,456.50",
        "amount_usd": 90.00,
        "formatted_usd": "$90.00"
      },
      "status": "paid"
    }
  ],
  "merchant_currency": {
    "currency": "INR",
    "symbol": "₹"
  }
}
```

---

### Subscription APIs

#### 8. GET /subscriptions/plans
**Current Response:**
```json
{
  "items": [
    {
      "id": "plan_123",
      "name": "Pro Plan",
      "amount": 29.99,
      "fiat_currency": "USD",
      "interval": "month"
    }
  ]
}
```

**Required Response:**
```json
{
  "items": [
    {
      "id": "plan_123",
      "name": "Pro Plan",
      "price": {
        "amount": 2485.42,
        "currency": "INR",
        "symbol": "₹",
        "formatted": "₹2,485.42",
        "amount_usd": 29.99,
        "formatted_usd": "$29.99"
      },
      "interval": "month",
      "interval_count": 1
    }
  ],
  "merchant_currency": {
    "currency": "INR",
    "symbol": "₹"
  }
}
```

---

### Withdrawal APIs

#### 9. GET /withdrawals
**Current Response:**
```json
{
  "items": [
    {
      "id": "wd_123",
      "amount": 100.00,
      "currency": "USDC",
      "fee": 2.00,
      "total_deducted": 102.00,
      "amount_local": { /* ... */ },
      "fee_local": { /* ... */ }
    }
  ]
}
```

**Required Response:**
```json
{
  "items": [
    {
      "id": "wd_123",
      "amount": {
        "amount": 8285.00,
        "currency": "INR",
        "symbol": "₹",
        "formatted": "₹8,285.00",
        "amount_usd": 100.00,
        "formatted_usd": "$100.00",
        "amount_crypto": 100.00,
        "crypto_token": "USDC",
        "crypto_chain": "polygon"
      },
      "fee": {
        "amount": 165.70,
        "currency": "INR",
        "symbol": "₹",
        "formatted": "₹165.70",
        "amount_usd": 2.00,
        "formatted_usd": "$2.00"
      },
      "total_deducted": {
        "amount": 8450.70,
        "currency": "INR",
        "symbol": "₹",
        "formatted": "₹8,450.70",
        "amount_usd": 102.00,
        "formatted_usd": "$102.00"
      },
      "status": "completed"
    }
  ],
  "merchant_currency": {
    "currency": "INR",
    "symbol": "₹"
  }
}
```

---

## Backend Implementation Guidelines

### 1. **Currency Formatting Service**

Create a backend service for currency formatting:

```python
from decimal import Decimal
from typing import Dict, Optional
import babel.numbers

class CurrencyFormatter:
    def __init__(self, merchant_currency: str, merchant_locale: str = "en-US"):
        self.currency = merchant_currency
        self.locale = merchant_locale
    
    def format_amount(
        self,
        amount: Decimal,
        amount_usd: Optional[Decimal] = None,
        crypto_amount: Optional[Decimal] = None,
        crypto_token: Optional[str] = None,
        crypto_chain: Optional[str] = None
    ) -> Dict:
        """Format amount with all currency information"""
        symbol = babel.numbers.get_currency_symbol(self.currency, locale=self.locale)
        formatted = babel.numbers.format_currency(
            amount, self.currency, locale=self.locale
        )
        
        result = {
            "amount": float(amount),
            "currency": self.currency,
            "symbol": symbol,
            "formatted": formatted
        }
        
        if amount_usd is not None:
            result["amount_usd"] = float(amount_usd)
            result["formatted_usd"] = babel.numbers.format_currency(
                amount_usd, "USD", locale="en-US"
            )
        
        if crypto_amount is not None:
            result["amount_crypto"] = float(crypto_amount)
            result["crypto_token"] = crypto_token
            result["crypto_chain"] = crypto_chain
        
        return result
```

### 2. **Merchant Currency Middleware**

Add middleware to inject merchant currency into all responses:

```python
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class MerchantCurrencyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Get merchant from auth token
        merchant = request.state.merchant
        
        # Attach currency formatter to request
        request.state.currency_formatter = CurrencyFormatter(
            merchant_currency=merchant.currency_preference,
            merchant_locale=merchant.locale
        )
        
        response = await call_next(request)
        return response
```

### 3. **Database Schema Updates**

Add currency preference to merchant table:

```sql
ALTER TABLE merchants ADD COLUMN currency_preference VARCHAR(3) DEFAULT 'USD';
ALTER TABLE merchants ADD COLUMN currency_locale VARCHAR(10) DEFAULT 'en-US';
ALTER TABLE merchants ADD COLUMN currency_symbol VARCHAR(5) DEFAULT '$';
ALTER TABLE merchants ADD COLUMN currency_decimal_places INT DEFAULT 2;

-- Create index for faster lookups
CREATE INDEX idx_merchants_currency ON merchants(currency_preference);
```

### 4. **Exchange Rate Service**

Implement real-time exchange rate service:

```python
import httpx
from decimal import Decimal
from datetime import datetime, timedelta

class ExchangeRateService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.cache = {}
        self.cache_ttl = timedelta(hours=1)
    
    async def get_rate(self, from_currency: str, to_currency: str) -> Decimal:
        """Get exchange rate with caching"""
        cache_key = f"{from_currency}_{to_currency}"
        
        if cache_key in self.cache:
            rate, timestamp = self.cache[cache_key]
            if datetime.now() - timestamp < self.cache_ttl:
                return rate
        
        # Fetch from API (e.g., exchangerate-api.com, fixer.io)
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.exchangerate-api.com/v4/latest/{from_currency}"
            )
            data = response.json()
            rate = Decimal(str(data["rates"][to_currency]))
        
        self.cache[cache_key] = (rate, datetime.now())
        return rate
    
    async def convert(
        self,
        amount: Decimal,
        from_currency: str,
        to_currency: str
    ) -> Decimal:
        """Convert amount between currencies"""
        if from_currency == to_currency:
            return amount
        
        rate = await self.get_rate(from_currency, to_currency)
        return amount * rate
```

---

## Frontend Changes Required

### 1. **Remove Frontend Formatting**

Delete or deprecate these functions:
- `formatCurrency()` - Backend now provides formatted strings
- `displayAmount()` - Use `amount.formatted` from API
- `displayDualAmount()` - Use `amount.formatted` and `amount.formatted_usd`
- `getCurrencySymbol()` - Use `amount.symbol` from API

### 2. **Update Type Definitions**

```typescript
// src/types/api.types.ts

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

export interface MerchantCurrency {
  currency: string;
  symbol: string;
  locale: string;
  decimal_places: number;
}

// Update all interfaces to use MonetaryAmount
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
```

### 3. **Update Components**

```tsx
// Before
<div>{formatCurrency(payment.amount_fiat, 'USD')}</div>

// After
<div>{payment.amount.formatted}</div>

// With USD reference
<div>
  <span className="text-2xl">{payment.amount.formatted}</span>
  {payment.amount.formatted_usd && (
    <span className="text-sm text-muted-foreground">
      {payment.amount.formatted_usd}
    </span>
  )}
</div>
```

---

## Migration Strategy

### Phase 1: Backend Updates (Week 1-2)
1. Add merchant currency preference to database
2. Implement CurrencyFormatter service
3. Implement ExchangeRateService
4. Add middleware for currency injection

### Phase 2: API Updates (Week 2-3)
5. Update Analytics APIs
6. Update Payment APIs
7. Update Wallet APIs
8. Update Invoice APIs
9. Update Subscription APIs
10. Update Withdrawal APIs

### Phase 3: Frontend Updates (Week 3-4)
11. Update type definitions
12. Update all components to use new API structure
13. Remove frontend formatting functions
14. Test all pages

### Phase 4: Testing & Deployment (Week 4)
15. Integration testing
16. Currency conversion accuracy testing
17. Performance testing
18. Gradual rollout

---

## Testing Checklist

### Backend Tests
- [ ] Currency formatting for all supported currencies
- [ ] Exchange rate caching works correctly
- [ ] Exchange rate updates every hour
- [ ] Merchant currency preference persists
- [ ] All APIs return MonetaryAmount structure
- [ ] USD conversion is accurate
- [ ] Crypto amount tracking works

### Frontend Tests
- [ ] All amounts display in merchant currency
- [ ] USD reference shows when available
- [ ] No hardcoded currency symbols
- [ ] No frontend currency conversions
- [ ] Charts use correct currency
- [ ] Exports use correct currency
- [ ] Receipts use correct currency

---

## Benefits of Backend-Driven Currency

### 1. **Consistency**
- Single source of truth for currency data
- No discrepancies between pages
- Accurate exchange rates

### 2. **Performance**
- No frontend calculations
- Pre-formatted strings reduce client work
- Cached exchange rates

### 3. **Maintainability**
- Currency logic in one place
- Easy to add new currencies
- Easy to update exchange rate providers

### 4. **Accuracy**
- Real-time exchange rates
- Consistent rounding
- Proper locale formatting

### 5. **Scalability**
- Support for any currency
- Support for multiple currencies per merchant
- Support for crypto + fiat display

---

## Summary

### Current State
❌ Mixed currency sources (USD, USDC, local)  
❌ Frontend-based conversions  
❌ Hardcoded symbols  
❌ Inconsistent API responses  
❌ No centralized currency management  

### Target State
✅ Single MonetaryAmount structure  
✅ Backend-formatted strings  
✅ Real-time exchange rates  
✅ Merchant currency preference  
✅ Consistent across all APIs  
✅ Production-quality currency handling  

This migration will provide a professional, scalable, and maintainable currency system for the entire platform.
