"use client";
import DashboardLayout from "@/app/components/DashboardLayout";
import PlatformStats from "@/app/components/PlatformStats";
import { ThemeProvider } from "next-themes";
import { useAppSelector } from "@/app/store/hooks";
import { RootState } from "@/app/store/store";
import { useRouter } from "next/router";
import { useEffect } from "react";
export default function SuperAdminDashboard() {
  const user = useAppSelector((state: RootState) => state.user.user);
  const router = useRouter();
  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, router]);
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DashboardLayout>
        <PlatformStats />
      </DashboardLayout>
    </ThemeProvider>
  );
}
