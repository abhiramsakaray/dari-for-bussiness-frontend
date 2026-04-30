# Usage Limits - Frontend Integration Complete

## Overview
This document describes the complete frontend implementation of usage limits and upgrade prompts for the Dari Payments platform.

## Implementation Summary

### Files Created

#### Services
- **`src/services/usage-limits.service.ts`** - API service for usage limits
  - `getUsage()` - Fetch current usage and limits
  - `checkLimit()` - Check if an action is allowed
  - Helper functions for formatting and display

#### Hooks
- **`src/hooks/useUsageLimits.ts`** - React Query hook for usage data
  - Fetches and caches usage data
  - Provides `checkLimit` mutation
  - Auto-refreshes every 30 seconds

- **`src/hooks/useLimitCheck.ts`** - Simplified hook for pre-action checks
  - `checkActionLimit()` - Check before performing actions
  - Automatically manages upgrade modal state
  - Fail-open pattern (allows action if check fails)

#### Components
- **`src/app/components/usage/UsageDashboard.tsx`** - Full usage dashboard
  - Displays all usage metrics with progress bars
  - Shows warnings at 90% usage
  - Shows alerts when limits are reached
  - Integrated with BentoLayout

- **`src/app/components/usage/UpgradeModal.tsx`** - Reusable upgrade modal
  - Shown when limits are reached
  - Displays current plan and upgrade CTA
  - Redirects to billing page

- **`src/app/components/usage/LimitWarningBanner.tsx`** - Inline warning banner
  - Shows at 90% usage
  - Can be placed anywhere in the UI
  - Includes upgrade link

- **`src/app/components/usage/UsageLimitExample.tsx`** - Integration examples
  - Complete code examples for all action types
  - Shows proper error handling
  - Documents the integration pattern

- **`src/app/components/usage/index.ts`** - Barrel export

#### Routes
- **`/usage`** - Usage dashboard page (protected route)

## Usage Guide

### 1. Display Usage Dashboard

The usage dashboard is available at `/usage` and shows all current usage metrics.

```typescript
// Already integrated in AppRouter.tsx
<Route path="/usage" element={<ProtectedRoute><UsageDashboard /></ProtectedRoute>} />
```

### 2. Check Limits Before Actions

Use the `useLimitCheck` hook to check limits before performing actions:

```typescript
import { useLimitCheck } from '../../../hooks/useLimitCheck';
import { UpgradeModal } from '../usage/UpgradeModal';

function MyComponent() {
  const { checkActionLimit, upgradeModalData, closeUpgradeModal, showUpgradeModal } = useLimitCheck();

  const handleCreatePayment = async (amount: number, currency: string) => {
    // Check limit first
    const limitCheck = await checkActionLimit('create_payment', amount, currency);
    
    if (!limitCheck.allowed) {
      // Modal will be shown automatically
      return;
    }

    // Proceed with payment creation
    try {
      await api.post('/payments', { amount, currency });
      toast.success('Payment created!');
    } catch (error) {
      // Handle backend 403 errors
      if (error?.response?.status === 403) {
        const errorData = error.response.data;
        if (errorData.error === 'limit_exceeded') {
          toast.error(errorData.message);
          return;
        }
      }
      toast.error('Failed to create payment');
    }
  };

  return (
    <div>
      <Button onClick={() => handleCreatePayment(1000, 'USD')}>
        Create Payment
      </Button>

      {/* Add upgrade modal */}
      {upgradeModalData && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={closeUpgradeModal}
          title={upgradeModalData.title}
          message={upgradeModalData.message}
          currentPlan={upgradeModalData.currentPlan}
        />
      )}
    </div>
  );
}
```

### 3. Show Inline Warnings

Use the `LimitWarningBanner` component to show warnings at 90% usage:

```typescript
import { useUsageLimits } from '../../../hooks/useUsageLimits';
import { LimitWarningBanner } from '../usage/LimitWarningBanner';

function PaymentLinksPage() {
  const { usageData } = useUsageLimits();

  return (
    <div>
      {usageData && (
        <LimitWarningBanner
          limitType="payment links"
          percentage={usageData.percentages.payment_links}
        />
      )}
      
      {/* Rest of your component */}
    </div>
  );
}
```

### 4. Available Actions

The following actions can be checked:

- `create_payment` - Requires `amount` and `currency` parameters
- `create_payment_link` - No additional parameters
- `create_invoice` - No additional parameters
- `add_team_member` - No additional parameters
- `create_subscription_plan` - No additional parameters
- `accept_subscription` - No additional parameters

## API Integration

### Endpoints Used

#### GET /api/v1/merchants/usage
Returns current usage and limits for all resources.

**Response:**
```json
{
  "plan": "GROWTH",
  "plan_name": "Growth Plan",
  "currency": "INR",
  "limits": {
    "transaction_volume": 50000,
    "payment_links": 15,
    "invoices": 15,
    "team_members": 3,
    "subscription_plans": 3,
    "active_subscriptions": 100
  },
  "usage": {
    "transaction_volume": 35420.50,
    "payment_links": 12,
    "invoices": 8,
    "team_members": 2,
    "subscription_plans": 2,
    "active_subscriptions": 45
  },
  "percentages": {
    "transaction_volume": 70.84,
    "payment_links": 80.00,
    "invoices": 53.33,
    "team_members": 66.67,
    "subscription_plans": 66.67,
    "active_subscriptions": 45.00
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
    "team_members": false,
    "subscription_plans": false,
    "active_subscriptions": false
  }
}
```

