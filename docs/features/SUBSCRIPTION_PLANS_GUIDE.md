# Subscription Plans & Feature Gating Implementation

## Overview

The Dari for Business platform now includes a complete subscription-based pricing model with feature gating. Users select their plan during onboarding and can upgrade/downgrade anytime through the billing portal.

## What's Implemented

### 1. **Onboarding Flow with Plan Selection**

The onboarding process now includes 4 steps:

1. **Sign Up** - User registration with email/password or Google OAuth
2. **Business Details** - Business information (name, email, country, category)
3. **Plan Selection** ⭐ NEW - Choose from Free, Growth, Business, or Enterprise
4. **Wallet Setup** - Auto-generate blockchain wallets

**Location:** `src/app/components/onboarding/`
- `OnboardingFlow.tsx` - Main orchestrator
- `BusinessDetails.tsx` - Step 2
- `PlanSelection.tsx` - Step 3 (NEW)
- `WalletSetup.tsx` - Step 4

### 2. **Pricing Tiers**

| Plan | Price | Transaction Fee | Key Features |
|------|-------|----------------|--------------|
| **Free** | $0/mo | 1% - 1.5% | Up to $1K volume, 2 payment links, 5 invoices |
| **Growth** | $29/mo | 0.8% - 1% | Up to $50K volume, unlimited links, subscriptions |
| **Business** | $99/mo | 0.5% - 0.8% | Up to $500K volume, multi-chain, fraud monitoring |
| **Enterprise** | Custom | 0.2% - 0.5% | Unlimited, white-label, dedicated support |

### 3. **Billing Management**

**Page:** `/billing` - Full subscription management dashboard

Features:
- View current plan and status
- See usage statistics (volume, links, invoices, team members)
- Upgrade/downgrade plans
- Cancel or reactivate subscription
- Compare all available plans
- Visual progress bars for usage limits

**Components:**
- `src/app/components/Billing.tsx` - Main billing page
- `src/services/billing.service.ts` - API integration
- `src/hooks/useBilling.ts` - React Query hook

### 4. **Feature Gating System**

Automatically restricts features based on subscription plan.

#### Components

**`FeatureGate`** - Wraps features requiring specific plan
```tsx
<FeatureGate feature="has_recurring_payments">
  <RecurringPaymentForm />
</FeatureGate>
```

**`UsageLimitGate`** - Checks usage against limits
```tsx
<UsageLimitGate 
  usage={currentLinks} 
  limit={planLimit} 
  limitName="payment links"
>
  <CreateLinkButton />
</UsageLimitGate>
```

#### Hooks

**`useFeatureAccess(feature)`** - Check if feature is available
```tsx
const hasSubscriptions = useFeatureAccess('has_subscriptions');
```

**`useUsageLimit(usage, limit)`** - Check usage percentage
```tsx
const { canUse, percentage, remaining } = useUsageLimit(linksCreated, linkLimit);
```

**Location:** `src/lib/feature-gate.tsx`

### 5. **Plan Features Matrix**

All feature flags are defined in `PlanFeatures` interface:

```typescript
- monthly_volume_limit: number | null
- payment_links_limit: number | null
- invoices_limit: number | null
- team_members_limit: number | null
- has_recurring_payments: boolean
- has_subscriptions: boolean
- has_full_api_access: boolean
- has_webhooks: boolean
- has_custom_branding: boolean
- has_multi_chain: boolean
- has_advanced_analytics: boolean
- has_fraud_monitoring: boolean
- has_white_label: boolean
- has_dedicated_support: boolean
```

### 6. **Navigation Updates**

- Added "Billing & Plans" link to dashboard sidebar
- Accessible at `#/billing`
- Marked with wallet icon

## API Integration

### Onboarding Endpoints

```
POST /onboarding/business-details
Body: { business_name, country, merchant_category, business_email? }

POST /onboarding/complete
Body: { chains: ['stellar', 'ethereum'], tokens: ['USDC', 'USDT'], auto_generate: true }

GET /onboarding/status
Returns: Current onboarding step and merchant details
```

### Billing Endpoints

```
GET /billing/info
Returns: Subscription, plan details, usage stats, available plans

GET /billing/plans
Returns: List of all available plans

POST /billing/change-plan
Body: { plan: 'growth' }

POST /billing/cancel
Cancel subscription at period end

POST /billing/reactivate
Reactivate canceled subscription

GET /billing/usage
Returns: Current period usage statistics
```

## Usage Examples

### Example 1: Lock Feature Behind Plan

```tsx
import { FeatureGate } from '../../../lib/feature-gate';

export function SubscriptionsPage() {
  return (
    <FeatureGate feature="has_subscriptions">
      <SubscriptionManagement />
    </FeatureGate>
  );
}
```

