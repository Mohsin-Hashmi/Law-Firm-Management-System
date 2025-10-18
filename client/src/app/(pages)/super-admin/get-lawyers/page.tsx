"use client";
import { getAllLawyers } from "@/app/service/superAdminAPI";
import { deleteLawyer } from "@/app/service/superAdminAPI";
import { useState, useEffect } from "react";
import {
  Table,
  Spin,
  Typography,
  Button,
  Space,
  Tag,
  Card,
  Row,
  Col,
  Input,
  Select,
  Avatar,
  Statistic,
  Tooltip,
  message,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  PhoneOutlined,
  MailOutlined,
  BankOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { toast } from "react-hot-toast";
import DashboardLayout from "@/app/components/DashboardLayout";
import { ThemeProvider } from "next-themes";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import type { ColumnsType } from "antd/es/table";
import BASE_URL from "@/app/utils/constant";
import { useRouter } from "next/navigation";
import LawyerStatusModal from "@/app/components/LawyerStatusModal";
import { updateLawyerStatus } from "@/app/service/superAdminAPI";
const { Title, Text } = Typography;
const { Option } = Select;

interface Firm {
  id: number;
  name: string;
  subscription_plan: "Free" | "Basic" | "Premium";
}

interface Lawyer {
  id: number;
  firmId: number;
  userId?: number | null;
  name: string;
  email: string;
  phone?: string | null;
  specialization?: string | null;
  status: "Active" | "Inactive";
  profileImage?: string | null;
  createdAt?: string;
  updatedAt?: string;
  firm: Firm;
}

export default function GetLawyers() {
  const router = useRouter();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [filteredLawyers, setFilteredLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingLawyerId, setDeletingLawyerId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specializationFilter, setSpecializationFilter] =
    useState<string>("all");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedLawyerForStatus, setSelectedLawyerForStatus] =
    useState<Lawyer | null>(null);
  // Filter lawyers based on search and filters
  useEffect(() => {
    filterLawyers();
  }, [lawyers, searchText, statusFilter, specializationFilter]);

  const filterLawyers = () => {
    let filtered = lawyers;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (lawyer) =>
          (lawyer.name || "")
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          (lawyer.email || "")
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          (lawyer.firm?.name || "")
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          (lawyer.specialization || "")
            .toLowerCase()
            .includes(searchText.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (lawyer) =>
          (lawyer.status || "").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by specialization
    if (specializationFilter !== "all") {
      filtered = filtered.filter(
        (lawyer) =>
          (lawyer.specialization || "").toLowerCase() ===
          specializationFilter.toLowerCase()
      );
    }

    setFilteredLawyers(filtered);
  };

  // Fetch all lawyers from API
  const fetchLawyers = async () => {
    try {
      setLoading(true);
      const response = await getAllLawyers();
      console.log("Response of API is", response);

      if (response.success) {
        setLawyers(response.lawyers);
      } else {
        message.error("Failed to load lawyers");
      }
    } catch (error) {
      message.error("Something went wrong while loading lawyers");
      console.error(error);
      setLawyers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLawyers();
  }, []);

  // Handle update lawyers from API
  const handleUpdate = (lawyer: Lawyer) => {
    console.log("Updating lawyer:", lawyer);
  };

  const handleviewdetail = (lawyer: Lawyer) => {
    console.log("lawyer:", lawyer);
    router.push(`/super-admin/get-lawyer-detail/${lawyer.id}`);
  };

  const handleStatusModalUpdate = (lawyer: Lawyer) => {
    setSelectedLawyerForStatus(lawyer);
    setIsStatusModalOpen(true);
  };

  const handleStatusUpdated = async (newStatus: string) => {
    if (!selectedLawyerForStatus) return;

    try {
      const formattedStatus =
        newStatus.charAt(0).toUpperCase() + newStatus.slice(1).toLowerCase();

      message.loading({ content: "Updating status...", key: "status" });

      const response = await updateLawyerStatus(
        selectedLawyerForStatus.id,
        formattedStatus
      );

      setLawyers((prev) =>
        prev.map((lawyer) =>
          lawyer.id === selectedLawyerForStatus.id
            ? { ...lawyer, status: formattedStatus as "Active" | "Inactive" }
            : lawyer
        )
      );

      message.success({
        content: `Lawyer status updated to ${formattedStatus}`,
        key: "status",
      });
    } catch (error) {
      toast.error("Failed to update lawyer status");
    } finally {
      setIsStatusModalOpen(false);
    }
  };

  // Handle opening delete modal
  const handleOpenDeleteModal = (lawyer: Lawyer) => {
    setSelectedLawyer(lawyer);
    setIsModalOpen(true);
  };

  // Handle delete lawyers from API
  const handleConfirmDelete = async () => {
    if (!selectedLawyer) return;

    try {
      setDeleting(true);
      setDeletingLawyerId(selectedLawyer.id);

      // Optimistically update UI
      setLawyers((prev) => prev.filter((l) => l.id !== selectedLawyer.id));

      // Uncomment when deleteLawyer API is available
      // await deleteLawyer(selectedLawyer.id);
      toast.success("Lawyer deleted successfully");
    } catch (error) {
      toast.error("Failed to delete lawyer");
      console.error(error);
      // Revert optimistic update on error
      fetchLawyers();
    } finally {
      setDeleting(false);
      setDeletingLawyerId(null);
      setIsModalOpen(false);
      setSelectedLawyer(null);
    }
  };

  // Get statistics
  const activeLawyers = lawyers.filter(
    (lawyer) => (lawyer.status || "").toLowerCase() === "active"
  );
  const inactiveLawyers = lawyers.filter(
    (lawyer) => (lawyer.status || "").toLowerCase() === "inactive"
  );

  // Get unique specializations for filter
  const uniqueSpecializations = [
    ...new Set(
      lawyers
        .map((lawyer) => lawyer.specialization?.toLowerCase())
        .filter(Boolean)
    ),
  ];

  const columns: ColumnsType<Lawyer> = [
    {
      title: "Lawyer",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: Lawyer) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar
            size={48}
            src={
              record.profileImage
                ? `${BASE_URL}${record.profileImage}`
                : undefined
            }
            style={{
              background: record.profileImage ? undefined : "#f1f5f9",
              border: "2px solid #e5e7eb",
            }}
          >
            {!record.profileImage && (
              <UserOutlined style={{ color: "#94a3b8" }} />
            )}
          </Avatar>
          <div>
            <Text
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#111827",
                display: "block",
              }}
            >
              {name}
            </Text>
            <Space size="small">
              <MailOutlined style={{ color: "#9ca3af", fontSize: "12px" }} />
              <Text style={{ fontSize: "13px", color: "#64748b" }}>
                {record.email}
              </Text>
            </Space>
          </div>
        </div>
      ),
    },
    {
      title: "Firm",
      key: "firm",
      render: (_: unknown, record: Lawyer) => (
        <div>
          <Space size="small">
            <BankOutlined style={{ color: "#9ca3af", fontSize: "12px" }} />
            <Text
              style={{ fontSize: "13px", color: "#374151", fontWeight: "500" }}
            >
              {record.firm?.name || "N/A"}
            </Text>
          </Space>
          <div style={{ marginTop: "4px" }}>
            <Tag
              style={{
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "6px",
                textAlign: "center",
                color:
                  record.firm?.subscription_plan === "Premium"
                    ? "#fbbf24"
                    : record.firm?.subscription_plan === "Basic"
                    ? "#3b82f6"
                    : "#10b981",
                backgroundColor:
                  record.firm?.subscription_plan === "Premium"
                    ? "#fef3c7"
                    : record.firm?.subscription_plan === "Basic"
                    ? "#dbeafe"
                    : "#d1fae5",
                border: "none",
              }}
            >
              {record.firm?.subscription_plan || "Free"}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (_: unknown, record: Lawyer) => (
        <Space direction="vertical" size="small">
          <Space size="small">
            <PhoneOutlined style={{ color: "#9ca3af", fontSize: "12px" }} />
            <Text style={{ fontSize: "13px", color: "#374151" }}>
              {record.phone || "N/A"}
            </Text>
          </Space>
          <Space size="small">
            <TeamOutlined style={{ color: "#9ca3af", fontSize: "12px" }} />
            <Text style={{ fontSize: "13px", color: "#374151" }}>
              {record.specialization || "General Practice"}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Specialization",
      dataIndex: "specialization",
      key: "specialization",
      align: "center",
      render: (specialization: string) => (
        <Tag
          style={{
            color: "#6366f1",
            backgroundColor: "#e0e7ff",
            border: "1px solid #6366f120",
            borderRadius: "8px",
            padding: "4px 12px",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          {specialization || "General Practice"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: Lawyer["status"]) => {
        const color = status === "Active" ? "#10b981" : "#ef4444";
        const bgColor = status === "Active" ? "#d1fae5" : "#fee2e2";

        return (
          <Tag
            style={{
              color: color,
              backgroundColor: bgColor,
              border: `1px solid ${color}20`,
              borderRadius: "8px",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Lawyer) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleviewdetail(record)}
              className="hover:!bg-blue-50 dark:text-gray-200 hover:!text-blue-600 dark:hover:!bg-blue-900/30 dark:hover:!text-blue-400"
              style={{ borderRadius: "6px" }}
            />
          </Tooltip>
          <Tooltip title="Edit Lawyer Status">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleStatusModalUpdate(record)}
              className="hover:!bg-amber-50 dark:text-gray-200 hover:!text-amber-600 dark:hover:!bg-amber-900/30 dark:hover:!text-amber-400"
              style={{ borderRadius: "6px" }}
            />
            <LawyerStatusModal
              open={isStatusModalOpen}
              onClose={() => setIsStatusModalOpen(false)}
              lawyerId={selectedLawyerForStatus?.id || 0}
              currentStatus={
                selectedLawyerForStatus?.status.toLowerCase() || "active"
              }
              onStatusUpdated={handleStatusUpdated}
            />
          </Tooltip>
          <Tooltip title="Delete Lawyer">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleOpenDeleteModal(record);
              }}
              loading={deleting && deletingLawyerId === record.id}
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
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <Spin size="large" tip="Loading lawyers..." />
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
                        <UserOutlined
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
                          Lawyers
                        </Title>
                        <Text
                          style={{
                            color: "rgba(255,255,255,0.8)",
                            fontSize: "18px",
                            fontWeight: "400",
                          }}
                        >
                          Manage and oversee all registered lawyers
                        </Text>
                      </div>
                    </Space>
                  </Col>
                </Row>
              </Card>

              {/* Statistics Cards */}
              <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
                <Col xs={24} sm={8} lg={6}>
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
                          Total Lawyers
                        </span>
                      }
                      value={lawyers.length}
                      valueStyle={{
                        fontSize: "32px",
                        fontWeight: "700",
                        lineHeight: "1",
                        color: "inherit",
                      }}
                      prefix={
                        <UserOutlined className="text-blue-600 dark:text-blue-400 text-3xl mr-1" />
                      }
                      className="text-blue-600 dark:text-blue-600"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8} lg={6}>
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
                          Active Lawyers
                        </span>
                      }
                      value={activeLawyers.length}
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
                <Col xs={24} sm={8} lg={6}>
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
                          Inactive Lawyers
                        </span>
                      }
                      value={inactiveLawyers.length}
                      valueStyle={{
                        fontSize: "32px",
                        fontWeight: "700",
                        lineHeight: "1",
                        color: "inherit",
                      }}
                      prefix={
                        <CloseCircleOutlined className="text-red-600 dark:text-red-400 text-3xl mr-1" />
                      }
                      className="text-red-600 dark:text-red-600"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8} lg={6}>
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
                          Specializations
                        </span>
                      }
                      value={uniqueSpecializations.length}
                      valueStyle={{
                        fontSize: "32px",
                        fontWeight: "700",
                        lineHeight: "1",
                        color: "inherit",
                      }}
                      prefix={
                        <TeamOutlined className="text-purple-600 dark:text-purple-400 text-3xl mr-1" />
                      }
                      className="text-purple-600 dark:text-purple-500"
                    />
                  </Card>
                </Col>
              </Row>

              {/* Filters and Search */}
              <Card
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm transition-colors duration-300 mb-6"
                bodyStyle={{ padding: "24px" }}
              >
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} sm={12} md={11}>
                    <Input
                      placeholder="Search lawyers by name, email, firm, or specialization"
                      prefix={
                        <SearchOutlined className="text-slate-400 dark:text-slate-500" />
                      }
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                      size="large"
                    />
                  </Col>
                  <Col xs={12} sm={6} md={5}>
                    <Select
                      placeholder="Filter by Status"
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
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                    </Select>
                  </Col>
                  <Col xs={12} sm={6} md={5}>
                    <Select
                      placeholder="Filter by Specialization"
                      value={specializationFilter}
                      onChange={setSpecializationFilter}
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
                      <Option value="all">All Specializations</Option>
                      {uniqueSpecializations.map((spec) => (
                        <Option key={spec} value={spec}>
                          {spec
                            ?.split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={3}>
                    <Space>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchLawyers}
                        loading={loading}
                        className="rounded-xl border border-slate-300 dark:border-slate-600 dark:text-white 
            !bg-transparent hover:!bg-transparent active:!bg-transparent focus:!bg-transparent"
                      >
                        Refresh
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>

              {/* Lawyers Table */}
              <Card
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm transition-colors duration-300"
                bodyStyle={{ padding: 0 }}
              >
                <div className="overflow-x-auto">
                  <Table<Lawyer>
                    dataSource={filteredLawyers}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} lawyers`,
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
                    scroll={{ x: "max-content" }}
                    locale={{
                      emptyText: (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "48px",
                          }}
                          className="text-slate-500 dark:text-slate-400"
                        >
                          <UserOutlined
                            style={{ fontSize: "48px", marginBottom: "16px" }}
                          />
                          <Title
                            level={4}
                            className="!text-slate-500 dark:!text-slate-300"
                          >
                            No lawyers found
                          </Title>
                          <Text className="dark:text-slate-400">
                            Start by adding your first lawyer
                          </Text>
                          <br />
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => console.log("Add first lawyer")}
                            style={{ marginTop: "16px" }}
                          >
                            Add First Lawyer
                          </Button>
                        </div>
                      ),
                    }}
                  />
                </div>
              </Card>

              {/* Confirmation Modal */}
              <ConfirmationModal
                visible={isModalOpen}
                entityName={selectedLawyer?.name || ""}
                action="delete"
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        )}
      </DashboardLayout>
    </ThemeProvider>
  );
}
