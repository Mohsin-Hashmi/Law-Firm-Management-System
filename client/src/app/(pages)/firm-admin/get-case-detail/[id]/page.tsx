"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Avatar,
  Spin,
  Button,
  Tag,
  Divider,
  message,
  Statistic,
  Badge,
  Tooltip,
  List,
  Empty,
  Progress,
  Table,
  Modal,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  FileTextOutlined,
  CalendarOutlined,
  TeamOutlined,
  IdcardOutlined,
  FolderOpenOutlined,
  BankOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  DownloadOutlined,
  EyeOutlined,
  TrophyOutlined,
  BarChartOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { getCaseById } from "@/app/service/adminAPI";
import { toast } from "react-hot-toast";
import { ThemeProvider } from "next-themes";
import { use } from "react";


const { Title, Text } = Typography;

// Define interfaces based on your backend response
interface Client {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  profileImage?: string;
  clientType: string;
  status: string;
}

interface Lawyer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  specialization?: string;
  profileImage?: string;
}

interface CaseDocument {
  id: number;
  fileName: string;
  fileUrl: string;
  uploadDate: string;
  fileSize?: number;
  documentType?: string;
}

interface Case {
  id: number;
  title: string;
  description: string;
  caseType: string;
  status: string;
  priority: string;
  startDate: string;
  endDate?: string;
  estimatedValue?: number;
  actualValue?: number;
  createdAt: string;
  updatedAt: string;
  client: Client;
  lawyers: Lawyer[];
  documents: CaseDocument[];
}

import { useAppSelector } from "@/app/store/hooks";
import { RootState } from "@/app/store/store";

// Circular Progress Component
const CircularProgress = ({ 
  percent, 
  size = 120, 
  strokeWidth = 8, 
  color = "#059669",
  title,
  subtitle 
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  title: string;
  subtitle?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="dark:stroke-slate-600"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(5, 150, 105, 0.3))'
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-800 dark:text-white">
            {percent}%
          </span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <Text className="text-sm font-semibold text-slate-700 dark:text-white block">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </Text>
        )}
      </div>
    </div>
  );
};

