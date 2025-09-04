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
  action: "delete" | "update" | string; // any action
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal = ({
  visible,
  entityName,
  action,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  const actionText =
    action === "delete"
      ? "delete"
      : action === "update"
      ? "update"
      : action;

  // Get appropriate icon and color based on action
  const getActionConfig = () => {
    switch (action) {
      case "delete":
        return {
          icon: <DeleteOutlined className="text-red-600 dark:text-red-400 text-lg" />,
          bgColor: "bg-red-100 dark:bg-red-900/30",
          buttonColor: "bg-red-600 hover:bg-red-700",
          isDanger: true,
        };
      case "update":
        return {
          icon: <EditOutlined className="text-blue-600 dark:text-blue-400 text-lg" />,
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
          buttonColor: "bg-blue-600 hover:bg-blue-700",
          isDanger: false,
        };
      default:
        return {
          icon: <WarningOutlined className="text-yellow-600 dark:text-yellow-400 text-lg" />,
          bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
          buttonColor: "bg-yellow-600 hover:bg-yellow-700",
          isDanger: false,
        };
    }
  };

  const config = getActionConfig();

  const getActionMessage = () => {
    switch (action) {
      case "delete":
        return "This action cannot be undone. All associated data will be permanently removed.";
      case "update":
        return "This will modify the existing information. Please confirm to proceed.";
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
      closeIcon={<CloseOutlined className="text-slate-400 hover:text-slate-600" />}
      className="confirmation-modal"
    >
      <div className="p-2">
        {/* Header */}
        <div className="mb-6">
          <Space size="middle" className="mb-4">
            <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center`}>
              {config.icon}
            </div>
            <div>
              <Title level={4} className="!text-slate-900 dark:!text-white !mb-1">
                {`${actionText.charAt(0).toUpperCase() + actionText.slice(1)} ${entityName}?`}
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
            Are you sure you want to <strong>{actionText}</strong> this {entityName.toLowerCase()}?
          </Text>
          <br />
          <Text className="text-slate-500 dark:text-slate-400 text-sm mt-2 block">
            {getActionMessage()}
          </Text>
        </div>

        {/* Entity Info (Optional visual enhancement) */}
        <div className="mb-6 p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <ExclamationCircleOutlined className="text-slate-500 dark:text-slate-400 text-sm" />
            </div>
            <div>
              <Text className="text-slate-900 dark:text-white font-medium">
                {entityName}
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-xs block">
                Selected item for {actionText}
              </Text>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-600">
          <Button
            onClick={onCancel}
            className="h-10 px-5 rounded-lg"
            size="middle"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={onConfirm}
            danger={config.isDanger}
            icon={config.isDanger ? <DeleteOutlined /> : <CheckCircleOutlined />}
            className={`h-10 px-5 rounded-lg ${!config.isDanger ? config.buttonColor : ''}`}
            size="middle"
          >
            {actionText.charAt(0).toUpperCase() + actionText.slice(1)}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;