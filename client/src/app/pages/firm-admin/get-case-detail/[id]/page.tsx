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

  useEffect(() => {
    if (caseId && firmId !== undefined) {
      fetchCaseDetail();
    }
  }, [caseId, firmId]);

  const fetchCaseDetail = async () => {
    if (firmId === undefined) return; // extra safeguard
    try {
      setLoading(true);
      const data = await getCaseById(firmId, caseId);
      console.log("Case data is:", data);
      setCaseData(data);
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
        return 65;
      case "completed":
      case "closed":
        return 100;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex justify-center items-center transition-colors duration-300">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!caseData) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex justify-center items-center transition-colors duration-300">
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
        <div className="min-h-screen p-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 [&_.ant-typography]:dark:!text-white [&_.ant-card-head-title]:dark:!text-white">
          <div className="max-w-[1400px] mx-auto">
            {/* Header Section */}
            <Card
              className="bg-blue-600 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
              bodyStyle={{ padding: "32px" }}
            >
              <Row align="middle" justify="space-between">
                <Col>
                  <Space size="large">
                    <div
                      className="w-20 h-20 flex items-center justify-center rounded-2xl 
                     border-2 border-white/30 bg-white/10 backdrop-blur-md"
                    >
                      <FolderOpenOutlined className="text-white text-3xl" />
                    </div>
                    <div>
                      <Title
                        level={1}
                        className="!text-white !m-0 text-3xl font-semibold tracking-tight"
                      >
                        Case Details
                      </Title>
                      <Text className="text-white/80 text-lg">
                        Comprehensive case information and management
                      </Text>
                    </div>
                  </Space>
                </Col>
                <Col>
                  <Space size="middle">
                    <Button
                      icon={<ArrowLeftOutlined />}
                      onClick={() => router.back()}
                      size="large"
                      className="rounded-xl font-semibold px-6 h-12 
                     bg-white/20 border-white/30 text-white backdrop-blur 
                     hover:!bg-white/30 hover:!text-white"
                    >
                      Back
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      icon={<EditOutlined />}
                      onClick={() =>
                        router.push(
                          `/pages/firm-admin/edit-case/${caseData.id}`
                        )
                      }
                      className="rounded-xl font-semibold px-6 h-12 
                     bg-white text-blue-600 shadow-md"
                    >
                      Edit Case
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Case Overview Card */}
            <Card
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
              bodyStyle={{ padding: "40px" }}
            >
              <Row gutter={[32, 32]} align="top">
                {/* Case Basic Info */}
                <Col xs={24} lg={16}>
                  <div>
                    <div style={{ marginBottom: "24px" }}>
                      <Title
                        level={2}
                        style={{ marginBottom: "8px", color: "#111827" }}
                      >
                        {caseData.title}
                      </Title>
                      <Space size="middle" wrap>
                        <Tag
                          style={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            border: `1px solid ${statusStyle.border}`,
                            borderRadius: "8px",
                            padding: "6px 14px",
                            fontSize: "14px",
                            fontWeight: "500",
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
                            padding: "6px 14px",
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          {caseData.priority} Priority
                        </Tag>
                        <Tag
                          color="#f0fdf4"
                          style={{
                            color: "#059669",
                            border: "1px solid #bbf7d0",
                            borderRadius: "8px",
                            padding: "6px 14px",
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          <BankOutlined style={{ marginRight: "6px" }} />
                          {caseData.caseType}
                        </Tag>
                      </Space>
                    </div>

                    <div style={{ marginBottom: "24px" }}>
                      <Text
                        style={{
                          fontSize: "14px",
                          color: "#64748b",
                          fontWeight: "500",
                        }}
                      >
                        Case Description
                      </Text>
                      <div style={{ marginTop: "8px" }}>
                        <Text
                          style={{
                            fontSize: "16px",
                            color: "#111827",
                            lineHeight: "1.6",
                          }}
                        >
                          {caseData.description}
                        </Text>
                      </div>
                    </div>

                    <div style={{ marginTop: "24px" }}>
                      <Text
                        style={{
                          fontSize: "14px",
                          color: "#64748b",
                          fontWeight: "500",
                        }}
                      >
                        Case Progress
                      </Text>
                      <Progress
                        percent={getProgressValue()}
                        status={
                          caseData.status === "completed"
                            ? "success"
                            : "active"
                        }
                        strokeColor="#059669"
                        style={{ marginTop: "8px" }}
                      />
                    </div>
                  </div>
                </Col>

                {/* Case Statistics */}
                <Col xs={24} lg={8}>
                  <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%" }}
                  >
                    <Card
                      bordered={false}
                      className="bg-slate-50 dark:bg-slate-700 rounded-xl"
                      bodyStyle={{ padding: "20px" }}
                    >
                      <Statistic
                        title={
                          <span
                            style={{
                              color: "#059669",
                              fontSize: "14px",
                              fontWeight: "600",
                            }}
                          >
                            Case ID
                          </span>
                        }
                        value={`#${caseData.id?.toString().padStart(6, "0")}`}
                        valueStyle={{
                          color: "#059669",
                          fontSize: "24px",
                          fontWeight: "700",
                        }}
                        prefix={<IdcardOutlined style={{ color: "#059669" }} />}
                      />
                    </Card>

                    <Card
                      bordered={false}
                      className="bg-slate-50 dark:bg-slate-700 rounded-xl"
                      bodyStyle={{ padding: "20px" }}
                    >
                      <Statistic
                        title={
                          <span
                            style={{
                              color: "#1e40af",
                              fontSize: "14px",
                              fontWeight: "600",
                            }}
                          >
                            Assigned Lawyers
                          </span>
                        }
                        value={caseData.lawyers?.length || 0}
                        valueStyle={{
                          color: "#1e40af",
                          fontSize: "24px",
                          fontWeight: "700",
                        }}
                        prefix={<TeamOutlined style={{ color: "#1e40af" }} />}
                      />
                    </Card>

                    <Card
                      bordered={false}
                      className="bg-slate-50 dark:bg-slate-700 rounded-xl"
                      bodyStyle={{ padding: "20px" }}
                    >
                      <Statistic
                        title={
                          <span
                            style={{
                              color: "#7c3aed",
                              fontSize: "14px",
                              fontWeight: "600",
                            }}
                          >
                            Documents
                          </span>
                        }
                        value={caseData.documents?.length || 0}
                        valueStyle={{
                          color: "#7c3aed",
                          fontSize: "24px",
                          fontWeight: "700",
                        }}
                        prefix={
                          <FileTextOutlined style={{ color: "#7c3aed" }} />
                        }
                      />
                    </Card>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Performance Statistics */}
            <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  style={{
                    borderRadius: "16px",
                    border: "1px solid #bbf7d0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    background:
                      "linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)",
                  }}
                  bodyStyle={{ padding: "28px" }}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "#059669",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        Start Date
                      </span>
                    }
                    value={new Date(caseData.startDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                    valueStyle={{
                      color: "#059669",
                      fontSize: "18px",
                      fontWeight: "700",
                    }}
                    prefix={<CalendarOutlined style={{ color: "#059669" }} />}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Card
                  style={{
                    borderRadius: "16px",
                    border: "1px solid #dbeafe",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    background:
                      "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                  }}
                  bodyStyle={{ padding: "28px" }}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "#1e40af",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        {caseData.endDate ? "End Date" : "Duration"}
                      </span>
                    }
                    value={
                      caseData.endDate
                        ? new Date(caseData.endDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                        : `${Math.floor(
                            (new Date().getTime() -
                              new Date(caseData.startDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )} days`
                    }
                    valueStyle={{
                      color: "#1e40af",
                      fontSize: "18px",
                      fontWeight: "700",
                    }}
                    prefix={
                      <ClockCircleOutlined style={{ color: "#1e40af" }} />
                    }
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Card
                  style={{
                    borderRadius: "16px",
                    border: "1px solid #fde68a",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    background:
                      "linear-gradient(135deg, #fffbeb 0%, #fde68a 100%)",
                  }}
                  bodyStyle={{ padding: "28px" }}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "#d97706",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        Estimated Value
                      </span>
                    }
                    value={caseData.estimatedValue || 0}
                    prefix="$"
                    valueStyle={{
                      color: "#d97706",
                      fontSize: "20px",
                      fontWeight: "700",
                    }}
                    formatter={(value) => `${Number(value).toLocaleString()}`}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Card
                  style={{
                    borderRadius: "16px",
                    border: "1px solid #e9d5ff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    background:
                      "linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%)",
                  }}
                  bodyStyle={{ padding: "28px" }}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "#7c3aed",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        Actual Value
                      </span>
                    }
                    value={caseData.actualValue || 0}
                    prefix="$"
                    valueStyle={{
                      color: "#7c3aed",
                      fontSize: "20px",
                      fontWeight: "700",
                    }}
                    formatter={(value) => `${Number(value).toLocaleString()}`}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[24, 24]}>
              {/* Client Information */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <UserOutlined style={{ color: "#059669" }} />
                      <span style={{ color: "#111827", fontWeight: "600" }}>
                        Client Information
                      </span>
                    </Space>
                  }
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                  headStyle={{
                    borderBottom: "1px solid #f1f5f9",
                    background: "#fafbfc",
                    borderRadius: "16px 16px 0 0",
                  }}
                  bodyStyle={{ padding: "24px" }}
                >
                  <div style={{ textAlign: "center", marginBottom: "24px" }}>
                    {/* <Avatar
                      size={80}
                      src={
                        caseData.client.profileImage
                          ? `http://localhost:5000${caseData.client.profileImage}`
                          : undefined
                      }
                      icon={!caseData.client.profileImage && <UserOutlined />}
                      style={{
                        background: caseData.client.profileImage
                          ? "transparent"
                          : "#f1f5f9",
                        border: "2px solid #e5e7eb",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        marginBottom: "16px",
                      }}
                    /> */}
                    <Title level={4} style={{ margin: 0, color: "#111827" }}>
                      {caseData?.client?.fullName}
                    </Title>
                     <Tag
                      style={{
                        backgroundColor: "#f0fdf4",
                        color: "#059669",
                        border: "1px solid #bbf7d0",
                        borderRadius: "8px",
                        marginTop: "8px",
                      }}
                    >
                      {caseData?.client?.clientType}
                    </Tag> 
                  </div>

                  <Space
                    direction="vertical"
                    size="middle"
                    style={{ width: "100%" }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <MailOutlined
                          style={{
                            color: "#059669",
                            fontSize: "16px",
                            marginRight: "8px",
                          }}
                        />
                        <Text
                          style={{
                            fontSize: "14px",
                            color: "#64748b",
                            fontWeight: "500",
                          }}
                        >
                          Email
                        </Text>
                      </div>
                       <Text
                        style={{
                          fontSize: "16px",
                          color: "#111827",
                          fontWeight: "500",
                        }}
                        copyable={{ tooltips: ["Copy email", "Email copied!"] }}
                      >
                        {caseData?.client?.email}
                      </Text> 
                    </div>

                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <PhoneOutlined
                          style={{
                            color: "#059669",
                            fontSize: "16px",
                            marginRight: "8px",
                          }}
                        />
                        <Text
                          style={{
                            fontSize: "14px",
                            color: "#64748b",
                            fontWeight: "500",
                          }}
                        >
                          Phone
                        </Text>
                      </div>
                      <Text
                        style={{
                          fontSize: "16px",
                          color: "#111827",
                          fontWeight: "500",
                        }}
                        copyable={{ tooltips: ["Copy phone", "Phone copied!"] }}
                      >
                        {caseData?.client?.phone}
                      </Text>
                    </div>

                    {caseData?.client?.address && (
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <HomeOutlined
                            style={{
                              color: "#059669",
                              fontSize: "16px",
                              marginRight: "8px",
                            }}
                          />
                          <Text
                            style={{
                              fontSize: "14px",
                              color: "#64748b",
                              fontWeight: "500",
                            }}
                          >
                            Address
                          </Text>
                        </div>
                        <Text
                          style={{
                            fontSize: "16px",
                            color: "#111827",
                            fontWeight: "500",
                          }}
                        >
                          {caseData?.client?.address}
                        </Text>
                      </div>
                    )}

                    <Button
                      type="link"
                      onClick={() =>
                        router.push(
                          `/pages/firm-admin/get-client/${caseData.client.id}`
                        )
                      }
                      style={{ padding: 0, marginTop: "16px" }}
                    >
                      View Full Client Profile →
                    </Button>
                  </Space>
                </Card>
              </Col>

              {/* Assigned Lawyers */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <TeamOutlined style={{ color: "#059669" }} />
                      <span style={{ color: "#111827", fontWeight: "600" }}>
                        Assigned Lawyers ({caseData?.lawyers?.length || 0})
                      </span>
                    </Space>
                  }
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                  headStyle={{
                    borderBottom: "1px solid #f1f5f9",
                    background: "#fafbfc",
                    borderRadius: "16px 16px 0 0",
                  }}
                  bodyStyle={{ padding: "24px" }}
                >
                  {caseData.lawyers && caseData?.lawyers.length > 0 ? (
                    <List
                      dataSource={caseData.lawyers}
                      renderItem={(lawyer) => (
                        <List.Item
                          style={{ border: "none", padding: "12px 0" }}
                        >
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
                                style={{
                                  background: lawyer.profileImage
                                    ? "transparent"
                                    : "#f1f5f9",
                                  border: "1px solid #e5e7eb",
                                }}
                              />
                            }
                            title={
                              <Text
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "600",
                                  color: "#111827",
                                }}
                              >
                                {lawyer.fullName}
                              </Text>
                            }
                            description={
                              <Space direction="vertical" size="small">
                                <Text
                                  style={{ color: "#64748b", fontSize: "14px" }}
                                >
                                  {lawyer.email}
                                </Text>
                                <Text
                                  style={{ color: "#64748b", fontSize: "14px" }}
                                >
                                  {lawyer.phone}
                                </Text>
                                {lawyer.specialization && (
                                  <Tag
                                    style={{
                                      backgroundColor: "#eff6ff",
                                      color: "#1e40af",
                                      border: "1px solid #dbeafe",
                                      borderRadius: "6px",
                                      fontSize: "12px", // 👈 instead of size="small"
                                      padding: "2px 8px",
                                    }}
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
                      image={
                        <TeamOutlined
                          style={{ fontSize: "48px", color: "#d1d5db" }}
                        />
                      }
                      description="No lawyers assigned to this case"
                    />
                  )}
                </Card>
              </Col>
            </Row>

            {/* Case Documents */}
            <Card
              title={
                <Space>
                  <FileTextOutlined style={{ color: "#059669" }} />
                  <span style={{ color: "#111827", fontWeight: "600" }}>
                    Case Documents ({caseData.documents?.length || 0})
                  </span>
                </Space>
              }
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
              headStyle={{
                borderBottom: "1px solid #f1f5f9",
                background: "#fafbfc",
                borderRadius: "16px 16px 0 0",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              {caseData.documents && caseData.documents.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {caseData.documents.map((document) => (
                    <Col xs={24} sm={12} lg={8} key={document.id}>
                      <Card
                        bordered={false}
                        className="bg-slate-50 dark:bg-slate-700 rounded-xl hover:shadow-md transition-all duration-300"
                        bodyStyle={{ padding: "20px" }}
                      >
                        <Space
                          direction="vertical"
                          size="middle"
                          style={{ width: "100%" }}
                        >
                          <div style={{ textAlign: "center" }}>
                            <FileTextOutlined
                              style={{
                                fontSize: "32px",
                                color: "#059669",
                                marginBottom: "8px",
                              }}
                            />
                          </div>

                          <div style={{ textAlign: "center" }}>
                            <Text
                              style={{
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#111827",
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              {document.fileName}
                            </Text>

                            {document.documentType && (
                              <Tag
                                style={{
                                  backgroundColor: "#eff6ff",
                                  color: "#1e40af",
                                  border: "1px solid #dbeafe",
                                  borderRadius: "6px",
                                  marginBottom: "8px",
                                  fontSize: "12px",
                                  padding: "2px 8px",
                                }}
                              >
                                {document.documentType}
                              </Tag>
                            )}

                            <Text
                              style={{
                                fontSize: "12px",
                                color: "#64748b",
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              {formatFileSize(document.fileSize)}
                            </Text>

                            <Text
                              style={{
                                fontSize: "12px",
                                color: "#64748b",
                                display: "block",
                              }}
                            >
                              {new Date(document.uploadDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </Text>
                          </div>

                          <Space
                            size="small"
                            style={{ width: "100%", justifyContent: "center" }}
                          >
                            <Tooltip title="View Document">
                              <Button
                                type="text"
                                icon={<EyeOutlined />}
                                onClick={() =>
                                  window.open(
                                    `http://localhost:5000${document.fileUrl}`,
                                    "_blank"
                                  )
                                }
                                style={{
                                  color: "#059669",
                                  border: "1px solid #bbf7d0",
                                  borderRadius: "8px",
                                }}
                              />
                            </Tooltip>
                            {/* <Tooltip title="Download Document">
                              <Button
                                type="text"
                                icon={<DownloadOutlined />}
                                onClick={() => {
                                  const link = document.createElement("a");
                                  link.href = `http://localhost:5000${document.fileUrl}`;
                                  link.download = document.fileName;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                                style={{
                                  color: "#1e40af",
                                  border: "1px solid #dbeafe",
                                  borderRadius: "8px",
                                }}
                              />
                            </Tooltip> */}
                          </Space>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty
                  image={
                    <FileTextOutlined
                      style={{ fontSize: "64px", color: "#d1d5db" }}
                    />
                  }
                  description={
                    <span style={{ color: "#64748b", fontSize: "16px" }}>
                      No documents uploaded for this case
                    </span>
                  }
                >
                  <Button
                    type="primary"
                    icon={<FileTextOutlined />}
                    style={{
                      background: "#059669",
                      borderColor: "#059669",
                      borderRadius: "8px",
                    }}
                  >
                    Upload First Document
                  </Button>
                </Empty>
              )}
            </Card>

            {/* Case Timeline & Dates */}
            <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <CalendarOutlined style={{ color: "#059669" }} />
                      <span style={{ color: "#111827", fontWeight: "600" }}>
                        Case Timeline
                      </span>
                    </Space>
                  }
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                  headStyle={{
                    borderBottom: "1px solid #f1f5f9",
                    background: "#fafbfc",
                    borderRadius: "16px 16px 0 0",
                  }}
                  bodyStyle={{ padding: "24px" }}
                >
                  <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%" }}
                  >
                    <div>
                      <Text
                        style={{
                          fontSize: "14px",
                          color: "#64748b",
                          fontWeight: "500",
                        }}
                      >
                        Case Created
                      </Text>
                      <br />
                      <Text
                        style={{
                          fontSize: "16px",
                          color: "#111827",
                          fontWeight: "500",
                        }}
                      >
                        {new Date(caseData.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </Text>
                    </div>

                    <div>
                      <Text
                        style={{
                          fontSize: "14px",
                          color: "#64748b",
                          fontWeight: "500",
                        }}
                      >
                        Start Date
                      </Text>
                      <br />
                      <Text
                        style={{
                          fontSize: "16px",
                          color: "#111827",
                          fontWeight: "500",
                        }}
                      >
                        {new Date(caseData.startDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </Text>
                    </div>

                    {caseData.endDate && (
                      <div>
                        <Text
                          style={{
                            fontSize: "14px",
                            color: "#64748b",
                            fontWeight: "500",
                          }}
                        >
                          End Date
                        </Text>
                        <br />
                        <Text
                          style={{
                            fontSize: "16px",
                            color: "#111827",
                            fontWeight: "500",
                          }}
                        >
                          {new Date(caseData.endDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </Text>
                      </div>
                    )}

                    <div>
                      <Text
                        style={{
                          fontSize: "14px",
                          color: "#64748b",
                          fontWeight: "500",
                        }}
                      >
                        Last Updated
                      </Text>
                      <br />
                      <Text
                        style={{
                          fontSize: "16px",
                          color: "#111827",
                          fontWeight: "500",
                        }}
                      >
                        {new Date(caseData.updatedAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>

              {/* Financial Information */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <DollarOutlined style={{ color: "#059669" }} />
                      <span style={{ color: "#111827", fontWeight: "600" }}>
                        Financial Information
                      </span>
                    </Space>
                  }
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                  headStyle={{
                    borderBottom: "1px solid #f1f5f9",
                    background: "#fafbfc",
                    borderRadius: "16px 16px 0 0",
                  }}
                  bodyStyle={{ padding: "24px" }}
                >
                  <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%" }}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Card
                          bordered={false}
                          className="bg-blue-50 dark:bg-slate-600 rounded-lg"
                          bodyStyle={{ padding: "16px", textAlign: "center" }}
                        >
                          <Text
                            style={{
                              fontSize: "12px",
                              color: "#64748b",
                              fontWeight: "500",
                            }}
                          >
                            Estimated Value
                          </Text>
                          <br />
                          <Text
                            style={{
                              fontSize: "20px",
                              color: "#1e40af",
                              fontWeight: "700",
                            }}
                          >
                            ${(caseData.estimatedValue || 0).toLocaleString()}
                          </Text>
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card
                          bordered={false}
                          className="bg-green-50 dark:bg-slate-600 rounded-lg"
                          bodyStyle={{ padding: "16px", textAlign: "center" }}
                        >
                          <Text
                            style={{
                              fontSize: "12px",
                              color: "#64748b",
                              fontWeight: "500",
                            }}
                          >
                            Actual Value
                          </Text>
                          <br />
                          <Text
                            style={{
                              fontSize: "20px",
                              color: "#059669",
                              fontWeight: "700",
                            }}
                          >
                            ${(caseData.actualValue || 0).toLocaleString()}
                          </Text>
                        </Card>
                      </Col>
                    </Row>

                    {caseData.estimatedValue && caseData.actualValue && (
                      <div>
                        <Text
                          style={{
                            fontSize: "14px",
                            color: "#64748b",
                            fontWeight: "500",
                          }}
                        >
                          Value Difference
                        </Text>
                        <br />
                        <Text
                          style={{
                            fontSize: "16px",
                            color:
                              caseData.actualValue >= caseData.estimatedValue
                                ? "#059669"
                                : "#dc2626",
                            fontWeight: "600",
                          }}
                        >
                          {caseData.actualValue >= caseData.estimatedValue
                            ? "+"
                            : "-"}
                          $
                          {Math.abs(
                            caseData.actualValue - caseData.estimatedValue
                          ).toLocaleString()}{" "}
                          (
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
                    )}
                  </Space>
                </Card>
              </Col>
            </Row>

            {/* Action Buttons */}
            <Card
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mt-[40px]"
              bodyStyle={{ padding: "24px" }}
            >
              <Row justify="center">
                <Col>
                  <Space size="large">
                    <Button
                      type="primary"
                      size="large"
                      icon={<EditOutlined />}
                      onClick={() =>
                        router.push(`/pages/firm-admin/edit-case/${caseId}`)
                      }
                      style={{
                        background: "#059669",
                        borderColor: "#059669",
                        borderRadius: "12px",
                        fontWeight: "600",
                        padding: "12px 32px",
                        height: "48px",
                        boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
                      }}
                    >
                      Edit Case
                    </Button>

                    <Button
                      size="large"
                      icon={<FolderOpenOutlined />}
                      onClick={() => router.push("/pages/firm-admin/get-cases")}
                      style={{
                        borderRadius: "12px",
                        border: "1px solid #d1d5db",
                        fontWeight: "600",
                        padding: "12px 32px",
                        height: "48px",
                        color: "#374151",
                      }}
                    >
                      View All Cases
                    </Button>

                    <Button
                      size="large"
                      icon={<UserOutlined />}
                      onClick={() =>
                        router.push(
                          `/pages/firm-admin/get-client/${caseData.client.id}`
                        )
                      }
                      style={{
                        borderRadius: "12px",
                        border: "1px solid #059669",
                        fontWeight: "600",
                        padding: "12px 32px",
                        height: "48px",
                        color: "#059669",
                      }}
                    >
                      View Client Profile
                    </Button>

                    <Button
                      size="large"
                      icon={<FileTextOutlined />}
                      onClick={() => {
                        // Add logic to upload new document
                        toast.success("Document upload feature coming soon");
                      }}
                      style={{
                        borderRadius: "12px",
                        border: "1px solid #1e40af",
                        fontWeight: "600",
                        padding: "12px 32px",
                        height: "48px",
                        color: "#1e40af",
                      }}
                    >
                      Upload Document
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ThemeProvider>
  );
}
