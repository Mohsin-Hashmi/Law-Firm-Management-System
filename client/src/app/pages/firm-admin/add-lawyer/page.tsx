"use client";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useState } from "react";
import { Form, Input, Select, Button, Typography, Card, Spin } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { addLawyer } from "@/app/service/adminAPI";

const { Option } = Select;

interface FormValues {
  name: string;
  email: string;
  phone: string;
  specialization?: string;
  status: "Active" | "Inactive";
  profileImage?: File | null;
}

interface AddLawyerProps {
  firmId: string;
}

export default function AddLawyer({ firmId }: AddLawyerProps) {
  const router = useRouter();
  const [form] = Form.useForm<FormValues>();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Preview image before submit
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleCreateLawyer = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      if (specialization) formData.append("specialization", specialization);
      formData.append("status", status);
      if (profileImage) formData.append("profileImage", profileImage);

      const response = await addLawyer(firmId, formData);

      if (!response) {
        toast.error("Failed to create lawyer");
        return;
      }

      toast.success("Lawyer created successfully!");
      router.push("/pages/firm-admin/lawyers");

      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setSpecialization("");
      setStatus("Active");
      setProfileImage(null);
      setPreviewUrl(null);
      form.resetFields();
    } catch (err) {
      toast.error("Something went wrong while creating the lawyer");
      console.error("Error creating lawyer:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto">
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.45)",
          }}
        >
          <Typography.Title
            level={2}
            style={{ textAlign: "center", color: "#1E2E45", fontSize: "40px" }}
          >
            ADD NEW LAWYER
          </Typography.Title>

          <Form<FormValues>
            form={form}
            layout="vertical"
            onFinish={handleCreateLawyer}
            initialValues={{ status: "Active" }}
          >
            {loading && (
              <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
                <Spin tip="Adding Lawyer..." size="large" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lawyer Name */}
              <Form.Item
                label="Lawyer Name"
                name="name"
                rules={[{ required: true, message: "Please enter lawyer name" }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter lawyer name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="p-2"
                />
              </Form.Item>

              {/* Email */}
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, type: "email", message: "Enter a valid email" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-2"
                />
              </Form.Item>

              {/* Phone */}
              <Form.Item
                label="Phone"
                name="phone"
                rules={[{ required: true, message: "Please enter phone number" }]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="p-2"
                />
              </Form.Item>

              {/* Specialization */}
              <Form.Item label="Specialization" name="specialization">
                <Input
                  prefix={<ProfileOutlined />}
                  placeholder="Enter specialization"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="p-2"
                />
              </Form.Item>

              {/* Status */}
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select
                  value={status}
                  onChange={(value) => setStatus(value)}
                  size="large"
                >
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">Inactive</Option>
                </Select>
              </Form.Item>

              {/* Profile Image Upload */}
              <Form.Item label="Profile Image">
                <Input type="file" accept="image/*" onChange={handleImageChange} />
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mt-2 rounded-md"
                    style={{ width: "120px" }}
                  />
                )}
              </Form.Item>
            </div>

            <Form.Item className="text-center mt-6">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{
                  backgroundColor: isHovered ? "#2F486C" : "#1E2E45",
                  borderRadius: "8px",
                  padding: "20px 80px",
                  fontSize: "18px",
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                ADD LAWYER
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
