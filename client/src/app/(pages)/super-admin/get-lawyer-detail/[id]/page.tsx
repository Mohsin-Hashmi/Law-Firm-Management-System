"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useTokenRefresh } from "@/app/hooks/useTokenRefresh";
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
  BankOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  TeamOutlined,
  FileTextOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from "recharts";
import { getLawyerById } from "@/app/service/superAdminAPI";
import { Lawyer } from "@/app/types/firm";
import { toast } from "react-hot-toast";
import { ThemeProvider } from "next-themes";
import { LawyerPerformance } from "@/app/types/lawyer";
import { getLawyerPerformance } from "@/app/service/adminAPI";
import { getAllCasesOfLawyer } from "@/app/service/adminAPI";
import { setCases } from "@/app/store/caseSlice";
import { Case } from "@/app/types/case";
import BASE_URL from "@/app/utils/constant";

const { Title, Text } = Typography;

export default function GetLawyerDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  // Unwrap the params Promise using React.use()
  const unwrappedParams = use(params);
  const lawyerId = Number(unwrappedParams.id);

  // Use token refresh hook to ensure token is up to date
  useTokenRefresh();

  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [performanceData, setPerformaceData] =
    useState<LawyerPerformance | null>(null);
  const [loadingLawyer, setLoadingLawyer] = useState(true);
  const [loadingPerformance, setLoadingPerformance] = useState(true);
  const [lawyerCases, setLawyerCases] = useState<Case[]>([]);

  useEffect(() => {
    if (lawyerId) fetchLawyerDetail();
  }, [lawyerId]);

  const fetchLawyerDetail = async () => {
    try {
      setLoadingLawyer(true);
      const response = await getLawyerById(lawyerId);
      setLawyer(response.lawyer || response);
      toast.success("successfully fetched lawyer detail");
    } catch (error) {
      console.error("Error fetching lawyer detail:", error);
      toast.error("Failed to fetch lawyer detail");
    } finally {
      setLoadingLawyer(false);
    }
  };

  // Lawyer performance
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingPerformance(true);
        const res = await getLawyerPerformance(lawyerId);
        setPerformaceData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPerformance(false);
      }
    };

    fetchData();
  }, [lawyerId]);

  if (loadingLawyer) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex justify-center items-center transition-colors duration-300">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!lawyer) {
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
              Lawyer Not Found
            </Title>
            <Text className="text-slate-600 dark:text-slate-400 text-base">
              The requested lawyer profile could not be found.
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
        <div className="min-h-screen transition-colors duration-300 [&_.ant-typography]:dark:!text-white [&_.ant-card-head-title]:dark:!text-white">
          <div className="max-w-full">
            {/* Header Section */}
            <Card
              className="bg-[#E43636] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
              bodyStyle={{ padding: "20px 16px" }}
            >
              <Row align="middle" justify="space-between">
                <Col xs={24} sm={24} md={14} lg={14}>
                  {/* Mobile Layout: Stacked vertically */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
                    {/* Logo */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center border-2 bg-white/15 dark:bg-white/10 border-white/20 dark:border-white/30 flex-shrink-0">
                      <UserOutlined className="text-[24px] sm:text-[28px] md:text-[32px] text-white" />
                    </div>

                    {/* Text Content */}
                    <div className="text-center sm:text-left flex-1">
                      <Title
                        level={1}
                        className="!text-white dark:!text-white !mb-1 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight"
                      >
                        Lawyer Profile
                      </Title>
                      <Text className="text-white dark:text-white text-sm sm:text-base md:text-lg font-normal block">
                        Detailed information about your legal professional
                      </Text>
                    </div>
                  </div>
                </Col>

                {/* Action Buttons Column */}
                <Col xs={24} sm={24} md={10} lg={10} className="mt-4 md:mt-0">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 w-full sm:justify-end">
                    <Button
                      icon={<ArrowLeftOutlined style={{ fontSize: "14px" }} />}
                      onClick={() => router.back()}
                      size="large"
                      className="w-full sm:w-auto order-2 sm:order-1"
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
                  </div>
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
                        lawyer.profileImage
                          ? `${BASE_URL}${lawyer.profileImage}`
                          : undefined
                      }
                      icon={!lawyer.profileImage && <UserOutlined />}
                      style={{
                        background: lawyer.profileImage
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
                      {lawyer.name}
                    </Title>

                    <Tag
                      color="#f0f9ff"
                      style={{
                        color: "#1e40af",
                        border: "1px solid #dbeafe",
                        borderRadius: "12px",
                        padding: "8px 16px",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      <BankOutlined style={{ marginRight: "6px" }} />
                      {lawyer.specialization || "General Practice"}
                    </Tag>

                    <div style={{ marginTop: "8px" }}>
                      {lawyer.status?.toLowerCase() === "active" ? (
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
                              Active Lawyer
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
                              Inactive Lawyer
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
                                color: "#1e40af",
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
                            {lawyer.email}
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
                                color: "#1e40af",
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
                            {lawyer.phone}
                          </Text>
                        </Space>
                      </Card>
                    </Col>
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
                          Performance Overview
                        </Title>

                        {loadingPerformance ? (
                          <div className="flex justify-center items-center py-12">
                            <Spin size="large" />
                          </div>
                        ) : performanceData &&
                          (performanceData.totalCases > 0 ||
                            performanceData.completedCases > 0 ||
                            performanceData.activeCases > 0 ||
                            performanceData.wonCases > 0 ||
                            performanceData.lostCases > 0) ? (
                          <div style={{ width: "100%", height: 300 }}>
                            <ResponsiveContainer width="100%" height={300}>
                              <AreaChart
                                data={[
                                  {
                                    name: "Completed",
                                    value: performanceData.completedCases,
                                  },
                                  {
                                    name: "Active",
                                    value: performanceData.activeCases,
                                  },
                                  {
                                    name: "Won",
                                    value: performanceData.wonCases,
                                  },
                                  {
                                    name: "Lost",
                                    value: performanceData.lostCases,
                                  },
                                ]}
                              >
                                <defs>
                                  <linearGradient
                                    id="colorSky"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                  >
                                    <stop
                                      offset="5%"
                                      stopColor="#87CEEB"
                                      stopOpacity={0.8}
                                    />
                                    <stop
                                      offset="95%"
                                      stopColor="#87CEEB"
                                      stopOpacity={0}
                                    />
                                  </linearGradient>
                                </defs>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Area
                                  type="monotone"
                                  dataKey="value"
                                  stroke="#1E90FF"
                                  fill="url(#colorSky)"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="flex justify-center items-center py-8 sm:py-12 px-4">
                            <div className="px-4 sm:px-8 py-4 sm:py-6 rounded-2xl text-sm sm:text-lg font-semibold text-amber-700 dark:text-amber-700 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-start sm:items-center space-x-2 sm:space-x-3 shadow-sm max-w-full">
                              <FileTextOutlined className="text-amber-600 dark:text-amber-400 text-lg sm:text-xl flex-shrink-0 mt-0.5 sm:mt-0" />
                              <span className="break-words text-left sm:text-center">
                                No Performance Data Yet Available
                              </span>
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
                  {performanceData && (
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
                      value={performanceData.totalCases}
                      valueStyle={{
                        color: "#E0E7FF",
                        fontSize: "36px",
                        fontWeight: "700",
                      }}
                      prefix={<FileTextOutlined style={{ color: "#E0E7FF" }} />}
                    />
                  )}
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
                  {performanceData && (
                    <Statistic
                      title={
                        <span
                          style={{
                            color: "#E0E7FF",
                            fontSize: "14px",
                            fontWeight: "600",
                          }}
                        >
                          Total Clients
                        </span>
                      }
                      value={performanceData.totalClients}
                      valueStyle={{
                        color: "#E0E7FF",
                        fontSize: "36px",
                        fontWeight: "700",
                      }}
                      prefix={<TeamOutlined style={{ color: "#E0E7FF" }} />}
                    />
                  )}
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
                        Success Rate
                      </span>
                    }
                    value={85}
                    suffix="%"
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
                        Years Active
                      </span>
                    }
                    value={5}
                    valueStyle={{
                      color: "#FFFFFF",
                      fontSize: "36px",
                      fontWeight: "700",
                    }}
                    prefix={<CalendarOutlined style={{ color: "#FFFFFF" }} />}
                  />
                </Card>
              </Col>
            </Row>

            {/* Detailed Information Cards */}
            <Row gutter={[24, 24]}>
              {/* Professional Information */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <BankOutlined style={{ color: "#1e40af" }} />
                      <span style={{ color: "#111827", fontWeight: "600" }}>
                        Professional Information
                      </span>
                    </Space>
                  }
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 h-[320px]"
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
                        {lawyer.name}
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
                        Area of Specialization
                      </Text>
                      <br />
                      <Tag
                        color="#f0f9ff"
                        style={{
                          color: "#1e40af",
                          border: "1px solid #dbeafe",
                          borderRadius: "8px",
                          padding: "6px 14px",
                          fontSize: "14px",
                          fontWeight: "500",
                          marginTop: "4px",
                        }}
                      >
                        {lawyer.specialization || "General Practice"}
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
                        Professional Status
                      </Text>
                      <br />
                      <div style={{ marginTop: "8px" }}>
                        {lawyer.status?.toLowerCase() === "active" ? (
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
                            Inactive
                          </Tag>
                        )}
                      </div>
                    </div>
                  </Space>
                </Card>
              </Col>

              {/* Contact Details */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <MailOutlined style={{ color: "#1e40af" }} />
                      <span style={{ color: "#111827", fontWeight: "600" }}>
                        Contact Details
                      </span>
                    </Space>
                  }
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 h-[320px]"
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
                            color: "#1e40af",
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
                        {lawyer.email}
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
                            color: "#1e40af",
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
                        {lawyer.phone}
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
                        Member Since
                      </Text>
                      <br />
                      <Text
                        style={{
                          fontSize: "16px",
                          color: "#111827",
                          fontWeight: "500",
                        }}
                      >
                        {new Date().getFullYear() - 2}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>

            {/* Action Buttons */}
            {/* Action Buttons */}
            <Card
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mt-[40px]"
              bodyStyle={{ padding: "16px" }}
            >
              <Row justify="center">
                <Col xs={24} sm={24} md={20} lg={16}>
                  <div className="flex justify-center">
                    <Button
                      size="large"
                      icon={<TeamOutlined />}
                      onClick={() => router.push("/super-admin/get-lawyers")}
                      className="w-full sm:w-auto"
                      style={{
                        borderRadius: "12px",
                        border: "1px solid #d1d5db",
                        fontWeight: "600",
                        padding: "12px 32px",
                        height: "48px",
                        color: "#374151",
                      }}
                    >
                      View All Lawyers
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ThemeProvider>
  );
}
