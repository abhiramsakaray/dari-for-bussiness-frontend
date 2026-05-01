import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: object;
}

export function SEO({
  title = 'Dari for Business — Stablecoin Payment Infrastructure',
  description = 'Accept crypto payments with Dari. Multi-chain payment gateway for stablecoins (USDC, USDT). Payment links, invoicing, subscriptions, and more. Start accepting crypto in minutes.',
  keywords = 'crypto payments, stablecoin payments, USDC payments, USDT payments, crypto payment gateway, blockchain payments, web3 payments, crypto invoicing, crypto subscriptions, payment links, multi-chain payments, polygon payments, ethereum payments, stellar payments',
  image = 'https://daripay.xyz/og-image.png',
  url = 'https://daripay.xyz',
  type = 'website',
  structuredData,
}: SEOProps) {
  const fullTitle = title.includes('Dari') ? title : `${title} | Dari for Business`;

  useEffect(() => {
    // Update title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const updateMeta = (selector: string, attribute: string, content: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (attribute === 'name') {
          element.setAttribute('name', selector.replace('meta[name="', '').replace('"]', ''));
        } else if (attribute === 'property') {
          element.setAttribute('property', selector.replace('meta[property="', '').replace('"]', ''));
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Update canonical link
    const updateCanonical = (href: string) => {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = href;
    };

    // Primary Meta Tags
    updateMeta('meta[name="title"]', 'name', fullTitle);
    updateMeta('meta[name="description"]', 'name', description);
    updateMeta('meta[name="keywords"]', 'name', keywords);
    updateCanonical(url);

    // Open Graph / Facebook
    updateMeta('meta[property="og:type"]', 'property', type);
    updateMeta('meta[property="og:url"]', 'property', url);
    updateMeta('meta[property="og:title"]', 'property', fullTitle);
    updateMeta('meta[property="og:description"]', 'property', description);
    updateMeta('meta[property="og:image"]', 'property', image);
    updateMeta('meta[property="og:site_name"]', 'property', 'Dari for Business');

    // Twitter
    updateMeta('meta[property="twitter:card"]', 'property', 'summary_large_image');
    updateMeta('meta[property="twitter:url"]', 'property', url);
    updateMeta('meta[property="twitter:title"]', 'property', fullTitle);
    updateMeta('meta[property="twitter:description"]', 'property', description);
    updateMeta('meta[property="twitter:image"]', 'property', image);
    updateMeta('meta[name="twitter:creator"]', 'name', '@daripayments');

    // Additional Meta Tags
    updateMeta('meta[name="robots"]', 'name', 'index, follow');
    updateMeta('meta[name="language"]', 'name', 'English');
    updateMeta('meta[name="revisit-after"]', 'name', '7 days');
    updateMeta('meta[name="author"]', 'name', 'Dari Payments');

    // Structured Data
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
  }, [fullTitle, description, keywords, image, url, type, structuredData]);

  return null;
}

// Predefined structured data for common pages
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Dari for Business',
  alternateName: 'Dari Payments',
  url: 'https://daripay.xyz',
  logo: 'https://daripay.xyz/daripayments_green_logo.png',
  description: 'Stablecoin payment infrastructure for businesses. Accept crypto payments with multi-chain support.',
  foundingDate: '2024',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-XXX-XXX-XXXX',
    contactType: 'Customer Service',
    email: 'support@daripay.xyz',
    availableLanguage: ['English'],
  },
  sameAs: [
    'https://twitter.com/daripayments',
    'https://linkedin.com/company/dari-payments',
    'https://github.com/daripayments',
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US',
  },
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Dari for Business',
  url: 'https://daripay.xyz',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://daripay.xyz/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Dari for Business',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free tier available with paid plans starting from $29/month',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '150',
  },
  description: 'Accept crypto payments with Dari. Multi-chain payment gateway for stablecoins.',
};

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const faqSchema = (faqs: { question: string; answer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

export const productSchema = (product: {
  name: string;
  description: string;
  price?: string;
  currency?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  brand: {
    '@type': 'Brand',
    name: 'Dari for Business',
  },
  offers: product.price
    ? {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.currency || 'USD',
        availability: 'https://schema.org/InStock',
      }
    : undefined,
});
