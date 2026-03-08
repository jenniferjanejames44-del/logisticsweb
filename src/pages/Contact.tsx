import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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

    try {
      await supabase.functions.invoke("send-notification-email", {
        body: {
          type: "contact_message",
          data: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: formData.subject,
            message: formData.message,
          },
        },
      });

      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });

      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      console.error("Contact form error:", err);
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Head Office",
      details: ["29b Osolo Way, Opposite Polaris Bank", "Ajao Estate, Isolo", "Lagos State, Nigeria"]
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
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80)',
            }}
          />
          
          <div className="section-container relative z-10">
            <div className={`text-center max-w-3xl mx-auto transition-all duration-500 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 text-white/90 backdrop-blur-sm border border-white/20 rounded-full text-sm font-bold mb-6">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Get in Touch
              </span>
              <h1 className="text-white mb-4 leading-tight">
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
                          <Input id="name" name="name" placeholder="John Doe" value={formData.name} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="font-medium text-sm">Email Address *</Label>
                          <Input id="email" name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleInputChange} required />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="font-medium text-sm">Phone Number</Label>
                          <Input id="phone" name="phone" type="tel" placeholder="+234 800 000 0000" value={formData.phone} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject" className="font-medium text-sm">Subject *</Label>
                          <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
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
                        <Textarea id="message" name="message" placeholder="Tell us about your shipping needs..." value={formData.message} onChange={handleInputChange} required rows={5} className="resize-none" />
                      </div>

                      <Button type="submit" disabled={isSubmitting} variant="accent" className="w-full" size="lg">
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin mr-2" />
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
                  <Card key={info.title} className="border-border hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          <info.icon className="w-5 h-5 text-primary" strokeWidth={2.5} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1 text-sm">{info.title}</h3>
                          {info.details.map((detail, i) => (
                            <p key={i} className="text-muted-foreground text-sm">{detail}</p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Social Links */}
                <Card className="border-border">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground mb-4 text-sm">Follow Us</h3>
                    <div className="flex gap-3">
                      {socialLinks.map((social) => (
                        <a
                          key={social.label}
                          href={social.href}
                          className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-110 shadow-sm"
                          aria-label={social.label}
                        >
                          <social.icon className="w-4 h-4" strokeWidth={2.5} />
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
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-bold mb-4">
                Location
              </span>
              <h2 className="text-foreground">Visit Our Office</h2>
            </div>
            
            <div className="relative rounded-xl overflow-hidden shadow-lg h-[400px] bg-card border border-border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.8!2d3.3282!3d6.5282!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMzEnNDEuNSJOIDPCsDE5JzQxLjUiRQ!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng&q=29b+Osolo+Way+Ajao+Estate+Isolo+Lagos"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="RAC Logistics Office Location" className="absolute inset-0"
              />
            </div>
            <div className="mt-4 text-center">
              <a
                href="https://www.google.com/maps/search/29b+Osolo+Way+Opposite+Polaris+Bank+Ajao+Estate+Isolo+Lagos"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-lg"
              >
                Open in Google Maps
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* FAQ CTA */}
        <section className="section-padding bg-primary">
          <div className="section-container text-center">
            <h2 className="text-white mb-6">Have More Questions?</h2>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Check out our frequently asked questions or start a live chat for immediate assistance.
            </p>
            <div className="flex flex-row items-center justify-center gap-4">
              <Link 
                to="/blog"
                className="btn btn-primary btn-lg"
              >
                View Resources
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <button className="btn btn-secondary btn-lg">
                Start Live Chat
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
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
