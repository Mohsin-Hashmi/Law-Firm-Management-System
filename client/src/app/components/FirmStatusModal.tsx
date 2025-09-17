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

const { Title, Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  firmId: number;
  currentStatus: string;
  onStatusUpdated: (newStatus: string) => void;
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
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to update status");
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
            <Text className={`font-medium capitalize ${getStatusColor(currentStatus)}`}>
              {currentStatus}
            </Text>
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
          <Select
            style={{ width: "100%", height: "40px" }}
            value={status}
            onChange={(value) => setStatus(value)}
            className="rounded-lg"
            options={[
              {
                value: "active",
                label: (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Active</span>
                  </div>
                ),
              },
              {
                value: "suspended",
                label: (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span>Suspended</span>
                  </div>
                ),
              },
              {
                value: "terminated",
                label: (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>Terminated</span>
                  </div>
                ),
              },
            ]}
          />
          
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