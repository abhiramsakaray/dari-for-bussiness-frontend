import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';

// Landing Pages
import { NewLanding } from './components/landing/NewLanding';
import { FeaturesPage } from './components/landing/FeaturesPage';
import { PricingPage } from './components/landing/PricingPage';
import { DevelopersPage } from './components/landing/DevelopersPage';
import { ApiReferencePage } from './components/landing/ApiReferencePage';
import { SdksPage } from './components/landing/SdksPage';
import { WebhooksPage } from './components/landing/WebhooksPage';
import { ChangelogPage } from './components/landing/ChangelogPage';
import { AboutPage } from './components/landing/AboutPage';
import { useEffect } from 'react';

// Simple component that redirects to an external URL
function ExternalRedirect({ url }: { url: string }) {
  useEffect(() => { window.location.href = url; }, [url]);
  return null;
}
import { CareersPage } from './components/landing/CareersPage';
import { ContactPage } from './components/landing/ContactPage';
import { StatusPage } from './components/landing/StatusPage';
import { SecurityPage } from './components/landing/SecurityPage';
import { PrivacyPolicyPage } from './components/landing/PrivacyPolicyPage';
import { TermsOfServicePage } from './components/landing/TermsOfServicePage';
import { SimplePage } from './components/landing/SimplePage';

// Auth Pages
import { Login } from './components/Login';
import { Register } from './components/Register';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';

// Dashboard Pages
import { Dashboard } from './components/Dashboard';
import { PaymentsList } from './components/PaymentsList';
import { PaymentDetail } from './components/PaymentDetail';
import { PayerLeads } from './components/PayerLeads';
import { CreatePayment } from './components/CreatePayment';
import { Settings } from './components/Settings';
import { Admin } from './components/Admin';
import { Integrations } from './components/Integrations';
import { Billing } from './components/Billing';
import Wallets from './components/Wallets';
import { Withdrawals } from './components/withdrawals/Withdrawals';
import { ApiDebugger } from './components/ApiDebugger';
import { Coupons } from './components/Coupons';
import { CouponAnalytics } from './components/coupons/CouponAnalytics';
import { CreateCouponPage } from './components/coupons/CreateCouponPage';
import { DariDesignShowcase } from './components/DariDesignShowcase';
import { BentoDashboard } from './components/BentoDashboard';

// Enterprise Features
import PaymentLinksList from './components/payment-links/PaymentLinksList';
import CreatePaymentLinkForm from './components/payment-links/CreatePaymentLinkForm';
import InvoicesList from './components/invoices/InvoicesList';
import CreateInvoiceForm from './components/invoices/CreateInvoiceForm';
import SubscriptionsDashboard from './components/subscriptions/SubscriptionsDashboard';
import Web3SubscriptionCheckoutPage from './components/subscriptions/Web3SubscriptionCheckoutPage';
import RefundsList from './components/refunds/RefundsList';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import { PaymentTracker } from './components/analytics/PaymentTracker';
import { SubscriptionTracker } from './components/analytics/SubscriptionTracker';
import TeamMembersList from './components/team/TeamMembersList';
import { DevelopmentGuide } from './components/developer/DevelopmentGuide';
import { CodeWithAI } from './components/developer/CodeWithAI';

