"use client";
import DashboardLayout from "@/app/components/DashboardLayout";
import { createCase } from "@/app/service/adminAPI";
import { addCase } from "@/app/store/caseSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { RootState } from "@/app/store/store";
import { Case } from "@/app/types/case";
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
import type { UploadFile } from "antd/es/upload/interface";
import { CaseLawyer } from "@/app/types/case";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

export default function AddCase() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.user?.user);
  const clients = useAppSelector((state: RootState) => state.client?.clients || []);

  console.log("Client are :", clients);
  const lawyers = useAppSelector(
    (state: RootState) => state.lawyer?.lawyers || []
  );
  const firmId = user?.firmId;
  const router = useRouter();
  const [form] = Form.useForm();

  // State values
  const [documents, setDocuments] = useState<File[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [caseNumber, setCaseNumber] = useState("");

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

  const handleCreateCase = async (values: any) => {
    try {
      setLoading(true);
      console.log("Form values:", values);

      if (!values.clientId) {
        toast.error("Please select a client");
        setLoading(false);
        return;
      }

      if (!values.title) {
        toast.error("Please enter a case title");
        setLoading(false);
        return;
      }

      if (!values.caseType) {
        toast.error("Please select a case type");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("caseNumber", values.caseNumber);
      formData.append("caseType", values.caseType);
      formData.append("status", values.status || "Open");
      formData.append("description", values.description || "");
      formData.append("clientId", values.clientId.toString());
      formData.append("firmId", firmId!.toString());

      // Add lawyer IDs
      if (values.lawyerIds && values.lawyerIds.length > 0) {
        values.lawyerIds.forEach((id: number) => {
          formData.append("lawyerIds", id.toString());
        });
      }

      // Add documents
      documents.forEach((file) => {
        formData.append("documents", file);
      });
      const response = await createCase(firmId!, formData);
      console.log("response of create case is", response);

      if (!response?.data) {
        toast.error("Error in create case API");
        return;
      }

      dispatch(addCase(response.data));
      toast.success("Case created successfully!");
      router.push("/pages/firm-admin/get-cases");
      resetForm();
    } catch (err) {
      toast.error("Something went wrong while creating the case");
      console.log("Error creating case:", err);
    } finally {
      setLoading(false);
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

  const handleFileUpload = (info: any) => {
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
                  className="text-slate-600 dark:text-slate-300"
                  style={{
                    marginBottom: "12px",
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Case Creation Progress
                </Text>
                <Progress
                  percent={getFormProgress()}
                  strokeColor="#2563eb"
                  trailColor="#f1f5f9"
                  strokeWidth={8}
                  showInfo={true}
                />
              </div>
            </Card>

            {/* Main Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreateCase}
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
                          {caseTypes.map((type) => (
                            <div
                              key={type.value}
                              onClick={() => handleCaseTypeChange(type.value)}
                              className="cursor-pointer transition-all duration-200 hover:shadow-md"
                              style={{
                                border:
                                  form.getFieldValue("caseType") === type.value
                                    ? `2px solid ${type.color}`
                                    : "1px solid #e2e8f0",
                                borderRadius: "12px",
                                padding: "16px",
                                background:
                                  form.getFieldValue("caseType") === type.value
                                    ? `${type.color}08`
                                    : undefined,
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  style={{
                                    color: type.color,
                                    fontSize: "18px",
                                  }}
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
                                {form.getFieldValue("caseType") ===
                                  type.value && (
                                  <CheckCircleOutlined
                                    style={{
                                      color: type.color,
                                      fontSize: "18px",
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          ))}
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
                          Select Client *
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
                                <div className="font-medium">{lawyer.name}</div>
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
                                const lawyer = lawyers.find((l) => l.id === id);
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
                </Col>

                {/* Case Summary Column */}
                <Col xs={24} lg={12}>
                  <Card
                    title={
                      <Space>
                        <CheckCircleOutlined style={{ color: "#2563eb" }} />
                        <span className="text-slate-800 dark:text-white font-semibold">
                          Case Summary
                        </span>
                      </Space>
                    }
                    className="bg-blue-50 dark:bg-slate-700/50 border border-blue-200 dark:border-slate-600 rounded-xl shadow-sm h-fit"
                    bodyStyle={{ padding: "24px" }}
                  >
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
                          ) // type `l`
                          .filter((l): l is CaseLawyer => Boolean(l)); // type guard  

                        return (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <Text className="text-slate-600 dark:text-slate-300 text-sm">
                                Status:
                              </Text>
                              <Text
                                className="font-medium text-sm"
                                style={{
                                  color:
                                    statusOptions.find(
                                      (s) => s.value === values.status
                                    )?.color || "#374151",
                                }}
                              >
                                {statusOptions.find(
                                  (s) => s.value === values.status
                                )?.label ||
                                  values.status ||
                                  "Open"}
                              </Text>
                            </div>

                            <div className="flex justify-between items-center">
                              <Text className="text-slate-600 dark:text-slate-300 text-sm">
                                Client:
                              </Text>
                              <Text className="text-slate-800 dark:text-white font-medium text-sm">
                                {selectedClient?.fullName || "Not selected"}
                              </Text>
                            </div>

                            <div className="flex justify-between items-center">
                              <Text className="text-slate-600 dark:text-slate-300 text-sm">
                                Lawyers:
                              </Text>
                              <Text className="text-slate-800 dark:text-white font-medium text-sm">
                                {selectedLawyers.length > 0
                                  ? `${selectedLawyers.length} assigned`
                                  : "None assigned"}
                              </Text>
                            </div>

                            {documents.length > 0 && (
                              <div className="flex justify-between items-center">
                                <Text className="text-slate-600 dark:text-slate-300 text-sm">
                                  Documents:
                                </Text>
                                <Text className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                                  {documents.length} files
                                </Text>
                              </div>
                            )}

                            {selectedLawyers.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                                <Text className="text-slate-700 dark:text-slate-200 font-medium text-sm block mb-2">
                                  Assigned Team:
                                </Text>
                                <div className="flex flex-wrap gap-2">
                                  {selectedLawyers.map((lawyer) => (
                                    <Tag
                                      key={lawyer.id}
                                      color="blue"
                                      className="rounded-lg px-3 py-1"
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
                  </Card>
                </Col>
              </Row>

              {/* Submit Section */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-center items-center gap-4">
                  <Button
                    size="large"
                    onClick={() => router.back()}
                    className="px-8 py-2 h-12 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    style={{ minWidth: "120px" }}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<SaveOutlined />}
                    loading={loading}
                    className="px-8 py-2 h-12 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    style={{
                      background: isHovered ? "#1d4ed8" : "#2563eb",
                      borderColor: isHovered ? "#1d4ed8" : "#2563eb",
                      transform: isHovered
                        ? "translateY(-1px)"
                        : "translateY(0)",
                      minWidth: "160px",
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    Create Case
                  </Button>
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
