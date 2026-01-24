import { Package } from "lucide-react";
import ServicePageTemplate from "@/components/services/ServicePageTemplate";

const Procurement = () => {
  return (
    <ServicePageTemplate
      icon={Package}
      title="Procurement Services"
      subtitle="Business Solutions"
      description="End-to-end procurement services for businesses. From supplier sourcing to delivery, we handle the entire supply chain so you can focus on your core business."
      features={[
        "Supplier Sourcing",
        "Price Negotiation",
        "Quality Control",
        "Bulk Ordering",
        "Factory Audits",
        "Sample Management",
        "Contract Management",
        "Logistics Coordination"
      ]}
      workflowSteps={[
        {
          step: 1,
          title: "Requirements Analysis",
          description: "Share your product specifications, quantity needs, quality standards, and budget expectations."
        },
        {
          step: 2,
          title: "Supplier Identification",
          description: "Our team identifies and vets potential suppliers, conducting factory audits and capability assessments."
        },
        {
          step: 3,
          title: "Negotiation & Sampling",
          description: "We negotiate the best prices and terms, then arrange samples for your approval."
        },
        {
          step: 4,
          title: "Order Placement",
          description: "Once approved, we place orders, manage production schedules, and conduct quality inspections."
        },
        {
          step: 5,
          title: "Shipping & Delivery",
          description: "Complete logistics management from factory to your warehouse, including customs clearance."
        }
      ]}
      benefits={[
        {
          title: "Cost Reduction",
          description: "Leverage our buying power and negotiation expertise to get the best prices."
        },
        {
          title: "Quality Assurance",
          description: "Rigorous quality control at every stage, from factory audit to final inspection."
        },
        {
          title: "Risk Mitigation",
          description: "Reduce supply chain risks with verified suppliers and comprehensive contracts."
        },
        {
          title: "Time Savings",
          description: "Focus on your core business while we handle the complex procurement process."
        },
        {
          title: "Global Sourcing",
          description: "Access suppliers worldwide with our established network and local expertise."
        },
        {
          title: "Transparency",
          description: "Full visibility into pricing, supplier performance, and order status at all times."
        }
      ]}
    />
  );
};

export default Procurement;
