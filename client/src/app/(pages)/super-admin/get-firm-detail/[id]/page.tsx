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
  message,
  Statistic,
  Badge,
} from "antd";
import {
  BankOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  TeamOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CrownOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { getFirmById } from "@/app/service/superAdminAPI";
import { toast } from "react-hot-toast";
import { ThemeProvider } from "next-themes";
const { Title, Text } = Typography;

interface Firm {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  subscription_plan: string;
  status: string;
  max_users: number;
  max_cases: number;
  subdomain: string;
  createdAt: string;
  updatedAt: string;
}

export default function GetFirmDetail({ params }: { params: { id: number } }) {
  const router = useRouter();
  const firmId = params.id;

  const [firm, setFirm] = useState<Firm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (firmId) fetchFirmDetail();
  }, [firmId]);

  const fetchFirmDetail = async () => {
    try {
      setLoading(true);
      const response = await getFirmById(firmId);
      setFirm(response.firm);
      toast.success("Successfully fetched firm details");
    } catch (error) {
      console.error("Error fetching firm detail:", error);
      toast.error("Failed to fetch firm details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSubscriptionColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case "premium":
        return { color: "#7c3aed", bg: "#faf5ff", border: "#e9d5ff" };
      case "pro":
        return { color: "#059669", bg: "#ecfdf5", border: "#d1fae5" };
      case "basic":
        return { color: "#d97706", bg: "#fffbeb", border: "#fde68a" };
      default:
        return { color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" };
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex justify-center items-center transition-colors duration-300">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!firm) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex justify-center items-center transition-colors duration-300">
          <div style={{ textAlign: "center" }}>
            <BankOutlined
              style={{
                fontSize: "64px",
                color: "#9ca3af",
                marginBottom: "16px",
              }}
            />
            <Title level={3} className="text-slate-600 dark:text-slate-400">
              Firm Not Found
            </Title>
            <Text className="text-slate-600 dark:text-slate-400 text-base">
              The requested law firm could not be found.
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

  const subscriptionColors = getSubscriptionColor(firm.subscription_plan);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DashboardLayout>
        <div className="min-h-screen transition-colors duration-300 [&_.ant-typography]:dark:!text-white [&_.ant-card-head-title]:dark:!text-white">
          <div className="max-w-full">
            {/* Header Section */}
            <Card
              className="bg-green-600 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
              bodyStyle={{ padding: "32px" }}
            >
              <Row align="middle" justify="space-between">
                <Col>
                  <Space size="large">
                    <div
                      className="w-20 h-20 flex items-center justify-center rounded-2xl 
                     border-2 border-white/30 bg-white/10 backdrop-blur-md"
                    >
                      <BankOutlined className="text-white text-3xl" />
                    </div>
                    <div>
                      <Title
                        level={1}
                        className="!text-white !m-0 text-3xl font-semibold tracking-tight"
                      >
                        Law Firm Profile
                      </Title>
                      <Text className="text-white text-lg">
                        Comprehensive information about the law firm
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
                      onClick={() => router.push(`/edit-firm/${firm.id}`)}
                      className="rounded-xl font-semibold px-6 h-12 
                     bg-white text-blue-900 shadow-md"
                    >
                      Edit Firm
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Main Profile Card */}
            <Card
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
              bodyStyle={{ padding: "30px" }}
            >
              <Row gutter={[32, 32]} align="top">
                {/* Firm Logo and Basic Info */}
                <Col xs={24} lg={8}>
                  <div style={{ textAlign: "center" }}>
                    <Avatar
                      size={130}
                      icon={<BankOutlined />}
                      style={{
                        background:
                          "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                        border: "4px solid #e5e7eb",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                        marginBottom: "24px",
                      }}
                    />

                    <Title
                      level={3}
                      style={{ marginBottom: "8px", color: "#111827" }}
                    >
                      {firm.name}
                    </Title>

                    <Tag
                      color={subscriptionColors.bg}
                      style={{
                        color: subscriptionColors.color,
                        border: `1px solid ${subscriptionColors.border}`,
                        borderRadius: "12px",
                        padding: "8px 16px",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      <CrownOutlined style={{ marginRight: "6px" }} />
                      {firm.subscription_plan} Plan
                    </Tag>

                    <div style={{ marginTop: "16px" }}>
                      {firm.status.toLowerCase() === "active" ? (
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
                              Active Firm
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
                              Inactive Firm
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
                    Firm Information
                  </Title>

                  <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                      <Card
                        bordered={false}
                        style={{ maxHeight: "120px" }}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                        bodyStyle={{ padding: "16px" }}
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
                            {firm.email}
                          </Text>
                        </Space>
                      </Card>
                    </Col>

                    <Col xs={24} md={12}>
                      <Card
                        bordered={false}
                        style={{ minHeight: "120px" }}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                        bodyStyle={{ padding: "16px" }}
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
                            {firm.phone}
                          </Text>
                        </Space>
                      </Card>
                    </Col>

                    <Col span={24}>
                      <Card
                        bordered={false}
                        style={{ minHeight: "120px" }}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                        bodyStyle={{ padding: "16px" }}
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
                            <HomeOutlined
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
                            {firm.address}
                          </Text>
                        </Space>
                      </Card>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>

            {/* Subscription Statistics */}
            <Row
              gutter={[24, 24]}
              style={{ marginBottom: "32px" }}
              align="stretch"
            >
              {/* Subscription Plan */}
              <Col xs={24} sm={12} lg={6}>
                <Card
                  style={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    background: "#1A2A80",
                    height: "150px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                  bodyStyle={{ padding: "24px" }}
                  
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
                        Subscription Plan
                      </span>
                    }
                    value={firm.subscription_plan}
                    valueStyle={{
                      color: "#FFFFFF",
                      fontSize: "28px",
                      fontWeight: "700",
                    }}
                    prefix={<CrownOutlined style={{ color: "#FACC15" }} />} // yellow crown
                  />
                </Card>
              </Col>

              {/* Max Users */}
              <Col xs={24} sm={12} lg={6}>
                <Card
                  style={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    background: "#3B38A0",
                    height: "150px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                  bodyStyle={{ padding: "24px" }}
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
                        Max Users
                      </span>
                    }
                    value={firm.max_users}
                    valueStyle={{
                      color: "#FFFFFF",
                      fontSize: "28px",
                      fontWeight: "700",
                    }}
                    prefix={<UserOutlined style={{ color: "#FFFFFF" }} />}
                  />
                </Card>
              </Col>

              {/* Max Cases */}
              <Col xs={24} sm={12} lg={6}>
                <Card
                  style={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    background: "#7A85C1",
                    height: "150px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                  bodyStyle={{ padding: "24px" }}
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
                        Max Cases
                      </span>
                    }
                    value={firm.max_cases}
                    valueStyle={{
                      color: "#FFFFFF",
                      fontSize: "28px",
                      fontWeight: "700",
                    }}
                    prefix={<FileTextOutlined style={{ color: "#FFFFFF" }} />}
                  />
                </Card>
              </Col>

              {/* Status */}
              <Col xs={24} sm={12} lg={6}>
                <Card
                  style={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    background: "#B2B0E8",
                    height: "150px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                  bodyStyle={{ padding: "24px" }}
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
                        Status
                      </span>
                    }
                    value={firm.status}
                    valueStyle={{
                      color: "#FFFFFF",
                      fontSize: "28px",
                      fontWeight: "700",
                      textTransform: "capitalize",
                    }}
                    prefix={
                      firm.status.toLowerCase() === "active" ? (
                        <CheckCircleOutlined style={{ color: "#10B981" }} />
                      ) : (
                        <CloseCircleOutlined style={{ color: "#EF4444" }} />
                      )
                    }
                  />
                </Card>
              </Col>
            </Row>

            {/* Detailed Information Cards */}
            <Row gutter={[24, 24]}>
              {/* Firm Information */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <BankOutlined style={{ color: "#1e40af" }} />
                      <span style={{ color: "#111827", fontWeight: "600" }}>
                        Firm Details
                      </span>
                    </Space>
                  }
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 h-[400px]"
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
                        Firm Name
                      </Text>
                      <br />
                      <Text
                        style={{
                          fontSize: "16px",
                          color: "#111827",
                          fontWeight: "500",
                        }}
                      >
                        {firm.name}
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
                        Subdomain
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
                        {firm.subdomain}
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
                        Office Address
                      </Text>
                      <br />
                      <Text
                        style={{
                          fontSize: "16px",
                          color: "#111827",
                          fontWeight: "500",
                        }}
                      >
                        {firm.address}
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
                        Subscription Plan
                      </Text>
                      <br />
                      <div style={{ marginTop: "8px" }}>
                        <Tag
                          style={{
                            background: subscriptionColors.bg,
                            color: subscriptionColors.color,
                            border: `1px solid ${subscriptionColors.border}`,
                            padding: "6px 14px",
                            fontSize: "14px",
                            fontWeight: "500",
                            borderRadius: "8px",
                          }}
                        >
                          <CrownOutlined style={{ marginRight: "6px" }} />
                          {firm.subscription_plan}
                        </Tag>
                      </div>
                    </div>
                  </Space>
                </Card>
              </Col>

              {/* Contact & Dates */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <MailOutlined style={{ color: "#1e40af" }} />
                      <span style={{ color: "#111827", fontWeight: "600" }}>
                        Contact & Timeline
                      </span>
                    </Space>
                  }
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 h-[400px]"
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
                        {firm.email}
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
                        {firm.phone}
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
                        <CalendarOutlined
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
                          Created
                        </Text>
                      </div>
                      <Text
                        style={{
                          fontSize: "16px",
                          color: "#111827",
                          fontWeight: "500",
                        }}
                      >
                        {formatDate(firm.createdAt)}
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
                        <CalendarOutlined
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
                          Last Updated
                        </Text>
                      </div>
                      <Text
                        style={{
                          fontSize: "16px",
                          color: "#111827",
                          fontWeight: "500",
                        }}
                      >
                        {formatDate(firm.updatedAt)}
                      </Text>
                    </div>
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
                      onClick={() => router.push(`/edit-firm/${firmId}`)}
                      style={{
                        background: "#1e40af",
                        borderColor: "#1e40af",
                        borderRadius: "12px",
                        fontWeight: "600",
                        padding: "12px 32px",
                        height: "48px",
                        boxShadow: "0 4px 12px rgba(30, 64, 175, 0.3)",
                      }}
                    >
                      Edit Firm Profile
                    </Button>

                    <Button
                      size="large"
                      icon={<TeamOutlined />}
                      onClick={() => router.push("/super-admin/get-firms")}
                      style={{
                        borderRadius: "12px",
                        border: "1px solid #d1d5db",
                        fontWeight: "600",
                        padding: "12px 32px",
                        height: "48px",
                        color: "#374151",
                      }}
                    >
                      View All Firms
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
