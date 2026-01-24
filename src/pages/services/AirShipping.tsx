import { Plane } from "lucide-react";
import ServicePageTemplate from "@/components/services/ServicePageTemplate";

const AirShipping = () => {
  return (
    <ServicePageTemplate
      icon={Plane}
      title="Air Shipping"
      subtitle="Fast & Reliable"
      description="Experience the fastest way to ship your cargo globally. Our air freight solutions offer express delivery, real-time tracking, and temperature-controlled options for sensitive shipments."
      features={[
        "Express Delivery",
        "Global Coverage",
        "Real-time Tracking",
        "Temperature Control",
        "Dangerous Goods",
        "Priority Handling",
        "Door-to-Door",
        "24/7 Support"
      ]}
      workflowSteps={[
        {
          step: 1,
          title: "Request a Quote",
          description: "Fill out our online form with your shipment details including origin, destination, weight, and dimensions."
        },
        {
          step: 2,
          title: "Book Your Shipment",
          description: "Choose your preferred service level and confirm your booking. We'll handle all the documentation."
        },
        {
          step: 3,
          title: "Pickup & Processing",
          description: "Our team picks up your cargo, processes customs documentation, and prepares it for flight."
        },
        {
          step: 4,
          title: "In-Transit Tracking",
          description: "Track your shipment in real-time with our advanced tracking system. Receive updates at every milestone."
        },
        {
          step: 5,
          title: "Delivery",
          description: "Your cargo is delivered to the final destination with proof of delivery confirmation."
        }
      ]}
      benefits={[
        {
          title: "Speed & Efficiency",
          description: "The fastest shipping method available, perfect for time-sensitive deliveries and urgent shipments."
        },
        {
          title: "Global Network",
          description: "Access to 500+ airports worldwide with strategic partnerships for seamless connectivity."
        },
        {
          title: "Security",
          description: "Advanced security measures and handling protocols to protect your valuable cargo throughout transit."
        },
        {
          title: "Flexibility",
          description: "Multiple service levels from economy to express, tailored to your timeline and budget."
        },
        {
          title: "Temperature Control",
          description: "Specialized containers and handling for pharmaceuticals, food, and temperature-sensitive goods."
        },
        {
          title: "Real-Time Visibility",
          description: "Complete transparency with 24/7 tracking and proactive notifications at every stage."
        }
      ]}
    />
  );
};

export default AirShipping;
