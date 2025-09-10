import React, { useState, useEffect } from "react";
import {
  Modal,
  Spin,
  message,
  Typography,
  Button,
  Select,
  Space,
  Divider,
  Avatar,
  Tag,
  Card,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  TeamOutlined,
  UserAddOutlined,
  PhoneOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { toast } from "react-hot-toast";

const { Title, Text } = Typography;
const { Option } = Select;
import { Case, CaseLawyer } from "../types/case";
import { getLawyers } from "../service/adminAPI";
import { useAppSelector } from "../store/hooks";
import { RootState } from "../store/store";
interface AssignLawyerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCase: Case | null;
  onLawyerAssigned: (caseId: number, lawyerId: number) => void;
}

const AssignLawyerModal: React.FC<AssignLawyerModalProps> = ({
  visible,
  onClose,
  selectedCase,
  onLawyerAssigned,
}) => {
  const user = useAppSelector((state: RootState) => state.user.user);
  const firmId = user?.firmId;
  const [loading, setLoading] = useState(false);
  const [lawyersLoading, setLawyersLoading] = useState(false);
  const [lawyers, setLawyers] = useState<CaseLawyer[]>([]);
  const [selectedLawyerId, setSelectedLawyerId] = useState<number | null>(null);

  // Mock function to fetch lawyers - replace with your actual API call
  const fetchLawyers = async (firmId?: number) => {
    if (!firmId) return;
    setLawyersLoading(true);
    try {
      // Replace this with your actual API call
      const response = await getLawyers(firmId);
      setLawyers(response);
    } catch (error) {
      console.error("Error fetching lawyers:", error);
      message.error("Failed to load lawyers");
    } finally {
      setLawyersLoading(false);
    }
  };

  // Fetch lawyers when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedLawyerId(null);
      fetchLawyers(firmId);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!selectedLawyerId) {
      message.error("Please select a lawyer to assign");
      return;
    }

    if (!selectedCase) {
      message.error("No case selected");
      return;
    }

    setLoading(true);
    try {
      // Replace with your actual API call
      // await assignLawyerToCase(selectedCase.id, selectedLawyerId);

      toast.success("Lawyer assigned successfully");
      onLawyerAssigned(selectedCase.id, selectedLawyerId);
      onClose();
    } catch (error) {
      console.error("Error assigning lawyer:", error);
      message.error("Failed to assign lawyer");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedLawyerId(null);
    onClose();
  };

  const getAvailableLawyers = () => {
    if (!selectedCase?.lawyers) return lawyers;

    const assignedLawyerIds = selectedCase.lawyers.map((lawyer) => lawyer.id);
    return lawyers.filter((lawyer) => !assignedLawyerIds.includes(lawyer.id));
  };

  const selectedLawyer = lawyers.find(
    (lawyer) => lawyer.id === selectedLawyerId
  );

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      centered
      closeIcon={
        <CloseOutlined className="text-slate-400 hover:text-slate-600" />
      }
      className="assign-lawyer-modal"
      style={{
        padding: "5px 10px",
      }}
    >
      <div className="">
        {/* Header */}
        <div className="mb-3">
          <Space size="middle" className="mb-1">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <UserAddOutlined className="text-blue-600 dark:text-blue-400 text-lg" />
            </div>
            <div>
              <Title
                level={4}
                className="!text-slate-900 dark:!text-white !mb-1"
              >
                Assign Lawyer to Case
              </Title>
              <Text className="text-slate-500 dark:text-slate-400 text-sm">
                {selectedCase
                  ? `Assign a lawyer to "${selectedCase.title}"`
                  : "Select a lawyer for the case"}
              </Text>
            </div>
          </Space>
        </div>

        {/* Case Information */}
        {selectedCase && (
          <div className="mb-4">
            <Card
              className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
              bodyStyle={{ padding: "12px" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                  <BankOutlined className="text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <Text className="text-slate-900 dark:text-white font-medium block">
                    {selectedCase.title}
                  </Text>
                  <Text className="text-slate-500 dark:text-slate-400 text-sm">
                    Case #{selectedCase.caseNumber}
                  </Text>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Current Assigned Lawyers */}
        {selectedCase?.lawyers && selectedCase.lawyers.length > 0 && (
          <div className="mb-4">
            <Text className="text-slate-700 dark:text-slate-300 font-medium mb-3 block">
              Currently Assigned Lawyers
            </Text>
            <div className="space-y-2">
              {selectedCase.lawyers.map((lawyer) => (
                <Card
                  key={lawyer.id}
                  className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700"
                  bodyStyle={{ padding: "12px" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar
                        size={32}
                        src={lawyer.profileImage}
                        className="bg-green-100 dark:bg-green-800"
                      >
                        {lawyer.name.charAt(0)}
                      </Avatar>
                      <div>
                        <Text className="text-slate-900 dark:text-white font-medium block">
                          {lawyer.name}
                        </Text>
                        <Text className="text-slate-600 dark:text-slate-400 text-sm">
                          {lawyer.email}
                        </Text>
                      </div>
                    </div>
                    <Tag color="green" className="rounded-full">
                      Assigned
                    </Tag>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Divider className="border-slate-200 dark:border-slate-600 my-4" />

        {lawyersLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Spin size="large" />
              <div className="mt-3">
                <Text className="text-slate-600 dark:text-slate-400">
                  Loading lawyers...
                </Text>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Lawyer Selection Section */}
            <div className="mb-4">
              <Text className="text-slate-700 dark:text-slate-300 font-medium mb-3 block">
                Select Lawyer to Assign
              </Text>

              <div>
                <Text className="text-slate-600 dark:text-slate-400 text-sm mb-2 block">
                  Available Lawyers
                </Text>
                <Select
                  placeholder="Choose a lawyer to assign to this case"
                  value={selectedLawyerId || undefined}
                  onChange={(value) => setSelectedLawyerId(value)}
                  className="w-full"
                  size="large"
                  suffixIcon={<TeamOutlined className="text-slate-400" />}
                  dropdownStyle={{
                    borderRadius: "8px",
                  }}
                  optionLabelProp="label"
                >
                  {getAvailableLawyers().map((lawyer) => (
                    <Option
                      key={lawyer.id}
                      value={lawyer.id}
                      label={lawyer.name}
                    >
                      <div className="flex items-center space-x-3 py-2">
                        <Avatar
                          size={32}
                          src={lawyer.profileImage}
                          className="bg-blue-100 dark:bg-blue-900"
                        >
                          {lawyer.name.charAt(0)}
                        </Avatar>
                        <div className="flex-1">
                          <Text className="text-slate-800 dark:text-slate-200 font-medium block">
                            {lawyer.name}
                          </Text>
                          <Text className="text-slate-500 dark:text-slate-400 text-xs">
                            {lawyer.email}
                          </Text>
                          {lawyer.specialization && (
                            <Text className="text-blue-600 dark:text-blue-400 text-xs">
                              {lawyer.specialization}
                            </Text>
                          )}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>

                {getAvailableLawyers().length === 0 && (
                  <div className="mt-2 p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700">
                    <Text className="text-slate-500 dark:text-slate-400 text-sm">
                      {lawyers.length === 0
                        ? "No lawyers available. Please add lawyers to your firm first."
                        : "All available lawyers are already assigned to this case."}
                    </Text>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Lawyer Preview */}
            {selectedLawyer && (
              <>
                <Divider className="border-slate-200 dark:border-slate-600 my-4" />
                <div className="mb-4">
                  <Text className="text-slate-700 dark:text-slate-300 font-medium mb-3 block">
                    Lawyer to be Assigned
                  </Text>
                  <Card
                    className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
                    bodyStyle={{ padding: "16px" }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        size={48}
                        src={selectedLawyer.profileImage}
                        className="bg-blue-100 dark:bg-blue-800"
                      >
                        {selectedLawyer.name.charAt(0)}
                      </Avatar>
                      <div className="flex-1">
                        <Text className="text-slate-900 dark:text-white font-semibold text-base block">
                          {selectedLawyer.name}
                        </Text>
                        <Space
                          size="small"
                          direction="vertical"
                          className="w-full"
                        >
                          <div className="flex items-center gap-2">
                            <MailOutlined className="text-slate-400 text-xs" />
                            <Text className="text-slate-600 dark:text-slate-400 text-sm">
                              {selectedLawyer.email}
                            </Text>
                          </div>
                          {selectedLawyer.phone && (
                            <div className="flex items-center gap-2">
                              <PhoneOutlined className="text-slate-400 text-xs" />
                              <Text className="text-slate-600 dark:text-slate-400 text-sm">
                                {selectedLawyer.phone}
                              </Text>
                            </div>
                          )}
                          {selectedLawyer.specialization && (
                            <Tag
                              color="blue"
                              className="rounded-full mt-1 text-xs px-2 py-0.5"
                            >
                              {selectedLawyer.specialization}
                            </Tag>
                          )}
                        </Space>
                      </div>
                    </div>
                  </Card>
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
            disabled={
              !selectedLawyerId ||
              lawyersLoading ||
              getAvailableLawyers().length === 0
            }
            icon={!loading && <CheckCircleOutlined />}
            className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 dark:text-white"
          >
            {loading ? "Assigning Lawyer..." : "Assign Lawyer"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AssignLawyerModal;
