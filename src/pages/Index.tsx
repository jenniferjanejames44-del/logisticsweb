import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveChat from "@/components/LiveChat";
import HeroSection from "@/components/home/HeroSection";
import ShipmentCreationForm from "@/components/home/ShipmentCreationForm";
import GoalVisionSection from "@/components/home/GoalVisionSection";
import ServicesSection from "@/components/home/ServicesSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import FounderSection from "@/components/home/FounderSection";
import CoreValuesSection from "@/components/home/CoreValuesSection";
import WhyChooseSection from "@/components/home/WhyChooseSection";
import IndustriesSection from "@/components/home/IndustriesSection";
import PartnersSection from "@/components/home/PartnersSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ShipmentCreationForm />
        <GoalVisionSection />
        <ServicesSection />
        <HowItWorksSection />
        <FounderSection />
        <div className="hidden md:block">
          <CoreValuesSection />
        </div>
        <WhyChooseSection />
        <IndustriesSection />
        <PartnersSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
};

export default Index;
