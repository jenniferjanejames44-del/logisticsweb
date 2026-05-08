import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Star, Quote, Phone, Mail, MapPin, Truck, Plane, Ship, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import HeaderLogo from "@/components/layout/HeaderLogo";
import LiveChat from "@/components/LiveChat";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const PROCUREMENT_FORM_ROUTE = "/personal-shopping/new";

const Procurement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const goToProcurement = () => {
    if (user) {
      navigate(PROCUREMENT_FORM_ROUTE);
    } else {
      localStorage.setItem("post_auth_redirect", PROCUREMENT_FORM_ROUTE);
      navigate("/auth?mode=signup");
    }
  };

  const heroImages = [
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=700&q=80",
  ];

  const brandLogos = [
    { name: "Amazon", src: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
    { name: "Walmart", src: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg" },
    { name: "eBay", src: "https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg" },
    { name: "Alibaba", src: "https://upload.wikimedia.org/wikipedia/commons/9/96/Alibaba-Logo.svg" },
    { name: "AliExpress", src: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Aliexpress_logo.svg" },
    { name: "Shopify", src: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg" },
    { name: "Target", src: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Target_logo.svg" },
    { name: "Best Buy", src: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Best_Buy_Logo.svg" },
  ];

  const categories = [
    { name: "Phones & Gadgets", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80" },
    { name: "Laptops & Computers", img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80" },
    { name: "Household Equipment", img: "https://images.unsplash.com/photo-1583845112203-29329902332e?auto=format&fit=crop&w=800&q=80" },
    { name: "Car Parts & Vehicles", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80" },
    { name: "Fashion & Luxury", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80" },
    { name: "Industrial Equipment", img: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?auto=format&fit=crop&w=800&q=80" },
    { name: "Medical Equipment", img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80" },
    { name: "Bulk Business Supplies", img: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80" },
  ];

  const testimonials = [
    { name: "Funke Adeyemi", quote: "I shipped my car and personal items from the U.S. without any hassle. I got updates every step of the way. Super professional!" },
    { name: "Emeka Nnamdi", quote: "My electronics arrived safely and on time. The container shipping option saved me real money and stress. Amazing service." },
    { name: "Chinedu Obed", quote: "RAC made online purchase stress-free! My container arrived in 3 weeks, exactly as promised. Highly reliable." },
  ];

  const faqs = [
    { q: "Can I pay in Naira?", a: "Yes. We accept Naira payments through our secure Paystack checkout, and we handle the USD conversion for you." },
    { q: "Do you buy from any website?", a: "Yes. We buy from Amazon, Walmart, eBay, Alibaba, AliExpress, dealerships, manufacturers and trusted private suppliers." },
    { q: "Can you procure vehicles?", a: "Yes. We handle vehicle purchases, dealership coordination and full export documentation to Nigeria." },
    { q: "Is my item insured?", a: "Yes. Insurance options are available on every shipment and recommended for high-value electronics and machinery." },
    { q: "What happens if the seller delays shipment?", a: "We track every order and escalate directly with the seller on your behalf, keeping you updated until the item is secured." },
    { q: "How do I know what the final cost will be?", a: "We share a clear, itemised cost breakdown — product cost, procurement fee and shipping — for your approval before any purchase." },
  ];

  const CtaButton = ({ className = "" }: { className?: string }) => (
    <Button
      onClick={goToProcurement}
      size="lg"
      className={`rounded-full bg-gradient-to-r from-accent to-orange-600 px-8 text-base font-semibold text-white shadow-xl hover:opacity-95 ${className}`}
    >
      Sign Up For A Tax-Free Shopping
      <ArrowRight className="ml-1 h-4 w-4" />
    </Button>
  );

  return (
    <div className="min-h-screen bg-white">
      <main>
        {/* HERO — navy background, two-column: left has stacked logo + Attention pill + headline + bullets + CTA, right has floating image collage */}
        <section className="relative overflow-hidden bg-primary pb-12 pt-4 md:pb-20 md:pt-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(223,81,1,0.22),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_50%)]" />
          <div className="section-container">
            {/* Small circular logo centered at the very top — Africanies style */}
            <div className="relative z-10 mb-6 flex items-center justify-center md:mb-8">
              <span className="inline-flex h-14 w-14 animate-logo-shake items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-white/10 md:h-16 md:w-16">
                <HeaderLogo className="block h-8 w-auto md:h-10" />
              </span>
            </div>
            <div className="relative z-10 grid gap-8 md:grid-cols-2 md:items-start md:gap-12">
              <div className="text-left">
                <div className="mb-6 w-full rounded-md bg-gradient-to-r from-red-600 via-accent to-orange-500 px-6 py-3 text-center shadow-lg">
                  <span className="text-base font-semibold text-white md:text-lg">Attention!!! Online Shoppers</span>
                </div>
                <h1 className="mb-5 font-serif text-[28px] font-bold leading-[1.1] text-white sm:text-4xl md:text-5xl lg:text-[56px]">
                  We Buy Anything For You In The USA Tax-Free And Deliver It Safely To Nigeria
                </h1>
                <ul className="mb-7 space-y-1.5 text-base text-white/80 md:text-lg">
                  <li className="flex items-center gap-2"><span className="text-accent">•</span> Pay in Naira</li>
                  <li className="flex items-center gap-2"><span className="text-accent">•</span> Verified Suppliers Only</li>
                  <li className="flex items-center gap-2"><span className="text-accent">•</span> Fully Insured Delivery</li>
                </ul>
                <CtaButton />
                <p className="mt-3 text-sm text-white/65">Takes less than 2 minutes. No obligation.</p>
              </div>

              <div className="grid grid-cols-2 grid-rows-3 gap-2.5 sm:gap-3 md:gap-4">
                {heroImages.map((src, i) => (
                  <div
                    key={i}
                    className={`overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-white/15 animate-soft-float ${
                      i === 0 ? "row-span-2 aspect-[3/5]" : "aspect-square"
                    }`}
                    style={{ animationDelay: `${i * 0.35}s`, animationDuration: `${5 + (i % 3)}s` }}
                  >
                    <img src={src} alt="Procurement showcase" className="h-full w-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TRUSTED STORES — shaking marquee on white */}
        <section className="relative overflow-hidden border-y border-border/60 bg-white py-10">
          <div className="section-container">
            <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
              We buy from the world's top stores
            </p>
            <div className="relative overflow-hidden">
              <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-white to-transparent md:w-28" />
              <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-white to-transparent md:w-28" />
              <div className="flex w-max animate-marquee items-center gap-12 md:gap-20">
                {[...brandLogos, ...brandLogos, ...brandLogos].map((b, i) => (
                  <div key={`${b.name}-${i}`} className="flex h-10 shrink-0 items-center justify-center md:h-12">
                    <img
                      src={b.src}
                      alt={b.name}
                      className="h-full w-auto animate-logo-shake object-contain opacity-80 transition-opacity hover:opacity-100"
                      style={{ animationDelay: `${(i % brandLogos.length) * 0.18}s` }}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-muted/30 py-20">
          <div className="section-container">
            <div className="mb-12 text-center">
              <span className="mb-3 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">Simple Steps</span>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">How It Works</h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">From request to your doorstep — five clear steps backed by our procurement team.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
              {[
                { n: "01", t: "You Tell Us", d: "Send the items you want and your budget." },
                { n: "02", t: "We Confirm", d: "We verify availability with trusted suppliers." },
                { n: "03", t: "Quality Check", d: "We verify item quality, specs and pricing." },
                { n: "04", t: "Cost Breakdown", d: "We share a clear final breakdown for approval." },
                { n: "05", t: "Purchase & Ship", d: "You approve, we buy and ship to your door." },
              ].map((step) => (
                <Card key={step.n} className="group relative overflow-hidden border-border/50 bg-card transition-all hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="p-6">
                    <span className="absolute right-4 top-3 font-serif text-5xl font-bold text-accent/15 transition-colors group-hover:text-accent/30">{step.n}</span>
                    <h3 className="relative mt-2 text-lg font-bold text-foreground">{step.t}</h3>
                    <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{step.d}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-12 text-center"><CtaButton /></div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="bg-white py-20">
          <div className="section-container">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">What Can We Buy For You?</h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Electronics, vehicles, fashion, industrial machinery, medical equipment and more.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {categories.map((cat) => (
                <div key={cat.name} className="group relative overflow-hidden rounded-2xl shadow-md transition-all hover:-translate-y-1 hover:shadow-2xl">
                  <div className="aspect-square overflow-hidden">
                    <img src={cat.img} alt={cat.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-base font-bold text-white md:text-lg">{cat.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SHIPPING OPTIONS */}
        <section className="relative overflow-hidden bg-primary py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(223,81,1,0.18),transparent_45%)]" />
          <div className="section-container relative z-10">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-white md:text-4xl">Our Shipping Options</h2>
              <p className="mx-auto mt-3 max-w-2xl text-white/75">Choose the speed and cost that fits your order.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { Icon: Plane, title: "Express Shipping", duration: "3 – 5 Business Days", desc: "Fastest air-freight delivery for urgent and high-value items.", img: "https://images.unsplash.com/photo-1583416750470-965b2707b355?auto=format&fit=crop&w=900&q=80" },
                { Icon: Truck, title: "Aircargo Shipping", duration: "5 – 10 Business Days", desc: "Balanced speed and cost for everyday electronics, fashion and gadgets.", img: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=900&q=80" },
                { Icon: Ship, title: "Container Shipping", duration: "6 – 8 Weeks", desc: "Bulk and oversized procurement for businesses and full-vehicle imports.", img: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=900&q=80" },
              ].map((opt) => {
                const Icon = opt.Icon;
                return (
                  <div key={opt.title} className="group overflow-hidden rounded-3xl bg-white shadow-2xl transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(223,81,1,0.25)]">
                    <div className="relative h-56 overflow-hidden">
                      <img src={opt.img} alt={opt.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent" />
                      <span className="absolute left-5 top-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white shadow-lg">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="absolute bottom-4 left-5 right-5">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">{opt.duration}</p>
                        <h3 className="mt-1 text-xl font-bold uppercase text-white">{opt.title}</h3>
                      </div>
                    </div>
                    <p className="p-6 text-sm leading-relaxed text-muted-foreground">{opt.desc}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-12 text-center"><CtaButton /></div>
          </div>
        </section>

        {/* WHAT YOU CAN COUNT ON */}
        <section className="bg-white py-20">
          <div className="section-container grid items-center gap-12 lg:grid-cols-2">
            <div className="overflow-hidden rounded-3xl shadow-2xl">
              <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80" alt="Happy customer with package" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div>
              <span className="mb-3 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">What You Can Count On</span>
              <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl">Everything You Get When RAC Procures For You</h2>
              <ul className="space-y-4">
                {[
                  "Instant tracking updates once your item is secured and shipped",
                  "We handle everything — sourcing, purchase, shipping and delivery",
                  "No middlemen. No guesswork. Verified suppliers only",
                  "Trusted by individuals and businesses across Nigeria",
                  "Clear, transparent pricing and reliable timelines",
                  "Gadgets, machines and household items — delivered fast",
                  "24/7 premium support to guide you at every step",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <span className="text-base text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8"><CtaButton /></div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="bg-white py-20">
          <div className="section-container">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">Hear From Our Happy Customers</h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Shipped and delivered procurement orders across Nigeria.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <Card key={t.name} className="relative border-border/50 bg-card shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="p-7">
                    <Quote className="mb-4 h-8 w-8 text-accent/30" />
                    <p className="text-base leading-relaxed text-foreground">"{t.quote}"</p>
                    <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
                      <div>
                        <p className="font-semibold text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">Verified customer</p>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ — two-column: image on the left, accordion on the right */}
        <section className="bg-white py-20">
          <div className="section-container grid items-start gap-12 lg:grid-cols-2">
            <div className="lg:sticky lg:top-24">
              <span className="mb-3 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">FAQs</span>
              <h2 className="mb-5 text-3xl font-bold text-foreground md:text-4xl">Frequently Asked Questions</h2>
              <p className="mb-6 text-muted-foreground">Everything you need to know before you let us shop and ship for you. Still have questions? Our team is ready to help.</p>
              <div className="overflow-hidden rounded-3xl shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1000&q=80"
                  alt="Procurement support"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="mt-6"><CtaButton /></div>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-b border-border/60">
                  <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-accent md:text-lg">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-base leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* FINAL CTA banner */}
        <section className="bg-gradient-to-r from-accent to-orange-600 py-16">
          <div className="section-container text-center">
            <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">Ready To Start Shopping Tax-Free?</h2>
            <p className="mx-auto mb-7 max-w-2xl text-white/90">Create your account, then submit your procurement details inside the dashboard.</p>
            <Button onClick={goToProcurement} size="lg" className="rounded-full bg-white px-8 text-base font-semibold text-accent shadow-xl hover:bg-white/95">
              Sign Up Now <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>

      {/* Africanies-style minimal procurement footer */}
      <footer className="bg-primary text-white">
        <div className="section-container py-14">
          <div className="flex flex-col items-center text-center">
            <span className="rounded-full bg-white px-5 py-2 shadow-md">
              <HeaderLogo className="block h-8 w-auto" />
            </span>

            <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="flex flex-col items-center gap-2">
                <Phone className="h-5 w-5 text-accent" />
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Nigeria</p>
                <a href="tel:+2348185956707" className="text-base font-semibold hover:text-accent">+234 818 595 6707</a>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Mail className="h-5 w-5 text-accent" />
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Email</p>
                <a href="mailto:info@raclogisticltd.com" className="text-base font-semibold hover:text-accent">info@raclogisticltd.com</a>
              </div>
              <div className="flex flex-col items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Lagos Office</p>
                <p className="text-sm text-white/85">29b Osolo Way, Ajao Estate, Isolo, Lagos</p>
              </div>
            </div>

            <p className="mt-10 max-w-4xl text-sm leading-relaxed text-white/70">
              RAC Logistics acts as your trusted procurement and shipping partner. We do not own the products we purchase on your behalf — we source, verify, buy and ship them safely to your door.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm">
              <Link to="/privacy" className="text-white/70 hover:text-white">Privacy</Link>
              <Link to="/contact" className="text-white/70 hover:text-white">Contact</Link>
              <Link to="/terms" className="text-white/70 hover:text-white">Terms</Link>
            </div>

            <p className="mt-8 text-xs text-white/50">© {new Date().getFullYear()} RAC Logistics. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <LiveChat />
    </div>
  );
};

export default Procurement;