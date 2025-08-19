"use client";
import { useEffect } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import FirmStats from "@/app/components/FirmStats";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { RootState } from "@/app/store/store";
import { addUser } from "@/app/store/userSlice";
import axios from "axios";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.user.user);

  // fetch user on page load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/me", { withCredentials: true });
        dispatch(addUser(res.data)); // make sure res.data contains firmId
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    if (!user) fetchUser();
  }, [dispatch, user]);

  if (!user) return <p>Loading user...</p>;
  if (!user.firmId) return <p>No firm assigned to this user.</p>;

  return (
    <DashboardLayout>
      <FirmStats firmId={user.firmId.toString()} />
    </DashboardLayout>
  );
}
