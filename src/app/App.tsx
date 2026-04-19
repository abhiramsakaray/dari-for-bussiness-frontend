import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { Toaster } from "./components/ui/sonner";

// Import all page components
import { Landing } from "./components/Landing";
import { NewLanding } from "./components/landing/NewLanding";
import { FeaturesPage } from "./components/landing/FeaturesPage";
import { PricingPage } from "./components/landing/PricingPage";
import { DevelopersPage } from "./components/landing/DevelopersPage";
import { PrivacyPolicyPage } from "./components/landing/PrivacyPolicyPage";
import { TermsOfServicePage } from "./components/landing/TermsOfServicePage";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Dashboard } from "./components/Dashboard";
import { PaymentsList } from "./components/PaymentsList";
import { PaymentDetail } from "./components/PaymentDetail";
import { PayerLeads } from "./components/PayerLeads";
import { CreatePayment } from "./components/CreatePayment";
import { Settings } from "./components/Settings";
import { Checkout } from "./components/Checkout";
import { Admin } from "./components/Admin";
import { Integrations } from "./components/Integrations";

// New Enterprise Feature Components
import PaymentLinksList from "./components/payment-links/PaymentLinksList";
import CreatePaymentLinkForm from "./components/payment-links/CreatePaymentLinkForm";
import InvoicesList from "./components/invoices/InvoicesList";
import CreateInvoiceForm from "./components/invoices/CreateInvoiceForm";
import SubscriptionsDashboard from "./components/subscriptions/SubscriptionsDashboard";
import Web3SubscriptionCheckoutPage from "./components/subscriptions/Web3SubscriptionCheckoutPage";
import RefundsList from "./components/refunds/RefundsList";
import AnalyticsDashboard from "./components/analytics/AnalyticsDashboard";
import { PaymentTracker } from "./components/analytics/PaymentTracker";
import { SubscriptionTracker } from "./components/analytics/SubscriptionTracker";
import TeamMembersList from "./components/team/TeamMembersList";
import { OnboardingFlow } from "./components/onboarding/OnboardingFlow";
import { Billing } from "./components/Billing";
import Wallets from "./components/Wallets";
import { Withdrawals } from "./components/withdrawals/Withdrawals";
import { ApiDebugger } from "./components/ApiDebugger";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Coupons } from "./components/Coupons";
import { CouponAnalytics } from "./components/coupons/CouponAnalytics";
import { DariDesignShowcase } from "./components/DariDesignShowcase";
import { BentoDashboard } from "./components/BentoDashboard";

