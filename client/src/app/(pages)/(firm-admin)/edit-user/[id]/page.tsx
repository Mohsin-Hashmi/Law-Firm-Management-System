"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { ThemeProvider } from "next-themes";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Avatar,
  Spin,
  Button,
  Form,
  Input,
  Select,
  message,
  Checkbox,
  Divider,
  Tag,
  Switch,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  EditOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  TeamOutlined,
  CheckOutlined,
  CloseOutlined,
  SettingOutlined,
  IeOutlined,
  CheckCircleOutlined

} from "@ant-design/icons";

import {
  fetchUserById,
  updateUser,
  fetchRoles,
  getPermissions,
} from "@/app/service/adminAPI";
import { toast } from "react-hot-toast";

const { Title, Text } = Typography;
const { Option } = Select;

// Types based on your API structure
import { User, UpdateUserPayload, UserDetail } from "@/app/types/user";
import { Role } from "@/app/types/role";
import { Permission } from "@/app/types/permission";
import React from "react";

export default function EditUser({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params); // unwrap Promise
  const userId = Number(id);
  const [form] = Form.useForm();
  const router = useRouter();

  const [user, setUser] = useState<UserDetail | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [originalPermissions, setOriginalPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserDetail();
      fetchAllRoles();
      fetchPermissions();
    }
  }, [userId]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        ...user,
        status: user.status
          ? user.status.charAt(0).toUpperCase() +
          user.status.slice(1).toLowerCase()
          : "Active", // default if no status
      });
    }
  }, [user, form]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const data = await fetchUserById(userId);

      if (!data || !data.success || !data.user) {
        toast.error("User not found");
        return;
      }

      const userData = data.user; // ✅ Extract correctly
      setUser(userData);

      // Populate form with existing data
      form.setFieldsValue({
        name: userData.name,
        email: userData.email,
        status: userData.status,
        roleId: userData.role?.id,
      });

      // Set current permissions
      const currentPermissions = userData.role?.permissions || [];
      setSelectedPermissions(currentPermissions);
      setOriginalPermissions(currentPermissions);
    } catch (error) {
      console.error("Error fetching user detail:", error);
      toast.error("Failed to fetch user detail");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRoles = async () => {
    try {
      const data = await fetchRoles();
      setRoles(data?.roles || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const data = await getPermissions();

      // Ensure we always store an array
      const permissions = Array.isArray(data) ? data : data?.permissions || [];

      setAllPermissions(permissions);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setAllPermissions([]); // fallback
    }
  };

  const showUpdateModal = () => setIsUpdateModalVisible(true);
  const hideUpdateModal = () => setIsUpdateModalVisible(false);

  const handleConfirmUpdate = () => {
    hideUpdateModal();
    form.submit();
  };

  const handleSubmit = async (values: UpdateUserPayload) => {
    try {
      setSubmitting(true);

      // Calculate permission changes
      const addPermissions = selectedPermissions.filter(
        (p) => !originalPermissions.includes(p)
      );
      const removePermissions = originalPermissions.filter(
        (p) => !selectedPermissions.includes(p)
      );

      const updateData: UpdateUserPayload = {
        status: values.status,
        roleId: values.roleId,
        addPermissions,
        removePermissions,
      };

      const response = await updateUser(userId, updateData);

      if (response.success) {
        toast.success("User updated successfully!");
        router.push(`/get-user-roles`);
      } else {
        toast.error(response.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = (roleId: number) => {
    const selectedRole = roles.find((role) => role.id === roleId);
    if (selectedRole) {
      const rolePermissions = selectedRole.permissions.map((p) => p.name);
      setSelectedPermissions(rolePermissions);
    }
  };

  const handlePermissionChange = (checkedValues: string[]) => {
    setSelectedPermissions(checkedValues);
  };

  const getPermissionDescription = (name: string) => {
    // Add descriptions based on permission names
    const descriptions: Record<string, string> = {
      user_management: "Allows full access to manage users and accounts",
      case_management: "Allows access to create and manage legal cases",
      client_management: "Allows access to manage client information",
      document_management: "Allows access to manage legal documents",
      billing_management: "Allows access to billing and financial information",
      report_generation: "Allows access to generate and view reports",
    };

    return (
      descriptions[name] ||
      `Allows access to ${name
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())
        .toLowerCase()}`
    );
  };

  const getPermissionChanges = () => {
    const added = selectedPermissions.filter(
      (p) => !originalPermissions.includes(p)
    );
    const removed = originalPermissions.filter(
      (p) => !selectedPermissions.includes(p)
    );
    return { added, removed };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex justify-center items-center transition-colors duration-300">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div
          style={{
            background: "#f8fafc",
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <UserOutlined
              style={{
                fontSize: "64px",
                color: "#9ca3af",
                marginBottom: "16px",
              }}
            />
            <Title level={3} style={{ color: "#64748b" }}>
              User Not Found
            </Title>
            <Text style={{ color: "#64748b", fontSize: "16px" }}>
              The requested user profile could not be found.
            </Text>
            <br />
            <Button
              type="primary"
              onClick={() => router.back()}
              style={{ marginTop: "16px" }}
            >
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { added: addedPermissions, removed: removedPermissions } =
    getPermissionChanges();

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DashboardLayout>
        <div className="min-h-screen transition-colors duration-300 [&_.ant-typography]:dark:!text-white [&_.ant-card-head-title]:dark:!text-white">
          <div className="max-w-full">
            {/* Header Section */}
            <Card
              className="bg-[#3A3A3A] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
              bodyStyle={{ padding: "20px 16px" }}
            >
              <Row align="middle" justify="space-between">
                <Col xs={24} sm={24} md={18} lg={18}>
                  {/* Mobile Layout: Stacked vertically */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
                    {/* Logo */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center border-2 bg-white/15 dark:bg-white/10 border-white/20 dark:border-white/30 flex-shrink-0">
                      <EditOutlined className="text-[24px] sm:text-[28px] md:text-[32px] text-white" />
                    </div>

                    {/* Text Content */}
                    <div className="text-center sm:text-left flex-1">
                      <Title
                        level={1}
                        className="!text-white dark:!text-white !mb-1 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight"
                      >
                        Edit User Profile
                      </Title>
                      <Text className="text-white dark:text-white text-sm sm:text-base md:text-lg font-normal block">
                        Update user roles, permissions and account status
                      </Text>
                    </div>
                  </div>
                </Col>

                {/* Back Button Column */}
                <Col xs={24} sm={24} md={6} lg={6} className="mt-4 md:mt-0">
                  <div className="flex justify-center md:justify-end">
                    <Button
                      icon={<ArrowLeftOutlined />}
                      onClick={() => router.back()}
                      size="large"
                      className="w-full sm:w-auto"
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        borderColor: "rgba(255,255,255,0.3)",
                        color: "white",
                        borderRadius: "12px",
                        fontWeight: "600",
                        padding: "8px 24px",
                        height: "48px",
                        backdropFilter: "blur(10px)",
                      }}
                      ghost
                    >
                      Back
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Edit Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
            >
              <Row gutter={[32, 24]}>
                {/* User Information Section */}
                <Col xs={24} lg={12}>
                  <Card
                    title={
                      <Space>
                        <UserOutlined style={{ color: "#1e40af" }} />
                        <span style={{ color: "#111827", fontWeight: "600" }}>
                          User Information
                        </span>
                      </Space>
                    }
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[20px]"
                    headStyle={{
                      background: "#fafbfc",
                      borderRadius: "16px 16px 0 0",
                    }}
                    bodyStyle={{ padding: "20px 32px" }}
                  >
                    <Row align="middle" gutter={[16, 16]}>
                      <Col>
                        <Avatar size={80} icon={<UserOutlined />} />
                      </Col>
                      <Col flex={1}>
                        <Title
                          level={4}
                          style={{ margin: 0, color: "#111827" }}
                        >
                          {user.name}
                        </Title>
                        <Space direction="vertical" size="small">
                          <Space>
                            <MailOutlined style={{ color: "#9ca3af" }} />
                            <Text style={{ color: "#64748b" }}>
                              {user.email}
                            </Text>
                          </Space>
                        </Space>
                      </Col>
                    </Row>

                    <Divider />

                    <Row gutter={[24, 16]}>
                      {/* Name (Read-only) */}
                      <Col xs={24}>
                        <Form.Item
                          label={
                            <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                              Full Name
                            </span>
                          }
                          name="name"
                        >
                          <Input
                            prefix={
                              <UserOutlined style={{ color: "#9ca3af" }} />
                            }
                            disabled
                            size="large"
                            className="dark:!bg-[#2A3441] dark:!text-white dark:!border-[#4B5563]"
                            style={{
                              border: "1px solid #d1d5db",
                              padding: "12px 16px",
                            }}
                          />
                        </Form.Item>
                      </Col>

                      {/* Email (Read-only) */}
                      <Col xs={24}>
                        <Form.Item
                          label={
                            <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                              Email Address
                            </span>
                          }
                          name="email"
                        >
                          <Input
                            prefix={
                              <MailOutlined style={{ color: "#9ca3af" }} />
                            }
                            disabled
                            size="large"
                            className="dark:!bg-[#2A3441] dark:!text-white dark:!border-[#4B5563]"
                            style={{
                              border: "1px solid #d1d5db",
                              padding: "12px 16px",
                            }}
                          />
                        </Form.Item>
                      </Col>

                      {/* Status */}
                      <Col xs={24}>
                        <Form.Item
                          label={
                            <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                              Account Status
                            </span>
                          }
                          name="status"
                          rules={[
                            { required: true, message: "Please select status" },
                          ]}
                        >
                          <Select
                            placeholder="Select account status"
                            size="large"
                            className="dark:!bg-[#2A3441] dark:!border-[#4B5563] [&_.ant-select-selector]:dark:!bg-[#2A3441] [&_.ant-select-selector]:dark:!border-[#4B5563] [&_.ant-select-selection-item]:dark:!text-white [&_.ant-select-arrow]:dark:!text-white [&_.ant-select-selector]:!min-h-[50px] [&_.ant-select-selector]:!px-4 [&_.ant-select-arrow]:!top-8
                            [&_.ant-select-arrow]:!-translate-y-1/2"
                            dropdownClassName="dark:!bg-[#2A3441] dark:!border-[#4B5563] [&_.ant-select-item]:dark:!bg-[#2A3441] [&_.ant-select-item]:dark:!text-white [&_.ant-select-item-option-selected]:dark:!bg-[#374151] [&_.ant-select-item-option-active]:dark:!bg-[#374151]"
                          >
                            <Option value="Active">
                              <Space>
                                <CheckOutlined style={{ color: "#10b981" }} />
                                Active
                              </Space>
                            </Option>
                            <Option value="Inactive">
                              <Space>
                                <CloseOutlined style={{ color: "#ef4444" }} />
                                Inactive
                              </Space>
                            </Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </Col>

                {/* Role & Permissions Section */}
                <Col xs={24} lg={12}>
                  <Card
                    title={
                      <Space>
                        <TeamOutlined style={{ color: "#1e40af" }} />
                        <span style={{ color: "#111827", fontWeight: "600" }}>
                          Role & Permissions
                        </span>
                      </Space>
                    }
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
                    headStyle={{
                      borderBottom: "1px solid #f1f5f9",
                      background: "#fafbfc",
                      borderRadius: "16px 16px 0 0",
                    }}
                    bodyStyle={{ padding: "20px 32px" }}
                  >
                    {/* Role Selection */}
                    <Form.Item
                      label={
                        <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                          User Role
                        </span>
                      }
                      name="roleId"
                    >
                      <div
                        className="flex items-center gap-2 px-4 py-3 rounded-lg border 
               border-slate-200 dark:border-[#4B5563] 
               bg-white dark:bg-[#2A3441]"
                      >
                        <UserOutlined
                          style={{ color: "#9ca3af", fontSize: "18px" }}
                        />
                        <Text className="text-[16px] dark:text-white font-medium">
                          {user?.role?.name || "No Role Assigned"}
                        </Text>
                      </div>
                    </Form.Item>


                    <Space className="mb-3">
                      <SettingOutlined style={{ color: "#9ca3af" }} />
                      <Text style={{ color: "#64748b", fontSize: "14px" }}>
                        Permissions
                      </Text>
                    </Space>


                    {/* Permissions Selection */}
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                      <div className="space-y-3">
                        {allPermissions.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <CheckCircleOutlined className="text-blue-600 dark:text-blue-400 text-sm" />
                              </div>
                              <div>
                                <Text className="text-slate-900 dark:text-white font-medium">
                                  {permission.name
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </Text>
                                {permission.description && (
                                  <Text className="text-slate-500 dark:text-slate-300 text-xs block">
                                    {permission.description}
                                  </Text>
                                )}
                              </div>
                            </div>
                            <Switch
                              checked={selectedPermissions.includes(
                                permission.name
                              )}
                              onChange={(checked) => {
                                const newPermissions = checked
                                  ? [...selectedPermissions, permission.name]
                                  : selectedPermissions.filter(
                                    (p) => p !== permission.name
                                  );
                                setSelectedPermissions(newPermissions);
                              }}
                              size="small"
                            />
                          </div>
                        ))}
                      </div>

                      {allPermissions.length === 0 && (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                          No permissions available
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Changes Summary - Elegant Design matching Case Summary */}
              {(addedPermissions.length > 0 ||
                removedPermissions.length > 0) && (
                  <div className="!mt-6 bg-gradient-to-br from-blue-50 via-blue-50/80 to-indigo-50/60 dark:from-slate-800/60 dark:via-slate-700/40 dark:to-slate-800/80 border border-blue-200/80 dark:border-slate-600/70 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <EditOutlined className="text-blue-600 dark:text-blue-400 text-lg" />
                      </div>
                      <div>
                        <Title
                          level={4}
                          className="text-slate-800 dark:text-slate-100 !mb-0"
                          style={{
                            fontSize: "18px",
                            fontWeight: 600,
                            letterSpacing: "-0.025em",
                          }}
                        >
                          Permission Changes Summary
                        </Title>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-0">
                          Review changes before updating
                        </p>
                      </div>
                    </div>

                    {/* Changes Content */}
                    <div className="space-y-3">
                      {/* Total Changes Overview */}
                      <div className="flex items-center justify-between group hover:bg-white/60 dark:hover:bg-slate-600/20 rounded-lg p-2 transition-colors duration-150">
                        <Text className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                          Total Changes:
                        </Text>
                        <span className="text-slate-800 dark:text-white font-semibold text-sm bg-slate-100 dark:bg-slate-600/30 px-2 py-1 rounded-md">
                          {addedPermissions.length + removedPermissions.length}{" "}
                          permission
                          {addedPermissions.length + removedPermissions.length !==
                            1
                            ? "s"
                            : ""}
                        </span>
                      </div>

                      {/* Added Permissions */}
                      {addedPermissions.length > 0 && (
                        <div className="flex items-center justify-between group hover:bg-white/60 dark:hover:bg-slate-600/20 rounded-lg p-2 transition-colors duration-150">
                          <Text className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                            To Add:
                          </Text>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">
                            +{addedPermissions.length} permissions
                          </span>
                        </div>
                      )}

                      {/* Removed Permissions */}
                      {removedPermissions.length > 0 && (
                        <div className="flex items-center justify-between group hover:bg-white/60 dark:hover:bg-slate-600/20 rounded-lg p-2 transition-colors duration-150">
                          <Text className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                            To Remove:
                          </Text>
                          <span className="text-red-600 dark:text-red-400 font-semibold text-sm bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md">
                            -{removedPermissions.length} permissions
                          </span>
                        </div>
                      )}

                      {/* Added Permissions Details */}
                      {addedPermissions.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-blue-200/50 dark:border-slate-600/50">
                          <Text className="text-slate-700 dark:text-slate-200 font-medium text-sm block mb-2">
                            Permissions to Add:
                          </Text>
                          <div className="flex flex-wrap gap-2">
                            {addedPermissions.map((perm) => (
                              <Tag
                                key={perm}
                                className="rounded-lg px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-none font-medium text-sm"
                                icon={<CheckOutlined />}
                              >
                                {perm
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Removed Permissions Details */}
                      {removedPermissions.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-blue-200/50 dark:border-slate-600/50">
                          <Text className="text-slate-700 dark:text-slate-200 font-medium text-sm block mb-2">
                            Permissions to Remove:
                          </Text>
                          <div className="flex flex-wrap gap-2">
                            {removedPermissions.map((perm) => (
                              <Tag
                                key={perm}
                                className="rounded-lg px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-none font-medium text-sm line-through opacity-75"
                                icon={<CloseOutlined />}
                              >
                                {perm
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-5 pt-4 border-t border-blue-200/50 dark:border-slate-600/50">
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Permission changes ready for review
                      </p>
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <Card
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mt-[40px] mb-[40px]"
                bodyStyle={{ padding: "16px" }}
              >
                <Row justify="center">
                  <Col xs={24} sm={24} md={20} lg={16}>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:justify-center">
                      <Button
                        size="large"
                        onClick={() => router.back()}
                        className="w-full sm:w-auto order-2 sm:order-1"
                        style={{
                          borderRadius: "12px",
                          border: "1px solid #d1d5db",
                          fontWeight: "600",
                          padding: "12px 32px",
                          height: "48px",
                          color: "#374151",
                        }}
                      >
                        Cancel
                      </Button>

                      <Button
                        type="primary"
                        size="large"
                        icon={<SaveOutlined />}
                        onClick={showUpdateModal}
                        loading={submitting}
                        className="w-full sm:w-auto order-1 sm:order-2"
                        style={{
                          background: "#1e40af",
                          borderColor: "#1e40af",
                          borderRadius: "12px",
                          fontWeight: "600",
                          padding: "12px 32px",
                          height: "48px",
                          boxShadow: "0 4px 12px rgba(30, 64, 175, 0.3)",
                        }}
                      >
                        Update User Profile
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Form>

            {/* Confirmation Modal */}
            <ConfirmationModal
              visible={isUpdateModalVisible}
              entityName={user?.name || "User"}
              action="update"
              onConfirm={handleConfirmUpdate}
              onCancel={hideUpdateModal}
            />
          </div>
        </div>
      </DashboardLayout>
    </ThemeProvider>
  );
}
