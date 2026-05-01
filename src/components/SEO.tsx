import { Helmet } from 'react-helmet-async';

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

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Dari for Business" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta name="twitter:creator" content="@daripayments" />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Dari Payments" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
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
