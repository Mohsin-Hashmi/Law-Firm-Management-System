"use client";
import { fetchUsersWithRolesAndPermissions } from "@/app/service/adminAPI";
import { useState, useEffect } from "react";
import { deleteUserById } from "@/app/service/adminAPI";
import {
  Table,
  Spin,
  Typography,
  Button,
  Space,
  Tag,
  Card,
  Row,
  Col,
  Input,
  Select,
  Avatar,
  Statistic,
  Tooltip,
  message,
  Modal,
  Badge,
  List,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  KeyOutlined,
  MailOutlined,
  BuildOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  EyeInvisibleOutlined,
  BarChartOutlined,
  FolderOpenOutlined,
  UserAddOutlined,
  SettingOutlined,
  IeOutlined,
  CloseOutlined
} from "@ant-design/icons";
import { toast } from "react-hot-toast";
import DashboardLayout from "@/app/components/DashboardLayout";
import { ThemeProvider } from "next-themes";
import type { ColumnsType } from "antd/es/table";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import { useRouter } from "next/navigation";
const { Title, Text } = Typography;
const { Option } = Select;

interface Role {
  id: number;
  name: string;
}

interface Firm {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  permissions: string[];
  status: "active" | "inactive";
}

interface ApiResponse {
  success: boolean;
  firm: Firm;
  users: User[];
}

