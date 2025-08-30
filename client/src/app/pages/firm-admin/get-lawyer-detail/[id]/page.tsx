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
import { getLawyerById } from "@/app/service/adminAPI";
import { Lawyer } from "@/app/types/firm";
import { toast } from "react-hot-toast";
import { ThemeProvider } from "next-themes";

const { Title, Text } = Typography;

export default function GetLawyerDetail({
  params,
}: {
  params: { id: number };
}) {
  const router = useRouter();
  const lawyerId = params.id;

  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lawyerId) fetchLawyerDetail();
  }, [lawyerId]);

  const fetchLawyerDetail = async () => {
    try {
      setLoading(true);
      const data = await getLawyerById(lawyerId);
      setLawyer(data);
      toast.success("successfully fetched lawyer detail");
    } catch (error) {
      console.error("Error fetching lawyer detail:", error);
      toast.error("Failed to fetch lawyer detail");
    } finally {
      setLoading(false);
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

  // Also fix the "Lawyer Not Found" section:
  if (!lawyer) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex justify-center items-center transition-colors duration-300">
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
        <div className="min-h-screen p-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 [&_.ant-typography]:dark:!text-white [&_.ant-card-head-title]:dark:!text-white">
          <div className="max-w-[1400px] mx-auto">
            {/* Header Section */}
            <Card
              className="bg-[#E43636] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
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
                        Lawyer Profile
                      </Title>
                      <Text className="text-white text-lg">
                        Detailed information about your legal professional
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
                          `/pages/firm-admin/edit-lawyer/${lawyer.id}`
                        )
                      }
                      className="rounded-xl font-semibold px-6 h-12 
                     bg-white text-blue-900 shadow-md 
                     "
                    >
                      Edit Profile
                    </Button>
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
                        lawyer.profileImage
                          ? `http://localhost:5000${lawyer.profileImage}`
                          : undefined
                      }
                      icon={!lawyer.profileImage && <UserOutlined />}
                      style={{
                        background: lawyer.profileImage
                          ? "transparent"
                          : "#f1f5f9",
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
                        marginBottom: "16px",
                      }}
                    >
                      <BankOutlined style={{ marginRight: "6px" }} />
                      {lawyer.specialization || "General Practice"}
                    </Tag>

                    <div style={{ marginTop: "16px" }}>
                      {lawyer.status.toLowerCase() === "active" ? (
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
                        Total Cases
                      </span>
                    }
                    value={lawyer.casesCount ?? 0}
                    valueStyle={{
                      color: "#1e40af",
                      fontSize: "36px",
                      fontWeight: "700",
                    }}
                    prefix={<FileTextOutlined style={{ color: "#1e40af" }} />}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Card
                  style={{
                    borderRadius: "16px",
                    border: "1px solid #d1fae5",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    background:
                      "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
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
                        Total Clients
                      </span>
                    }
                    value={lawyer.clientsCount ?? 0}
                    valueStyle={{
                      color: "#059669",
                      fontSize: "36px",
                      fontWeight: "700",
                    }}
                    prefix={<TeamOutlined style={{ color: "#059669" }} />}
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
                        Success Rate
                      </span>
                    }
                    value={85}
                    suffix="%"
                    valueStyle={{
                      color: "#d97706",
                      fontSize: "36px",
                      fontWeight: "700",
                    }}
                    prefix={
                      <CheckCircleOutlined style={{ color: "#d97706" }} />
                    }
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
                        Years Active
                      </span>
                    }
                    value={5}
                    valueStyle={{
                      color: "#7c3aed",
                      fontSize: "36px",
                      fontWeight: "700",
                    }}
                    prefix={<CalendarOutlined style={{ color: "#7c3aed" }} />}
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
                        {lawyer.status.toLowerCase() === "active" ? (
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
                        {new Date().getFullYear() - 2}{" "}
                        {/* Placeholder - replace with actual join date */}
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
                      onClick={() =>
                        router.push(`/pages/firm-admin/edit-lawyer/${lawyerId}`)
                      }
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
                      Edit Lawyer Profile
                    </Button>

                    <Button
                      size="large"
                      icon={<TeamOutlined />}
                      onClick={() =>
                        router.push("/pages/firm-admin/get-lawyers")
                      }
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
