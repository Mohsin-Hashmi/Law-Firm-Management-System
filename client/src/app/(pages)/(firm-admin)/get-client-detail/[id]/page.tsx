"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import ConfirmationModal from "@/app/components/ConfirmationModal";
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
} from "@ant-design/icons";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
} from "recharts";
import { getClientById, clientStatsData } from "@/app/service/adminAPI";
import { Client } from "@/app/types/client";
import { toast } from "react-hot-toast";
import { ThemeProvider } from "next-themes";
import { use } from "react";
import { ClientStats } from "@/app/types/client";
import { usePermission } from "@/app/hooks/usePermission";
const { Title, Text } = Typography;
import BASE_URL from "@/app/utils/constant";
import { getClientPerformance } from "@/app/service/adminAPI";

export default function GetClientDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { hasPermission } = usePermission();
  const router = useRouter();
  const { id } = use(params);
  const clientId = Number(id);

  const [client, setClient] = useState<Client | null>(null);
  const [clientStats, setClientStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (clientId) fetchClientDetail();
  }, [clientId]);

  useEffect(() => {
    if (clientId) fetchClientStats();
  }, [clientId]);

  const fetchClientDetail = async () => {
    try {
      setLoading(true);
      const data = await getClientById(clientId);
      console.log("Client data is:", data);
      setClient(data);
      toast.success("Successfully fetched client detail");
    } catch (error) {
      console.error("Error fetching client detail:", error);
      toast.error("Failed to fetch client detail");
    } finally {
      setLoading(false);
    }
  };

  const fetchClientStats = async () => {
    try {
      setLoadingStats(true);
      const data = await getClientPerformance(clientId);
      setClientStats(data);
    } catch (error) {
      console.error("Error fetching client stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Prepare chart data from client stats
  const prepareChartData = () => {
    if (!clientStats) return [];

    return [
      {
        name: "Total Cases",
        value: clientStats.totalCases || 0,
        fill: "#059669",
      },
      {
        name: "Total Lawyers",
        value: clientStats.totalLawyersAssigned || 0,
        fill: "#6366f1",
      },
      {
        name: "Active Cases",
        value: clientStats.openCases || 0,
        fill: "#1e40af",
      },
      {
        name: "Completed Cases",
        value: clientStats.closedCases || 0,
        fill: "#d97706",
      },
      {
        name: "Won Cases",
        value: clientStats.wonCases || 0,
        fill: "#7c3aed",
      },
    ];
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

  if (!client) {
    return (
      <DashboardLayout>
        <div className="min-h-screen  flex justify-center items-center transition-colors duration-300">
          <div style={{ textAlign: "center" }}>
            <UserOutlined
              style={{
                fontSize: "64px",
                color: "#9ca3af",
                marginBottom: "16px",
              }}
            />
            <Title level={3} className="text-slate-600 dark:text-slate-400">
              Client Not Found
            </Title>
            <Text className="text-slate-600 dark:text-slate-400 text-base">
              The requested client profile could not be found.
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

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DashboardLayout>
        <div className="min-h-screen  transition-colors duration-300 [&_.ant-typography]:dark:!text-white [&_.ant-card-head-title]:dark:!text-white">
          <div className="max-w-full">
            {/* Header Section */}
            <Card
              className="bg-emerald-600 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
              bodyStyle={{ padding: "32px" }}
            >
              <Row align="middle" justify="space-between">
                <Col>
                  <Space size="large">
                    <div
                      className="w-20 h-20 flex items-center justify-center rounded-2xl 
                     border-2 border-white/30 bg-white/10 backdrop-blur-md"
                    >
                      <UserOutlined className="text-white text-3xl" />
                    </div>
                    <div>
                      <Title
                        level={1}
                        className="!text-white !m-0 text-3xl font-semibold tracking-tight"
                      >
                        Client Profile
                      </Title>
                      <Text className="text-white/80 text-lg">
                        Detailed information about your client
                      </Text>
                    </div>
                  </Space>
                </Col>
                <Col>
                  <Space size="middle">
                    <Button
                      icon={<ArrowLeftOutlined style={{ fontSize: "14px" }} />}
                      onClick={() => router.back()}
                      size="large"
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        borderColor: "rgba(255,255,255,0.3)",
                        color: "white",
                        borderRadius: "12px",
                        fontWeight: "600",
                        padding: "8px 24px",
                        height: "48px",
                        backdropFilter: "blur(10px)",
                      }}
                      ghost
                    >
                      Back
                    </Button>
                    {hasPermission("update_client") && (
                      <Button
                        type="primary"
                        size="large"
                        icon={<EditOutlined style={{ fontSize: "14px" }} />}
                        onClick={() => router.push(`/edit-client/${clientId}`)}
                        style={{
                          background: "white",
                          borderColor: "white",
                          color: "#2563eb",
                          borderRadius: "12px",
                          fontWeight: "600",
                          padding: "8px 24px",
                          height: "48px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Main Profile Card */}
            <Card
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
              bodyStyle={{ padding: "40px" }}
            >
              <Row gutter={[32, 32]} align="top">
                {/* Profile Image and Basic Info */}
                <Col xs={24} lg={8}>
                  <div style={{ textAlign: "center" }}>
                    <Avatar
                      size={200}
                      src={
                        client.profileImage
                          ? `${BASE_URL}${client.profileImage}`
                          : undefined
                      }
                      icon={!client.profileImage && <UserOutlined />}
                      style={{
                        background: client.profileImage
                          ? "transparent"
                          : "#F1F5F9 dark:#1E293B",
                        border: "4px solid #e5e7eb",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                        marginBottom: "24px",
                      }}
                    />

                    <Title
                      level={2}
                      style={{ marginBottom: "8px", color: "#111827" }}
                    >
                      {client.fullName}
                    </Title>

                    <Tag
                      color="#f0fdf4"
                      style={{
                        color: "#059669",
                        border: "1px solid #bbf7d0",
                        borderRadius: "12px",
                        padding: "8px 16px",
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "16px",
                      }}
                    >
                      <IdcardOutlined style={{ marginRight: "6px" }} />
                      {client.clientType}
                    </Tag>

                    <div style={{ marginTop: "16px" }}>
                      {client.status === "Active" ? (
                        <Badge
                          status="success"
                          text={
                            <span
                              style={{
                                fontSize: "15px",
                                fontWeight: "600",
                                color: "#059669",
                              }}
                            >
                              <CheckCircleOutlined
                                style={{ marginRight: "6px" }}
                              />
                              Active Client
                            </span>
                          }
                        />
                      ) : client.status === "Past" ? (
                        <Badge
                          status="default"
                          text={
                            <span
                              style={{
                                fontSize: "15px",
                                fontWeight: "600",
                                color: "#64748b",
                              }}
                            >
                              <CloseCircleOutlined
                                style={{ marginRight: "6px" }}
                              />
                              Past Client
                            </span>
                          }
                        />
                      ) : client.status === "Potential" ? (
                        <Badge
                          status="processing"
                          text={
                            <span
                              style={{
                                fontSize: "15px",
                                fontWeight: "600",
                                color: "#1e40af",
                              }}
                            >
                              <CheckCircleOutlined
                                style={{ marginRight: "6px" }}
                              />
                              Potential Client
                            </span>
                          }
                        />
                      ) : (
                        <Badge
                          status="error"
                          text={
                            <span
                              style={{
                                fontSize: "15px",
                                fontWeight: "600",
                                color: "#dc2626",
                              }}
                            >
                              <CloseCircleOutlined
                                style={{ marginRight: "6px" }}
                              />
                              Suspended Client
                            </span>
                          }
                        />
                      )}
                    </div>
                  </div>
                </Col>

                {/* Contact Information */}
                <Col xs={24} lg={16}>
                  <Title
                    level={3}
                    className="text-[#111827] dark:text-[#FFFFFF] mb-[24px]"
                  >
                    Contact Information
                  </Title>

                  <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                      <Card
                        bordered={false}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                        bodyStyle={{ padding: "20px" }}
                      >
                        <Space
                          direction="vertical"
                          size="small"
                          style={{ width: "100%" }}
                        >
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
                              Email Address
                            </Text>
                          </div>
                          <Text
                            style={{
                              fontSize: "16px",
                              color: "#111827",
                              fontWeight: "500",
                            }}
                            copyable
                          >
                            {client.email}
                          </Text>
                        </Space>
                      </Card>
                    </Col>

                    <Col xs={24} md={12}>
                      <Card
                        bordered={false}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                        bodyStyle={{ padding: "20px" }}
                      >
                        <Space
                          direction="vertical"
                          size="small"
                          style={{ width: "100%" }}
                        >
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
                              Phone Number
                            </Text>
                          </div>
                          <Text
                            style={{
                              fontSize: "16px",
                              color: "#111827",
                              fontWeight: "500",
                            }}
                            copyable
                          >
                            {client.phone}
                          </Text>
                        </Space>
                      </Card>
                    </Col>
                    {/* Client Performance Chart */}
                    <Col span={24}>
                      <Card
                        bordered={false}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 w-full"
                        bodyStyle={{ padding: "20px" }}
                      >
                        <Title
                          level={4}
                          className="text-[#111827] dark:text-[#FFFFFF] mb-[16px]"
                        >
                          Case Performance Overview
                        </Title>

                        {loadingStats ? (
                          <div className="flex justify-center items-center py-12">
                            <Spin size="large" />
                          </div>
                        ) : clientStats &&
                          (clientStats.totalCases > 0 ||
                            (clientStats.totalLawyersAssigned || 0) > 0 ||
                            clientStats.openCases > 0 ||
                            clientStats.closedCases > 0 ||
                            (clientStats.wonCases || 0) > 0 ||
                            (clientStats.completedCases || 0) > 0) ? (
                          <div style={{ width: "100%", height: 300 }}>
                            <ResponsiveContainer width={600} height={270}>
                              <BarChart
                                data={prepareChartData()}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
                              >
                                <XAxis
                                  dataKey="name"
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{ fontSize: 12, fill: "#6b7280" }}
                                />
                                <YAxis
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{ fontSize: 12, fill: "#6b7280" }}
                                />
                                <RechartsTooltip
                                  contentStyle={{
                                    backgroundColor: "#f9fafb",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    boxShadow:
                                      "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                  }}
                                />
                                <Bar
                                  dataKey="value"
                                  radius={[10, 10, 0, 0]}
                                  maxBarSize={50}
                                >
                                  {prepareChartData().map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.fill}
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="flex justify-center items-center py-12">
                            <div className="px-8 py-6 rounded-2xl text-lg font-semibold text-amber-700 dark:text-amber-700 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800  flex items-center space-x-3 shadow-sm">
                              <FileTextOutlined className="text-amber-600 dark:text-amber-400 text-xl" />
                              <span>No Performance Data Yet Available</span>
                            </div>
                          </div>
                        )}
                      </Card>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>

            {/* Performance Statistics */}
            <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  style={{
                    borderRadius: "16px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    background: "#1A2A80",
                  }}
                  bodyStyle={{ padding: "28px" }}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "#E0E7FF",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        Total Cases
                      </span>
                    }
                    value={clientStats?.totalCases || client.casesCount || 0}
                    valueStyle={{
                      color: "#E0E7FF",
                      fontSize: "36px",
                      fontWeight: "700",
                    }}
                    prefix={<FileTextOutlined style={{ color: "#E0E7FF" }} />}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Card
                  style={{
                    borderRadius: "16px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    background: "#3B38A0",
                  }}
                  bodyStyle={{ padding: "28px" }}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "#E0E7FF",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        Open Cases
                      </span>
                    }
                    value={clientStats?.caseStats?.open || 0}
                    valueStyle={{
                      color: "#E0E7FF",
                      fontSize: "36px",
                      fontWeight: "700",
                    }}
                    prefix={<FileTextOutlined style={{ color: "#E0E7FF" }} />}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Card
                  style={{
                    borderRadius: "16px",

                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    background: "#7A85C1",
                  }}
                  bodyStyle={{ padding: "28px" }}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "#F1F5F9",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        Closed Cases
                      </span>
                    }
                    value={clientStats?.caseStats?.closed || 0}
                    valueStyle={{
                      color: "#F1F5F9",
                      fontSize: "36px",
                      fontWeight: "700",
                    }}
                    prefix={
                      <CheckCircleOutlined style={{ color: "#F1F5F9" }} />
                    }
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Card
                  style={{
                    borderRadius: "16px",

                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    background: "#B2B0E8",
                  }}
                  bodyStyle={{ padding: "28px" }}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "#FFFFFF",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        Lawyers Assigned
                      </span>
                    }
                    value={clientStats?.totalLawyersAssigned || 0}
                    valueStyle={{
                      color: "#FFFFFF",
                      fontSize: "36px",
                      fontWeight: "700",
                    }}
                    prefix={<TeamOutlined style={{ color: "#FFFFFF" }} />}
                  />
                </Card>
              </Col>
            </Row>

            {/* Detailed Information Cards */}
            <Row gutter={[24, 24]}>
              {/* Personal Information */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <IdcardOutlined style={{ color: "#059669" }} />
                      <span style={{ color: "#111827", fontWeight: "600" }}>
                        Personal Information
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
                        Full Name
                      </Text>
                      <br />
                      <Text
                        style={{
                          fontSize: "16px",
                          color: "#111827",
                          fontWeight: "500",
                        }}
                      >
                        {client.fullName}
                      </Text>
                    </div>

                    {client.dob && (
                      <div>
                        <Text
                          style={{
                            fontSize: "14px",
                            color: "#64748b",
                            fontWeight: "500",
                          }}
                        >
                          Date of Birth
                        </Text>
                        <br />
                        <Text
                          style={{
                            fontSize: "16px",
                            color: "#111827",
                            fontWeight: "500",
                          }}
                        >
                          {new Date(client.dob).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </Text>
                      </div>
                    )}

                    {client.gender && (
                      <div>
                        <Text
                          style={{
                            fontSize: "14px",
                            color: "#64748b",
                            fontWeight: "500",
                          }}
                        >
                          Gender
                        </Text>
                        <br />
                        <Text
                          style={{
                            fontSize: "16px",
                            color: "#111827",
                            fontWeight: "500",
                          }}
                        >
                          {client.gender}
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
                        Client Type
                      </Text>
                      <br />
                      <Tag
                        color="#f0fdf4"
                        style={{
                          color: "#059669",
                          border: "1px solid #bbf7d0",
                          borderRadius: "8px",
                          padding: "6px 14px",
                          fontSize: "14px",
                          fontWeight: "500",
                          marginTop: "4px",
                        }}
                      >
                        {client.clientType}
                      </Tag>
                    </div>

                    <div>
                      <Text
                        style={{
                          fontSize: "14px",
                          color: "#64748b",
                          fontWeight: "500",
                        }}
                      >
                        Status
                      </Text>
                      <br />
                      <div style={{ marginTop: "8px" }}>
                        {client.status === "Active" ? (
                          <Tag
                            icon={<CheckCircleOutlined />}
                            color="success"
                            style={{
                              padding: "6px 14px",
                              fontSize: "14px",
                              fontWeight: "500",
                              borderRadius: "8px",
                            }}
                          >
                            Active
                          </Tag>
                        ) : client.status === "Past" ? (
                          <Tag
                            icon={<CloseCircleOutlined />}
                            color="default"
                            style={{
                              padding: "6px 14px",
                              fontSize: "14px",
                              fontWeight: "500",
                              borderRadius: "8px",
                            }}
                          >
                            Past
                          </Tag>
                        ) : client.status === "Potential" ? (
                          <Tag
                            icon={<CheckCircleOutlined />}
                            color="processing"
                            style={{
                              padding: "6px 14px",
                              fontSize: "14px",
                              fontWeight: "500",
                              borderRadius: "8px",
                            }}
                          >
                            Potential
                          </Tag>
                        ) : (
                          <Tag
                            icon={<CloseCircleOutlined />}
                            color="error"
                            style={{
                              padding: "6px 14px",
                              fontSize: "14px",
                              fontWeight: "500",
                              borderRadius: "8px",
                            }}
                          >
                            Suspended
                          </Tag>
                        )}
                      </div>
                    </div>

                    {client.organization && (
                      <div>
                        <Text
                          style={{
                            fontSize: "14px",
                            color: "#64748b",
                            fontWeight: "500",
                          }}
                        >
                          Organization
                        </Text>
                        <br />
                        <Text
                          style={{
                            fontSize: "16px",
                            color: "#111827",
                            fontWeight: "500",
                          }}
                        >
                          {client.organization}
                        </Text>
                      </div>
                    )}
                  </Space>
                </Card>
              </Col>

              {/* Contact Details */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <MailOutlined style={{ color: "#059669" }} />
                      <span style={{ color: "#111827", fontWeight: "600" }}>
                        Contact Details
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
                          Email Address
                        </Text>
                      </div>
                      <Text
                        style={{
                          fontSize: "16px",
                          color: "#111827",
                          fontWeight: "500",
                        }}
                        copyable={{
                          tooltips: ["Copy email", "Email copied!"],
                        }}
                      >
                        {client.email}
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
                          Phone Number
                        </Text>
                      </div>
                      <Text
                        style={{
                          fontSize: "16px",
                          color: "#111827",
                          fontWeight: "500",
                        }}
                        copyable={{
                          tooltips: ["Copy phone", "Phone copied!"],
                        }}
                      >
                        {client.phone}
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
                        Client Since
                      </Text>
                      <br />
                      <Text
                        style={{
                          fontSize: "16px",
                          color: "#111827",
                          fontWeight: "500",
                        }}
                      >
                        {new Date(client.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </Text>
                    </div>

                    {client.address && (
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
                          {client.address}
                        </Text>
                      </div>
                    )}

                    {client.billingAddress && (
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
                            Billing Address
                          </Text>
                        </div>
                        <Text
                          style={{
                            fontSize: "16px",
                            color: "#111827",
                            fontWeight: "500",
                          }}
                        >
                          {client.billingAddress}
                        </Text>
                      </div>
                    )}

                    {client.outstandingBalance !== undefined && (
                      <div>
                        <Text
                          style={{
                            fontSize: "14px",
                            color: "#64748b",
                            fontWeight: "500",
                          }}
                        >
                          Outstanding Balance
                        </Text>
                        <br />
                        <Text
                          style={{
                            fontSize: "16px",
                            color:
                              client.outstandingBalance > 0
                                ? "#dc2626"
                                : "#059669",
                            fontWeight: "600",
                          }}
                        >
                          ${client.outstandingBalance.toFixed(2)}
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
                    {hasPermission("update_client") && (
                      <Button
                        type="primary"
                        size="large"
                        icon={<EditOutlined />}
                        onClick={() => router.push(`/edit-client/${clientId}`)}
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
                        Edit Client Profile
                      </Button>
                    )}
                    {hasPermission("read_client") && (
                      <Button
                        size="large"
                        icon={<TeamOutlined />}
                        onClick={() => router.push("/get-clients")}
                        style={{
                          borderRadius: "12px",
                          border: "1px solid #d1d5db",
                          fontWeight: "600",
                          padding: "12px 32px",
                          height: "48px",
                          color: "#374151",
                        }}
                      >
                        View All Clients
                      </Button>
                    )}
                    {hasPermission("read_case") && (
                      <Button
                        size="large"
                        icon={<FileTextOutlined />}
                        onClick={() => router.push(`/get-cases`)}
                        style={{
                          borderRadius: "12px",
                          border: "1px solid #059669",
                          fontWeight: "600",
                          padding: "12px 32px",
                          height: "48px",
                          color: "#059669",
                        }}
                      >
                        View All Cases
                      </Button>
                    )}
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