// Simple router based on URL hash
export default function App() {
  const [route, setRoute] = useState(window.location.hash.slice(1) || "/");

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash.slice(1) || "/");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Extract session ID from checkout routes
  const checkoutMatch = route.match(/^\/checkout\/(.+)$/);
  const sessionId = checkoutMatch ? checkoutMatch[1] : null;

  // Extract payment ID from payment detail route
  const paymentDetailMatch = route.match(/^\/dashboard\/payments\/(.+)$/);
  const paymentDetailId = paymentDetailMatch ? paymentDetailMatch[1] : null;

  // Extract IDs from dynamic routes
  const paymentLinkMatch = route.match(/^\/payment-links\/([^/]+)$/);
  const paymentLinkId = paymentLinkMatch ? paymentLinkMatch[1] : null;
  const invoiceMatch = route.match(/^\/invoices\/([^/]+)$/);
  const invoiceId = invoiceMatch ? invoiceMatch[1] : null;

  // Web3 subscription checkout routes
  const web3SubscriptionCheckoutMatch = route.match(/^\/subscriptions\/web3-checkout(?:\/([^/?]+))?/);
  const web3SubscriptionPlanId = web3SubscriptionCheckoutMatch ? web3SubscriptionCheckoutMatch[1] || '' : '';

  const renderPage = () => {
    switch (true) {
      case route === "/":
        return <NewLanding />;
      case route === "/old-landing":
        return <Landing />;
      case route === "/features":
        return <FeaturesPage />;
      case route === "/pricing":
        return <PricingPage />;
      case route === "/developers":
      case route === "/docs":
      case route === "/api-reference":
      case route === "/sdks":
      case route === "/webhooks":
      case route === "/changelog":
        return <DevelopersPage />;
      case route === "/privacy-policy":
      case route === "/privacypolicy":
        return <PrivacyPolicyPage />;
      case route === "/terms-of-service":
      case route === "/termsofservice":
        return <TermsOfServicePage />;
      case route === "/blog":
        window.location.href = "https://blog.daripay.xyz";
        return null;
      case route === "/about":
      case route === "/careers":
      case route === "/partners":
      case route === "/press":
      case route === "/contact":
      case route === "/cookie-policy":
      case route === "/cookiepolicy":
      case route === "/aml-policy":
      case route === "/amlpolicy":
      case route === "/compliance":
      case route === "/security":
      case route === "/status":
      case route === "/analytics":
      case route === "/payment-links":
      case route === "/subscriptions":
      case route === "/invoicing":
      case route === "/fraud-monitoring":
      case route === "/multi-chain":
        return <DevelopersPage />;
      case route === "/login":
        return <Login />;
      case route === "/register":
        return <Register />;
      case route === "/onboarding":
        return <OnboardingFlow />;
      case !!checkoutMatch:
        return <Checkout sessionId={sessionId!} />;
      
      // Protected dashboard routes (require authentication + completed onboarding)
      case route === "/dashboard":
        return <ProtectedRoute><Dashboard /></ProtectedRoute>;
      case route === "/dashboard/payments":
        return <ProtectedRoute><PaymentsList /></ProtectedRoute>;
      case !!paymentDetailMatch:
        return <ProtectedRoute><PaymentDetail paymentId={paymentDetailId!} /></ProtectedRoute>;
      case route === "/dashboard/payer-leads":
        return <ProtectedRoute><PayerLeads /></ProtectedRoute>;
      case route === "/dashboard/create":
        return <ProtectedRoute><CreatePayment /></ProtectedRoute>;
      case route === "/dashboard/integrations":
        return <ProtectedRoute><Integrations /></ProtectedRoute>;
      case route === "/dashboard/settings":
        return <ProtectedRoute><Settings /></ProtectedRoute>;
      
      // Admin route (different protection logic)
      case route === "/admin":
        return <Admin />;
      
      // Payment Links Routes (protected)
      case route === "/payment-links":
        return <ProtectedRoute><PaymentLinksList /></ProtectedRoute>;
      case route === "/payment-links/new":
        return <ProtectedRoute><CreatePaymentLinkForm /></ProtectedRoute>;
      case !!paymentLinkMatch && paymentLinkId !== "new":
        return <ProtectedRoute><PaymentLinksList /></ProtectedRoute>;
      case route.startsWith("/payment-links/") && route.endsWith("/edit"):
        return <ProtectedRoute><CreatePaymentLinkForm /></ProtectedRoute>;
      case route.startsWith("/payment-links/") && route.endsWith("/analytics"):
        return <ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>;

      // Invoices Routes (protected)
      case route === "/invoices":
        return <ProtectedRoute><InvoicesList /></ProtectedRoute>;
      case route === "/invoices/new":
        return <ProtectedRoute><CreateInvoiceForm /></ProtectedRoute>;
      case !!invoiceMatch && invoiceId !== "new":
        return <ProtectedRoute><InvoicesList /></ProtectedRoute>;
      case route.startsWith("/invoices/") && route.endsWith("/edit"):
        return <ProtectedRoute><CreateInvoiceForm /></ProtectedRoute>;

      // Subscriptions Routes (protected)
      case route === "/subscriptions":
        return <ProtectedRoute><SubscriptionsDashboard /></ProtectedRoute>;
      case route === "/subscriptions/new":
        return <ProtectedRoute><SubscriptionsDashboard /></ProtectedRoute>;
      case route === "/subscriptions/plans/new":
        return <ProtectedRoute><SubscriptionsDashboard /></ProtectedRoute>;
      case route.startsWith("/subscriptions/plans/"):
        return <ProtectedRoute><SubscriptionsDashboard /></ProtectedRoute>;
      case !!web3SubscriptionCheckoutMatch:
        return <ProtectedRoute><Web3SubscriptionCheckoutPage planId={web3SubscriptionPlanId} /></ProtectedRoute>;
      case route.startsWith("/subscriptions/"):
        return <ProtectedRoute><SubscriptionsDashboard /></ProtectedRoute>;

      // Refunds Routes (protected)
      case route === "/refunds":
        return <ProtectedRoute><RefundsList /></ProtectedRoute>;

      // Coupons / Promo Codes Routes (protected)
      case route === "/coupons":
      case route === "/dashboard/coupons":
        return <ProtectedRoute><Coupons /></ProtectedRoute>;
      case route.startsWith("/dashboard/coupons/") && route.endsWith("/analytics"):
        return <ProtectedRoute><CouponAnalytics /></ProtectedRoute>;

      // Analytics Routes (protected)
      case route === "/analytics":
        return <ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>;
      case route === "/reports":
        return <ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>;
      case route === "/analytics/payment-tracking":
        return <ProtectedRoute><PaymentTracker /></ProtectedRoute>;
      case route.startsWith("/analytics/payments/") && route.endsWith("/track"):
        return <ProtectedRoute><PaymentTracker /></ProtectedRoute>;
      case route === "/analytics/subscription-tracking":
        return <ProtectedRoute><SubscriptionTracker /></ProtectedRoute>;
      case route.startsWith("/analytics/subscriptions/") && route.endsWith("/track"):
        return <ProtectedRoute><SubscriptionTracker /></ProtectedRoute>;

      // Team Management Routes (protected)
      case route === "/team":
        return <ProtectedRoute><TeamMembersList /></ProtectedRoute>;

      // Billing & Subscription Routes (protected)
      case route === "/billing":
        return <ProtectedRoute><Billing /></ProtectedRoute>;

      // Wallets Routes (protected)
      case route === "/wallets":
        return <ProtectedRoute><Wallets /></ProtectedRoute>;

      // Withdrawals Routes (protected)
      case route === "/withdrawals":
        return <ProtectedRoute><Withdrawals /></ProtectedRoute>;

      // Debug Routes (protected)
      case route === "/debug":
        return <ProtectedRoute><ApiDebugger /></ProtectedRoute>;

      // Dari Design System Showcase
      case route === "/design-system":
        return <ProtectedRoute><DariDesignShowcase /></ProtectedRoute>;

      // Bento Dashboard (New Glassmorphism Layout)
      case route === "/bento-dashboard":
        return <ProtectedRoute><BentoDashboard /></ProtectedRoute>;

      default:
        return <NewLanding />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      {renderPage()}
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