#### POST /api/v1/merchants/check-limit
Checks if a specific action is allowed.

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
  "allowed": false,
  "current_usage": 15,
  "limit": 15,
  "percentage": 100,
  "warning_90": false,
  "at_limit": true,
  "message": "Limit exceeded. You've reached your Growth Plan limit of 15 for payment links.",
  "plan_name": "Growth Plan",
  "upgrade_required": true
}
```

### Backend Error Handling

When a limit is exceeded, the backend returns a 403 error:

```json
{
  "error": "limit_exceeded",
  "message": "Limit exceeded. You've reached your Growth Plan limit of 15 for payment links.",
  "limit_type": "payment_links",
  "current_usage": 15,
  "limit": 15,
  "plan": "GROWTH",
  "currency": "INR",
  "upgrade_url": "https://daripay.xyz/billing"
}
```

Handle this in your components:

```typescript
try {
  await api.post('/payment-links', data);
} catch (error) {
  if (error?.response?.status === 403) {
    const errorData = error.response.data;
    if (errorData.error === 'limit_exceeded') {
      toast.error(errorData.message);
      // Optionally show upgrade modal
      return;
    }
  }
  toast.error('Failed to create payment link');
}
```

## Multi-Currency Support

The usage limits system automatically handles multiple currencies:

1. **Base Limits in USD**: All plan limits are stored in USD
2. **Automatic Conversion**: Limits are converted to merchant's currency
3. **Real-time Rates**: Uses live exchange rates
4. **Fallback to USD**: If conversion fails, defaults to USD

### Supported Currencies
- USD (US Dollar)
- INR (Indian Rupee)
- EUR (Euro)
- GBP (British Pound)
- AED (UAE Dirham)
- SAR (Saudi Riyal)

### Currency Display

Always use the `currency` field from the API response:

```typescript
import { usageLimitsService } from '../services/usage-limits.service';

// Good - Uses merchant's currency
const displayAmount = usageLimitsService.formatCurrency(
  usageData.usage.transaction_volume,
  usageData.currency
);

// Bad - Hardcoded currency
const displayAmount = `₹${usageData.usage.transaction_volume}`;
```

## Plan Limits Reference

### Free Plan
- Transaction Volume: $120 USD (converted to merchant's currency)
- Payment Links: 5
- Invoices: 5
- Team Members: 1
- Subscription Plans: 0 (Not available)
- Active Subscriptions: 0 (Not available)

### Growth Plan
- Transaction Volume: $600 USD (converted to merchant's currency)
- Payment Links: 15
- Invoices: 15
- Team Members: 3
- Subscription Plans: 3
- Active Subscriptions: 100

### Business Plan
- Transaction Volume: $6,000 USD (converted to merchant's currency)
- Payment Links: 100
- Invoices: 100
- Team Members: 25
- Subscription Plans: 10
- Active Subscriptions: Unlimited

### Enterprise Plan
- All limits: Unlimited

## Testing Checklist

- [ ] Usage dashboard displays correctly for all plans
- [ ] Progress bars update in real-time
- [ ] Currency symbols display correctly (₹, $, €, £, etc.)
- [ ] Transaction volume shows in merchant's currency
- [ ] Warning banners appear at 90% usage
- [ ] Limit exceeded modals block actions at 100%
- [ ] Upgrade CTAs redirect to billing page
- [ ] Free plan users see "Upgrade to enable subscriptions" message
- [ ] Growth plan shows subscription limits (3 plans, 100 active)
- [ ] Business plan shows unlimited active subscriptions
- [ ] Enterprise plan shows all unlimited
- [ ] Multi-currency merchants see correct conversions
- [ ] USD fallback works when currency conversion fails
- [ ] Backend 403 errors are handled gracefully
- [ ] Limit checks fail open (allow action if check fails)

## Integration Steps for Existing Components

To add limit checks to existing components:

1. **Import the hook and modal:**
   ```typescript
   import { useLimitCheck } from '../../../hooks/useLimitCheck';
   import { UpgradeModal } from '../usage/UpgradeModal';
   ```

2. **Use the hook:**
   ```typescript
   const { checkActionLimit, upgradeModalData, closeUpgradeModal, showUpgradeModal } = useLimitCheck();
   ```

3. **Check before action:**
   ```typescript
   const limitCheck = await checkActionLimit('create_payment_link');
   if (!limitCheck.allowed) return;
   ```

4. **Add modal to JSX:**
   ```typescript
   {upgradeModalData && (
     <UpgradeModal
       isOpen={showUpgradeModal}
       onClose={closeUpgradeModal}
       title={upgradeModalData.title}
       message={upgradeModalData.message}
       currentPlan={upgradeModalData.currentPlan}
     />
   )}
   ```

5. **Handle backend errors:**
   ```typescript
   catch (error) {
     if (error?.response?.status === 403 && error.response.data.error === 'limit_exceeded') {
       toast.error(error.response.data.message);
     }
   }
   ```

## Next Steps

1. **Integrate with existing components:**
   - CreatePayment.tsx
   - CreatePaymentLinkForm.tsx
   - CreateInvoiceForm.tsx
   - TeamMembersList.tsx
   - SubscriptionsDashboard.tsx

2. **Add usage widget to dashboard:**
   - Show quick usage summary on main dashboard
   - Link to full usage page

3. **Add navigation link:**
   - Add "Usage & Limits" to sidebar navigation
   - Show badge when approaching limits

4. **Email notifications:**
   - Backend sends emails at 90% and 100%
   - No frontend work needed

## Support

For questions or issues:
- Email: support@daripay.xyz
- Documentation: https://docs.daripay.xyz
- Example Component: `src/app/components/usage/UsageLimitExample.tsx`
