import { Ship } from "lucide-react";
import ServicePageTemplate from "@/components/services/ServicePageTemplate";

const OceanShipping = () => {
  return (
    <ServicePageTemplate
      icon={Ship}
      title="Ocean Shipping"
      subtitle="Cost-Effective"
      description="Our ocean freight solutions provide the most economical way to ship large volumes globally. Choose from FCL and LCL options with access to major ports worldwide."
      features={[
        "FCL Shipping",
        "LCL Shipping",
        "Worldwide Ports",
        "Bulk Cargo",
        "Container Tracking",
        "Reefer Containers",
        "Project Cargo",
        "Customs Clearance"
      ]}
      workflowSteps={[
        {
          step: 1,
          title: "Cargo Assessment",
          description: "We evaluate your cargo requirements, volume, and destination to recommend the best shipping option."
        },
        {
          step: 2,
          title: "Container Booking",
          description: "Reserve container space on optimal routes. Choose FCL for full containers or LCL for smaller shipments."
        },
        {
          step: 3,
          title: "Cargo Loading",
          description: "Your goods are professionally loaded, secured, and documented for international shipping."
        },
        {
          step: 4,
          title: "Ocean Transit",
          description: "Monitor your shipment across the seas with our vessel tracking system and milestone updates."
        },
        {
          step: 5,
          title: "Port Handling & Delivery",
          description: "We manage port operations, customs clearance, and final delivery to your specified location."
        }
      ]}
      benefits={[
        {
          title: "Cost Savings",
          description: "The most economical option for large shipments, reducing your logistics costs significantly."
        },
        {
          title: "High Capacity",
          description: "Ship large volumes and oversized cargo that other methods can't accommodate."
        },
        {
          title: "Eco-Friendly",
          description: "Lower carbon footprint per unit compared to air freight, supporting sustainability goals."
        },
        {
          title: "Global Reach",
          description: "Access to 300+ ports worldwide with reliable scheduling and transit times."
        },
        {
          title: "Flexible Options",
          description: "FCL for dedicated containers or LCL to share space and optimize costs for smaller shipments."
        },
        {
          title: "Specialized Handling",
          description: "Reefer containers for perishables, flat racks for heavy machinery, and more."
        }
      ]}
    />
  );
};

export default OceanShipping;
