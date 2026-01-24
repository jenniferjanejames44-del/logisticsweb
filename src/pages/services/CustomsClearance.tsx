import { FileCheck } from "lucide-react";
import ServicePageTemplate from "@/components/services/ServicePageTemplate";

const CustomsClearance = () => {
  return (
    <ServicePageTemplate
      icon={FileCheck}
      title="Customs Clearance"
      subtitle="Expert Brokerage"
      description="Expert customs brokerage services for seamless border crossings. Our licensed brokers ensure fast clearance with full regulatory compliance."
      features={[
        "Licensed Brokers",
        "Fast Clearance",
        "HS Classification",
        "Duty Calculation",
        "Regulatory Compliance",
        "Documentation Review",
        "Inspection Support",
        "Appeals & Disputes"
      ]}
      workflowSteps={[
        {
          step: 1,
          title: "Document Collection",
          description: "Gather all required shipping documents - commercial invoice, packing list, bill of lading, certificates."
        },
        {
          step: 2,
          title: "Classification & Valuation",
          description: "Determine correct HS codes and customs value for accurate duty calculation."
        },
        {
          step: 3,
          title: "Entry Filing",
          description: "Submit electronic customs entry with all supporting documents to the customs authority."
        },
        {
          step: 4,
          title: "Clearance Processing",
          description: "Monitor clearance status, respond to queries, arrange inspections if required, pay duties."
        },
        {
          step: 5,
          title: "Release & Delivery",
          description: "Obtain cargo release and coordinate delivery to final destination."
        }
      ]}
      benefits={[
        {
          title: "Expert Knowledge",
          description: "Licensed customs brokers with deep expertise in trade regulations and procedures."
        },
        {
          title: "Fast Processing",
          description: "Pre-clearance capabilities and priority processing for minimal delays."
        },
        {
          title: "Cost Savings",
          description: "Accurate classification and trade program utilization to minimize duties."
        },
        {
          title: "Compliance",
          description: "Ensure adherence to all import/export regulations and avoid penalties."
        },
        {
          title: "Problem Resolution",
          description: "Swift resolution of holds, inspections, and customs queries."
        },
        {
          title: "Global Coverage",
          description: "Customs clearance services at all major ports and border crossings."
        }
      ]}
    />
  );
};

export default CustomsClearance;
