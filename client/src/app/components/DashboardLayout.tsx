"use client";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/images/northman-logo.webp";
import { logoutUser } from "../service/authAPI";
import { removeUser } from "../store/userSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Select, Spin } from "antd"; // Import Spin from antd
import { switchFirm } from "../store/userSlice";
import { usePathname } from "next/navigation";
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
  LoadingOutlined,
  BankOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { switchFirmAPI } from "../service/adminAPI";
import { getLawyers } from "../service/adminAPI";
import { setLawyers } from "../store/lawyerSlice";
import ThemeToggle from "./ThemeToggle";
import { clearFirm } from "../store/firmSlice";
import { clearLawyers } from "../store/lawyerSlice";

export default function DashboardLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const role = useAppSelector((state) => state.user.user?.role);
  const user = useAppSelector((state) => state.user.user);
  const [collapsed, setCollapsed] = useState(false);
  const [isSwitchingFirm, setIsSwitchingFirm] = useState(false); // Add loading state

  const handleLogout = async () => {
    const response = await logoutUser();
    dispatch(removeUser(response.data));
    dispatch(clearFirm(response.data));
    dispatch(clearLawyers(response.data));
    router.push("/auth/login");
    toast.success("Logged out successfully");
  };

  // Custom loading icon for the spinner
  const antIcon = <LoadingOutlined style={{ fontSize: 16 }} spin />;

  const navLinksMap: Record<
    string,
    { label: string; href: string; icon: React.ReactNode; category?: string }[]
  > = {
    "Super Admin": [
      { label: "Home", href: "/", icon: <HomeOutlined />, category: "Main" },
      {
        label: "About",
        href: "/pages/about-us",
        icon: <InfoCircleOutlined />,
        category: "Main",
      },
      {
        label: "Services",
        href: "/pages/our-services",
        icon: <AppstoreOutlined />,
        category: "Main",
      },
      {
        label: "Firms",
        href: "/pages/super-admin/get-firms",
        icon: <TeamOutlined />,
        category: "Management",
      },
      {
        label: "Add Firm",
        href: "/pages/super-admin/add-firm",
        icon: <PlusOutlined />,
        category: "Management",
      },
    ],
    "Firm Admin": [
      {
        label: "Dashboard",
        href: "/pages/dashboard",
        icon: <HomeOutlined />,
        category: "Main",
      },
      {
        label: "About",
        href: "/pages/about-us",
        icon: <InfoCircleOutlined />,
        category: "Main",
      },
      {
        label: "Services",
        href: "/pages/our-services",
        icon: <AppstoreOutlined />,
        category: "Main",
      },
      {
        label: "Create New Law Firm",
        href: "/pages/firm-admin/add-firm",
        icon: <BankOutlined />,
        category: "Main",
      },
      {
        label: "Lawyers",
        href: "/pages/firm-admin/get-lawyers",
        icon: <UserOutlined />,
        category: "Team Management",
      },
      {
        label: "Add Lawyer",
        href: "/pages/firm-admin/add-lawyer",
        icon: <PlusOutlined />,
        category: "Team Management",
      },
      {
        label: "Clients",
        href: "/pages/firm-admin/get-clients",
        icon: <UserOutlined />,
        category: "Client Management",
      },
      {
        label: "Add Clients",
        href: "/pages/firm-admin/create-client",
        icon: <PlusOutlined />,
        category: "Client Management",
      },
      {
        label: "Cases",
        href: "/pages/firm-admin/get-cases",
        icon: <FileTextOutlined />,
        category: "Case Management",
      },
      {
        label: "Add Cases",
        href: "/pages/firm-admin/add-case",
        icon: <PlusOutlined />,
        category: "Case Management",
      },
    ],
    Lawyer: [
      { label: "Home", href: "/", icon: <HomeOutlined />, category: "Main" },
      {
        label: "About",
        href: "/pages/about-us",
        icon: <InfoCircleOutlined />,
        category: "Main",
      },
      {
        label: "Services",
        href: "/pages/our-services",
        icon: <AppstoreOutlined />,
        category: "Main",
      },
      {
        label: "My Clients",
        href: "/",
        icon: <TeamOutlined />,
        category: "Client Management",
      },
      {
        label: "Add Client",
        href: "/",
        icon: <PlusOutlined />,
        category: "Client Management",
      },
    ],
  };

  const groupedNavLinks =
    navLinksMap[role || "Lawyer"]?.reduce((acc, link) => {
      const category = link.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(link);
      return acc;
    }, {} as Record<string, (typeof navLinksMap)[string]>) || {};

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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Loading Overlay when switching firms */}
      {isSwitchingFirm && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl flex items-center space-x-3">
            <Spin size="large" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              Switching firm...
            </span>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-[80px]" : "w-[280px]"
        } bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col shadow-xl dark:shadow-2xl transition-all duration-300 ease-in-out`}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center flex-1">
            {!collapsed && (
              <Image
                src={logo}
                alt="logo"
                className="w-[140px] h-auto brightness-0 dark:brightness-100"
              />
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 ml-auto"
            >
              {collapsed ? (
                <MenuUnfoldOutlined className="text-slate-600 dark:text-slate-300" />
              ) : (
                <MenuFoldOutlined className="text-slate-600 dark:text-slate-300" />
              )}
            </button>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="px-4 py-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 rounded-full ${getRoleColor(
                role || ""
              )} flex items-center justify-center text-white font-semibold text-lg shadow-lg`}
            >
              {user?.name?.charAt(0)?.toUpperCase() || <UserOutlined />}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {role}
                </p>
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
                  <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-2">
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
                      } py-3 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all duration-200 group relative`}
                      title={collapsed ? link.label : ""}
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                        {link.icon}
                      </span>
                      {!collapsed && (
                        <span className="ml-3 text-sm font-medium">
                          {link.label}
                        </span>
                      )}
                      {collapsed && (
                        <div className="absolute left-16 bg-slate-800 dark:bg-slate-700 text-white dark:text-white px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
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
        <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${
              collapsed ? "justify-center px-3" : "px-3"
            } py-3 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 group relative`}
            title={collapsed ? "Logout" : ""}
          >
            <LogoutOutlined className="text-lg" />
            {!collapsed && (
              <span className="ml-3 text-sm font-medium">Logout</span>
            )}
            {collapsed && (
              <div className="absolute left-16 bg-slate-800 dark:bg-slate-700 text-white px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 shadow-sm dark:shadow-2xl">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              {role === "Super Admin" && "Super Admin Panel"}
              {role === "Firm Admin" && ""}
              {role === "Lawyer" && "Legal Dashboard"}
            </h1>
            <div className="hidden md:block">
              {role === "Firm Admin" &&
                user?.firms &&
                user.firms.length > 1 && (
                  <div
                    className={`px-3 py-1 rounded-full text-base font-medium text-white bg-blue-500`}
                  >
                    <p>Switch Firm</p>
                  </div>
                )}
            </div>
          </div>

          {role === "Firm Admin" && user?.firms && user.firms.length > 1 && (
            <div className="relative">
              <Select
                value={user?.currentFirmId}
                loading={isSwitchingFirm} // Add loading prop to the Select
                disabled={isSwitchingFirm} // Disable select while loading
                style={{
                  width: 500,
                  height: 44,
                }}
                className="professional-firm-selector"
                placeholder="Select Firm"
                suffixIcon={
                  isSwitchingFirm ? (
                    <Spin indicator={antIcon} />
                  ) : (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className="text-slate-400 dark:text-slate-500"
                    >
                      <path
                        d="M2.5 4.5L6 8L9.5 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )
                }
                dropdownStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  padding: "2px 0",
                }}
                popupClassName="professional-dropdown-popup"
                onChange={async (value) => {
                  setIsSwitchingFirm(true); // Start loading
                  try {
                    // 1) tell backend to update JWT/cookie
                    await switchFirmAPI(value);
                    // 2) update Redux with new firmId
                    dispatch(switchFirm(value));
                    // 3) optional: clear old firm data so it reloads
                    const lawyers = await getLawyers(value);
                    dispatch(setLawyers(lawyers));
                    dispatch(clearFirm()); // if you have this in firmSlice
                    if (
                      pathname.startsWith("/pages/firm-admin/get-lawyer-detail")
                    ) {
                      router.push("/pages/dashboard");
                    }
                    if (pathname.startsWith("/pages/firm-admin/edit-lawyer")) {
                      router.push("/pages/dashboard");
                    }
                    if (
                      pathname.startsWith("/pages/firm-admin/get-client-detail")
                    ) {
                      router.push("/pages/dashboard");
                    }
                    if (pathname.startsWith("/pages/firm-admin/edit-client")) {
                      router.push("/pages/dashboard");
                    }
                     if (pathname.startsWith("/pages/firm-admin/add-lawyer")) {
                      router.push("/pages/dashboard");
                    }
                    if (pathname.startsWith("/pages/firm-admin/create-client")) {
                      router.push("/pages/dashboard");
                    }
                     if (pathname.startsWith("/pages/firm-admin/add-case")) {
                      router.push("/pages/dashboard");
                    }
                    toast.success("Switched firm successfully");
                  } catch (err) {
                    console.error("Error switching firm:", err);
                    toast.error("Failed to switch firm");
                  } finally {
                    setIsSwitchingFirm(false); // End loading
                  }
                }}
              >
                {user.firms.map((firm) => (
                  <Select.Option key={firm.id} value={firm.id}>
                    <div className="flex items-center space-x-3 py-1">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                        {firm.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-800 dark:text-white font-medium text-sm">
                          {firm.name}
                        </span>
                      </div>
                    </div>
                  </Select.Option>
                ))}
              </Select>

              {/* Add custom styles with dark mode support */}
              <style jsx global>{`
                .professional-firm-selector .ant-select-selector {
                  background: linear-gradient(
                    135deg,
                    #ffffff 0%,
                    #f8fafc 100%
                  ) !important;
                  border: 2px solid #e2e8f0 !important;
                  border-radius: 12px !important;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02) !important;
                  transition: all 0.2s ease !important;
                  padding: 4px 12px !important;
                  height: 44px !important;
                  display: flex !important;
                  align-items: center !important;
                }

                .dark .professional-firm-selector .ant-select-selector {
                  background: linear-gradient(
                    135deg,
                    #1e293b 0%,
                    #334155 100%
                  ) !important;
                  border: 2px solid #475569 !important;
                  color: #ffffff !important;
                }

                .professional-firm-selector .ant-select-selector:hover {
                  border-color: #3b82f6 !important;
                  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15) !important;
                }

                .dark .professional-firm-selector .ant-select-selector:hover {
                  border-color: #60a5fa !important;
                  box-shadow: 0 4px 12px rgba(96, 165, 250, 0.25) !important;
                }

                .professional-firm-selector.ant-select-focused
                  .ant-select-selector {
                  border-color: #3b82f6 !important;
                  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
                }

                .dark
                  .professional-firm-selector.ant-select-focused
                  .ant-select-selector {
                  border-color: #60a5fa !important;
                  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2) !important;
                }

                .professional-firm-selector .ant-select-selection-item {
                  display: flex !important;
                  align-items: center !important;
                  font-weight: 500 !important;
                  color: #1e293b !important;
                  font-size: 14px !important;
                }

                .dark .professional-firm-selector .ant-select-selection-item {
                  color: #ffffff !important;
                }

                /* Loading state styles */
                .professional-firm-selector.ant-select-disabled
                  .ant-select-selector {
                  opacity: 0.6 !important;
                }

                .professional-dropdown-popup {
                  background: #ffffff !important;
                }

                .dark .professional-dropdown-popup {
                  background: #1e293b !important;
                  border: 1px solid #475569 !important;
                }

                .professional-dropdown-popup .ant-select-item {
                  border-radius: 8px !important;
                  margin: 2px 8px !important;
                  padding: 12px !important;
                  transition: all 0.15s ease !important;
                  color: #1e293b !important;
                }

                .dark .professional-dropdown-popup .ant-select-item {
                  color: #ffffff !important;
                }

                .professional-dropdown-popup .ant-select-item:hover {
                  background: linear-gradient(
                    135deg,
                    #f1f5f9 0%,
                    #e2e8f0 100%
                  ) !important;
                  transform: translateX(2px) !important;
                }

                .dark .professional-dropdown-popup .ant-select-item:hover {
                  background: linear-gradient(
                    135deg,
                    #334155 0%,
                    #475569 100%
                  ) !important;
                }

                .professional-dropdown-popup .ant-select-item-option-selected {
                  background: linear-gradient(
                    135deg,
                    #dbeafe 0%,
                    #bfdbfe 100%
                  ) !important;
                  border: 1px solid #3b82f6 !important;
                  font-weight: 600 !important;
                }

                .dark
                  .professional-dropdown-popup
                  .ant-select-item-option-selected {
                  background: linear-gradient(
                    135deg,
                    #1e3a8a 0%,
                    #3b82f6 100%
                  ) !important;
                  border: 1px solid #60a5fa !important;
                  color: #ffffff !important;
                }

                .professional-dropdown-popup
                  .ant-select-item-option-selected:hover {
                  background: linear-gradient(
                    135deg,
                    #bfdbfe 0%,
                    #93c5fd 100%
                  ) !important;
                }

                .dark
                  .professional-dropdown-popup
                  .ant-select-item-option-selected:hover {
                  background: linear-gradient(
                    135deg,
                    #3b82f6 0%,
                    #60a5fa 100%
                  ) !important;
                }
              `}</style>
            </div>
          )}

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200">
              <BellOutlined className="text-lg" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200">
              <SettingOutlined className="text-lg" />
            </button>

            <ThemeToggle />

            {/* User Avatar */}
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200 dark:border-slate-600">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.email || "user@example.com"}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-full ${getRoleColor(
                  role || ""
                )} flex items-center justify-center text-white font-semibold shadow-lg`}
              >
                {user?.name?.charAt(0)?.toUpperCase() || <UserOutlined />}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <section className="flex-1 overflow-y-auto bg-gradie  nt-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 transition-colors duration-300">
          <div className="p-8 max-w-full">{children}</div>
        </section>
      </main>
    </div>
  );
}
