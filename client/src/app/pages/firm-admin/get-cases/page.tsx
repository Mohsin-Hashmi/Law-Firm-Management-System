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
  DownOutlined,
} from "@ant-design/icons";
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
  Statistic,
  Tag,
  Tooltip,
  Typography,
  Pagination,
  Spin,
  Empty,
  Dropdown,
} from "antd";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingCaseId, setUpdatingCaseId] = useState<number | null>(null);

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

  /**Handle delete function */
  const handleDeleteCase = async (firmId: number, id: number) => {
    confirm({
      title: "Are you sure you want to delete this case?",
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setDeleting(true);
          setDeletingCaseId(id);
          await deleteCaseByFirm(firmId, id);
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
      },
    });
  };

  const handleStatusUpdate = async (
    firmId: number,
    id: number,
    newStatus: "Open" | "Closed" | "On Hold" | "Appeal"
  ) => {
    if (!firmId) return;
    try {
      setUpdatingStatus(true);
      setUpdatingCaseId(id);

      await updateCaseStatus(firmId, id, newStatus);

      // Update local state
      setCasesData((prevCases) =>
        prevCases.map(
          (case_): Case =>
            case_.id === id ? { ...case_, status: newStatus } : case_
        )
      );

      toast.success(`Case status updated to ${newStatus}`);
      message.success(`Case status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating case status:", error);
      toast.error("Failed to update case status");
      message.error("Failed to update case status");
    } finally {
      setUpdatingStatus(false);
      setUpdatingCaseId(null);
    }
  };

  /**Handle assign lawyer */
  const handleAssignLawyer = (caseId: number) => {
    router.push(`/pages/firm-admin/assign-lawyer/${caseId}`);
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

  // Pagination logic
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCases = filteredCases.slice(startIndex, endIndex);

  // Enhanced Case Card Component - Single row layout
  const CaseCard = ({ caseData }: { caseData: Case }) => (
    <Card
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg "
      bodyStyle={{ padding: "24px" }}
    >
      {/* Main Content Container */}
      <div className="flex flex-col space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#1e293b",
                borderRadius: "12px",
                width: "56px",
                height: "56px",
              }}
            >
              <BankTwoTone
                twoToneColor="#1890ff"
                style={{ fontSize: "24px" }}
              />
            </div>

            <div>
              <Title
                level={4}
                className="!mb-0 !text-slate-800 dark:!text-slate-200 !font-semibold !text-xl"
                ellipsis={{ tooltip: caseData.title }}
              >
                {caseData.title}
              </Title>

              <Text className="text-slate-500 dark:text-slate-400 font-mono text-sm block italic">
                {caseData.caseNumber}
              </Text>

              {caseData.description && (
                <Text
                  className="text-slate-600 dark:text-slate-400 text-sm mt-1 leading-relaxed block italic"
                  ellipsis={{ tooltip: caseData.description }}
                >
                  “{caseData.description}”
                </Text>
              )}
            </div>
          </div>
          {/* <Dropdown
            // menu={{ items: statusMenuItems }}
            trigger={["click"]}
            placement="bottomRight"
            disabled={updatingStatus && updatingCaseId === caseData.id}
            overlayClassName="custom-dropdown"
          >
            <div
              className="cursor-pointer hover:shadow-md transition-all duration-200"
              style={{
                background: `${getStatusColor(caseData.status)}15`,
                padding: "12px 16px",
                borderRadius: "10px",
                border: `1px solid ${getStatusColor(caseData.status)}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                minWidth: "160px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: getStatusColor(caseData.status),
                }}
              />
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: getStatusColor(caseData.status),
                  textTransform: "uppercase",
                }}
              >
                {caseData.status}
              </span>
              {updatingStatus && updatingCaseId === caseData.id ? (
                <Spin size="small" />
              ) : (
                <DownOutlined
                  style={{
                    fontSize: "12px",
                    color: getStatusColor(caseData.status),
                  }}
                />
              )}
            </div>
          </Dropdown> */}

          {/* Status Badge */}
          <div
            style={{
              background: `${getStatusColor(caseData.status)}15`,
              padding: "12px 12px",
              borderRadius: "10px",
              border: `1px solid ${getStatusColor(caseData.status)}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              minWidth: "150px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: getStatusColor(caseData.status),
              }}
            />
            <span
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: getStatusColor(caseData.status),
                textTransform: "uppercase",
              }}
            >
              {caseData.status}
            </span>
          </div>
        </div>

        {/* Client Details and Case Type - Parallel Layout */}
        <div className="flex items-center gap-8 !mt-4">
          {/* Client Information */}
          <div className="flex-1">
            <Text className="block text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-3">
              Client Information
            </Text>
            <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-slate-700/50 rounded-xl min-h-24">
              <Avatar
                size={60}
                src={
                  caseData.client?.profileImage
                    ? caseData.client.profileImage.startsWith("http")
                      ? caseData.client.profileImage
                      : `http://localhost:5000${caseData.client.profileImage}`
                    : undefined
                }
                style={{
                  backgroundColor: "#f1f5f9",
                  color: "#059669",
                  fontSize: "18px",
                  fontWeight: "600",
                  border: "2px solid #e5e7eb",
                }}
              >
                {!caseData.client?.profileImage &&
                  (caseData.client?.fullName?.charAt(0) || "N")}
              </Avatar>

              <div className="flex-1 min-w-0">
                <Text className="block text-slate-900 dark:text-slate-200 font-medium text-base">
                  {caseData.client?.fullName || "No client assigned"}
                </Text>
                {caseData.client?.email && (
                  <Text
                    className="block text-slate-800 dark:text-slate-400 text-sm mt-0.5"
                    ellipsis={{ tooltip: caseData.client.email }}
                  >
                    {caseData.client.email}
                  </Text>
                )}
              </div>
            </div>
          </div>

          {/* Case Type and Dates */}
          <div className="flex-1">
            <Text className="block text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-3">
              Case Details
            </Text>
            <div className="space-y-3 p-4 bg-gray-100 dark:bg-slate-700/50 rounded-xl min-h-24">
              <div className="flex items-center justify-between">
                <Text className="text-slate-900 dark:text-slate-400 text-base font-medium uppercase tracking-wider">
                  Type
                </Text>
                <Tag
                  icon={getCaseTypeIcon(caseData.caseType || "")}
                  style={{
                    background: `${getCaseTypeColor(
                      caseData.caseType || ""
                    )}15`,
                    color: getCaseTypeColor(caseData.caseType || ""),
                    border: `1px solid ${getCaseTypeColor(
                      caseData.caseType || ""
                    )}30`,
                    borderRadius: "8px",
                    padding: "4px 8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    margin: 0,
                    minWidth: "90px",
                    textAlign: "center",
                  }}
                >
                  {caseData.caseType}
                </Tag>
              </div>

              <div className="flex items-center justify-between">
                <Text className="text-slate-900 dark:text-slate-400 text-base font-medium uppercase tracking-wider">
                  Opened
                </Text>
                <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                  {formatDate(caseData.openedAt)}
                </Text>
              </div>

              {caseData.closedAt && (
                <div className="flex items-center justify-between">
                  <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
                    Closed
                  </Text>
                  <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                    {formatDate(caseData.closedAt)}
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assigned Lawyers Section */}
        <div className="!mt-4">
          <Text className="block text-slate-500 dark:text-slate-400 text-sm  font-medium uppercase tracking-wider mb-3">
            Legal Team
          </Text>

          {caseData.lawyers && caseData.lawyers.length > 0 ? (
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Avatar.Group maxCount={5} size={36}>
                  {caseData.lawyers.map((lawyer, index) => (
                    <Tooltip key={index} title={lawyer.name}>
                      <Avatar
                        size={60}
                        style={{
                          backgroundColor: "#f1f5f9",
                          color: "#059669",
                          fontSize: "18px",
                          fontWeight: "600",
                          border: "2px solid white",
                        }}
                      >
                        {lawyer.name.charAt(0)}
                      </Avatar>
                    </Tooltip>
                  ))}
                </Avatar.Group>
                <div>
                  <Text className="block text-slate-800 dark:text-slate-200 font-medium text-base">
                    {caseData.lawyers.length} Lawyer
                    {caseData.lawyers.length > 1 ? "s" : ""} Assigned
                  </Text>
                  <Text className="text-slate-500 dark:text-slate-400 text-sm">
                    {caseData.lawyers.map((lawyer) => lawyer.name).join(", ")}
                  </Text>
                </div>
              </div>

              <Button
                type="text"
                icon={<UserAddOutlined />}
                onClick={() => handleAssignLawyer(caseData.id)}
                className="hover:!bg-blue-50 hover:!text-blue-600 dark:hover:!bg-blue-900/30 dark:hover:!text-blue-400 dark:!text-white"
                style={{
                  borderRadius: "8px",
                  height: "32px",
                  fontSize: "16px",
                }}
              >
                Add More
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-[60px] h-[60px] bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <UserOutlined className="text-slate-400 text-[18px]" />
                </div>
                <Text className="text-slate-500 dark:text-slate-400 text-sm">
                  No lawyers assigned to this case
                </Text>
              </div>

              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => handleAssignLawyer(caseData.id)}
                style={{
                  borderRadius: "8px",
                  height: "36px",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                Assign Lawyer
              </Button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2  !mt-2">
          <Tooltip title="View Details">
            <Button
              type="text"
              size="large"
              icon={<EyeOutlined />}
              onClick={() =>
                router.push(`/pages/firm-admin/get-case-detail/${caseData.id}`)
              }
              className="hover:!bg-blue-50 hover:!text-blue-600 dark:hover:!bg-blue-900/30 dark:hover:!text-blue-400"
              style={{
                borderRadius: "8px",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
              }}
            />
          </Tooltip>

          <Tooltip title="Edit Case">
            <Button
              type="text"
              size="large"
              icon={<EditOutlined />}
              onClick={() =>
                router.push(`/pages/firm-admin/edit-case/${caseData.id}`)
              }
              className="hover:!bg-amber-50 hover:!text-amber-600 dark:hover:!bg-amber-900/30 dark:hover:!text-amber-400"
              style={{
                borderRadius: "8px",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
              }}
            />
          </Tooltip>

          <Tooltip title="Delete Case">
            <Button
              type="text"
              size="large"
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleDeleteCase(caseData.firmId, caseData.id);
              }}
              loading={deleting && deletingCaseId === caseData.id}
              className="hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-900/30 dark:hover:!text-red-400"
              style={{
                borderRadius: "8px",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#dc2626",
                fontSize: "14px",
              }}
              danger
            />
          </Tooltip>
        </div>
      </div>
    </Card>
  );

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

            {/* Cases List */}
            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <Spin size="large" />
              </div>
            ) : filteredCases.length === 0 ? (
              <Card
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm"
                bodyStyle={{ padding: "60px 24px" }}
              >
                <Empty
                  description={
                    <Text className="text-slate-500 dark:text-slate-400 text-lg">
                      No cases found. Try adjusting your filters or create a new
                      case.
                    </Text>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Cases Grid - One card per row */}
                <div className="space-y-4">
                  {paginatedCases.map((caseData) => (
                    <div key={caseData.id} className="w-full">
                      <CaseCard caseData={caseData} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {filteredCases.length > pageSize && (
                  <div className="flex justify-center mt-8">
                    <Pagination
                      current={currentPage}
                      total={filteredCases.length}
                      pageSize={pageSize}
                      onChange={(page) => setCurrentPage(page)}
                      onShowSizeChange={(current, size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                      }}
                      showSizeChanger
                      showQuickJumper
                      showTotal={(total, range) =>
                        `${range[0]}-${range[1]} of ${total} cases`
                      }
                      style={{
                        textAlign: "center",
                      }}
                      className="dark:text-white [&_.ant-pagination-item]:dark:bg-slate-700 [&_.ant-pagination-item]:dark:border-slate-600 [&_.ant-pagination-item-active]:dark:bg-blue-600 [&_.ant-pagination-item-active]:dark:border-blue-600"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ThemeProvider>
  );
}
