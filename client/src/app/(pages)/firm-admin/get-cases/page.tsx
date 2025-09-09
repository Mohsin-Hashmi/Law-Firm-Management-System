"use client";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useAppSelector } from "@/app/store/hooks";
import { RootState } from "@/app/store/store";
import {
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  EyeOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  BankTwoTone,
  UserOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
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
  Statistic,
  Tag,
  Tooltip,
  Typography,
  Spin,
  Table,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { ThemeProvider } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAllCasesOfFirm } from "@/app/service/adminAPI";
import { useAppDispatch } from "@/app/store/hooks";
import { setCases } from "@/app/store/caseSlice";
import { Case } from "@/app/types/case";
import { toast } from "react-hot-toast";
import { deleteCaseByFirm } from "@/app/service/adminAPI";
import { updateCaseStatus } from "@/app/service/adminAPI";
import ConfirmationModal from "@/app/components/ConfirmationModal";

const { Title, Text } = Typography;
const { Option } = Select;

export default function GetCases() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.user.user);
  const firmId = user?.firmId;
  const [cases, setCasesData] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deletingCaseId, setDeletingCaseId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [caseTypeFilter, setCaseTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>();

  useEffect(() => {
    filterCases();
  }, [cases, searchText, statusFilter, caseTypeFilter]);

  /**Get All Cases API */
  const fetchCases = async (firmId: number) => {
    try {
      setLoading(true);
      const response = await getAllCasesOfFirm(firmId);
      setCasesData(response);
      dispatch(setCases(response));
      toast.success("Fetch cases successfully");
      console.log("Successfully fetched cases data:", response);
    } catch (error) {
      console.error("Error fetching cases:", error);
      toast.error("Failed to fetch cases data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (firmId) {
      setCasesData([]);
      fetchCases(firmId);
    }
  }, [firmId]);

  const filterCases = () => {
    let filtered = cases;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (case_) =>
          case_.title.toLowerCase().includes(searchText.toLowerCase()) ||
          case_.caseNumber.toLowerCase().includes(searchText.toLowerCase()) ||
          case_.client?.fullName
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          case_.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (case_) => case_.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by case type
    if (caseTypeFilter !== "all") {
      filtered = filtered.filter(
        (case_) =>
          case_.caseType?.toLowerCase() === caseTypeFilter.toLowerCase()
      );
    }

    setFilteredCases(filtered);
    setCurrentPage(1);
  };

  const handleOpenDeleteModal = (selected: Case) => {
    setSelectedCase(selected);
    setModalVisible(true);
  };

  /**Handle delete function */
  const handleDeleteCase = async (firmId: number) => {
    if (!selectedCase) return;
    try {
      setDeleting(true);
      setDeletingCaseId(selectedCase.id);
      await deleteCaseByFirm(firmId, selectedCase.id);
      setCasesData((prevCases) =>
        prevCases.filter((case_) => case_.id !== selectedCase.id)
      );
      toast.success("Case deleted successfully");
      message.success("Case deleted successfully");
    } catch (error) {
      console.error("Error deleting case:", error);
      toast.error("Failed to delete case");
      message.error("Failed to delete case");
    } finally {
      setDeleting(false);
      setDeletingCaseId(null);
      setModalVisible(false);
    }
  };

  /**Handle assign lawyer */
  const handleAssignLawyer = (caseId: number) => {
    router.push(`/firm-admin/assign-lawyer/${caseId}`);
  };

  const getCaseTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
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

  const getCaseTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  const openCases = cases.filter(
    (case_) => case_.status.toLowerCase() === "open"
  );
  const closedCases = cases.filter(
    (case_) => case_.status.toLowerCase() === "closed"
  );
  const pendingCases = cases.filter(
    (case_) => case_.status.toLowerCase() === "pending"
  );

  // Get unique case types for filter
  const uniqueCaseTypes = [...new Set(cases.map((case_) => case_.caseType))];

  // Table columns definition
  const columns: ColumnsType<Case> = [
    {
      title: "Case Details",
      key: "caseDetails",
      width: 280,
      fixed: "left",
      render: (_: unknown, record: Case) => (
        <div className="flex items-center gap-3">
          <div
            style={{
              width: "48px",
              height: "48px",
              backgroundColor: "#1e293b",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BankTwoTone twoToneColor="#1890ff" style={{ fontSize: "20px" }} />
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
            {record.description && (
              <Text
                className="block text-slate-600 dark:text-slate-400 text-xs mt-1 italic"
                ellipsis={{ tooltip: record.description }}
              >
                {`"${record.description}"`}
              </Text>
            )}
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
            size={40}
            src={
              record.client?.profileImage
                ? record.client.profileImage.startsWith("http")
                  ? record.client.profileImage
                  : `http://localhost:5000${record.client.profileImage}`
                : undefined
            }
            style={{
              backgroundColor: "#f1f5f9",
              color: "#059669",
              fontSize: "16px",
              fontWeight: "600",
              border: "1px solid #e5e7eb",
            }}
          >
            {!record.client?.profileImage &&
              (record.client?.fullName?.charAt(0) || "N")}
          </Avatar>
          <div className="flex-1 min-w-0">
            <Text
              className="block text-slate-900 dark:text-slate-200 font-medium"
              ellipsis={{ tooltip: record.client?.fullName }}
            >
              {record.client?.fullName || "No client assigned"}
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
        <div>
          <Text className="block text-slate-700 dark:text-slate-300 text-sm font-medium">
            {formatDate(date)}
          </Text>
        </div>
      ),
      sorter: (a: Case, b: Case) =>
        new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime(),
    },
    {
      title: "Assigned Lawyers",
      key: "lawyers",
      width: 200,
      render: (_: unknown, record: Case) => (
        <div>
          {record.lawyers && record.lawyers.length > 0 ? (
            <div className="flex items-center gap-2">
              <Avatar.Group maxCount={2} size={28}>
                {record.lawyers.map((lawyer, index) => (
                  <Tooltip key={index} title={lawyer.name}>
                    <Avatar
                      size={28}
                      style={{
                        backgroundColor: "#f1f5f9",
                        color: "#059669",
                        fontSize: "12px",
                        fontWeight: "600",
                        border: "1px solid white",
                      }}
                    >
                      {lawyer.name.charAt(0)}
                    </Avatar>
                  </Tooltip>
                ))}
              </Avatar.Group>
              <div>
                <Text className="block text-slate-800 dark:text-slate-200 text-sm font-medium">
                  {record.lawyers.length} Lawyer
                  {record.lawyers.length > 1 ? "s" : ""}
                </Text>
                <Text
                  className="block text-slate-500 dark:text-slate-400 text-xs"
                  ellipsis={{
                    tooltip: record.lawyers
                      .map((lawyer) => lawyer.name)
                      .join(", "),
                  }}
                >
                  {record.lawyers.map((lawyer) => lawyer.name).join(", ")}
                </Text>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-[28px] h-[28px] bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <UserOutlined className="text-slate-400 text-xs" />
              </div>
              <Text className="text-slate-500 dark:text-slate-400 text-xs">
                No lawyers assigned
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      fixed: "right",
      render: (_: unknown, record: Case) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() =>
                router.push(`/firm-admin/get-case-detail/${record.id}`)
              }
              className="hover:!bg-blue-50 hover:!text-blue-600 dark:hover:!bg-blue-900/30 dark:hover:!text-blue-400"
              style={{ borderRadius: "6px" }}
            />
          </Tooltip>
          <Tooltip title="Edit Case">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() =>
                router.push(`/firm-admin/edit-case/${record.id}`)
              }
              className="hover:!bg-amber-50 hover:!text-amber-600 dark:hover:!bg-amber-900/30 dark:hover:!text-amber-400"
              style={{ borderRadius: "6px" }}
            />
          </Tooltip>
          <Tooltip title="Assign Lawyer">
            <Button
              type="text"
              size="small"
              icon={<UserAddOutlined />}
              onClick={() => handleAssignLawyer(record.id)}
              className="hover:!bg-green-50 hover:!text-green-600 dark:hover:!bg-green-900/30 dark:hover:!text-green-400"
              style={{ borderRadius: "6px" }}
            />
          </Tooltip>
          <Tooltip title="Delete Case">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleOpenDeleteModal(record)}
              loading={deleting && deletingCaseId === record.id}
              danger
              className="hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-900/30 dark:hover:!text-red-400"
              style={{ borderRadius: "6px", color: "#dc2626" }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DashboardLayout>
        <div className="min-h-screen p-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 [&_.ant-typography]:dark:!text-white [&_.ant-card-head-title]:dark:!text-white">
          <div className="max-w-[1400px] mx-auto">
            {/* Header Section */}
            <Card
              className="bg-[#433878] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
              bodyStyle={{ padding: "20px" }}
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
                        Case Management
                      </Title>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "18px",
                          fontWeight: "400",
                        }}
                      >
                        Manage all legal cases and track their progress
                      </Text>
                    </div>
                  </Space>
                </Col>
                <Col className="pt-7">
                  <Space size="middle">
                    <Button
                      type="primary"
                      size="large"
                      icon={<PlusOutlined />}
                      onClick={() => router.push("/firm-admin/add-case")}
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
                      Add New Case
                    </Button>
                    <Button
                      size="large"
                      icon={<ExportOutlined />}
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
                      Export Data
                    </Button>
                  </Space>
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

            {/* Search and Filter Section */}
            <Card
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-8"
              bodyStyle={{ padding: "24px" }}
            >
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} md={8}>
                  <Input
                    placeholder="Search cases by title, number, client name..."
                    prefix={<SearchOutlined className="text-slate-400" />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                    size="large"
                  />
                </Col>
                <Col xs={12} sm={6} md={4}>
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
    [&_.ant-select-arrow]:dark:!text-white
  "
                  >
                    <Option value="all">All Status</Option>
                    <Option value="open">Open</Option>
                    <Option value="closed">Closed</Option>
                    <Option value="pending">Pending</Option>
                    <Option value="on hold">On Hold</Option>
                  </Select>
                </Col>
                <Col xs={12} sm={6} md={4}>
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
    [&_.ant-select-arrow]:dark:!text-white
  "
                  >
                    <Option value="all">All Types</Option>
                    {uniqueCaseTypes.map((type) => (
                      <Option key={type} value={type}>
                        {type}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} md={8} className="flex justify-end">
                  <Space>
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
                      Reset Filters
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Cases Table */}
            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <Spin size="large" />
              </div>
            ) : (
              <Card
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm transition-colors duration-300"
                bodyStyle={{ padding: 0 }}
              >
                <Table
                  columns={columns}
                  dataSource={filteredCases}
                  rowKey="id"
                  loading={loading}
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
                  scroll={{ x: 1200 }}
                  locale={{
                    emptyText: (
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
                          No cases found
                        </Title>
                        <Text className="dark:text-slate-400">
                          No cases match your current filters or create a new
                          case.
                        </Text>
                        <br />
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() =>
                            router.push("/firm-admin/add-case")
                          }
                          style={{ marginTop: "16px" }}
                        >
                          Add First Case
                        </Button>
                      </div>
                    ),
                  }}
                />
              </Card>
            )}
            <ConfirmationModal
              visible={modalVisible}
              entityName={selectedCase?.title || "Case"}
              action="delete"
              onConfirm={() => handleDeleteCase(firmId!)}
              onCancel={() => {
                setModalVisible(false);
                setSelectedCase(null);
              }}
            />
          </div>
        </div>
      </DashboardLayout>
    </ThemeProvider>
  );
}
