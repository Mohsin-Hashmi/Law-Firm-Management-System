"use client";
import { useEffect } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import FirmStats from "@/app/components/FirmStats";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { RootState } from "@/app/store/store";
import { addUser } from "@/app/store/userSlice";
import axios from "axios";
import { ThemeProvider } from "next-themes";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
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
        <FirmStats firmId={user.firmId} role={user.role} />
      </DashboardLayout>
    </ThemeProvider>
  );
}
