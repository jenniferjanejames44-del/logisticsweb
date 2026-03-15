import { PackageCheck } from "lucide-react";
import ServicePageTemplate from "@/components/services/ServicePageTemplate";

const GlobalPickup = () => {
  return (
    <ServicePageTemplate
      icon={PackageCheck}
      title="Global Pickup Services"
      subtitle="Worldwide Collection"
      pricingSlug="pickup"
      description="RAC Logistics arranges package pickup from suppliers, warehouses, and businesses globally — transporting your items safely and efficiently to your destination."
      features={[
        "Worldwide Pickup Coordination",
        "Secure Handling",
        "Door-to-Door Transit",
        "Real-time Tracking",
        "Fast International Delivery",
        "Customs Compliance",
        "Inventory Management",
        "24/7 Support"
      ]}
      workflowSteps={[
        {
          step: 1,
          title: "Request a Pickup",
          description: "Submit your pickup request with supplier or location details. Provide item descriptions, quantities, and preferred pickup dates."
        },
        {
          step: 2,
          title: "Pickup Scheduling",
          description: "Our team coordinates directly with your supplier or warehouse to schedule a convenient pickup time."
        },
        {
          step: 3,
          title: "Collection & Transport",
          description: "Items are collected securely and transported to our nearest logistics facility for processing and quality checks."
        },
        {
          step: 4,
          title: "Onward Shipping",
          description: "Your shipment continues through our global shipping network to your final destination with full tracking visibility."
        }
      ]}
      benefits={[
        {
          title: "Worldwide Pickup Coordination",
          description: "We coordinate pickups from suppliers, factories, and warehouses across the globe — no matter the location."
        },
        {
          title: "Secure Package Handling",
          description: "Every item is carefully handled, inspected, and packaged to ensure it arrives at your destination in perfect condition."
        },
        {
          title: "Reliable Logistics Management",
          description: "Our experienced logistics team manages every step from collection to final delivery with precision and accountability."
        },
        {
          title: "Fast International Shipping",
          description: "Once collected, your items move quickly through our optimized shipping network for the fastest possible delivery."
        },
        {
          title: "Real-time Visibility",
          description: "Track your pickup and shipment status at every stage with our advanced real-time tracking system."
        },
        {
          title: "Cost-Effective Solutions",
          description: "Consolidate multiple pickups into a single shipment to reduce costs and simplify your supply chain."
        }
      ]}
    />
  );
};

export default GlobalPickup;