import { ProtectedRoute } from './components/ProtectedRoute';
import { ScrollToTop } from './components/ScrollToTop';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Landing Pages */}
        <Route path="/" element={<NewLanding />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/developers" element={<DevelopersPage />} />
        <Route path="/docs" element={<DevelopersPage />} />
        <Route path="/api-reference" element={<ApiReferencePage />} />
        <Route path="/sdks" element={<SdksPage />} />
        <Route path="/webhooks" element={<WebhooksPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        
        {/* Company Pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<ExternalRedirect url="https://blog.daripay.xyz" />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/partners" element={
          <SimplePage 
            label="Partners" 
            title="Partner Program" 
            subtitle="Join our partner ecosystem and grow together." 
            content="We're building a network of partners including payment processors, wallet providers, exchanges, and integration partners. Interested in partnering with Dari? Contact us at partnerships@daripay.xyz to discuss collaboration opportunities." 
          />
        } />
        <Route path="/press" element={
          <SimplePage 
            label="Press" 
            title="Press Kit & Media Resources" 
            subtitle="Media resources, brand assets, and press inquiries." 
            content="Download our press kit including logos, brand guidelines, and company information. For press inquiries and media requests, contact press@daripay.xyz. We're happy to provide interviews, quotes, and additional information about our platform." 
          />
        } />
        
        {/* Status & Security */}
        <Route path="/status" element={<StatusPage />} />
        <Route path="/security" element={<SecurityPage />} />
        
        {/* Legal Pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/cookie-policy" element={
          <SimplePage 
            label="Legal" 
            title="Cookie Policy" 
            subtitle="How we use cookies to improve your experience." 
            content="We use cookies and similar tracking technologies to improve your browsing experience, analyze site traffic, and understand where our visitors are coming from. By using our site, you consent to our use of cookies in accordance with this policy. You can control cookie settings through your browser preferences." 
          />
        } />
        <Route path="/aml-policy" element={
          <SimplePage 
            label="Legal" 
            title="Anti-Money Laundering Policy" 
            subtitle="Our commitment to preventing financial crime." 
            content="Dari for Business is committed to preventing money laundering and terrorist financing. We comply with all applicable AML regulations and work with licensed partners to ensure regulatory compliance. We implement KYC procedures, transaction monitoring, and suspicious activity reporting in accordance with local and international regulations." 
          />
        } />
        <Route path="/compliance" element={
          <SimplePage 
            label="Legal" 
            title="Regulatory Compliance" 
            subtitle="How we maintain compliance across jurisdictions." 
            content="We maintain compliance with all applicable regulations across jurisdictions where we operate. This includes financial services regulations, data protection laws (GDPR, CCPA), and blockchain-specific regulations. We work with legal experts and compliance partners to ensure our platform meets all regulatory requirements." 
          />
        } />
        
        {/* Product Feature Pages (Marketing) */}
        <Route path="/payment-links" element={
          <SimplePage 
            label="Product" 
            title="Payment Links" 
            subtitle="Generate shareable payment links in seconds. No code required." 
            content="Create payment links for one-time or recurring payments. Share via email, SMS, QR code, or social media. Track payments in real-time with our analytics dashboard. Perfect for freelancers, creators, and businesses of all sizes." 
          />
        } />
        <Route path="/subscriptions" element={
          <SimplePage 
            label="Product" 
            title="Subscription Billing" 
            subtitle="Recurring stablecoin payments made simple." 
            content="Set up subscription billing with smart retry logic, automatic invoicing, and webhook notifications. Support for monthly, quarterly, and annual billing cycles. Manage subscribers, track MRR/ARR, and reduce churn with our built-in analytics." 
          />
        } />
        <Route path="/invoicing" element={
          <SimplePage 
            label="Product" 
            title="Crypto Invoicing" 
            subtitle="Professional invoices with crypto payment options." 
            content="Create and send professional invoices that accept stablecoin payments. Automatic payment tracking, reminders, and reconciliation. Support for multiple currencies and chains. Perfect for B2B transactions and international clients." 
          />
        } />
        <Route path="/analytics" element={
          <SimplePage 
            label="Product" 
            title="Real-time Analytics" 
            subtitle="Track revenue, transactions, and performance across chains." 
            content="Comprehensive analytics dashboard with real-time payment tracking, revenue metrics, conversion rates, and customer insights. Monitor performance across different chains, track MRR/ARR growth, and export data for accounting." 
          />
        } />
        <Route path="/multi-chain" element={
          <SimplePage 
            label="Product" 
            title="Multi-chain Routing" 
            subtitle="Accept payments across all major blockchain networks." 
            content="Automatic routing to the lowest-fee chain for optimal cost savings. Support for Ethereum, Solana, Polygon, BSC, Arbitrum, Base, and more. One integration, all chains. Your customers choose their preferred network." 
          />
        } />
        <Route path="/fraud-monitoring" element={
          <SimplePage 
            label="Product" 
            title="Fraud Detection & Monitoring" 
            subtitle="Advanced fraud detection powered by blockchain analytics." 
            content="Real-time fraud monitoring and risk assessment for all transactions. Machine learning models detect suspicious patterns, blacklist management, and automatic flagging of high-risk payments. Protect your business from fraudulent transactions while maintaining a smooth customer experience." 
          />
        } />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<OnboardingFlow />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/payments" element={<ProtectedRoute><PaymentsList /></ProtectedRoute>} />
        <Route path="/dashboard/payments/:paymentId" element={<ProtectedRoute><PaymentDetail /></ProtectedRoute>} />
        <Route path="/dashboard/payer-leads" element={<ProtectedRoute><PayerLeads /></ProtectedRoute>} />
        <Route path="/dashboard/create" element={<ProtectedRoute><CreatePayment /></ProtectedRoute>} />
        <Route path="/dashboard/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/dashboard/coupons" element={<ProtectedRoute><Coupons /></ProtectedRoute>} />
        <Route path="/dashboard/coupons/new" element={<ProtectedRoute><CreateCouponPage /></ProtectedRoute>} />
        <Route path="/dashboard/coupons/:id/analytics" element={<ProtectedRoute><CouponAnalytics /></ProtectedRoute>} />
        
        {/* Developer Section */}
        <Route path="/developer/guide" element={<ProtectedRoute><DevelopmentGuide /></ProtectedRoute>} />
        <Route path="/developer/ai" element={<ProtectedRoute><CodeWithAI /></ProtectedRoute>} />
        
        {/* Admin */}
        <Route path="/admin" element={<Admin />} />
        
        {/* Enterprise Features (Protected) */}
        <Route path="/payment-links-dashboard" element={<ProtectedRoute><PaymentLinksList /></ProtectedRoute>} />
        <Route path="/payment-links-dashboard/new" element={<ProtectedRoute><CreatePaymentLinkForm /></ProtectedRoute>} />
        <Route path="/invoices-dashboard" element={<ProtectedRoute><InvoicesList /></ProtectedRoute>} />
        <Route path="/invoices-dashboard/new" element={<ProtectedRoute><CreateInvoiceForm /></ProtectedRoute>} />
        <Route path="/subscriptions-dashboard" element={<ProtectedRoute><SubscriptionsDashboard /></ProtectedRoute>} />
        <Route path="/subscriptions/web3-checkout/:planId?" element={<ProtectedRoute><Web3SubscriptionCheckoutPage planId="" /></ProtectedRoute>} />
        <Route path="/refunds" element={<ProtectedRoute><RefundsList /></ProtectedRoute>} />
        <Route path="/coupons" element={<ProtectedRoute><Coupons /></ProtectedRoute>} />
        <Route path="/analytics-dashboard" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
        <Route path="/analytics/payment-tracking" element={<ProtectedRoute><PaymentTracker /></ProtectedRoute>} />
        <Route path="/analytics/subscription-tracking" element={<ProtectedRoute><SubscriptionTracker /></ProtectedRoute>} />
        <Route path="/team" element={<ProtectedRoute><TeamMembersList /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/wallets" element={<ProtectedRoute><Wallets /></ProtectedRoute>} />
        <Route path="/withdrawals" element={<ProtectedRoute><Withdrawals /></ProtectedRoute>} />
        <Route path="/debug" element={<ProtectedRoute><ApiDebugger /></ProtectedRoute>} />
        <Route path="/design-system" element={<ProtectedRoute><DariDesignShowcase /></ProtectedRoute>} />
        <Route path="/bento-dashboard" element={<ProtectedRoute><BentoDashboard /></ProtectedRoute>} />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}
