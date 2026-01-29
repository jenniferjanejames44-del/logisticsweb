import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveChat from "@/components/LiveChat";
import { useInView } from "@/hooks/useInView";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  CheckCircle,
  ArrowRight
} from "lucide-react";

const Contact = () => {
  const { ref: heroRef, isInView: heroInView } = useInView({ threshold: 0.2 });
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you within 24 hours.",
    });

    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Head Office",
      details: ["123 Logistics Avenue", "Victoria Island, Lagos", "Nigeria"]
    },
    {
      icon: Phone,
      title: "Phone",
      details: ["+234 818 595 6707"]
    },
    {
      icon: Mail,
      title: "Email",
      details: ["info@raclogistics.com", "support@raclogistics.com"]
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Mon - Fri: 8:00 AM - 6:00 PM", "Sat: 9:00 AM - 2:00 PM"]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Instagram, href: "#", label: "Instagram" }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative pt-32 pb-24 md:pt-44 md:pb-28 overflow-hidden"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80)',
            }}
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-navy opacity-90" />
          
          <div className="section-container relative z-10">
            <div className={`text-center max-w-4xl mx-auto transition-all duration-700 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <span className="inline-block px-6 py-3 bg-secondary/20 text-secondary rounded-full text-sm font-bold tracking-wider uppercase mb-8 border border-secondary/30">
                Get in Touch
              </span>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                Contact <span className="text-secondary">RAC Logistics</span>
              </h1>
              <p className="text-lg md:text-xl text-white font-medium leading-relaxed max-w-2xl mx-auto" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.3)' }}>
                Have questions? Need a quote? We're here to help. Reach out to our team and we'll respond within 24 hours.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="section-padding bg-gradient-to-b from-background to-muted/30">
          <div className="section-container">
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="border-border/30 shadow-2xl">
                  <CardContent className="p-6 md:p-10">
                    <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-8">
                      Send Us a Message
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="font-semibold text-sm text-foreground">Full Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="h-12 rounded-lg border-2 border-border focus:border-secondary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="font-semibold text-sm text-foreground">Email Address *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="h-12 rounded-lg border-2 border-border focus:border-secondary"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="font-semibold text-sm text-foreground">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+234 800 000 0000"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="h-12 rounded-lg border-2 border-border focus:border-secondary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject" className="font-semibold text-sm text-foreground">Subject *</Label>
                          <Select 
                            value={formData.subject} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                          >
                            <SelectTrigger id="subject" className="h-12 rounded-lg border-2 border-border focus:border-secondary">
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="quote">Request a Quote</SelectItem>
                              <SelectItem value="tracking">Shipment Tracking</SelectItem>
                              <SelectItem value="support">Customer Support</SelectItem>
                              <SelectItem value="partnership">Partnership Inquiry</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="font-semibold text-sm text-foreground">Message *</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Tell us about your shipping needs..."
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={6}
                          className="resize-none rounded-lg border-2 border-border focus:border-secondary"
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-4 font-bold text-base rounded-xl transition-all duration-300 ease-out bg-secondary text-primary shadow-lg hover:shadow-xl hover:bg-secondary/95 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0 group"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info */}
              <div className="space-y-5">
                {contactInfo.map((info, index) => (
                  <Card 
                    key={info.title} 
                    className="group relative overflow-hidden border border-border/50 rounded-2xl hover:border-secondary/40 hover:shadow-xl transition-all duration-400 hover:-translate-y-1"
                    style={{ transitionDelay: `${index * 60}ms` }}
                  >
                    {/* Top accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
                    
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 gradient-blue rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                          <info.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                            {info.title}
                          </h3>
                          {info.details.map((detail, i) => (
                            <p key={i} className="text-foreground/70 text-sm font-medium">
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Social Links */}
                <Card className="border border-border/50 rounded-2xl">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-foreground mb-5">
                      Follow Us
                    </h3>
                    <div className="flex gap-3">
                      {socialLinks.map((social) => (
                        <a
                          key={social.label}
                          href={social.href}
                          className="w-11 h-11 gradient-blue rounded-xl flex items-center justify-center text-white hover:scale-110 hover:shadow-lg transition-all duration-300"
                          aria-label={social.label}
                        >
                          <social.icon className="w-5 h-5" />
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="section-padding bg-section-blue">
          <div className="section-container">
            <div className="text-center mb-12 lg:mb-14">
              <span className="badge-blue mb-6">
                Location
              </span>
              <h2 className="text-primary">
                Visit Our <span className="gradient-text">Office</span>
              </h2>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden shadow-xl h-[400px] bg-card border border-border/50">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 gradient-blue rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <MapPin className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-xl font-bold text-foreground mb-2">123 Logistics Avenue</p>
                  <p className="text-foreground/70 font-medium mb-6">Victoria Island, Lagos, Nigeria</p>
                  <a 
                    href="https://maps.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-6 py-3 font-bold text-sm rounded-xl transition-all duration-300 ease-out bg-secondary text-primary shadow-md hover:shadow-lg hover:bg-secondary/95 hover:-translate-y-0.5 active:translate-y-0 group"
                  >
                    Open in Google Maps
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ CTA */}
        <section className="section-padding bg-navy relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="section-container text-center relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              Have More <span className="text-secondary">Questions?</span>
            </h2>
            <p className="text-lg md:text-xl text-white font-medium mb-10 max-w-2xl mx-auto leading-relaxed" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
              Check out our frequently asked questions or start a live chat for immediate assistance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/blog"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 font-bold text-base rounded-xl transition-all duration-300 ease-out bg-secondary text-primary shadow-lg hover:shadow-xl hover:bg-secondary/95 hover:-translate-y-0.5 active:translate-y-0 group"
              >
                View Resources
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2.5 px-8 py-4 font-bold text-base rounded-xl transition-all duration-300 ease-out bg-white/10 text-white border-2 border-white/40 hover:bg-white/20 hover:border-white/60 hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-sm group">
                Start Live Chat
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
};

export default Contact;
