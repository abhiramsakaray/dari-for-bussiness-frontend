# Backend Requirements - Usage Limits Implementation

## Overview

The backend needs to implement usage limits with multi-currency support. Limits are stored in USD and converted to the merchant's currency before being sent to the frontend.

## ✅ Correct Plan Limits (in USD)

| Plan | Transaction Volume | Payment Links | Invoices | Team Members | Subscription Plans | Active Subscriptions |
|------|-------------------|---------------|----------|--------------|-------------------|---------------------|
| Free | $120 | 5 | 5 | 1 | 0 | 0 |
| Growth | $600 | 15 | 15 | 3 | 3 | 100 |
| Business | $6,000 | 100 | 100 | 25 | 10 | Unlimited |
| Enterprise | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |

## 🔄 Currency Conversion Flow

1. **Store limits in USD** in the database
2. **Get merchant's currency** from their profile (INR, EUR, GBP, etc.)
3. **Convert USD limits** to merchant's currency using live exchange rates
4. **Return converted limits** in API responseslinks": 2,
    "invoices": 5,
    "team_members": 1,
    "subscription_plans": 0,
    "active_subscriptions": 0
  },
  
  "usage": {
    "transaction_volume": 42.5,
    "payment_links": 0,
    "invoices": 3,
    "team_members": 1,
    "subscription_plans": 0,
    "active_subscriptions": 0
  },
  
  "percentages": {
    "transaction_volume": 0.43,  // 42.5 / 10000 * 100
    "payment_links": 0,
    "invoices": 60,  // 3 / 5 * 100
    "team_members": 100,  // 1 / 1 * 100
    "subscription_plans": 0,
    "active_subscriptions": 0
  },
  
  "warnings": {
    "transaction_volume": false,
    "payment_links": false,
    "invoices": false,
    "team_members": false,
    "subscription_plans": false,
    "active_subscriptions": false
  },
  
  "at_limit": {
    "transaction_volume": false,
    "payment_links": false,
    "invoices": false,
    "team_members": true,  // 100% usage
    "subscription_plans": false,
    "active_subscriptions": false
  }
}
```

### 3. POST /api/v1/merchants/check-limit (NEW - Optional)

Check if an action is allowed before performing it.

**Request:**
```json
{
  "action": "create_payment",
  "amount": 1000,
  "currency": "INR"
}
```

**Response:**
```json
{
  "allowed": true,
  "current_usage": 42.5,
  "limit": 10000,
  "percentage": 0.43,
  "warning_90": false,
  "at_limit": false,
  "message": "Action allowed",
  "plan_name": "Free Plan",
  "upgrade_required": false
}
```

**When limit is exceeded:**
```json
{
  "allowed": false,
  "current_usage": 10000,
  "limit": 10000,
  "percentage": 100,
  "warning_90": false,
  "at_limit": true,
  "message": "Limit exceeded. You've reached your Free Plan limit of ₹10,000 for transaction volume.",
  "plan_name": "Free Plan",
  "upgrade_required": true
}
```

## 💾 Database Schema

### merchants table
```sql
ALTER TABLE merchants ADD COLUMN base_currency VARCHAR(3) DEFAULT 'USD';
ALTER TABLE merchants ADD COLUMN country VARCHAR(100);
```

### subscription_plans table (if not exists)
```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY,
  tier VARCHAR(20) NOT NULL,  -- 'free', 'growth', 'business', 'enterprise'
  
  -- Prices in USD (will be converted)
  monthly_price_usd DECIMAL(10, 2) NOT NULL,
  
  -- Transaction fees
  transaction_fee_min DECIMAL(5, 2) NOT NULL,
  transaction_fee_max DECIMAL(5, 2) NOT NULL,
  
  -- Limits in USD (will be converted)
  monthly_volume_limit_usd DECIMAL(15, 2),  -- NULL = unlimited
  payment_link_limit INTEGER,  -- NULL = unlimited
  invoice_limit INTEGER,  -- NULL = unlimited
  team_member_limit INTEGER,  -- NULL = unlimited
  subscription_plan_limit INTEGER,  -- NULL = unlimited
  active_subscription_limit INTEGER,  -- NULL = unlimited
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default plans
INSERT INTO subscription_plans (tier, monthly_price_usd, transaction_fee_min, transaction_fee_max, monthly_volume_limit_usd, payment_link_limit, invoice_limit, team_member_limit, subscription_plan_limit, active_subscription_limit) VALUES
('free', 0, 1.0, 1.5, 120, 5, 5, 1, 0, 0),
('growth', 29, 0.8, 1.0, 600, 15, 15, 3, 3, 100),
('business', 99, 0.5, 0.8, 6000, 100, 100, 25, 10, NULL),
('enterprise', 300, 0.2, 0.5, NULL, NULL, NULL, NULL, NULL, NULL);
```

## 🔄 Currency Conversion Service

### Python Example

```python
import requests
from decimal import Decimal
from typing import Optional

