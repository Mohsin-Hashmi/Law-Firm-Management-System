"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
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
} from "@ant-design/icons";
import { getLawyers } from "@/app/service/adminAPI";
import { Lawyer } from "@/app/types/firm";

const { Title, Text } = Typography;
const { Option } = Select;



export default function GetLawyers() {
  const router = useRouter();
  const params = useParams();
  
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [filteredLawyers, setFilteredLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specializationFilter, setSpecializationFilter] = useState<string>("all");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);

  useEffect(() => {
    fetchLawyers();
  }, []);

  useEffect(() => {
    filterLawyers();
  }, [lawyers, searchText, statusFilter, specializationFilter]);

  const fetchLawyers = async () => {
    try {
      setLoading(true);
      const data = await getLawyers(); // Remove firmId parameter
      setLawyers(data);
    } catch (error) {
      console.error("Error fetching lawyers:", error);
      message.error("Failed to fetch lawyers data");
    } finally {
      setLoading(false);
    }
  };

  const filterLawyers = () => {
    let filtered = lawyers;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (lawyer) =>
          lawyer.name.toLowerCase().includes(searchText.toLowerCase()) ||
          lawyer.email.toLowerCase().includes(searchText.toLowerCase()) ||
          lawyer.specialization?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((lawyer) => lawyer.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Filter by specialization
    if (specializationFilter !== "all") {
      filtered = filtered.filter((lawyer) => lawyer.specialization.toLowerCase() === specializationFilter.toLowerCase());
    }

    setFilteredLawyers(filtered);
  };

  const handleDeleteLawyer = (lawyer: Lawyer) => {
    setSelectedLawyer(lawyer);
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    // Add your delete API call here
    message.success("Lawyer deleted successfully");
    setDeleteModalVisible(false);
    fetchLawyers();
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
        // Navigate to lawyer details page
        router.push(`/pages/firm-admin/get-lawyer-detail/${lawyer.id}`);
      },
    },
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Edit Lawyer",
      onClick: () => {
        // Navigate to edit page
        router.push(`/pages/firm-admin/edit-lawyer/${lawyer.id}`);
      },
    },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Delete Lawyer",
      onClick: () => handleDeleteLawyer(lawyer),
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
            src={record.profileImage ? `http://localhost:5000${record.profileImage}` : undefined}
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
                color: status.toLowerCase() === "active" ? "#059669" : "#dc2626",
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
      render: (_, record: Lawyer) => (
        <Space direction="vertical" size="small">
          <Text style={{ fontSize: "12px", color: "#64748b" }}>
            Cases: {(record as any).casesCount || 0}
          </Text>
          <Text style={{ fontSize: "12px", color: "#64748b" }}>
            Clients: {(record as any).clientsCount || 0}
          </Text>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record: Lawyer) => (
        <Dropdown
          menu={{
            items: getActionMenuItems(record),
          }}
          trigger={["click"]}
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            style={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          />
        </Dropdown>
      ),
    },
  ];

  const activeLawyers = lawyers.filter((lawyer) => lawyer.status.toLowerCase() === "active");
  const inactiveLawyers = lawyers.filter((lawyer) => lawyer.status.toLowerCase() === "inactive");

  return (
    <DashboardLayout>
      <div
        style={{
          background: "#f8fafc",
          minHeight: "100vh",
          padding: "24px",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          {/* Header Section */}
          <Card
            style={{
              marginBottom: "32px",
              background: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
              border: "none",
              borderRadius: "16px",
              boxShadow: "0 10px 25px rgba(30, 64, 175, 0.15)",
            }}
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
                    <TeamOutlined style={{ fontSize: "32px", color: "white" }} />
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
              <Col className="pt-7">
                <Space size="middle">
                  <Button
                    type="primary"
                    size="large"
                    icon={<UserAddOutlined />}
                    onClick={() => router.push("/pages/firm-admin/add-lawyer")}
                    style={{
                      background: "white",
                      borderColor: "white",
                      color: "#1e40af",
                      borderRadius: "12px",
                      fontWeight: "600",
                      padding: "8px 24px",
                      height: "48px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  >
                    Add New Lawyer
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
            <Col xs={24} sm={8} lg={6}>
              <Card
                style={{
                  borderRadius: "16px",
                  border: "1px solid #dbeafe",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                bodyStyle={{ padding: "24px" }}
              >
                <Statistic
                  title={
                    <span style={{ color: "#64748b", fontSize: "14px" }}>
                      Total Lawyers
                    </span>
                  }
                  value={lawyers.length}
                  valueStyle={{
                    color: "#1e40af",
                    fontSize: "32px",
                    fontWeight: "700",
                  }}
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8} lg={6}>
              <Card
                style={{
                  borderRadius: "16px",
                  border: "1px solid #d1fae5",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                bodyStyle={{ padding: "24px" }}
              >
                <Statistic
                  title={
                    <span style={{ color: "#64748b", fontSize: "14px" }}>
                      Active Lawyers
                    </span>
                  }
                  value={activeLawyers.length}
                  valueStyle={{
                    color: "#059669",
                    fontSize: "32px",
                    fontWeight: "700",
                  }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8} lg={6}>
              <Card
                style={{
                  borderRadius: "16px",
                  border: "1px solid #fecaca",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                bodyStyle={{ padding: "24px" }}
              >
                <Statistic
                  title={
                    <span style={{ color: "#64748b", fontSize: "14px" }}>
                      Inactive Lawyers
                    </span>
                  }
                  value={inactiveLawyers.length}
                  valueStyle={{
                    color: "#dc2626",
                    fontSize: "32px",
                    fontWeight: "700",
                  }}
                  prefix={<CloseCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8} lg={6}>
              <Card
                style={{
                  borderRadius: "16px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                bodyStyle={{ padding: "24px" }}
              >
                <Statistic
                  title={
                    <span style={{ color: "#64748b", fontSize: "14px" }}>
                      Specializations
                    </span>
                  }
                  value={getUniqueSpecializations().length}
                  valueStyle={{
                    color: "#7c3aed",
                    fontSize: "32px",
                    fontWeight: "700",
                  }}
                  prefix={<BankOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Filters and Search */}
          <Card
            style={{
              marginBottom: "24px",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
            bodyStyle={{ padding: "24px" }}
          >
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Input
                  placeholder="Search lawyers by name, email, or specialization"
                  prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{
                    borderRadius: "12px",
                    border: "1px solid #d1d5db",
                    padding: "12px 16px",
                    fontSize: "14px",
                  }}
                  size="large"
                />
              </Col>
              <Col xs={12} sm={6} md={4}>
                <Select
                  placeholder="Filter by Status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: "100%" }}
                  size="large"
                >
                  <Option value="all">All Status</Option>
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">Inactive</Option>
                </Select>
              </Col>
              <Col xs={12} sm={6} md={4}>
                <Select
                  placeholder="Filter by Specialization"
                  value={specializationFilter}
                  onChange={setSpecializationFilter}
                  style={{ width: "100%" }}
                  size="large"
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
                    onClick={fetchLawyers}
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #d1d5db",
                    }}
                  >
                    Refresh
                  </Button>
                  <Text style={{ color: "#64748b", fontSize: "14px" }}>
                    Showing {filteredLawyers.length} of {lawyers.length} lawyers
                  </Text>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Lawyers Table */}
          <Card
            style={{
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
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
                style: { marginRight: "24px", marginBottom: "16px" },
              }}
              style={{
                borderRadius: "16px",
                overflow: "hidden",
              }}
              locale={{
                emptyText: (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "48px",
                      color: "#64748b",
                    }}
                  >
                    <TeamOutlined
                      style={{ fontSize: "48px", marginBottom: "16px" }}
                    />
                    <Title level={4} style={{ color: "#64748b" }}>
                      No lawyers found
                    </Title>
                    <Text>
                      Start by adding your first lawyer to the firm
                    </Text>
                    <br />
                    <Button
                      type="primary"
                      icon={<UserAddOutlined />}
                      onClick={() =>
                        router.push("/pages/firm-admin/add-lawyer")
                      }
                      style={{ marginTop: "16px" }}
                    >
                      Add First Lawyer
                    </Button>
                  </div>
                ),
              }}
            />
          </Card>

          {/* Delete Confirmation Modal */}
          <Modal
            title={
              <Space>
                <DeleteOutlined style={{ color: "#dc2626" }} />
                <span>Confirm Delete</span>
              </Space>
            }
            open={deleteModalVisible}
            onCancel={() => setDeleteModalVisible(false)}
            footer={[
              <Button key="cancel" onClick={() => setDeleteModalVisible(false)}>
                Cancel
              </Button>,
              <Button key="delete" type="primary" danger onClick={confirmDelete}>
                Delete Lawyer
              </Button>,
            ]}
            centered
          >
            <div style={{ padding: "16px 0" }}>
              <Text style={{ fontSize: "16px" }}>
                Are you sure you want to delete{" "}
                <strong>{selectedLawyer?.name}</strong>? This action cannot be
                undone.
              </Text>
            </div>
          </Modal>
        </div>
      </div>
    </DashboardLayout>
  );
}