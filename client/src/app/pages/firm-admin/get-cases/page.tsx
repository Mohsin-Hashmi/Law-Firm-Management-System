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
  StopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { ThemeProvider } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAllCasesOfFirm } from "@/app/service/adminAPI";
import { useAppDispatch } from "@/app/store/hooks";
import { setCases } from "@/app/store/caseSlice";
import { Case } from "@/app/types/case";
import { toast } from "react-hot-toast";
import { deleteCaseByFrim } from "@/app/service/adminAPI";

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

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
  };

  /**Handle delete function */
  const handleDeleteCase = async (firmId: number, id: number) => {
    try {
      setDeleting(true);
      setDeletingCaseId(id);
      await deleteCaseByFrim(firmId, id);
      setCasesData((prevCases) =>
        prevCases.filter((case_) => case_.id !== id)
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
    }
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

  const getStatusBadgeStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "success";
      case "closed":
        return "default";
      case "pending":
        return "warning";
      case "on hold":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns = [
    {
      title: "Case Details",
      key: "caseDetails",
      render: (record: Case) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              background: `${getCaseTypeColor(record.caseType || "")}20`,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${getCaseTypeColor(record.caseType || "")}40`,
              flexShrink: 0,
            }}
          >
            {getCaseTypeIcon(record.caseType || "")}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <Text
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#111827",
                display: "block",
                marginBottom: "2px",
              }}
            >
              {record.title}
            </Text>
            <Space size="small">
              <Text
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  fontWeight: "500",
                }}
              >
                {record.caseNumber}
              </Text>
            </Space>
            {record.description && (
              <div>
                <Text
                  style={{ fontSize: "12px", color: "#9ca3af" }}
                  ellipsis={{ tooltip: record.description }}
                >
                  {record.description.length > 50
                    ? `${record.description.substring(0, 50)}...`
                    : record.description}
                </Text>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Client",
      key: "client",
      render: (record: Case) => (
        <Space direction="vertical" size="small">
          <Space size="small">
            <UserOutlined style={{ color: "#9ca3af", fontSize: "12px" }} />
            <Text
              style={{ fontSize: "13px", color: "#374151", fontWeight: "500" }}
            >
              {record.client?.fullName || "N/A"}
            </Text>
          </Space>
          {record.client?.email && (
            <Text
              style={{ fontSize: "12px", color: "#64748b" }}
              ellipsis={{ tooltip: record.client.email }}
            >
              {record.client.email}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "caseType",
      key: "caseType",
      render: (type: string) => (
        <Tag
          color={`${getCaseTypeColor(type)}20`}
          style={{
            color: getCaseTypeColor(type),
            border: `1px solid ${getCaseTypeColor(type)}40`,
            borderRadius: "8px",
            padding: "4px 12px",
            fontSize: "12px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            width: "fit-content",
          }}
        >
          {getCaseTypeIcon(type)}
          {type}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Badge
          status={getStatusBadgeStatus(status)}
          text={
            <span
              style={{
                fontSize: "13px",
                fontWeight: "500",
                color: getStatusColor(status),
              }}
            >
              {status}
            </span>
          }
        />
      ),
    },
    {
      title: "Dates",
      key: "dates",
      render: (record: Case) => (
        <Space direction="vertical" size="small">
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <ClockCircleOutlined
              style={{ color: "#9ca3af", fontSize: "12px" }}
            />
            <Text style={{ fontSize: "12px", color: "#64748b" }}>
              Opened: {formatDate(record.openedAt)}
            </Text>
          </div>
          {record.closedAt && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <CheckCircleOutlined
                style={{ color: "#9ca3af", fontSize: "12px" }}
              />
              <Text style={{ fontSize: "12px", color: "#64748b" }}>
                Closed: {formatDate(record.closedAt)}
              </Text>
            </div>
          )}
        </Space>
      ),
    },
    {
      title: "Assigned Lawyers",
      key: "lawyers",
      render: (record: Case) => (
        <Space direction="vertical" size="small">
          {record.lawyers && record.lawyers.length > 0 ? (
            record.lawyers.map((lawyer, index) => (
              <div
                key={index}
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Avatar
                  size={20}
                  style={{ backgroundColor: "#f1f5f9", color: "#059669" }}
                >
                  {lawyer.name.charAt(0)}
                </Avatar>
                <Text style={{ fontSize: "12px", color: "#374151" }}>
                  {lawyer.name}
                </Text>
              </div>
            ))
          ) : (
            <Text
              style={{
                fontSize: "12px",
                color: "#9ca3af",
                fontStyle: "italic",
              }}
            >
              No lawyers assigned
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Case) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() =>
                router.push(
                  `/pages/firm-admin/get-case-detail/${record.id}`
                )
              }
              style={{ borderRadius: "6px" }}
            />
          </Tooltip>

          <Tooltip title="Edit Case">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() =>
                router.push(`/pages/firm-admin/edit-case/${record.id}`)
              }
              style={{ borderRadius: "6px" }}
            />
          </Tooltip>
          <Tooltip title="Delete Case">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleDeleteCase(record.firmId, record.id);
              }}
              loading={deleting && deletingCaseId === record.id}
              style={{
                borderRadius: "6px",
                color: "#dc2626",
              }}
              danger
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

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

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DashboardLayout>
        <div className="min-h-screen p-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 [&_.ant-typography]:dark:!text-white [&_.ant-card-head-title]:dark:!text-white">
          <div className="max-w-[1400px] mx-auto">
            {/* Header Section */}
            <Card
              className="bg-[#433878] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
              bodyStyle={{ padding: "32px" }}
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
                      onClick={() => router.push("/pages/firm-admin/add-case")}
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

            {/* Filters and Search */}
            <Card
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm transition-colors duration-300 mb-6"
              bodyStyle={{ padding: "24px" }}
            >
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8}>
                  <Input
                    placeholder="Search cases by title, number, client, or description"
                    prefix={
                      <SearchOutlined className="text-slate-400 dark:text-slate-500" />
                    }
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                    size="large"
                  />
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Select
                    placeholder="Filter by Status"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    size="large"
                    className="w-full [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:dark:!bg-slate-900 [&_.ant-select-selector]:dark:!border-slate-600 [&_.ant-select-selector]:dark:!text-white"
                  >
                    <Option value="all">All Status</Option>
                    <Option value="Open">Open</Option>
                    <Option value="Closed">Closed</Option>
                    <Option value="Pending">Pending</Option>
                    <Option value="On Hold">On Hold</Option>
                  </Select>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Select
                    placeholder="Filter by Type"
                    value={caseTypeFilter}
                    onChange={setCaseTypeFilter}
                    size="large"
                    className="w-full [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:dark:!bg-slate-900 [&_.ant-select-selector]:dark:!border-slate-600 [&_.ant-select-selector]:dark:!text-white"
                  >
                    <Option value="all">All Types</Option>
                    {uniqueCaseTypes.map((type) => (
                      <Option key={type} value={type}>
                        {type}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Space>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => firmId && fetchCases(firmId)}
                      loading={loading}
                      className="rounded-xl border border-slate-300 dark:border-slate-600 dark:text-white 
                                 !bg-transparent hover:!bg-transparent active:!bg-transparent focus:!bg-transparent"
                    >
                      Refresh
                    </Button>
                    <Text className="text-slate-500 dark:text-slate-400 text-sm">
                      Showing {filteredCases.length} of {cases.length} cases
                    </Text>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Cases Table */}
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
                  pageSize: 10,
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
                           dark:[&_.ant-table-tbody>tr>td]:!text-slate-300"
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                }}
                rowClassName={() => "no-hover"}
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
                        Start by creating your first case for the firm
                      </Text>
                      <br />
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() =>
                          router.push("/pages/firm-admin/create-case")
                        }
                        style={{ marginTop: "16px" }}
                      >
                        Create First Case
                      </Button>
                    </div>
                  ),
                }}
              />
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ThemeProvider>
  );
}