class CurrencyConverter:
    """Convert USD amounts to merchant's currency"""
    
    def __init__(self):
        self.cache = {}  # Cache exchange rates
        self.cache_ttl = 3600  # 1 hour
    
    def get_exchange_rate(self, from_currency: str, to_currency: str) -> Decimal:
        """Get exchange rate from external API"""
        if from_currency == to_currency:
            return Decimal("1.0")
        
        # Check cache
        cache_key = f"{from_currency}_{to_currency}"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        # Fetch from API (example using exchangerate-api.com)
        response = requests.get(
            f"https://api.exchangerate-api.com/v4/latest/{from_currency}"
        )
        data = response.json()
        rate = Decimal(str(data["rates"][to_currency]))
        
        # Cache it
        self.cache[cache_key] = rate
        return rate
    
    def convert_usd_to_merchant_currency(
        self, 
        amount_usd: Decimal, 
        merchant_currency: str
    ) -> Decimal:
        """Convert USD amount to merchant's currency"""
        if merchant_currency == "USD":
            return amount_usd
        
        rate = self.get_exchange_rate("USD", merchant_currency)
        return amount_usd * rate

# Usage
converter = CurrencyConverter()

# Convert Free plan limit ($120 USD) to INR
free_limit_usd = Decimal("120")
merchant_currency = "INR"
free_limit_inr = converter.convert_usd_to_merchant_currency(
    free_limit_usd, 
    merchant_currency
)
print(f"Free plan limit: ${free_limit_usd} USD = ₹{free_limit_inr} INR")
# Output: Free plan limit: $120 USD = ₹10000 INR (rounded)
```

### Node.js/TypeScript Example

```typescript
import axios from 'axios';

interface ExchangeRates {
  [currency: string]: number;
}

class CurrencyConverter {
  private cache: Map<string, number> = new Map();
  private cacheTTL = 3600000; // 1 hour in ms

  async getExchangeRate(from: string, to: string): Promise<number> {
    if (from === to) return 1.0;

    const cacheKey = `${from}_${to}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Fetch from API
    const response = await axios.get(
      `https://api.exchangerate-api.com/v4/latest/${from}`
    );
    const rate = response.data.rates[to];

    // Cache it
    this.cache.set(cacheKey, rate);
    setTimeout(() => this.cache.delete(cacheKey), this.cacheTTL);

    return rate;
  }

  async convertUsdToMerchantCurrency(
    amountUsd: number,
    merchantCurrency: string
  ): Promise<number> {
    if (merchantCurrency === 'USD') return amountUsd;

    const rate = await this.getExchangeRate('USD', merchantCurrency);
    return Math.round(amountUsd * rate);
  }
}

// Usage
const converter = new CurrencyConverter();

const freeLimitUsd = 120;
const merchantCurrency = 'INR';
const freeLimitInr = await converter.convertUsdToMerchantCurrency(
  freeLimitUsd,
  merchantCurrency
);
console.log(`Free plan limit: $${freeLimitUsd} USD = ₹${freeLimitInr} INR`);
// Output: Free plan limit: $120 USD = ₹10000 INR (rounded)
```

## 🔍 Usage Tracking

Track usage in merchant's currency:

```python
def track_payment(merchant_id: str, amount: Decimal, currency: str):
    """Track a payment against merchant's monthly volume"""
    merchant = get_merchant(merchant_id)
    
    # Convert payment amount to merchant's base currency
    if currency != merchant.base_currency:
        converter = CurrencyConverter()
        amount = converter.convert(
            amount, 
            from_currency=currency, 
            to_currency=merchant.base_currency
        )
    
    # Add to monthly volume
    merchant.current_volume += amount
    merchant.save()
    
    # Check if limit exceeded
    if merchant.monthly_volume_limit:
        if merchant.current_volume >= merchant.monthly_volume_limit:
            # Send notification
            send_limit_reached_email(merchant)
            # Block further payments
            raise LimitExceededError(
                f"Monthly volume limit of {merchant.currency_symbol}"
                f"{merchant.monthly_volume_limit} reached"
            )
```

## 📧 Email Notifications

Send emails at 90% and 100% usage:

```python
def check_usage_and_notify(merchant_id: str):
    """Check usage and send notifications"""
    merchant = get_merchant(merchant_id)
    
    # Calculate percentages
    volume_pct = (merchant.current_volume / merchant.monthly_volume_limit) * 100
    
    # 90% warning
    if volume_pct >= 90 and not merchant.warning_90_sent:
        send_warning_email(merchant, "transaction_volume", volume_pct)
        merchant.warning_90_sent = True
        merchant.save()
    
    # 100% limit reached
    if volume_pct >= 100 and not merchant.limit_reached_sent:
        send_limit_reached_email(merchant, "transaction_volume")
        merchant.limit_reached_sent = True
        merchant.save()
```

## ✅ Testing Checklist

- [ ] Limits stored in USD in database
- [ ] Currency conversion working for all supported currencies
- [ ] `/billing/info` returns converted limits
- [ ] Usage tracked in merchant's currency
- [ ] Percentages calculated correctly
- [ ] 90% warning emails sent
- [ ] 100% limit emails sent
- [ ] Payments blocked when limit reached
- [ ] Free plan: $120 USD = ₹10,000 INR
- [ ] Growth plan: $600 USD = ₹50,000 INR
- [ ] Business plan: $6,000 USD = ₹5,00,000 INR

## 🆘 Support

For implementation questions:
- Email: developers@daripay.xyz
- Docs: https://docs.daripay.xyz
