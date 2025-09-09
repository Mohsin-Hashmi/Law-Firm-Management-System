"use client";
import DashboardLayout from "@/app/components/DashboardLayout";
import { updateCaseByFirm } from "@/app/service/adminAPI";
import { getCaseById } from "@/app/service/adminAPI";
import { updateCase } from "@/app/store/caseSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { RootState } from "@/app/store/store";
import { Case, CreateCaseFormValues } from "@/app/types/case";
import clsx from "clsx";
import {
  ArrowLeftOutlined,
  BankOutlined,
  CalendarOutlined,
  FileOutlined,
  FileTextOutlined,
  SaveOutlined,
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  CloseOutlined,
  NumberOutlined,
  FolderOpenOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Progress,
  Row,
  Select,
  Space,
  Spin,
  Typography,
  Upload,
  DatePicker,
  Tag,
} from "antd";
import { ThemeProvider } from "next-themes";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import type { UploadFile, UploadChangeParam } from "antd/es/upload/interface";
import { CaseLawyer } from "@/app/types/case";
import ConfirmationModal from "@/app/components/ConfirmationModal";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

export default function EditCase() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.user?.user);
  const selectedCaseType = Form.useWatch("caseType");
  const clients = useAppSelector(
    (state: RootState) => state.client?.clients || []
  );
  const lawyers = useAppSelector(
    (state: RootState) => state.lawyer?.lawyers || []
  );
  const firmId = user?.firmId;
  const router = useRouter();
  const params = useParams();
  const caseId = params?.id as string;
  const [form] = Form.useForm();

  // State values
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);

  const showUpdateModal = () => setIsUpdateModalVisible(true);
  const hideUpdateModal = () => setIsUpdateModalVisible(false);

  // Load case data on component mount
  useEffect(() => {
    const loadCaseData = async () => {
      if (!caseId || !firmId) return;

      try {
        setPageLoading(true);
        const response = await getCaseById(parseInt(caseId));

        if (response?.case) {
          const caseInfo = response.case; // ✅ use case instead of data
          setCaseData(caseInfo);
          setExistingDocuments(caseInfo.documents || []);

          form.setFieldsValue({
            title: caseInfo.title,
            caseNumber: caseInfo.caseNumber,
            caseType: caseInfo.caseType,
            status: caseInfo.status,
            description: caseInfo.description,
            clientId: caseInfo.client?.id,
            lawyerIds:
              caseInfo.lawyers?.map((lawyer: CaseLawyer) => lawyer.id) || [],
          });
        }
      } catch (error) {
        console.error("Error loading case data:", error);
        toast.error("Failed to load case data");
        router.back();
      } finally {
        setPageLoading(false);
      }
    };

    loadCaseData();
  }, [caseId, firmId, form, router]);

  const handleUpdateCase = async (values: CreateCaseFormValues) => {
    try {
      setLoading(true);

      // Add validation for required values
      if (!firmId) {
        toast.error("Firm ID is missing. Please try logging in again.");
        return;
      }

      if (!caseId) {
        toast.error("Case ID is missing.");
        return;
      }

      const formData = new FormData();
      formData.append("title", values.title ?? caseData?.title ?? "");
      formData.append(
        "caseNumber",
        values.caseNumber ?? caseData?.caseNumber ?? ""
      );
      formData.append("caseType", values.caseType ?? caseData?.caseType ?? "");
      formData.append("status", values.status ?? caseData?.status ?? "Open");
      formData.append(
        "description",
        values.description ?? caseData?.description ?? ""
      );

      if (values.clientId || caseData?.client?.id) {
        formData.append(
          "clientId",
          (values.clientId ?? caseData?.client?.id)!.toString()
        );
      }
      formData.append("firmId", firmId.toString()); // Now safe to call toString()

      (values.lawyerIds ?? caseData?.lawyers?.map((l) => l.id) ?? []).forEach(
        (id) => {
          formData.append("lawyerIds", id.toString());
        }
      );

      documents.forEach((file) => {
        formData.append("documents", file);
      });

      const response = await updateCaseByFirm(parseInt(caseId), formData);
      if (!response?.case) {
        toast.error("Error updating case");
        return;
      }
      dispatch(updateCase(response.case));
      toast.success("Case updated successfully!");
      router.push("/firm-admin/get-cases");
    } catch (err) {
      toast.error("Something went wrong while updating the case");
      console.error("Error updating case:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmUpdate = async () => {
    try {
      const values = await form.validateFields();
      hideUpdateModal();
      await handleUpdateCase(values);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const getFormProgress = () => {
    const values = form.getFieldsValue();
    let progress = 0;
    if (values.title) progress += 25;
    if (values.caseNumber) progress += 15;
    if (values.clientId) progress += 25;
    if (values.caseType) progress += 15;
    if (values.status) progress += 10;
    if (values.description) progress += 10;
    return progress;
  };

  const caseTypes = [
    {
      value: "Criminal",
      label: "Criminal Law",
      description: "Criminal defense and prosecution cases",
      icon: <BankOutlined />,
      color: "#dc2626",
    },
    {
      value: "Civil",
      label: "Civil Law",
      description: "Civil disputes and litigation",
      icon: <UserOutlined />,
      color: "#2563eb",
    },
    {
      value: "Corporate",
      label: "Corporate Law",
      description: "Business and corporate matters",
      icon: <BankOutlined />,
      color: "#7c3aed",
    },
    {
      value: "Family",
      label: "Family Law",
      description: "Divorce, custody, and family matters",
      icon: <TeamOutlined />,
      color: "#ea580c",
    },
    {
      value: "Immigration",
      label: "Immigration",
      description: "Immigration and citizenship matters",
      icon: <FileTextOutlined />,
      color: "#059669",
    },
    {
      value: "Real Estate",
      label: "Real Estate",
      description: "Property and real estate transactions",
      icon: <BankOutlined />,
      color: "#0891b2",
    },
  ];

  const statusOptions = [
    { value: "Open", label: "Open", color: "#059669" },
    { value: "On Hold", label: "On Hold", color: "#f59e0b" },
    { value: "Appeal", label: "Appeal", color: "#7c3aed" },
    { value: "Closed", label: "Closed", color: "#6b7280" },
  ];

  const handleFileUpload = (info: UploadChangeParam<UploadFile>) => {
    const { fileList: newFileList } = info;
    setFileList(newFileList);

    const files = newFileList
      .filter((file: UploadFile) => file.status !== "error")
      .map((file: UploadFile) => file.originFileObj)
      .filter(Boolean) as File[];

    setDocuments(files);
  };

  const removeFile = (file: UploadFile) => {
    const newFileList = fileList.filter((item) => item.uid !== file.uid);
    setFileList(newFileList);

    const files = newFileList
      .map((file: UploadFile) => file.originFileObj)
      .filter(Boolean) as File[];

    setDocuments(files);
  };

  const removeExistingDocument = (docId: number) => {
    setExistingDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  const handleCaseTypeChange = (value: string) => {
    form.setFieldValue("caseType", value);
  };

  if (pageLoading) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <DashboardLayout>
          <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="text-center">
              <Spin size="large" />
              <Title level={4} className="text-slate-800 dark:text-white mt-4">
                Loading Case Data
              </Title>
              <Text className="text-slate-600 dark:text-slate-300">
                Please wait while we fetch the case information...
              </Text>
            </div>
          </div>
        </DashboardLayout>
      </ThemeProvider>
    );
  }

  if (!caseData) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <DashboardLayout>
          <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="text-center">
              <Title level={4} className="text-slate-800 dark:text-white">
                Case Not Found
              </Title>
              <Text className="text-slate-600 dark:text-slate-300">
                The case you are looking for does not exist or you dont have
                permission to view it.
              </Text>
              <Button
                type="primary"
                onClick={() => router.back()}
                className="mt-4"
              >
                Go Back
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DashboardLayout>
        <div className="min-h-screen p-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
          <div className="max-w-[1400px] mx-auto">
            {/* Header Section */}
            <Card
              className="bg-[#433878] dark:bg-slate-800 border-0 rounded-2xl shadow-lg mb-6"
              bodyStyle={{ padding: "32px" }}
            >
              <Row align="middle" justify="space-between">
                <Col>
                  <Space size="large" align="center">
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
                        style={{ fontSize: "28px", color: "white" }}
                      />
                    </div>
                    <div>
                      <Title
                        level={1}
                        style={{
                          color: "white",
                          margin: 0,
                          fontSize: "36px",
                          fontWeight: "700",
                          lineHeight: "1.1",
                        }}
                      >
                        Edit Case
                      </Title>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.85)",
                          fontSize: "18px",
                          fontWeight: "400",
                          display: "block",
                        }}
                      >
                        Update case details and assignments
                      </Text>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.7)",
                          fontSize: "14px",
                          display: "block",
                          marginTop: "4px",
                        }}
                      >
                        Case #{caseData.caseNumber} - {caseData.title}
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
                      height: "44px",
                      backdropFilter: "blur(10px)",
                    }}
                    ghost
                  >
                    Back
                  </Button>
                </Col>
              </Row>
            </Card>

            {/* Progress Card */}
            <Card
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm mb-6"
              bodyStyle={{ padding: "20px 24px" }}
            >
              <div style={{ textAlign: "center" }}>
                <Text
                  className="text-slate-600 dark:text-slate-300"
                  style={{
                    marginBottom: "12px",
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Case Update Progress
                </Text>
                <Progress
                  percent={getFormProgress()}
                  strokeColor="#2563eb"
                  trailColor="#f1f5f9"
                  strokeWidth={8}
                  showInfo={false}
                />
              </div>
            </Card>

            {/* Main Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={showUpdateModal}
              onFinishFailed={(errorInfo) => {
                console.log("Form validation failed:", errorInfo);
                toast.error("Please fill in all required fields");
              }}
              size="large"
            >
              {loading && (
                <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl text-center shadow-2xl border border-slate-200 dark:border-slate-700 max-w-sm mx-4">
                    <Spin size="large" />
                    <Title
                      level={4}
                      className="text-slate-800 dark:text-white mt-4 mb-2"
                    >
                      Updating Case
                    </Title>
                    <Text className="text-slate-600 dark:text-slate-300">
                      Please wait while we update the case...
                    </Text>
                  </div>
                </div>
              )}

              <Row gutter={[24, 24]}>
                {/* Left Column - Case Information */}
                <Col xs={24} lg={12}>
                  {/* Basic Case Information */}
                  <Card
                    title={
                      <Space>
                        <FileTextOutlined style={{ color: "#2563eb" }} />
                        <span className="text-slate-800 dark:text-white font-semibold">
                          Case Information
                        </span>
                      </Space>
                    }
                    className="bg-white dark:bg-slate-800    border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm mb-6"
                    bodyStyle={{ padding: "24px" }}
                  >
                    <div className="space-y-4">
                      <Form.Item
                        label={
                          <span className="text-slate-700 dark:text-slate-200 font-medium">
                            Assign Lawyers
                          </span>
                        }
                        name="lawyerIds"
                      >
                        <Select
                          mode="multiple"
                          placeholder="Select lawyers to assign to this case"
                          optionFilterProp="label"
                          className="
    dark:!bg-[#2A3441] 
    dark:!border-[#4B5563] 
    [&_.ant-select-selector]:dark:!bg-[#2A3441] 
    [&_.ant-select-selector]:dark:!border-[#4B5563] 
    [&_.ant-select-selection-item]:dark:!text-white 
    [&_.ant-select-arrow]:dark:!text-white 
    [&_.ant-select-selector]:!min-h-[50px] 
    [&_.ant-select-selection-placeholder]:dark:!text-[#9ca3af] 
  "
                          dropdownClassName="
    dark:!bg-[#2A3441] dark:!border-[#4B5563] 
    [&_.ant-select-item]:dark:!bg-[#2A3441] 
    [&_.ant-select-item]:dark:!text-white 
    [&_.ant-select-item-option-selected]:dark:!bg-[#374151] 
    [&_.ant-select-item-option-active]:dark:!bg-[#374151]
  "
                          showSearch
                        >
                          {lawyers.map((lawyer) => (
                            <Option
                              key={lawyer.id}
                              value={lawyer.id}
                              label={`${lawyer.name} ${lawyer.email}`}
                            >
                              <div className="flex items-center gap-3">
                                <TeamOutlined className="text-slate-400" />
                                <div>
                                  <div className="font-medium text-sm">
                                    {lawyer.name}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {lawyer.email}
                                  </div>
                                </div>
                              </div>
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item shouldUpdate noStyle>
                        {() => {
                          const selectedLawyerIds =
                            form.getFieldValue("lawyerIds") || [];

                          return selectedLawyerIds.length > 0 ? (
                            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                              <Text className="text-slate-700 dark:text-slate-200 text-sm font-medium block mb-3">
                                Assigned Lawyers ({selectedLawyerIds.length}):
                              </Text>
                              <div className="space-y-2">
                                {selectedLawyerIds.map((id: number) => {
                                  const lawyer = lawyers.find(
                                    (l) => l.id === id
                                  );
                                  return lawyer ? (
                                    <div
                                      key={id}
                                      className="flex items-center gap-3"
                                    >
                                      <TeamOutlined className="text-blue-500" />
                                      <div>
                                        <Text className="text-slate-800 dark:text-white font-medium text-sm">
                                          {lawyer.name}
                                        </Text>
                                        <Text className="text-slate-500 dark:text-slate-400 text-xs block">
                                          {lawyer.email}
                                        </Text>
                                      </div>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          ) : null;
                        }}
                      </Form.Item>
                    </div>
                  </Card>

                  {/* Case Status */}
                  <Card
                    title={
                      <Space>
                        <CalendarOutlined style={{ color: "#2563eb" }} />
                        <span className="text-slate-800 dark:text-white font-semibold">
                          Case Status
                        </span>
                      </Space>
                    }
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm"
                    bodyStyle={{ padding: "24px" }}
                  >
                    <Form.Item
                      label={
                        <span className="text-slate-700 dark:text-slate-200 font-medium">
                          Case Status *
                        </span>
                      }
                      name="status"
                      rules={[
                        { required: true, message: "Please select status" },
                      ]}
                    >
                      <Select
                        placeholder="Select case status"
                        className="
    dark:!bg-[#2A3441] 
    dark:!border-[#4B5563] 
    [&_.ant-select-selector]:dark:!bg-[#2A3441] 
    [&_.ant-select-selector]:dark:!border-[#4B5563] 
    [&_.ant-select-selection-item]:dark:!text-white 
    [&_.ant-select-arrow]:dark:!text-white 
    [&_.ant-select-selector]:!min-h-[50px] 
    [&_.ant-select-selection-placeholder]:dark:!text-[#9ca3af] 
    [&_.ant-select-arrow]:!top-8
    [&_.ant-select-arrow]:!-translate-y-1/2
  "
                        dropdownClassName="
    dark:!bg-[#2A3441] dark:!border-[#4B5563] 
    [&_.ant-select-item]:dark:!bg-[#2A3441] 
    [&_.ant-select-item]:dark:!text-white 
    [&_.ant-select-item-option-selected]:dark:!bg-[#374151] 
    [&_.ant-select-item-option-active]:dark:!bg-[#374151]
  "
                      >
                        {statusOptions.map((option) => (
                          <Option key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <div
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  backgroundColor: option.color,
                                }}
                              />
                              {option.label}
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    {/* Case Timeline Info */}
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <Text className="text-slate-700 dark:text-slate-200 text-sm font-medium block mb-3">
                        Case Timeline:
                      </Text>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Text className="text-slate-600 dark:text-slate-400 text-xs">
                            Opened:
                          </Text>
                          <Text className="text-slate-800 dark:text-white text-xs font-medium">
                            {new Date(caseData.openedAt).toLocaleDateString()}
                          </Text>
                        </div>
                        {caseData.closedAt && (
                          <div className="flex justify-between items-center">
                            <Text className="text-slate-600 dark:text-slate-400 text-xs">
                              Closed:
                            </Text>
                            <Text className="text-slate-800 dark:text-white text-xs font-medium">
                              {new Date(caseData.closedAt).toLocaleDateString()}
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Col>

                {/* Case Summary Column */}
                <Col xs={24} lg={12}>
                  <div className="bg-gradient-to-br from-blue-50 via-blue-50/80 to-indigo-50/60 dark:from-slate-800/60 dark:via-slate-700/40 dark:to-slate-800/80 border border-blue-200/80 dark:border-slate-600/70 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
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
                          Case Summary
                        </Title>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-0">
                          Current Case Information
                        </p>
                      </div>
                    </div>

                    <Form.Item shouldUpdate noStyle>
                      {() => {
                        const values = form.getFieldsValue();
                        const selectedClient = clients.find(
                          (c) => c.id === values.clientId
                        );
                        const selectedLawyers: CaseLawyer[] = (
                          values.lawyerIds || []
                        )
                          .map((id: number) =>
                            lawyers.find((l: CaseLawyer) => l.id === id)
                          )
                          .filter((l: CaseLawyer): l is CaseLawyer =>
                            Boolean(l)
                          );

                        return (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between group hover:bg-white/60 dark:hover:bg-slate-600/20 rounded-lg p-2 transition-colors duration-150">
                              <Text className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                                Case ID:
                              </Text>
                              <span className="text-slate-800 dark:text-white font-semibold text-sm bg-slate-100 dark:bg-slate-600/30 px-2 py-1 rounded-md">
                                #{values.caseNumber || caseData.caseNumber}
                              </span>
                            </div>

                            <div className="flex items-center justify-between group hover:bg-white/60 dark:hover:bg-slate-600/20 rounded-lg p-2 transition-colors duration-150">
                              <Text className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                                Status:
                              </Text>
                              <span
                                className="font-semibold text-sm px-2 py-1 rounded-md"
                                style={{
                                  color:
                                    statusOptions.find(
                                      (s) => s.value === values.status
                                    )?.color || "#374151",
                                  backgroundColor: `${
                                    statusOptions.find(
                                      (s) => s.value === values.status
                                    )?.color || "#374151"
                                  }20`,
                                }}
                              >
                                {statusOptions.find(
                                  (s) => s.value === values.status
                                )?.label ||
                                  values.status ||
                                  caseData.status}
                              </span>
                            </div>

                            <div className="flex items-center justify-between group hover:bg-white/60 dark:hover:bg-slate-600/20 rounded-lg p-2 transition-colors duration-150">
                              <Text className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                                Client:
                              </Text>
                              <span className="text-slate-800 dark:text-white font-semibold text-sm bg-slate-100 dark:bg-slate-600/30 px-2 py-1 rounded-md">
                                {selectedClient?.fullName ||
                                  caseData.client?.fullName ||
                                  "Not selected"}
                              </span>
                            </div>

                            <div className="flex items-center justify-between group hover:bg-white/60 dark:hover:bg-slate-600/20 rounded-lg p-2 transition-colors duration-150">
                              <Text className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                                Lawyers:
                              </Text>
                              <span className="text-slate-800 dark:text-white font-semibold text-sm bg-slate-100 dark:bg-slate-600/30 px-2 py-1 rounded-md">
                                {selectedLawyers.length > 0
                                  ? `${selectedLawyers.length} assigned`
                                  : `${caseData.lawyers?.length || 0} assigned`}
                              </span>
                            </div>

                            <div className="flex items-center justify-between group hover:bg-white/60 dark:hover:bg-slate-600/20 rounded-lg p-2 transition-colors duration-150">
                              <Text className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                                Documents:
                              </Text>
                              <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">
                                {existingDocuments.length + documents.length}{" "}
                                files
                              </span>
                            </div>

                            {selectedLawyers.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-blue-200/50 dark:border-slate-600/50">
                                <Text className="text-slate-700 dark:text-slate-200 font-medium text-sm block mb-2">
                                  Current Team:
                                </Text>
                                <div className="flex flex-wrap gap-2">
                                  {selectedLawyers.map((lawyer) => (
                                    <Tag
                                      key={lawyer.id}
                                      color="blue"
                                      className="rounded-lg px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-none font-medium text-sm"
                                    >
                                      {lawyer.name}
                                    </Tag>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }}
                    </Form.Item>

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
                        Case changes will be saved to the database
                      </p>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Submit Section */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-center items-center gap-4">
                  <Button
                    size="large"
                    onClick={() => router.back()}
                    style={{
                      border: "1px solid #d1d5db",
                      fontWeight: "600",
                      padding: "12px 32px",
                      height: "48px",
                      color: "#374151",
                    }}
                  >
                    Cancel Changes
                  </Button>

                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<SaveOutlined />}
                    loading={loading}
                    style={{
                      background: isHovered ? "#1d4ed8" : "#1e40af",
                      borderColor: isHovered ? "#1d4ed8" : "#1e40af",
                      padding: "12px 40px",
                      fontSize: "15px",
                      fontWeight: "600",
                      height: "48px",
                      boxShadow: "0 4px 12px rgba(30, 64, 175, 0.25)",
                      transform: isHovered
                        ? "translateY(-1px)"
                        : "translateY(0)",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={showUpdateModal}
                  >
                    Update Case
                  </Button>
                  <ConfirmationModal
                    visible={isUpdateModalVisible}
                    entityName={"Case"}
                    action="update"
                    onConfirm={handleConfirmUpdate}
                    onCancel={hideUpdateModal}
                  />
                </div>

                <div className="text-center mt-4">
                  <Text className="text-slate-500 dark:text-slate-400 text-sm">
                    All changes will be reflected in your case management system
                  </Text>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </DashboardLayout>
    </ThemeProvider>
  );
}
