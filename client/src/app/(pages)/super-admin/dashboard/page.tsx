import DashboardLayout from "@/app/components/DashboardLayout";
import PlatformStats from "@/app/components/PlatformStats";
import { ThemeProvider } from "next-themes";
export default function SuperAdminDashboard() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DashboardLayout>
        <PlatformStats />
      </DashboardLayout>
    </ThemeProvider>
  );
}
