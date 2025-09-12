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
import { getClientById } from "@/app/service/adminAPI";
import { Client } from "@/app/types/client";
import { toast } from "react-hot-toast";
import { ThemeProvider } from "next-themes";
import { use } from "react";

const { Title, Text } = Typography;

export default function GetClientDetail({
  params,
}: {
  params: Promise<{ id: string }>; 
}) {
  const router= useRouter();
  const { id } = use(params); 
  const clientId = Number(id);

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);




  useEffect(() => {
    if (clientId) fetchClientDetail();
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
                          `/firm-admin/edit-client/${client.id}`
                        )
                      }
                      className="rounded-xl font-semibold px-6 h-12 
                     bg-white text-emerald-600 shadow-md 
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
                        client.profileImage
                          ? `http://localhost:5000${client.profileImage}`
                          : undefined
                      }
                      icon={!client.profileImage && <UserOutlined />}
                      style={{
                        background: client.profileImage
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
                        Total Cases
                      </span>
                    }
                    value={client.casesCount ?? 0}
                    valueStyle={{
                      color: "#059669",
                      fontSize: "36px",
                      fontWeight: "700",
                    }}
                    prefix={<FileTextOutlined style={{ color: "#059669" }} />}
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
                        Outstanding Balance
                      </span>
                    }
                    value={client.outstandingBalance ?? 0}
                    prefix="$"
                    valueStyle={{
                      color: "#1e40af",
                      fontSize: "36px",
                      fontWeight: "700",
                    }}
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
                        Satisfaction Rate
                      </span>
                    }
                    value={92}
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
                        Client Since
                      </span>
                    }
                    value={new Date(client.createdAt).getFullYear()}
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
                          {new Date(client.dob).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
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
                        {new Date(client.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
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
                            color: client.outstandingBalance > 0 ? "#dc2626" : "#059669",
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
                    <Button
                      type="primary"
                      size="large"
                      icon={<EditOutlined />}
                      onClick={() =>
                        router.push(`/firm-admin/edit-client/${clientId}`)
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
                      Edit Client Profile
                    </Button>

                    <Button
                      size="large"
                      icon={<TeamOutlined />}
                      onClick={() =>
                        router.push("/firm-admin/get-clients")
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
                      View All Clients
                    </Button>

                    <Button
                      size="large"
                      icon={<FileTextOutlined />}
                      onClick={() =>
                        router.push(`/firm-admin/client-cases/${clientId}`)
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
                      View Cases
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