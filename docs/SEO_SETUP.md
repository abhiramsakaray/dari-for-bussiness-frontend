# SEO Setup Guide for Dari for Business

## Overview
This document outlines the SEO implementation for Dari for Business to achieve high search engine rankings and rich search results with sitelinks (like Hostinger example).

## Files Created

### 1. `/public/robots.txt`
- Allows all search engine crawlers
- Blocks admin/dashboard pages from indexing
- Points to sitemap location

### 2. `/public/sitemap.xml`
- Complete sitemap of all public pages
- Includes priority and change frequency
- Helps search engines discover all pages

### 3. `/src/components/SEO.tsx`
- Reusable SEO component with Helmet
- Structured data schemas (Organization, Website, Product, FAQ, Breadcrumb)
- Open Graph and Twitter Card support

## Implementation Steps

### Step 1: Add SEO to Landing Pages

Update each landing page component to include SEO:

```tsx
import { SEO, organizationSchema, websiteSchema } from '@/components/SEO';

export function NewLanding() {
  return (
    <>
      <SEO
        title="Dari for Business — Stablecoin Payment Infrastructure"
        description="Accept crypto payments with Dari. Multi-chain payment gateway for stablecoins (USDC, USDT). Payment links, invoicing, subscriptions, and more."
        keywords="crypto payments, stablecoin payments, USDC, USDT, payment gateway"
        url="https://daripay.xyz"
        structuredData={[organizationSchema, websiteSchema]}
      />
      {/* Page content */}
    </>
  );
}
```

### Step 2: Add SEO to Feature Pages

#### Pricing Page
```tsx
<SEO
  title="Pricing"
  description="Transparent pricing for crypto payment processing. Free tier available. Pay-as-you-grow plans starting from $29/month."
  keywords="crypto payment pricing, stablecoin payment fees, payment gateway pricing"
  url="https://daripay.xyz/pricing"
  structuredData={productSchema({
    name: 'Dari Business Plan',
    description: 'Complete crypto payment infrastructure',
    price: '29',
    currency: 'USD'
  })}
/>
```

#### Payment Links Page
```tsx
<SEO
  title="Payment Links"
  description="Generate shareable payment links in seconds. Accept crypto payments via link. No code required. Perfect for freelancers and creators."
  keywords="crypto payment links, payment link generator, shareable payment links"
  url="https://daripay.xyz/payment-links"
/>
```

#### Subscriptions Page
```tsx
<SEO
  title="Subscription Billing"
  description="Recurring stablecoin payments made simple. Set up subscription billing with automatic invoicing and smart retry logic."
  keywords="crypto subscriptions, recurring crypto payments, stablecoin subscriptions"
  url="https://daripay.xyz/subscriptions"
/>
```

### Step 3: Add Breadcrumb Schema

For nested pages, add breadcrumb structured data:

```tsx
<SEO
  structuredData={breadcrumbSchema([
    { name: 'Home', url: 'https://daripay.xyz' },
    { name: 'Features', url: 'https://daripay.xyz/features' },
    { name: 'Payment Links', url: 'https://daripay.xyz/payment-links' }
  ])}
/>
```

### Step 4: Add FAQ Schema

For pages with FAQs:

```tsx
<SEO
  structuredData={faqSchema([
    {
      question: 'What cryptocurrencies do you support?',
      answer: 'We support USDC, USDT, and other major stablecoins across multiple chains including Ethereum, Polygon, Stellar, Base, BSC, and more.'
    },
    {
      question: 'How long does it take to get started?',
      answer: 'You can start accepting crypto payments in under 5 minutes. Simply sign up, create a payment link, and share it with your customers.'
    }
  ])}
/>
```

## Google Search Console Setup

