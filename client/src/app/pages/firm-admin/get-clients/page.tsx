"use client";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useAppSelector } from "@/app/store/hooks";
import { RootState } from "@/app/store/store";
import {
  BankOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShopOutlined,
  TeamOutlined,
  UserAddOutlined,
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
// import { getClients, deleteClient } from "@/app/service/adminAPI";
// import { Client } from "@/app/types/client";
const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;
// import { setClients } from "@/app/store/clientSlice";
import { getAllClients, deleteClient } from "@/app/service/adminAPI";
import { useAppDispatch } from "@/app/store/hooks";
import { setClients } from "@/app/store/clientSlice";
import { Client } from "@/app/types/client";
import { toast } from "react-hot-toast";

export default function GetClients() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.user.user);
  const firmId = user?.firmId;
  const [clients, setClientsData] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deletingClientId, setDeletingClientId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientTypeFilter, setClientTypeFilter] = useState<string>("all");

  useEffect(() => {
    filterClients();
  }, [clients, searchText, statusFilter, clientTypeFilter]);

  // Mock data - replace with actual API call

  /**Get All Clients API */
  const fetchClients = async (firmId: number) => {
    try {
      setLoading(true);
      const response = await getAllClients(firmId);
      setClientsData(response);
      dispatch(setClients(response))
      toast.success("Fetch clients successfully");
      console.log("Successfully fetched clients data:", response);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to fetch clients data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (firmId) {
      setClientsData([]);
      fetchClients(firmId);
    }
  }, [firmId]);

  const filterClients = () => {
    let filtered = clients;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (client) =>
          client.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
          client.email.toLowerCase().includes(searchText.toLowerCase()) ||
          client.organization
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          client.phone.includes(searchText)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (client) => client.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by client type
    if (clientTypeFilter !== "all") {
      filtered = filtered.filter(
        (client) =>
          client.clientType.toLowerCase() === clientTypeFilter.toLowerCase()
      );
    }

    setFilteredClients(filtered);
  };

  /**Handle delete function */
  const handleDeleteClient = async (clientId: number) => {
    try {
      setDeleting(true);
      setDeletingClientId(clientId);

      await deleteClient(clientId);
      setClientsData((prevLawyers) =>
        prevLawyers.filter((client) => client.id !== clientId)
      );
      toast.success("Lawyer deleted successfully");
      message.success("Lawyer deleted successfully");
    } catch (error) {
      console.error("Error deleting lawyer:", error);
      toast.error("Failed to delete lawyer");
      message.error("Failed to delete lawyer");
    } finally {
      setDeleting(false);
      setDeletingClientId(null);
    }
  };

  const getClientTypeIcon = (type: string) => {
    switch (type) {
      case "Individual":
        return <UserOutlined />;
      case "Business":
        return <ShopOutlined />;
      case "Corporate":
        return <BankOutlined />;
      default:
        return <UserOutlined />;
    }
  };

  const getClientTypeColor = (type: string) => {
    switch (type) {
      case "Individual":
        return "#059669";
      case "Business":
        return "#2563eb";
      case "Corporate":
        return "#7c3aed";
      default:
        return "#6b7280";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "#059669";
      case "past":
        return "#6b7280";
      case "potential":
        return "#f59e0b";
      case "suspended":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  const getStatusBadgeStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "success";
      case "past":
        return "default";
      case "potential":
        return "warning";
      case "suspended":
        return "error";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Client",
      dataIndex: "fullName",
      key: "fullName",
      render: (name: string, record: Client) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar
            size={48}
            src={
              record.profileImage
                ? `http://localhost:5000${record.profileImage}`
                : undefined
            }
            style={{
              background: record.profileImage ? "transparent" : "#f1f5f9",
              border: "2px solid #e5e7eb",
              color: record.profileImage
                ? "transparent"
                : getClientTypeColor(record.clientType),
              flexShrink: 0, // Prevent avatar from shrinking
            }}
          >
            {!record.profileImage && getClientTypeIcon(record.clientType)}
          </Avatar>
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
              {name}
            </Text>
            <Space size="small">
              <MailOutlined style={{ color: "#9ca3af", fontSize: "12px" }} />
              <Text
                style={{ fontSize: "13px", color: "#64748b" }}
                ellipsis={{ tooltip: true }}
              >
                {record.email}
              </Text>
            </Space>
            {record.organization && (
              <div>
                <Text
                  style={{ fontSize: "12px", color: "#9ca3af" }}
                  ellipsis={{ tooltip: true }}
                >
                  {record.organization}
                </Text>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (record: Client) => (
        <Space direction="vertical" size="small">
          <Space size="small">
            <PhoneOutlined style={{ color: "#9ca3af", fontSize: "12px" }} />
            <Text style={{ fontSize: "13px", color: "#374151" }}>
              {record.phone}
            </Text>
          </Space>
          {record.address && (
            <Space size="small">
              <EnvironmentOutlined
                style={{ color: "#9ca3af", fontSize: "12px" }}
              />
              <Text
                style={{ fontSize: "12px", color: "#64748b" }}
                ellipsis={{ tooltip: record.address }}
              >
                {record.address.length > 30
                  ? `${record.address.substring(0, 30)}...`
                  : record.address}
              </Text>
            </Space>
          )}
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "clientType",
      key: "clientType",
      render: (type: string) => (
        <Tag
          color={`${getClientTypeColor(type)}20`}
          style={{
            color: getClientTypeColor(type),
            border: `1px solid ${getClientTypeColor(type)}40`,
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
          {getClientTypeIcon(type)}
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
      title: "Financial",
      key: "financial",
      render: (record: Client) => {
        const balance = Number(record.outstandingBalance) || 0;

        return (
          <Space direction="vertical" size="small">
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <DollarOutlined style={{ color: "#9ca3af", fontSize: "12px" }} />
              <Text
                style={{
                  fontSize: "13px",
                  color: balance > 0 ? "#dc2626" : "#059669",
                  fontWeight: "500",
                }}
              >
                ${formatCurrency(balance)}
              </Text>
            </div>
            <Text style={{ fontSize: "12px", color: "#64748b" }}>
              Cases: {record.casesCount || 0}
            </Text>
          </Space>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Client) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() =>
                router.push(`/pages/firm-admin/get-client-detail/${record.id}`)
              }
              style={{ borderRadius: "6px" }}
            />
          </Tooltip>
          <Tooltip title="Edit Client">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() =>
                router.push(`/pages/firm-admin/edit-client/${record.id}`)
              }
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
                handleDeleteClient(record.id);
              }}
              loading={deleting && deletingClientId === record.id}
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

  const activeClients = clients.filter(
    (client) => client.status.toLowerCase() === "active"
  );
  const potentialClients = clients.filter(
    (client) => client.status.toLowerCase() === "potential"
  );
  const formatCurrency = (amount: number | undefined | null): string => {
    const num = Number(amount) || 0;
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Fix 2: Update the totalOutstanding calculation
  const totalOutstanding = clients.reduce(
    (sum, client) => sum + (Number(client.outstandingBalance) || 0),
    0
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DashboardLayout>
        <div className="min-h-screen p-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 [&_.ant-typography]:dark:!text-white [&_.ant-card-head-title]:dark:!text-white">
          <div className="max-w-[1400px] mx-auto">
            {/* Header Section */}
            <Card
              className="bg-emerald-600 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
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
                        Client Management
                      </Title>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "18px",
                          fontWeight: "400",
                        }}
                      >
                        Manage your firms clients and their legal matters
                      </Text>
                    </div>
                  </Space>
                </Col>
                <Col className="pt-7">
                  <Space size="middle">
                    <Button
                      type="primary"
                      size="large"
                      icon={<UserAddOutlined />}
                      onClick={() =>
                        router.push("/pages/firm-admin/create-client")
                      }
                      style={{
                        background: "white",
                        borderColor: "white",
                        color: "#059669",
                        borderRadius: "12px",
                        fontWeight: "600",
                        padding: "8px 24px",
                        height: "48px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    >
                      Add New Client
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
                      <UserOutlined className="text-emerald-600 dark:text-emerald-400 text-3xl mr-1" />
                    }
                    className="text-emerald-600 dark:text-emerald-600 [&_.ant-statistic-content-value]:dark:!text-emerald-600"
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
                        Potential Clients
                      </span>
                    }
                    value={potentialClients.length}
                    valueStyle={{
                      fontSize: "32px",
                      fontWeight: "700",
                      lineHeight: "1",
                      color: "inherit",
                    }}
                    prefix={
                      <TeamOutlined className="text-amber-600 dark:text-amber-400 text-3xl mr-1" />
                    }
                    className="text-amber-600 dark:text-amber-600 [&_.ant-statistic-content-value]:dark:!text-amber-600"
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
                        Outstanding
                      </span>
                    }
                    value={formatCurrency(totalOutstanding)}
                    prefix="$"
                    valueStyle={{
                      fontSize: "32px",
                      fontWeight: "700",
                      lineHeight: "1",
                      color: "inherit",
                    }}
                    className="text-red-600 dark:text-red-600 [&_.ant-statistic-content-value]:dark:!text-red-600"
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
                    placeholder="Search clients by name, email, or organization"
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
                    <Option value="Active">Active</Option>
                    <Option value="Past">Past</Option>
                    <Option value="Potential">Potential</Option>
                    <Option value="Suspended">Suspended</Option>
                  </Select>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Select
                    placeholder="Filter by Type"
                    value={clientTypeFilter}
                    onChange={setClientTypeFilter}
                    size="large"
                    className="w-full [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:dark:!bg-slate-900 [&_.ant-select-selector]:dark:!border-slate-600 [&_.ant-select-selector]:dark:!text-white"
                  >
                    <Option value="all">All Types</Option>
                    <Option value="Individual">Individual</Option>
                    <Option value="Business">Business</Option>
                    <Option value="Corporate">Corporate</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Space>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => firmId && fetchClients(firmId)}
                      loading={loading}
                      className="rounded-xl border border-slate-300 dark:border-slate-600 dark:text-white 
                                 !bg-transparent hover:!bg-transparent active:!bg-transparent focus:!bg-transparent"
                    >
                      Refresh
                    </Button>
                    <Text className="text-slate-500 dark:text-slate-400 text-sm">
                      Showing {filteredClients.length} of {clients.length}{" "}
                      clients
                    </Text>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Clients Table */}
            <Card
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm transition-colors duration-300"
              bodyStyle={{ padding: 0 }}
            >
              <Table
                columns={columns}
                dataSource={filteredClients}
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
                      <UserOutlined
                        style={{ fontSize: "48px", marginBottom: "16px" }}
                      />
                      <Title
                        level={4}
                        className="!text-slate-500 dark:!text-slate-300"
                      >
                        No clients found
                      </Title>
                      <Text className="dark:text-slate-400">
                        Start by adding your first client to the firm
                      </Text>
                      <br />
                      <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={() =>
                          router.push("/pages/firm-admin/create-client")
                        }
                        style={{ marginTop: "16px" }}
                      >
                        Add First Client
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
