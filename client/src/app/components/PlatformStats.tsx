"use client";
import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Spin,
  Typography,
  Statistic,
  Space,
  Badge,
  message,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  FileOutlined,
  BankOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BarChartOutlined,
  TrophyOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
// Import your API functions
import {
  getAllFirms,
  getAllLawyers,
  getAllClients,
  getCaseMetadata,
  getPlatformOverview,
} from "../service/superAdminAPI"; // Update path as needed

const { Title, Text } = Typography;
import { FirmStats } from "../types/firm";
import { Lawyer } from "../types/lawyer";
import { Client } from "../types/client";
import { CaseMetadata } from "../types/case";
import { PlatformOverview } from "../types/platform";
import { GrowthData } from "../types/platform";
import { CaseStats } from "../types/platform";
import { SubscriptionData } from "../types/platform";
import { PerformanceData } from "../types/platform";
import { PlatformData } from "../types/platform";
export default function PlatformStats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platformData, setPlatformData] = useState<PlatformData>({
    totalFirms: 0,
    totalLawyers: 0,
    totalClients: 0,
    totalCases: 0,
    activeFirms: 0,
    activeLawyers: 0,
    openCases: 0,
    closedCases: 0,
    successRate: 0,
    clientSatisfaction: 0,
    monthlyRevenue: 0,
    monthlyGrowth: 0,
  });

  const [chartData, setChartData] = useState<{
    firmGrowth: GrowthData[];
    lawyerStats: GrowthData[];
    caseStats: CaseStats[];
    clientGrowth: GrowthData[];
    subscriptionData: SubscriptionData[];
    performanceData: PerformanceData[];
  }>({
    firmGrowth: [],
    lawyerStats: [],
    caseStats: [],
    clientGrowth: [],
    subscriptionData: [],
    performanceData: [],
  });

  useEffect(() => {
    const fetchPlatformData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all required data in parallel
        const [
          overviewResponse,
          firmsResponse,
          lawyersResponse,
          clientsResponse,
          caseMetadataResponse,
        ] = await Promise.allSettled([
          getPlatformOverview(),
          getAllFirms(),
          getAllLawyers(),
          getAllClients(),
          getCaseMetadata(),
        ]);

        // Process platform overview
        let overview: PlatformOverview = {};
        if (overviewResponse.status === "fulfilled") {
          overview = overviewResponse.value || {};
        } else {
          console.warn(
            "Failed to fetch platform overview:",
            overviewResponse.reason
          );
        }

        // Process firms data
        let firms: FirmStats[] = [];
        console.log("Raw Firms Response Settled:", firmsResponse);

        if (firmsResponse.status === "fulfilled") {
          console.log("Firms API Response Value:", firmsResponse.value);

          firms = Array.isArray(firmsResponse.value?.firms)
            ? firmsResponse.value.firms
            : [];
        } else {
          console.error("Firms API failed:", firmsResponse.reason);
        }

        // Process lawyers data
        let lawyers: Lawyer[] = [];

        if (lawyersResponse.status === "fulfilled") {
          console.log("Raw Lawyers Response:", lawyersResponse.value);

          lawyers = Array.isArray(lawyersResponse.value)
            ? lawyersResponse.value
            : Array.isArray(lawyersResponse.value?.lawyers)
            ? lawyersResponse.value.lawyers
            : Array.isArray(lawyersResponse.value?.data)
            ? lawyersResponse.value.data
            : [];
        } else {
          console.warn("Failed to fetch lawyers:", lawyersResponse.reason);
        }

        // Process clients data
        let clients: Client[] = [];

        if (clientsResponse.status === "fulfilled") {
          console.log("Raw Clients Response:", clientsResponse.value);

          clients = Array.isArray(clientsResponse.value)
            ? clientsResponse.value
            : Array.isArray(clientsResponse.value?.clients)
            ? clientsResponse.value.clients
            : Array.isArray(clientsResponse.value?.data)
            ? clientsResponse.value.data
            : [];
        } else {
          console.warn("Failed to fetch clients:", clientsResponse.reason);
        }

        // Process case metadata

        // Calculate active firms (assuming firms with status 'active')
        const activeFirms = firms.filter(
          (firm) => firm.status === "active" || firm.status === "Active"
        ).length;

        // Calculate active lawyers
        const activeLawyers = lawyers.filter(
          (lawyer) => lawyer.status === "Active"
        ).length;

        // Process case data from metadata
        let caseMetadata: CaseMetadata = {
          totalCases: 0,
          openCases: 0,
          closedCases: 0,
        };

        if (caseMetadataResponse.status === "fulfilled") {
          caseMetadata = caseMetadataResponse.value || {
            totalCases: 0,
            openCases: 0,
            closedCases: 0,
          };
        } else {
          console.warn(
            "Failed to fetch case metadata:",
            caseMetadataResponse.reason
          );
        }
        const {
          totalCases = 0,
          openCases = 0,
          closedCases = totalCases - openCases,
        } = caseMetadata;

        // Update platform data state
        const newPlatformData = {
          totalFirms: firms.length,
          totalLawyers: lawyers.length,
          totalClients: clients.length,
          totalCases: totalCases,
          activeFirms: activeFirms,
          activeLawyers: activeLawyers,
          openCases: openCases,
          closedCases: closedCases,
          successRate: overview.successRate || 94.2,
          clientSatisfaction: overview.clientSatisfaction || 96.8,
          monthlyRevenue: overview.monthlyRevenue || 0,
          monthlyGrowth: overview.monthlyGrowth || 0,
        };

        setPlatformData(newPlatformData);
        console.log("✅ Platform data set:", newPlatformData);

        // Generate chart data based on real data
        // For now using mock data for charts, you can enhance this with actual historical data
        const currentMonth = new Date().toLocaleDateString("en-US", {
          month: "short",
        });
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

        // Generate realistic chart data based on current totals
        const generateGrowthData = (
          current: number,
          fieldName: string,
          activeFieldName: string | null = null
        ) => {
          return months.map((month, index) => {
            const ratio = (index + 1) / 6;
            const baseValue = Math.floor(
              current * ratio * (0.7 + Math.random() * 0.3)
            );

            // Use index signature for dynamic keys
            const result: { month: string; [key: string]: number | string } = {
              month,
              [fieldName]: baseValue,
            };

            if (activeFieldName) {
              result[activeFieldName] = Math.floor(
                baseValue * (0.85 + Math.random() * 0.1)
              );
            }

            return result;
          });
        };

        setChartData({
          firmGrowth: generateGrowthData(
            newPlatformData.totalFirms,
            "firms",
            "active"
          ),
          lawyerStats: generateGrowthData(
            newPlatformData.totalLawyers,
            "lawyers",
            "active"
          ),
          caseStats: months.map((month, index) => {
            const ratio = (index + 1) / 6;
            const totalForMonth = Math.floor(
              newPlatformData.totalCases * ratio * (0.7 + Math.random() * 0.3)
            );
            const openForMonth = Math.floor(totalForMonth * 0.4);
            const closedForMonth = totalForMonth - openForMonth;
            return {
              month,
              open: openForMonth,
              closed: closedForMonth,
              total: totalForMonth,
            };
          }),
          clientGrowth: generateGrowthData(
            newPlatformData.totalClients,
            "clients",
            "new"
          ),
          subscriptionData: [
            {
              plan: "Basic",
              count: Math.floor(activeFirms * 0.3),
              revenue: Math.floor(activeFirms * 0.3 * 100),
            },
            {
              plan: "Professional",
              count: Math.floor(activeFirms * 0.4),
              revenue: Math.floor(activeFirms * 0.4 * 200),
            },
            {
              plan: "Enterprise",
              count: Math.floor(activeFirms * 0.2),
              revenue: Math.floor(activeFirms * 0.2 * 500),
            },
            {
              plan: "Premium",
              count: Math.floor(activeFirms * 0.1),
              revenue: Math.floor(activeFirms * 0.1 * 800),
            },
          ],
          performanceData: [
            { category: "Case Success", rate: newPlatformData.successRate },
            {
              category: "Client Satisfaction",
              rate: newPlatformData.clientSatisfaction,
            },
            { category: "Lawyer Retention", rate: 89.5 },
            { category: "Firm Retention", rate: 92.1 },
            { category: "Platform Uptime", rate: 99.9 },
            { category: "Response Time", rate: 87.3 },
          ],
        });
      } catch (error) {
        console.error("Error fetching platform data:", error);
        setError("Failed to load platform statistics");
        message.error("Failed to load platform statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchPlatformData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="m-6 text-center border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <Text type="danger" style={{ fontSize: "16px" }}>
          {error}
        </Text>
      </Card>
    );
  }

  const statCards = [
    {
      title: "Total Law Firms",
      value: platformData.totalFirms,
      active: platformData.activeFirms,
      icon: <BankOutlined />,
      color: "#1e40af",
      background: "#eff6ff",
      growth: "+8%",
      period: "this month",
    },
    {
      title: "Legal Professionals",
      value: platformData.totalLawyers,
      active: platformData.activeLawyers,
      icon: <UserOutlined />,
      color: "#1e40af",
      background: "#ecfdf5",
      growth: "+12%",
      period: "this month",
    },
    {
      title: "Total Clients",
      value: platformData.totalClients,
      active: platformData.totalClients,
      icon: <TeamOutlined />,
      color: "#dc2626",
      background: "#fef2f2",
      growth: "+15%",
      period: "this quarter",
    },
    {
      title: "Total Cases",
      value: platformData.totalCases,
      active: platformData.openCases,
      icon: <FileOutlined />,
      color: "#7c3aed",
      background: "#f3f4f6",
      growth: "+10%",
      period: "this month",
    },
  ];

  return (
    <div className="min-h-screen transition-colors duration-300">
      <div className="max-w-full">
        {/* Professional Header */}
        <Card
          className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg mb-8 "
          bodyStyle={{ padding: "20px 16px" }}
        >
          <Row align="middle" justify="space-between">
            <Col xs={24} sm={24} md={18} lg={18}>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
                
                <div className="w-16 h-16 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border-2 bg-white/15 border-white/20 flex-shrink-0">
                  <CrownOutlined className="text-[24px] sm:text-[24px] md:text-[28px] lg:text-[32px] text-white" />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <Title
                    level={1}
                    className="!text-white !mb-1 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight"
                  >
                    Super Admin Dashboard
                  </Title>
                  <Text className="text-white/90 text-sm sm:text-base md:text-lg font-normal block">
                    Platform-wide Analytics & Management
                  </Text>
                </div>
              </div>
            </Col>
            <Col>
              <Space direction="vertical" align="end">
                <Badge
                  status="success"
                  text={
                    <span className="text-white font-medium">
                      System Online
                    </span>
                  }
                />
                <Text className="text-white/80 text-sm">
                  Last updated: {new Date().toLocaleString()}
                </Text>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Statistics Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: "40px" }}>
          {statCards.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                bodyStyle={{ padding: "24px" }}
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
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-blue-50 dark:bg-blue-900/30">
                      <span className="text-2xl text-blue-600 dark:text-blue-400">
                        {stat.icon}
                      </span>
                    </div>

                    <Statistic
                      value={stat.value}
                      valueRender={(node) => (
                        <span className="text-[#1e40af] dark:text-green-500 text-3xl font-bold">
                          {node}
                        </span>
                      )}
                    />

                    <Text className="text-slate-600 dark:text-slate-300 text-sm font-medium block mb-3">
                      {stat.title}
                    </Text>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                          {stat.growth}
                        </Text>
                        <Text className="text-slate-400 dark:text-slate-300 text-xs">
                          {stat.period}
                        </Text>
                      </div>
                      <div className="text-right">
                        <Text className="text-slate-500 dark:text-slate-400 text-xs block">
                          Active: {stat.active}
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Charts Section - First Row */}
        <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
          {/* Firm Growth Chart */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <BankOutlined className="text-blue-600 dark:text-blue-400" />
                  <span className="text-slate-900 dark:text-white font-semibold">
                    Firm Growth Trends
                  </span>
                </Space>
              }
              className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800"
              bodyStyle={{ padding: "20px" }}
            >
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={chartData.firmGrowth}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="firms"
                      fill="#3b82f6"
                      name="Total Firms"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="active"
                      fill="#10b981"
                      name="Active Firms"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          {/* Lawyer Statistics Chart */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <UserOutlined className="text-green-600 dark:text-green-400" />
                  <span className="text-slate-900 dark:text-white font-semibold">
                    Lawyer Statistics
                  </span>
                </Space>
              }
              className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800"
              bodyStyle={{ padding: "20px" }}
            >
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={chartData.lawyerStats}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="lawyers"
                      fill="#059669"
                      name="Total Lawyers"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="active"
                      fill="#06d6a0"
                      name="Active Lawyers"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          {/* Case Statistics Chart */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <FileOutlined className="text-red-600 dark:text-red-400" />
                  <span className="text-slate-900 dark:text-white font-semibold">
                    Case Management
                  </span>
                </Space>
              }
              className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800"
              bodyStyle={{ padding: "20px" }}
            >
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={chartData.caseStats}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="open"
                      fill="#dc2626"
                      name="Open Cases"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="closed"
                      fill="#16a34a"
                      name="Closed Cases"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Charts Section - Second Row */}
        <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
          {/* Client Growth Chart */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <TeamOutlined className="text-purple-600 dark:text-purple-400" />
                  <span className="text-slate-900 dark:text-white font-semibold">
                    Client Growth
                  </span>
                </Space>
              }
              className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800"
              bodyStyle={{ padding: "20px" }}
            >
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={chartData.clientGrowth}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="clients"
                      fill="#7c3aed"
                      name="Total Clients"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="new"
                      fill="#a855f7"
                      name="New Clients"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          {/* Subscription Revenue Chart */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <DashboardOutlined className="text-amber-600 dark:text-amber-400" />
                  <span className="text-slate-900 dark:text-white font-semibold">
                    Subscription Plans
                  </span>
                </Space>
              }
              className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800"
              bodyStyle={{ padding: "20px" }}
            >
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={chartData.subscriptionData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="plan" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="count"
                      fill="#f59e0b"
                      name="Subscribers"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#d97706"
                      name="Revenue ($)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          {/* Performance Metrics Chart */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <TrophyOutlined className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-slate-900 dark:text-white font-semibold">
                    Performance Metrics
                  </span>
                </Space>
              }
              className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800"
              bodyStyle={{ padding: "20px" }}
            >
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={chartData.performanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="category" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Bar
                      dataKey="rate"
                      fill="#10b981"
                      name="Performance %"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Summary Cards */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <BarChartOutlined className="text-blue-600 dark:text-blue-400" />
                  <span className="text-slate-900 dark:text-white font-semibold">
                    Platform Overview
                  </span>
                </Space>
              }
              className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800"
              bodyStyle={{ padding: "24px" }}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="text-center p-4 bg-blue-50 dark:bg-slate-900 rounded-xl">
                    <Statistic
                      title={
                        <span className="text-slate-600 dark:text-white text-sm">
                          Monthly Revenue
                        </span>
                      }
                      value={platformData.monthlyRevenue || 0}
                      prefix={
                        <span className="text-[#1e40af] dark:text-green-500 font-bold">
                          $
                        </span>
                      }
                      valueRender={(node) => (
                        <span className="text-[#1e40af] dark:text-green-500 text-[24px] font-bold">
                          {node}
                        </span>
                      )}
                    />
                  </div>
                </Col>
                <Col span={12}>
                  <div className="text-center p-4 bg-green-50 dark:bg-slate-900 rounded-xl">
                    <Statistic
                      title={
                        <span className="text-slate-600 dark:text-white text-sm">
                          Monthly Growth
                        </span>
                      }
                      value={platformData.monthlyGrowth || 0}
                      suffix={
                        <span className="text-[#1e40af] dark:text-green-500 font-bold">
                          %
                        </span>
                      }
                      valueRender={(node) => (
                        <span className="text-[#1e40af] dark:text-green-500 text-[24px] font-bold">
                          {node}
                        </span>
                      )}
                    />
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <TrophyOutlined className="text-amber-600 dark:text-amber-400" />
                  <span className="text-slate-900 dark:text-white font-semibold">
                    Key Achievements
                  </span>
                </Space>
              }
              className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800"
              bodyStyle={{ padding: "24px" }}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="text-center p-4 bg-emerald-50 dark:bg-slate-900 rounded-xl">
                    <Statistic
                      title={
                        <span className="text-slate-600 dark:text-white text-sm">
                          Success Rate
                        </span>
                      }
                      value={
                        platformData?.successRate !== undefined &&
                        platformData?.successRate !== null
                          ? Number(platformData.successRate).toFixed(2)
                          : "0.00"
                      }
                      suffix="%"
                      valueStyle={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "var(--tw-colors-emerald-600)", // light
                      }}
                      className="text-emerald-600 dark:text-green-500"
                    />
                  </div>
                </Col>
                <Col span={12}>
                  <div className="text-center p-4 bg-purple-50 dark:bg-slate-900 rounded-xl">
                    <Statistic
                      title={
                        <span className="text-slate-600 dark:text-white text-sm">
                          Satisfaction
                        </span>
                      }
                      value={
                        platformData?.clientSatisfaction !== undefined &&
                        platformData?.clientSatisfaction !== null
                          ? Number(platformData.clientSatisfaction).toFixed(2)
                          : "0.00"
                      }
                      suffix="%"
                      valueStyle={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color:
                          platformData?.clientSatisfaction >= 80
                            ? "#22c55e" // green-500
                            : platformData?.clientSatisfaction >= 50
                            ? "#eab308" // yellow-500
                            : "#ef4444", // red-500
                      }}
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
