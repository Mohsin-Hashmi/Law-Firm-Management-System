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
  BellOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useState } from "react";

export default function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const role = useAppSelector((state) => state.user.user?.role);
  const user = useAppSelector((state) => state.user.user);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    const response = await logoutUser();
    dispatch(removeUser(response.data));
    router.push("/auth/login");
    toast.success("Logged out successfully");
  };

  const navLinksMap: Record<
    string,
    { label: string; href: string; icon: React.ReactNode; category?: string }[]
  > = {
    "Super Admin": [
      { label: "Home", href: "/", icon: <HomeOutlined />, category: "Main" },
      { label: "About", href: "/pages/about-us", icon: <InfoCircleOutlined />, category: "Main" },
      { label: "Services", href: "/pages/our-services", icon: <AppstoreOutlined />, category: "Main" },
      { label: "Firms", href: "/pages/super-admin/get-firms", icon: <TeamOutlined />, category: "Management" },
      { label: "Add Firm", href: "/pages/super-admin/add-firm", icon: <PlusOutlined />, category: "Management" },
    ],
    "Firm Admin": [
      { label: "Dashboard", href: "/pages/dashboard", icon: <HomeOutlined />, category: "Main" },
      { label: "About", href: "/pages/about-us", icon: <InfoCircleOutlined />, category: "Main" },
      { label: "Services", href: "/pages/our-services", icon: <AppstoreOutlined />, category: "Main" },
      { label: "Lawyers", href: "/pages/firm-admin/get-lawyers", icon: <UserOutlined />, category: "Team Management" },
      { label: "Add Clients", href: "/", icon: <TeamOutlined />, category: "Client Management" },
      { label: "Add Lawyer", href: "/pages/firm-admin/add-lawyer", icon: <PlusOutlined />, category: "Team Management" },
    ],
    Lawyer: [
      { label: "Home", href: "/", icon: <HomeOutlined />, category: "Main" },
      { label: "About", href: "/pages/about-us", icon: <InfoCircleOutlined />, category: "Main" },
      { label: "Services", href: "/pages/our-services", icon: <AppstoreOutlined />, category: "Main" },
      { label: "My Clients", href: "/", icon: <TeamOutlined />, category: "Client Management" },
      { label: "Add Client", href: "/", icon: <PlusOutlined />, category: "Client Management" },
    ],
  };

  const groupedNavLinks = navLinksMap[role || "Lawyer"]?.reduce((acc, link) => {
    const category = link.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(link);
    return acc;
  }, {} as Record<string, typeof navLinksMap[string]>) || {};

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Super Admin":
        return "bg-gradient-to-r from-purple-500 to-pink-500";
      case "Firm Admin":
        return "bg-gradient-to-r from-blue-500 to-cyan-500";
      case "Lawyer":
        return "bg-gradient-to-r from-green-500 to-teal-500";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-[80px]" : "w-[280px]"
        } bg-white border-r border-slate-200 flex flex-col shadow-xl transition-all duration-300 ease-in-out`}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center flex-1">
            {!collapsed && (
              <Image src={logo} alt="logo" className="w-[140px] h-auto" />
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 ml-auto"
            >
              {collapsed ? (
                <MenuUnfoldOutlined className="text-slate-600" />
              ) : (
                <MenuFoldOutlined className="text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="px-4 py-6 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full ${getRoleColor(role || "")} flex items-center justify-center text-white font-semibold text-lg shadow-lg`}>
              {user?.name?.charAt(0)?.toUpperCase() || <UserOutlined />}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-500 truncate">{role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="space-y-6">
            {Object.entries(groupedNavLinks).map(([category, links]) => (
              <div key={category}>
                {!collapsed && (
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
                    {category}
                  </h3>
                )}
                <div className="space-y-1">
                  {links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className={`flex items-center ${
                        collapsed ? "justify-center px-3" : "px-3"
                      } py-3 text-slate-700 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 group relative`}
                      title={collapsed ? link.label : ""}
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                        {link.icon}
                      </span>
                      {!collapsed && (
                        <span className="ml-3 text-sm font-medium">{link.label}</span>
                      )}
                      {collapsed && (
                        <div className="absolute left-16 bg-slate-800 text-white px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                          {link.label}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="px-4 py-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${
              collapsed ? "justify-center px-3" : "px-3"
            } py-3 text-red-600 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all duration-200 group relative`}
            title={collapsed ? "Logout" : ""}
          >
            <LogoutOutlined className="text-lg" />
            {!collapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
            {collapsed && (
              <div className="absolute left-16 bg-slate-800 text-white px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-slate-800">
              {role === "Super Admin" && "Super Admin Panel"}
              {role === "Firm Admin" && "Firm Administration"}
              {role === "Lawyer" && "Legal Dashboard"}
            </h1>
            <div className="hidden md:block">
              <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getRoleColor(role || "")}`}>
                {role}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200">
              <BellOutlined className="text-lg" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200">
              <SettingOutlined className="text-lg" />
            </button>

            {/* User Avatar */}
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-500">{user?.email || "user@example.com"}</p>
              </div>
              <div className={`w-10 h-10 rounded-full ${getRoleColor(role || "")} flex items-center justify-center text-white font-semibold shadow-lg`}>
                {user?.name?.charAt(0)?.toUpperCase() || <UserOutlined />}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <section className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-white">
          <div className="p-8 max-w-full">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}