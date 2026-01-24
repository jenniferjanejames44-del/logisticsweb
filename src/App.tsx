import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import AirShipping from "./pages/services/AirShipping";
import OceanShipping from "./pages/services/OceanShipping";
import PersonalShopping from "./pages/services/PersonalShopping";
import Procurement from "./pages/services/Procurement";
import ImportExport from "./pages/services/ImportExport";
import WarehousingPage from "./pages/services/Warehousing";
import CustomsClearance from "./pages/services/CustomsClearance";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Auth from "./pages/Auth";
import Overview from "./pages/dashboard/Overview";
import Shipments from "./pages/dashboard/Shipments";
import Payments from "./pages/dashboard/Payments";
import Profile from "./pages/dashboard/Profile";
import Notifications from "./pages/dashboard/Notifications";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminShipments from "./pages/admin/AdminShipments";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/air-shipping" element={<AirShipping />} />
            <Route path="/services/ocean-shipping" element={<OceanShipping />} />
            <Route path="/services/personal-shopping" element={<PersonalShopping />} />
            <Route path="/services/procurement" element={<Procurement />} />
            <Route path="/services/import-export" element={<ImportExport />} />
            <Route path="/services/warehousing" element={<WarehousingPage />} />
            <Route path="/services/customs-clearance" element={<CustomsClearance />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/auth" element={<Auth />} />
            {/* Customer Dashboard */}
            <Route path="/dashboard" element={<Overview />} />
            <Route path="/dashboard/shipments" element={<Shipments />} />
            <Route path="/dashboard/payments" element={<Payments />} />
            <Route path="/dashboard/profile" element={<Profile />} />
            <Route path="/dashboard/notifications" element={<Notifications />} />
            {/* Admin Dashboard */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/shipments" element={<AdminShipments />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/pricing" element={<AdminPricing />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
