"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { ThemeProvider } from "next-themes";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import { usePermission } from "@/app/hooks/usePermission";

import {
  Card,
  Row,
  Col,
  Button,
  Input,
  Select,
  Table,
  Typography,
  Space,
  Avatar,
  Badge,
  Spin,
  Divider,
  Statistic,
  Tag,
  Dropdown,
  Modal,
  message,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  UserAddOutlined,
  TeamOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  BankOutlined,
  ExportOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { getLawyers, deleteLawyer } from "@/app/service/adminAPI";
import { Lawyer } from "@/app/types/firm";
import { toast } from "react-hot-toast";

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;
import { useAppSelector } from "@/app/store/hooks";
import { RootState } from "@/app/store/store";
import { setLawyers } from "@/app/store/lawyerSlice";
import { useAppDispatch } from "@/app/store/hooks";

export default function GetLawyers() {
  const { hasPermission } = usePermission();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.user.user);
  const firmId = user?.firmId;
  const [lawyers, setLawyersData] = useState<Lawyer[]>([]);
  const [filteredLawyers, setFilteredLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deletingLawyerId, setDeletingLawyerId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specializationFilter, setSpecializationFilter] =
    useState<string>("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);

  useEffect(() => {
    filterLawyers();
  }, [lawyers, searchText, statusFilter, specializationFilter]);

  /**Get All Lawyers API */
  const fetchLawyers = async (firmId: number) => {
    try {
      setLoading(true);
      const response = await getLawyers(firmId);
      setLawyersData(response);
      dispatch(setLawyers(response));
      console.log("Successfully fetched lawyers data:", response);
    } catch (error) {
      console.error("Error fetching lawyers:", error);
      message.error("Failed to fetch lawyers data");
      // Set empty array on error to prevent infinite loading
      setLawyersData([]);
    } finally {
      // Ensure loading is always set to false
      setLoading(false);
    }
  };

  useEffect(() => {
    if (firmId) {
      // Clear previous data before fetching new data
      setLawyersData([]);
      setFilteredLawyers([]);
      fetchLawyers(firmId);
    } else {
      // If no firmId, stop loading
      setLoading(false);
    }
  }, [firmId]);

  const filterLawyers = () => {
    let filtered = lawyers;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (lawyer) =>
          lawyer.name.toLowerCase().includes(searchText.toLowerCase()) ||
          lawyer.email.toLowerCase().includes(searchText.toLowerCase()) ||
          lawyer.specialization
            ?.toLowerCase()
            .includes(searchText.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (lawyer) => lawyer.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by specialization
    if (specializationFilter !== "all") {
      filtered = filtered.filter(
        (lawyer) =>
          lawyer.specialization?.toLowerCase() ===
          specializationFilter.toLowerCase()
      );
    }

    setFilteredLawyers(filtered);
  };

  const handleOpenDeleteModal = (lawyer: Lawyer) => {
    setSelectedLawyer(lawyer);
    setModalVisible(true);
  };

  /**Handle delete function */
  const handleConfirmDelete = async () => {
    if (!selectedLawyer) return;
    try {
      setDeleting(true);
      setDeletingLawyerId(selectedLawyer.id);
      const response = await deleteLawyer(selectedLawyer.id);
      if (response.success) {
        setLawyersData((prev) =>
          prev.filter((l) => l.id !== selectedLawyer.id)
        );
        toast.success("Lawyer deleted successfully");
      } else {
        throw new Error(response.message || "Delete failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete lawyer");
    } finally {
      setDeleting(false);
      setDeletingLawyerId(null);
      setModalVisible(false);
      setSelectedLawyer(null);
    }
  };

  const getUniqueSpecializations = () => {
    const specializations = lawyers
      .map((lawyer) => lawyer.specialization)
      .filter((spec) => spec && spec.trim() !== "")
      .filter((value, index, self) => self.indexOf(value) === index);
    return specializations;
  };

  const getActionMenuItems = (lawyer: Lawyer) => [
    {
      key: "view",
      icon: <EyeOutlined />,
      label: "View Details",
      onClick: () => {
        console.log("View details clicked for:", lawyer.id);
        router.push(`/get-lawyer-detail/${lawyer.id}`);
      },
    },
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Edit Lawyer",
      onClick: () => {
        console.log("Edit clicked for:", lawyer.id);
        router.push(`/edit-lawyer/${lawyer.id}`);
      },
    },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Delete Lawyer",
      onClick: () => handleOpenDeleteModal(lawyer),
      danger: true,
    },
  ];

  const columns = [
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
                ? `http://localhost:5000${record.profileImage}`
                : undefined
            }
            style={{
              background: record.profileImage ? "transparent" : "#f1f5f9",
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
      title: "Contact",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string) => (
        <Space direction="vertical" size="small">
          <Space size="small">
            <PhoneOutlined style={{ color: "#9ca3af", fontSize: "12px" }} />
            <Text style={{ fontSize: "13px", color: "#374151" }}>{phone}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Specialization",
      dataIndex: "specialization",
      key: "specialization",
      render: (specialization: string) => (
        <Tag
          color="#f0f9ff"
          style={{
            color: "#1e40af",
            border: "1px solid #dbeafe",
            borderRadius: "8px",
            padding: "4px 12px",
            fontSize: "12px",
            fontWeight: "500",
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
      render: (status: string) => (
        <Badge
          status={status.toLowerCase() === "active" ? "success" : "error"}
          text={
            <span
              style={{
                fontSize: "13px",
                fontWeight: "500",
                color:
                  status.toLowerCase() === "active" ? "#059669" : "#dc2626",
              }}
            >
              {status}
            </span>
          }
        />
      ),
    },
    {
      title: "Performance",
      key: "performance",
      render: (_: unknown, record: Lawyer) => (
        <Space direction="vertical" size="small">
          <Text style={{ fontSize: "12px", color: "#64748b" }}>
            Cases: {record.casesCount || 0}
          </Text>
          <Text style={{ fontSize: "12px", color: "#64748b" }}>
            Clients: {record.clientsCount || 0}
          </Text>
        </Space>
      ),
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
              onClick={() => router.push(`/get-lawyer-detail/${record.id}`)}
              className="hover:!bg-blue-50 dark:text-gray-200 hover:!text-blue-600 dark:hover:!bg-blue-900/30 dark:hover:!text-blue-400"
              style={{ borderRadius: "6px" }}
            />
          </Tooltip>
          <Tooltip title="Edit Lawyer">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => router.push(`/edit-lawyer/${record.id}`)}
              className="hover:!bg-amber-50 dark:text-gray-200 hover:!text-amber-600 dark:hover:!bg-amber-900/30 dark:hover:!text-amber-400"
              style={{ borderRadius: "6px" }}
            />
          </Tooltip>
          {hasPermission("delete_lawyer") && (
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
          )}
        </Space>
      ),
    },
  ];

  const activeLawyers = lawyers.filter(
    (lawyer) => lawyer.status.toLowerCase() === "active"
  );
  const inactiveLawyers = lawyers.filter(
    (lawyer) => lawyer.status.toLowerCase() === "inactive"
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DashboardLayout>
        {loading ? (
          <div className="flex items-center justify-center min-h-screen ">
            <Spin size="large" />
          </div>
        ) : (
          <div className="min-h-screen transition-colors duration-300 [&_.ant-typography]:dark:!text-white [&_.ant-card-head-title]:dark:!text-white">
            <div className="max-w-full">
              {/* Header Section */}
              <Card
                className="bg-[#E43636]  dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
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
                          Legal Team
                        </Title>
                        <Text
                          style={{
                            color: "rgba(255,255,255,0.8)",
                            fontSize: "18px",
                            fontWeight: "400",
                          }}
                        >
                          Manage your firms attorneys and legal professionals
                        </Text>
                      </div>
                    </Space>
                  </Col>
                  <Col>
                    <Space size="middle">
                      {hasPermission("create_lawyer") && (
                        <Button
                          type="primary"
                          size="large"
                          icon={<UserAddOutlined />}
                          onClick={() => router.push("/add-lawyer")}
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
                          Add New Lawyer
                        </Button>
                      )}
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
                        <span className="text-slate-500 dark:text-white text-lg font-medium  mb-[15px] block">
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
                        <TeamOutlined className="text-blue-600 dark:text-blue-400 text-3xl g mr-1" />
                      }
                      className="text-blue-600 dark:text-blue-600 [&_.ant-statistic-content-value]:dark:!text-blue-60"
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
                      className="text-green-600 dark:text-green-500 [&_.ant-statistic-content-value]:dark:!text-green-500"
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
                      className="text-red-600 dark:text-red-600 [&_.ant-statistic-content-value]:dark:!text-red-600"
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
                      value={getUniqueSpecializations().length}
                      valueStyle={{
                        fontSize: "32px",
                        fontWeight: "700",
                        lineHeight: "1",
                        color: "inherit",
                      }}
                      prefix={
                        <BankOutlined className="text-purple-600 dark:text-purple-400 text-3xl mr-1" />
                      }
                      className="text-purple-600 dark:text-purple-500 [&_.ant-statistic-content-value]:dark:!text-purple-400"
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
                      placeholder="Search lawyers by name, email, or specialization"
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
                      <Option value="inactive">Inactive</Option>
                    </Select>
                  </Col>
                  <Col xs={12} sm={6} md={4}>
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
                      {getUniqueSpecializations().map((spec) => (
                        <Option key={spec} value={spec}>
                          {spec}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Space>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={() => firmId && fetchLawyers(firmId)}
                        loading={loading}
                        className="rounded-xl border border-slate-300 dark:border-slate-600 dark:text-white 
             !bg-transparent hover:!bg-transparent active:!bg-transparent focus:!bg-transparent"
                      >
                        Refresh
                      </Button>

                      <Text className="text-slate-500 dark:text-slate-400 text-sm">
                        Showing {filteredLawyers.length} of {lawyers.length}{" "}
                        lawyers
                      </Text>
                    </Space>
                  </Col>
                </Row>
              </Card>

              {/* Lawyers Table */}
              <Card
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm transition-colors duration-300"
                bodyStyle={{ padding: 0 }}
              >
                <Table
                  columns={columns}
                  dataSource={filteredLawyers}
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
                        <TeamOutlined
                          style={{ fontSize: "48px", marginBottom: "16px" }}
                        />
                        <Title
                          level={4}
                          className="!text-slate-500 dark:!text-slate-300"
                        >
                          No lawyers found
                        </Title>
                        <Text className="dark:text-slate-400">
                          Start by adding your first lawyer to the firm
                        </Text>
                        <br />
                        <Button
                          type="primary"
                          icon={<UserAddOutlined />}
                          onClick={() => router.push("/add-lawyer")}
                          style={{ marginTop: "16px" }}
                        >
                          Add First Lawyer
                        </Button>
                      </div>
                    ),
                  }}
                />
              </Card>

              {/* Confirmation Modal */}
              <ConfirmationModal
                visible={modalVisible}
                entityName={selectedLawyer?.name || ""}
                action="delete"
                onConfirm={handleConfirmDelete}
                onCancel={() => setModalVisible(false)}
              />
            </div>
          </div>
        )}
      </DashboardLayout>
    </ThemeProvider>
  );
}
