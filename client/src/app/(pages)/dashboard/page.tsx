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
import OtherRoleHomePage from "../../components/OtherRoleHomePage";
export default function DashboardPage() {
  const user = useAppSelector((state: RootState) => state.user.user);
  const router = useRouter();
  const firmId = user?.firmId;
  const role = user?.role;

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
  if (firmId) {
    toast.success("Welcome to dashboard");
  } else {
    router.push("/components/nofirmidfallback")
  }
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DashboardLayout>
        {user.role === "Firm Admin" && (
          <FirmStats firmId={firmId!} role={role!} />
        )}

        {user.role === "Lawyer" && (
          <LawyerStats firmId={firmId!} role={role!} />
        )}
        {user.role === "Client" && <ClientView firmId={firmId!} role={role!} />}
        {user.role !== "Firm Admin" &&
          user.role !== "Lawyer" &&
          user.role !== "Client" && (
            <OtherRoleHomePage role={role!} name={user.name} />
          )}
      </DashboardLayout>
    </ThemeProvider>
  );
}