export default function GetUserRoles() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [firm, setFirm] = useState<Firm | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Check if dark mode is active
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      const htmlHasDark = document.documentElement.classList.contains("dark");
      const bodyHasDark = document.body.classList.contains("dark");
      setIsDarkMode(htmlHasDark || bodyHasDark);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Filter users based on search and filters
  useEffect(() => {
    filterUsers();
  }, [users, searchText, roleFilter]);

  const filterUsers = () => {
    let filtered = users;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchText.toLowerCase()) ||
          user.email.toLowerCase().includes(searchText.toLowerCase()) ||
          user.role.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter(
        (user) => user.role.name.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    setFilteredUsers(filtered);
  };

  // Fetch all users with roles and permissions from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response: ApiResponse = await fetchUsersWithRolesAndPermissions();
      console.log("Response of API is", response);

      if (response.success) {
        setUsers(response.users);
        setFirm(response.firm);
      } else {
        message.error("Failed to load users with roles and permissions");
      }
    } catch (error) {
      message.error("Something went wrong while loading users");
      console.error(error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle update user
  const handleUpdate = (id: number) => {
    router.push(`/edit-user/${id}`);
  };

  const handleOpenDeleteModal = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      const response = await deleteUserById(userToDelete.id);
      if (response) {
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
        toast.success(`${userToDelete.name} has been deleted`);
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
      } else {
        throw new Error(response || "Delete failed");
      }

      // update UI
    } catch (error) {
      toast.error("Failed to delete user");
      console.error(error);
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };
  // Get statistics
  const uniqueRoles = [...new Set(users.map((user) => user.role.name))];
  const usersWithPermissions = users.filter(
    (user) => user.permissions.length > 0
  );
  const usersWithoutPermissions = users.filter(
    (user) => user.permissions.length === 0
  );

  // Get role counts
  const getRoleCount = (roleName: string) => {
    return users.filter((user) => user.role.name === roleName).length;
  };

  // Format permission name for display
  const formatPermissionName = (permission: string) => {
    return permission
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get permission icon
  const getPermissionIcon = (permission: string) => {
    const iconMap = {
      create_case: <PlusOutlined />,
      create_client: <UserAddOutlined />,
      read_case: <EyeOutlined />,
      read_client: <EyeOutlined />,
      update_case: <EditOutlined />,
      update_client: <EditOutlined />,
      delete_case: <DeleteOutlined />,
      delete_client: <DeleteOutlined />,
      upload_case_document: <UploadOutlined />,
      view_case_documents: <FolderOpenOutlined />,
      view_case_status: <EyeInvisibleOutlined />,
      view_stats: <BarChartOutlined />,
      manage_settings: <SettingOutlined />,
      admin_access: <IeOutlined />,
    };

    return iconMap[permission as keyof typeof iconMap] || <FileTextOutlined />;
  };

  // Handle permission modal
  const handleViewPermissions = (user: User) => {
    setSelectedUser(user);
    setIsPermissionModalOpen(true);
  };

  const handleClosePermissionModal = () => {
    setIsPermissionModalOpen(false);
    setSelectedUser(null);
  };

  // Dynamic styles for Select dropdown based on theme
  const getDropdownStyle = () => {
    if (isDarkMode) {
      return {
        borderRadius: "8px",
        backgroundColor: "rgb(30 41 59)", // slate-800
        border: "1px solid rgb(71 85 105)", // slate-600
      };
    } else {
      return {
        borderRadius: "8px",
        backgroundColor: "white",
        border: "1px solid rgb(226 232 240)", // slate-200
      };
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      width: "25%", // Equal width
      render: (name: string, record: User) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar
            size={40}
            style={{
              background: "#f1f5f9",
              border: "2px solid #e5e7eb",
            }}
          >
            <UserOutlined style={{ color: "#94a3b8" }} />
          </Avatar>
          <div>
            <Text
              className="text-slate-900 dark:text-white"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                display: "block",
              }}
            >
              {name}
            </Text>
            <Text
              className="text-slate-500 dark:text-slate-400"
              style={{ fontSize: "12px" }}
            >
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      key: "role",
      align: "center",
      width: "20%", // Equal width
      render: (_: unknown, record: User) => (
        <div style={{ textAlign: "center" }}>
          <Tag
            className={`
              px-3 py-1 rounded-full text-xs font-medium border-0
              ${
                record.role.name === "Lawyer"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : ""
              }
              ${
                record.role.name === "Client"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : ""
              }
              ${
                record.role.name === "Assistant"
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                  : ""
              }
              ${
                record.role.name === "Assistant Director"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                  : ""
              }
              ${
                record.role.name === "Captain"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : ""
              }
              ${
                ![
                  "Lawyer",
                  "Client",
                  "Assistant",
                  "Assistant Director",
                  "Captain",
                ].includes(record.role.name)
                  ? "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                  : ""
              }
            `}
          >
            {record.role.name}
          </Tag>
        </div>
      ),
    },
    {
      title: "Permissions",
      key: "permissions",
      align: "center",
      width: "20%", // Equal width
      render: (_: unknown, record: User) => (
        <div style={{ textAlign: "center" }}>
          {record.permissions.length > 0 ? (
            <Tag
              className="px-3 py-1 rounded-full text-xs font-medium border-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-pointer hover:bg-green-200 dark:hover:bg-green-800/30"
              onClick={() => handleViewPermissions(record)}
            >
              {record.permissions.length} Permission
              {record.permissions.length !== 1 ? "s" : ""}
            </Tag>
          ) : (
            <Tag className="px-3 py-1 rounded-full text-xs font-medium border-0 bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400">
              No Permissions
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      align: "center",
      width: "15%",
      render: (_: unknown, record: User) => {
        const isActive = record.status?.toLowerCase() === "active";

        return (
          <div style={{ textAlign: "center" }}>
            <Tag
              className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${
                isActive
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: "20%", // Equal width
      render: (_: unknown, record: User) => (
        <Space size="small" style={{ justifyContent: "center", width: "100%" }}>
          <Tooltip title="Edit User">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleUpdate(record.id)}
              className="hover:!bg-amber-50 dark:text-gray-200 hover:!text-amber-600 dark:hover:!bg-amber-900/30 dark:hover:!text-amber-400"
              style={{ borderRadius: "6px" }}
            />
          </Tooltip>
          <Tooltip title="Delete User">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleOpenDeleteModal(record);
              }}
              className="hover:!bg-red-50 dark:text-gray-200 hover:!text-red-600 dark:hover:!bg-red-900/30 dark:hover:!text-red-400"
              style={{ borderRadius: "6px" }}
            />
            <ConfirmationModal
              visible={isDeleteModalOpen}
              entityName={userToDelete?.name || ""}
              action="delete"
              onConfirm={handleDeleteUser}
              onCancel={() => setIsDeleteModalOpen(false)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const getPermissionDescription = (permission: string) => {
  const descriptions: Record<string, string> = {
    'create_case': 'Allows user to create new legal cases',
    'create_client': 'Allows user to create new client profiles',
    'read_case': 'Allows user to view legal case information',
    'read_client': 'Allows user to view client information',
    'update_case': 'Allows user to modify existing legal cases',
    'update_client': 'Allows user to update client information',
    'delete_case': 'Allows user to delete legal cases',
    'delete_client': 'Allows user to remove client profiles',
    'upload_case_document': 'Allows user to upload case-related documents',
    'view_case_documents': 'Allows user to access and view case documents',
    'view_case_status': 'Allows user to check the status of legal cases',
    'view_stats': 'Allows user to view system statistics and reports',
    'manage_settings': 'Allows user to configure system settings',
    'admin_access': 'Provides full administrative access to the system',
  };
  
  return descriptions[permission] || `Allows access to ${formatPermissionName(permission).toLowerCase()}`;
};

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DashboardLayout>
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <Spin
              size="large"
              tip="Loading users with roles and permissions..."
            />
          </div>
        ) : (
          <div className="min-h-screen transition-colors duration-300 [&_.ant-typography]:dark:!text-white [&_.ant-card-head-title]:dark:!text-white">
            <div className="max-w-full">
              {/* Header Section */}
              <Card
                className="bg-[#3A3A3A] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
                bodyStyle={{ padding: "32px 20px" }}
              >
                <Row align="middle" justify="space-between">
                  <Col>
                    <Space size="large">
                      <div
                        style={{
                          width: "80px",
                          height: "80px",
                          background: "rgba(255,255,255,0.15)",
                          borderRadius: "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "2px solid rgba(255,255,255,0.2)",
                        }}
                      >
                        <SafetyCertificateOutlined
                          style={{ fontSize: "32px", color: "white" }}
                        />
                      </div>
                      <div>
                        <Title
                          level={1}
                          style={{
                            color: "white",
                            margin: 0,
                            fontSize: "36px",
                            fontWeight: "600",
                            letterSpacing: "-0.025em",
                          }}
                        >
                          User Roles & Permissions
                        </Title>
                        <Text
                          style={{
                            color: "rgba(255,255,255,0.8)",
                            fontSize: "18px",
                            fontWeight: "400",
                          }}
                        >
                          Manage user access control for{" "}
                          {firm?.name || "your firm"}
                        </Text>
                      </div>
                    </Space>
                  </Col>
                </Row>
              </Card>

              {/* Statistics Cards */}
              <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                    bodyStyle={{ padding: "30px" }}
                    hoverable
                  >
                    <Statistic
                      title={
                        <span className="text-slate-500 dark:text-white text-lg font-medium mb-[15px] block">
                          Total Users
                        </span>
                      }
                      value={users.length}
                      valueStyle={{
                        fontSize: "32px",
                        fontWeight: "700",
                        lineHeight: "1",
                        color: "inherit",
                      }}
                      prefix={
                        <UserOutlined className="text-blue-600 dark:text-blue-400 text-3xl mr-1" />
                      }
                      className="text-blue-600 dark:text-blue-600"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                    bodyStyle={{ padding: "30px" }}
                    hoverable
                  >
                    <Statistic
                      title={
                        <span className="text-slate-500 dark:text-white text-lg font-medium mb-[15px] block">
                          Active Roles
                        </span>
                      }
                      value={uniqueRoles.length}
                      valueStyle={{
                        fontSize: "32px",
                        fontWeight: "700",
                        lineHeight: "1",
                        color: "inherit",
                      }}
                      prefix={
                        <TeamOutlined className="text-green-600 dark:text-green-400 text-3xl mr-1" />
                      }
                      className="text-green-600 dark:text-green-500"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                    bodyStyle={{ padding: "30px" }}
                    hoverable
                  >
                    <Statistic
                      title={
                        <span className="text-slate-500 dark:text-white text-lg font-medium mb-[15px] block">
                          With Permissions
                        </span>
                      }
                      value={usersWithPermissions.length}
                      valueStyle={{
                        fontSize: "32px",
                        fontWeight: "700",
                        lineHeight: "1",
                        color: "inherit",
                      }}
                      prefix={
                        <CheckCircleOutlined className="text-purple-600 dark:text-purple-400 text-3xl mr-1" />
                      }
                      className="text-purple-600 dark:text-purple-500"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                    bodyStyle={{ padding: "30px" }}
                    hoverable
                  >
                    <Statistic
                      title={
                        <span className="text-slate-500 dark:text-white text-lg font-medium mb-[15px] block">
                          Limited Access
                        </span>
                      }
                      value={usersWithoutPermissions.length}
                      valueStyle={{
                        fontSize: "32px",
                        fontWeight: "700",
                        lineHeight: "1",
                        color: "inherit",
                      }}
                      prefix={
                        <ExclamationCircleOutlined className="text-orange-600 dark:text-orange-400 text-3xl mr-1" />
                      }
                      className="text-orange-600 dark:text-orange-600"
                    />
                  </Card>
                </Col>
              </Row>

              {/* Filters and Search */}
              <Card
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm transition-colors duration-300 mb-6"
                bodyStyle={{ padding: "24px" }}
              >
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} sm={12} md={8}>
                    <Input
                      placeholder="Search users by name, email, or role"
                      prefix={
                        <SearchOutlined className="text-slate-400 dark:text-slate-500" />
                      }
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                      size="large"
                    />
                  </Col>
                  <Col xs={12} sm={6} md={4}>
                    <style>
                      {`
                        /* Light mode select */
                        .role-filter-select .ant-select-selector {
                          background-color: white !important;
                          border-color: rgb(203 213 225) !important;
                          color: rgb(15 23 42) !important;
                        }
                        .role-filter-select .ant-select-selection-placeholder {
                          color: rgb(100 116 139) !important;
                        }
                        .role-filter-select .ant-select-selection-item {
                          color: rgb(15 23 42) !important;
                        }
                        .role-filter-light-dropdown .ant-select-item {
                          color: #1e293b !important;
                          background-color: white !important;
                        }
                        .role-filter-light-dropdown .ant-select-item:hover {
                          background-color: #f1f5f9 !important;
                        }
                        .role-filter-light-dropdown .ant-select-item-option-selected {
                          background-color: #e2e8f0 !important;
                        }
                        
                        /* Dark mode select */
                        .role-filter-dark-select .ant-select-selector {
                          background-color: rgb(15 23 42) !important;
                          border-color: rgb(71 85 105) !important;
                          color: white !important;
                        }
                        .role-filter-dark-select .ant-select-selection-placeholder {
                          color: rgb(148 163 184) !important;
                        }
                        .role-filter-dark-select .ant-select-selection-item {
                          color: white !important;
                        }
                        .role-filter-dark-dropdown .ant-select-item {
                          color: #e2e8f0 !important;
                          background-color: rgb(30 41 59) !important;
                        }
                        .role-filter-dark-dropdown .ant-select-item:hover {
                          background-color: rgb(51 65 85) !important;
                        }
                        .role-filter-dark-dropdown .ant-select-item-option-selected {
                          background-color: rgb(71 85 105) !important;
                        }
                      `}
                    </style>
                    <Select
                      placeholder="Filter by Role"
                      value={roleFilter}
                      onChange={setRoleFilter}
                      size="large"
                      className={`w-full ${
                        isDarkMode
                          ? "role-filter-dark-select"
                          : "role-filter-select"
                      }`}
                      style={{ height: "40px" }}
                      dropdownStyle={getDropdownStyle()}
                      dropdownClassName={
                        isDarkMode
                          ? "role-filter-dark-dropdown"
                          : "role-filter-light-dropdown"
                      }
                    >
                      <Option value="all">All Roles</Option>
                      {uniqueRoles.map((role) => (
                        <Option key={role} value={role}>
                          {role} ({getRoleCount(role)})
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={12}>
                    <Space>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchUsers}
                        loading={loading}
                        className="rounded-xl border border-slate-300 dark:border-slate-600 dark:text-white 
                          !bg-transparent hover:!bg-transparent active:!bg-transparent focus:!bg-transparent"
                      >
                        Refresh
                      </Button>
                      <Text className="text-slate-500 dark:text-slate-400 text-sm">
                        Showing {filteredUsers.length} of {users.length} users
                      </Text>
                    </Space>
                  </Col>
                </Row>
              </Card>

              {/* Users Table */}
              <Card
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm transition-colors duration-300"
                bodyStyle={{ padding: 0 }}
              >
                <Table<User>
                  dataSource={filteredUsers}
                  columns={columns}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} users`,
                    className: "dark:text-slate-300",
                    style: { marginRight: "24px", marginBottom: "16px" },
                  }}
                  className="dark:[&_.ant-table]:!bg-slate-800 
                    dark:[&_.ant-table-thead>tr>th]:!bg-slate-900 
                    dark:[&_.ant-table-thead>tr>th]:!text-slate-200 
                    dark:[&_.ant-table-tbody>tr>td]:!bg-slate-800 
                    dark:[&_.ant-table-tbody>tr>td]:!text-slate-300"
                  style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                  }}
                  tableLayout="fixed" // This ensures equal column widths
                  scroll={{ x: "max-content" }}
                  locale={{
                    emptyText: (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "48px",
                        }}
                        className="text-slate-500 dark:text-slate-400"
                      >
                        <SafetyCertificateOutlined
                          style={{ fontSize: "48px", marginBottom: "16px" }}
                        />
                        <Title
                          level={4}
                          className="!text-slate-500 dark:!text-slate-300"
                        >
                          No users found
                        </Title>
                        <Text className="dark:text-slate-400">
                          No users match your search criteria
                        </Text>
                      </div>
                    ),
                  }}
                />
              </Card>

              {/* Permissions Modal */}
              <Modal
                title={null}
                open={isPermissionModalOpen}
                onCancel={handleClosePermissionModal}
                footer={null}
                width={600}
                centered
                closeIcon={
                  <CloseOutlined className="text-slate-400 hover:text-slate-600" />
                }
                className="view-permissions-modal"
                style={{
                  padding: "5px 10px",
                }}
              >
                <div>
                  {/* Header */}
                  <div className="mb-5">
                    <Space size="small" className="mb-1">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <KeyOutlined className="text-blue-600 dark:text-blue-400 text-sm" />
                      </div>
                      <div>
                        <Title
                          level={5}
                          className="!text-slate-900 dark:!text-white !mb-0 !text-lg"
                        >
                          Permissions for {selectedUser?.name}
                        </Title>
                        <Text className="text-slate-500 dark:text-slate-300 text-xs">
                          View all permissions assigned to this user
                        </Text>
                      </div>
                    </Space>
                  </div>

                  {selectedUser && (
                    <div>
                      {selectedUser.permissions.length > 0 ? (
                        <div>
                          {/* Status Banner */}
                          <div
                            className="mb-4 p-3 rounded-lg border"
                            style={{
                              background: isDarkMode
                                ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
                                : "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                              borderColor: isDarkMode ? "#475569" : "#0ea5e9",
                            }}
                          >
                            <Text
                              className="text-xs"
                              style={{
                                color: isDarkMode ? "#e2e8f0" : "#0369a1",
                                fontWeight: "500",
                              }}
                            >
                              <CheckCircleOutlined className="mr-2" />
                              This user has {
                                selectedUser.permissions.length
                              }{" "}
                              permission
                              {selectedUser.permissions.length !== 1
                                ? "s"
                                : ""}{" "}
                              with <strong>{selectedUser.role.name}</strong>{" "}
                              role
                            </Text>
                          </div>

                          {/* Permissions List */}
                          <div className="max-h-80 overflow-y-auto space-y-2">
                            {selectedUser.permissions.map(
                              (permission, index) => (
                                <Card
                                  key={index}
                                  className="border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:shadow-sm transition-shadow"
                                  bodyStyle={{ padding: "12px" }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 flex-1">
                                      {/* Permission Icon */}
                                      <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                        <span className="text-blue-600 dark:text-blue-400 text-sm">
                                          {getPermissionIcon(permission)}
                                        </span>
                                      </div>

                                      {/* Permission Details */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <Text className="text-slate-900 dark:text-white font-medium text-sm truncate">
                                            {formatPermissionName(permission)}
                                          </Text>
                                        </div>
                                        { <Text className="text-slate-500 dark:text-slate-300 text-xs">
                                          {getPermissionDescription(permission)}
                                        </Text> }
                                      </div>
                                    </div>

                                    {/* Status Tag */}
                                    <div className="flex items-center space-x-1 ml-3">
                                      <Tag
                                        color="blue"
                                        className="text-xs"
                                        style={{
                                          fontSize: "10px",
                                          padding: "1px 6px",
                                          lineHeight: "16px",
                                        }}
                                      >
                                        Active
                                      </Tag>
                                    </div>
                                  </div>
                                </Card>
                              )
                            )}
                          </div>
                        </div>
                      ) : (
                        // No Permissions State
                        <div className="py-8">
                          <div className="text-center">
                            <div
                              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                              style={{
                                background: isDarkMode
                                  ? "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)"
                                  : "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)",
                                color: isDarkMode ? "white" : "#dc2626",
                              }}
                            >
                              <ExclamationCircleOutlined className="text-2xl" />
                            </div>
                            <Title
                              level={5}
                              className="!text-slate-900 dark:!text-white !mb-2"
                            >
                              No Permissions Assigned
                            </Title>
                            <Text className="text-slate-500 dark:text-slate-400 text-sm">
                              This user currently has limited access with no
                              specific permissions assigned.
                            </Text>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-200 dark:border-slate-600">
                    <div>
                      <Text className="text-slate-500 dark:text-slate-400 text-xs">
                        {selectedUser &&
                          selectedUser.permissions.length > 0 &&
                          `${selectedUser.permissions.length} permission${
                            selectedUser.permissions.length !== 1 ? "s" : ""
                          } found`}
                      </Text>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleClosePermissionModal}
                        className="h-8 px-3 rounded-md text-xs"
                        size="small"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              </Modal>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ThemeProvider>
  );
}
