import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Shipping from "@/pages/Shipping";

const CreateShipment = () => {
  return (
    <DashboardLayout
      title="Create Shipment"
      description="Fill in your details step by step — we'll calculate the cost automatically."
    >
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-5 sm:-mt-6">
        <Shipping embedded />
      </div>
    </DashboardLayout>
  );
};

export default CreateShipment;
