import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveChat from "@/components/LiveChat";
import { useInView } from "@/hooks/useInView";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, User, ArrowRight, Search, ChevronLeft, ChevronRight } from "lucide-react";

const categories = [
  "All",
  "Industry News",
  "Shipping Tips",
  "Company Updates",
  "Trade Insights",
  "Technology"
];

const blogPosts = [
  {
    id: 1,
    title: "The Future of Global Logistics: AI and Automation",
    excerpt: "Discover how artificial intelligence and automation are revolutionizing the logistics industry, from smart warehouses to predictive analytics.",
    category: "Technology",
    author: "Sarah Johnson",
    date: "Jan 15, 2025",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=500&fit=crop",
    featured: true
  },
  {
    id: 2,
    title: "Understanding International Shipping Regulations in 2025",
    excerpt: "Navigate the complex world of international trade regulations with our comprehensive guide to customs compliance.",
    category: "Trade Insights",
    author: "Michael Chen",
    date: "Jan 12, 2025",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=500&fit=crop",
    featured: true
  },
  {
    id: 3,
    title: "5 Tips for Reducing Your Shipping Costs",
    excerpt: "Learn practical strategies to optimize your shipping expenses without compromising on delivery speed or quality.",
    category: "Shipping Tips",
    author: "Emily Davis",
    date: "Jan 10, 2025",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=500&fit=crop",
    featured: false
  },
  {
    id: 4,
    title: "RAC Logistics Expands Operations to 15 New Countries",
    excerpt: "We're excited to announce our expansion into 15 new markets, bringing our world-class logistics services to more customers worldwide.",
    category: "Company Updates",
    author: "RAC Team",
    date: "Jan 8, 2025",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=500&fit=crop",
    featured: false
  },
  {
    id: 5,
    title: "E-commerce Logistics: Meeting Customer Expectations",
    excerpt: "How logistics providers are adapting to the demands of e-commerce, from same-day delivery to sustainable packaging.",
    category: "Industry News",
    author: "James Wilson",
    date: "Jan 5, 2025",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800&h=500&fit=crop",
    featured: false
  },
  {
    id: 6,
    title: "Sustainable Shipping: Our Commitment to Green Logistics",
    excerpt: "Explore our initiatives to reduce carbon footprint and promote sustainable practices across our operations.",
    category: "Company Updates",
    author: "Lisa Green",
    date: "Jan 3, 2025",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1473445361085-b9a07f55608b?w=800&h=500&fit=crop",
    featured: false
  },
  {
    id: 7,
    title: "How to Package Fragile Items for International Shipping",
    excerpt: "A step-by-step guide to properly packaging delicate items to ensure they arrive safely at their destination.",
    category: "Shipping Tips",
    author: "David Brown",
    date: "Dec 28, 2024",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop",
    featured: false
  },
  {
    id: 8,
    title: "The Impact of Port Congestion on Global Supply Chains",
    excerpt: "Analyzing the causes and effects of port congestion and strategies to mitigate delays in your supply chain.",
    category: "Industry News",
    author: "Robert Kim",
    date: "Dec 25, 2024",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800&h=500&fit=crop",
    featured: false
  }
];

const Blog = () => {
  const { ref: heroRef, isInView: heroInView } = useInView({ threshold: 0.2 });
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const featuredPosts = blogPosts.filter(post => post.featured);
  
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&q=80)',
            }}
          />
          {/* Dark Overlay - Using primary green */}
          <div className="absolute inset-0 bg-primary opacity-90" />
          
          <div className="section-container relative z-10">
            <div className={`text-center max-w-4xl mx-auto transition-all duration-700 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <span className="inline-block px-4 py-2 bg-[hsl(45,100%,51%)] text-[hsl(0,0%,13%)] rounded-full text-sm font-bold mb-6">
                Blog & Resources
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Insights & Updates
              </h1>
              <p className="text-base md:text-lg text-white/80 leading-relaxed max-w-xl mx-auto">
                Stay informed with the latest news, tips, and insights from the world of logistics.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Posts Slider */}
        <section className="section-padding bg-muted/30">
          <div className="section-container">
            <h2 className="text-foreground mb-10">
              Featured Articles
            </h2>
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {featuredPosts.map((post, index) => (
                <Card 
                  key={post.id} 
                  className="group relative overflow-hidden border border-border/50 rounded-2xl hover:border-primary/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                >
                  {/* Top accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left z-10" />
                  
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                    <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground font-bold">
                      {post.category}
                    </Badge>
                  </div>
                  <CardContent className="p-6 md:p-8">
                    <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mb-5 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 font-medium">
                          <User className="w-4 h-4 text-primary" />
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-4 h-4 text-primary" />
                          {post.date}
                        </span>
                      </div>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-4 h-4 text-primary" />
                        {post.readTime}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="py-10 md:py-12 bg-background border-b border-border/50">
          <div className="section-container">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-auto md:min-w-[320px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-2 border-border focus:border-primary"
                />
              </div>
              
              {/* Categories */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 ${
                      selectedCategory === category
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="section-padding bg-background">
          <div className="section-container">
            {filteredPosts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {filteredPosts.map((post, index) => (
                  <Card 
                    key={post.id}
                    className="group relative overflow-hidden border border-border/50 rounded-2xl hover:border-primary/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    {/* Top accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left z-10" />
                    
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                      <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground font-bold">
                        {post.category}
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          {post.readTime}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-2 font-bold text-sm text-primary group-hover:gap-3 transition-all duration-300 cursor-pointer">
                        Read More <ArrowRight className="w-4 h-4" />
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg font-medium">No articles found matching your criteria.</p>
                <button 
                  className="mt-6 inline-flex items-center justify-center gap-2 h-12 px-6 font-semibold text-[15px] rounded-[10px] transition-all duration-200 border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md active:scale-[0.98]"
                  onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {filteredPosts.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-14">
                <button className="w-11 h-11 rounded-xl border-2 border-border flex items-center justify-center text-muted-foreground opacity-50 cursor-not-allowed" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-11 h-11 rounded-xl bg-primary text-primary-foreground font-bold shadow-md">
                  1
                </button>
                <button className="w-11 h-11 rounded-xl border-2 border-border text-foreground font-bold hover:border-primary/50 hover:bg-primary/10 transition-all">
                  2
                </button>
                <button className="w-11 h-11 rounded-xl border-2 border-border text-foreground font-bold hover:border-primary/50 hover:bg-primary/10 transition-all">
                  3
                </button>
                <button className="w-11 h-11 rounded-xl border-2 border-border flex items-center justify-center text-foreground hover:border-primary/50 hover:bg-primary/10 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="section-padding bg-primary relative overflow-hidden">
          <div className="section-container text-center relative z-10">
            <h2 className="text-white mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-base text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
              Get the latest logistics insights, industry news, and exclusive tips delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white rounded-xl"
              />
              <button className="inline-flex items-center justify-center gap-2 h-12 px-8 font-semibold text-[15px] rounded-[10px] transition-all duration-200 bg-[hsl(45,100%,51%)] text-[hsl(0,0%,13%)] shadow-md hover:bg-[hsl(45,100%,45%)] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]">
                Subscribe
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

export default Blog;
