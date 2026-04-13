# DARI Upgrade Messaging System

## Overview

Dynamic, data-driven upgrade messaging system that generates contextual prompts based on real user behavior and usage patterns. All messages are personalized using actual user data - no hardcoded values.

## Features

- **6 Psychological Triggers**: Usage limits, save money, save time, ROI, social proof, feature unlocks
- **4 Urgency Levels**: Critical, high, medium, low
- **Smart Timing**: Respects user preferences, doesn't spam
- **Dismissible**: Users can dismiss non-critical messages
- **Free Trial Offers**: Automatically includes 7-day trial CTAs where appropriate
- **Multi-Channel**: Dashboard banners, popups, emails, WhatsApp

## Implementation

### 1. Usage Limit Messages

Triggered when users approach or exceed plan limits.

**Examples (all data-driven):**

```typescript
// Payment Links Limit (80-95% usage)
"⚠️ Running Low on Payment Links"
"You've used 4 of 5 payment links (80%). Upgrade to Growth for unlimited links and keep your business running smoothly."
CTA: "Upgrade to Growth" | "View Plans"

// Critical (95%+ usage)
"🚨 Payment Links Limit Reached"
"You've used 5 of 5 payment links (100%). Upgrade to Growth for unlimited links and keep your business running smoothly."
CTA: "Upgrade to Growth" (non-dismissible)

// Invoices Limit
"⚠️ Invoice Limit Almost Full"
"You've created 4 of 5 invoices this month (80%). Upgrade for unlimited invoicing and professional billing features."
CTA: "Unlock Unlimited" | "See Pricing"

// Team Members
"👥 Need More Team Members?"
"You've reached your team limit (1/1). Upgrade to Growth to add more team members and collaborate better."
CTA: "Upgrade to Growth"

// Monthly Volume
"📊 You're Growing Fast!"
"You've processed ₹85,000 this month. You're approaching the ₹1,00,000 free tier limit. Upgrade now to avoid service interruption."
CTA: "Upgrade Now" | "Learn More"
```

### 2. Save Money Messages

Shows potential savings based on actual transaction volume.

**Examples:**

```typescript
// Fee Savings (calculated from real volume)
"💰 You Could Be Saving Money"
"Based on your ₹50,000/month volume, upgrading to Growth would save you ~₹750/month (₹9,000/year) in transaction fees."
CTA: "Save ₹750/mo" | "See Breakdown"

// High Volume
"🎯 Unlock Lower Transaction Fees"
"You're processing ₹2,50,000/month. Business plan offers 0.5-0.8% fees vs your current 1-1.5%. That's real savings at scale."
CTA: "Calculate Savings"

// Enterprise Volume
"🏢 Ready for Enterprise?"
"Processing ₹50L/month? Get 0.2-0.5% fees, dedicated support, SLA guarantees, and custom integrations with Enterprise."
CTA: "Talk to Sales"
```

### 3. Save Time Messages

Automation opportunities based on manual work patterns.

**Examples:**

```typescript
// Subscription Automation
"⏰ Automate Recurring Payments"
"You've processed 25 payments manually. Set up subscriptions to automate recurring billing and save hours every month."
CTA: "Try Subscriptions" | "Learn How"

// API Automation
"🚀 Automate with API Integration"
"Creating 45 payments manually? Integrate our API and automate your entire payment flow. Save hours every week."
CTA: "Get API Access"

// Team Collaboration
"👥 Scale with Your Team"
"Managing 30 payments alone? Add team members to distribute work, set permissions, and move faster."
CTA: "Add Team Members"
```

### 4. ROI Messages

Growth trajectory and business impact.

**Examples:**

```typescript
// Growth Trajectory
"📈 Your Business is Growing"
"You processed ₹75,000 this month. At this rate, you'll do ₹9L annually. Upgrade now to save ₹13,500/year in fees and unlock growth features."
CTA: "Upgrade & Save" | "View ROI"

// Power User
"🎯 You're a Power User"
"127 payments processed! You're clearly serious about this. Upgrade to Growth for advanced analytics, webhooks, and priority support to scale even faster."
CTA: "Unlock Pro Features"

// Enterprise Ready
"🏢 Ready for Enterprise?"
"Processing ₹50L/month? Get 0.2-0.5% fees, dedicated support, SLA guarantees, and custom integrations with Enterprise."
CTA: "Talk to Sales"
```

