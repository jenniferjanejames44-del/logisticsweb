import { useState, useEffect } from "react";
import { ArrowRight, FileText, Package, Truck, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import TrackingCard from "./TrackingCard";
import heroVideo from "@/assets/hero-logistics-video.mp4";
import heroPoster from "@/assets/hero-logistics.jpg";

const quickActions = [
  { icon: FileText, label: "Get a Quote", href: "/pricing" },
  { icon: Package, label: "Create Shipment", href: "/auth" },
  { icon: Truck, label: "Schedule Pickup", href: "/contact" },
  { icon: MapPin, label: "Find a Service Point", href: "/contact" },
];

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary">
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

      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 relative z-10 pt-28 sm:pt-36 pb-12 md:py-36">
        <div className="max-w-[700px] mx-auto text-center lg:text-left lg:mx-0">
          {/* Main Heading */}
          <h1 className={`mb-4 sm:mb-6 transition-all duration-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            <span className="text-white block font-extrabold text-[1.75rem] sm:text-5xl md:text-6xl lg:text-[4.5rem] leading-[1.1] tracking-tight">Global Logistics.</span>
            <span className="text-white/90 block font-extrabold text-[1.75rem] sm:text-5xl md:text-6xl lg:text-[4.5rem] leading-[1.1] tracking-tight">Delivered With Excellence.</span>
          </h1>

          {/* Subtitle */}
          <p className={`text-base sm:text-xl mb-8 sm:mb-12 leading-relaxed font-medium transition-all duration-500 delay-100 text-white/85 max-w-xl mx-auto lg:mx-0 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            Your trusted partner for seamless shipping solutions across 150+ countries. 
            Fast, secure, and reliable delivery guaranteed.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-row flex-wrap items-center justify-center lg:justify-start gap-3 mb-6 sm:mb-10 transition-all duration-500 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            <Link 
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 font-bold text-sm rounded-full shadow-lg transition-all duration-200 bg-[hsl(45,100%,51%)] text-[hsl(0,0%,13%)] hover:bg-[hsl(45,100%,45%)] hover:shadow-xl active:scale-[0.98]"
            >
              Get Quote
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/auth"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 font-bold text-sm rounded-full shadow-lg transition-all duration-200 bg-background text-primary border-2 border-background hover:bg-[hsl(45,100%,51%)] hover:text-[hsl(0,0%,13%)] hover:border-[hsl(45,100%,51%)] active:scale-[0.98]"
            >
              Sign Up
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Tracking Card Component */}
          <TrackingCard isVisible={isVisible} />
        </div>
      </div>
    </section>

    {/* Quick Action Row - Inspired by Africanies "Let's get started" */}
    <section className="relative -mt-6 sm:-mt-8 z-20 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={action.label}
              to={action.href}
              className={`group flex items-center gap-2.5 sm:gap-4 bg-card border border-border rounded-xl p-3 sm:p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: `${index * 80 + 600}ms` }}
            >
              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-[hsl(45,100%,51%)] rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <action.icon className="w-4 h-4 sm:w-6 sm:h-6 text-[hsl(0,0%,13%)]" />
              </div>
              <span className="font-bold text-xs sm:text-base text-foreground group-hover:text-primary transition-colors leading-tight">{action.label}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground ml-auto hidden sm:block group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </section>
    </>
  );
};

export default HeroSection;
