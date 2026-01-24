import { Globe } from "lucide-react";
import ServicePageTemplate from "@/components/services/ServicePageTemplate";

const ImportExport = () => {
  return (
    <ServicePageTemplate
      icon={Globe}
      title="Import/Export Services"
      subtitle="Trade Solutions"
      description="Complete import and export solutions with expert customs clearance, documentation, and regulatory compliance. We make international trade simple and efficient."
      features={[
        "Customs Clearance",
        "Trade Documentation",
        "Regulatory Compliance",
        "Trade Consulting",
        "Duty Optimization",
        "License Management",
        "Origin Certification",
        "ATA Carnet"
      ]}
      workflowSteps={[
        {
          step: 1,
          title: "Trade Consultation",
          description: "Our experts review your import/export needs, advise on regulations, and plan the optimal approach."
        },
        {
          step: 2,
          title: "Documentation Preparation",
          description: "We prepare all required documents - commercial invoices, certificates, licenses, and customs declarations."
        },
        {
          step: 3,
          title: "Customs Filing",
          description: "Electronic submission of customs entries with real-time status monitoring and issue resolution."
        },
        {
          step: 4,
          title: "Clearance & Inspection",
          description: "Manage customs inspections, pay duties/taxes, and secure release of your goods."
        },
        {
          step: 5,
          title: "Delivery Coordination",
          description: "Coordinate final delivery to your specified location with all documentation completed."
        }
      ]}
      benefits={[
        {
          title: "Compliance Expertise",
          description: "Stay compliant with complex and ever-changing international trade regulations."
        },
        {
          title: "Duty Optimization",
          description: "Minimize duties and taxes through proper classification and trade agreement utilization."
        },
        {
          title: "Fast Clearance",
          description: "Established relationships with customs authorities for expedited processing."
        },
        {
          title: "Risk Avoidance",
          description: "Avoid costly delays, penalties, and seizures with accurate documentation."
        },
        {
          title: "Single Point of Contact",
          description: "One team manages all aspects of your import/export operations."
        },
        {
          title: "Trade Consulting",
          description: "Strategic advice on market entry, trade agreements, and supply chain optimization."
        }
      ]}
    />
  );
};

export default ImportExport;
