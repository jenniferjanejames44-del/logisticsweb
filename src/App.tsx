import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useLoginTracking } from "@/hooks/useLoginTracking";
import ScrollToTop from "@/components/ScrollToTop";
import ComingSoon from "./pages/ComingSoon";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import AirShipping from "./pages/services/AirShipping";
import OceanShipping from "./pages/services/OceanShipping";
import PersonalShopping from "./pages/services/PersonalShopping";
import Procurement from "./pages/services/Procurement";
import ImportExport from "./pages/services/ImportExport";
import ImportService from "./pages/services/ImportService";
import ExportService from "./pages/services/ExportService";
import WarehousingPage from "./pages/services/Warehousing";
import CustomsClearance from "./pages/services/CustomsClearance";
import GlobalPickup from "./pages/services/GlobalPickup";

import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Auth from "./pages/Auth";
import AuthConfirm from "./pages/AuthConfirm";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import Overview from "./pages/dashboard/Overview";
import Shipments from "./pages/dashboard/Shipments";
import CreateShipment from "./pages/dashboard/CreateShipment";
import ShipmentDetail from "./pages/dashboard/ShipmentDetail";
import Wallet from "./pages/dashboard/Wallet";
import Payments from "./pages/dashboard/Payments";
import Profile from "./pages/dashboard/Profile";
import Notifications from "./pages/dashboard/Notifications";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminShipments from "./pages/admin/AdminShipments";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminInvoices from "./pages/admin/AdminInvoices";
import AdminShippingRoutes from "./pages/admin/AdminShippingRoutes";
import AdminPricingEngine from "./pages/admin/AdminPricingEngine";
import AdminQuotations from "./pages/admin/AdminQuotations";
import AdminQuotationBuilder from "./pages/admin/AdminQuotationBuilder";
import AdminWarehouses from "./pages/admin/AdminWarehouses";
import AdminPackaging from "./pages/admin/AdminPackaging";
import AdminEmail from "./pages/admin/AdminEmail";
import Unsubscribe from "./pages/Unsubscribe";
import Invoices from "./pages/dashboard/Invoices";
import PaymentCallback from "./pages/dashboard/PaymentCallback";
import Support from "./pages/dashboard/Support";
import SupportTicketDetail from "./pages/dashboard/SupportTicketDetail";
import NotFound from "./pages/NotFound";
import Track from "./pages/Track";
import Shipping from "./pages/Shipping";
import PersonalShoppingForm from "./pages/PersonalShoppingForm";
import ShoppingOrders from "./pages/dashboard/ShoppingOrders";
import ShoppingOrderPayment from "./pages/dashboard/ShoppingOrderPayment";
import AdminShoppingOrders from "./pages/admin/AdminShoppingOrders";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminSupportDetail from "./pages/admin/AdminSupportDetail";
import AdminRefunds from "./pages/admin/AdminRefunds";
import Checkout from "./pages/Checkout";
import DesignSystem from "./pages/DesignSystem";
import Partners from "./pages/Partners";
import Partner from "./pages/dashboard/Partner";
import AdminPartners from "./pages/admin/AdminPartners";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
// Flip this to true to show the public Coming Soon page everywhere except admin/auth/dashboard.
const COMING_SOON_MODE = true;
const queryClient = new QueryClient();

// Defensive boundary: if anything in LoginTracker throws (e.g. stale HMR
// boundary briefly leaving useAuth without a provider), keep rendering the
// app instead of blanking the whole preview.
class LoginTrackerBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    if (import.meta.env.DEV) {
      console.warn("[LoginTracker] suppressed error, app continues:", error);
    }
  }
  render() {
    return <>{this.props.children}</>;
  }
}

// Component that uses the login tracking hook
const LoginTracker = ({ children }: { children: React.ReactNode }) => {
  useLoginTracking();
  return <>{children}</>;
};

const SafeLoginTracker = ({ children }: { children: React.ReactNode }) => (
  <LoginTrackerBoundary>
    <LoginTracker>{children}</LoginTracker>
  </LoginTrackerBoundary>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
      <AuthProvider>
        <CurrencyProvider>
          <SafeLoginTracker>
            <TooltipProvider>
              <Toaster />
              <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
              <Route path="/" element={<Index />} />
              {/* Original routes preserved below — re-enable by removing the catch-all above */}
              <Route path="/__site/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/air-shipping" element={<AirShipping />} />
              <Route path="/services/ocean-shipping" element={<OceanShipping />} />
              <Route path="/services/personal-shopping" element={<PersonalShopping />} />
              <Route path="/services/procurement" element={<Procurement />} />
              <Route path="/services/import" element={<ImportService />} />
              <Route path="/services/export" element={<ExportService />} />
              <Route path="/services/import-export" element={<ImportExport />} />
              <Route path="/services/warehousing" element={<WarehousingPage />} />
              <Route path="/services/customs-clearance" element={<CustomsClearance />} />
              <Route path="/services/global-pickup" element={<GlobalPickup />} />
              
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/confirm" element={<AuthConfirm />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/track" element={<Track />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              {/* Customer Dashboard */}
              <Route path="/dashboard" element={<Overview />} />
              <Route path="/dashboard/wallet" element={<Wallet />} />
              <Route path="/dashboard/shipments" element={<Shipments />} />
              <Route path="/dashboard/shipments/new" element={<CreateShipment />} />
              <Route path="/dashboard/shipments/:id" element={<ShipmentDetail />} />
              <Route path="/dashboard/invoices" element={<Invoices />} />
              <Route path="/dashboard/payments" element={<Payments />} />
              <Route path="/dashboard/payment-callback" element={<PaymentCallback />} />
              <Route path="/dashboard/profile" element={<Profile />} />
              <Route path="/dashboard/notifications" element={<Notifications />} />
              <Route path="/dashboard/support" element={<Support />} />
              <Route path="/dashboard/support/:id" element={<SupportTicketDetail />} />
              <Route path="/dashboard/shopping-orders" element={<ShoppingOrders />} />
              <Route path="/dashboard/shopping-orders/pay" element={<ShoppingOrderPayment />} />
              <Route path="/dashboard/partner" element={<Partner />} />
              <Route path="/personal-shopping/new" element={<PersonalShoppingForm />} />
              {/* Admin Dashboard */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/shipments" element={<AdminShipments />} />
              <Route path="/admin/invoices" element={<AdminInvoices />} />
              <Route path="/admin/quotations" element={<AdminQuotations />} />
              <Route path="/admin/quotations/new" element={<AdminQuotationBuilder />} />
              <Route path="/admin/quotations/:id/edit" element={<AdminQuotationBuilder />} />
              <Route path="/admin/payments" element={<AdminPayments />} />
              <Route path="/admin/pricing" element={<AdminPricing />} />
              <Route path="/admin/shipping-routes" element={<AdminShippingRoutes />} />
              <Route path="/admin/pricing-engine" element={<AdminPricingEngine />} />
              <Route path="/admin/warehouses" element={<AdminWarehouses />} />
              <Route path="/admin/packaging" element={<AdminPackaging />} />
              <Route path="/admin/partners" element={<AdminPartners />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
              <Route path="/admin/shopping-orders" element={<AdminShoppingOrders />} />
              <Route path="/admin/support" element={<AdminSupport />} />
              <Route path="/admin/support/:id" element={<AdminSupportDetail />} />
              <Route path="/admin/refunds" element={<AdminRefunds />} />
              <Route path="/admin/email" element={<AdminEmail />} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />
              {/* Design System */}
              <Route path="/design-system" element={<DesignSystem />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            </TooltipProvider>
          </SafeLoginTracker>
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;