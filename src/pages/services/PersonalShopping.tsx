import { ShoppingBag } from "lucide-react";
import ServicePageTemplate from "@/components/services/ServicePageTemplate";

const PersonalShopping = () => {
  return (
    <ServicePageTemplate
      icon={ShoppingBag}
      title="Personal Shopping"
      subtitle="Shop Anywhere"
      description="Want to buy from stores that don't ship to your country? Our personal shopping service lets you shop from any store worldwide and have it delivered to your doorstep."
      features={[
        "Buy From Any Store",
        "Price Comparison",
        "Quality Inspection",
        "Package Consolidation",
        "Photo Verification",
        "Secure Payment",
        "Insurance Coverage",
        "Express Shipping"
      ]}
      workflowSteps={[
        {
          step: 1,
          title: "Submit Your Request",
          description: "Tell us what you want to buy - share links, descriptions, or images of the items you need."
        },
        {
          step: 2,
          title: "Quote & Confirmation",
          description: "We provide a detailed quote including product cost, service fee, and shipping. Confirm to proceed."
        },
        {
          step: 3,
          title: "Purchase & Inspection",
          description: "Our shoppers purchase your items, inspect quality, and send you photos for verification."
        },
        {
          step: 4,
          title: "Consolidation",
          description: "Multiple items are consolidated into one shipment to save on shipping costs."
        },
        {
          step: 5,
          title: "Shipping & Delivery",
          description: "Your package is shipped via your preferred method with tracking until it reaches you."
        }
      ]}
      benefits={[
        {
          title: "Access Any Store",
          description: "Shop from US, UK, Europe, Asia, and more - even stores that don't ship internationally."
        },
        {
          title: "Save Money",
          description: "Consolidate multiple purchases into one shipment to reduce shipping costs significantly."
        },
        {
          title: "Quality Assurance",
          description: "Every item is inspected and photographed before shipping to ensure quality."
        },
        {
          title: "No Hidden Fees",
          description: "Transparent pricing with all costs clearly communicated upfront."
        },
        {
          title: "Personal Shopper",
          description: "Dedicated shopper to handle your requests, find deals, and ensure satisfaction."
        },
        {
          title: "Secure Transactions",
          description: "All purchases are insured and payments are processed through secure channels."
        }
      ]}
    />
  );
};

export default PersonalShopping;
