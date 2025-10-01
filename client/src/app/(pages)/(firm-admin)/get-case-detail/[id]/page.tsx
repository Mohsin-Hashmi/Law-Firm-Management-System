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
  Input,
  Select,
  Table,
  Empty,
  Tooltip,
  Statistic,
} from "antd";
import {
  UserOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  FileTextOutlined,
  TeamOutlined,
  BankOutlined,
  SafetyOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  EyeOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  ReloadOutlined,
  BankTwoTone,
} from "@ant-design/icons";
import { getCaseById } from "@/app/service/adminAPI";
import { toast } from "react-hot-toast";
import { ThemeProvider } from "next-themes";
import { use } from "react";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

// Define interfaces based on your backend response
interface Client {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  profileImage?: string;
  clientType: string;
  status: string;
}

interface Lawyer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  specialization?: string;
  profileImage?: string;
}

interface CaseDocument {
  id: number;
  fileName: string;
  filePath: string;
  uploadDate: string;
  fileSize?: number;
  documentType?: string;
}

interface Case {
  id: number;
  title: string;
  description: string;
  caseType: string;
  status: string;
  priority: string;
  startDate: string;
  endDate?: string;
  estimatedValue?: number;
  actualValue?: number;
  createdAt: string;
  updatedAt: string;
  client: Client;
  lawyers: Lawyer[];
  documents: CaseDocument[];
}

import { useAppSelector } from "@/app/store/hooks";
import { RootState } from "@/app/store/store";

