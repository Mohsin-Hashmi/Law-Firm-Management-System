"use client";
import { getAllClients } from "@/app/service/superAdminAPI";
import { deleteClient } from "@/app/service/superAdminAPI";
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
  HomeOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { toast } from "react-hot-toast";
import DashboardLayout from "@/app/components/DashboardLayout";
import { ThemeProvider } from "next-themes";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import type { ColumnsType } from "antd/es/table";
import BASE_URL from "@/app/utils/constant";
import { useRouter } from "next/navigation";
const { Title, Text } = Typography;
const { Option } = Select;

interface Firm {
  id: number;
  name: string;
  subscription_plan: "Free" | "Basic" | "Premium";
}

interface Client {
  id: number;
  fullName: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  email: string;
  phone?: string | null;
  address?: string | null;
  clientType: "Individual" | "Organization";
  organization?: string | null;
  status: "Active" | "Inactive";
  billingAddress?: string | null;
  outstandingBalance: string;
  profileImage?: string | null;
  createdAt?: string;
  updatedAt?: string;
  firmId: number;
  userId?: number | null;
  firm: Firm;
}

export default function GetClients() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingClientId, setDeletingClientId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientTypeFilter, setClientTypeFilter] = useState<string>("all");

  // Filter clients based on search and filters
  useEffect(() => {
    filterClients();
  }, [clients, searchText, statusFilter, clientTypeFilter]);

  const filterClients = () => {
    let filtered = clients;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (client) =>
          (client.fullName || "")
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          (client.email || "")
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          (client.firm?.name || "")
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          (client.address || "")
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          (client.organization || "")
            .toLowerCase()
            .includes(searchText.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (client) =>
          (client.status || "").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by client type
    if (clientTypeFilter !== "all") {
      filtered = filtered.filter(
        (client) =>
          (client.clientType || "").toLowerCase() ===
          clientTypeFilter.toLowerCase()
      );
    }

    setFilteredClients(filtered);
  };

  // Fetch all clients from API
  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await getAllClients();
      console.log("Response of API is", response);

      if (response.success) {
        setClients(response.clients);
      } else {
        message.error("Failed to load clients");
      }
    } catch (error) {
      message.error("Something went wrong while loading clients");
      console.error(error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Handle update clients from API
  const handleUpdate = (client: Client) => {
    console.log("Update clicked for:", client);
    // Add your update logic here or navigate to update page
  };

  const handleGetClientDetail = (client: Client) => {
    router.push(`/super-admin/get-client-detail/${client.id}`);
  };
  // Handle opening delete modal
  const handleOpenDeleteModal = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  // Handle delete clients from API
  const handleConfirmDelete = async () => {
    if (!selectedClient) return;

    try {
      setDeleting(true);
      setDeletingClientId(selectedClient.id);

      // Optimistically update UI
      setClients((prev) => prev.filter((c) => c.id !== selectedClient.id));

      // Uncomment when deleteClient API is available
      // await deleteClient(selectedClient.id);
      toast.success("Client deleted successfully");
    } catch (error) {
      toast.error("Failed to delete client");
      console.error(error);
      // Revert optimistic update on error
      fetchClients();
    } finally {
      setDeleting(false);
      setDeletingClientId(null);
      setIsModalOpen(false);
      setSelectedClient(null);
    }
  };

  // Get statistics
  const activeClients = clients.filter(
    (client) => (client.status || "").toLowerCase() === "active"
  );
  const inactiveClients = clients.filter(
    (client) => (client.status || "").toLowerCase() === "inactive"
  );
  const individualClients = clients.filter(
    (client) => (client.clientType || "").toLowerCase() === "individual"
  );
  const organizationClients = clients.filter(
    (client) => (client.clientType || "").toLowerCase() === "organization"
  );

  // Calculate total outstanding balance
  const totalOutstandingBalance = clients.reduce(
    (sum, client) => sum + parseFloat(client.outstandingBalance || "0"),
    0
  );

  const columns: ColumnsType<Client> = [
    {
      title: "Client",
      dataIndex: "fullName",
      key: "fullName",
      render: (fullName: string, record: Client) => (
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
              {fullName}
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
      render: (_: unknown, record: Client) => (
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
      render: (_: unknown, record: Client) => (
        <Space direction="vertical" size="small">
          <Space size="small">
            <PhoneOutlined style={{ color: "#9ca3af", fontSize: "12px" }} />
            <Text style={{ fontSize: "13px", color: "#374151" }}>
              {record.phone || "N/A"}
            </Text>
          </Space>
          <Space size="small">
            <HomeOutlined style={{ color: "#9ca3af", fontSize: "12px" }} />
            <Text style={{ fontSize: "13px", color: "#374151" }} ellipsis>
              {record.address || "N/A"}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Client Type",
      dataIndex: "clientType",
      key: "clientType",
      align: "center",
      render: (clientType: string, record: Client) => (
        <div>
          <Tag
            style={{
              color: clientType === "Organization" ? "#f59e0b" : "#6366f1",
              backgroundColor:
                clientType === "Organization" ? "#fef3c7" : "#e0e7ff",
              border: `1px solid ${
                clientType === "Organization" ? "#f59e0b" : "#6366f1"
              }20`,
              borderRadius: "8px",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            {clientType}
          </Tag>
          {record.organization && (
            <div style={{ marginTop: "4px" }}>
              <Text style={{ fontSize: "11px", color: "#64748b" }}>
                {record.organization}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Balance",
      dataIndex: "outstandingBalance",
      key: "outstandingBalance",
      align: "center",
      render: (balance: string) => {
        const amount = parseFloat(balance || "0");
        const hasBalance = amount > 0;

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            <DollarOutlined
              style={{
                color: hasBalance ? "#ef4444" : "#10b981",
                fontSize: "12px",
              }}
            />
            <Text
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: hasBalance ? "#ef4444" : "#10b981",
              }}
            >
              ${amount.toFixed(2)}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: Client["status"]) => {
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
      fixed: "right",
      width: 120,
      render: (_: unknown, record: Client) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleGetClientDetail(record)}
              className="hover:!bg-blue-50 dark:text-gray-200 hover:!text-blue-600 dark:hover:!bg-blue-900/30 dark:hover:!text-blue-400"
              style={{ borderRadius: "6px" }}
            />
          </Tooltip>
          <Tooltip title="Edit Client">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleUpdate(record)}
              className="hover:!bg-amber-50 dark:text-gray-200 hover:!text-amber-600 dark:hover:!bg-amber-900/30 dark:hover:!text-amber-400"
              style={{ borderRadius: "6px" }}
            />
          </Tooltip>
          <Tooltip title="Delete Client">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleOpenDeleteModal(record);
              }}
              loading={deleting && deletingClientId === record.id}
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
            <Spin size="large" tip="Loading clients..." />
          </div>
        ) : (
          <div className="min-h-screen transition-colors duration-300 [&_.ant-typography]:dark:!text-white [&_.ant-card-head-title]:dark:!text-white">
            <div className="max-w-full">
              {/* Header Section */}
              <Card
                className="bg-emerald-600 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
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
                        <TeamOutlined
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
                          Clients
                        </Title>
                        <Text
                          style={{
                            color: "rgba(255,255,255,0.8)",
                            fontSize: "18px",
                            fontWeight: "400",
                          }}
                        >
                          Manage and oversee all registered clients
                        </Text>
                      </div>
                    </Space>
                  </Col>
                </Row>
              </Card>

              {/* Statistics Cards */}
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
                          Total Clients
                        </span>
                      }
                      value={clients.length}
                      valueStyle={{
                        fontSize: "32px",
                        fontWeight: "700",
                        lineHeight: "1",
                        color: "inherit",
                      }}
                      prefix={
                        <TeamOutlined className="text-blue-600 dark:text-blue-400 text-3xl mr-1" />
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
                          Active Clients
                        </span>
                      }
                      value={activeClients.length}
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
                          Individual
                        </span>
                      }
                      value={individualClients.length}
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
                          Outstanding
                        </span>
                      }
                      value={totalOutstandingBalance}
                      precision={2}
                      valueStyle={{
                        fontSize: "32px",
                        fontWeight: "700",
                        lineHeight: "1",
                        color: "inherit",
                      }}
                      prefix={
                        <DollarOutlined className="text-red-600 dark:text-red-400 text-3xl mr-1" />
                      }
                      className="text-red-600 dark:text-red-500"
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
                  <Col xs={24} sm={12} md={11}>
                    <Input
                      placeholder="Search clients by name, email, firm, or address"
                      prefix={
                        <SearchOutlined className="text-slate-400 dark:text-slate-500" />
                      }
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
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
                      placeholder="Filter by Type"
                      value={clientTypeFilter}
                      onChange={setClientTypeFilter}
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
                      <Option value="individual">Individual</Option>
                      <Option value="organization">Organization</Option>
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={3}>
                    <Space>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchClients}
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

              {/* Clients Table */}
              <Card
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm transition-colors duration-300"
                bodyStyle={{ padding: 0 }}
              >
                <Table<Client>
                  dataSource={filteredClients}
                  columns={columns}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} clients`,
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
                        <TeamOutlined
                          style={{ fontSize: "48px", marginBottom: "16px" }}
                        />
                        <Title
                          level={4}
                          className="!text-slate-500 dark:!text-slate-300"
                        >
                          No clients found
                        </Title>
                        <Text className="dark:text-slate-400">
                          Start by adding your first client
                        </Text>
                        <br />
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => console.log("Add first client")}
                          style={{ marginTop: "16px" }}
                        >
                          Add First Client
                        </Button>
                      </div>
                    ),
                  }}
                />
              </Card>

              {/* Confirmation Modal */}
              <ConfirmationModal
                visible={isModalOpen}
                entityName={selectedClient?.fullName || ""}
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
