import React, { useState, useEffect } from "react";
import {
  Modal,
  Input,
  Spin,
  message,
  Typography,
  Button,
  Select,
  Space,
  Divider,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  TeamOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { assignRole, fetchRoles } from "../service/adminAPI";
import { AssignRolePayload } from "../types/role";
import { toast } from "react-hot-toast";

const { Title, Text } = Typography;
const { Option } = Select;

interface Role {
  id: number;
  name: string;
}

interface AssignRoleModalProps {
  visible: boolean;
  onClose: () => void;
  onRoleAssigned: (assignedUser: AssignRolePayload) => void;
}

const AssignRoleModal: React.FC<AssignRoleModalProps> = ({
  visible,
  onClose,
  onRoleAssigned,
}) => {
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState<AssignRolePayload>({
    name: "",
    email: "",
    roleId: null as unknown as number,
  });

  // Fetch roles when modal opens
  useEffect(() => {
    if (visible) {
      setFormData({ name: "", email: "", roleId: null as unknown as number });

      const getRoles = async () => {
        setRolesLoading(true);
        try {
          const res = await fetchRoles();
          if (res.success) {
            setRoles(res.roles);
          }
        } catch (err) {
          console.error(err);
          message.error("Failed to load roles");
        } finally {
          setRolesLoading(false);
        }
      };

      getRoles();
    }
  }, [visible]);

  const handleInputChange = (
    field: keyof AssignRolePayload,
    value: string | number | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return message.error("User name is required");
    if (!formData.email.trim()) return message.error("Email is required");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email))
      return message.error("Please enter a valid email address");

    if (!formData.roleId) return message.error("Please select a role");

    setLoading(true);
    try {
      await assignRole(formData);
      toast.success("Role assigned successfully");

      onRoleAssigned(formData);
      setFormData({ name: "", email: "", roleId: null as unknown as number });
      onClose();
    } catch (err) {
      console.error(err);
      message.error("Failed to assign role");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", email: "", roleId: null as unknown as number });
    onClose();
  };

  const formatRoleName = (name: string) => {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const isFormValid = formData.name.trim() && formData.email.trim() && formData.roleId;

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      centered
      closeIcon={<CloseOutlined className="text-slate-400 hover:text-slate-600" />}
      className="assign-role-modal"
      style={{
        padding: "5px 10px"
      }}
    >
      <div className="">
        {/* Header */}
        <div className="mb-3">
          <Space size="middle" className="mb-1">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <UserAddOutlined className="text-green-600 dark:text-green-400 text-lg" />
            </div>
            <div>
              <Title level={4} className="!text-slate-900 dark:!text-white !mb-1">
                Assign Role to User
              </Title>
              <Text className="text-slate-500 dark:text-slate-400 text-sm">
                Add a new user and assign them a role
              </Text>
            </div>
          </Space>
        </div>

        {rolesLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Spin size="large" />
              <div className="mt-3">
                <Text className="text-slate-600 dark:text-slate-400">
                  Loading roles...
                </Text>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* User Details Section */}
            <div className="mb-4">
              <Text className="text-slate-700 dark:text-slate-300 font-medium mb-3 block">
                User Information
              </Text>
              
              <div className="space-y-3">
                {/* Full Name Input */}
                <div>
                  <Text className="text-slate-600 dark:text-slate-400 text-sm mb-1 block">
                    Full Name
                  </Text>
                  <Input
                    placeholder="Enter user's full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="h-10 rounded-lg"
                    prefix={<UserOutlined className="text-slate-400" />}
                  />
                </div>

                {/* Email Input */}
                <div>
                  <Text className="text-slate-600 dark:text-slate-400 text-sm mb-1 block">
                    Email Address
                  </Text>
                  <Input
                    placeholder="Enter user's email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="h-10 rounded-lg"
                    prefix={<MailOutlined className="text-slate-400" />}
                  />
                </div>
              </div>
            </div>

            <Divider className="border-slate-200 dark:border-slate-600 my-4" />

            {/* Role Selection Section */}
            <div className="mb-4">
              <Text className="text-slate-700 dark:text-slate-300 font-medium mb-3 block">
                Role Assignment
              </Text>
              
              <div>
                <Text className="text-slate-600 dark:text-slate-400 text-sm mb-1 block">
                  Select Role
                </Text>
                <Select
                  placeholder="Choose a role for the user"
                  value={formData.roleId || undefined}
                  onChange={(value) => handleInputChange("roleId", value)}
                  className="w-full h-10"
                  suffixIcon={<TeamOutlined className="text-slate-400" />}
                  dropdownStyle={{
                    borderRadius: '8px',
                  }}
                >
                  {roles.map((role) => (
                    <Option key={role.id} value={role.id}>
                      <div className="flex items-center space-x-2 py-1">
                        <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <TeamOutlined className="text-blue-600 dark:text-blue-400 text-xs" />
                        </div>
                        <Text className="text-slate-800 dark:text-slate-200">
                          {formatRoleName(role.name)}
                        </Text>
                      </div>
                    </Option>
                  ))}
                </Select>
                
                {roles.length === 0 && (
                  <div className="mt-2 p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700">
                    <Text className="text-slate-500 dark:text-slate-400 text-sm">
                      No roles available. Please create roles first.
                    </Text>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Section */}
            {isFormValid && (
              <>
                <Divider className="border-slate-200 dark:border-slate-600 my-4" />
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700">
                  <Text className="text-slate-700 dark:text-slate-300 font-medium text-sm block mb-2">
                    Assignment Preview
                  </Text>
                  <div className="flex items-center justify-between">
                    <div>
                      <Text className="text-slate-900 dark:text-white font-medium text-sm">
                        {formData.name}
                      </Text>
                      <Text className="text-slate-500 dark:text-slate-400 text-xs block">
                        {formData.email}
                      </Text>
                    </div>
                    <div className="text-right">
                      <Text className="text-slate-700 dark:text-slate-300 font-medium text-sm">
                        {formatRoleName(roles.find(r => r.id === formData.roleId)?.name || "")}
                      </Text>
                      <Text className="text-slate-500 dark:text-slate-400 text-xs">
                        Role
                      </Text>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
          <Button
            onClick={handleCancel}
            className="h-9 px-4 rounded-lg"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={!isFormValid || rolesLoading}
            icon={!loading && <CheckCircleOutlined />}
            className="h-9 px-4 rounded-lg bg-green-600 hover:bg-green-700 dark:text-white"
          >
            {loading ? "Assigning Role..." : "Assign Role"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AssignRoleModal;