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
          className="relative pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden bg-primary"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80)',
            }}
          />
          
          <div className="section-container relative z-10">
            <div className={`text-center max-w-3xl mx-auto transition-all duration-500 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="inline-block px-4 py-2 bg-[hsl(45,100%,51%)] text-[hsl(0,0%,13%)] rounded-full text-sm font-bold mb-6">
                Get in Touch
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Contact RAC Logistics
              </h1>
              <p className="text-base md:text-lg text-white/80 leading-relaxed max-w-xl mx-auto">
                Have questions? Need a quote? We're here to help. Reach out to our team and we'll respond within 24 hours.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="section-padding bg-background">
          <div className="section-container">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="border-border shadow-lg">
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-6">
                      Send Us a Message
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="font-medium text-sm">Full Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="font-medium text-sm">Email Address *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="font-medium text-sm">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+234 800 000 0000"
                            value={formData.phone}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject" className="font-medium text-sm">Subject *</Label>
                          <Select 
                            value={formData.subject} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                          >
                            <SelectTrigger id="subject">
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
                        <Label htmlFor="message" className="font-medium text-sm">Message *</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Tell us about your shipping needs..."
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={5}
                          className="resize-none"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                {contactInfo.map((info) => (
                  <Card 
                    key={info.title} 
                    className="border-border hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-[hsl(45,100%,51%)] rounded-lg flex items-center justify-center flex-shrink-0">
                          <info.icon className="w-5 h-5 text-[hsl(0,0%,13%)]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1 text-sm">
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
                <Card className="border-border">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground mb-4 text-sm">
                      Follow Us
                    </h3>
                    <div className="flex gap-3">
                      {socialLinks.map((social) => (
                        <a
                          key={social.label}
                          href={social.href}
                          className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground hover:bg-[hsl(45,100%,51%)] hover:text-[hsl(0,0%,13%)] transition-colors"
                          aria-label={social.label}
                        >
                          <social.icon className="w-4 h-4" />
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
            <div className="text-center mb-10">
              <span className="inline-block px-3 py-1.5 bg-[hsl(45,100%,51%)]/15 text-[hsl(45,100%,40%)] rounded-full text-sm font-bold mb-4">
                Location
              </span>
              <h2 className="text-foreground">
                Visit Our Office
              </h2>
            </div>
            
            <div className="relative rounded-xl overflow-hidden shadow-lg h-[350px] bg-card border border-border">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[hsl(45,100%,51%)] rounded-xl flex items-center justify-center mx-auto mb-5">
                    <MapPin className="w-8 h-8 text-[hsl(0,0%,13%)]" />
                  </div>
                  <p className="text-lg font-semibold text-foreground mb-1">123 Logistics Avenue</p>
                  <p className="text-muted-foreground mb-5">Victoria Island, Lagos, Nigeria</p>
                  <a 
                    href="https://maps.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-lg transition-all duration-200 bg-primary text-primary-foreground hover:bg-[hsl(45,100%,51%)] hover:text-[hsl(0,0%,13%)] active:scale-[0.98]"
                  >
                    Open in Google Maps
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ CTA */}
        <section className="section-padding bg-primary">
          <div className="section-container text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
              Have More Questions?
            </h2>
            <p className="text-base text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
              Check out our frequently asked questions or start a live chat for immediate assistance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link 
                to="/blog"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 font-bold text-sm rounded-lg transition-all duration-200 bg-[hsl(45,100%,51%)] text-[hsl(0,0%,13%)] hover:bg-[hsl(45,100%,45%)] active:scale-[0.98]"
              >
                View Resources
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3 font-bold text-sm rounded-lg transition-all duration-200 bg-white text-primary hover:bg-primary hover:text-white active:scale-[0.98]">
                Start Live Chat
                <ArrowRight className="w-4 h-4" />
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
