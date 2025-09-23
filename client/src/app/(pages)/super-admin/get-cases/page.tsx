"use client";
import { getCaseMetadata } from "@/app/service/superAdminAPI";
import { useState, useEffect } from "react";
import {
  Spin,
  Typography,
  Button,
  Space,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  message,
 
} from "antd";
import {
  FolderOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BankOutlined,
  CalendarOutlined,
  BarChartOutlined,
  FileTextOutlined,
  RiseOutlined,
 

} from "@ant-design/icons";
import { toast } from "react-hot-toast";
import DashboardLayout from "@/app/components/DashboardLayout";
import { ThemeProvider } from "next-themes";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;

interface CasesByStatus {
  status: string;
  count: number;
}

interface CasesByMonth {
  month: string;
  count: number;
}

interface FirmWiseCases {
  firmId: number;
  count: number;
  firm: {
    id: number;
    name: string;
  };
}

interface CaseMetadata {
  success: boolean;
  totalCases: number;
  casesByStatus: CasesByStatus[];
  casesByMonth: CasesByMonth[];
  firmWiseCases: FirmWiseCases[];
}

export default function GetCases() {
  const [caseData, setCaseData] = useState<CaseMetadata | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch case metadata from API
  const fetchCaseMetadata = async () => {
    try {
      setLoading(true);
      const response = await getCaseMetadata();
      console.log("Case metadata response:", response);

      if (response.success) {
        setCaseData(response);
      } else {
        message.error("Failed to load case metadata");
      }
    } catch (error) {
      message.error("Something went wrong while loading case data");
      console.error(error);
      setCaseData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseMetadata();
  }, []);

  // Get statistics
  const totalCases = caseData?.totalCases || 0;
  const openCases =
    caseData?.casesByStatus?.find((s) => s.status === "Open")?.count || 0;
  const closedCases =
    caseData?.casesByStatus?.find((s) => s.status === "Closed")?.count || 0;
  const pendingCases =
    caseData?.casesByStatus?.find((s) => s.status === "Pending")?.count || 0;

  // Get current month cases
  const currentMonthCases = caseData?.casesByMonth?.[0]?.count || 0;

  // Status distribution for progress bars
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "#10b981";
      case "closed":
        return "#6b7280";
      case "pending":
        return "#f59e0b";
      case "in progress":
        return "#3b82f6";
      default:
        return "#8b5cf6";
    }
  };

  // Firm-wise cases table columns
  const firmColumns: ColumnsType<FirmWiseCases> = [
    {
      title: "Firm Name",
      key: "firmName",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "#f1f5f9",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #e5e7eb",
            }}
          >
            <BankOutlined style={{ color: "#64748b" }} />
          </div>
          <div>
            <Text
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#111827",
              }}
            >
              {record.firm.name}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Total Cases",
      dataIndex: "count",
      key: "count",
      align: "center",
      render: (count: number) => (
        <Tag
          style={{
            color: "#3b82f6",
            backgroundColor: "#dbeafe",
            border: "1px solid #3b82f620",
            borderRadius: "8px",
            padding: "4px 12px",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          {count} Cases
        </Tag>
      ),
    },
  ];

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DashboardLayout>
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <Spin size="large" tip="Loading case data..." />
          </div>
        ) : (
          <div className="min-h-screen transition-colors duration-300 [&_.ant-typography]:dark:!text-white [&_.ant-card-head-title]:dark:!text-white">
            <div className="max-w-full">
              {/* Header Section */}
              <Card
                className="bg-[#E43636] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
                bodyStyle={{ padding: "32px 20px" }}
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
                        <FolderOutlined
                          style={{ fontSize: "32px", color: "white" }}
                        />
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
                          Cases
                        </Title>
                        <Text
                          style={{
                            color: "rgba(255,255,255,0.8)",
                            fontSize: "18px",
                            fontWeight: "400",
                          }}
                        >
                          Overview of all legal cases across firms
                        </Text>
                      </div>
                    </Space>
                  </Col>
                  <Col>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={fetchCaseMetadata}
                      loading={loading}
                      size="large"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.2)",
                        borderColor: "rgba(255,255,255,0.3)",
                        color: "white",
                        borderRadius: "12px",
                      }}
                      className="hover:!bg-white/30 hover:!border-white/40"
                    >
                      Refresh Data
                    </Button>
                  </Col>
                </Row>
              </Card>

              {/* Main Statistics Cards */}
              <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                    bodyStyle={{ padding: "30px" }}
                    hoverable
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow =
                        "0 10px 25px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 1px 3px rgba(0,0,0,0.1)";
                    }}
                  >
                    <Statistic
                      title={
                        <span className="text-slate-500 dark:text-white text-lg font-medium mb-[15px] block">
                          Total Cases
                        </span>
                      }
                      value={totalCases}
                      valueStyle={{
                        fontSize: "32px",
                        fontWeight: "700",
                        lineHeight: "1",
                        color: "inherit",
                      }}
                      prefix={
                        <FileTextOutlined className="text-blue-600 dark:text-blue-400 text-3xl mr-1" />
                      }
                      className="text-blue-600 dark:text-blue-600"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                    bodyStyle={{ padding: "30px" }}
                    hoverable
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow =
                        "0 10px 25px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 1px 3px rgba(0,0,0,0.1)";
                    }}
                  >
                    <Statistic
                      title={
                        <span className="text-slate-500 dark:text-white text-lg font-medium mb-[15px] block">
                          Open Cases
                        </span>
                      }
                      value={openCases}
                      valueStyle={{
                        fontSize: "32px",
                        fontWeight: "700",
                        lineHeight: "1",
                        color: "inherit",
                      }}
                      prefix={
                        <CheckCircleOutlined className="text-green-600 dark:text-green-400 text-3xl mr-1" />
                      }
                      className="text-green-600 dark:text-green-500"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                    bodyStyle={{ padding: "30px" }}
                    hoverable
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow =
                        "0 10px 25px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 1px 3px rgba(0,0,0,0.1)";
                    }}
                  >
                    <Statistic
                      title={
                        <span className="text-slate-500 dark:text-white text-lg font-medium mb-[15px] block">
                          This Month
                        </span>
                      }
                      value={currentMonthCases}
                      valueStyle={{
                        fontSize: "32px",
                        fontWeight: "700",
                        lineHeight: "1",
                        color: "inherit",
                      }}
                      prefix={
                        <CalendarOutlined className="text-purple-600 dark:text-purple-400 text-3xl mr-1" />
                      }
                      className="text-purple-600 dark:text-purple-500"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                    bodyStyle={{ padding: "30px" }}
                    hoverable
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow =
                        "0 10px 25px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 1px 3px rgba(0,0,0,0.1)";
                    }}
                  >
                    <Statistic
                      title={
                        <span className="text-slate-500 dark:text-white text-lg font-medium mb-[15px] block">
                          Active Firms
                        </span>
                      }
                      value={caseData?.firmWiseCases?.length || 0}
                      valueStyle={{
                        fontSize: "32px",
                        fontWeight: "700",
                        lineHeight: "1",
                        color: "inherit",
                      }}
                      prefix={
                        <BankOutlined className="text-orange-600 dark:text-orange-400 text-3xl mr-1" />
                      }
                      className="text-orange-600 dark:text-orange-500"
                    />
                  </Card>
                </Col>
              </Row>

              {/* Status Distribution and Firm Analysis */}
              <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
                {/* Case Status Distribution */}
                <Col xs={24} lg={12}>
                  <Card
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm transition-colors duration-300 h-full"
                    title={
                      <Space>
                        <BarChartOutlined className="text-slate-600 dark:text-slate-300" />
                        <span className="text-slate-700 dark:text-slate-200 font-semibold">
                          Case Status Distribution
                        </span>
                      </Space>
                    }
                    bodyStyle={{ padding: "24px" }}
                  >
                    <Space direction="vertical" size="large" className="w-full">
                      {caseData?.casesByStatus?.map((status, index) => (
                        <div key={index} className="w-full">
                          <div className="flex justify-between items-center mb-2">
                            <Text className="text-slate-600 dark:text-slate-300 font-medium">
                              {status.status}
                            </Text>
                            <Text className="text-slate-700 dark:text-slate-200 font-semibold">
                              {status.count} cases
                            </Text>
                          </div>
                          <Progress
                            percent={
                              totalCases > 0
                                ? (status.count / totalCases) * 100
                                : 0
                            }
                            strokeColor={getStatusColor(status.status)}
                            trailColor="#f1f5f9"
                            size="default"
                            format={(percent) => `${percent?.toFixed(1)}%`}
                          />
                        </div>
                      )) || (
                        <div className="text-center py-8">
                          <ClockCircleOutlined className="text-4xl text-slate-400 mb-4" />
                          <Text className="text-slate-500 dark:text-slate-400">
                            No status data available
                          </Text>
                        </div>
                      )}
                    </Space>
                  </Card>
                </Col>

                {/* Monthly Trend */}
                <Col xs={24} lg={12}>
                  <Card
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm transition-colors duration-300 h-full"
                    title={
                      <Space>
                        <RiseOutlined className="text-slate-600 dark:text-slate-300" />
                        <span className="text-slate-700 dark:text-slate-200 font-semibold">
                          Monthly Cases
                        </span>
                      </Space>
                    }
                    bodyStyle={{ padding: "24px" }}
                  >
                    <Space direction="vertical" size="large" className="w-full">
                      {caseData?.casesByMonth?.map((month, index) => {
                        const monthName = new Date(
                          month.month + "-01"
                        ).toLocaleString("default", {
                          month: "long",
                          year: "numeric",
                        });
                        return (
                          <div key={index} className="w-full">
                            <div className="flex justify-between items-center mb-2">
                              <Text className="text-slate-600 dark:text-slate-300 font-medium">
                                {monthName}
                              </Text>
                              <Text className="text-slate-700 dark:text-slate-200 font-semibold">
                                {month.count} cases
                              </Text>
                            </div>
                            <Progress
                              percent={100}
                              strokeColor="#3b82f6"
                              trailColor="#f1f5f9"
                              size="default"
                              format={() => `${month.count}`}
                            />
                          </div>
                        );
                      }) || (
                        <div className="text-center py-8">
                          <CalendarOutlined className="text-4xl text-slate-400 mb-4" />
                          <Text className="text-slate-500 dark:text-slate-400">
                            No monthly data available
                          </Text>
                        </div>
                      )}
                    </Space>
                  </Card>
                </Col>
              </Row>

              {/* Firm-wise Cases Table */}
              <Card
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm transition-colors duration-300"
                title={
                  <Space>
                    <BankOutlined className="text-slate-600 dark:text-slate-300" />
                    <span className="text-slate-700 dark:text-slate-200 font-semibold">
                      Cases by Law Firm
                    </span>
                  </Space>
                }
                bodyStyle={{ padding: 0 }}
              >
                <Table<FirmWiseCases>
                  dataSource={caseData?.firmWiseCases || []}
                  columns={firmColumns}
                  rowKey="firmId"
                  loading={loading}
                  pagination={false}
                  className="!rounded-none dark:[&_.ant-table]:!bg-slate-800 
                    dark:[&_.ant-table-thead>tr>th]:!bg-slate-900 
                    dark:[&_.ant-table-thead>tr>th]:!text-slate-200 
                    dark:[&_.ant-table-tbody>tr>td]:!bg-slate-800 
                    dark:[&_.ant-table-tbody>tr>td]:!text-slate-300"
                  style={{
                    borderRadius: 0,
                    overflow: "hidden",
                  }}
                  locale={{
                    emptyText: (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "48px",
                        }}
                        className="text-slate-500 dark:text-slate-400"
                      >
                        <FolderOutlined
                          style={{ fontSize: "48px", marginBottom: "16px" }}
                        />
                        <Title
                          level={4}
                          className="!text-slate-500 dark:!text-slate-300"
                        >
                          No case data found
                        </Title>
                        <Text className="dark:text-slate-400">
                          Case data will appear here when available
                        </Text>
                      </div>
                    ),
                  }}
                />
              </Card>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ThemeProvider>
  );
}
