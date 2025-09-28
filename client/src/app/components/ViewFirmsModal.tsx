import React, { useState, useEffect } from "react";
import {
  Modal,
  Spin,
  message,
  Typography,
  Button,
  Space,
  Card,
  Tag,
  Empty,
} from "antd";
import {
  BankOutlined,
  CloseOutlined,
  EyeOutlined,
  DeleteOutlined,
  PhoneOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { getMyFirms, deleteFirm } from "../service/adminAPI";
import { toast } from "react-hot-toast";
import ConfirmationModal from "./ConfirmationModal";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { useRouter } from "next/navigation";
import { RootState } from "../store/store";
import { setFirm, clearFirm } from "../store/firmSlice";
import { updateUserFirms, switchFirm } from "../store/userSlice"; // Add this import
import { FirmStats, FirmPayload } from "../types/firm";

const { Title, Text } = Typography;

interface ViewFirmsModalProps {
  visible: boolean;
  onClose: () => void;
  onFirmDeleted?: (firmId: number) => void;
}

// ✅ Mapper function (outside the component)
const mapFirmPayloadToStats = (payload: FirmPayload): FirmStats => ({
  firmId: payload.id ?? 0,
  firmName: payload.name,
  lawyersCount: 0,
  clientsCount: 0,
  casesCount: 0,
  totalUsersCount: 0,
  activeLawyersCount: 0,
  subscription_plan: payload.subscription_plan,
  phone: payload.phone ?? "",
  status: payload.status ?? "Active",
  stats: {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  },
});

const ViewFirmsModal: React.FC<ViewFirmsModalProps> = ({
  visible,
  onClose,
  onFirmDeleted,
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const currentFirm = useAppSelector((state: RootState) => state.firm.firm);
  const user = useAppSelector((state: RootState) => state.user.user); // Add this to get user data
  const [loading, setLoading] = useState(false);
  const [firms, setFirms] = useState<FirmStats[]>([]);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedFirm, setSelectedFirm] = useState<FirmStats | null>(null);

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

  // Fetch firms when modal opens
  useEffect(() => {
    if (visible) {
      fetchFirms();
    }
  }, [visible]);

  const fetchFirms = async () => {
    setLoading(true);
    try {
      const firmsData: FirmPayload[] = await getMyFirms();
      const mappedFirms: FirmStats[] = firmsData.map(mapFirmPayloadToStats);
      setFirms(mappedFirms);
    } catch (err) {
      console.error("Error fetching firms:", err);
      message.error("Failed to load firms");
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = (firm: FirmStats) => {
    setSelectedFirm(firm);
    setConfirmVisible(true);
  };

  const handleDeleteFirm = async (firmId: number) => {
    setDeletingIds((prev) => new Set([...prev, firmId]));

    try {
      await deleteFirm(firmId);

      // Remove from local firms state
      const remainingFirms = firms.filter((firm) => firm.firmId !== firmId);
      setFirms(remainingFirms);

      // 🔑 Update Redux user.firms (so dropdown updates)
      const updatedUserFirms = remainingFirms.map((f) => ({
        id: f.firmId,
        name: f.firmName,
      }));
      dispatch(updateUserFirms(updatedUserFirms));

      // Handle current firm logic
      if (currentFirm?.firmId === firmId) {
        if (remainingFirms.length > 0) {
          // Switch to the first available firm
          const firstFirm = remainingFirms[0];
          const newFirmData = {
            firmId: firstFirm.firmId,
            firmName: firstFirm.firmName,
            subscription_plan: firstFirm.subscription_plan,
            phone: firstFirm.phone,
            status: firstFirm.status,
          };
          dispatch(setFirm(newFirmData));
          dispatch(switchFirm(firstFirm.firmId)); // Update currentFirmId in user slice
          router.push("/dashboard");
        } else {
          // No firms left
          dispatch(clearFirm());
          router.push("/dashboard");
        }
      }

      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(firmId);
        return newSet;
      });

      toast.success("Firm deleted successfully");
      onFirmDeleted?.(firmId);

      // 🔑 Auto-close modal if no firms left or if only one firm remains
      if (remainingFirms.length <= 1) {
        setTimeout(() => {
          onClose();
        }, 1000); // Close after 1 second to show success message
      }

    } catch (err) {
      console.error("Error deleting firm:", err);
      message.error("Failed to delete firm");
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(firmId);
        return newSet;
      });
    }
  };

  const getSubscriptionColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case "free":
        return "default";
      case "basic":
        return "blue";
      case "premium":
        return "gold";
      case "enterprise":
        return "purple";
      default:
        return "default";
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={700}
      centered
      closeIcon={
        <CloseOutlined className="text-slate-400 hover:text-slate-600" />
      }
      className="view-firms-modal"
      style={{
        padding: "5px 10px",
      }}
    >
      <div>
        {/* Header */}
        <div className="mb-5">
          <Space size="small" className="mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <EyeOutlined className="text-blue-600 dark:text-blue-400 text-sm" />
            </div>
            <div>
              <Title
                level={5}
                className="!text-slate-900 dark:!text-white !mb-0 !text-lg"
              >
                View All Business Firms
              </Title>
              <Text className="text-slate-500 dark:text-slate-300 text-xs">
                Manage and view all your registered business firms
              </Text>
            </div>
          </Space>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <Spin size="default" />
              <div className="mt-2">
                <Text className="text-slate-600 dark:text-slate-400 text-sm">
                  Loading firms...
                </Text>
              </div>
            </div>
          </div>
        ) : firms.length === 0 ? (
          <div className="py-8">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text className="text-slate-500 dark:text-slate-400 text-sm">
                  No business firms found
                </Text>
              }
            >
              <Text className="text-slate-400 dark:text-slate-500 text-xs">
                Create your first business firm to get started
              </Text>
            </Empty>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-2">
            {firms.map((firm) => (
              <Card
                key={firm.firmId}
                className="border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:shadow-sm transition-shadow"
                bodyStyle={{ padding: "12px" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {/* Firm Icon */}
                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <BankOutlined className="text-blue-600 dark:text-blue-400 text-sm" />
                    </div>

                    {/* Firm Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Text className="text-slate-900 dark:text-white font-medium text-sm truncate">
                          {firm.firmName}
                        </Text>
                        <Tag
                          color={getSubscriptionColor(firm.subscription_plan)}
                          className="ml-2 text-xs"
                          style={{
                            fontSize: "10px",
                            padding: "1px 6px",
                            lineHeight: "16px",
                          }}
                        >
                          <CrownOutlined
                            className="mr-1"
                            style={{ fontSize: "10px" }}
                          />
                          {firm.subscription_plan}
                        </Tag>
                      </div>
                      {firm.phone && (
                        <div className="flex items-center space-x-1">
                          <PhoneOutlined
                            className="text-slate-400"
                            style={{ fontSize: "10px" }}
                          />
                          <Text className="text-slate-500 dark:text-slate-300 text-xs">
                            {firm.phone}
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 ml-3">
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined style={{ fontSize: "12px" }} />}
                      loading={deletingIds.has(firm.firmId)}
                      className="hover:bg-red-50 dark:hover:bg-red-900/20 w-7 h-7"
                      size="small"
                      onClick={() => showDeleteConfirm(firm)}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-200 dark:border-slate-600">
          <div>
            <Text className="text-slate-500 dark:text-slate-400 text-xs">
              {firms.length > 0 &&
                `${firms.length} firm${firms.length !== 1 ? "s" : ""} found`}
            </Text>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCancel}
              className="h-8 px-3 rounded-md text-xs"
              size="small"
            >
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={confirmVisible}
        entityName="Firm"
        action="delete"
        title={`Delete ${selectedFirm?.firmName}?`}
        description={`Are you sure you want to delete ${selectedFirm?.firmName}? This action cannot be undone.`}
        onConfirm={() => {
          if (selectedFirm) {
            handleDeleteFirm(selectedFirm.firmId);
          }
          setConfirmVisible(false);
        }}
        onCancel={() => setConfirmVisible(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Modal>
  );
};

export default ViewFirmsModal;