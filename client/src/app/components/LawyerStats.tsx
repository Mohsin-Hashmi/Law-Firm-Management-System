"use client";
import { useEffect, useState } from "react";
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
  BarChartOutlined,
  RightOutlined,
  DashboardOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined
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
  CartesianGrid,
  Cell
} from "recharts";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useRouter } from "next/navigation";
import { RootState } from "../store/store";
import { lawyerStatsData } from "../service/adminAPI";
import { setLawyerStats } from "../store/lawyerSlice";
const { Title, Text } = Typography;
import { LawyerStats } from "../types/lawyer";
interface Props {
  firmId: number;
  role?: string;
}

// Sample chart data - replace with actual data from your API
const chartData = [
  { name: "Jan", value: 15 },
  { name: "Feb", value: 22 },
  { name: "Mar", value: 18 },
  { name: "Apr", value: 35 },
  { name: "May", value: 28 },
  { name: "Jun", value: 42 },
];

export default function LawyerStatsData({ firmId, role }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state: RootState) => state.user.user);
  const loading = useAppSelector((state: RootState) => state.user.loading);
  const [lawyer, setLawyers] = useState<LawyerStats | null>(null);

  const error = null; // Replace with actual error state

  // Sample stats - replace with actual data from your API
  // const lawyerStats = {
  //   lawyerName: user?.name || "Lawyer",
  //   completedCases: 0,
  //   pendingCases: 0,
  //   ongoingCases: 0,
  //   totalClients: 0,
  //   successRate: 0,
  //   activeThisWeek: 0,
  // };

  useEffect(() => {
    if (!firmId || !role) return;

    const fetchLawyerStats = async () => {
      try {
        const data = await lawyerStatsData();
        const normalizedStats = {
          lawyerName:
            data.lawyerName || data.stats?.lawyerName || user?.name || "Lawyer",
          completedCases: data.stats.completedCases,
          ongoingCases: data.stats.ongoingCases,
          pendingCases: data.stats.pendingCases,
          totalClients: data.stats.activeClients,
          successRate: 75, // placeholder if not returned by API
          activeThisWeek: 3, // placeholder if not returned
        };
        setLawyers(normalizedStats);
        dispatch(setLawyerStats(normalizedStats));
        console.log("Fetching lawyer stats for firmId:", firmId);
      } catch (err) {
        console.error("Error fetching lawyer stats:", err);
      }
    };

    fetchLawyerStats();
  }, [dispatch]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const handleAddCase = () => {
    router.push("/add-case");
  };

  const handleAddClient = () => {
    router.push("/create-client");
  };

  const handleViewCases = () => {
    router.push("/get-cases");
  };

  const handleViewClients = () => {
    router.push("/get-clients");
  };

  if (loading) {
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
              Loading lawyer statistics...
            </Text>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
  }

  const statCards = [
    {
      title: "Completed Cases",
      value: lawyer?.completedCases,
      icon: <CheckCircleOutlined />,
      color: "#059669",
      background: "#ecfdf5",
      darkBackground: "#065f46",
      borderColor: "#d1fae5",
      growth: "+8%",
      period: "this month",
    },
    {
      title: "Ongoing Cases",
      value: lawyer?.ongoingCases,
      icon: <ClockCircleOutlined />,
      color: "#dc2626",
      background: "#fef2f2",
      darkBackground: "#991b1b",
      borderColor: "#fecaca",
      growth: "+3%",
      period: "this week",
    },
    {
      title: "Pending Cases",
      value: lawyer?.pendingCases,
      icon: <ExclamationCircleOutlined />,
      color: "#f59e0b",
      background: "#fffbeb",
      darkBackground: "#92400e",
      borderColor: "#fed7aa",
      growth: "-2%",
      period: "this month",
    },
    {
      title: "Active Clients",
      value: lawyer?.totalClients,
      icon: <TeamOutlined />,
      color: "#7c3aed",
      background: "#f3f4f6",
      darkBackground: "#5b21b6",
      borderColor: "#e5e7eb",
      growth: "+12%",
      period: "this quarter",
    },
  ];

  return (
    <div className="min-h-screen transition-colors duration-300">
      <div className="max-w-full">
        {/* Professional Header */}
        <Card
          className="bg-[#E43636] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg mb-[40px] !transition-none"
          bodyStyle={{ padding: "20px 16px" }}
        >
          <Row align="middle" justify="space-between">
            <Col xs={24} sm={24} md={18} lg={18}>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
                
                <div className="w-16 h-16 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border-2 bg-white/15 dark:bg-white/10 border-white/20 dark:border-white/30 flex-shrink-0">
                  <UserOutlined className="text-[24px] sm:text-[24px] md:text-[28px] lg:text-[32px] text-white" />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <Title
                    level={1}
                    className="!text-white dark:!text-white !mb-1 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight"
                  >
                    Welcome {lawyer?.lawyerName}
                  </Title>
                  <Text className="text-white/90 dark:text-white text-sm sm:text-base md:text-lg font-normal block">
                    Stay on top of your cases and provide exceptional legal
                    support
                  </Text>
                </div>
              </div>
            </Col>
            <Col>
              <Space size="middle">
                {/* Action buttons can be uncommented if needed */}
                {/* <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={handleAddCase}
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
                  New Case
                </Button> */}
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
              className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 "
              bodyStyle={{ padding: "20px", marginTop: "25px" }}
              style={{ height: "100%" }}
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="middle"
                className="flex flex-col justify-center"
              >
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
                      <PlusOutlined className="text-blue-600 dark:text-blue-400" />
                      <span className="text-slate-700 dark:text-white font-medium">
                        Create New Case
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
                      <UserAddOutlined className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-slate-700 dark:text-white font-medium">
                        Add New Client
                      </span>
                    </Space>
                    <RightOutlined className="text-slate-400 dark:text-white" />
                  </Space>
                </Button>

                <Button
                  type="text"
                  block
                  onClick={handleViewCases}
                  className="text-left h-12 rounded-xl border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"
                >
                  <Space
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <Space>
                      <FileOutlined className="text-red-600 dark:text-red-400" />
                      <span className="text-slate-700 dark:text-white font-medium">
                        View All Cases
                      </span>
                    </Space>
                    <RightOutlined className="text-slate-400 dark:text-white" />
                  </Space>
                </Button>

                <Button
                  type="text"
                  block
                  onClick={handleViewClients}
                  className="text-left h-12 rounded-xl border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"
                >
                  <Space
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <Space>
                      <TeamOutlined className="text-purple-600 dark:text-purple-400" />
                      <span className="text-slate-700 dark:text-white font-medium">
                        View All Clients
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
                  <FileTextOutlined className="text-red-600 dark:text-red-400" />
                  <span className="text-slate-900 dark:!text-white font-semibold">
                    Performance Overview
                  </span>
                </Space>
              }
              className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800"
              bodyStyle={{ padding: "20px" }}
            >
              {lawyer &&
              (lawyer.completedCases > 0 ||
                lawyer.ongoingCases > 0 ||
                lawyer.pendingCases > 0 ||
                lawyer.totalClients > 0) ? (
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={[
                        {
                          name: "Completed",
                          value: lawyer.completedCases || 0,
                        },
                        {
                          name: "Ongoing",
                          value: lawyer.ongoingCases || 0,
                        },
                        {
                          name: "Pending",
                          value: lawyer.pendingCases || 0,
                        },
                        {
                          name: "Clients",
                          value: lawyer.totalClients || 0,
                        },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b", 
                          borderRadius: "8px",
                          color: "#fff", 
                        }}
                        itemStyle={{ color: "#fff" }} 
                        labelStyle={{ color: "#fff" }}
                      />
                      <Bar
                        dataKey="value"
                        radius={[25, 24, 0, 0]}
                        maxBarSize={60}
                      >
                        {[
                          { fill: "#059669" },
                          { fill: "#dc2626" },
                          { fill: "#f59e0b" },
                          { fill: "#7c3aed" },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex justify-center items-center py-12">
                  <div className="px-8 py-6 rounded-2xl text-lg font-semibold text-amber-700 dark:text-amber-700 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center space-x-3 shadow-sm">
                    <FileTextOutlined className="text-amber-600 dark:text-amber-400 text-xl" />
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
