import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
