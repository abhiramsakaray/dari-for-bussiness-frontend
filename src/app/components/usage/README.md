# Usage Limits Components

This directory contains all components related to usage limits and upgrade prompts for the Dari Payments platform.

## Components

### UsageDashboard
Full-featured dashboard showing all usage metrics with progress bars, warnings, and upgrade CTAs.

**Route:** `/usage`

**Features:**
- Real-time usage tracking
- Progress bars for all limits
- Warning alerts at 90% usage
- Limit reached alerts at 100%
- Multi-currency support
- Automatic refresh every 30 seconds

### UpgradeModal
Reusable modal shown when users hit their plan limits.

**Props:**
- `isOpen: boolean` - Modal visibility
- `onClose: () => void` - Close handler
- `title: string` - Modal title
- `message: string` - Limit exceeded message
- `currentPlan: string` - Current plan name
- `upgradeUrl?: string` - Upgrade page URL (default: '/billing')

### LimitWarningBanner
Inline warning banner shown at 90% usage.

**Props:**
- `limitType: string` - Type of limit (e.g., "payment links")
- `percentage: number` - Current usage percentage
- `upgradeUrl?: string` - Upgrade page URL (default: '/billing')

### UsageLimitExample
Complete integration examples for all action types. Use this as a reference when integrating limit checks into your components.

## Hooks

### useUsageLimits
React Query hook for fetching usage data.

```typescript
const { usageData, isLoading, error, refetch, checkLimit } = useUsageLimits();
```

### useLimitCheck
Simplified hook for pre-action limit checks.

```typescript
const { checkActionLimit, upgradeModalData, closeUpgradeModal, showUpgradeModal } = useLimitCheck();
```

## Quick Integration

```typescript
import { useLimitCheck } from '../../../hooks/useLimitCheck';
import { UpgradeModal } from '../usage/UpgradeModal';

function MyComponent() {
  const { checkActionLimit, upgradeModalData, closeUpgradeModal, showUpgradeModal } = useLimitCheck();

  const handleCreate = async () => {
    const limitCheck = await checkActionLimit('create_payment_link');
    if (!limitCheck.allowed) return;

    // Proceed with creation
    await api.post('/payment-links', data);
  };

  return (
    <div>
      <Button onClick={handleCreate}>Create</Button>
      
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

## Documentation

- **Quick Start:** `docs/integration/USAGE_LIMITS_QUICK_START.md`
- **Full Guide:** `docs/integration/USAGE_LIMITS_FRONTEND_INTEGRATION.md`
- **Example Code:** `UsageLimitExample.tsx` (this directory)

## Plan Limits

| Plan | Transaction Volume | Payment Links | Invoices | Team Members | Subscription Plans | Active Subscriptions |
|------|-------------------|---------------|----------|--------------|-------------------|---------------------|
| Free | $120 | 5 | 5 | 1 | 0 | 0 |
| Growth | $600 | 15 | 15 | 3 | 3 | 100 |
| Business | $6,000 | 100 | 100 | 25 | 10 | Unlimited |
| Enterprise | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |

*Transaction volume limits are automatically converted to merchant's currency*

**Example:** Free Plan $120 USD = ₹10,000 INR = €110 EUR = £95 GBP

## API Endpoints

- `GET /api/v1/merchants/usage` - Get current usage and limits
- `POST /api/v1/merchants/check-limit` - Check if action is allowed

## Support

For questions or issues:
- Email: support@daripay.xyz
- Documentation: https://docs.daripay.xyz
