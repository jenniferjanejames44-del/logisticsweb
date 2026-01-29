import { Linkedin, Twitter, Mail } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import founderImage from "@/assets/founder-rex.jpg";

const teamMembers = [
  {
    name: "Offor Rex C.K",
    role: "Founder & CEO",
    image: founderImage,
    bio: "Visionary leader with 20+ years in global logistics and supply chain management.",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Sarah Mitchell",
    role: "Chief Operations Officer",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    bio: "Operations expert driving efficiency and excellence across all departments.",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Michael Chen",
    role: "Chief Technology Officer",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    bio: "Tech innovator behind our AI-powered tracking and optimization systems.",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Emily Rodriguez",
    role: "VP of Customer Success",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
    bio: "Customer champion ensuring exceptional service at every touchpoint.",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "David Williams",
    role: "VP of Global Partnerships",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    bio: "Building strategic alliances with carriers and partners worldwide.",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Lisa Anderson",
    role: "Head of Finance",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    bio: "Financial strategist ensuring sustainable growth and profitability.",
    linkedin: "#",
    twitter: "#",
  },
];

const LeadershipSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <span
            className={`inline-block text-secondary font-semibold mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            OUR TEAM
          </span>
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4 md:mb-6 transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Leadership <span className="text-secondary">Team</span>
          </h2>
          <p
            className={`text-base md:text-lg text-muted-foreground transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Meet the experienced professionals driving RAC Logistics forward 
            with passion, expertise, and innovation.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={member.name}
              className={`group bg-card rounded-xl sm:rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2 sm:hover:-translate-y-3 ${
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative overflow-hidden aspect-square">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Social Links - Always visible at bottom */}
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <a
                    href={member.linkedin}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-[hsl(222,47%,11%)]/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Linkedin size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
                  </a>
                  <a
                    href={member.twitter}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-[hsl(222,47%,11%)]/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Twitter size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
                  </a>
                  <a
                    href={`mailto:${member.name.toLowerCase().replace(" ", ".")}@raclogistics.com`}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-[hsl(222,47%,11%)]/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Mail size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
                  </a>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5 md:p-6">
                <h3 className="text-lg sm:text-xl font-heading font-bold text-foreground mb-1">
                  {member.name}
                </h3>
                <p className="text-secondary font-medium text-sm sm:text-base mb-2 sm:mb-3">{member.role}</p>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LeadershipSection;
