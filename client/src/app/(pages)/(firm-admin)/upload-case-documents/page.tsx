"use client";

import DashboardLayout from "@/app/components/DashboardLayout";
import { useAppSelector } from "@/app/store/hooks";
import { RootState } from "@/app/store/store";
import { ThemeProvider } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Input,
  message,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
  UploadOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  BankTwoTone,
  ArrowLeftOutlined
} from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { Case } from "@/app/types/case";
import BASE_URL from "@/app/utils/constant";
import { useRouter } from "next/navigation";

import {
  getAllCasesOfFirm,
  getAllCasesOfLawyer,
  uploadCaseDocuments,
  getAllCasesOfClient,
} from "@/app/service/adminAPI";
import { usePermission } from "@/app/hooks/usePermission";
import ConfirmationModal from "@/app/components/ConfirmationModal";

const { Title, Text } = Typography;
const { Option } = Select;

export default function UploadCaseDocumentsPage() {
  const { hasPermission } = usePermission();
  const router= useRouter();
  const user = useAppSelector((state: RootState) => state.user.user);
  const firmId = user?.firmId ?? user?.activeFirmId;
  const role = user?.role;

  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [caseTypeFilter, setCaseTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [pendingUploads, setPendingUploads] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [confirmUploadModalOpen, setConfirmUploadModalOpen] =
    useState<boolean>(false);

  const fetchCases = async (firmId: number) => {
    try {
      setLoading(true);
      let response: Case[] = [];
      if (role === "Firm Admin") {
        response = await getAllCasesOfFirm(firmId);
      } else if (role === "Lawyer") {
        response = await getAllCasesOfLawyer();
      } else if (role === "Client" && user?.id) {
        response = await getAllCasesOfClient(user.id);
      }
      setCases(response);
      setFilteredCases(response);
    } catch (e) {
      setCases([]);
      setFilteredCases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (firmId) fetchCases(firmId);
  }, [firmId, role]);

  useEffect(() => {
    let filtered = [...cases];
    if (searchText) {
      filtered = filtered.filter(
        (c) =>
          (c.title ?? "").toLowerCase().includes(searchText.toLowerCase()) ||
          (c.caseNumber ?? "")
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          (c.client?.fullName ?? "")
            .toLowerCase()
            .includes(searchText.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (c) => (c.status ?? "").toLowerCase() === statusFilter.toLowerCase()
      );
    }
    if (caseTypeFilter !== "all") {
      filtered = filtered.filter(
        (c) => (c.caseType ?? "").toLowerCase() === caseTypeFilter.toLowerCase()
      );
    }
    setFilteredCases(filtered);
    setCurrentPage(1);
  }, [cases, searchText, statusFilter, caseTypeFilter]);

  const openCases = useMemo(
    () => cases.filter((c) => (c.status ?? "").toLowerCase() === "open"),
    [cases]
  );
  const closedCases = useMemo(
    () => cases.filter((c) => (c.status ?? "").toLowerCase() === "closed"),
    [cases]
  );
  const pendingCases = useMemo(
    () => cases.filter((c) => (c.status ?? "").toLowerCase() === "on hold"),
    [cases]
  );

  const getCaseTypeIcon = (type: string) => {
    switch ((type ?? "").toLowerCase()) {
      case "civil":
        return <BankOutlined />;
      case "criminal":
        return <ExclamationCircleOutlined />;
      case "family":
        return <UserOutlined />;
      case "corporate":
        return <FolderOpenOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  const getCaseTypeColor = (type?: string) => {
    switch ((type ?? "").toLowerCase()) {
      case "civil":
        return "#2563eb";
      case "criminal":
        return "#dc2626";
      case "family":
        return "#059669";
      case "corporate":
        return "#7c3aed";
      default:
        return "#6b7280";
    }
  };

  const getStatusColor = (status?: string) => {
    switch ((status ?? "").toLowerCase()) {
      case "open":
        return "#059669";
      case "closed":
        return "#6b7280";
      case "pending":
        return "#f59e0b";
      case "on hold":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePickFiles = (caseRecord: Case) => {
    setSelectedCase(caseRecord);
    fileInputRef.current?.click();
  };

  const onFilesSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setPendingUploads(files);
  };

  const handleConfirmUpload = () => {
    setConfirmUploadModalOpen(true);
  };

  const executeUpload = async () => {
    if (!firmId || !selectedCase || pendingUploads.length === 0) return;
    try {
      setUploading(true);
      setConfirmUploadModalOpen(false);

      await uploadCaseDocuments(
        role || "Client",
        firmId,
        selectedCase.id,
        pendingUploads
      );

      message.success("Documents uploaded successfully");
      setPendingUploads([]);
      setSelectedCase(null);
    } catch (e) {
      message.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setPendingUploads([]);
    setSelectedCase(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setPendingUploads((prev) => prev.filter((_, i) => i !== index));
  };

  const getTotalFileSize = () => {
    const totalBytes = pendingUploads.reduce((sum, file) => sum + file.size, 0);
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
    return totalMB;
  };

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toUpperCase() || "";
  };

  const columns: ColumnsType<Case> = [
    {
      title: "Case Details",
      key: "caseDetails",
      width: 280,
      fixed: "left",
      render: (_: unknown, record: Case) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <BankTwoTone twoToneColor="#2563eb" style={{ fontSize: 22 }} />
          </div>
          <div className="flex-1 min-w-0">
            <Text
              className="block text-slate-900 dark:text-slate-200 font-semibold text-base"
              ellipsis={{ tooltip: record.title }}
            >
              {record.title}
            </Text>
            <Text className="block text-slate-500 dark:text-slate-400 font-mono text-sm">
              {record.caseNumber}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Client",
      key: "client",
      width: 220,
      render: (_: unknown, record: Case) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={48}
            src={
              record.client?.profileImage
                ? `${BASE_URL}${record.client.profileImage}`
                : undefined
            }
            style={{
              background: record.client?.profileImage
                ? "transparent"
                : "#f1f5f9",
              border: "2px solid #e5e7eb",
              color: record.client?.profileImage
                ? "transparent"
                : getCaseTypeColor(record.client.clientType),
            }}
          >
            {!record.client?.profileImage &&
              getCaseTypeIcon(record.client.clientType)}
          </Avatar>
          <div className="flex-1 min-w-0">
            <Text
              className="block text-slate-900 dark:text-slate-200 font-medium"
              ellipsis={{ tooltip: record.client?.fullName }}
            >
              {record.client?.fullName || "No client"}
            </Text>
            {record.client?.email && (
              <Text
                className="block text-slate-500 dark:text-slate-400 text-xs"
                ellipsis={{ tooltip: record.client.email }}
              >
                {record.client.email}
              </Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag
          style={{
            background: `${getStatusColor(status)}15`,
            color: getStatusColor(status),
            border: `1px solid ${getStatusColor(status)}30`,
            borderRadius: "8px",
            padding: "4px 12px",
            fontSize: "12px",
            fontWeight: "600",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: getStatusColor(status),
              display: "inline-block",
              marginRight: "6px",
            }}
          />
          {status}
        </Tag>
      ),
    },
    {
      title: "Case Type",
      dataIndex: "caseType",
      key: "caseType",
      width: 130,
      render: (caseType: string) => (
        <Tag
          icon={getCaseTypeIcon(caseType || "")}
          style={{
            background: `${getCaseTypeColor(caseType || "")}15`,
            color: getCaseTypeColor(caseType || ""),
            border: `1px solid ${getCaseTypeColor(caseType || "")}30`,
            borderRadius: "8px",
            padding: "4px 12px",
            fontSize: "12px",
            fontWeight: "600",
            textTransform: "uppercase",
          }}
        >
          {caseType}
        </Tag>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "openedAt",
      key: "openedAt",
      width: 120,
      render: (date: string) => (
        <Text className="block text-slate-700 dark:text-slate-300 text-sm font-medium">
          {formatDate(date)}
        </Text>
      ),
    },
    {
      title: "Assigned Lawyers",
      key: "lawyers",
      width: 200,
      render: (_: unknown, record: Case) => {
        const lawyers = record.lawyers || [];
        if (lawyers.length === 0) {
          return (
            <Tag className="px-3 py-1 rounded-full text-xs font-medium border-0 bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400">
              No Lawyers
            </Tag>
          );
        }
        const maxDisplay = 2;
        const displayLawyers = lawyers.slice(0, maxDisplay);
        const remainingCount = lawyers.length - maxDisplay;

        return (
          <div className="flex items-center gap-3">
            <div className="flex items-center -space-x-1">
              {displayLawyers.map((lawyer, index) => (
                <Tooltip
                  key={lawyer.id}
                  title={
                    <div>
                      <div className="font-medium text-sm">{lawyer.name}</div>
                      <div className="text-xs opacity-75">
                        {lawyer.email || "Lawyer"}
                      </div>
                    </div>
                  }
                >
                  <Avatar
                    size={32}
                    src={
                      lawyer.profileImage
                        ? `${BASE_URL}${lawyer.profileImage}`
                        : undefined
                    }
                    className="border-2 border-white dark:border-slate-700"
                    style={{ zIndex: displayLawyers.length - index }}
                  >
                    {!lawyer.profileImage &&
                      lawyer.name.charAt(0).toUpperCase()}
                  </Avatar>
                </Tooltip>
              ))}
              {remainingCount > 0 && (
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 border-2 border-white dark:border-slate-700 rounded-full text-xs font-medium flex items-center justify-center">
                  +{remainingCount}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      fixed: "right",
      render: (_: unknown, record: Case) => (
        <Tooltip title="Add Documents">
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handlePickFiles(record)}
            className="hover:!bg-green-50 dark:text-gray-200 hover:!text-green-600 dark:hover:!bg-green-900/30 dark:hover:!text-green-400"
            style={{ borderRadius: "6px" }}
          />
        </Tooltip>
      ),
    },
  ];

  const uniqueCaseTypes = [...new Set(cases.map((c) => c.caseType))];

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DashboardLayout>
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <Spin size="large" />
          </div>
        ) : (
          <div className="min-h-screen transition-colors duration-300 [&_.ant-typography]:dark:!text-white [&_.ant-card-head-title]:dark:!text-white">
            {/* Header */}
            <Card
              className="bg-[#1B3C53] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
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
                      <UploadOutlined
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
                        Upload Case Documents
                      </Title>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "18px",
                          fontWeight: "400",
                        }}
                      >
                        Select a case to add documents
                      </Text>
                    </div>
                  </Space>
                </Col>
                <Col>
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.back()}
                    size="large"
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
                    Back
                  </Button>
                </Col>
              </Row>
            </Card>

            {/* Statistics Cards */}
            <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
              <Col xs={24} sm={6}>
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
                    value={cases.length}
                    valueStyle={{
                      fontSize: "32px",
                      fontWeight: "700",
                      lineHeight: "1",
                      color: "inherit",
                    }}
                    prefix={
                      <FileTextOutlined className="text-blue-600 dark:text-blue-400 text-3xl mr-1" />
                    }
                    className="text-blue-600 dark:text-blue-600 [&_.ant-statistic-content-value]:dark:!text-blue-600"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
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
                    value={openCases.length}
                    valueStyle={{
                      fontSize: "32px",
                      fontWeight: "700",
                      lineHeight: "1",
                      color: "inherit",
                    }}
                    prefix={
                      <FolderOpenOutlined className="text-green-600 dark:text-green-400 text-3xl mr-1" />
                    }
                    className="text-green-600 dark:text-green-500 [&_.ant-statistic-content-value]:dark:!text-green-500"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
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
                        Closed Cases
                      </span>
                    }
                    value={closedCases.length}
                    valueStyle={{
                      fontSize: "32px",
                      fontWeight: "700",
                      lineHeight: "1",
                      color: "inherit",
                    }}
                    prefix={
                      <CheckCircleOutlined className="text-gray-600 dark:text-gray-400 text-3xl mr-1" />
                    }
                    className="text-gray-600 dark:text-gray-600 [&_.ant-statistic-content-value]:dark:!text-gray-600"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
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
                        Pending Cases
                      </span>
                    }
                    value={pendingCases.length}
                    valueStyle={{
                      fontSize: "32px",
                      fontWeight: "700",
                      lineHeight: "1",
                      color: "inherit",
                    }}
                    prefix={
                      <ClockCircleOutlined className="text-amber-600 dark:text-amber-400 text-3xl mr-1" />
                    }
                    className="text-amber-600 dark:text-amber-600 [&_.ant-statistic-content-value]:dark:!text-amber-600"
                  />
                </Card>
              </Col>
            </Row>

            {/* Search & Filters */}
            <Card
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm mb-8"
              bodyStyle={{ padding: "24px" }}
            >
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={11}>
                  <Input
                    placeholder="Search cases by title, number, client name..."
                    prefix={<SearchOutlined className="text-slate-400" />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                    size="large"
                  />
                </Col>
                <Col xs={12} sm={6} md={5}>
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    size="large"
                    className="w-full [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:dark:!bg-slate-900 [&_.ant-select-selector]:dark:!border-slate-600 [&_.ant-select-selector]:dark:!text-white [&_.ant-select-selection-item]:dark:!text-white [&_.ant-select-arrow]:dark:!text-white"
                  >
                    <Option value="all">All Status</Option>
                    <Option value="open">Open</Option>
                    <Option value="closed">Closed</Option>
                    <Option value="on hold">On Hold</Option>
                  </Select>
                </Col>
                <Col xs={12} sm={6} md={5}>
                  <Select
                    value={caseTypeFilter}
                    onChange={setCaseTypeFilter}
                    size="large"
                    className="w-full [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:dark:!bg-slate-900 [&_.ant-select-selector]:dark:!border-slate-600 [&_.ant-select-selector]:dark:!text-white [&_.ant-select-selection-item]:dark:!text-white [&_.ant-select-arrow]:dark:!text-white"
                  >
                    <Option value="all">All Types</Option>
                    {uniqueCaseTypes.map((type) => (
                      <Option key={type} value={type || ""}>
                        {type}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={3}>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setSearchText("");
                      setStatusFilter("all");
                      setCaseTypeFilter("all");
                      if (firmId) fetchCases(firmId);
                    }}
                    className="rounded-xl border border-slate-300 dark:border-slate-600 dark:text-white !bg-transparent hover:!bg-transparent"
                  >
                    Reset
                  </Button>
                </Col>
              </Row>
            </Card>

            {/* Cases Table */}
            <Card
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm mb-8"
              bodyStyle={{ padding: 0 }}
            >
              <Table
                columns={columns}
                dataSource={filteredCases}
                rowKey="id"
                loading={false}
                pagination={{
                  current: currentPage,
                  total: filteredCases.length,
                  pageSize: pageSize,
                  onChange: (page) => setCurrentPage(page),
                  onShowSizeChange: (current, size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  },
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} cases`,
                }}
                scroll={{ x: 1200 }}
                className="dark:[&_.ant-table]:!bg-slate-800 
                           dark:[&_.ant-table-thead>tr>th]:!bg-slate-900 
                           dark:[&_.ant-table-thead>tr>th]:!text-slate-200 
                           dark:[&_.ant-table-tbody>tr>td]:!bg-slate-800 
                           dark:[&_.ant-table-tbody>tr>td]:!text-slate-300
                           dark:[&_.ant-table-tbody>tr:hover>td]:!bg-slate-700"
              />
            </Card>

            {/* Upload Summary Section */}
            {pendingUploads.length > 0 && selectedCase && (
              <div className="!mt-6 !mb-8 bg-gradient-to-br from-blue-50 via-blue-50/80 to-indigo-50/60 dark:from-slate-800/60 dark:via-slate-700/40 dark:to-slate-800/80 border border-blue-200/80 dark:border-slate-600/70 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <UploadOutlined className="text-blue-600 dark:text-blue-400 text-lg" />
                  </div>
                  <div>
                    <Title
                      level={4}
                      className="text-slate-800 dark:text-slate-100 !mb-0"
                      style={{
                        fontSize: "18px",
                        fontWeight: 600,
                        letterSpacing: "-0.025em",
                      }}
                    >
                      Document Upload Summary
                    </Title>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-0">
                      Review documents before uploading to{" "}
                      <strong>{selectedCase.title}</strong>
                    </p>
                  </div>
                </div>

                {/* Upload Statistics */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between group hover:bg-white/60 dark:hover:bg-slate-600/20 rounded-lg p-2 transition-colors duration-150">
                    <Text className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                      Total Documents:
                    </Text>
                    <span className="text-slate-800 dark:text-white font-semibold text-sm bg-slate-100 dark:bg-slate-600/30 px-2 py-1 rounded-md">
                      {pendingUploads.length} file
                      {pendingUploads.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex items-center justify-between group hover:bg-white/60 dark:hover:bg-slate-600/20 rounded-lg p-2 transition-colors duration-150">
                    <Text className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                      Total Size:
                    </Text>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">
                      {getTotalFileSize()} MB
                    </span>
                  </div>

                  <div className="flex items-center justify-between group hover:bg-white/60 dark:hover:bg-slate-600/20 rounded-lg p-2 transition-colors duration-150">
                    <Text className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                      Case:
                    </Text>
                    <span className="text-slate-800 dark:text-white font-semibold text-sm bg-slate-100 dark:bg-slate-600/30 px-2 py-1 rounded-md">
                      {selectedCase.caseNumber}
                    </span>
                  </div>
                </div>

                {/* Documents List */}
                <div className="mt-4 pt-4 border-t border-blue-200/50 dark:border-slate-600/50">
                  <Text className="text-slate-700 dark:text-slate-200 font-medium text-sm block mb-3">
                    Documents to Upload:
                  </Text>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {pendingUploads.map((file, idx) => (
                      <div
                        key={`${file.name}-${idx}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <FileTextOutlined className="text-blue-600 dark:text-blue-400 text-sm" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Text className="text-slate-900 dark:text-white font-medium text-sm block truncate">
                              {file.name}
                            </Text>
                            <div className="flex items-center gap-2 mt-1">
                              <Tag className="!m-0 text-xs" color="blue">
                                {getFileExtension(file.name)}
                              </Tag>
                              <Text className="text-slate-500 dark:text-slate-400 text-xs">
                                {(file.size / 1024).toFixed(2)} KB
                              </Text>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeFile(idx)}
                          className="ml-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 pt-4 border-t border-blue-200/50 dark:border-slate-600/50 flex justify-end gap-3">
                  <Button
                    size="large"
                    onClick={handleCancelUpload}
                    icon={<CloseOutlined />}
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #d1d5db",
                      fontWeight: "600",
                      padding: "12px 24px",
                      height: "44px",
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    icon={<CheckOutlined />}
                    onClick={handleConfirmUpload}
                    loading={uploading}
                    style={{
                      background: "#1e40af",
                      borderRadius: "12px",
                      fontWeight: "600",
                      padding: "12px 24px",
                      height: "44px",
                      boxShadow: "0 4px 12px rgba(30, 64, 175, 0.3)",
                    }}
                  >
                    Confirm Upload
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          hidden
          onChange={onFilesSelected}
        />

        {/* Confirmation Modal for Upload */}
        <ConfirmationModal
          visible={confirmUploadModalOpen}
          entityName="Documents"
          action="upload"
          onConfirm={executeUpload}
          onCancel={() => setConfirmUploadModalOpen(false)}
          title="Upload Documents"
          description={`You are about to upload ${
            pendingUploads.length
          } document${
            pendingUploads.length !== 1 ? "s" : ""
          } (${getTotalFileSize()} MB) to case "${
            selectedCase?.title
          }". Do you want to proceed?`}
          confirmText="Upload"
          cancelText="Cancel"
        />
      </DashboardLayout>
    </ThemeProvider>
  );
}
