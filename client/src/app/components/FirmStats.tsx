"use client";

import { useEffect } from "react";
import { Card, Row, Col, Spin, Typography } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  FileOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { getStats } from "../service/adminAPI";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setFirm, setError, setLoading } from "../store/firmSlice";

const { Title, Text } = Typography;

export default function FirmStats({ firmId }: { firmId: string }) {
  const dispatch = useAppDispatch();
  const { firms, loading, error } = useAppSelector((state) => state.firm);

  const stats = firms.find((f) => f.firmId === Number(firmId));

  useEffect(() => {
    const fetchStats = async () => {
      try {
        dispatch(setLoading(true));
        const data = await getStats(firmId);
        dispatch(setFirm(data));
        dispatch(setError(null));
      } catch (err) {
        console.log("Error is:", err)
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchStats();
  }, [dispatch, firmId]);

  if (loading)
    return (
      <Spin size="large" style={{ display: "block", margin: "50px auto" }} />
    );
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!stats) return <p>No stats found.</p>;

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>Firm Dashboard: {stats.firmName}</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <UserOutlined style={{ fontSize: 24, color: "#1890ff" }} />
            <Title level={4}>{stats.lawyersCount}</Title>
            <Text>Lawyers</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <TeamOutlined style={{ fontSize: 24, color: "#52c41a" }} />
            <Title level={4}>{stats.clientsCount}</Title>
            <Text>Clients</Text>
          </Card>
        </Col>

        {stats.casesCount !== undefined && (
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <FileOutlined style={{ fontSize: 24, color: "#faad14" }} />
              <Title level={4}>{stats.casesCount}</Title>
              <Text>Cases</Text>
            </Card>
          </Col>
        )}

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <CheckCircleOutlined style={{ fontSize: 24, color: "#13c2c2" }} />
            <Title level={4}>
              {stats.activeLawyersCount + stats.clientsCount}
            </Title>
            <Text>Active Users</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <CloseCircleOutlined style={{ fontSize: 24, color: "#ff4d4f" }} />
            <Title level={4}>{stats.stats.inactiveUsers}</Title>
            <Text>Inactive Users</Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
