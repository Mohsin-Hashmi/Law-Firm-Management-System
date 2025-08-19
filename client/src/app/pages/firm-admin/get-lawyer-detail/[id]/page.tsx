"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Avatar,
  Spin,
  Button,
  Tag,
  Divider,
  message,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { getLawyerById } from "@/app/service/adminAPI";
import { Lawyer } from "@/app/types/firm";

const { Title, Text } = Typography;

export default function GetLawyerDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const lawyerId = params.id; // ✅ direct from Next.js params

  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lawyerId) fetchLawyerDetail();
  }, [lawyerId]);

  const fetchLawyerDetail = async () => {
    try {
      setLoading(true);
      const data = await getLawyerById(lawyerId);
      setLawyer(data);
    } catch (error) {
      console.error("Error fetching lawyer detail:", error);
      message.error("Failed to fetch lawyer detail");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!lawyer) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <Text type="secondary">No lawyer found</Text>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ }}>
        {/* Back button */}
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          style={{ marginBottom: "16px" }}
        >
          Back
        </Button>

        {/* Lawyer Detail Card */}
        <Card
          style={{
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
          bodyStyle={{ padding: "32px" }}
        >
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} sm={8} md={6} className="flex justify-center">
              <Avatar
                size={180}
                src={
                  lawyer.profileImage
                    ? `http://localhost:5000${lawyer.profileImage}`
                    : undefined
                }
                icon={!lawyer.profileImage && <UserOutlined />}
                style={{
                  background: lawyer.profileImage ? "transparent" : "#f1f5f9",
                  border: "2px solid #e5e7eb",
                }}
              />
            </Col>
            <Col xs={24} sm={16} md={18}>
              <Title level={2} style={{ marginBottom: "8px" }}>
                {lawyer.name}
              </Title>
              <Space direction="vertical" size="small">
                <Space>
                  <MailOutlined style={{ color: "#9ca3af" }} />
                  <Text>{lawyer.email}</Text>
                </Space>
                <Space>
                  <PhoneOutlined style={{ color: "#9ca3af" }} />
                  <Text>{lawyer.phone}</Text>
                </Space>
                <Space>
                  <BankOutlined style={{ color: "#9ca3af" }} />
                  <Tag
                    color="#f0f9ff"
                    style={{
                      color: "#1e40af",
                      border: "1px solid #dbeafe",
                      borderRadius: "8px",
                      padding: "4px 12px",
                      fontSize: "13px",
                    }}
                  >
                    {lawyer.specialization || "General Practice"}
                  </Tag>
                </Space>
                <Space>
                  {lawyer.status.toLowerCase() === "active" ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                      Active
                    </Tag>
                  ) : (
                    <Tag icon={<CloseCircleOutlined />} color="error">
                      Inactive
                    </Tag>
                  )}
                </Space>
              </Space>
            </Col>
          </Row>

          <Divider />

          {/* Extra Stats */}
          <Row gutter={24}>
            <Col xs={24} sm={12} md={8}>
              <Card bordered={false}>
                <Title level={4}>Cases</Title>
                <Text>{(lawyer as any).casesCount || 0}</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card bordered={false}>
                <Title level={4}>Clients</Title>
                <Text>{(lawyer as any).clientsCount || 0}</Text>
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
    </DashboardLayout>
  );
}
