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
        router.push(`/get-user-detail/${userId}`);
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
              bodyStyle={{ padding: "32px" }}
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
                      <EditOutlined
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
                        Edit User Profile
                      </Title>
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: "18px",
                          fontWeight: "400",
                        }}
                      >
                        Update user roles, permissions and account status
                      </Text>
                    </div>
                  </Space>
                </Col>
                <Col>
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.back()}
                    size="large"
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
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
                    headStyle={{
                      borderBottom: "1px solid #f1f5f9",
                      background: "#fafbfc",
                      borderRadius: "16px 16px 0 0",
                    }}
                    bodyStyle={{ padding: "32px" }}
                  >
                    <Row
                      align="middle"
                      gutter={[16, 16]}
                      style={{ marginBottom: "24px" }}
                    >
                      <Col>
                        <Avatar
                          size={80}
                          icon={<UserOutlined />}
                          style={{
                            background: "#f1f5f9",
                            border: "2px solid #e5e7eb",
                          }}
                        />
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
                            className="dark:!bg-[#2A3441] dark:!border-[#4B5563] [&_.ant-select-selector]:dark:!bg-[#2A3441] [&_.ant-select-selector]:dark:!border-[#4B5563] [&_.ant-select-selection-item]:dark:!text-white [&_.ant-select-arrow]:dark:!text-white [&_.ant-select-selector]:!min-h-[50px] [&_.ant-select-selector]:!px-4"
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
                    bodyStyle={{ padding: "32px" }}
                  >
                    {/* Role Selection */}
                    <Form.Item
                      label={
                        <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                          User Role
                        </span>
                      }
                      name="roleId"
                      rules={[
                        { required: true, message: "Please select a role" },
                      ]}
                    >
                      <Select
                        placeholder="Select user role"
                        size="large"
                        optionLabelProp="label" // 👈 show label instead of id
                        onChange={handleRoleChange}
                        className="dark:!bg-[#2A3441] dark:!border-[#4B5563] [&_.ant-select-selector]:dark:!bg-[#2A3441] [&_.ant-select-selector]:dark:!border-[#4B5563] [&_.ant-select-selection-item]:dark:!text-white [&_.ant-select-arrow]:dark:!text-white [&_.ant-select-selector]:!min-h-[50px] [&_.ant-select-selector]:!px-4"
                        dropdownClassName="dark:!bg-[#2A3441] dark:!border-[#4B5563] [&_.ant-select-item]:dark:!bg-[#2A3441] [&_.ant-select-item]:dark:!text-white [&_.ant-select-item-option-selected]:dark:!bg-[#374151] [&_.ant-select-item-option-active]:dark:!bg-[#374151]"
                        suffixIcon={
                          <TeamOutlined style={{ color: "#9ca3af" }} />
                        }
                      >
                        {roles && roles.length > 0 ? (
                          roles.map((role) => (
                            <Option
                              key={role.id}
                              value={role.id}
                              label={role.name}
                            >
                              {" "}
                              {/* 👈 add label */}
                              <Space direction="vertical" size="small">
                                <Text strong>{role.name}</Text>
                                <Text
                                  style={{ fontSize: "12px", color: "#64748b" }}
                                >
                                  {role.permissions?.length || 0} permissions
                                </Text>
                              </Space>
                            </Option>
                          ))
                        ) : (
                          <Option disabled>No roles available</Option>
                        )}
                      </Select>
                    </Form.Item>

                    <Divider orientation="left">
                      <Space>
                        <SettingOutlined style={{ color: "#9ca3af" }} />
                        <Text style={{ color: "#64748b", fontSize: "14px" }}>
                          Custom Permissions
                        </Text>
                      </Space>
                    </Divider>

                    {/* Permissions Selection */}
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                      <Checkbox.Group
                        value={selectedPermissions}
                        onChange={handlePermissionChange}
                        style={{ width: "100%" }}
                      >
                        <Row gutter={[8, 8]}>
                          {allPermissions.map((permission) => (
                            <Col xs={24} key={permission.id}>
                              <Checkbox
                                value={permission.name}
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  margin: 0,
                                  borderRadius: "6px",
                                  border: selectedPermissions.includes(
                                    permission.name
                                  )
                                    ? "1px solid #1e40af"
                                    : "1px solid #e5e7eb",
                                  background: selectedPermissions.includes(
                                    permission.name
                                  )
                                    ? "#eff6ff"
                                    : "transparent",
                                }}
                              >
                                <Space direction="vertical" size="small">
                                  <Text
                                    style={{
                                      fontWeight: selectedPermissions.includes(
                                        permission.name
                                      )
                                        ? "600"
                                        : "400",
                                      color: selectedPermissions.includes(
                                        permission.name
                                      )
                                        ? "#1e40af"
                                        : "#374151",
                                    }}
                                  >
                                    {permission.name}
                                  </Text>
                                  {permission.description && (
                                    <Text
                                      style={{
                                        fontSize: "12px",
                                        color: "#64748b",
                                      }}
                                    >
                                      {permission.description}
                                    </Text>
                                  )}
                                </Space>
                              </Checkbox>
                            </Col>
                          ))}
                        </Row>
                      </Checkbox.Group>
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Changes Summary */}
              {(addedPermissions.length > 0 ||
                removedPermissions.length > 0) && (
                <Card
                  title={
                    <Space>
                      <EditOutlined style={{ color: "#1e40af" }} />
                      <span style={{ color: "#111827", fontWeight: "600" }}>
                        Permission Changes Summary
                      </span>
                    </Space>
                  }
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
                  headStyle={{
                    borderBottom: "1px solid #f1f5f9",
                    background: "#fafbfc",
                    borderRadius: "16px 16px 0 0",
                  }}
                  bodyStyle={{ padding: "32px" }}
                >
                  <Row gutter={[24, 16]}>
                    {addedPermissions.length > 0 && (
                      <Col xs={24} md={12}>
                        <Space
                          direction="vertical"
                          size="small"
                          style={{ width: "100%" }}
                        >
                          <Text strong style={{ color: "#059669" }}>
                            Permissions to Add ({addedPermissions.length})
                          </Text>
                          <Space wrap>
                            {addedPermissions.map((perm) => (
                              <Tag
                                key={perm}
                                color="success"
                                icon={<CheckOutlined />}
                              >
                                {perm}
                              </Tag>
                            ))}
                          </Space>
                        </Space>
                      </Col>
                    )}
                    {removedPermissions.length > 0 && (
                      <Col xs={24} md={12}>
                        <Space
                          direction="vertical"
                          size="small"
                          style={{ width: "100%" }}
                        >
                          <Text strong style={{ color: "#dc2626" }}>
                            Permissions to Remove ({removedPermissions.length})
                          </Text>
                          <Space wrap>
                            {removedPermissions.map((perm) => (
                              <Tag
                                key={perm}
                                color="error"
                                icon={<CloseOutlined />}
                              >
                                {perm}
                              </Tag>
                            ))}
                          </Space>
                        </Space>
                      </Col>
                    )}
                  </Row>
                </Card>
              )}

              {/* Action Buttons */}
              <Card
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mt-[40px] mb-[40px]"
                bodyStyle={{ padding: "24px" }}
              >
                <Row justify="center">
                  <Col>
                    <Space size="large">
                      <Button
                        size="large"
                        onClick={() => router.back()}
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
                    </Space>
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
