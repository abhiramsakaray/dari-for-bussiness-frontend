import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';

// Landing Pages
import { NewLanding } from './components/landing/NewLanding';
import { FeaturesPage } from './components/landing/FeaturesPage';
import { PricingPage } from './components/landing/PricingPage';
import { DevelopersPage } from './components/landing/DevelopersPage';
import { PublicDocsPage } from './components/landing/PublicDocsPage';
import { ApiReferencePage } from './components/landing/ApiReferencePage';
import { SdksPage } from './components/landing/SdksPage';
import { WebhooksPage } from './components/landing/WebhooksPage';
import { ChangelogPage } from './components/landing/ChangelogPage';
import { AboutPage } from './components/landing/AboutPage';
import { NotFoundPage } from './components/landing/NotFoundPage';
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
import { PoliciesPage } from './components/landing/PoliciesPage';
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
import { CheckoutCustomization } from './components/CheckoutCustomization';
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
import CreateSubscriptionPlanForm from './components/subscriptions/CreateSubscriptionPlanForm';
import Web3SubscriptionCheckoutPage from './components/subscriptions/Web3SubscriptionCheckoutPage';
import RefundsList from './components/refunds/RefundsList';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import { PaymentTracker } from './components/analytics/PaymentTracker';
import { SubscriptionTracker } from './components/analytics/SubscriptionTracker';
import TeamMembersList from './components/team/TeamMembersListNew';
import { TeamLogin } from './components/team/TeamLogin';
import { TeamDashboard } from './components/team/TeamDashboard';
import { Unauthorized } from './components/team/Unauthorized';
import { DevelopmentGuide } from './components/developer/DevelopmentGuide';
import { CodeWithAI } from './components/developer/CodeWithAI';
import { UsageDashboard } from './components/usage/UsageDashboard';
import { AdminFees } from './components/AdminFees';
import OrchestrationDashboard from './components/orchestration/OrchestrationDashboard';

