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
  FileTextOutlined
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
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
import { usePermission } from "../hooks/usePermission";
import { PermissionWrapper } from "./PermissionWrapper";
import DashboardLayout from "./DashboardLayout";

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
            dispatch(setClients([]));
            console.warn("No clients found or firmId missing:", clients);
          }
        } catch (err) {
          console.warn("Error fetching clients:", err);
          dispatch(setClients([]));
        }

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
    router.push("/create-client");
  };

  const handleAddLawyer = () => {
    router.push("/add-lawyer");
  };

  const handleAddCase = () => {
    router.push("/add-case");
  };

  if (role === "Firm Admin" && !firmId) {
    return (
      <div className="min-h-screen flex items-center justify-center  transition-colors duration-300">
        <div className="max-w-2xl w-full">
          <Card
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg transition-colors duration-300"
            bodyStyle={{ padding: "64px 48px" }}
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center shadow-lg">
                <BankOutlined className="text-4xl text-white" />
              </div>

              <Title
                level={2}
                className="!text-slate-900 dark:!text-white !mb-3 !font-bold !text-3xl"
              >
                Welcome to Your Dashboard
              </Title>

              <Text className="text-slate-500 dark:text-slate-400 text-base mb-10 block max-w-lg mx-auto leading-relaxed">
                To get started, you will need to create your law firm profile.
                This will unlock access to all platform features including
                client management, case tracking, and team collaboration.
              </Text>

              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => router.push("/add-firm")}
                className="w-full max-w-sm h-12 rounded-lg font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200"
                style={{
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  border: "none",
                }}
              >
                Add New Business
              </Button>

              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800">
                    What you will get
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
                  <div className="text-blue-600 dark:text-blue-400 mb-2">
                    <UserOutlined className="text-xl" />
                  </div>
                  <Text className="text-slate-900 dark:text-white font-medium text-sm block mb-1">
                    Client Management
                  </Text>
                  <Text className="text-slate-600 dark:text-slate-400 text-xs">
                    Organize and track all your clients
                  </Text>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
                  <div className="text-blue-600 dark:text-blue-400 mb-2">
                    <FileTextOutlined className="text-xl" />
                  </div>
                  <Text className="text-slate-900 dark:text-white font-medium text-sm block mb-1">
                    Case Tracking
                  </Text>
                  <Text className="text-slate-600 dark:text-slate-400 text-xs">
                    Monitor case progress in real-time
                  </Text>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
                  <div className="text-blue-600 dark:text-blue-400 mb-2">
                    <TeamOutlined className="text-xl" />
                  </div>
                  <Text className="text-slate-900 dark:text-white font-medium text-sm block mb-1">
                    Team Collaboration
                  </Text>
                  <Text className="text-slate-600 dark:text-slate-400 text-xs">
                    Work seamlessly with your team
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (loading || (!stats && !error)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Spin size="large" />
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

  // Prepare radar chart data
  const radarData = [
    {
      subject: "Lawyers",
      A: stats.lawyersCount || 0,
      fullMark: Math.max(stats.lawyersCount || 0, 20),
    },
    {
      subject: "Clients",
      A: stats.clientsCount || 0,
      fullMark: Math.max(stats.clientsCount || 0, 20),
    },
    {
      subject: "Open Cases",
      A: openCasesCount || 0,
      fullMark: Math.max(openCasesCount || 0, 20),
    },
    {
      subject: "Total Cases",
      A: totalCasesCount || 0,
      fullMark: Math.max(totalCasesCount || 0, 20),
    },
    {
      subject: "Active Users",
      A: (stats.activeLawyersCount || 0) + (stats.clientsCount || 0),
      fullMark: Math.max((stats.activeLawyersCount || 0) + (stats.clientsCount || 0), 20),
    },
  ];

  return (
    <div className="min-h-screen   transition-colors duration-300  ">
      <div className="max-w-full">
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
              </Space>
            </Col>
          </Row>
        </Card>

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

        <Row gutter={[24, 24]}>
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

          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <BarChartOutlined className="text-purple-600 dark:text-purple-400" />
                  <span className="text-slate-900 dark:!text-white font-semibold">
                    Performance Overview
                  </span>
                </Space>
              }
              className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800"
              bodyStyle={{ padding: "20px" }}
            >
              {stats && (stats.lawyersCount > 0 || stats.clientsCount > 0 || openCasesCount > 0) ? (
                <div style={{ width: "100%", height: 400 }}>
                  <ResponsiveContainer>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#555555" className="dark:stroke-[#e2e8f0]" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#555555', fontSize: 12 }}
                        stroke="#555555"
                        className="dark:[&_text]:fill-[#64748b] dark:stroke-[#64748b]"
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 'dataMax']}
                        tick={{ fill: '#232323', fontSize: 10 }}
                        stroke="#232323"
                        className="dark:[&_text]:fill-[#64748b] dark:stroke-[#64748b]"
                      />
                      <Radar
                        name="Firm Stats"
                        dataKey="A"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.6}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                        itemStyle={{ color: "#fff" }}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Legend 
                        wrapperStyle={{ 
                          paddingTop: '20px',
                          color: '#64748b'
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex justify-center items-center py-12">
                  <div className="px-8 py-6 rounded-2xl text-lg font-semibold text-amber-700 dark:text-amber-700 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center space-x-3 shadow-sm">
                    <BarChartOutlined className="text-amber-600 dark:text-amber-400 text-xl" />
                    <span>No Performance Data Available Yet</span>
                  </div>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}