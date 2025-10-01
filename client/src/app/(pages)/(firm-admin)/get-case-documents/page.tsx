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
  Modal,
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
  EyeOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  DeleteOutlined,
  UserOutlined,
  KeyOutlined,
  CloseOutlined,
  BankTwoTone,
} from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { Case } from "@/app/types/case";
import BASE_URL from "@/app/utils/constant";
import {
  getAllCasesOfFirm,
  getAllCasesOfLawyer,
  getCaseDocuments,
  deleteCaseDocument,
  uploadCaseDocuments,
} from "@/app/service/adminAPI";
import { usePermission } from "@/app/hooks/usePermission";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/app/components/ConfirmationModal";

const { Title, Text } = Typography;
const { Option } = Select;

export default function GetCaseDocumentsPage() {
  const { hasPermission } = usePermission();
  const router = useRouter();
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

  const [docModalOpen, setDocModalOpen] = useState<boolean>(false);
  const [docModalLoading, setDocModalLoading] = useState<boolean>(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [documents, setDocuments] = useState<
    Array<{
      id: number;
      fileName: string;
      fileType: string;
      filePath: string;
      uploadedById: number;
      uploadedByType: string;
      createdAt: string;
    }>
  >([]);

  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    docId: number | null;
  }>({ open: false, docId: null });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingUploads, setPendingUploads] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);

  const openDocModal = async (caseRecord: Case) => {
    if (!firmId) return;
    setSelectedCase(caseRecord);
    setDocModalOpen(true);
    setDocModalLoading(true);
    try {
      const docs = await getCaseDocuments(role!, firmId, caseRecord.id);

      setDocuments(docs);
    } catch (e) {
      message.error("Failed to load documents");
    } finally {
      setDocModalLoading(false);
    }
  };

  const refreshDocuments = async () => {
    if (!selectedCase || !firmId) return;
    const docs = await getCaseDocuments(role!, firmId, selectedCase.id);

    setDocuments(docs);
  };

  const handleDeleteDoc = async () => {
    if (!firmId || !selectedCase || !confirmDelete.docId) return;
    try {
      await deleteCaseDocument(firmId, selectedCase.id, confirmDelete.docId);
      message.success("Document deleted successfully");
      setConfirmDelete({ open: false, docId: null });
      await refreshDocuments();
    } catch (e) {
      message.error("Failed to delete document");
    }
  };

  const navigateToUploadCaseDocument = () => {
    router.push("/upload-case-documents");
  };

  const handlePickFiles = (caseRecord: Case) => {
    setSelectedCase(caseRecord);
    fileInputRef.current?.click();
  };

  const onFilesSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setPendingUploads(files);
  };

  const executeUpload = async () => {
    if (!firmId || !selectedCase || pendingUploads.length === 0) return;
    try {
      setUploading(true);
      await uploadCaseDocuments(
        role || "Client",
        firmId,
        selectedCase.id,
        pendingUploads
      );
      message.success("Documents uploaded");
      setPendingUploads([]);
      await refreshDocuments();
      setDocModalOpen(true);
    } catch (e) {
      message.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const fetchCases = async (firmId: number) => {
    try {
      setLoading(true);
      let response: Case[] = [];
      if (role === "Firm Admin") {
        response = await getAllCasesOfFirm(firmId);
      } else if (role === "Lawyer") {
        response = await getAllCasesOfLawyer();
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
        <Tooltip title="View Documents">
          <Button
            type="text"
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => openDocModal(record)}
            className="hover:!bg-blue-50 dark:text-gray-200 hover:!text-blue-600 dark:hover:!bg-blue-900/30 dark:hover:!text-blue-400"
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
                      <FileTextOutlined
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
                        Case Documents
                      </Title>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "18px",
                          fontWeight: "400",
                        }}
                      >
                        View and manage documents across your cases
                      </Text>
                    </div>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Stats */}
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
                    className="w-full 
    [&_.ant-select-selector]:!rounded-xl 
    [&_.ant-select-selector]:dark:!bg-slate-900 
    [&_.ant-select-selector]:dark:!border-slate-600 
    [&_.ant-select-selector]:dark:!text-white
    [&_.ant-select-selection-item]:dark:!text-white
    [&_.ant-select-selection-placeholder]:dark:!text-gray-400
    [&_.ant-select-arrow]:dark:!text-white"
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
                    className="w-full 
    [&_.ant-select-selector]:!rounded-xl 
    [&_.ant-select-selector]:dark:!bg-slate-900 
    [&_.ant-select-selector]:dark:!border-slate-600 
    [&_.ant-select-selector]:dark:!text-white
    [&_.ant-select-selection-item]:dark:!text-white
    [&_.ant-select-selection-placeholder]:dark:!text-gray-400
    [&_.ant-select-arrow]:dark:!text-white"
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
                    className="rounded-xl border border-slate-300 dark:border-slate-600 dark:text-white 
             !bg-transparent hover:!bg-transparent active:!bg-transparent focus:!bg-transparent"
                  >
                    Reset
                  </Button>
                </Col>
              </Row>
            </Card>

            {/* Cases Table */}
            <Card
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm"
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

        {/* Confirmation Modal for Delete */}
        <ConfirmationModal
          visible={confirmDelete.open}
          entityName="Document"
          action="delete"
          onConfirm={handleDeleteDoc}
          onCancel={() => setConfirmDelete({ open: false, docId: null })}
          title="Delete Document"
          description="Are you sure you want to delete this document? This action cannot be undone and the document will be permanently removed from the case."
          confirmText="Delete"
          cancelText="Cancel"
        />

        {/* Documents Modal */}
        <Modal
          title={null}
          open={docModalOpen}
          onCancel={() => setDocModalOpen(false)}
          footer={null}
          width={700}
          centered
          closeIcon={
            <CloseOutlined className="text-slate-400 hover:text-slate-600" />
          }
        >
          <div>
            {/* Header */}
            <div className="mb-5">
              <Space size="small" className="mb-1">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <FileTextOutlined className="text-blue-600 dark:text-blue-400 text-sm" />
                </div>
                <div>
                  <Title
                    level={5}
                    className="!text-slate-900 dark:!text-white !mb-0 !text-lg"
                  >
                    Documents • {selectedCase?.title}
                  </Title>
                  <Text className="text-slate-500 dark:text-slate-300 text-xs">
                    {selectedCase?.caseNumber}
                  </Text>
                </div>
              </Space>
            </div>

            {docModalLoading ? (
              <div className="text-center">
                <Spin size="large" />
                <div className="mt-3">
                  <Text className="text-slate-600 dark:text-slate-400">
                    Loading documents...
                  </Text>
                </div>
              </div>
            ) : documents.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-slate-100 dark:bg-slate-700">
                  <FileTextOutlined className="text-2xl text-slate-400" />
                </div>
                <Title
                  level={5}
                  className="!text-slate-900 dark:!text-white !mb-2"
                >
                  No Documents Found
                </Title>
                <Text className="text-slate-500 dark:text-slate-400 text-sm">
                  This case currently has no documents attached.
                </Text>
                {hasPermission("upload_case_document") && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setDocModalOpen(false);
                      if (selectedCase) handlePickFiles(selectedCase);
                    }}
                    className="mt-4"
                  >
                    Upload Documents
                  </Button>
                )}
              </div>
            ) : (
              <div>
                <div className="mb-4 p-3 rounded-lg border bg-blue-50 dark:bg-slate-700 border-blue-200 dark:border-slate-600">
                  <Text className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                    <CheckCircleOutlined className="mr-2" />
                    {documents.length} document
                    {documents.length !== 1 ? "s" : ""} found
                  </Text>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {documents.map((doc) => (
                    <Card
                      key={doc.id}
                      className="border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:shadow-sm transition-shadow"
                      bodyStyle={{ padding: "12px" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <FileTextOutlined className="text-blue-600 dark:text-blue-400 text-sm" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Text className="text-slate-900 dark:text-white font-medium text-sm block truncate">
                              {doc.fileName}
                            </Text>
                            <Text className="text-slate-500 dark:text-slate-400 text-xs">
                              {new Date(doc.createdAt).toLocaleString()}
                            </Text>
                          </div>
                        </div>
                        <Space>
                          <Tooltip title="View Document">
                            <Button
                              type="text"
                              icon={<EyeOutlined />}
                              onClick={() =>
                                window.open(
                                  `${BASE_URL}/${doc.filePath}`.replace(
                                    /\\/g,
                                    "/"
                                  ),
                                  "_blank"
                                )
                              }
                              className="hover:!bg-blue-50 hover:!text-blue-600"
                            />
                          </Tooltip>
                          {role === "Firm Admin" &&
                            hasPermission("delete_case_document") && (
                              <Tooltip title="Delete Document">
                                <Button
                                  type="text"
                                  icon={<DeleteOutlined />}
                                  danger
                                  onClick={() =>
                                    setConfirmDelete({
                                      open: true,
                                      docId: doc.id,
                                    })
                                  }
                                  className="hover:!bg-red-50 hover:!text-red-600"
                                />
                              </Tooltip>
                            )}
                        </Space>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center mt-5 pt-6 border-t border-slate-200 dark:border-slate-600">
              <div>
                {documents.length > 0 && (
                  <Text className="text-slate-500 dark:text-slate-400 text-xs">
                    {documents.length} document
                    {documents.length !== 1 ? "s" : ""} found
                  </Text>
                )}
              </div>
              <div className="flex gap-2">
                {hasPermission("upload_case_document") &&
                  documents.length > 0 && (
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={navigateToUploadCaseDocument}
                      className="h-9 px-4 rounded-lg bg-green-600 hover:bg-green-700 dark:text-white"
                    >
                      Add More
                    </Button>
                  )}
                <Button
                  onClick={() => setDocModalOpen(false)}
                  className="h-9 px-4 rounded-lg"
                  size="small"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </DashboardLayout>
    </ThemeProvider>
  );
}
