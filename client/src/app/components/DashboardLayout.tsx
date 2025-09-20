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
import { usePermission } from "../hooks/usePermission";
import AssignRoleModal from "./AssignRoleModal";
import { NavLinks } from "./sidebar/NavLinks";
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
  DashboardOutlined,
  CreditCardOutlined,
  DollarOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { switchFirmAPI } from "../service/adminAPI";
import { getLawyers } from "../service/adminAPI";
import { setLawyers } from "../store/lawyerSlice";
import ThemeToggle from "./ThemeToggle";
import { clearFirm } from "../store/firmSlice";
import { clearLawyers } from "../store/lawyerSlice";
import RoleModal from "./RoleModal";
import { useState, useEffect } from "react";
import ResetPasswordModal from "./ResetPasswordModal";

export default function DashboardLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { hasPermission } = usePermission();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const role = useAppSelector((state) => state.user.user?.role);
  const user = useAppSelector((state) => state.user.user);
  const [collapsed, setCollapsed] = useState(false);
  const [isSwitchingFirm, setIsSwitchingFirm] = useState(false); // Add loading state
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [isAssignRoleModalVisible, setIsAssignRoleModalVisible] =
    useState(false);
  const [showReset, setShowReset] = useState(false);
  useEffect(() => {
    console.log("User in DashboardLayout:", user);
    if (user?.mustChangePassword) {
      setShowReset(true);
    }
  }, [user]);

  const handleOpenRoleModal = () => setIsRoleModalVisible(true);
  const handleCloseRoleModal = () => setIsRoleModalVisible(false);
  const handleOpenAssignRoleModal = () => setIsAssignRoleModalVisible(true);
  const handleCloseAssignRoleModal = () => setIsAssignRoleModalVisible(false);

  const handleLogout = async () => {
    try {
      const response = await logoutUser();
      dispatch(removeUser(response.data));
      dispatch(clearFirm(response.data));
      dispatch(clearLawyers(response.data));
      router.push("/auth/login");

      toast.success("Logged out successfully");
    } catch (err) {
      toast.error("Failed to logout");
      console.error(err);
    }
  };

  // Custom loading icon for the spinner
  const antIcon = <LoadingOutlined style={{ fontSize: 16 }} spin />;

  // const groupedNavLinks = navLinksMap[role || "Lawyer"]?.reduce((acc, link) => {
  //     const category = link.category || "Other";
  //     if (!acc[category]) {
  //       acc[category] = [];
  //     }
  //     acc[category].push(link);
  //     return acc;
  //   }, {} as Record<string, (typeof navLinksMap)[string]>) || {};

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

      <ResetPasswordModal
        visible={showReset}
        userId={user?.id}
        onClose={() => setShowReset(false)}
        onSuccess={() => {
          // Optional: Update Redux state to clear mustChangePassword
          console.log("Password reset successful!");
        }}
      />

      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-[80px]" : "w-[280px]"
        } bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col shadow-xl dark:shadow-2xl transition-all duration-300 ease-in-out`}
      >
        {/* Logo Section */}
        <div className="h-25 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
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
          <NavLinks
            collapsed={collapsed}
            isSuperAdmin={role === "Super Admin"}
            onOpenRoleModal={handleOpenRoleModal}
            onOpenAssignRoleModal={handleOpenAssignRoleModal}
          />
        </nav>
        <RoleModal
          visible={isRoleModalVisible}
          onClose={handleCloseRoleModal}
          onRoleCreated={(newRole) => {
            console.log("New role created:", newRole);
            // Optionally, refresh your nav links or update state
          }}
        />
        <AssignRoleModal
          visible={isAssignRoleModalVisible}
          onClose={handleCloseAssignRoleModal}
          onRoleAssigned={(assignedUser) => {
            console.log("Role assigned:", assignedUser);
            // maybe refresh data or show success message here
          }}
        />

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
        <header className=" h-25 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-2 py-5 shadow-sm dark:shadow-2xl">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              {role === "Super Admin" && "Super Admin Panel"}
              {role === "Firm Admin" && ""}
              {role === "Lawyer" && "Legal Dashboard"}
            </h1>

            {/* Switch Firm section - positioned next to title */}
            {role === "Firm Admin" && user?.firms && user.firms.length > 1 && (
              <div className="flex items-center ">
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
                <Select
                  value={user?.currentFirmId}
                  disabled={isSwitchingFirm}
                  style={{
                    width: 40,
                    height: 32,
                  }}
                  className="vercel-firm-selector"
                  placeholder=""
                  size="small"
                  suffixIcon={
                    <div className="flex items-center justify-center h-full">
                      <svg
                        width="18"
                        height="18"
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
                    </div>
                  }
                  dropdownStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow:
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    padding: "8px 8px",
                    minWidth: "500px",
                  }}
                  popupClassName="vercel-dropdown-popup"
                  onChange={async (value) => {
                    setIsSwitchingFirm(true);
                    try {
                      await switchFirmAPI(value);
                      dispatch(switchFirm(value));
                      const lawyers = await getLawyers(value);
                      dispatch(setLawyers(lawyers));

                      // Handle route redirections
                      if (pathname.startsWith("/get-lawyer-detail")) {
                        router.push("/dashboard");
                      }
                      if (pathname.startsWith("/edit-lawyer")) {
                        router.push("/dashboard");
                      }
                      if (pathname.startsWith("/get-client-detail")) {
                        router.push("/dashboard");
                      }
                      if (pathname.startsWith("/edit-client")) {
                        router.push("/dashboard");
                      }
                      if (pathname.startsWith("/add-lawyer")) {
                        router.push("/dashboard");
                      }
                      if (pathname.startsWith("/create-client")) {
                        router.push("/dashboard");
                      }
                      if (pathname.startsWith("/add-case")) {
                        router.push("/dashboard");
                      }
                      if (pathname.startsWith("/get-user-roles")) {
                        router.push("/dashboard");
                      }
                      if (pathname.startsWith("/add-firm")) {
                        router.push("/dashboard");
                      }

                      toast.success("Switched firm successfully");
                    } catch (err) {
                      console.error("Error switching firm:", err);
                      toast.error("Failed to switch firm");
                    } finally {
                      setIsSwitchingFirm(false);
                    }
                  }}
                >
                  {user.firms.map((firm) => (
                    <Select.Option key={firm.id} value={firm.id}>
                      <div className="flex items-center space-x-2 py-1">
                        <div className="w-6 h-6 rounded bg-blue-400 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-white dark:text-white">
                          {firm.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                          {firm.name}
                        </span>
                      </div>
                    </Select.Option>
                  ))}
                </Select>

                {/* Custom styles */}
                <style jsx global>{`
                  .vercel-firm-selector .ant-select-selector {
                    background: transparent !important;
                    border: none !important;
                    border-radius: 6px !important;
                    box-shadow: none !important;
                    transition: all 0.15s ease !important;
                    padding: 0 !important;
                    height: 32px !important;
                    width: 32px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    cursor: pointer !important;
                  }

                  .vercel-firm-selector .ant-select-selector:hover {
                    background: #f5f5f5 !important;
                    border-radius: 6px !important;
                  }

                  .dark .vercel-firm-selector .ant-select-selector:hover {
                    background: #333333 !important;
                  }

                  .vercel-firm-selector.ant-select-focused
                    .ant-select-selector {
                    background: #f0f0f0 !important;
                    box-shadow: none !important;
                  }

                  .dark
                    .vercel-firm-selector.ant-select-focused
                    .ant-select-selector {
                    background: #404040 !important;
                  }

                  .vercel-firm-selector .ant-select-selection-item {
                    display: none !important;
                  }

                  /* Loading state */
                  .vercel-firm-selector.ant-select-disabled
                    .ant-select-selector::after {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23cccccc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 12a9 9 0 11-6.219-8.56'/%3E%3C/svg%3E") !important;
                    animation: spin 1s linear infinite !important;
                  }

                  @keyframes spin {
                    from {
                      transform: rotate(0deg);
                    }
                    to {
                      transform: rotate(360deg);
                    }
                  }

                  /* Dropdown styles */
                  .vercel-dropdown-popup {
                    background: #ffffff !important;
                    border: 1px solid #e5e7eb !important;
                    border-radius: 8px !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                      0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
                  }

                  .dark .vercel-dropdown-popup {
                    background: #1e293b !important;
                    border: 1px solid #333333 !important;
                  }

                  .vercel-dropdown-popup .ant-select-item {
                    border-radius: 4px !important;
                    margin: 2px 4px !important;
                    padding: 8px !important;
                    transition: all 0.15s ease !important;
                    color: #171717 !important;
                    font-size: 13px !important;
                    min-height: auto !important;
                  }

                  .dark .vercel-dropdown-popup .ant-select-item {
                    color: #ededed !important;
                  }

                  .vercel-dropdown-popup .ant-select-item:hover {
                    background: #ffffff !important;
                  }

                  .dark .vercel-dropdown-popup .ant-select-item:hover {
                    background: #262626 !important;
                  }

                  .vercel-dropdown-popup .ant-select-item-option-selected {
                    background: #f0f0f0 !important;
                    font-weight: 500 !important;
                    color: #000000 !important;
                  }

                  .dark
                    .vercel-dropdown-popup
                    .ant-select-item-option-selected {
                    background: #333333 !important;
                    color: #ffffff !important;
                  }

                  .vercel-dropdown-popup
                    .ant-select-item-option-selected:hover {
                    background: #e5e5e5 !important;
                  }

                  .dark
                    .vercel-dropdown-popup
                    .ant-select-item-option-selected:hover {
                    background: #404040 !important;
                  }
                `}</style>
              </div>
            )}
          </div>

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