### 5. Social Proof Messages

Trust and validation from other users.

**Examples:**

```typescript
// New User Onboarding
"🌟 Join 500+ Growing Businesses"
"Businesses on Growth plan process 3x more payments and save an average of ₹15K/month in fees. Start your 7-day free trial today."
CTA: "Start Free Trial"

// Active User
"✨ Trusted by 500+ Businesses"
"Companies like yours upgraded to Growth and saw 40% faster payment collection with automated subscriptions and smart retry logic."
CTA: "See Success Stories" | "Upgrade Now"

// Industry Specific
"🏪 Join 200+ E-commerce Stores"
"E-commerce businesses on DARI process ₹10Cr+ monthly with 99.9% uptime and instant settlements."
CTA: "See Case Studies"
```

### 6. Feature Unlock Messages

Highlight premium features users are missing.

**Examples:**

```typescript
// Webhooks
"🔔 Real-time Payment Notifications"
"Get instant webhooks when payments complete. Automate order fulfillment, send receipts, and update your systems in real-time."
CTA: "Enable Webhooks"

// Advanced Analytics
"📊 Unlock Advanced Analytics"
"Track MRR/ARR, conversion rates, customer lifetime value, and more. Make data-driven decisions with Growth plan analytics."
CTA: "See Analytics"

// Fraud Monitoring
"🛡️ Protect Your Revenue"
"Processing ₹1.5L/month? Business plan includes fraud monitoring, risk assessment, and automatic flagging to protect your business."
CTA: "Add Protection"

// Multi-chain Routing
"⚡ Optimize Transaction Costs"
"Automatic routing to lowest-fee chains can save you 30-50% on transaction costs. Available on Business plan."
CTA: "Learn More"
```

## Email Subject Lines

All dynamically generated based on user data:

```typescript
// Volume-based
"Save ₹9,000/year on transaction fees"
"Your business processed ₹50,000 this month"

// Activity-based
"You've processed 127 payments - time to upgrade?"
"3 features you're missing on the free plan"

// Generic high-converting
"🚀 Unlock unlimited payments + 7-day free trial"
"Lower fees + better features = more profit"
"500+ businesses trust DARI Growth plan"
"Your payment volume is growing - here's how to save"
"Automate your billing and save 10 hours/week"
```

## WhatsApp Campaign Messages

Short, mobile-optimized messages:

```typescript
// Usage Alert
"Hi [Name]! 👋
You've used 4/5 payment links this month. Upgrade to Growth for unlimited links + 7-day free trial.
Upgrade: [link]"

// Savings Opportunity
"Hi [Name]! 💰
Based on your ₹50K/month volume, you could save ₹9K/year with Growth plan's lower fees.
Calculate savings: [link]"

// Feature Unlock
"Hi [Name]! 🚀
You've processed 45 payments manually. Automate with subscriptions and save hours every week.
Try free: [link]"

// ROI Message
"Hi [Name]! 📈
Your business did ₹75K this month! At this rate, you'll hit ₹9L annually. Upgrade to scale faster.
See plans: [link]"
```

## Landing Page Copy

### Hero Section Variants

```typescript
// For high-volume users
"You're Processing ₹[X]/Month"
"Upgrade to save ₹[Y]/year in fees + unlock premium features"

// For active users
"[X] Payments and Counting"
"Join [Y] businesses that upgraded to scale faster"

// For new users
"Start Free, Upgrade When Ready"
"500+ businesses trust DARI for stablecoin payments"
```

### Feature Comparison

```typescript
// Free vs Growth
"Free: 2 payment links | Growth: Unlimited"
"Free: 5 invoices/month | Growth: Unlimited"
"Free: 1 team member | Growth: 3 team members"
"Free: 1-1.5% fees | Growth: 0.8-1% fees"

// Growth vs Business
"Growth: 0.8-1% fees | Business: 0.5-0.8% fees"
"Growth: Basic analytics | Business: Advanced analytics + fraud monitoring"
"Growth: 3 team members | Business: 10 team members"
```

