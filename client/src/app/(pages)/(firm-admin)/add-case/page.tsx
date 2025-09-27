"use client";
import DashboardLayout from "@/app/components/DashboardLayout";
import { createCase } from "@/app/service/adminAPI";
import { addCase } from "@/app/store/caseSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { RootState } from "@/app/store/store";
import { Case } from "@/app/types/case";
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
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import type { UploadFile, UploadChangeParam } from "antd/es/upload/interface";
import { CaseLawyer } from "@/app/types/case";
import { CreateCaseFormValues } from "@/app/types/case";
import ConfirmationModal from "@/app/components/ConfirmationModal";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

export default function AddCase() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.user?.user);
  const clients = useAppSelector(
    (state: RootState) => state.client?.clients || []
  );

  console.log("Client are :", clients);
  const lawyers = useAppSelector(
    (state: RootState) => state.lawyer?.lawyers || []
  );
  const firmId = user?.firmId;
  const role = user?.role;
  const router = useRouter();
  const [form] = Form.useForm();
  const selectedCaseType = Form.useWatch("caseType", form);

  // State values
  const [documents, setDocuments] = useState<File[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [caseNumber, setCaseNumber] = useState("");
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  const showCreationModal = () => setIsCreateModalVisible(true);
  const hideCreateModal = () => setIsCreateModalVisible(false);

  // Generate case number automatically
  useEffect(() => {
    const generateCaseNumber = () => {
      const currentYear = new Date().getFullYear();
      const randomNum = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
      return `CASE-${currentYear}-${randomNum}`;
    };

    if (!caseNumber) {
      const newCaseNumber = generateCaseNumber();
      setCaseNumber(newCaseNumber);
      form.setFieldValue("caseNumber", newCaseNumber);
    }
  }, [caseNumber, form]);

  const handleCreateCase = async (values: CreateCaseFormValues) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("caseNumber", values.caseNumber);
      formData.append("caseType", values.caseType);
      formData.append("status", values.status || "Open");
      formData.append("description", values.description || "");
      formData.append("clientId", values.clientId.toString());
      formData.append("firmId", firmId!.toString());

      values.lawyerIds?.forEach((id) => {
        formData.append("lawyerIds", id.toString());
      });

      documents.forEach((file) => {
        formData.append("documents", file);
      });

      const response = await createCase(firmId!, formData);

      if (!response?.data) {
        toast.error("Error in create case API");
        return;
      }

      dispatch(addCase(response.data));
      toast.success("Case created successfully!");
      router.push("/get-cases");
      resetForm();
    } catch (err) {
      toast.error("Something went wrong while creating the case");
      console.error("Error creating case:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCreate = async () => {
    try {
      const values = await form.validateFields();
      hideCreateModal();
      await handleCreateCase(values);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const resetForm = () => {
    setDocuments([]);
    setFileList([]);
    setCaseNumber("");
    form.resetFields();
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

  const handleCaseTypeChange = (value: string) => {
    form.setFieldValue("caseType", value);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DashboardLayout>
        <div className="min-h-screen transition-colors duration-300">
          <div className="max-w-full">
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
                      <FolderOpenOutlined
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
                        Create New Case
                      </Title>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.85)",
                          fontSize: "18px",
                          fontWeight: "400",
                          display: "block",
                        }}
                      >
                        Start a new legal case with client and lawyer
                        assignments
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
                  className="text-[#232323] dark:text-slate-300 italic"
                  style={{
                    marginBottom: "12px",
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {`"Case Creation Progress"`}
                </Text>
                <Progress
                  percent={getFormProgress()}
                  strokeColor="#433878"
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
              onFinishFailed={(errorInfo) => {
                console.log("Form validation failed:", errorInfo);
                toast.error("Please fill in all required fields");
              }}
              initialValues={{
                status: "Open",
                caseNumber: caseNumber,
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
                      Creating Case
                    </Title>
                    <Text className="text-slate-600 dark:text-slate-300">
                      Please wait while we create the new case...
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
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm mb-6"
                    bodyStyle={{ padding: "24px" }}
                  >
                    <div className="space-y-4">
                      <Form.Item
                        label={
                          <span className="text-slate-700 dark:text-slate-200 font-medium">
                            Case Title *
                          </span>
                        }
                        name="title"
                        rules={[
                          {
                            required: true,
                            message: "Please enter case title",
                          },
                        ]}
                      >
                        <Input
                          prefix={
                            <FileTextOutlined className="text-slate-400" />
                          }
                          placeholder="Enter case title"
                          className="dark:!bg-[#2A3441] dark:!text-white dark:!border-[#4B5563] dark:placeholder:text-[#9ca3af]"
                          style={{ padding: "12px 16px", fontSize: "14px" }}
                        />
                      </Form.Item>

                      <Form.Item
                        label={
                          <span className="text-slate-700 dark:text-slate-200 font-medium">
                            Case Number *
                          </span>
                        }
                        name="caseNumber"
                        rules={[
                          {
                            required: true,
                            message: "Please enter case number",
                          },
                        ]}
                      >
                        <Input
                          prefix={<NumberOutlined className="text-slate-400" />}
                          placeholder="Auto-generated case number"
                          className="dark:!bg-[#2A3441] dark:!text-white dark:!border-[#4B5563] dark:placeholder:text-[#9ca3af]"
                          style={{ padding: "12px 16px", fontSize: "14px" }}
                        />
                      </Form.Item>

                      <Form.Item
                        label={
                          <span className="text-slate-700 dark:text-slate-200 font-medium">
                            Case Type *
                          </span>
                        }
                        name="caseType"
                        rules={[
                          {
                            required: true,
                            message: "Please select case type",
                          },
                        ]}
                      >
                        <div className="grid grid-cols-1 gap-3">
                          {caseTypes.map((type) => {
                            const isSelected = selectedCaseType === type.value;

                            return (
                              <div
                                key={type.value}
                                onClick={() => handleCaseTypeChange(type.value)}
                                className="cursor-pointer transition-all duration-200 hover:shadow-md border"
                                style={{
                                  borderColor: isSelected
                                    ? type.color
                                    : undefined,
                                  borderRadius: "12px",
                                  padding: "16px",
                                  backgroundColor: isSelected
                                    ? `${type.color}08`
                                    : undefined,
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className="text-lg"
                                    style={{ color: type.color }}
                                  >
                                    {type.icon}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-slate-800 dark:text-white font-medium text-sm">
                                      {type.label}
                                    </div>
                                    <div className="text-slate-500 dark:text-slate-400 text-xs">
                                      {type.description}
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <CheckCircleOutlined
                                      style={{
                                        color: type.color,
                                        fontSize: "18px",
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Form.Item>

                      <Form.Item
                        label={
                          <span className="text-slate-700 dark:text-slate-200 font-medium">
                            Case Description
                          </span>
                        }
                        name="description"
                      >
                        <TextArea
                          placeholder="Enter case description, objectives, and relevant details"
                          rows={4}
                          className="dark:!bg-[#2A3441] dark:!text-white dark:!border-[#4B5563] dark:placeholder:text-[#9ca3af]"
                          style={{ padding: "12px 16px", fontSize: "14px" }}
                        />
                      </Form.Item>
                    </div>
                  </Card>

                  {/* Document Upload */}
                  <Card
                    title={
                      <Space>
                        <FileOutlined style={{ color: "#2563eb" }} />
                        <span className="text-slate-800 dark:text-white font-semibold">
                          Case Documents
                        </span>
                      </Space>
                    }
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm"
                    bodyStyle={{ padding: "24px" }}
                  >
                    <Dragger
                      multiple
                      fileList={fileList}
                      onChange={handleFileUpload}
                      beforeUpload={() => false}
                      className="rounded-lg dark:bg-slate-900 dark:border-slate-600"
                      style={{ background: "#f8fafc" }}
                    >
                      <p className="ant-upload-drag-icon">
                        <UploadOutlined style={{ color: "#2563eb" }} />
                      </p>
                      <p className="ant-upload-text text-slate-700 dark:text-white">
                        Click or drag files to upload case documents
                      </p>
                      <p className="ant-upload-hint text-slate-500 dark:text-slate-400">
                        Support for PDF, DOC, DOCX, and image files
                      </p>
                    </Dragger>

                    {fileList.length > 0 && (
                      <div className="mt-4">
                        <Text className="text-slate-700 dark:text-slate-200 font-medium text-sm block mb-3">
                          Uploaded Documents ({fileList.length})
                        </Text>
                        <div className="space-y-2">
                          {fileList.map((file) => (
                            <div
                              key={file.uid}
                              className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <FileOutlined className="text-blue-500" />
                                <div>
                                  <Text className="text-slate-800 dark:text-white text-sm font-medium">
                                    {file.name}
                                  </Text>
                                  <Text className="text-slate-500 dark:text-slate-400 text-xs block">
                                    {file.size
                                      ? `${(file.size / 1024).toFixed(1)} KB`
                                      : ""}
                                  </Text>
                                </div>
                              </div>
                              <Button
                                type="text"
                                danger
                                size="small"
                                icon={<CloseOutlined />}
                                onClick={() => removeFile(file)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </Col>

                {/* Right Column - Client & Lawyer Assignment */}
                <Col xs={24} lg={12}>
                  {/* Client Assignment */}
                  <Card
                    title={
                      <Space>
                        <UserOutlined style={{ color: "#2563eb" }} />
                        <span className="text-slate-800 dark:text-white font-semibold">
                          Client Assignment
                        </span>
                      </Space>
                    }
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm mb-6"
                    bodyStyle={{ padding: "24px" }}
                  >
                    <Form.Item
                      label={
                        <span className="text-slate-700 dark:text-slate-200 font-medium">
                          Select Client
                        </span>
                      }
                      name="clientId"
                      rules={[
                        { required: true, message: "Please select a client" },
                      ]}
                    >
                      <Select
                        placeholder="Choose client for this case"
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
                        showSearch
                      >
                        {clients.map((client) => (
                          <Option
                            key={client.id}
                            value={client.id}
                            label={client.fullName}
                          >
                            <div className="flex items-center gap-3">
                              <UserOutlined className="text-slate-400" />
                              <div>
                                <div className="font-medium">
                                  {client.fullName}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {client.email}
                                </div>
                              </div>
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item shouldUpdate noStyle>
                      {() => {
                        const selectedClientId = form.getFieldValue("clientId");
                        const selectedClient = clients.find(
                          (c) => c.id === selectedClientId
                        );

                        return selectedClient ? (
                          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                            <Text className="text-slate-700 dark:text-slate-200 text-sm font-medium block mb-2">
                              Selected Client:
                            </Text>
                            <div className="flex items-center gap-3">
                              <UserOutlined className="text-blue-500" />
                              <div>
                                <Text className="text-slate-800 dark:text-white font-medium">
                                  {selectedClient.fullName}
                                </Text>
                                <Text className="text-slate-500 dark:text-slate-400 text-xs block">
                                  {selectedClient.email}
                                </Text>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      }}
                    </Form.Item>
                  </Card>

                  {/* Lawyer Assignment */}
                  {role !== "Lawyer" && (
                    <Card
                      title={
                        <Space>
                          <TeamOutlined style={{ color: "#2563eb" }} />
                          <span className="text-slate-800 dark:text-white font-semibold">
                            Lawyer Assignment
                          </span>
                        </Space>
                      }
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm mb-6"
                      bodyStyle={{ padding: "24px" }}
                    >
                      <Form.Item
                        label={
                          <span className="text-slate-700 dark:text-slate-200 font-medium">
                            Assign Lawyers
                          </span>
                        }
                        name="lawyerIds"
                        rules={[
                          { required: true, message: "Please select a client" },
                        ]}
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
                          showSearch
                        >
                          {lawyers.map((lawyer) => (
                            <Option
                              key={lawyer.id}
                              value={lawyer.id}
                              label={`${lawyer.name} ${lawyer.email}`}
                            >
                              <div className="flex items-center  gap-3">
                                <TeamOutlined className="text-slate-400" />
                                <div>
                                  <div className="font-medium">
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
                    </Card>
                  )}

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
                          Initial Status *
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
                  </Card>
                  {/* Case Summary Column */}

                  <div className=" !mt-6 bg-gradient-to-br from-emerald-50 via-emerald-50/80 to-green-50/60 dark:from-slate-800/60 dark:via-slate-700/40 dark:to-slate-800/80 border border-emerald-200/80 dark:border-slate-600/70 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                        <CheckCircleOutlined className="text-emerald-600 dark:text-emerald-400 text-lg" />
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
                          Overview & Key Details
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
                                  "Open"}
                              </span>
                            </div>

                            <div className="flex items-center justify-between group hover:bg-white/60 dark:hover:bg-slate-600/20 rounded-lg p-2 transition-colors duration-150">
                              <Text className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                                Client:
                              </Text>
                              <span className="text-slate-800 dark:text-white font-semibold text-sm bg-slate-100 dark:bg-slate-600/30 px-2 py-1 rounded-md">
                                {selectedClient?.fullName || "Not selected"}
                              </span>
                            </div>

                            <div className="flex items-center justify-between group hover:bg-white/60 dark:hover:bg-slate-600/20 rounded-lg p-2 transition-colors duration-150">
                              <Text className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                                Lawyers:
                              </Text>
                              <span className="text-slate-800 dark:text-white font-semibold text-sm bg-slate-100 dark:bg-slate-600/30 px-2 py-1 rounded-md">
                                {selectedLawyers.length > 0
                                  ? `${selectedLawyers.length} assigned`
                                  : "None assigned"}
                              </span>
                            </div>

                            {documents.length > 0 && (
                              <div className="flex items-center justify-between group hover:bg-white/60 dark:hover:bg-slate-600/20 rounded-lg p-2 transition-colors duration-150">
                                <Text className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                                  Documents:
                                </Text>
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">
                                  {documents.length} files
                                </span>
                              </div>
                            )}

                            {selectedLawyers.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-emerald-200/50 dark:border-slate-600/50">
                                <Text className="text-slate-700 dark:text-slate-200 font-medium text-sm block mb-2">
                                  Assigned Team:
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

                    <div className="mt-5 pt-4 border-t border-emerald-200/50 dark:border-slate-600/50">
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
                        Case information ready for review
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
                    Cancel
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
                    onClick={showCreationModal}
                  >
                    Create Case
                  </Button>
                  <ConfirmationModal
                    visible={isCreateModalVisible}
                    entityName={"Case"}
                    action="create"
                    onConfirm={handleConfirmCreate}
                    onCancel={hideCreateModal}
                  />
                </div>

                <div className="text-center mt-4">
                  <Text className="text-slate-500 dark:text-slate-400 text-sm">
                    Case will be added to your firms case management system
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
