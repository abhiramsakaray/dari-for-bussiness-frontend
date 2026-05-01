# Create Subscription Plan Page

## Overview
A dedicated full-page form for creating subscription plans, integrated into the same BentoLayout as other dashboard pages. Includes tier-based limit enforcement with upgrade prompts.

## Location
- **Route**: `/subscriptions-dashboard/new`
- **Component**: `src/app/components/subscriptions/CreateSubscriptionPlanForm.tsx`

## Features

### 1. Basic Information
- Plan name (required)
- Description (optional)
- Currency selection (USD, EUR, GBP, AED, INR)

### 2. Pricing & Billing Cycle
- Recurring amount (required)
- Billing interval (daily, weekly, monthly, quarterly, yearly)
- Interval count (e.g., every 2 months)
- Setup fee (optional one-time charge)
- Max billing cycles (optional, unlimited by default)
- Real-time pricing summary

### 3. Trial Period (Optional)
- Trial duration in days
- Trial type:
  - Free trial
  - Reduced price trial
- Trial price (for reduced price trials)
- Visual feedback showing trial details

### 4. Payment Methods
- Token selection (USDC, USDT, XLM, ETH, MATIC)
- Chain selection (Stellar, Polygon, Ethereum, Base, BSC, Avalanche, Arbitrum, Solana)
- Multi-select checkboxes for both

### 5. Plan Features
- Add/remove feature list items
- Dynamic feature management
- Visual list display

### 6. Tier-Based Limits ✨ NEW
- **Proactive limit checking** on page load
- **Warning banner** when limit is reached
- **Disabled submit button** when at limit
- **Upgrade modal** with clear messaging
- **Graceful error handling** for 403 responses

## Tier Limits

| Tier       | Subscription Plans | Active Subscriptions | Message                                    |
|------------|-------------------|----------------------|--------------------------------------------|
| FREE       | 0 (blocked)       | 0 (blocked)          | "Please upgrade to Growth or Business plan"|
| GROWTH     | 3 max             | 100 max              | "Upgrade to Business for more"             |
| BUSINESS   | 10 max            | Unlimited            | "Upgrade to Enterprise"                    |
| ENTERPRISE | Unlimited         | Unlimited            | N/A                                        |

## User Flow

1. User clicks "New Plan" button on Subscriptions Dashboard
2. Navigates to full-page form (not a popup)
3. **System checks tier limits** and shows warning if at limit
4. Fills out plan details across organized sections
5. Reviews pricing summary in real-time
6. Submits form (blocked if at limit)
7. **Backend validates limits** and returns 403 if exceeded
8. **Frontend shows upgrade message** from backend response
9. Redirects back to Subscriptions Dashboard on success

## Error Handling

### Limit Reached (403 Forbidden)
- Shows warning banner at top of form
- Disables submit button
- Displays backend message: "Please upgrade to Growth or Business plan"
- Provides "Upgrade Plan" button linking to `/billing`
- Toast notification with upgrade suggestion

### Other Errors
- Generic error toast with error message
- Form remains enabled for retry
- No navigation on error

## Design Patterns

### Layout
- Uses `BentoLayout` for consistent navigation
- Card-based sections for organization
- Responsive grid layouts (1 column mobile, 2-3 columns desktop)

### Form Validation
- Zod schema validation
- React Hook Form for state management
- Real-time error messages
- Required field indicators

### User Experience
- Back button to return to dashboard
- Cancel button to abandon changes
- Loading states during submission
- Success/error toast notifications
- Helpful hints and descriptions
- Real-time pricing calculations
- **Proactive limit warnings**
- **Clear upgrade paths**

## Technical Details

### Dependencies
- React Hook Form + Zod for form management
- Shadcn UI components (Button, Input, Card, Alert, etc.)
- Subscriptions service for API calls
- **useLimitCheck hook** for tier enforcement
- Toast notifications via Sonner

### API Integration
- Calls `subscriptionsService.createPlan()`
- Handles success/error states
- **Checks limits via `checkActionLimit('create_subscription_plan')`**
- Proper error messaging with upgrade prompts

### Navigation
- Hash-based routing (`/subscriptions-dashboard/new`)
- Programmatic navigation via `window.location.href`

## Benefits Over Popup

1. **More Space**: Full page allows for comprehensive form without scrolling issues
2. **Better UX**: Dedicated focus on plan creation
3. **Easier Navigation**: Clear back button and breadcrumb context
4. **Consistent Pattern**: Matches invoice and payment link creation flows
5. **Mobile Friendly**: Better responsive behavior on small screens
6. **Better Error Display**: Room for warning banners and upgrade prompts

## Future Enhancements

- Plan templates for quick setup
- Duplicate existing plan feature
- Preview mode before creation
- Advanced metadata configuration
- Custom field support
- In-app upgrade flow without leaving the page
