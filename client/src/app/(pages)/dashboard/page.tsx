"use client";
import { useEffect } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import FirmStats from "@/app/components/FirmStats";
import LawyerStats from "@/app/components/LawyerStats";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { RootState } from "@/app/store/store";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";

export default function DashboardPage() {
  const user = useAppSelector((state: RootState) => state.user.user);
  const router = useRouter();

  // redirect to login if no user
  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, router]);

  if (!user) return <p>Redirecting to login...</p>;
  if (!user.firmId) return <p>No firm assigned to this user.</p>;

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DashboardLayout>
        {user.role === "Firm Admin" && (
          <FirmStats firmId={user.firmId} role={user.role} />
        )}

        {user.role === "Lawyer" && (
          <LawyerStats firmId={user.firmId} role={user.role} />
        )}

        {user.role !== "Firm Admin" && user.role !== "Lawyer" && (
          <p>Access Denied</p>
        )}
      </DashboardLayout>
    </ThemeProvider>
  );
}
