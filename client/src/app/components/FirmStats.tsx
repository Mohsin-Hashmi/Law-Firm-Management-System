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
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { getStats } from "../service/adminAPI";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setFirm, setError, setLoading, clearFirm } from "../store/firmSlice";
import { useRouter } from "next/navigation";
import { RootState } from "../store/store";
import { setLawyers } from "../store/lawyerSlice";
import { getLawyers } from "../service/adminAPI";
import { getAllClients } from "../service/adminAPI";
import { setClients } from "../store/clientSlice";
import { getAllCasesOfFirm } from "../service/adminAPI";
import { setCases } from "../store/caseSlice";
const { Title, Text } = Typography;
interface Props {
  firmId: number;
  role?: string;
}
const chartData = [
  { name: "Jan", value: 20 },
  { name: "Feb", value: 35 },
  { name: "Mar", value: 25 },
  { name: "Apr", value: 50 },
  { name: "May", value: 40 },
  { name: "Jun", value: 60 },
];

export default function FirmStats({ firmId, role }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    firm: stats,
    loading,
    error,
  } = useAppSelector((state: RootState) => state.firm);
  const { cases } = useAppSelector((state: RootState) => state.case);
  const openCasesCount = cases?.filter((c) => c.status === "Open").length || 0;
  const totalCasesCount = cases?.length || 0;
  useEffect(() => {
    if (!firmId || !role) return;

    const fetchStats = async () => {
      try {
        // Set loading BEFORE clearing firm data
        dispatch(setLoading(true));
        dispatch(clearFirm());

        const data = await getStats(firmId, role);
        dispatch(setFirm(data));
        dispatch(setError(null));
        const lawyer = await getLawyers(firmId);
        dispatch(setLawyers(lawyer));
        try {
          const clients = await getAllClients(firmId);
          if (clients) {
            dispatch(setClients(clients));
          } else {
            dispatch(setClients([])); // fallback empty list
            console.warn("No clients found or firmId missing:", clients);
          }
        } catch (err) {
          console.warn("Error fetching clients:", err);
          dispatch(setClients([]));
        }

        // ✅ Fetch cases safely
        try {
          const cases = await getAllCasesOfFirm(firmId);
          dispatch(setCases(cases || []));
        } catch (err) {
          console.warn("Error fetching cases:", err);
          dispatch(setCases([]));
        }
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
    router.push("/firm-admin/create-client");
  };

  const handleAddLawyer = () => {
    router.push("/firm-admin/add-lawyer");
  };

  const handleAddCase = () => {
    router.push("/firm-admin/add-case");
  };
  // Show loading spinner when loading OR when there's no stats yet (during firm switch)
  if (loading || (!stats && !error)) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Spin size="large" />
          <div style={{ marginTop: "16px" }}>
            <Text className="text-slate-600 dark:text-slate-400">
              Loading firm statistics...
            </Text>
          </div>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <Card
        style={{
          margin: "24px",
          textAlign: "center",
        }}
        className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
      >
        <Text type="danger" style={{ fontSize: "16px" }}>
          {error}
        </Text>
      </Card>
    );

  if (!stats)
    return (
      <Card
        style={{ margin: "24px", textAlign: "center" }}
        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
      >
        <Text
          style={{ fontSize: "16px" }}
          className="text-slate-600 dark:text-white"
        >
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
      darkBackground: "#1e3a8a",
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
      darkBackground: "#065f46",
      borderColor: "#d1fae5",
      growth: "+8%",
      period: "this month",
    },
    {
      title: "Open Cases",
      value: openCasesCount || 0,
      icon: <FileOutlined />,
      color: "#dc2626",
      background: "#fef2f2",
      darkBackground: "#991b1b",
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
      darkBackground: "#5b21b6",
      borderColor: "#e5e7eb",
      growth: "+5%",
      period: "this week",
    },
  ];

  return (
    <div className="min-h-screen  dark:bg-slate-900 transition-colors duration-300  ">
      <div className="max-w-full">
        {/* Professional Header */}
        <Card
          className="bg-blue-600 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg  mb-[40px] !transition-none"
          bodyStyle={{ padding: "32px 20px" }}
        >
          <Row align="middle" justify="space-between">
            <Col>
              <Space size="large">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center border-2 bg-white/15 dark:bg-white/10 border-white/20 dark:border-white/30">
                  <BankOutlined className="text-[32px] text-white" />
                </div>
                <div>
                  <Title
                    level={1}
                    className="!text-white dark:!text-white !mb-1 text-4xl font-semibold tracking-tight"
                  >
                    {stats.firmName}
                  </Title>
                  <Text className="text-white/100 dark:text-white text-lg font-normal">
                    Law Firm Management Dashboard
                  </Text>
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
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                bodyStyle={{ padding: "20px" }}
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
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "16px",
                      }}
                      className="bg-blue-50 dark:bg-blue-900/30"
                    >
                      <span
                        style={{ fontSize: "20px" }}
                        className="text-blue-600 dark:text-blue-400"
                      >
                        {stat.icon}
                      </span>
                    </div>

                    <Statistic
                      value={stat.value}
                      valueStyle={{
                        fontSize: "32px",
                        fontWeight: "700",
                        lineHeight: "1",
                        color: "inherit",
                      }}
                      className="text-blue-600 dark:text-green-500 [&_.ant-statistic-content-value]:dark:!text-green-500 mb-[10px]"
                    />

                    {/* Mini Graph */}
                    <div style={{ width: "100%", height: 50 }}>
                      <ResponsiveContainer>
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient
                              id="colorValue"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor={stat.color}
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor={stat.color}
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" hide />
                          <YAxis hide />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={stat.color}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <Text className="text-slate-500 dark:text-white text-sm font-medium block mt-1">
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
                      <Text className="text-emerald-600 dark:text-green-500 text-xs font-semibold">
                        {stat.growth}
                      </Text>
                      <Text className="text-slate-400 dark:text-white text-xs">
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
                  <DashboardOutlined className="text-blue-600 dark:text-blue-400" />
                  <span className="text-slate-900 dark:!text-white font-semibold">
                    Quick Actions
                  </span>
                </Space>
              }
              className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800"
              bodyStyle={{ padding: "20px" }}
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="middle"
              >
                <Button
                  type="text"
                  block
                  onClick={handleAddLawyer}
                  className="text-left h-12 rounded-xl border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"
                >
                  <Space
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <Space>
                      <UserAddOutlined className="text-blue-600 dark:text-blue-400" />
                      <span className="text-slate-700 dark:text-white font-medium">
                        Add New Lawyer
                      </span>
                    </Space>
                    <RightOutlined className="text-slate-400 dark:text-white" />
                  </Space>
                </Button>

                <Button
                  type="text"
                  block
                  onClick={handleAddClient}
                  className="text-left h-12 rounded-xl border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"
                >
                  <Space
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <Space>
                      <TeamOutlined className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-slate-700 dark:text-white font-medium">
                        Register New Client
                      </span>
                    </Space>
                    <RightOutlined className="text-slate-400 dark:text-white" />
                  </Space>
                </Button>

                <Button
                  type="text"
                  block
                  onClick={handleAddCase}
                  className="text-left h-12 rounded-xl border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"
                >
                  <Space
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <Space>
                      <FileOutlined className="text-red-600 dark:text-red-400" />
                      <span className="text-slate-700 dark:text-white font-medium">
                        Create New Case
                      </span>
                    </Space>
                    <RightOutlined className="text-slate-400 dark:text-white" />
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
                  <BarChartOutlined className="text-purple-600 dark:text-purple-400" />
                  <span className="text-slate-900 dark:!text-white font-semibold">
                    Recent Activity
                  </span>
                </Space>
              }
              className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800"
              bodyStyle={{ padding: "20px" }}
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="middle"
              >
                <div className="py-3 border-b border-slate-100 dark:border-slate-600">
                  <Text className="text-slate-900 dark:text-white font-medium block">
                    New attorney onboarding completed
                  </Text>
                  <Text className="text-slate-400 dark:text-white text-xs">
                    2 hours ago
                  </Text>
                </div>

                <div className="py-3 border-b border-slate-100 dark:border-slate-600">
                  <Text className="text-slate-900 dark:text-white font-medium block">
                    5 new cases assigned this week
                  </Text>
                  <Text className="text-slate-400 dark:text-white text-xs">
                    1 day ago
                  </Text>
                </div>

                <div className="py-3 border-b border-slate-100 dark:border-slate-600">
                  <Text className="text-slate-900 dark:text-white font-medium block">
                    Client consultation scheduled
                  </Text>
                  <Text className="text-slate-400 dark:text-white text-xs">
                    2 days ago
                  </Text>
                </div>

                <Button
                  type="link"
                  className="p-0 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300"
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
                  <TrophyOutlined className="text-amber-600 dark:text-amber-400" />
                  <span className="text-slate-900 dark:!text-white font-semibold">
                    Performance
                  </span>
                </Space>
              }
              className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800"
              bodyStyle={{ padding: "20px" }}
            >
              <Row gutter={[0, 16]}>
                <Col span={24}>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-700">
                    <Statistic
                      title={
                        <span className="text-slate-600 dark:!text-white text-sm">
                          Case Success Rate
                        </span>
                      }
                      value={94.2}
                      suffix="%"
                      valueStyle={{
                        fontSize: "28px",
                        fontWeight: "700",
                        color: "inherit",
                      }}
                      className="text-emerald-600 dark:text-emerald-400 [&_.ant-statistic-content-value]:dark:!text-emerald-400"
                    />
                  </div>
                </Col>
                <Col span={24}>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-700">
                    <Statistic
                      title={
                        <span className="text-slate-600 dark:!text-white text-sm">
                          Client Satisfaction
                        </span>
                      }
                      value={96.8}
                      suffix="%"
                      valueStyle={{
                        fontSize: "28px",
                        fontWeight: "700",
                        color: "inherit",
                      }}
                      className="text-blue-600 dark:text-blue-400 [&_.ant-statistic-content-value]:dark:!text-blue-400"
                    />
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
