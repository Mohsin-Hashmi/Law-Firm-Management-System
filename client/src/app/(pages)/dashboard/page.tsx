"use client";
import { useEffect } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import FirmStats from "@/app/components/FirmStats";
import ClientView from "@/app/components/ClientView";
import LawyerStats from "@/app/components/LawyerStats";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { RootState } from "@/app/store/store";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { Spin } from "antd";
import { toast } from "react-hot-toast";
export default function DashboardPage() {
  const user = useAppSelector((state: RootState) => state.user.user);
  const router = useRouter();

  // redirect to login if no user
  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }
  if (!user.firmId) {
    return <>{toast.error("User Firm ID not Exist")}</>;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DashboardLayout>
        {user.role === "Firm Admin" && (
          <FirmStats firmId={user.firmId} role={user.role} />
        )}

        {user.role === "Lawyer" && (
          <LawyerStats firmId={user.firmId} role={user.role} />
        )}
        {user.role === "Client" && (
          <ClientView firmId={user.firmId} role={user.role} />
        )}
      </DashboardLayout>
    </ThemeProvider>
  );
}
