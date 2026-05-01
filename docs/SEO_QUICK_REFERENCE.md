# SEO Quick Reference

## How to Add SEO to Any Page

### 1. Import SEO Component
```tsx
import { SEO } from '@/components/SEO';
```

### 2. Add SEO Component at Top of Return
```tsx
export function YourPage() {
  return (
    <>
      <SEO
        title="Your Page Title"
        description="Your page description (150-160 characters)"
        keywords="keyword1, keyword2, keyword3"
        url="https://daripay.xyz/your-page"
      />
      {/* Rest of your page */}
    </>
  );
}
```

## Page-Specific Examples

### Pricing Page
```tsx
<SEO
  title="Pricing — Transparent Crypto Payment Processing Fees"
  description="Start free, pay as you grow. Transparent pricing for crypto payment processing. Plans from $29/month with no hidden fees."
  keywords="crypto payment pricing, stablecoin fees, payment gateway cost, crypto processing fees"
  url="https://daripay.xyz/pricing"
/>
```

### Features Page
```tsx
<SEO
  title="Features — Complete Crypto Payment Infrastructure"
  description="Payment links, invoicing, subscriptions, multi-chain support, webhooks, and more. Everything you need to accept crypto payments."
  keywords="crypto payment features, payment gateway features, crypto invoicing, payment links"
  url="https://daripay.xyz/features"
/>
```

### Payment Links Page
```tsx
<SEO
  title="Payment Links — Generate Shareable Crypto Payment Links"
  description="Create payment links in seconds. Share via email, SMS, or QR code. Accept USDC, USDT across multiple chains. No code required."
  keywords="crypto payment links, payment link generator, shareable payment links, crypto QR code"
  url="https://daripay.xyz/payment-links"
/>
```

### Subscriptions Page
```tsx
<SEO
  title="Subscription Billing — Recurring Crypto Payments Made Simple"
  description="Set up recurring stablecoin payments with automatic invoicing, smart retry logic, and webhook notifications. Track MRR/ARR growth."
  keywords="crypto subscriptions, recurring crypto payments, stablecoin subscriptions, crypto billing"
  url="https://daripay.xyz/subscriptions"
/>
```

### Invoicing Page
```tsx
<SEO
  title="Crypto Invoicing — Professional Invoices with Crypto Payment"
  description="Create and send professional invoices that accept stablecoin payments. Automatic tracking, reminders, and reconciliation."
  keywords="crypto invoicing, stablecoin invoices, blockchain invoicing, crypto billing"
  url="https://daripay.xyz/invoicing"
/>
```

### Developers Page
```tsx
<SEO
  title="Developers — Crypto Payment API Documentation"
  description="Complete API documentation, SDKs, webhooks, and integration guides. Start accepting crypto payments in minutes with our developer-friendly API."
  keywords="crypto payment API, stablecoin API, payment gateway API, blockchain payment integration"
  url="https://daripay.xyz/developers"
/>
```

### API Reference Page
```tsx
<SEO
  title="API Reference — Complete Crypto Payment API Documentation"
  description="Comprehensive API reference for Dari payment gateway. REST API, webhooks, authentication, and code examples."
  keywords="crypto payment API reference, API documentation, payment gateway API, REST API"
  url="https://daripay.xyz/api-reference"
/>
```

## SEO Best Practices

### Title Tags
- Keep under 60 characters
- Include primary keyword
- Make it compelling
- Include brand name at end

### Meta Descriptions
- 150-160 characters optimal
- Include call-to-action
- Use active voice
- Include primary keyword naturally

### Keywords
- 5-10 relevant keywords
- Mix of short and long-tail
- Include variations
- Comma-separated

### URLs
- Use hyphens, not underscores
- Keep short and descriptive
- Include primary keyword
- All lowercase

## Structured Data Examples

### Add FAQ Schema
```tsx
import { faqSchema } from '@/components/SEO';

<SEO
  structuredData={faqSchema([
    {
      question: 'How do I accept crypto payments?',
      answer: 'Sign up for free, create a payment link or invoice, and share it with your customers. They can pay with USDC, USDT, or other stablecoins.'
    },
    {
      question: 'What fees do you charge?',
      answer: 'We charge 1.5% per transaction on the free plan, with lower rates available on paid plans starting at $29/month.'
    }
  ])}
/>
```

### Add Breadcrumb Schema
```tsx
import { breadcrumbSchema } from '@/components/SEO';

<SEO
  structuredData={breadcrumbSchema([
    { name: 'Home', url: 'https://daripay.xyz' },
    { name: 'Features', url: 'https://daripay.xyz/features' },
    { name: 'Payment Links', url: 'https://daripay.xyz/payment-links' }
  ])}
/>
```

### Add Product Schema
```tsx
import { productSchema } from '@/components/SEO';

<SEO
  structuredData={productSchema({
    name: 'Dari Business Plan',
    description: 'Complete crypto payment infrastructure for growing businesses',
    price: '29',
    currency: 'USD'
  })}
/>
```

## Testing Your SEO

### 1. Google Rich Results Test
https://search.google.com/test/rich-results
- Paste your URL
- Check for structured data errors

### 2. Meta Tags Checker
https://metatags.io/
- Preview how your page looks in search results
- Check Open Graph tags

### 3. PageSpeed Insights
https://pagespeed.web.dev/
- Check page load speed
- Get optimization suggestions

## Common Mistakes to Avoid

❌ Duplicate title tags
❌ Missing meta descriptions
❌ Keyword stuffing
❌ Thin content (< 300 words)
❌ Broken internal links
❌ Slow page load times
❌ Not mobile-friendly
❌ Missing alt text on images

## Checklist for Each Page

- [ ] Unique title tag (< 60 chars)
- [ ] Unique meta description (150-160 chars)
- [ ] Relevant keywords
- [ ] Canonical URL
- [ ] H1 heading (one per page)
- [ ] Structured data (if applicable)
- [ ] Internal links to related pages
- [ ] Alt text on all images
- [ ] Mobile-responsive
- [ ] Fast load time (< 3 seconds)
