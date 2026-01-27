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
    image: "/placeholder.svg",
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
    image: "/placeholder.svg",
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
    image: "/placeholder.svg",
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
    image: "/placeholder.svg",
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
    image: "/placeholder.svg",
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
    image: "/placeholder.svg",
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
    image: "/placeholder.svg",
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
    image: "/placeholder.svg",
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
          className="relative pt-32 pb-20 bg-gradient-to-br from-primary via-primary to-primary/90 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className={`text-center max-w-4xl mx-auto transition-all duration-700 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <span className="inline-block px-4 py-2 bg-secondary/20 text-secondary rounded-full text-sm font-medium mb-6">
                Blog & Resources
              </span>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
                Insights & <span className="text-secondary">Updates</span>
              </h1>
              <p className="text-xl text-primary-foreground/80 mb-8">
                Stay informed with the latest news, tips, and insights from the world of logistics.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Posts Slider */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-8">
              Featured Articles
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredPosts.map((post, index) => (
                <Card 
                  key={post.id} 
                  className="group overflow-hidden border-border/50 hover:border-secondary/50 hover:shadow-card transition-all duration-300"
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/60 group-hover:bg-primary/40 transition-colors" />
                    <Badge className="absolute top-4 left-4 bg-secondary text-secondary-foreground">
                      {post.category}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-heading text-xl font-bold text-foreground mb-3 group-hover:text-secondary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {post.date}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
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
        <section className="py-12 bg-background border-b border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-auto md:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              
              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedCategory === category
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-muted/50 text-muted-foreground hover:bg-secondary/20 hover:text-secondary'
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
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            {filteredPosts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post, index) => (
                  <Card 
                    key={post.id}
                    className="group overflow-hidden border-border/50 hover:border-secondary/50 hover:shadow-card hover:-translate-y-2 transition-all duration-300"
                  >
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
                      <Badge className="absolute top-4 left-4 bg-secondary/90 text-secondary-foreground">
                        {post.category}
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-heading text-lg font-bold text-foreground mb-3 group-hover:text-secondary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                      </div>
                      <Button variant="link" className="p-0 h-auto text-secondary group-hover:gap-3 transition-all">
                        Read More <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No articles found matching your criteria.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                >
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {filteredPosts.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button variant="outline" size="icon" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="default" size="icon" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  1
                </Button>
                <Button variant="outline" size="icon">
                  2
                </Button>
                <Button variant="outline" size="icon">
                  3
                </Button>
                <Button variant="outline" size="icon">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-20 bg-gradient-to-r from-primary to-primary/90">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Get the latest logistics insights, industry news, and exclusive tips delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-12 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
              />
              <Button variant="default" size="lg">
                Subscribe
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

export default Blog;