export default function GetCaseDetail({
  params,
}: {
  params: Promise<{ firmId: string; id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const caseId = Number(id);
  const user = useAppSelector((state: RootState) => state.user.user);
  const firmId = user?.firmId;

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<CaseDocument | null>(null);

  useEffect(() => {
    if (caseId && firmId !== undefined) {
      fetchCaseDetail();
    }
  }, [caseId, firmId]);

  const fetchCaseDetail = async () => {
    if (firmId === undefined) return;
    try {
      setLoading(true);
      const data = await getCaseById(caseId);
      setCaseData(data.case);
      toast.success("Successfully fetched case detail");
    } catch (error) {
      console.error("Error fetching case detail:", error);
      toast.error("Failed to fetch case detail");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "ongoing":
      case "open":
        return { color: "#059669", bg: "#f0fdf4", border: "#bbf7d0" };
      case "closed":
      case "completed":
        return { color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" };
      case "pending":
        return { color: "#d97706", bg: "#fffbeb", border: "#fde68a" };
      case "suspended":
        return { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" };
      default:
        return { color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb" };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" };
      case "medium":
        return { color: "#d97706", bg: "#fffbeb", border: "#fde68a" };
      case "low":
        return { color: "#059669", bg: "#f0fdf4", border: "#bbf7d0" };
      default:
        return { color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb" };
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const getProgressValue = () => {
    if (!caseData) return 0;
    switch (caseData.status) {
      case "pending":
        return 25;
      case "active":
      case "ongoing":
      case "open":
        return 65;
      case "completed":
      case "closed":
        return 100;
      default:
        return 0;
    }
  };

  const handleDocumentView = (document: CaseDocument) => {
    setSelectedDocument(document);
    setDocumentModalVisible(true);
  };

  const documentColumns = [
    {
      title: 'Document',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (text: string, record: CaseDocument) => (
        <Space>
          <Avatar
            size={40}
            icon={<FileTextOutlined />}
            className="bg-blue-50 text-blue-600 border border-blue-200"
          />
          <div>
            <Text className="font-semibold text-slate-800 dark:text-white block">
              {text}
            </Text>
            {record.documentType && (
              <Tag
                // size="small"
                className="mt-1"
                color="blue"
              >
                {record.documentType}
              </Tag>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size: number) => (
        <Text className="text-slate-600 dark:text-slate-300">
          {formatFileSize(size)}
        </Text>
      ),
    },
    {
      title: 'Upload Date',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      render: (date: string) => (
        <Text className="text-slate-600 dark:text-slate-300">
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: any, record: CaseDocument) => (
        <Space>
          <Tooltip title="View Document">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleDocumentView(record)}
              className="text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg"
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => {
                const link = document.createElement("a");
                link.href = `http://localhost:5000${record.fileUrl}`;
                link.download = record.fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-lg"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex justify-center items-center transition-colors duration-300">
          <div className="text-center">
            <Spin size="large" />
            <div className="mt-4">
              <Text className="text-slate-600 dark:text-slate-400">
                Loading case details...
              </Text>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!caseData) {
    return (
      <DashboardLayout>
        <div className="min-h-screen  flex justify-center items-center transition-colors duration-300">
          <div style={{ textAlign: "center" }}>
            <FolderOpenOutlined
              style={{
                fontSize: "64px",
                color: "#9ca3af",
                marginBottom: "16px",
              }}
            />
            <Title level={3} className="text-slate-600 dark:text-slate-400">
              Case Not Found
            </Title>
            <Text className="text-slate-600 dark:text-slate-400 text-base">
              The requested case could not be found.
            </Text>
            <br />
            <Button
              type="primary"
              onClick={() => router.back()}
              style={{ marginTop: "16px" }}
            >
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statusStyle = getStatusColor(caseData.status);
  const priorityStyle = getPriorityColor(caseData.priority);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DashboardLayout>
        <div className="min-h-screen p-6  transition-colors duration-300">
          <div className="max-w-full">
            
            {/* Professional Header */}
            <Card
              className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-slate-800 dark:to-slate-900 border-none rounded-2xl shadow-xl mb-8"
              bodyStyle={{ padding: "32px" }}
            >
              <Row align="middle" justify="space-between">
                <Col>
                  <Space size="large">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center border-2 bg-white/15 border-white/20 backdrop-blur-sm">
                      <SafetyOutlined className="text-[32px] text-white" />
                    </div>
                    <div>
                      <Title
                        level={1}
                        className="!text-white !m-0 text-4xl font-bold tracking-tight"
                      >
                        {caseData.title}
                      </Title>
                      <Text className="text-white/90 text-lg font-medium">
                        Case ID: #{caseData.id?.toString().padStart(6, "0")}
                      </Text>
                      <div className="mt-3">
                        <Space size="middle" wrap>
                          <Tag
                            style={{
                              backgroundColor: "rgba(255,255,255,0.2)",
                              color: "white",
                              border: "1px solid rgba(255,255,255,0.3)",
                              borderRadius: "8px",
                              padding: "4px 12px",
                              fontSize: "13px",
                              fontWeight: "500",
                              backdropFilter: "blur(10px)",
                            }}
                          >
                            <BankOutlined className="mr-1" />
                            {caseData.caseType}
                          </Tag>
                          <Badge
                            status="success"
                            text={
                              <span className="text-white/90 text-sm font-medium">
                                {caseData.status}
                              </span>
                            }
                          />
                        </Space>
                      </div>
                    </div>
                  </Space>
                </Col>
                <Col>
                  <Space size="middle">
                    <Button
                      icon={<ArrowLeftOutlined />}
                      onClick={() => router.back()}
                      size="large"
                      className="rounded-xl font-semibold px-6 h-12 bg-white/20 border-white/30 text-white backdrop-blur hover:!bg-white/30 hover:!text-white"
                    >
                      Back
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      icon={<EditOutlined />}
                      onClick={() =>
                        router.push(`/firm-admin/edit-case/${caseData.id}`)
                      }
                      className="rounded-xl font-semibold px-6 h-12 bg-white text-blue-600 shadow-lg hover:!bg-white hover:!text-blue-700"
                    >
                      Edit Case
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Progress and Key Metrics */}
            <Row gutter={[24, 24]} className="mb-8">
              <Col xs={24} lg={8}>
                <Card
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  bodyStyle={{ padding: "32px", textAlign: "center" }}
                >
                  <CircularProgress
                    percent={getProgressValue()}
                    title="Case Progress"
                    subtitle="Overall completion"
                    color="#059669"
                  />
                </Card>
              </Col>
              
              <Col xs={24} lg={8}>
                <Card
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  bodyStyle={{ padding: "32px", textAlign: "center" }}
                >
                  <CircularProgress
                    percent={caseData.lawyers?.length ? (caseData.lawyers.length / 5) * 100 : 0}
                    title="Team Utilization"
                    subtitle={`${caseData.lawyers?.length || 0} lawyers assigned`}
                    color="#1e40af"
                  />
                </Card>
              </Col>
              
              <Col xs={24} lg={8}>
                <Card
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  bodyStyle={{ padding: "32px", textAlign: "center" }}
                >
                  <CircularProgress
                    percent={caseData.documents?.length ? Math.min((caseData.documents.length / 10) * 100, 100) : 0}
                    title="Documentation"
                    subtitle={`${caseData.documents?.length || 0} documents`}
                    color="#7c3aed"
                  />
                </Card>
              </Col>
            </Row>

            {/* Case Overview */}
            <Card
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 mb-8"
              title={
                <Space>
                  <TrophyOutlined className="text-blue-600 dark:text-blue-400" />
                  <span className="text-slate-900 dark:text-white font-bold text-lg">
                    Case Overview
                  </span>
                </Space>
              }
              bodyStyle={{ padding: "32px" }}
            >
              <Row gutter={[32, 32]}>
                <Col xs={24} lg={16}>
                  <Space direction="vertical" size="large" style={{ width: "100%" }}>
                    <div>
                      <Space size="middle" wrap className="mb-4">
                        <Tag
                          style={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            border: `1px solid ${statusStyle.border}`,
                            borderRadius: "8px",
                            padding: "6px 16px",
                            fontSize: "14px",
                            fontWeight: "600",
                          }}
                        >
                          {caseData.status}
                        </Tag>
                        <Tag
                          style={{
                            backgroundColor: priorityStyle.bg,
                            color: priorityStyle.color,
                            border: `1px solid ${priorityStyle.border}`,
                            borderRadius: "8px",
                            padding: "6px 16px",
                            fontSize: "14px",
                            fontWeight: "600",
                          }}
                        >
                          {caseData.priority} Priority
                        </Tag>
                      </Space>
                      
                      <div className="mb-6">
                        <Text className="text-slate-600 dark:text-slate-400 text-sm font-semibold block mb-2">
                          Case Description
                        </Text>
                        <Text className="text-slate-800 dark:text-white text-base leading-relaxed">
                          {caseData.description}
                        </Text>
                      </div>
                    </div>
                  </Space>
                </Col>

                <Col xs={24} lg={8}>
                  <Card
                    bordered={false}
                    className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl"
                    bodyStyle={{ padding: "24px" }}
                  >
                    <Space direction="vertical" style={{ width: "100%" }} size="large">
                      <Statistic
                        title={
                          <span className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                            Estimated Value
                          </span>
                        }
                        value={caseData.estimatedValue || 0}
                        prefix="$"
                        valueStyle={{
                          color: "#059669",
                          fontSize: "24px",
                          fontWeight: "700",
                        }}
                        formatter={(value) => `${Number(value).toLocaleString()}`}
                      />
                      
                      <Statistic
                        title={
                          <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
                            Actual Value
                          </span>
                        }
                        value={caseData.actualValue || 0}
                        prefix="$"
                        valueStyle={{
                          color: "#1e40af",
                          fontSize: "24px",
                          fontWeight: "700",
                        }}
                        formatter={(value) => `${Number(value).toLocaleString()}`}
                      />
                    </Space>
                  </Card>
                </Col>
              </Row>
            </Card>

            {/* Client and Team Information */}
            <Row gutter={[24, 24]} className="mb-8">
              {/* Client Information */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <UserOutlined className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-slate-900 dark:text-white font-bold">
                        Client Information
                      </span>
                    </Space>
                  }
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-full"
                  bodyStyle={{ padding: "24px" }}
                >
                  <div className="text-center mb-6">
                    <Avatar
                      size={80}
                      src={
                        caseData.client?.profileImage
                          ? `http://localhost:5000${caseData.client.profileImage}`
                          : undefined
                      }
                      icon={<UserOutlined />}
                      className="bg-gradient-to-br from-emerald-100 to-emerald-200 border-2 border-emerald-300 shadow-lg mb-4"
                    />
                    <Title level={4} className="text-slate-800 dark:text-white m-0">
                      {caseData.client?.fullName}
                    </Title>
                    <Tag
                      className="mt-2"
                      color="green"
                    >
                      {caseData.client?.clientType}
                    </Tag>
                  </div>

                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center mb-2">
                        <MailOutlined className="text-emerald-600 mr-2" />
                        <Text className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                          Email
                        </Text>
                      </div>
                      <Text
                        className="text-slate-800 dark:text-white font-medium"
                        copyable={{ tooltips: ["Copy email", "Copied!"] }}
                      >
                        {caseData.client?.email}
                      </Text>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center mb-2">
                        <PhoneOutlined className="text-emerald-600 mr-2" />
                        <Text className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                          Phone
                        </Text>
                      </div>
                      <Text
                        className="text-slate-800 dark:text-white font-medium"
                        copyable={{ tooltips: ["Copy phone", "Copied!"] }}
                      >
                        {caseData.client?.phone}
                      </Text>
                    </div>

                    {caseData.client?.address && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex items-center mb-2">
                          <HomeOutlined className="text-emerald-600 mr-2" />
                          <Text className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                            Address
                          </Text>
                        </div>
                        <Text className="text-slate-800 dark:text-white font-medium">
                          {caseData.client.address}
                        </Text>
                      </div>
                    )}
                  </Space>
                </Card>
              </Col>

              {/* Assigned Lawyers */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <TeamOutlined className="text-blue-600 dark:text-blue-400" />
                      <span className="text-slate-900 dark:text-white font-bold">
                        Legal Team ({caseData.lawyers?.length || 0})
                      </span>
                    </Space>
                  }
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-full"
                  bodyStyle={{ padding: "24px" }}
                >
                  {caseData.lawyers && caseData.lawyers.length > 0 ? (
                    <List
                      dataSource={caseData.lawyers}
                      renderItem={(lawyer) => (
                        <List.Item className="border-none px-0 py-3">
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                size={48}
                                src={
                                  lawyer.profileImage
                                    ? `http://localhost:5000${lawyer.profileImage}`
                                    : undefined
                                }
                                icon={<UserOutlined />}
                                className="bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300"
                              />
                            }
                            title={
                              <Text className="text-slate-800 dark:text-white font-semibold text-base">
                                {lawyer.fullName}
                              </Text>
                            }
                            description={
                              <Space direction="vertical" size="small">
                                <Text className="text-slate-600 dark:text-slate-400 text-sm">
                                  {lawyer.email}
                                </Text>
                                <Text className="text-slate-600 dark:text-slate-400 text-sm">
                                  {lawyer.phone}
                                </Text>
                                {lawyer.specialization && (
                                  <Tag
                                    color="blue"
                                    // size="small"
                                    className="text-xs"
                                  >
                                    {lawyer.specialization}
                                  </Tag>
                                )}
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty
                      image={<TeamOutlined style={{ fontSize: "48px", color: "#d1d5db" }} />}
                      description="No lawyers assigned"
                    />
                  )}
                </Card>
              </Col>
            </Row>

            {/* Case Documents Table */}
            <Card
              title={
                <Space>
                  <FileTextOutlined className="text-purple-600 dark:text-purple-400" />
                  <span className="text-slate-900 dark:text-white font-bold text-lg">
                    Case Documents ({caseData.documents?.length || 0})
                  </span>
                </Space>
              }
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 mb-8"
              bodyStyle={{ padding: "24px" }}
            >
              {caseData.documents && caseData.documents.length > 0 ? (
                <Table
                  dataSource={caseData.documents}
                  columns={documentColumns}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} documents`,
                  }}
                  className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:dark:bg-slate-700 [&_.ant-table-thead>tr>th]:border-slate-200 [&_.ant-table-thead>tr>th]:dark:border-slate-600"
                />
              ) : (
                <Empty
                  image={<FileTextOutlined style={{ fontSize: "64px", color: "#d1d5db" }} />}
                  description={
                    <span className="text-slate-600 dark:text-slate-400 text-lg">
                      No documents uploaded for this case
                    </span>
                  }
                >
                  <Button
                    type="primary"
                    icon={<FileTextOutlined />}
                    className="bg-purple-600 hover:bg-purple-700 border-purple-600 rounded-lg mt-4"
                  >
                    Upload First Document
                  </Button>
                </Empty>
              )}
            </Card>

            {/* Timeline and Financial Summary */}
            <Row gutter={[24, 24]} className="mb-8">
              {/* Case Timeline */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <CalendarOutlined className="text-amber-600 dark:text-amber-400" />
                      <span className="text-slate-900 dark:text-white font-bold">
                        Case Timeline
                      </span>
                    </Space>
                  }
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-full"
                  bodyStyle={{ padding: "24px" }}
                >
                  <Space direction="vertical" size="large" style={{ width: "100%" }}>
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                      <Text className="text-amber-700 dark:text-amber-300 text-sm font-semibold block mb-1">
                        Case Created
                      </Text>
                      <Text className="text-slate-800 dark:text-white text-lg font-bold">
                        {new Date(caseData.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Text>
                      <Text className="text-slate-600 dark:text-slate-400 text-sm">
                        {new Date(caseData.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <Text className="text-blue-700 dark:text-blue-300 text-sm font-semibold block mb-1">
                        Start Date
                      </Text>
                      <Text className="text-slate-800 dark:text-white text-lg font-bold">
                        {new Date(caseData.startDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Text>
                    </div>

                    {caseData.endDate && (
                      <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <Text className="text-emerald-700 dark:text-emerald-300 text-sm font-semibold block mb-1">
                          End Date
                        </Text>
                        <Text className="text-slate-800 dark:text-white text-lg font-bold">
                          {new Date(caseData.endDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </Text>
                      </div>
                    )}

                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                      <Text className="text-purple-700 dark:text-purple-300 text-sm font-semibold block mb-1">
                        Last Updated
                      </Text>
                      <Text className="text-slate-800 dark:text-white text-lg font-bold">
                        {new Date(caseData.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Text>
                      <Text className="text-slate-600 dark:text-slate-400 text-sm">
                        {new Date(caseData.updatedAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-700 dark:to-gray-700 rounded-xl border border-slate-200 dark:border-slate-600">
                      <Text className="text-slate-700 dark:text-slate-300 text-sm font-semibold block mb-1">
                        Duration
                      </Text>
                      <Text className="text-slate-800 dark:text-white text-lg font-bold">
                        {caseData.endDate
                          ? Math.floor(
                              (new Date(caseData.endDate).getTime() -
                                new Date(caseData.startDate).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )
                          : Math.floor(
                              (new Date().getTime() -
                                new Date(caseData.startDate).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}{" "}
                        days
                      </Text>
                      <Text className="text-slate-600 dark:text-slate-400 text-sm">
                        {caseData.endDate ? "Total duration" : "Ongoing"}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>

              {/* Financial Summary */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <DollarOutlined className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-slate-900 dark:text-white font-bold">
                        Financial Summary
                      </span>
                    </Space>
                  }
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-full"
                  bodyStyle={{ padding: "24px" }}
                >
                  <Space direction="vertical" size="large" style={{ width: "100%" }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Card
                          bordered={false}
                          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700"
                          bodyStyle={{ padding: "20px", textAlign: "center" }}
                        >
                          <Statistic
                            title={
                              <span className="text-blue-700 dark:text-blue-300 text-xs font-bold">
                                ESTIMATED VALUE
                              </span>
                            }
                            value={caseData.estimatedValue || 0}
                            prefix="$"
                            valueStyle={{
                              color: "#1e40af",
                              fontSize: "20px",
                              fontWeight: "800",
                            }}
                            formatter={(value) => `${Number(value).toLocaleString()}`}
                          />
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card
                          bordered={false}
                          className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl border border-emerald-200 dark:border-emerald-700"
                          bodyStyle={{ padding: "20px", textAlign: "center" }}
                        >
                          <Statistic
                            title={
                              <span className="text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                                ACTUAL VALUE
                              </span>
                            }
                            value={caseData.actualValue || 0}
                            prefix="$"
                            valueStyle={{
                              color: "#059669",
                              fontSize: "20px",
                              fontWeight: "800",
                            }}
                            formatter={(value) => `${Number(value).toLocaleString()}`}
                          />
                        </Card>
                      </Col>
                    </Row>

                    {caseData.estimatedValue && caseData.actualValue && (
                      <Card
                        bordered={false}
                        className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-200 dark:border-slate-600"
                        bodyStyle={{ padding: "20px" }}
                      >
                        <div className="text-center">
                          <Text className="text-slate-600 dark:text-slate-400 text-sm font-semibold block mb-2">
                            Value Difference
                          </Text>
                          <Text
                            className="text-2xl font-bold"
                            style={{
                              color:
                                caseData.actualValue >= caseData.estimatedValue
                                  ? "#059669"
                                  : "#dc2626",
                            }}
                          >
                            {caseData.actualValue >= caseData.estimatedValue ? "+" : ""}
                            $
                            {Math.abs(
                              caseData.actualValue - caseData.estimatedValue
                            ).toLocaleString()}
                          </Text>
                          <Text
                            className="text-sm font-medium"
                            style={{
                              color:
                                caseData.actualValue >= caseData.estimatedValue
                                  ? "#059669"
                                  : "#dc2626",
                            }}
                          >
                            ({caseData.actualValue >= caseData.estimatedValue ? "+" : ""}
                            {(
                              (Math.abs(
                                caseData.actualValue - caseData.estimatedValue
                              ) /
                                caseData.estimatedValue) *
                              100
                            ).toFixed(1)}
                            %)
                          </Text>
                        </div>
                      </Card>
                    )}

                    <Card
                      bordered={false}
                      className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl border border-purple-200 dark:border-purple-700"
                      bodyStyle={{ padding: "20px" }}
                    >
                      <Row gutter={16}>
                        <Col span={12} className="text-center">
                          <Text className="text-purple-700 dark:text-purple-300 text-xs font-bold block mb-1">
                            PRIORITY LEVEL
                          </Text>
                          <Text className="text-purple-800 dark:text-purple-200 text-lg font-bold">
                            {caseData.priority}
                          </Text>
                        </Col>
                        <Col span={12} className="text-center">
                          <Text className="text-purple-700 dark:text-purple-300 text-xs font-bold block mb-1">
                            CASE TYPE
                          </Text>
                          <Text className="text-purple-800 dark:text-purple-200 text-lg font-bold">
                            {caseData.caseType}
                          </Text>
                        </Col>
                      </Row>
                    </Card>
                  </Space>
                </Card>
              </Col>
            </Row>

            {/* Action Buttons */}
            <Card
              className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg"
              bodyStyle={{ padding: "32px" }}
            >
              <Row justify="center">
                <Col>
                  <Space size="large" wrap>
                    <Button
                      type="primary"
                      size="large"
                      icon={<EditOutlined />}
                      onClick={() =>
                        router.push(`/firm-admin/edit-case/${caseId}`)
                      }
                      className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 border-none rounded-xl font-semibold px-8 h-12 shadow-lg"
                    >
                      Edit Case
                    </Button>

                    <Button
                      size="large"
                      icon={<FolderOpenOutlined />}
                      onClick={() => router.push("/firm-admin/get-cases")}
                      className="rounded-xl border-2 border-slate-300 dark:border-slate-600 font-semibold px-8 h-12 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      View All Cases
                    </Button>

                    <Button
                      size="large"
                      icon={<UserOutlined />}
                      onClick={() =>
                        router.push(
                          `/firm-admin/get-client/${caseData.client.id}`
                        )
                      }
                      className="rounded-xl border-2 border-blue-300 dark:border-blue-600 font-semibold px-8 h-12 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      View Client Profile
                    </Button>

                    <Button
                      size="large"
                      icon={<FileTextOutlined />}
                      onClick={() => {
                        toast.success("Document upload feature coming soon");
                      }}
                      className="rounded-xl border-2 border-purple-300 dark:border-purple-600 font-semibold px-8 h-12 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                    >
                      Upload Document
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </div>

          {/* Document View Modal */}
          <Modal
            title={
              <Space>
                <FileTextOutlined className="text-blue-600" />
                <span className="font-semibold">Document Viewer</span>
              </Space>
            }
            open={documentModalVisible}
            onCancel={() => {
              setDocumentModalVisible(false);
              setSelectedDocument(null);
            }}
            footer={[
              <Button
                key="download"
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => {
                  if (selectedDocument) {
                    const link = document.createElement("a");
                    link.href = `http://localhost:5000${selectedDocument.fileUrl}`;
                    link.download = selectedDocument.fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
              >
                Download
              </Button>,
              <Button
                key="close"
                onClick={() => {
                  setDocumentModalVisible(false);
                  setSelectedDocument(null);
                }}
              >
                Close
              </Button>,
            ]}
            width="80%"
            style={{ maxWidth: "1200px" }}
          >
            {selectedDocument && (
              <div className="text-center">
                <div className="mb-4">
                  <Title level={4} className="text-slate-800 dark:text-white">
                    {selectedDocument.fileName}
                  </Title>
                  <Space size="middle">
                    <Text className="text-slate-600 dark:text-slate-400">
                      Size: {formatFileSize(selectedDocument.fileSize)}
                    </Text>
                    <Text className="text-slate-600 dark:text-slate-400">
                      Uploaded: {new Date(selectedDocument.uploadDate).toLocaleDateString()}
                    </Text>
                    {selectedDocument.documentType && (
                      <Tag color="blue">{selectedDocument.documentType}</Tag>
                    )}
                  </Space>
                </div>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8">
                  <iframe
                    src={`http://localhost:5000${selectedDocument.fileUrl}`}
                    width="100%"
                    height="600px"
                    className="rounded-lg"
                    title={selectedDocument.fileName}
                  />
                </div>
              </div>
            )}
          </Modal>
        </div>
      </DashboardLayout>
    </ThemeProvider>
  );
}