### 1. Verify Ownership
- Go to [Google Search Console](https://search.google.com/search-console)
- Add property: `daripay.xyz`
- Verify using HTML file or DNS record

### 2. Submit Sitemap
- In Search Console, go to Sitemaps
- Submit: `https://daripay.xyz/sitemap.xml`

### 3. Request Indexing
- Use URL Inspection tool
- Request indexing for key pages:
  - Homepage
  - Pricing
  - Features
  - Payment Links
  - Subscriptions
  - Developers

## Bing Webmaster Tools

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add site: `daripay.xyz`
3. Submit sitemap: `https://daripay.xyz/sitemap.xml`

## Getting Sitelinks (Like Hostinger)

To get rich sitelinks in search results:

### 1. Clear Site Structure
✅ Already implemented with proper navigation

### 2. Internal Linking
Add prominent links to key pages in footer and navigation:
- Pricing
- Features
- Payment Links
- Subscriptions
- Invoicing
- Developers
- API Reference

### 3. Consistent Naming
Use consistent page titles and headings:
- "Pricing" (not "Plans" or "Cost")
- "Payment Links" (not "Links" or "Pay Links")
- "Subscriptions" (not "Recurring")

### 4. High-Quality Content
Each page should have:
- Clear H1 heading
- Descriptive content (300+ words)
- Unique meta description
- Relevant keywords

### 5. Site Authority
- Get backlinks from crypto/fintech sites
- Create blog content
- Get listed in directories
- Social media presence

## Performance Optimization

### 1. Page Speed
- Optimize images (use WebP)
- Minimize JavaScript
- Enable compression
- Use CDN

### 2. Mobile Optimization
- Responsive design ✅
- Touch-friendly buttons ✅
- Fast mobile load time

### 3. Core Web Vitals
- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms
- CLS (Cumulative Layout Shift) < 0.1

## Content Strategy

### 1. Blog Posts (Recommended)
Create SEO-optimized blog posts:
- "How to Accept Crypto Payments in 2026"
- "USDC vs USDT: Which Stablecoin for Business?"
- "Complete Guide to Crypto Payment Links"
- "Setting Up Recurring Crypto Payments"

### 2. Use Cases
Create dedicated pages for:
- Freelancers
- E-commerce
- SaaS Companies
- Content Creators
- Non-profits

### 3. Comparison Pages
- "Dari vs Stripe for Crypto"
- "Dari vs Coinbase Commerce"
- "Best Crypto Payment Gateway 2026"

## Monitoring & Analytics

### 1. Google Analytics 4
Track:
- Organic search traffic
- Top landing pages
- Conversion rates
- User behavior

### 2. Search Console Metrics
Monitor:
- Impressions
- Click-through rate (CTR)
- Average position
- Top queries

### 3. Goals
- Increase organic traffic by 50% in 3 months
- Achieve top 3 ranking for "crypto payment gateway"
- Get sitelinks within 6 months
- 1000+ monthly organic visitors

## Timeline

### Week 1-2: Foundation
- ✅ Add SEO component
- ✅ Create sitemap
- ✅ Add robots.txt
- ✅ Implement structured data

### Week 3-4: Content
- Add SEO to all pages
- Optimize meta descriptions
- Add FAQ sections
- Create blog section

### Month 2: Authority
- Submit to directories
- Create social profiles
- Start link building
- Guest posting

### Month 3+: Optimization
- Analyze Search Console data
- Optimize underperforming pages
- Create more content
- Build more backlinks

## Key Metrics to Track

1. **Organic Traffic**: Target 1000+/month
2. **Keyword Rankings**: Top 10 for main keywords
3. **Sitelinks**: Appear within 6 months
4. **Domain Authority**: Increase to 30+
5. **Backlinks**: Get 50+ quality backlinks

## Checklist

- [x] robots.txt created
- [x] sitemap.xml created
- [x] SEO component created
- [x] Meta tags in index.html
- [x] Structured data schemas
- [ ] Add SEO to all landing pages
- [ ] Submit to Google Search Console
- [ ] Submit to Bing Webmaster Tools
- [ ] Create blog section
- [ ] Add FAQ sections
- [ ] Build backlinks
- [ ] Monitor rankings

## Resources

- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [PageSpeed Insights](https://pagespeed.web.dev/)
