# Unified Transactions Quick Reference

## Transaction Type Detection

```typescript
const isSubscription = payment.transaction_type === "subscription";
const isPayment = payment.transaction_type === "payment";
```

## Display Amount (Merchant Currency Priority)

```typescript
// Use merchant currency if available, otherwise fall back to USD/USDC
const displayAmount = payment.merchant_amount_local ?? parseFloat(payment.amount_usdc || '0');
const displayCurrency = payment.merchant_currency || payment.fiat_currency;
const displaySymbol = payment.merchant_currency_symbol || "$";

// Format for display
const formattedAmount = `${displaySymbol}${displayAmount.toFixed(2)} ${displayCurrency}`;
```

## Subscription Badge Component

```tsx
import { Badge } from "./ui/badge";
import { RefreshCw } from "lucide-react";

{payment.transaction_type === "subscription" && (
  <Badge variant="default" className="bg-purple-500 hover:bg-purple-600 gap-1">
    <RefreshCw className="w-3 h-3" />
    Subscription
  </Badge>
)}
```

## Subscription Details Display

```tsx
{payment.transaction_type === "subscription" && payment.subscription_id && (
  <div className="subscription-info">
    <span>Payment #{payment.payment_number}</span>
    <span>
      Period: {new Date(payment.period_start).toLocaleDateString()} - 
      {new Date(payment.period_end).toLocaleDateString()}
    </span>
    <Link to={`/dashboard/subscriptions/${payment.subscription_id}`}>
      View Subscription →
    </Link>
  </div>
)}
```

## Transaction Type Filter

```tsx
import { TransactionTypeFilter } from "./TransactionTypeFilter";
import { TransactionType } from "../../types/api.types";

const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");

// In JSX
<TransactionTypeFilter value={typeFilter} onChange={setTypeFilter} />

// Filter logic
const filteredPayments = payments.filter(payment => 
  typeFilter === "all" || payment.transaction_type === typeFilter
);
```

## New PaymentSession Fields

```typescript
interface PaymentSession {
  // ... existing fields ...
  
  // Transaction type
  transaction_type?: "payment" | "subscription";
  
  // Merchant currency (priority for display)
  merchant_amount_local?: number | null;
  merchant_currency?: string | null;
  merchant_currency_symbol?: string | null;
  
  // Subscription-specific
  subscription_id?: string | null;
  payment_number?: number | null;
  period_start?: string | null;
  period_end?: string | null;
  
  // Refund info
  refund?: RefundInfo | null;
  refund_count?: number;
}
```

## Backward Compatibility

All new fields are optional, so existing code continues to work:

```typescript
// Safe to use without checking
const type = payment.transaction_type || "payment"; // defaults to payment

// Safe navigation
const subscriptionId = payment.subscription_id ?? null;
const paymentNumber = payment.payment_number ?? 0;
```

## Common Patterns

### Check if transaction has subscription data
```typescript
const hasSubscriptionData = payment.subscription_id && payment.payment_number;
```

### Display transaction type icon
```typescript
import { CreditCard, RefreshCw } from "lucide-react";

const TransactionIcon = payment.transaction_type === "subscription" 
  ? <RefreshCw className="text-purple-500" />
  : <CreditCard className="text-blue-500" />;
```

### Navigate to appropriate detail page
```typescript
const handleViewDetails = () => {
  if (payment.transaction_type === "subscription" && payment.subscription_id) {
    navigate(`/dashboard/subscriptions/${payment.subscription_id}`);
  } else {
    navigate(`/dashboard/payments/${payment.id}`);
  }
};
```

## Color Scheme

- **Regular Payments**: Blue (`text-blue-500`, `bg-blue-500`)
- **Subscriptions**: Purple (`text-purple-500`, `bg-purple-500`)
- **Success/Paid**: Green (`text-green-500`, `bg-green-500`)
- **Pending**: Yellow (`text-yellow-500`, `bg-yellow-500`)
- **Failed/Expired**: Red (`text-red-500`, `bg-red-500`)
