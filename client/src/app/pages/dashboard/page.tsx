import DashboardLayout from "@/app/components/DashboardLayout";
import FirmStats from "@/app/components/FirmStats";
export default function DashboardPage() {
   const firmId = "4"; // Replace with actual firmId from your user/session

  return (
    <DashboardLayout>
      <FirmStats firmId={firmId} />
    </DashboardLayout>
  );
}
