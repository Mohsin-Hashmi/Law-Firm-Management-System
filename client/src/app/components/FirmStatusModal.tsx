"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Select,
  message,
  Typography,
  Space,
  Button,
  Divider,
} from "antd";
import {
  BankOutlined,
  CheckCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { updateFirmStatus } from "@/app/service/superAdminAPI";
import toast from "react-hot-toast";
import { DownOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

interface Props {
  open: boolean;
  onClose: () => void;
  firmId: number;
  currentStatus: string;
  onStatusUpdated: (newStatus: string) => void;
}

interface CustomSelectProps {
  isDarkMode: boolean;
  children: React.ReactNode;
  [key: string]: unknown;
}

const FirmStatusModal: React.FC<Props> = ({
  open,
  onClose,
  firmId,
  currentStatus,
  onStatusUpdated,
}) => {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode
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

  useEffect(() => {
    if (open) {
      setStatus(currentStatus);
    }
  }, [open, currentStatus]);

  const handleUpdate = async () => {
    if (status === currentStatus) {
      message.info("No changes made to the status");
      onClose();
      return;
    }

    try {
      setLoading(true);
      const res = await updateFirmStatus(firmId, status);
      message.success(res.message || "Status updated successfully");
      onStatusUpdated(status);
      onClose();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setStatus(currentStatus);
    onClose();
  };

  const getStatusColor = (statusValue: string) => {
    switch (statusValue) {
      case "active":
        return "text-green-600 dark:text-green-400";
      case "suspended":
        return "text-yellow-600 dark:text-yellow-400";
      case "terminated":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-slate-600 dark:text-slate-400";
    }
  };

  const getStatusDescription = (statusValue: string) => {
    switch (statusValue) {
      case "active":
        return "Firm is operational and can access all features";
      case "suspended":
        return "Firm access is temporarily restricted";
      case "terminated":
        return "Firm account has been permanently deactivated";
      default:
        return "";
    }
  };

  const getStatusDotColor = (statusValue: string) => {
    switch (statusValue) {
      case "active":
        return "bg-green-500";
      case "suspended":
        return "bg-yellow-500";
      case "terminated":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
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

  // Custom Select component with proper theming
  const CustomSelect = ({
    children,
    isDarkMode,
    ...props
  }: CustomSelectProps) => {
    return (
      <Select
        {...props}
        className={`w-full ${
          isDarkMode ? "dark-mode-select" : "light-mode-select"
        }`}
        style={{ height: "40px" }}
        dropdownStyle={getDropdownStyle()}
        dropdownClassName={isDarkMode ? "dark-dropdown" : "light-dropdown"}
      >
        {children}
      </Select>
    );
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={450}
      centered
      closeIcon={<CloseOutlined className="text-slate-400 hover:text-slate-600" />}
      className="firm-status-modal"
      style={{
        padding: "5px 10px"
      }}
    >
      <div className="">
        {/* Custom CSS Styles */}
        <style>
          {`
            /* Light mode select */
            .light-mode-select .ant-select-selector {
              background-color: white !important;
              border-color: rgb(203 213 225) !important;
              color: rgb(15 23 42) !important;
            }
            .light-mode-select .ant-select-selection-placeholder {
              color: rgb(100 116 139) !important;
            }
            .light-mode-select .ant-select-selection-item {
              color: rgb(15 23 42) !important;
            }
            .light-dropdown .ant-select-item {
              color: #1e293b !important;
              background-color: white !important;
            }
            .light-dropdown .ant-select-item:hover {
              background-color: #f1f5f9 !important;
            }
            .light-dropdown .ant-select-item-option-selected {
              background-color: #e2e8f0 !important;
            }
            
            /* Dark mode select */
            .dark-mode-select .ant-select-selector {
              background-color: rgb(51 65 85) !important;
              border-color: rgb(71 85 105) !important;
              color: white !important;
            }
            .dark-mode-select .ant-select-selection-placeholder {
              color: rgb(148 163 184) !important;
            }
            .dark-mode-select .ant-select-selection-item {
              color: white !important;
            }
            .dark-dropdown .ant-select-item {
              color: #e2e8f0 !important;
              background-color: rgb(30 41 59) !important;
            }
            .dark-dropdown .ant-select-item:hover {
              background-color: rgb(51 65 85) !important;
            }
            .dark-dropdown .ant-select-item-option-selected {
              background-color: rgb(71 85 105) !important;
            }
          `}
        </style>

        {/* Header */}
        <div className="mb-3">
          <Space size="middle" className="mb-1">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <BankOutlined className="text-blue-600 dark:text-blue-400 text-lg" />
            </div>
            <div>
              <Title level={4} className="!text-slate-900 dark:!text-white !mb-1">
                Update Firm Status
              </Title>
              <Text className="text-slate-500 dark:text-slate-400 text-sm">
                Change the operational status of this firm
              </Text>
            </div>
          </Space>
        </div>

        <Divider className="border-slate-200 dark:border-slate-600 my-4" />

        {/* Current Status Display */}
        <div className="mb-4">
          <Text className="text-slate-700 dark:text-slate-300 font-medium mb-2 block">
            Current Status
          </Text>
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusDotColor(currentStatus)}`}></div>
              <Text className={`font-medium capitalize ${getStatusColor(currentStatus)}`}>
                {currentStatus}
              </Text>
            </div>
            <Text className="text-slate-500 dark:text-slate-400 text-xs block mt-1">
              {getStatusDescription(currentStatus)}
            </Text>
          </div>
        </div>

        {/* Status Selection */}
        <div className="mb-6">
          <Text className="text-slate-700 dark:text-slate-300 font-medium mb-2 block">
            New Status
          </Text>
          <CustomSelect
            isDarkMode={isDarkMode}
            value={status}
            onChange={(value: string) => setStatus(value)}
            placeholder="Select new status"
            suffixIcon={<DownOutlined className="text-slate-300" />}
          >
            <Option value="active">
              <div className="flex items-center space-x-2 py-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className={isDarkMode ? "text-slate-200" : "text-slate-800"}>
                  Active
                </span>
              </div>
            </Option>
            <Option value="suspended">
              <div className="flex items-center space-x-2 py-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className={isDarkMode ? "text-slate-200" : "text-slate-800"}>
                  Suspended
                </span>
              </div>
            </Option>
            <Option value="terminated">
              <div className="flex items-center space-x-2 py-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className={isDarkMode ? "text-slate-200" : "text-slate-800"}>
                  Terminated
                </span>
              </div>
            </Option>
          </CustomSelect>
          
          {/* Status Description */}
          {status && (
            <div className="mt-2 p-2 rounded-md bg-slate-100 dark:bg-slate-600">
              <Text className="text-slate-600 dark:text-slate-300 text-xs">
                {getStatusDescription(status)}
              </Text>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-600">
          <Button
            onClick={handleCancel}
            className="h-9 px-4 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleUpdate}
            loading={loading}
            disabled={status === currentStatus}
            icon={<CheckCircleOutlined />}
            className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 dark:text-white"
          >
            Update Status
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FirmStatusModal;