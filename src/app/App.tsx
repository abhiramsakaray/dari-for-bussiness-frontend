import { useState, useEffect } from "react";
import { Toaster } from "./components/ui/sonner";

// Import all page components
import { Landing } from "./components/Landing";
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

  const renderPage = () => {
    switch (true) {
      case route === "/":
        return <Landing />;
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
      case route.startsWith("/subscriptions/"):
        return <ProtectedRoute><SubscriptionsDashboard /></ProtectedRoute>;

      // Refunds Routes (protected)
      case route === "/refunds":
        return <ProtectedRoute><RefundsList /></ProtectedRoute>;

      // Analytics Routes (protected)
      case route === "/analytics":
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

      default:
        return <Landing />;
    }
  };

  return (
    <>
      {renderPage()}
      <Toaster position="top-right" />
    </>
  );
}
