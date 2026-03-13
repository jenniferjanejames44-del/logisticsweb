import { useInView } from "@/hooks/useInView";
import founderImage from "@/assets/founder-rex.jpg";
import rosecolletImage from "@/assets/rosecollet.jpg";

const teamMembers = [
  { name: "Offor Rex C.K", role: "Founder & CEO", image: founderImage, bio: "Visionary leader with 20+ years in global logistics and supply chain management.", linkedin: "#", twitter: "#" },
  { name: "Rex-Offor Rosecollet C.", role: "Head Customer Relations", image: rosecolletImage, bio: "Dedicated to building lasting client relationships and ensuring exceptional service delivery.", linkedin: "#", twitter: "#" },
  { name: "Michael Chen", role: "Chief Technology Officer", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop", bio: "Tech innovator behind our AI-powered tracking and optimization systems.", linkedin: "#", twitter: "#" },
  { name: "Emily Rodriguez", role: "VP of Customer Success", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop", bio: "Customer champion ensuring exceptional service at every touchpoint.", linkedin: "#", twitter: "#" },
  { name: "David Williams", role: "VP of Global Partnerships", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", bio: "Building strategic alliances with carriers and partners worldwide.", linkedin: "#", twitter: "#" },
  { name: "Lisa Anderson", role: "Head of Finance", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop", bio: "Financial strategist ensuring sustainable growth and profitability.", linkedin: "#", twitter: "#" },
];

const LeadershipSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="section-padding bg-muted">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 bg-accent text-accent-foreground transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            OUR TEAM
          </span>
          <h2
            className={`text-foreground mb-4 md:mb-6 transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Leadership <span className="text-primary">Team</span>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={member.name}
              className={`group bg-card rounded-xl sm:rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2 sm:hover:-translate-y-3 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden aspect-square">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              </div>
              <div className="p-4 sm:p-5 md:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">{member.name}</h3>
                <p className="text-primary font-medium text-sm sm:text-base">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LeadershipSection;
