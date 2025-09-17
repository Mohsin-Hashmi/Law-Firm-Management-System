"use client";
import { getAllFirms } from "@/app/service/superAdminAPI";
import { deleteFirm } from "@/app/service/superAdminAPI";
import { setFirm } from "@/app/store/firmSlice";
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
  BankOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExportOutlined,
  PlusOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useAppDispatch } from "@/app/store/hooks";
import { toast } from "react-hot-toast";
import DashboardLayout from "@/app/components/DashboardLayout";
import { ThemeProvider } from "next-themes";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
const { Title, Text } = Typography;
const { Option } = Select;

interface Firm {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  subscription_plan: "Free" | "Basic" | "Premium";
  max_users: number;
  max_cases: number;
  status: "Active" | "Suspended" | "Cancelled";
  trial_ends_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export default function GetFirms() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [filteredFirms, setFilteredFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingFirmId, setDeletingFirmId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");

  // Filter firms based on search and filters
  useEffect(() => {
    filterFirms();
  }, [firms, searchText, statusFilter, planFilter]);

  const filterFirms = () => {
    let filtered = firms;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (firm) =>
          (firm.name || "").toLowerCase().includes(searchText.toLowerCase()) ||
          (firm.email || "").toLowerCase().includes(searchText.toLowerCase()) ||
          (firm.address || "").toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (firm) =>
          (firm.status || "").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by subscription plan
    if (planFilter !== "all") {
      filtered = filtered.filter(
        (firm) =>
          (firm.subscription_plan || "").toLowerCase() ===
          planFilter.toLowerCase()
      );
    }

    setFilteredFirms(filtered);
  };

  // Fetch all firms from API
  const fetchFirms = async () => {
    try {
      setLoading(true);
      const response = await getAllFirms();
      console.log("Response of API is", response);

      if (response.success) {
        setFirms(response.firms);
        dispatch(setFirm(response.firms));
      } else {
        message.error("Failed to load firms");
      }
    } catch (error) {
      message.error("Something went wrong while loading firms");
      console.error(error);
      setFirms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFirms();
  }, []);

  // Handle update firms from API
  const handleUpdate = (firm: Firm) => {
    console.log("Update clicked for:", firm);
    // Add your update logic here or navigate to update page
  };

  // Handle opening delete modal
  const handleOpenDeleteModal = (firm: Firm) => {
    setSelectedFirm(firm);
    setIsModalOpen(true);
  };

  // Handle delete firms from API
  const handleConfirmDelete = async () => {
    if (!selectedFirm) return;

    try {
      setDeleting(true);
      setDeletingFirmId(selectedFirm.id);

      // Optimistically update UI
      setFirms((prev) => prev.filter((f) => f.id !== selectedFirm.id));

      await deleteFirm(selectedFirm.id);
      toast.success("Firm deleted successfully");
    } catch (error) {
      toast.error("Failed to delete firm");
      console.error(error);
      // Revert optimistic update on error
      fetchFirms();
    } finally {
      setDeleting(false);
      setDeletingFirmId(null);
      setIsModalOpen(false);
      setSelectedFirm(null);
    }
  };

  // Get statistics
  const activeFirms = firms.filter(
    (firm) => (firm.status || "").toLowerCase() === "active"
  );
  const suspendedFirms = firms.filter(
    (firm) => (firm.status || "").toLowerCase() === "suspended"
  );
  const premiumFirms = firms.filter(
    (firm) => (firm.subscription_plan || "").toLowerCase() === "premium"
  );

  const columns: ColumnsType<Firm> = [
    {
      title: "Firm",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: Firm) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar
            size={48}
            style={{
              background: "#f1f5f9",
              border: "2px solid #e5e7eb",
            }}
          >
            <BankOutlined style={{ color: "#94a3b8" }} />
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
      title: "Contact",
      key: "contact",
      render: (_: unknown, record: Firm) => (
        <Space direction="vertical" size="small">
          <Space size="small">
            <PhoneOutlined style={{ color: "#9ca3af", fontSize: "12px" }} />
            <Text style={{ fontSize: "13px", color: "#374151" }}>
              {record.phone || "N/A"}
            </Text>
          </Space>
          <Space size="small">
            <HomeOutlined style={{ color: "#9ca3af", fontSize: "12px" }} />
            <Text style={{ fontSize: "13px", color: "#374151" }}>
              {record.address || "N/A"}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Subscription Plan",
      dataIndex: "subscription_plan",
      key: "subscription_plan",
      align: "center",
      render: (plan: Firm["subscription_plan"]) => {
        const color =
          plan === "Premium"
            ? "#fbbf24"
            : plan === "Basic"
            ? "#3b82f6"
            : "#10b981";
        const bgColor =
          plan === "Premium"
            ? "#fef3c7"
            : plan === "Basic"
            ? "#dbeafe"
            : "#d1fae5";

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
            {plan}
          </Tag>
        );
      },
    },
    {
      title: "Limits",
      key: "limits",
      render: (_: unknown, record: Firm) => (
        <Space direction="vertical" size="small">
          <Text style={{ fontSize: "12px", color: "#64748b" }}>
            Users: {record.max_users}
          </Text>
          <Text style={{ fontSize: "12px", color: "#64748b" }}>
            Cases: {record.max_cases}
          </Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: Firm["status"]) => {
        // Capitalize first letter
        const displayStatus =
          status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

        const color =
          displayStatus === "Active"
            ? "#10b981"
            : displayStatus === "Suspended"
            ? "#f59e0b"
            : "#ef4444";

        const bgColor =
          displayStatus === "Active"
            ? "#d1fae5"
            : displayStatus === "Suspended"
            ? "#fef3c7"
            : "#fee2e2";

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
            {displayStatus}
          </Tag>
        );
      },
    },

    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_: unknown, record: Firm) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() =>
                router.push(`/super-admin/get-firm-detail/${record.id}`)
              }
              className="hover:!bg-blue-50 dark:text-gray-200 hover:!text-blue-600 dark:hover:!bg-blue-900/30 dark:hover:!text-blue-400"
              style={{ borderRadius: "6px" }}
            />
          </Tooltip>
          <Tooltip title="Edit Firm">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleUpdate(record)}
              className="hover:!bg-amber-50 dark:text-gray-200 hover:!text-amber-600 dark:hover:!bg-amber-900/30 dark:hover:!text-amber-400"
              style={{ borderRadius: "6px" }}
            />
          </Tooltip>
          <Tooltip title="Delete Firm">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleOpenDeleteModal(record);
              }}
              loading={deleting && deletingFirmId === record.id}
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
            <Spin size="large" tip="Loading firms..." />
          </div>
        ) : (
          <div className="min-h-screen transition-colors duration-300 [&_.ant-typography]:dark:!text-white [&_.ant-card-head-title]:dark:!text-white">
            <div className="max-w-full">
              {/* Header Section */}
              <Card
                className="bg-green-600 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
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
                        <BankOutlined
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
                          Law Firms
                        </Title>
                        <Text
                          style={{
                            color: "rgba(255,255,255,0.8)",
                            fontSize: "18px",
                            fontWeight: "400",
                          }}
                        >
                          Manage and oversee all registered law firms
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
                          Total Firms
                        </span>
                      }
                      value={firms.length}
                      valueStyle={{
                        fontSize: "32px",
                        fontWeight: "700",
                        lineHeight: "1",
                        color: "inherit",
                      }}
                      prefix={
                        <BankOutlined className="text-blue-600 dark:text-blue-400 text-3xl mr-1" />
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
                          Active Firms
                        </span>
                      }
                      value={activeFirms.length}
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
                          Suspended Firms
                        </span>
                      }
                      value={suspendedFirms.length}
                      valueStyle={{
                        fontSize: "32px",
                        fontWeight: "700",
                        lineHeight: "1",
                        color: "inherit",
                      }}
                      prefix={
                        <CloseCircleOutlined className="text-orange-600 dark:text-orange-400 text-3xl mr-1" />
                      }
                      className="text-orange-600 dark:text-orange-600"
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
                          Premium Firms
                        </span>
                      }
                      value={premiumFirms.length}
                      valueStyle={{
                        fontSize: "32px",
                        fontWeight: "700",
                        lineHeight: "1",
                        color: "inherit",
                      }}
                      prefix={
                        <UserOutlined className="text-purple-600 dark:text-purple-400 text-3xl mr-1" />
                      }
                      className="text-purple-600 dark:text-purple-500"
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
                      placeholder="Search firms by name, email, or address"
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
                      <Option value="suspended">Suspended</Option>
                      <Option value="cancelled">Cancelled</Option>
                    </Select>
                  </Col>
                  <Col xs={12} sm={6} md={4}>
                    <Select
                      placeholder="Filter by Plan"
                      value={planFilter}
                      onChange={setPlanFilter}
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
                      <Option value="all">All Plans</Option>
                      <Option value="free">Free</Option>
                      <Option value="basic">Basic</Option>
                      <Option value="premium">Premium</Option>
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Space>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchFirms}
                        loading={loading}
                        className="rounded-xl border border-slate-300 dark:border-slate-600 dark:text-white 
                          !bg-transparent hover:!bg-transparent active:!bg-transparent focus:!bg-transparent"
                      >
                        Refresh
                      </Button>
                      <Text className="text-slate-500 dark:text-slate-400 text-sm">
                        Showing {filteredFirms.length} of {firms.length} firms
                      </Text>
                    </Space>
                  </Col>
                </Row>
              </Card>

              {/* Firms Table */}
              <Card
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm transition-colors duration-300"
                bodyStyle={{ padding: 0 }}
              >
                <Table<Firm>
                  dataSource={filteredFirms}
                  columns={columns}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} firms`,
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
                        <BankOutlined
                          style={{ fontSize: "48px", marginBottom: "16px" }}
                        />
                        <Title
                          level={4}
                          className="!text-slate-500 dark:!text-slate-300"
                        >
                          No firms found
                        </Title>
                        <Text className="dark:text-slate-400">
                          Start by adding your first law firm
                        </Text>
                        <br />
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => console.log("Add first firm")}
                          style={{ marginTop: "16px" }}
                        >
                          Add First Firm
                        </Button>
                      </div>
                    ),
                  }}
                />
              </Card>

              {/* Confirmation Modal */}
              <ConfirmationModal
                visible={isModalOpen}
                entityName={selectedFirm?.name || ""}
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
