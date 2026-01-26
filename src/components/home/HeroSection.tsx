import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Package, MapPin, Clock, Shield, Play } from "lucide-react";
import { Link } from "react-router-dom";
import heroVideo from "@/assets/hero-logistics-video.mp4";
import heroImage from "@/assets/hero-logistics.jpg";

const HeroSection = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animations after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background with Deep Navy Overlay */}
      <div className="absolute inset-0">
        {/* Video background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={heroImage}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
          {/* Fallback to image if video doesn't load */}
          <img
            src={heroImage}
            alt="Global Logistics"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </video>
        {/* Deep Navy gradient overlay - #0A0E27 to #1A1F3A */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(230,60%,10%)]/90 via-[hsl(230,50%,15%)]/85 to-[hsl(230,55%,12%)]/90" />
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.5'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10V8zm0 4L52 0h2L40 14v-2zm0 4L56 0h2L40 18v-2zm0 4L60 0h2L40 22v-2zm0 4L64 0h2L40 26v-2zm0 4L68 0h2L40 30v-2zm0 4L72 0h2L40 34v-2zm0 4L76 0h2L40 38v-2zm0 4L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0l28-28v2L54 40h-2zm4 0l24-24v2L58 40h-2zm4 0l20-20v2L62 40h-2zm4 0l16-16v2L66 40h-2zm4 0l12-12v2L70 40h-2zm4 0l8-8v2l-6 6h-2zm4 0l4-4v2l-2 2h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        {/* Animated gradient orbs - using Orange accent */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[hsl(217,91%,60%)]/10 rounded-full blur-3xl animate-float" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge - Glass effect */}
          <div className={`inline-flex items-center gap-2 sm:gap-3 bg-white/15 backdrop-blur-md rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 shadow-lg border border-white/20 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}>
            <span className="relative flex h-2 w-2 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-secondary"></span>
            </span>
            <span className="text-xs sm:text-sm text-white font-semibold tracking-wide">
              Trusted by 10,000+ Businesses Worldwide
            </span>
          </div>

          {/* Main Headline - Pure White */}
          <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-heading font-extrabold text-white leading-[0.95] mb-5 sm:mb-6 tracking-tight transition-all duration-700 delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            Global Logistics
            {/* Subheading - Vibrant Orange with glow */}
            <span 
              className="block mt-2 sm:mt-3 text-[hsl(18,100%,60%)]"
              style={{ textShadow: '0 0 40px rgba(255, 107, 53, 0.5)' }}
            >
              Delivered With Excellence
            </span>
          </h1>

          {/* Subtitle - Light Gray #E2E8F0 */}
          <p className={`text-lg sm:text-xl md:text-2xl text-[hsl(214,32%,91%)] mb-8 sm:mb-10 lg:mb-12 leading-relaxed max-w-3xl mx-auto px-2 font-medium transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            Your trusted partner for seamless shipping solutions across 150+ countries. 
            Fast, secure, and reliable delivery guaranteed.
          </p>

          {/* CTA Buttons - High contrast */}
          <div className={`flex flex-col sm:flex-row justify-center items-center gap-4 mb-12 sm:mb-16 px-4 sm:px-0 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <Button variant="heroPrimary" size="lg" className="w-fit text-base font-bold" asChild>
              <Link to="/pricing">
                Get Free Quote
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </Link>
            </Button>
            <Button variant="heroSecondary" size="lg" className="w-fit text-base font-bold" asChild>
              <Link to="/services">
                <Play size={16} className="mr-2" />
                Our Services
              </Link>
            </Button>
          </div>

          {/* Tracker Card - Glassmorphism with Orange accents */}
          <div className={`bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 max-w-xl mx-auto shadow-2xl border border-white/20 transition-all duration-700 delay-[400ms] ${
            isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
          }`}>
            <h3 className="text-white font-heading font-bold text-lg sm:text-xl lg:text-2xl mb-5 sm:mb-6 flex items-center justify-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-secondary rounded-xl flex items-center justify-center shadow-button">
                <Search size={20} className="sm:w-6 sm:h-6 text-white" />
              </div>
              Track Your Shipment
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="flex-1 bg-white/15 border-white/25 text-white placeholder:text-white/60 h-12 sm:h-14 rounded-xl text-base focus:bg-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/50 transition-all"
              />
              <Button variant="heroPrimary" size="lg" className="h-12 sm:h-14 px-6 text-base font-bold">
                Track Now
              </Button>
            </div>
            <p className="text-sm text-white/70 mt-4 flex items-center justify-center gap-2">
              <Package size={16} />
              Example: RAC-2026-XXXXXX
            </p>
          </div>

          {/* Trust Indicators */}
          <div className={`mt-12 sm:mt-16 flex flex-wrap justify-center gap-6 sm:gap-10 lg:gap-16 transition-all duration-700 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            {[
              { icon: MapPin, text: "150+ Countries", highlight: "Global" },
              { icon: Clock, text: "24/7 Support", highlight: "Always" },
              { icon: Shield, text: "Fully Insured", highlight: "100%" },
            ].map((item, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-3 text-white/90 group transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${600 + index * 100}ms` }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-secondary/30 transition-colors border border-white/10">
                  <item.icon size={20} className="sm:w-6 sm:h-6 text-secondary" />
                </div>
                <div className="text-left">
                  <span className="block text-xs text-secondary font-semibold">{item.highlight}</span>
                  <span className="font-bold text-sm sm:text-base">{item.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade to background */}
      <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
