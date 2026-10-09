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
import { lazyPage, PageLoader, AppErrorBoundary } from "@/lib/lazyPage";
const ComingSoon = lazyPage(() => import("./pages/ComingSoon"));
import Index from "./pages/Index";
const About = lazyPage(() => import("./pages/About"));
const Services = lazyPage(() => import("./pages/Services"));
const AirShipping = lazyPage(() => import("./pages/services/AirShipping"));
const OceanShipping = lazyPage(() => import("./pages/services/OceanShipping"));
const PersonalShopping = lazyPage(() => import("./pages/services/PersonalShopping"));
const Procurement = lazyPage(() => import("./pages/services/Procurement"));
const ImportExport = lazyPage(() => import("./pages/services/ImportExport"));
const ImportService = lazyPage(() => import("./pages/services/ImportService"));
const ExportService = lazyPage(() => import("./pages/services/ExportService"));
const WarehousingPage = lazyPage(() => import("./pages/services/Warehousing"));
const CustomsClearance = lazyPage(() => import("./pages/services/CustomsClearance"));
const GlobalPickup = lazyPage(() => import("./pages/services/GlobalPickup"));

const Pricing = lazyPage(() => import("./pages/Pricing"));
const Contact = lazyPage(() => import("./pages/Contact"));
const Blog = lazyPage(() => import("./pages/Blog"));
const Auth = lazyPage(() => import("./pages/Auth"));
const AuthConfirm = lazyPage(() => import("./pages/AuthConfirm"));
const AuthCallback = lazyPage(() => import("./pages/AuthCallback"));
const ResetPassword = lazyPage(() => import("./pages/ResetPassword"));
const Overview = lazyPage(() => import("./pages/dashboard/Overview"));
const Shipments = lazyPage(() => import("./pages/dashboard/Shipments"));
const CreateShipment = lazyPage(() => import("./pages/dashboard/CreateShipment"));
const ShipmentDetail = lazyPage(() => import("./pages/dashboard/ShipmentDetail"));
const Wallet = lazyPage(() => import("./pages/dashboard/Wallet"));
const Payments = lazyPage(() => import("./pages/dashboard/Payments"));
const Profile = lazyPage(() => import("./pages/dashboard/Profile"));
const Notifications = lazyPage(() => import("./pages/dashboard/Notifications"));
const AdminDashboard = lazyPage(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazyPage(() => import("./pages/admin/AdminUsers"));
const AdminShipments = lazyPage(() => import("./pages/admin/AdminShipments"));
const AdminPayments = lazyPage(() => import("./pages/admin/AdminPayments"));
const AdminPricing = lazyPage(() => import("./pages/admin/AdminPricing"));
const AdminAnalytics = lazyPage(() => import("./pages/admin/AdminAnalytics"));
const AdminNotifications = lazyPage(() => import("./pages/admin/AdminNotifications"));
const AdminInvoices = lazyPage(() => import("./pages/admin/AdminInvoices"));
const AdminShippingRoutes = lazyPage(() => import("./pages/admin/AdminShippingRoutes"));
const AdminShippingZones = lazyPage(() => import("./pages/admin/AdminShippingZones"));
const AdminPricingEngine = lazyPage(() => import("./pages/admin/AdminPricingEngine"));
const AdminQuotations = lazyPage(() => import("./pages/admin/AdminQuotations"));
const AdminQuotationBuilder = lazyPage(() => import("./pages/admin/AdminQuotationBuilder"));
const AdminWarehouses = lazyPage(() => import("./pages/admin/AdminWarehouses"));
const AdminPackaging = lazyPage(() => import("./pages/admin/AdminPackaging"));
const AdminEmail = lazyPage(() => import("./pages/admin/AdminEmail"));
const AdminEmailCenter = lazyPage(() => import("./pages/admin/AdminEmailCenter"));
const Unsubscribe = lazyPage(() => import("./pages/Unsubscribe"));
const Invoices = lazyPage(() => import("./pages/dashboard/Invoices"));
const PaymentCallback = lazyPage(() => import("./pages/dashboard/PaymentCallback"));
const Support = lazyPage(() => import("./pages/dashboard/Support"));
const SupportTicketDetail = lazyPage(() => import("./pages/dashboard/SupportTicketDetail"));
const NotFound = lazyPage(() => import("./pages/NotFound"));
const Track = lazyPage(() => import("./pages/Track"));
const Shipping = lazyPage(() => import("./pages/Shipping"));
const PersonalShoppingForm = lazyPage(() => import("./pages/PersonalShoppingForm"));
const ShoppingOrders = lazyPage(() => import("./pages/dashboard/ShoppingOrders"));
const ShoppingOrderPayment = lazyPage(() => import("./pages/dashboard/ShoppingOrderPayment"));
const AdminShoppingOrders = lazyPage(() => import("./pages/admin/AdminShoppingOrders"));
const AdminSupport = lazyPage(() => import("./pages/admin/AdminSupport"));
const AdminSupportDetail = lazyPage(() => import("./pages/admin/AdminSupportDetail"));
const AdminRefunds = lazyPage(() => import("./pages/admin/AdminRefunds"));
const Checkout = lazyPage(() => import("./pages/Checkout"));
const DesignSystem = lazyPage(() => import("./pages/DesignSystem"));
const Partners = lazyPage(() => import("./pages/Partners"));
const Partner = lazyPage(() => import("./pages/dashboard/Partner"));
const AdminPartners = lazyPage(() => import("./pages/admin/AdminPartners"));
const Terms = lazyPage(() => import("./pages/Terms"));
const Privacy = lazyPage(() => import("./pages/Privacy"));
// Flip this to true to show the public Coming Soon page everywhere except admin/auth/dashboard.
const COMING_SOON_MODE = false;
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

// Redirects public pages to the Coming Soon screen while keeping admin,
// dashboard, and auth flows accessible. Toggle with COMING_SOON_MODE above.
const ComingSoonGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  if (!COMING_SOON_MODE) return <>{children}</>;

  const allowedPrefixes = ["/auth", "/dashboard", "/admin", "/unsubscribe"];
  const isAllowed = allowedPrefixes.some(
    (prefix) =>
      location.pathname === prefix || location.pathname.startsWith(prefix + "/")
  );

  if (isAllowed) return <>{children}</>;
  return <ComingSoon />;
};

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
              <ComingSoonGuard>
                <AppErrorBoundary>
                <React.Suspense fallback={<PageLoader />}>
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
                  <Route path="/admin/shipping-zones" element={<AdminShippingZones />} />
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
                  <Route path="/admin/email-center" element={<AdminEmailCenter />} />
                  <Route path="/unsubscribe" element={<Unsubscribe />} />
                  {/* Design System */}
                  <Route path="/design-system" element={<DesignSystem />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </React.Suspense>
                </AppErrorBoundary>
              </ComingSoonGuard>
            </BrowserRouter>
            </TooltipProvider>
          </SafeLoginTracker>
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;