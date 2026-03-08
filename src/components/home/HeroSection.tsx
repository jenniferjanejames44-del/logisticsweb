import { useState, useEffect } from "react";
import { ArrowRight, Globe2, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TrackingCard from "./TrackingCard";
import heroVideo from "@/assets/hero-logistics-video.mp4";
import heroPoster from "@/assets/hero-logistics.jpg";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="page-hero relative min-h-[100vh] flex items-center justify-center">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={heroPoster}
        disablePictureInPicture
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_30%),linear-gradient(180deg,rgba(6,16,67,0.25),rgba(6,16,67,0.9))]" />

      <div className="section-container relative z-10 pt-32 pb-24 sm:pt-36 lg:pt-40 lg:pb-32">
        <div className="hero-grid">
          <div className="max-w-2xl text-left">
            <div className={`mb-6 transition-all duration-500 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/12 px-4 py-2 text-sm font-bold text-white/90 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Trusted Global Logistics Partner
              </span>
            </div>

            <h1 className={`mb-6 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
              <span className="block leading-[1.02] text-white">Global Logistics.</span>
              <span className="block leading-[1.02] text-accent">Delivered With Excellence.</span>
            </h1>

            <p className={`mb-8 max-w-xl text-lg font-medium leading-8 text-white/80 transition-all duration-700 delay-150 sm:text-xl ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
              Your trusted partner for seamless shipping solutions across 150+ countries.
              Fast, secure, and reliable delivery guaranteed.
            </p>

            <div className={`mb-10 flex flex-wrap items-center gap-4 transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
              <Button asChild variant="heroPrimary" size="lg">
                <Link to="/pricing">
                  Get Quote
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </Button>
              <Button asChild variant="heroSecondary" size="lg">
                <Link to="/auth">
                  Sign Up
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </Button>
            </div>

            <div className={`grid gap-3 sm:grid-cols-3 transition-all duration-700 delay-500 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
              {[
                { icon: Globe2, label: "150+ Countries" },
                { icon: ShieldCheck, label: "Secure delivery" },
                { icon: Truck, label: "Real-time tracking" },
              ].map((item) => (
                <div key={item.label} className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm">
                  <item.icon className="mb-3 h-5 w-5 text-accent" />
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <TrackingCard isVisible={isVisible} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