import { ProtectedRoute } from './components/ProtectedRoute';
import { ProtectedTeamRoute } from './components/team/ProtectedTeamRoute';
import { AutoRedirect } from './components/AutoRedirect';
import { ScrollToTop } from './components/ScrollToTop';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Landing Pages */}
        <Route path="/" element={<AutoRedirect><NewLanding /></AutoRedirect>} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/developers" element={<PublicDocsPage />} />
        <Route path="/docs" element={<PublicDocsPage />} />
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
            path="partners"
          />
        } />
        <Route path="/press" element={
          <SimplePage 
            label="Press" 
            title="Press Kit & Media Resources" 
            subtitle="Media resources, brand assets, and press inquiries." 
            content="Download our press kit including logos, brand guidelines, and company information. For press inquiries and media requests, contact press@daripay.xyz. We're happy to provide interviews, quotes, and additional information about our platform." 
            path="press"
          />
        } />
        
        {/* Status & Security */}
        <Route path="/status" element={<StatusPage />} />
        <Route path="/security" element={<PoliciesPage initialTab="security" />} />
        
        {/* Legal Pages */}
        <Route path="/privacy-policy" element={<PoliciesPage initialTab="privacy" />} />
        <Route path="/terms-of-service" element={<PoliciesPage initialTab="terms" />} />
        <Route path="/aml-policy" element={<PoliciesPage initialTab="aml" />} />
        <Route path="/withdrawal-policy" element={<PoliciesPage initialTab="withdrawal" />} />
        <Route path="/cookie-policy" element={<PoliciesPage initialTab="cookie" />} />
        <Route path="/compliance" element={<PoliciesPage initialTab="compliance" />} />
        
        {/* Product Feature Pages (Marketing) */}
        <Route path="/payment-links" element={
          <SimplePage 
            label="Product" 
            title="Payment Links — Accept Crypto in One Click" 
            subtitle="Generate shareable payment links in seconds. No code required." 
            content="Create payment links for one-time or recurring payments. Share via email, SMS, QR code, or social media. Track payments in real-time with our analytics dashboard. Perfect for freelancers, creators, and businesses of all sizes." 
            path="payment-links"
          />
        } />
        <Route path="/subscriptions" element={
          <SimplePage 
            label="Product" 
            title="Subscription Billing — Recurring Stablecoin Payments" 
            subtitle="Recurring stablecoin payments made simple." 
            content="Set up subscription billing with smart retry logic, automatic invoicing, and webhook notifications. Support for monthly, quarterly, and annual billing cycles. Manage subscribers, track MRR/ARR, and reduce churn with our built-in analytics." 
            path="subscriptions"
          />
        } />
        <Route path="/invoicing" element={
          <SimplePage 
            label="Product" 
            title="Crypto Invoicing — Professional Blockchain Invoices" 
            subtitle="Professional invoices with crypto payment options." 
            content="Create and send professional invoices that accept stablecoin payments. Automatic payment tracking, reminders, and reconciliation. Support for multiple currencies and chains. Perfect for B2B transactions and international clients." 
            path="invoicing"
          />
        } />
        <Route path="/analytics" element={
          <SimplePage 
            label="Product" 
            title="Analytics — Real-time Payment Intelligence" 
            subtitle="Track revenue, transactions, and performance across chains." 
            content="Comprehensive analytics dashboard with real-time payment tracking, revenue metrics, conversion rates, and customer insights. Monitor performance across different chains, track MRR/ARR growth, and export data for accounting." 
            path="analytics"
          />
        } />
        <Route path="/multi-chain" element={
          <SimplePage 
            label="Product" 
            title="Multi-chain Payments — One Integration, All Networks" 
            subtitle="Accept payments across all major blockchain networks." 
            content="Automatic routing to the lowest-fee chain for optimal cost savings. Support for Ethereum, Solana, Polygon, BSC, Arbitrum, Base, and more. One integration, all chains. Your customers choose their preferred network." 
            path="multi-chain"
          />
        } />
        <Route path="/fraud-monitoring" element={
          <SimplePage 
            label="Product" 
            title="Fraud Detection — Blockchain-Powered Security" 
            subtitle="Advanced fraud detection powered by blockchain analytics." 
            content="Real-time fraud monitoring and risk assessment for all transactions. Machine learning models detect suspicious patterns, blacklist management, and automatic flagging of high-risk payments. Protect your business from fraudulent transactions while maintaining a smooth customer experience." 
            path="fraud-monitoring"
          />
        } />
        
        {/* Auth Routes */}
        <Route path="/login" element={<AutoRedirect><Login /></AutoRedirect>} />
        <Route path="/register" element={<AutoRedirect><Register /></AutoRedirect>} />
        <Route path="/onboarding" element={<OnboardingFlow />} />
        <Route path="/team/login" element={<TeamLogin />} />
        <Route path="/team/dashboard" element={<ProtectedTeamRoute><TeamDashboard /></ProtectedTeamRoute>} />
        <Route path="/team/unauthorized" element={<Unauthorized />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/payments" element={<ProtectedRoute><PaymentsList /></ProtectedRoute>} />
        <Route path="/dashboard/payments/:paymentId" element={<ProtectedRoute><PaymentDetail /></ProtectedRoute>} />
        <Route path="/dashboard/payer-leads" element={<ProtectedRoute><PayerLeads /></ProtectedRoute>} />
        <Route path="/dashboard/create" element={<ProtectedRoute><CreatePayment /></ProtectedRoute>} />
        <Route path="/dashboard/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/dashboard/customization" element={<ProtectedRoute><CheckoutCustomization /></ProtectedRoute>} />
        <Route path="/dashboard/coupons" element={<ProtectedRoute><Coupons /></ProtectedRoute>} />
        <Route path="/dashboard/coupons/new" element={<ProtectedRoute><CreateCouponPage /></ProtectedRoute>} />
        <Route path="/dashboard/coupons/:id/analytics" element={<ProtectedRoute><CouponAnalytics /></ProtectedRoute>} />
        
        {/* Developer Section */}
        <Route path="/developer/guide" element={<ProtectedRoute><DevelopmentGuide /></ProtectedRoute>} />
        <Route path="/developer/ai" element={<ProtectedRoute><CodeWithAI /></ProtectedRoute>} />
        

        {/* Enterprise Features (Protected) */}
        <Route path="/payment-links-dashboard" element={<ProtectedRoute><PaymentLinksList /></ProtectedRoute>} />
        <Route path="/payment-links-dashboard/new" element={<ProtectedRoute><CreatePaymentLinkForm /></ProtectedRoute>} />
        <Route path="/payment-links-dashboard/:linkId/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
        <Route path="/payment-links-dashboard/:linkId/edit" element={<ProtectedRoute><CreatePaymentLinkForm /></ProtectedRoute>} />
        <Route path="/payment-links-dashboard/:linkId" element={<ProtectedRoute><PaymentDetail /></ProtectedRoute>} />
        <Route path="/invoices-dashboard" element={<ProtectedRoute><InvoicesList /></ProtectedRoute>} />
        <Route path="/invoices-dashboard/new" element={<ProtectedRoute><CreateInvoiceForm /></ProtectedRoute>} />
        <Route path="/invoices-dashboard/:invoiceId/edit" element={<ProtectedRoute><CreateInvoiceForm /></ProtectedRoute>} />
        <Route path="/invoices-dashboard/:invoiceId" element={<ProtectedRoute><PaymentDetail /></ProtectedRoute>} />
        <Route path="/subscriptions-dashboard" element={<ProtectedRoute><SubscriptionsDashboard /></ProtectedRoute>} />
        <Route path="/subscriptions-dashboard/new" element={<ProtectedRoute><CreateSubscriptionPlanForm /></ProtectedRoute>} />
        <Route path="/subscriptions/web3-checkout/:planId?" element={<ProtectedRoute><Web3SubscriptionCheckoutPage planId="" /></ProtectedRoute>} />
        <Route path="/refunds" element={<ProtectedRoute><RefundsList /></ProtectedRoute>} />
        <Route path="/analytics-dashboard" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
        <Route path="/analytics/payment-tracking" element={<ProtectedRoute><PaymentTracker /></ProtectedRoute>} />
        <Route path="/analytics/subscription-tracking" element={<ProtectedRoute><SubscriptionTracker /></ProtectedRoute>} />
        <Route path="/orchestration" element={<ProtectedRoute><OrchestrationDashboard /></ProtectedRoute>} />
        <Route path="/team" element={<ProtectedRoute><TeamMembersList /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/usage" element={<ProtectedRoute><UsageDashboard /></ProtectedRoute>} />
        <Route path="/wallets" element={<ProtectedRoute><Wallets /></ProtectedRoute>} />
        <Route path="/withdrawals" element={<ProtectedRoute><Withdrawals /></ProtectedRoute>} />
        <Route path="/debug" element={<ProtectedRoute><ApiDebugger /></ProtectedRoute>} />
        <Route path="/design-system" element={<ProtectedRoute><DariDesignShowcase /></ProtectedRoute>} />
        <Route path="/bento-dashboard" element={<ProtectedRoute><BentoDashboard /></ProtectedRoute>} />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}
