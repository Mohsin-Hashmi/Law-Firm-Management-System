"use client";
import { Modal, Typography, Space, Button } from "antd";
import {
  ExclamationCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  WarningOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface ConfirmationModalProps {
  visible: boolean;
  entityName: string; // e.g., "Lawyer", "Client", "Case"
  action: "delete" | "update" | "create" | string; // any action
  onConfirm: () => void;
  onCancel: () => void;
  /** New props */
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal = ({
  visible,
  entityName,
  action,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText,
  cancelText,
}: ConfirmationModalProps) => {
  const actionText =
    action === "delete" ? "delete" : action === "update" ? "update" : action;

  // Icon and button color config
  const getActionConfig = () => {
    switch (action) {
      case "delete":
        return {
          icon: (
            <DeleteOutlined className="text-red-600 dark:text-red-400 text-lg" />
          ),
          bgColor: "bg-red-100 dark:bg-red-500/30",
          buttonColor: "bg-red-600 hover:bg-red-700",
          isDanger: true,
        };
      case "update":
        return {
          icon: (
            <EditOutlined className="text-blue-600 dark:text-blue-400 text-lg" />
          ),
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
          buttonColor: "bg-blue-600 hover:bg-blue-700",
          isDanger: false,
        };
      default:
        return {
          icon: (
            <WarningOutlined className="text-yellow-600 dark:text-yellow-400 text-lg" />
          ),
          bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
          buttonColor: "bg-yellow-600 hover:bg-yellow-700",
          isDanger: false,
        };
    }
  };

  const config = getActionConfig();

  // Default fallback messages
  const getDefaultMessage = () => {
    switch (action) {
      case "delete":
        return "This action cannot be undone. All associated data will be permanently removed.";
      case "update":
        return "This will modify the existing information. Please confirm to proceed.";
      case "create":
        return "Are you sure you want to create this new record? Please confirm to proceed.";
      default:
        return "Please confirm to proceed with this action.";
    }
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={480}
      centered
      closeIcon={
        <CloseOutlined className="text-slate-400 hover:text-slate-600" />
      }
      className="confirmation-modal"
      maskStyle={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
    >
      <div className="p-2">
        {/* Header */}
        <div className="mb-6">
          <Space size="middle" className="mb-4">
            <div
              className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center`}
            >
              {config.icon}
            </div>
            <div>
              <Title
                level={4}
                className="!text-slate-900 dark:!text-white !mb-1"
              >
                {title ||
                  `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} ${
                    entityName
                  }?`}
              </Title>
              <Text className="text-slate-500 dark:text-slate-400 text-sm">
                Please confirm your action
              </Text>
            </div>
          </Space>
        </div>

        {/* Content */}
        <div className="mb-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
          <Text className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
            {description
              ? description
              : `Are you sure you want to ${actionText} this ${entityName.toLowerCase()}?`}
          </Text>
          <br />
          <Text className="text-slate-500 dark:text-slate-400 text-sm mt-2 block">
            {description ? "" : getDefaultMessage()}
          </Text>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-600">
          <Button
            onClick={onCancel}
            className="h-10 px-5 rounded-lg"
            size="middle"
          >
            {cancelText || "Cancel"}
          </Button>
          <Button
            type="primary"
            onClick={onConfirm}
            danger={config.isDanger}
            icon={
              config.isDanger ? <DeleteOutlined /> : <CheckCircleOutlined />
            }
            className={`h-10 px-5 rounded-lg ${
              !config.isDanger ? config.buttonColor : ""
            }`}
            size="middle"
          >
            {confirmText ||
              actionText.charAt(0).toUpperCase() + actionText.slice(1)}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