When the user doesn't have access, they'll see:
> **Upgrade Required**
> This feature is not available on your current plan.
> [Upgrade Plan →]

### Example 2: Check Usage Limit

```tsx
import { UsageLimitGate } from '../../../lib/feature-gate';
import { useBilling } from '../../../hooks/useBilling';

export function CreatePaymentLink() {
  const { billingInfo } = useBilling();
  const currentUsage = billingInfo?.usage.payment_links_created || 0;
  const limit = billingInfo?.plan_details.features.payment_links_limit;

  return (
    <UsageLimitGate 
      usage={currentUsage} 
      limit={limit} 
      limitName="payment links"
    >
      <PaymentLinkForm />
    </UsageLimitGate>
  );
}
```

When limit is reached:
> **Limit Reached**
> You've reached your payment links limit (2/2).
> [Upgrade Plan →]

### Example 3: Conditional UI Based on Plan

```tsx
import { useFeatureAccess } from '../../../lib/feature-gate';

export function PaymentForm() {
  const hasRecurring = useFeatureAccess('has_recurring_payments');
  const hasWebhooks = useFeatureAccess('has_webhooks');

  return (
    <form>
      <input name="amount" />
      
      {hasRecurring && (
        <select name="frequency">
          <option>One-time</option>
          <option>Monthly</option>
          <option>Yearly</option>
        </select>
      )}

      {hasWebhooks && (
        <input name="webhook_url" placeholder="Webhook URL" />
      )}
    </form>
  );
}
```

### Example 4: Show Upgrade Prompt

```tsx
import { Button } from './ui/button';
import { useFeatureAccess } from '../../../lib/feature-gate';

export function AdvancedAnalytics() {
  const hasAdvancedAnalytics = useFeatureAccess('has_advanced_analytics');

  if (!hasAdvancedAnalytics) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <h3>Advanced Analytics</h3>
        <p>Unlock detailed insights with Business plan</p>
        <Button onClick={() => window.location.hash = '#/billing'}>
          Upgrade to Business
        </Button>
      </div>
    );
  }

  return <DetailedAnalyticsDashboard />;
}
```

## Files Modified/Created

### New Files
- `src/app/components/onboarding/PlanSelection.tsx` - Plan selection UI
- `src/app/components/Billing.tsx` - Billing management page
- `src/services/billing.service.ts` - Billing API service
- `src/hooks/useBilling.ts` - Billing React Query hook
- `src/lib/feature-gate.tsx` - Feature gating utilities
- `SUBSCRIPTION_PLANS_GUIDE.md` - This documentation

### Modified Files
- `src/app/components/onboarding/OnboardingFlow.tsx` - Added plan selection step
- `src/app/components/onboarding/WalletSetup.tsx` - Send plan with wallets
- `src/services/onboarding.service.ts` - Added plan submission
- `src/app/App.tsx` - Added /billing route
- `src/app/components/DashboardLayout.tsx` - Added billing nav link

## Testing the Flow

1. **Start Fresh Signup:**
   ```
   Navigate to: http://localhost:5173/#/register
   ```

2. **Complete Onboarding:**
   - Enter name, email, password
   - Fill business details
   - **Select a plan** (defaults to Free)
   - Choose blockchains and tokens
   - Complete setup

3. **Access Billing:**
   ```
   Navigate to: http://localhost:5173/#/billing
   ```

4. **Try Feature Gating:**
   - On Free plan, try creating a subscription (should be blocked)
   - Upgrade to Growth plan
   - Now subscriptions become available

5. **Test Usage Limits:**
   - On Free plan (2 payment links limit)
   - Create 2 payment links
   - Try creating a 3rd → blocked with upgrade prompt

## Next Steps

To enable feature gating on any component:

1. **Import the gate:**
   ```tsx
   import { FeatureGate } from '../../../lib/feature-gate';
   ```

2. **Wrap your feature:**
   ```tsx
   <FeatureGate feature="has_subscriptions">
     <YourComponent />
   </FeatureGate>
   ```

3. **Or check programmatically:**
   ```tsx
   const hasFeature = useFeatureAccess('has_webhooks');
   ```

## Upgrade Paths

| Current Plan | Recommended For | Next Step |
|--------------|----------------|-----------|
| **Free** | Testing, low volume | Upgrade to Growth when > $1K/mo |
| **Growth** | Startups, small business | Upgrade to Business at $50K/mo |
| **Business** | Growing companies | Contact for Enterprise at $500K/mo |
| **Enterprise** | Large institutions | Custom pricing |

## Support

- **View Plans:** Navigate to `#/billing`
- **Change Plan:** Click any plan card in billing page
- **Cancel:** Billing page → "Cancel Plan" button
- **Questions:** Contact sales@dari.in

---

**Implementation Complete:** March 5, 2026
**Version:** 1.0
**Status:** ✅ Ready for Production
