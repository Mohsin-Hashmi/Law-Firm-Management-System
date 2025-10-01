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
  Upload,
  Progress,
} from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  FileOutlined,
  EyeOutlined,
  UploadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  RightOutlined,
  DashboardOutlined,
  FolderOpenOutlined,
  FilePdfOutlined,
  CloudUploadOutlined,
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
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useRouter } from "next/navigation";
import { RootState } from "../store/store";
import { clientStatsData } from "../service/adminAPI";
import { useState } from "react";
import { ClientStats } from "../types/client";

const { Title, Text } = Typography;
const { Dragger } = Upload;

interface Props {
  firmId: number;
  role?: string;
}

// Sample chart data for case progress
const progressData = [
  { name: "Week 1", progress: 10 },
  { name: "Week 2", progress: 25 },
  { name: "Week 3", progress: 40 },
  { name: "Week 4", progress: 65 },
  { name: "Week 5", progress: 75 },
  { name: "Week 6", progress: 85 },
];

export default function ClientView({ firmId, role }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state: RootState) => state.user.user);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<ClientStats | null>(null);

  const error = null; // Replace with actual error state

  // Sample client stats - replace with actual data from your API

useEffect(() => {
  if (!firmId || !role) return;

  const fetchClientStats = async () => {
    try {
      setLoading(true);
      const data = await clientStatsData();
      if (data) {
        setStats({
          clientId: data.clientId,
          clientName: data.clientName,
          ...data.stats, // spread totalCases, activeCases, completedCases, uploadedDocuments
        });
      }
    } catch (err) {
      console.error("Error fetching client stats:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchClientStats();
}, [firmId, role, dispatch]);


  if (loading || !user) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" />
        <Text className="ml-2">Loading user data...</Text>
      </div>
    );
  }

  const handleViewCases = () => {
    // Navigate to client's cases view
    router.push("/get-cases");
  };

  const handleViewDocuments = () => {
    // Navigate to client's documents view
    router.push("/get-case-documents");
  };

  const handleUploadDocument = () => {
    // Navigate to document upload page
    router.push("/upload-case-documents");
  };

  const handleViewCaseStatus = () => {
    // Navigate to case status view
    router.push("/case-status");
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
              Loading client dashboard...
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
      title: "Total Cases",
      value: stats?.totalCases,
      icon: <FileOutlined />,
      color: "#3b82f6",
      background: "#eff6ff",
      darkBackground: "#1e3a8a",
      borderColor: "#bfdbfe",
      growth: "+2%",
      period: "this month",
      permission: "read_case",
    },
    {
      title: "Active Cases",
      value: stats?.activeCases,
      icon: <FileTextOutlined />,
      color: "#059669",
      background: "#ecfdf5",
      darkBackground: "#065f46",
      borderColor: "#d1fae5",
      growth: "+1%",
      period: "this quarter",
      permission: "read_case",
    },
    {
      title: "Completed Cases",
      value:  stats?.completedCases,
      icon: <CheckCircleOutlined />,
      color: "#7c3aed",
      background: "#f3f4f6",
      darkBackground: "#5b21b6",
      borderColor: "#e5e7eb",
      growth: "+5%",
      period: "this week",
      permission: "upload_case_document",
    },
    {
      title: "Uploaded Documents",
      value: stats?.uploadedDocuments,
      icon: <CloudUploadOutlined />,
      color: "#f59e0b",
      background: "#fffbeb",
      darkBackground: "#92400e",
      borderColor: "#fed7aa",
      growth: "-1%",
      period: "this week",
      permission: "view_case_status",
    },
  ];

  return (
    <div className="min-h-screen transition-colors duration-300">
      <div className="max-w-full">
        {/* Professional Header */}
        <Card
          className="bg-emerald-600 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg mb-[40px] !transition-none"
          bodyStyle={{ padding: "32px 20px" }}
        >
          <Row align="middle" justify="space-between">
            <Col>
              <Space size="large">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center border-2 bg-white/15 dark:bg-white/10 border-white/20 dark:border-white/30">
                  <UserOutlined className="text-[32px] text-white" />
                </div>
                <div>
                  <Title
                    level={1}
                    className="!text-white dark:!text-white !mb-1 text-4xl font-semibold tracking-tight"
                  >
                    Welcome {stats?.clientName}
                  </Title>
                  <Text className="text-white/100 dark:text-white text-lg font-normal">
                    Client Dashboard
                  </Text>
                </div>
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
                      className="bg-emerald-50 dark:bg-emerald-900/30"
                    >
                      <span
                        style={{ fontSize: "20px" }}
                        className="text-emerald-600 dark:text-emerald-400"
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
                      className="text-emerald-600 dark:text-green-500 [&_.ant-statistic-content-value]:dark:!text-green-500 mb-[10px]"
                    />

                    {/* Mini Graph */}
                    <div style={{ width: "100%", height: 50 }}>
                      <ResponsiveContainer>
                        <AreaChart data={progressData}>
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
                            dataKey="progress"
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
          {/* Quick Actions - Based on Client Permissions */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <DashboardOutlined className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-slate-900 dark:!text-white font-semibold">
                    Available Actions
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
                {/* Read Cases Permission */}
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
                      <FileTextOutlined className="text-blue-600 dark:text-blue-400" />
                      <span className="text-slate-700 dark:text-white font-medium">
                        View My Cases
                      </span>
                    </Space>
                    <RightOutlined className="text-slate-400 dark:text-white" />
                  </Space>
                </Button>

                {/* Upload Case Document Permission */}
                <Button
                  type="text"
                  block
                  onClick={handleUploadDocument}
                  className="text-left h-12 rounded-xl border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"
                >
                  <Space
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <Space>
                      <UploadOutlined className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-slate-700 dark:text-white font-medium">
                        Upload Documents
                      </span>
                    </Space>
                    <RightOutlined className="text-slate-400 dark:text-white" />
                  </Space>
                </Button>

                {/* View Case Documents Permission */}
                <Button
                  type="text"
                  block
                  onClick={handleViewDocuments}
                  className="text-left h-12 rounded-xl border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"
                >
                  <Space
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <Space>
                      <FolderOpenOutlined className="text-purple-600 dark:text-purple-400" />
                      <span className="text-slate-700 dark:text-white font-medium">
                        View Documents
                      </span>
                    </Space>
                    <RightOutlined className="text-slate-400 dark:text-white" />
                  </Space>
                </Button>

                {/* View Case Status Permission */}
                <Button
                  type="text"
                  block
                  onClick={handleViewCaseStatus}
                  className="text-left h-12 rounded-xl border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"
                >
                  <Space
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <Space>
                      <EyeOutlined className="text-amber-600 dark:text-amber-400" />
                      <span className="text-slate-700 dark:text-white font-medium">
                        Case Status
                      </span>
                    </Space>
                    <RightOutlined className="text-slate-400 dark:text-white" />
                  </Space>
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Document Upload Section */}
        <Row gutter={[24, 24]} style={{ marginTop: "32px" }}>
          <Col span={24}>
            <Card
              title={
                <Space>
                  <CloudUploadOutlined className="text-blue-600 dark:text-blue-400" />
                  <span className="text-slate-900 dark:!text-white font-semibold">
                    Quick Document Upload
                  </span>
                </Space>
              }
              className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800"
              bodyStyle={{ padding: "20px" }}
            >
              <Dragger
                name="files"
                multiple
                className="bg-slate-50 dark:bg-slate-700 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl"
                style={{ padding: "40px 20px" }}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined className="text-4xl text-blue-600 dark:text-blue-400" />
                </p>
                <p className="ant-upload-text text-slate-900 dark:text-white">
                  Click or drag files to this area to upload
                </p>
                <p className="ant-upload-hint text-slate-500 dark:text-slate-400">
                  Support for PDF, DOC, DOCX, and image files. Maximum file size: 10MB
                </p>
              </Dragger>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}