"use client";

import HeaderPages from "../../../components/HeaderPages";
import Footer from "@/app/components/Footer";
import { getAllFirms, deleteFirm } from "@/app/service/superAdminAPI";
import { removeFirm, getFirms } from "@/app/store/firmSlice";
import { useState, useEffect } from "react";
import { Table, Spin, Typography, Button, Space, Tag } from "antd";
import { useAppDispatch } from "@/app/store/hooks";
import { toast } from "react-hot-toast";
import UpdateFirmModal from "../../../components/UpdateFirmModal";

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
  billing_info?: {
    card_number: string;
    expiry: string;
    billing_address: string;
  };
  trial_ends_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export default function GetFirms() {
  const dispatch = useAppDispatch();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFirm, setSelectedFirm] = useState(null);

  // Fetch all firms from API
  const fetchFirms = async () => {
    try {
      setLoading(true);
      const response = await getAllFirms();

      if (response.status === 200) {
        setFirms(response.data.firms);
        dispatch(getFirms(response.data.firms));
      } else {
        toast.error("Failed to load firms");
      }
    } catch (error) {
      toast.error("Something went wrong while loading firms");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFirms();
  }, []);
  // handle update firms from API
  const handleUpdate = (firm: Firm) => {
    console.log("Update clicked for:", firm);
  };
  // handle delete firms from API
  const handleDelete = async (id: number) => {
    setFirms((prev) => prev.filter((f) => f.id !== id));
    dispatch(removeFirm(id));
    try {
      await deleteFirm(id);
      toast.success("Firm deleted successfully");
    } catch (error) {
      toast.error("Failed to delete firm");
      console.error(error);
      fetchFirms();
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Address", dataIndex: "address", key: "address" },
    {
      title: "Subscription Plan",
      dataIndex: "subscription_plan",
      key: "subscription_plan",
      render: (plan: Firm["subscription_plan"]) => {
        const color =
          plan === "Premium" ? "gold" : plan === "Basic" ? "blue" : "green";
        return <Tag color={color}>{plan}</Tag>;
      },
    },
    { title: "Max Users", dataIndex: "max_users", key: "max_users" },
    { title: "Max Cases", dataIndex: "max_cases", key: "max_cases" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: Firm["status"]) => {
        const color =
          status === "Active"
            ? "green"
            : status === "Suspended"
            ? "orange"
            : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Trial Ends At",
      dataIndex: "trial_ends_at",
      key: "trial_ends_at",
      render: (date?: string | null) =>
        date ? new Date(date).toLocaleDateString() : "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Firm) => (
        <Space size="small">
          <Button type="primary" onClick={() => handleUpdate(record)}>
            Update
          </Button>
          <Button danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <HeaderPages />
      <section>
        <div className="container" style={{ padding: "20px" }}>
          <Typography.Title
            level={2}
            style={{
              textAlign: "center",
              color: "#1E2E45",
              fontSize: "40px",
              marginBottom: "30px",
            }}
          >
            ALL LAW FIRMS
          </Typography.Title>

          {loading ? (
            <Spin tip="Loading firms..." size="large" />
          ) : (
            <Table<Firm>
              dataSource={firms}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              bordered
              className="custom-firm-table"
              style={{
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
              }}
            />
          )}
        </div>
      </section>
      
      <Footer />
    </>
  );
}
