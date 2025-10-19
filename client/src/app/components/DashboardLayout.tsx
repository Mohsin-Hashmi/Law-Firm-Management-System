"use client";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/images/northman-logo.webp";
import { logoutUser } from "../service/authAPI";
import { removeUser } from "../store/userSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Select, Spin } from "antd";
import { switchFirm } from "../store/userSlice";
import { usePathname } from "next/navigation";
import { usePermission } from "../hooks/usePermission";
import AssignRoleModal from "./AssignRoleModal";
import ViewFirmsModal from "./ViewFirmsModal";
import { NavLinks } from "./sidebar/NavLinks";
import { Dropdown, Menu } from "antd";
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
  DownOutlined,
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
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const role = useAppSelector((state) => state.user.user?.role);
  const user = useAppSelector((state) => state.user.user);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);

  // Initialize collapsed state from localStorage
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("sidebar-collapsed");
      return savedState ? JSON.parse(savedState) : false;
    }
    return false;
  });

  const [isSwitchingFirm, setIsSwitchingFirm] = useState(false);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [isAssignRoleModalVisible, setIsAssignRoleModalVisible] =
    useState(false);
  const [isViewFirmsModalOpen, setIsViewFirmsModalOpen] = useState(false);
  const [showReset, setShowReset] = useState(false);

  // Save collapsed state to localStorage whenever it changes
  const handleToggleCollapse = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "sidebar-collapsed",
        JSON.stringify(newCollapsedState)
      );
    }
  };

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
  const handleOpenViewFirmModal = () => setIsViewFirmsModalOpen(true);
  const handleCloseViewFirmModal = () => setIsViewFirmsModalOpen(false);

  const handleLogout = async () => {
    try {
      const response = await logoutUser();
      dispatch(removeUser(response.data));
      dispatch(clearFirm(response.data));
      dispatch(clearLawyers(response.data));
      // Clear the saved sidebar state on logout
      if (typeof window !== "undefined") {
        localStorage.removeItem("sidebar-collapsed");
      }
      router.push("/auth/login");
      toast.success("Logged out successfully");
    } catch (err) {
      toast.error("Failed to logout");
      console.error(err);
    }
  };

  const handleFirmDeleted = (firmId: number) => {
    console.log(`Firm ${firmId} deleted successfully`);
    setIsViewFirmsModalOpen(false);
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 16 }} spin />;

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Super Admin":
        return "bg-gradient-to-r from-purple-500 to-pink-500";
      case "Firm Admin":
        return "bg-gradient-to-r from-blue-500 to-cyan-500";
      case "Lawyer":
        return "bg-gradient-to-r from-green-500 to-teal-500";
      case "Client":
        return "bg-gradient-to-r from-yellow-400 to-orange-500";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600";
    }
  };

  const WelcomeContent = ({ role }: { role: string }) => {
    const messages = {
      "Super Admin": {
        icon: <BankOutlined className="text-amber-600 dark:text-amber-400" />,
        text: "Welcome to your dashboard — You have complete access to manage firms, lawyers, and clients.",
      },
      Lawyer: {
        icon: <BankOutlined className="text-amber-600 dark:text-amber-400" />,
        text: "Welcome to your dashboard — let's start building your legal journey",
      },
      Client: {
        icon: (
          <FileTextOutlined className="text-amber-600 dark:text-amber-400" />
        ),
        text: "Welcome Client — Track your cases and stay updated",
      },
      Default: {
        icon: (
          <FileTextOutlined className="text-amber-600 dark:text-amber-400" />
        ),
        text: "Welcome to your dashboard",
      },
    };

    const message = messages[role as keyof typeof messages] || messages.Default;

    return (
      <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-start sm:items-center space-x-2">
        <span className="flex-shrink-0 mt-0.5 sm:mt-0">{message.icon}</span>
        <span className="break-words">{message.text}</span>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300 overflow-hidden">
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
          console.log("Password reset successful!");
        }}
      />

      {/* Sidebar */}
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-[999] md:hidden transition-opacity ${
          collapsed ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        onClick={() => setCollapsed(true)}
      />

      <aside
        className={`
          ${collapsed ? "w-[80px]" : "w-[280px]"}
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col shadow-xl dark:shadow-2xl transition-all duration-300 ease-in-out
          fixed z-[1000] h-full md:static md:h-auto
          ${collapsed ? "-left-[80px] md:left-0" : "left-0 md:left-0"}
        `}
      >
        {/* Logo Section */}
        <div className="h-25 flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center flex-1">
            {!collapsed && (
              <Image
                src={logo}
                alt="logo"
                className="w-[140px] h-auto brightness-0 dark:brightness-100"
              />
            )}
            <button
              onClick={handleToggleCollapse}
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
            onOpenViewFirmsModal={handleOpenViewFirmModal}
          />
        </nav>

        <RoleModal
          visible={isRoleModalVisible}
          onClose={handleCloseRoleModal}
          onRoleCreated={(newRole) => {
            console.log("New role created:", newRole);
          }}
        />

        <AssignRoleModal
          visible={isAssignRoleModalVisible}
          onClose={handleCloseAssignRoleModal}
          onRoleAssigned={(assignedUser) => {
            console.log("Role assigned:", assignedUser);
          }}
        />

        <ViewFirmsModal
          visible={isViewFirmsModalOpen}
          onClose={handleCloseViewFirmModal}
          onFirmDeleted={handleFirmDeleted}
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
        <header className="h-25 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-5 py-4 sm:py-5 shadow-sm dark:shadow-2xl">
          <div className="flex items-center space-x-4">
            {/* Mobile menu toggle for sidebar */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setCollapsed(false)}
              aria-label="Open sidebar"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="space-y-4">
              {/* Welcome Messages - Only show for non-Firm Admin roles */}
              {role !== "Firm Admin" && (
                <div className="w-full">
                  {/* Desktop View - Show full message */}
                  <div className="hidden sm:block">
                    {role === "Super Admin" && (
                      <WelcomeContent role="Super Admin" />
                    )}
                    {role === "Lawyer" && <WelcomeContent role="Lawyer" />}
                    {role === "Client" && <WelcomeContent role="Client" />}
                    {role &&
                      ![
                        "Super Admin",
                        "Firm Admin",
                        "Lawyer",
                        "Client",
                      ].includes(role) && <WelcomeContent role="Default" />}
                  </div>

                  {/* Mobile View - Compact dropdown */}
                  <div className="block sm:hidden">
                    <Dropdown
                      open={isWelcomeOpen}
                      onOpenChange={setIsWelcomeOpen}
                      dropdownRender={() => (
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3 max-w-[calc(100vw-32px)]">
                          {role === "Super Admin" && (
                            <WelcomeContent role="Super Admin" />
                          )}
                          {role === "Lawyer" && (
                            <WelcomeContent role="Lawyer" />
                          )}
                          {role === "Client" && (
                            <WelcomeContent role="Client" />
                          )}
                          {role &&
                            ![
                              "Super Admin",
                              "Firm Admin",
                              "Lawyer",
                              "Client",
                            ].includes(role) && (
                              <WelcomeContent role="Default" />
                            )}
                        </div>
                      )}
                      trigger={["click"]}
                      placement="bottomLeft"
                    >
                      <div className="px-3 py-2 rounded-lg text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-between cursor-pointer active:bg-amber-100 dark:active:bg-amber-900/30 transition-colors">
                        <div className="flex items-center space-x-2">
                          <BankOutlined className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                          <span className="font-semibold">Welcome Message</span>
                        </div>
                        <DownOutlined
                          className={`text-amber-600 dark:text-amber-400 text-xs transition-transform ${
                            isWelcomeOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </Dropdown>
                  </div>
                </div>
              )}

              {/* Firm Admin Section */}
              {role === "Firm Admin" && (
                <>
                  {!user?.firms || user.firms.length === 0 ? (
                    // No firms - show message on both desktop and mobile
                    <div className="w-full">
                      {/* Desktop View */}
                      <div className="hidden sm:block">
                        <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-start sm:items-center space-x-2">
                          <BankOutlined className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                          <span className="break-words">
                            Create Your First Business To Get Started
                          </span>
                        </div>
                      </div>

                      {/* Mobile View - Compact dropdown */}
                      <div className="block sm:hidden">
                        <Dropdown
                          dropdownRender={() => (
                            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3 max-w-[calc(100vw-32px)]">
                              <div className="px-3 py-2 rounded-lg text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-start space-x-2">
                                <BankOutlined className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                <span className="break-words">
                                  Create Your First Business To Get Started
                                </span>
                              </div>
                            </div>
                          )}
                          trigger={["click"]}
                          placement="bottomLeft"
                        >
                          <div className="px-3 py-2 rounded-lg text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-between cursor-pointer">
                            <div className="flex items-center space-x-2">
                              <BankOutlined className="text-amber-600 dark:text-amber-400" />
                              <span className="font-semibold">Get Started</span>
                            </div>
                            <DownOutlined className="text-amber-600 dark:text-amber-400 text-xs" />
                          </div>
                        </Dropdown>
                      </div>
                    </div>
                  ) : user.firms.length === 1 ? (
                    // One firm - show message on both desktop and mobile
                    <div className="w-full">
                      {/* Desktop View */}
                      <div className="hidden sm:block">
                        <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 flex items-start sm:items-center space-x-2">
                          <BankOutlined className="text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                          <span className="break-words">
                            You Have Only One Business Now
                          </span>
                        </div>
                      </div>

                      {/* Mobile View - Compact dropdown */}
                      <div className="block sm:hidden">
                        <Dropdown
                          dropdownRender={() => (
                            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3 max-w-[calc(100vw-32px)]">
                              <div className="px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 flex items-start space-x-2">
                                <BankOutlined className="text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5" />
                                <span className="break-words">
                                  You Have Only One Business Now
                                </span>
                              </div>
                            </div>
                          )}
                          trigger={["click"]}
                          placement="bottomLeft"
                        >
                          <div className="px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 flex items-center justify-between cursor-pointer">
                            <div className="flex items-center space-x-2">
                              <BankOutlined className="text-slate-500 dark:text-slate-400" />
                              <span className="font-semibold">
                                One Business
                              </span>
                            </div>
                            <DownOutlined className="text-slate-500 dark:text-slate-400 text-xs" />
                          </div>
                        </Dropdown>
                      </div>
                    </div>
                  ) : (
                    // Multiple firms - show switching dropdown
                    <div className="w-full">
                      <Select
                        value={user?.activeFirmId}
                        disabled={isSwitchingFirm}
                        style={{
                          width: "100%",
                          minWidth: "280px",
                        }}
                        className="vercel-firm-selector-responsive"
                        placeholder="Select a business"
                        size="large"
                        suffixIcon={
                          isSwitchingFirm ? (
                            <LoadingOutlined spin />
                          ) : (
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
                          )
                        }
                        dropdownStyle={{
                          borderRadius: "12px",
                          border: "1px solid #e5e7eb",
                          boxShadow:
                            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                          padding: "8px",
                          maxWidth: "calc(100vw - 32px)",
                          width: "auto",
                        }}
                        popupClassName="vercel-dropdown-popup"
                        onChange={async (value) => {
                          setIsSwitchingFirm(true);
                          try {
                            await switchFirmAPI(value);
                            dispatch(switchFirm(value));
                            const lawyers = await getLawyers(value);
                            dispatch(setLawyers(lawyers));

                            const routesToRedirect = [
                              "/get-lawyer-detail",
                              "/edit-lawyer",
                              "/get-client-detail",
                              "/edit-client",
                              "/add-lawyer",
                              "/create-client",
                              "/add-case",
                              "/get-user-roles",
                              "/add-firm",
                            ];

                            if (
                              routesToRedirect.some((route) =>
                                pathname.startsWith(route)
                              )
                            ) {
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
                        aria-label="Switch firm"
                      >
                        {user.firms.map((firm) => (
                          <Select.Option
                            key={`firm-${firm.id}`}
                            value={firm.id}
                          >
                            <div className="flex items-center justify-center py-1">
                              <div className="w-8 h-8 rounded bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-sm font-semibold text-white shadow-sm">
                                {firm.name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                          </Select.Option>
                        ))}
                      </Select>

                      {/* Custom styles for Firm Admin dropdown */}
                      <style jsx global>{`
                        .vercel-firm-selector-responsive .ant-select-selector {
                          background: white !important;
                          border: 1px solid #e5e7eb !important;
                          border-radius: 8px !important;
                          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
                          transition: all 0.15s ease !important;
                          padding: 4px 11px !important;
                          height: 40px !important;
                          display: flex !important;
                          align-items: center !important;
                        }

                        .dark
                          .vercel-firm-selector-responsive
                          .ant-select-selector {
                          background: #1e293b !important;
                          border: 1px solid #334155 !important;
                        }

                        .vercel-firm-selector-responsive
                          .ant-select-selector:hover {
                          border-color: #3b82f6 !important;
                        }

                        .dark
                          .vercel-firm-selector-responsive
                          .ant-select-selector:hover {
                          border-color: #60a5fa !important;
                        }

                        .vercel-firm-selector-responsive.ant-select-focused
                          .ant-select-selector {
                          border-color: #3b82f6 !important;
                          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
                        }

                        .dark
                          .vercel-firm-selector-responsive.ant-select-focused
                          .ant-select-selector {
                          border-color: #60a5fa !important;
                          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1) !important;
                        }

                        .vercel-firm-selector-responsive
                          .ant-select-selection-item {
                          display: flex !important;
                          align-items: center !important;
                          justify-content: center !important;
                        }

                        .vercel-dropdown-popup {
                          background: #ffffff !important;
                          border: 1px solid #e5e7eb !important;
                          border-radius: 8px !important;
                          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                            0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
                        }

                        .dark .vercel-dropdown-popup {
                          background: #1e293b !important;
                          border: 1px solid #334155 !important;
                        }

                        .vercel-dropdown-popup .ant-select-item {
                          border-radius: 6px !important;
                          margin: 4px !important;
                          padding: 12px !important;
                          transition: all 0.15s ease !important;
                          min-height: auto !important;
                        }

                        .vercel-dropdown-popup .ant-select-item:hover {
                          background: #f3f4f6 !important;
                        }

                        .dark .vercel-dropdown-popup .ant-select-item:hover {
                          background: #334155 !important;
                        }

                        .vercel-dropdown-popup
                          .ant-select-item-option-selected {
                          background: #eff6ff !important;
                        }

                        .dark
                          .vercel-dropdown-popup
                          .ant-select-item-option-selected {
                          background: #1e3a8a !important;
                        }

                        .vercel-dropdown-popup
                          .ant-select-item-option-selected:hover {
                          background: #dbeafe !important;
                        }

                        .dark
                          .vercel-dropdown-popup
                          .ant-select-item-option-selected:hover {
                          background: #1e40af !important;
                        }
                      `}</style>
                    </div>
                  )}
                </>
              )}
            </div>
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
        <section className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 transition-colors duration-300">
          <div className="p-8 max-w-full">{children}</div>
        </section>
      </main>
    </div>
  );
}
