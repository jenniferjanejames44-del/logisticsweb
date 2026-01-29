import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveChat from "@/components/LiveChat";
import AboutHeroSection from "@/components/about/AboutHeroSection";
import MissionVisionSection from "@/components/about/MissionVisionSection";
import CompanyStorySection from "@/components/about/CompanyStorySection";
import LeadershipSection from "@/components/about/LeadershipSection";
import TrustedBySection from "@/components/about/TrustedBySection";
import AboutCTASection from "@/components/about/AboutCTASection";

const About = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <AboutHeroSection />
        <MissionVisionSection />
        <CompanyStorySection />
        <LeadershipSection />
        <TrustedBySection />
        <AboutCTASection />
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
};

export default About;
