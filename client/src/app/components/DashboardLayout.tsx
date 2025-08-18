"use client";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/images/northman-logo.webp";
import { logoutUser } from "../service/authAPI";
import { removeUser } from "../store/userSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  HomeOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  TeamOutlined,
  UserOutlined,
  PlusOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

export default function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const role = useAppSelector((state) => state.user.user?.role);

  const handleLogout = async () => {
    const response = await logoutUser();
    dispatch(removeUser(response.data));
    router.push("/auth/login");
    toast.success("Logged out successfully");
  };

  const navLinksMap: Record<
    string,
    { label: string; href: string; icon: React.ReactNode }[]
  > = {
    "Super Admin": [
      { label: "Home", href: "/", icon: <HomeOutlined /> },
      { label: "About", href: "/pages/about-us", icon: <InfoCircleOutlined /> },
      { label: "Services", href: "/pages/our-services", icon: <AppstoreOutlined /> },
      { label: "Firms", href: "/pages/super-admin/get-firms", icon: <TeamOutlined /> },
      { label: "Add Firm", href: "/pages/super-admin/add-firm", icon: <PlusOutlined /> },
    ],
    "Firm Admin": [
      { label: "Dashboard", href: "/pages/dashboard", icon: <HomeOutlined /> },
      { label: "About", href: "/pages/about-us", icon: <InfoCircleOutlined /> },
      { label: "Services", href: "/pages/our-services", icon: <AppstoreOutlined /> },
      { label: "Lawyers", href: "/", icon: <UserOutlined /> },
      { label: "Add Clients", href: "/", icon: <TeamOutlined /> },
      { label: "Add Lawyer", href: "/pages/firm-admin/add-lawyer", icon: <PlusOutlined /> },
    ],
    Lawyer: [
      { label: "Home", href: "/", icon: <HomeOutlined /> },
      { label: "About", href: "/pages/about-us", icon: <InfoCircleOutlined /> },
      { label: "Services", href: "/pages/our-services", icon: <AppstoreOutlined /> },
      { label: "My Clients", href: "/", icon: <TeamOutlined /> },
      { label: "Add Client", href: "/", icon: <PlusOutlined /> },
    ],
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#1E2E45] text-white flex flex-col py-6 px-4 shadow-lg">
        {/* Logo */}
        <div className="flex items-center justify-left  mb-10">
          <Image src={logo} alt="logo" className="w-[140px]" />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 text-[16px]">
          {navLinksMap[role || "Lawyer"]?.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#2e4466] transition-all duration-300"
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-2 py-2 mt-4 rounded-lg hover:bg-red-600 transition-all duration-300"
          >
            <LogoutOutlined />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between p-6">
          <h2 className="text-xl font-semibold text-gray-700">Dashboard</h2>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-sm">Role: {role}</span>
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <UserOutlined />
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="flex-1 p-6">{children}</section>
      </main>
    </div>
  );
}
