import { Warehouse } from "lucide-react";
import ServicePageTemplate from "@/components/services/ServicePageTemplate";

const WarehousingPage = () => {
  return (
    <ServicePageTemplate
      icon={Warehouse}
      title="Warehousing & Storage"
      subtitle="Secure Solutions"
      pricingSlug="warehouse"
      description="State-of-the-art warehousing facilities with advanced inventory management. From short-term storage to full fulfillment services, we've got you covered."
      features={[
        "Secure Storage",
        "Inventory Management",
        "Order Fulfillment",
        "Pick & Pack",
        "Cross-Docking",
        "Climate Control",
        "24/7 Security",
        "WMS Integration"
      ]}
      workflowSteps={[
        {
          step: 1,
          title: "Space Assessment",
          description: "We evaluate your storage needs, product types, and handling requirements to design the right solution."
        },
        {
          step: 2,
          title: "Receiving & Check-in",
          description: "Your goods are received, inspected, logged into our WMS, and stored in designated locations."
        },
        {
          step: 3,
          title: "Inventory Management",
          description: "Real-time inventory tracking, stock level alerts, and regular cycle counts ensure accuracy."
        },
        {
          step: 4,
          title: "Order Processing",
          description: "When orders come in, our team picks, packs, and prepares shipments accurately and quickly."
        },
        {
          step: 5,
          title: "Shipping & Reporting",
          description: "Orders are shipped via your preferred carrier with full tracking and detailed reporting."
        }
      ]}
      benefits={[
        {
          title: "Flexible Space",
          description: "Scale storage up or down based on your seasonal needs without long-term commitments."
        },
        {
          title: "Cost Efficiency",
          description: "Eliminate the overhead of owning and operating your own warehouse."
        },
        {
          title: "Advanced Technology",
          description: "Modern WMS integration for real-time visibility and seamless order management."
        },
        {
          title: "Strategic Locations",
          description: "Warehouses positioned for optimal distribution to your key markets."
        },
        {
          title: "Security",
          description: "24/7 surveillance, access control, and insurance coverage for your peace of mind."
        },
        {
          title: "Value-Added Services",
          description: "Kitting, labeling, repackaging, and quality inspections available."
        }
      ]}
    />
  );
};

export default WarehousingPage;
