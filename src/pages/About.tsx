import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveChat from "@/components/LiveChat";
import AboutHeroSection from "@/components/about/AboutHeroSection";
import MissionVisionSection from "@/components/about/MissionVisionSection";
import CompanyStorySection from "@/components/about/CompanyStorySection";
import LeadershipSection from "@/components/about/LeadershipSection";
import AchievementsSection from "@/components/about/AchievementsSection";
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
        <AchievementsSection />
        <AboutCTASection />
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
};

export default About;
