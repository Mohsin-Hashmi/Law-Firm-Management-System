import React, { useState, useEffect } from "react";
import {
  Modal,
  Input,
  Form,
  Spin,
  message,
  Typography,
  Space,
  Button,
  Switch,
  Divider,
} from "antd";
import {
  IeOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { getPermissions } from "../service/adminAPI";
import { createRole } from "../service/adminAPI";
import { toast } from "react-hot-toast";

const { Title, Text } = Typography;

// Define permission type
interface Permission {
  id: number;
  name: string;
}

// Props for RoleModal
interface RoleModalProps {
  visible: boolean;
  onClose: () => void;
  onRoleCreated: (newRole: string) => void;
}

const RoleModal: React.FC<RoleModalProps> = ({
  visible,
  onClose,
  onRoleCreated,
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPerms, setSelectedPerms] = useState<Record<string, boolean>>({});
  const [roleName, setRoleName] = useState<string>("");

  useEffect(() => {
    const fetchPermissions = async () => {
      setLoading(true);
      try {
        const res = await getPermissions();
        setPermissions(res.permissions);
        // Initialize all permissions as false
        const initialPerms: Record<string, boolean> = {};
        res.permissions.forEach((perm: Permission) => {
          initialPerms[perm.name] = false;
        });
        setSelectedPerms(initialPerms);
      } catch (err) {
        console.error(err);
        message.error("Failed to fetch permissions");
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchPermissions();
      setRoleName("");
    }
  }, [visible]);

  const handlePermissionToggle = (permissionName: string, checked: boolean) => {
    setSelectedPerms(prev => ({
      ...prev,
      [permissionName]: checked
    }));
  };

  const handleSubmit = async () => {
    if (!roleName.trim()) {
      message.error("Role name is required");
      return;
    }
    
    const enabledPermissions = Object.keys(selectedPerms).filter(
      key => selectedPerms[key]
    );
    
    if (enabledPermissions.length === 0) {
      message.error("Please enable at least one permission");
      return;
    }

    try {
    
       await createRole({ name: roleName, permissions: enabledPermissions });
      
      toast.success("Role created successfully");
      setRoleName("");
      setSelectedPerms({});
      onRoleCreated(roleName);
      onClose();
    } catch (err) {
      console.error(err);
      message.error("Failed to create role");
    }
  };

  const handleCancel = () => {
    setRoleName("");
    setSelectedPerms({});
    onClose();
  };

  const formatPermissionName = (name: string) => {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPermissionDescription = (name: string) => {
    // Add descriptions based on permission names
    const descriptions: Record<string, string> = {
      'user_management': 'Allows full access to manage users and accounts',
      'case_management': 'Allows access to create and manage legal cases',
      'client_management': 'Allows access to manage client information',
      'document_management': 'Allows access to manage legal documents',
      'billing_management': 'Allows access to billing and financial information',
      'report_generation': 'Allows access to generate and view reports',
    };
    
    return descriptions[name] || `Allows access to ${formatPermissionName(name).toLowerCase()}`;
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      centered
      closeIcon={<CloseOutlined className="text-slate-400 hover:text-slate-600" />}
      className="role-management-modal"
      style={{
        padding: "5px 10px"
      }}
    >
      <div className="">
        {/* Header */}
        <div className="mb-3">
          <Space size="middle" className="mb-1">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <IeOutlined className="text-blue-600 dark:text-blue-400 text-lg" />
            </div>
            <div>
              <Title level={4} className="!text-slate-900 dark:!text-white !mb-1">
                Create New Role
              </Title>
              <Text className="text-slate-500 dark:text-slate-300 text-sm">
                Define role name and permissions
              </Text>
            </div>
          </Space>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Spin size="large" />
              <div className="mt-3">
                <Text className="text-slate-600 dark:text-slate-400">
                  Loading permissions...
                </Text>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Role Name Input */}
            <div className="mb-3">
              <Text className="text-slate-700 dark:!text-slate-300 font-medium mb-2 block">
                Role Name
              </Text>
              <Input
                placeholder="Enter role name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className=" rounded-lg p-3 dark:bg-slate-700 dark:text-white"
                prefix={<UserOutlined className="text-slate-400 dark:text-slate-300" />}
              />
             
            </div>

            <Divider className="border-slate-200 dark:border-slate-600 my-4" />

            {/* Permissions List */}
            <div>
              <Text className="text-slate-700 dark:text-slate-300 font-medium mb-4 block">
                Permissions
              </Text>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <IeOutlined className="text-blue-600 dark:text-blue-400 text-sm" />
                      </div>
                      <div>
                        <Text className="text-slate-900 dark:text-white font-medium">
                          {formatPermissionName(permission.name)}
                        </Text>
                        <Text className="text-slate-500 dark:text-slate-300 text-xs block">
                          {getPermissionDescription(permission.name)}
                        </Text>
                      </div>
                    </div>
                    <Switch
                      checked={selectedPerms[permission.name] || false}
                      onChange={(checked) => handlePermissionToggle(permission.name, checked)}
                      size="small"
                    />
                  </div>
                ))}
              </div>

              {permissions.length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  No permissions available
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
          <Button
            onClick={handleCancel}
            className="h-9 px-4 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            disabled={!roleName.trim() || Object.values(selectedPerms).every(v => !v)}
            icon={<CheckCircleOutlined />}
            className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 dark:text-white"
          >
            Save changes
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RoleModal;