export default function GetCaseDetail({
  params,
}: {
  params: Promise<{ firmId: string; id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const caseId = Number(id);
  const user = useAppSelector((state: RootState) => state.user.user);
  const firmId = user?.firmId;

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>("");
  const [filteredDocuments, setFilteredDocuments] = useState<CaseDocument[]>(
    []
  );
  console.log("Filtered docs:", filteredDocuments);

  useEffect(() => {
    if (caseId && firmId !== undefined) {
      fetchCaseDetail();
    }
  }, [caseId, firmId]);

  useEffect(() => {
    if (caseData?.documents) {
      let filtered = caseData.documents;

      // Apply search filter
      if (searchText) {
        filtered = filtered.filter((doc) =>
          doc.fileName.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      // Apply document type filter
      if (documentTypeFilter) {
        filtered = filtered.filter(
          (doc) => doc.documentType === documentTypeFilter
        );
      }

      setFilteredDocuments(filtered);
    }
  }, [caseData, searchText, documentTypeFilter]);

  const fetchCaseDetail = async () => {
    if (firmId === undefined) return;
    try {
      setLoading(true);
      const data = await getCaseById(caseId);
      setCaseData(data.case);
      toast.success("Successfully fetched case detail");
    } catch (error) {
      console.error("Error fetching case detail:", error);
      toast.error("Failed to fetch case detail");
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentView = (document: CaseDocument) => {
    if (!document.filePath) {
      toast.error("No file URL available for this document");
      return;
    }

    // Clean up leading slashes to avoid `//` in the URL
    const baseUrl = "http://localhost:5000";
    const normalizedUrl = document.filePath.startsWith("/")
      ? `${baseUrl}/${document.filePath}`
      : `${baseUrl}/${document.filePath}`;

    window.open(normalizedUrl, "_blank", "noopener,noreferrer");
  };

  const documentColumns = [
    {
      title: "Document",
      dataIndex: "fileName",
      key: "fileName",
      width: "70%",
      render: (text: string, record: CaseDocument) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <FileTextOutlined style={{ color: "#2563eb", fontSize: "22px" }} />
          </div>
          <div className="flex-1 min-w-0">
            <Text
              className="block text-slate-900 dark:text-slate-200 font-semibold text-base"
              ellipsis={{ tooltip: text }}
            >
              {text}
            </Text>
            {record.documentType && (
              <Tag
                style={{
                  background: `#2563eb15`,
                  color: "#2563eb",
                  border: `1px solid #2563eb30`,
                  borderRadius: "8px",
                  padding: "4px 12px",
                  fontSize: "12px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  marginTop: "4px",
                }}
              >
                {record.documentType}
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "30%",
      align: "right",
      fixed: "right",
      render: (text: any, record: CaseDocument) => (
        <div className="flex justify-end">
          <Space size="small">
            <Tooltip title="View Document">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleDocumentView(record)}
                className="hover:!bg-blue-50 dark:text-gray-200 hover:!text-blue-600 dark:hover:!bg-blue-900/30 dark:hover:!text-blue-400"
                style={{ borderRadius: "6px" }}
              />
            </Tooltip>
          </Space>
        </div>
      ),
    },
  ];

  const getUniqueDocumentTypes = () => {
    if (!caseData?.documents) return [];
    return [
      ...new Set(
        caseData.documents.map((doc) => doc.documentType).filter(Boolean)
      ),
    ];
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!caseData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div style={{ textAlign: "center" }}>
            <FileTextOutlined
              style={{
                fontSize: "48px",
                color: "#9ca3af",
                marginBottom: "16px",
              }}
            />
            <Title level={4} className="!text-slate-500 dark:!text-slate-300">
              Case not found
            </Title>
            <Text className="dark:text-slate-400">
              The requested case could not be found.
            </Text>
            <br />
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
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
        <div className="min-h-screen transition-colors duration-300 [&_.ant-typography]:dark:!text-white [&_.ant-card-head-title]:dark:!text-white">
          <div className="max-w-full">
            {/* Header Section - Matching get-cases page exactly */}
            <Card
              className="bg-[#433878] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
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
                      <SafetyOutlined
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
                        {caseData.title}
                      </Title>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "18px",
                          fontWeight: "400",
                        }}
                      >
                        Status: {caseData.status}
                      </Text>
                    </div>
                  </Space>
                </Col>
                <Col>
                  <Space size="middle">
                    <Button
                      icon={<ArrowLeftOutlined />}
                      onClick={() => router.back()}
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        borderColor: "rgba(255,255,255,0.3)",
                        color: "white",
                        borderRadius: "12px",
                        fontWeight: "600",
                        padding: "8px 24px",
                        height: "48px",
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      icon={<EditOutlined />}
                      onClick={() => router.push(`/edit-case/${caseData.id}`)}
                      style={{
                        background: "white",
                        borderColor: "white",
                        color: "#2563eb",
                        borderRadius: "12px",
                        fontWeight: "600",
                        padding: "8px 24px",
                        height: "48px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    >
                      Edit Case
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Info Cards - Matching get-cases page styling with updated client and lawyer cards */}
            <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
              {/* Case Name Card */}
              <Col xs={24} sm={6}>
                <Card
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                  bodyStyle={{
                    padding: "30px",
                    height: "140px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
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
                        Case Name
                      </span>
                    }
                    value={caseData.title}
                    valueStyle={{
                      fontSize: "20px",
                      fontWeight: "700",
                      lineHeight: "1.2",
                      color: "inherit",
                    }}
                    prefix={
                      <FileTextOutlined className="text-blue-600 dark:text-blue-400 text-2xl mr-1" />
                    }
                    className="text-blue-600 dark:text-blue-600 [&_.ant-statistic-content-value]:dark:!text-blue-600"
                  />
                </Card>
              </Col>

              {/* Client Card - Updated with image in top right */}
              <Col xs={24} sm={6}>
                <Card
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                  bodyStyle={{
                    padding: "30px",
                    position: "relative",
                    height: "140px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
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
                  {/* Small avatar in top right */}
                  <Avatar
                    size={40}
                    src={
                      caseData.client?.profileImage
                        ? `http://localhost:5000${caseData.client.profileImage}`
                        : undefined
                    }
                    icon={<UserOutlined />}
                    className="absolute top-4 right-4 bg-emerald-100 border-2 border-emerald-200"
                  />
                  <div>
                    <Text className="text-slate-500 dark:text-white text-lg font-medium mb-2 block">
                      Client
                    </Text>
                    <Text
                      className="text-emerald-600 dark:text-emerald-500 text-xl font-bold block"
                      ellipsis={{ tooltip: caseData.client?.fullName }}
                    >
                      {caseData.client?.fullName}
                    </Text>
                  </div>
                </Card>
              </Col>

              {/* Legal Team Card - Updated with images in top right */}
              <Col xs={24} sm={6}>
                <Card
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                  bodyStyle={{
                    padding: "30px",
                    position: "relative",
                    height: "140px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
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
                  {/* Small avatar group in top right */}
                  <div className="absolute top-4 right-4">
                    <Avatar.Group maxCount={2} size={32}>
                      {caseData.lawyers?.map((lawyer, index) => (
                        <Avatar
                          key={lawyer.id}
                          src={
                            lawyer.profileImage
                              ? `http://localhost:5000${lawyer.profileImage}`
                              : undefined
                          }
                          icon={<UserOutlined />}
                          className="bg-blue-100 border-2 border-blue-200"
                        />
                      ))}
                    </Avatar.Group>
                  </div>
                  <div>
                    <Text className="text-slate-500 dark:text-white text-lg font-medium mb-2 block">
                      Legal Team
                    </Text>
                    {caseData.lawyers && caseData.lawyers.length > 0 ? (
                      <Text
                        className="text-green-600 dark:text-green-500 text-xl font-bold block"
                        ellipsis={{
                          tooltip: caseData.lawyers
                            .map((l) => l.fullName || "Unknown")
                            .join(", "),
                        }}
                      >
                        {caseData.lawyers.length === 1
                          ? (caseData.lawyers[0].fullName || "Unknown").split(
                              " "
                            )[0]
                          : `${caseData.lawyers.length} Lawyers`}
                      </Text>
                    ) : (
                      <Text className="text-gray-500 dark:text-gray-400 text-xl font-bold block">
                        No Lawyers
                      </Text>
                    )}
                  </div>
                </Card>
              </Col>

              {/* Case Type Card */}
              <Col xs={24} sm={6}>
                <Card
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                  bodyStyle={{
                    padding: "30px",
                    height: "140px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
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
                        Case Type
                      </span>
                    }
                    value={caseData.caseType}
                    valueStyle={{
                      fontSize: "20px",
                      fontWeight: "700",
                      lineHeight: "1",
                      color: "inherit",
                    }}
                    prefix={
                      <BankOutlined className="text-purple-600 dark:text-purple-400 text-2xl mr-1" />
                    }
                    className="text-purple-600 dark:text-purple-600 [&_.ant-statistic-content-value]:dark:!text-purple-600"
                  />
                </Card>
              </Col>
            </Row>

            {/* Search and Filter Section - Matching get-cases page */}
            <Card
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-8"
              bodyStyle={{ padding: "24px" }}
            >
              <Row gutter={[16, 16]} align="middle" justify="space-between">
                {/* Search Input */}
                <Col xs={24} md={16} lg={12}>
                  <Input
                    placeholder="Search documents by name..."
                    prefix={<SearchOutlined className="text-slate-400" />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                    size="large"
                  />
                </Col>

                {/* Action Buttons */}
                <Col xs={24} md={12} lg={12}>
                  <Space size="middle" className="flex justify-end w-full">
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        setSearchText("");
                        setDocumentTypeFilter("");
                      }}
                      className="rounded-xl border border-slate-300 dark:border-slate-600 dark:text-white 
            !bg-transparent hover:!bg-transparent active:!bg-transparent focus:!bg-transparent"
                    >
                      Reset Filters
                    </Button>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() =>
                        toast.success("Upload feature coming soon")
                      }
                      style={{
                        background: "white",
                        borderColor: "white",
                        color: "#2563eb",
                        borderRadius: "12px",
                        fontWeight: "600",
                      }}
                    >
                      Upload Document
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Documents Table - Updated without Size and Upload Date columns */}
            <Card
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm transition-colors duration-300"
              bodyStyle={{ padding: 0 }}
            >
              {filteredDocuments.length > 0 ? (
                <Table
                  columns={documentColumns}
                  dataSource={filteredDocuments}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} documents`,
                    className: "dark:text-slate-300",
                    style: { marginRight: "24px", marginBottom: "16px" },
                  }}
                  className="dark:[&_.ant-table]:!bg-slate-800 
                         dark:[&_.ant-table-thead>tr>th]:!bg-slate-900 
                         dark:[&_.ant-table-thead>tr>th]:!text-slate-200 
                         dark:[&_.ant-table-tbody>tr>td]:!bg-slate-800 
                         dark:[&_.ant-table-tbody>tr>td]:!text-slate-300
                         dark:[&_.ant-table-tbody>tr:hover>td]:!bg-slate-700"
                  style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                  }}
                  scroll={{ x: 800 }}
                />
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px",
                  }}
                  className="text-slate-500 dark:text-slate-400"
                >
                  <FileTextOutlined
                    style={{ fontSize: "48px", marginBottom: "16px" }}
                  />
                  <Title
                    level={4}
                    className="!text-slate-500 dark:!text-slate-300"
                  >
                    No documents found
                  </Title>
                  <Text className="dark:text-slate-400">
                    {searchText || documentTypeFilter
                      ? "No documents match your search criteria"
                      : "No documents uploaded for this case"}
                  </Text>
                  <br />
                  {!searchText && !documentTypeFilter && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() =>
                        toast.success("Upload feature coming soon")
                      }
                      style={{ marginTop: "16px" }}
                    >
                      Upload First Document
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ThemeProvider>
  );
}
