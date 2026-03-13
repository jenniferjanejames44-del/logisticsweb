import { useState } from "react";
import { Play, X } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveChat from "@/components/LiveChat";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";
import heroLogisticsVideo from "@/assets/hero-logistics-video.mp4";

interface GalleryVideo {
  id: string;
  title: string;
  description: string;
  src: string;
  category: string;
}

const galleryVideos: GalleryVideo[] = [
  {
    id: "1",
    title: "Warehouse Operations",
    description: "Inside look at our state-of-the-art warehouse facility and inventory management systems.",
    src: heroLogisticsVideo,
    category: "Warehouse",
  },
  {
    id: "2",
    title: "Shipment Packaging",
    description: "See how we carefully package and secure every shipment for safe transit across the globe.",
    src: heroLogisticsVideo,
    category: "Packaging",
  },
  {
    id: "3",
    title: "Cargo Handling",
    description: "Professional cargo handling procedures ensuring the safety of your goods at every step.",
    src: heroLogisticsVideo,
    category: "Cargo",
  },
  {
    id: "4",
    title: "Delivery Process",
    description: "From our facility to your doorstep — watch our reliable last-mile delivery in action.",
    src: heroLogisticsVideo,
    category: "Delivery",
  },
  {
    id: "5",
    title: "Logistics Team Activities",
    description: "Meet the dedicated team behind RAC Logistics and see how they coordinate operations daily.",
    src: heroLogisticsVideo,
    category: "Team",
  },
  {
    id: "6",
    title: "International Shipping",
    description: "Our international shipping operations spanning air and ocean freight across continents.",
    src: heroLogisticsVideo,
    category: "Shipping",
  },
];

const GalleryHeroSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="page-hero">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white to-transparent" />
      </div>
      <div className="page-hero-overlay" />
      <div className="section-container relative z-10">
        <div
          className={`page-hero-shell transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <span className="page-hero-badge mb-6">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Media Gallery
          </span>
          <h1 className="text-white mb-5 sm:mb-6 leading-tight">Gallery</h1>
          <p className="text-base sm:text-lg md:text-xl text-white/80 font-medium leading-relaxed max-w-xl mx-auto">
            Explore our logistics operations, shipments, packaging process, warehouse handling, and delivery activities through real footage from our operations.
          </p>
        </div>
      </div>
    </section>
  );
};

const VideoCard = ({ video, onPlay }: { video: GalleryVideo; onPlay: (video: GalleryVideo) => void }) => {
  const { ref, isInView } = useInView({ threshold: 0.15 });

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      className={cn(
        "group overflow-hidden rounded-[24px] border border-border/80 bg-card text-card-foreground shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/12 hover:shadow-[0_16px_34px_rgba(6,16,67,0.08)]",
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
    >
      {/* Video thumbnail */}
      <div className="relative aspect-video bg-muted cursor-pointer" onClick={() => onPlay(video)}>
        <video
          src={video.src}
          muted
          preload="metadata"
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center transition-all duration-200 group-hover:bg-foreground/40">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/90 flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-transform duration-200 group-hover:scale-110">
            <Play className="w-6 h-6 sm:w-7 sm:h-7 text-primary ml-1" fill="currentColor" />
          </div>
        </div>
        {/* Category badge */}
        <span className="absolute top-3 left-3 px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-bold rounded-full backdrop-blur-sm">
          {video.category}
        </span>
      </div>
      {/* Card body */}
      <div className="p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1.5 leading-tight">{video.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{video.description}</p>
      </div>
    </div>
  );
};

const VideoModal = ({ video, onClose }: { video: GalleryVideo; onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
    {/* Backdrop */}
    <div className="absolute inset-0 bg-foreground/70 backdrop-blur-sm" onClick={onClose} />
    {/* Modal content */}
    <div className="relative w-full max-w-4xl overflow-hidden rounded-[28px] bg-card shadow-[0_24px_60px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-200">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-[0_8px_18px_rgba(0,0,0,0.12)] transition-all duration-200 hover:bg-white hover:scale-105"
        aria-label="Close video"
      >
        <X className="w-5 h-5 text-foreground" />
      </button>
      <video
        src={video.src}
        controls
        autoPlay
        className="w-full aspect-video bg-black"
      />
      <div className="p-5 sm:p-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">{video.title}</h3>
        <p className="text-sm text-muted-foreground">{video.description}</p>
      </div>
    </div>
  </div>
);

const Gallery = () => {
  const [activeVideo, setActiveVideo] = useState<GalleryVideo | null>(null);
  const gridRef = useInView({ threshold: 0.05 });

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <GalleryHeroSection />

        {/* Video Grid Section */}
        <section className="section-padding bg-background">
          <div className="section-container">
            <div
              className={cn(
                "text-center mb-12 md:mb-16 transition-all duration-700",
                gridRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
            >
              <h2 className="text-foreground mb-4">Our Operations in Action</h2>
              <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                Watch how RAC Logistics handles every stage of the shipping process with precision, care, and professionalism.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {galleryVideos.map((video) => (
                <VideoCard key={video.id} video={video} onPlay={setActiveVideo} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <LiveChat />

      {/* Video Modal */}
      {activeVideo && <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />}
    </div>
  );
};

export default Gallery;
