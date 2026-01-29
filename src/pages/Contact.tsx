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
              <span className="inline-block px-5 py-2.5 bg-secondary/20 text-secondary rounded-full text-sm font-bold tracking-wider uppercase mb-6">
                Get in Touch
              </span>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                Contact <span className="text-secondary">RAC Logistics</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
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

                      <Button 
                        type="submit" 
                        variant="default" 
                        size="xl" 
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info */}
              <div className="space-y-6">
                {contactInfo.map((info) => (
                  <Card key={info.title} className="border border-border rounded-2xl hover:border-secondary/30 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <info.icon className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-foreground mb-2">
                            {info.title}
                          </h3>
                          {info.details.map((detail, i) => (
                            <p key={i} className="text-muted-foreground text-sm">
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Social Links */}
                <Card className="border border-border rounded-2xl">
                  <CardContent className="p-6">
                    <h3 className="font-heading font-bold text-foreground mb-4">
                      Follow Us
                    </h3>
                    <div className="flex gap-3">
                      {socialLinks.map((social) => (
                        <a
                          key={social.label}
                          href={social.href}
                          className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
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
        <section className="section-padding bg-muted">
          <div className="section-container">
            <div className="text-center mb-8 md:mb-12">
              <span className="inline-block px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-medium mb-4">
                Location
              </span>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                Visit Our Office
              </h2>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden shadow-lg h-[400px] bg-gradient-to-br from-[hsl(222,47%,11%)/10] to-secondary/10 border border-border">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-secondary mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground">123 Logistics Avenue</p>
                  <p className="text-muted-foreground">Victoria Island, Lagos, Nigeria</p>
                  <Button variant="default" className="mt-4" asChild>
                    <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                      Open in Google Maps
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ CTA */}
        <section className="section-padding bg-gradient-to-br from-[hsl(222,47%,11%)] to-[hsl(222,40%,15%)]">
          <div className="section-container text-center">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              Have More Questions?
            </h2>
            <p className="text-lg md:text-xl text-[hsl(215,20%,80%)] mb-8 max-w-2xl mx-auto leading-relaxed">
              Check out our frequently asked questions or start a live chat for immediate assistance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="default" size="xl" className="w-full sm:w-auto group" asChild>
                <Link to="/blog">
                  View Resources
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </Link>
              </Button>
              <Button variant="ghost" size="xl" className="w-full sm:w-auto group">
                Start Live Chat
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Button>
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
