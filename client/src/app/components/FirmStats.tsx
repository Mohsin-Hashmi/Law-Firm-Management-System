"use client";

import { useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Spin,
  Typography,
  Button,
  Statistic,
  Space,
  Divider,
  Avatar,
  Badge,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  FileOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserAddOutlined,
  PlusOutlined,
  BankOutlined,
  BarChartOutlined,
  RightOutlined,
  DashboardOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { getStats } from "../service/adminAPI";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setFirm, setError, setLoading, clearFirm } from "../store/firmSlice";
import { useRouter } from "next/navigation";
import { RootState } from "../store/store";

const { Title, Text } = Typography;
interface Props {
  firmId: number;
  role?: string;
}

export default function FirmStats({ firmId, role }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { firm: stats, loading, error } = useAppSelector(
    (state: RootState) => state.firm
  );

 useEffect(() => {
    if (!firmId || !role) return;

    dispatch(clearFirm());

    const fetchStats = async () => {
      try {
        dispatch(setLoading(true));
        const data = await getStats(firmId, role);
        dispatch(setFirm(data));
        dispatch(setError(null));
      } catch (err) {
        console.error("Error fetching stats:", err);
        dispatch(setError("Failed to fetch stats"));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchStats();
  }, [firmId, role, dispatch]);

  const handleAddClient = () => {
    console.log("Add client clicked");
  };

  const handleAddLawyer = () => {
    console.log("Add lawyer clicked");
    router.push("/pages/firm-admin/add-lawyer");
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
          background: "#f8fafc",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Spin size="large" />
          <div
            style={{ marginTop: "16px", color: "#64748b", fontSize: "16px" }}
          >
            Loading dashboard...
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <Card
        style={{
          margin: "24px",
          textAlign: "center",
          border: "1px solid #fee2e2",
          background: "#fef2f2",
        }}
      >
        <Text type="danger" style={{ fontSize: "16px" }}>
          {error}
        </Text>
      </Card>
    );

  if (!stats)
    return (
      <Card style={{ margin: "24px", textAlign: "center" }}>
        <Text style={{ fontSize: "16px", color: "#64748b" }}>
          No statistics available.
        </Text>
      </Card>
    );

  const statCards = [
    {
      title: "Legal Professionals",
      value: stats.lawyersCount,
      icon: <UserOutlined />,
      color: "#1e40af",
      background: "#eff6ff",
      borderColor: "#dbeafe",
      growth: "+12%",
      period: "this month",
    },
    {
      title: "Active Clients",
      value: stats.clientsCount,
      icon: <TeamOutlined />,
      color: "#059669",
      background: "#ecfdf5",
      borderColor: "#d1fae5",
      growth: "+8%",
      period: "this month",
    },
    {
      title: "Open Cases",
      value: stats.casesCount || 0,
      icon: <FileOutlined />,
      color: "#dc2626",
      background: "#fef2f2",
      borderColor: "#fecaca",
      growth: "+15%",
      period: "this quarter",
    },
    {
      title: "Active Users",
      value: (stats.activeLawyersCount || 0) + (stats.clientsCount || 0),
      icon: <CheckCircleOutlined />,
      color: "#7c3aed",
      background: "#f3f4f6",
      borderColor: "#e5e7eb",
      growth: "+5%",
      period: "this week",
    },
  ];

  return (
    <div
      style={{
        background: "#f8fafc",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      {/* Professional Header */}
      <Card
        style={{
          marginBottom: "32px",
          background: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
          border: "none",
          borderRadius: "16px",
          boxShadow: "0 10px 25px rgba(30, 64, 175, 0.15)",
        }}
        bodyStyle={{ padding: "32px" }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space size="large">
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
                <BankOutlined style={{ fontSize: "32px", color: "white" }} />
              </div>
              <div>
                <Title
                  level={1}
                  style={{
                    color: "white",
                    margin: 0,
                    fontSize: "36px",
                    fontWeight: "600",
                    letterSpacing: "-0.025em",
                  }}
                >
                  {stats.firmName}
                </Title>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "18px",
                    fontWeight: "400",
                  }}
                >
                  Law Firm Management Dashboard
                </Text>
                <div style={{ marginTop: "8px" }}>
                  <Badge
                    status="success"
                    text={
                      <span
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: "14px",
                        }}
                      >
                        System Online
                      </span>
                    }
                  />
                </div>
              </div>
            </Space>
          </Col>
          <Col>
            <Space size="middle">
              <Button
                type="primary"
                size="large"
                icon={<UserAddOutlined />}
                onClick={handleAddLawyer}
                style={{
                  background: "white",
                  borderColor: "white",
                  color: "#1e40af",
                  borderRadius: "12px",
                  fontWeight: "600",
                  padding: "8px 24px",
                  height: "48px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                Add Lawyer
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={handleAddClient}
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
                New Client
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics Grid */}
      <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
        {statCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              style={{
                background: "white",
                border: `1px solid ${stat.borderColor}`,
                borderRadius: "16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              bodyStyle={{ padding: "24px" }}
              hoverable
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 25px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      background: stat.background,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <span style={{ fontSize: "20px", color: stat.color }}>
                      {stat.icon}
                    </span>
                  </div>

                  <Statistic
                    value={stat.value}
                    valueStyle={{
                      color: "#111827",
                      fontSize: "32px",
                      fontWeight: "700",
                      lineHeight: "1",
                    }}
                  />

                  <Text
                    style={{
                      color: "#64748b",
                      fontSize: "14px",
                      fontWeight: "500",
                      display: "block",
                      marginTop: "4px",
                    }}
                  >
                    {stat.title}
                  </Text>

                  <div
                    style={{
                      marginTop: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Text
                      style={{
                        color: "#059669",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {stat.growth}
                    </Text>
                    <Text
                      style={{
                        color: "#9ca3af",
                        fontSize: "12px",
                      }}
                    >
                      {stat.period}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Action Cards & Analytics */}
      <Row gutter={[24, 24]}>
        {/* Quick Actions */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <DashboardOutlined style={{ color: "#1e40af" }} />
                <span style={{ color: "#111827", fontWeight: "600" }}>
                  Quick Actions
                </span>
              </Space>
            }
            style={{
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
            bodyStyle={{ padding: "20px" }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <Button
                type="text"
                block
                onClick={handleAddLawyer}
                style={{
                  textAlign: "left",
                  height: "48px",
                  borderRadius: "12px",
                  border: "1px solid #f3f4f6",
                  background: "#fafafa",
                }}
              >
                <Space
                  style={{ width: "100%", justifyContent: "space-between" }}
                >
                  <Space>
                    <UserAddOutlined style={{ color: "#1e40af" }} />
                    <span style={{ color: "#374151", fontWeight: "500" }}>
                      Add New Lawyer
                    </span>
                  </Space>
                  <RightOutlined style={{ color: "#9ca3af" }} />
                </Space>
              </Button>

              <Button
                type="text"
                block
                onClick={handleAddClient}
                style={{
                  textAlign: "left",
                  height: "48px",
                  borderRadius: "12px",
                  border: "1px solid #f3f4f6",
                  background: "#fafafa",
                }}
              >
                <Space
                  style={{ width: "100%", justifyContent: "space-between" }}
                >
                  <Space>
                    <TeamOutlined style={{ color: "#059669" }} />
                    <span style={{ color: "#374151", fontWeight: "500" }}>
                      Register New Client
                    </span>
                  </Space>
                  <RightOutlined style={{ color: "#9ca3af" }} />
                </Space>
              </Button>

              <Button
                type="text"
                block
                style={{
                  textAlign: "left",
                  height: "48px",
                  borderRadius: "12px",
                  border: "1px solid #f3f4f6",
                  background: "#fafafa",
                }}
              >
                <Space
                  style={{ width: "100%", justifyContent: "space-between" }}
                >
                  <Space>
                    <FileOutlined style={{ color: "#dc2626" }} />
                    <span style={{ color: "#374151", fontWeight: "500" }}>
                      Create New Case
                    </span>
                  </Space>
                  <RightOutlined style={{ color: "#9ca3af" }} />
                </Space>
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <BarChartOutlined style={{ color: "#7c3aed" }} />
                <span style={{ color: "#111827", fontWeight: "600" }}>
                  Recent Activity
                </span>
              </Space>
            }
            style={{
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
            bodyStyle={{ padding: "20px" }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <div
                style={{ padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}
              >
                <Text
                  style={{
                    color: "#111827",
                    fontWeight: "500",
                    display: "block",
                  }}
                >
                  New attorney onboarding completed
                </Text>
                <Text style={{ color: "#9ca3af", fontSize: "12px" }}>
                  2 hours ago
                </Text>
              </div>

              <div
                style={{ padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}
              >
                <Text
                  style={{
                    color: "#111827",
                    fontWeight: "500",
                    display: "block",
                  }}
                >
                  5 new cases assigned this week
                </Text>
                <Text style={{ color: "#9ca3af", fontSize: "12px" }}>
                  1 day ago
                </Text>
              </div>

              <div
                style={{ padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}
              >
                <Text
                  style={{
                    color: "#111827",
                    fontWeight: "500",
                    display: "block",
                  }}
                >
                  Client consultation scheduled
                </Text>
                <Text style={{ color: "#9ca3af", fontSize: "12px" }}>
                  2 days ago
                </Text>
              </div>

              <Button
                type="link"
                style={{ padding: 0, color: "#1e40af", fontWeight: "500" }}
              >
                View all activities →
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Performance Metrics */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <TrophyOutlined style={{ color: "#f59e0b" }} />
                <span style={{ color: "#111827", fontWeight: "600" }}>
                  Performance
                </span>
              </Space>
            }
            style={{
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
            bodyStyle={{ padding: "20px" }}
          >
            <Row gutter={[0, 16]}>
              <Col span={24}>
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px",
                    background: "#f8fafc",
                    borderRadius: "12px",
                  }}
                >
                  <Statistic
                    title={
                      <span style={{ color: "#64748b", fontSize: "14px" }}>
                        Case Success Rate
                      </span>
                    }
                    value={94.2}
                    suffix="%"
                    valueStyle={{
                      color: "#059669",
                      fontSize: "28px",
                      fontWeight: "700",
                    }}
                  />
                </div>
              </Col>
              <Col span={24}>
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px",
                    background: "#f8fafc",
                    borderRadius: "12px",
                  }}
                >
                  <Statistic
                    title={
                      <span style={{ color: "#64748b", fontSize: "14px" }}>
                        Client Satisfaction
                      </span>
                    }
                    value={96.8}
                    suffix="%"
                    valueStyle={{
                      color: "#1e40af",
                      fontSize: "28px",
                      fontWeight: "700",
                    }}
                  />
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