## Usage in Code

### Dashboard Banner

```typescript
import { useUpgradeMessages } from '@/hooks/useUpgradeMessages';
import { UpgradeBanner } from '@/components/ui/upgrade-banner';

function Dashboard() {
  const { dashboardBanner, dismissMessage } = useUpgradeMessages();
  
  return (
    <div>
      {dashboardBanner && (
        <UpgradeBanner
          message={dashboardBanner}
          onDismiss={() => dismissMessage(dashboardBanner.id)}
          onUpgrade={() => navigate('/billing')}
          onSecondaryAction={() => navigate('/pricing')}
        />
      )}
    </div>
  );
}
```

### Inline Compact Banner

```typescript
import { UpgradeBannerCompact } from '@/components/ui/upgrade-banner';

function PaymentsList() {
  const { messages, dismissMessage } = useUpgradeMessages();
  const limitMessage = messages.find(m => m.trigger === 'usage_limit');
  
  return (
    <div>
      {limitMessage && (
        <UpgradeBannerCompact
          message={limitMessage}
          onDismiss={() => dismissMessage(limitMessage.id)}
          onUpgrade={() => navigate('/billing')}
        />
      )}
    </div>
  );
}
```

### Modal Popup

```typescript
import { UpgradeModal } from '@/components/ui/upgrade-banner';

function App() {
  const { messages, dismissMessage } = useUpgradeMessages();
  const criticalMessage = messages.find(m => m.urgency === 'critical');
  
  return (
    <>
      {criticalMessage && (
        <UpgradeModal
          message={criticalMessage}
          onDismiss={() => dismissMessage(criticalMessage.id)}
          onUpgrade={() => navigate('/billing')}
        />
      )}
    </>
  );
}
```

## Best Practices

1. **Timing**: Don't show upgrade prompts more than once per 24 hours
2. **Relevance**: Only show messages relevant to user's actual usage
3. **Urgency**: Use critical urgency sparingly (only for blocking issues)
4. **Dismissibility**: Allow users to dismiss low/medium urgency messages
5. **Free Trial**: Always offer 7-day trial for first-time upgrade prompts
6. **Data Accuracy**: Ensure all numbers are real-time and accurate
7. **Testing**: A/B test different message variations
8. **Localization**: Format currency and numbers according to user's locale

## Analytics Tracking

Track these events for optimization:

```typescript
// Message shown
analytics.track('upgrade_message_shown', {
  message_id: message.id,
  trigger: message.trigger,
  urgency: message.urgency,
  target_plan: message.targetPlan,
});

// Message dismissed
analytics.track('upgrade_message_dismissed', {
  message_id: message.id,
  trigger: message.trigger,
});

// CTA clicked
analytics.track('upgrade_cta_clicked', {
  message_id: message.id,
  trigger: message.trigger,
  cta_text: message.cta,
  target_plan: message.targetPlan,
});

// Conversion
analytics.track('upgrade_completed', {
  from_plan: 'free',
  to_plan: 'growth',
  triggered_by_message: message.id,
});
```

## Conversion Optimization Tips

1. **Personalization**: Use user's name, actual numbers, and specific features they use
2. **Urgency**: Create FOMO with limited-time offers or approaching limits
3. **Social Proof**: Show real numbers (500+ businesses, ₹10Cr+ processed)
4. **Clear Value**: Always show concrete savings or time saved
5. **Easy Action**: One-click upgrade with free trial, no credit card required
6. **Follow-up**: Send email reminder 24 hours after dismissing a message
7. **Segmentation**: Different messages for different user segments (e-commerce, SaaS, freelancers)

## Future Enhancements

- [ ] A/B testing framework for message variations
- [ ] Machine learning to predict best message timing
- [ ] Personalized discount codes for high-value users
- [ ] Video testimonials from similar businesses
- [ ] Live chat integration for enterprise inquiries
- [ ] Referral program integration
- [ ] Success story carousel
- [ ] ROI calculator widget
