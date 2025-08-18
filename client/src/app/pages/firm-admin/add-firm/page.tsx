"use client";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  InputNumber,
  Typography,
  Card,
} from "antd";
import {
  BankOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { toast } from "react-hot-toast";
import { createFirm } from "@/app/service/adminAPI";
import { FirmPayload } from "@/app/types/firm";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { addFirm } from "@/app/store/firmSlice";

const { Option } = Select;

interface FormValues {
  firmName: string;
  firmEmail: string;
  firmPhone: string;
  address: string;
  subscriptionPlan: string;
  maxUsers: number;
  maxCases: number;
}

export default function AddFirm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [form] = Form.useForm<FormValues>();
  const [isHovered, setIsHovered] = useState(false);

  // State values
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [subscription_plan, setSubscriptionPlan] = useState("Free");
  const [maxUsers, setMaxUsers] = useState(0);
  const [maxCases, setMaxCases] = useState(0);
  const [subdomain, setSubdomain] = useState("");

  const handleCreateFirm = async () => {
    try {
      const payload: FirmPayload = {
        name,
        email,
        phone,
        address,
        subscription_plan: subscription_plan as "Free" | "Basic" | "Premium",
        max_users: maxUsers,
        max_cases: maxCases,
      };

      const response = await createFirm(payload);
      if (!response) {
        toast.error("Failed to create firm");
        return;
      }

      dispatch(addFirm(response?.data?.newFirm));
      toast.success("Firm created successfully!");
      router.push("/pages/super-admin/get-firms");

      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setSubscriptionPlan("Free");
      setMaxUsers(0);
      setMaxCases(0);
    } catch (err) {
      toast.error("Something went wrong while creating the firm");
      console.log("Error creating firm:", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto">
        {/* Form Card */}
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
            ADD NEW LAW FIRM
          </Typography.Title>

          <Form<FormValues>
            form={form}
            layout="vertical"
            onFinish={handleCreateFirm}
            initialValues={{ subscriptionPlan: "Free" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              {/* Firm Name */}
              <Form.Item
                label="Firm Name"
                name="firmName"
                rules={[{ required: true, message: "Please enter firm name" }]}
              >
                <Input
                  prefix={<BankOutlined />}
                  placeholder="Enter firm name"
                  value={name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setName(value);
                    setSubdomain(value.toLowerCase().replace(/\s+/g, "-")); // ✅ auto-generate
                  }}
                  className="p-2"
                />
              </Form.Item>

              {/* showing the sub domain */}
              <Form.Item label="Firm Subdomain">
                <Input value={subdomain} readOnly className="p-2" />
              </Form.Item>

              {/* Firm Email */}
              <Form.Item
                label="Firm Email"
                name="firmEmail"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "Enter a valid email",
                  },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Enter firm email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-2"
                />
              </Form.Item>

              {/* Firm Phone */}
              <Form.Item
                label="Firm Phone"
                name="firmPhone"
                rules={[
                  { required: true, message: "Please enter phone number" },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="p-2"
                />
              </Form.Item>

              {/* Address */}
              <Form.Item
                label="Address"
                name="address"
                rules={[{ required: true, message: "Please enter address" }]}
              >
                <Input
                  prefix={<EnvironmentOutlined />}
                  placeholder="Enter address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="p-2"
                />
              </Form.Item>

              {/* Subscription Plan */}
              <Form.Item
                label="Subscription Plan"
                name="subscriptionPlan"
                rules={[{ required: true, message: "Please select a plan" }]}
              >
                <Select
                  placeholder="Select plan"
                  value={subscription_plan}
                  onChange={(value) => setSubscriptionPlan(value)}
                  size="large"
                >
                  <Option value="Free">Free</Option>
                  <Option value="Basic">Basic</Option>
                  <Option value="Premium">Premium</Option>
                </Select>
              </Form.Item>

              {/* Max Users */}
              <Form.Item
                label="Max Users"
                name="maxUsers"
                rules={[{ required: true, message: "Please enter max users" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={1}
                  value={maxUsers}
                  onChange={(value) => setMaxUsers(value ?? 0)}
                  className="p-1"
                />
              </Form.Item>

              {/* Max Cases */}
              <Form.Item
                label="Max Cases"
                name="maxCases"
                rules={[{ required: true, message: "Please enter max cases" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={1}
                  value={maxCases}
                  onChange={(value) => setMaxCases(value ?? 0)}
                  className="p-1"
                />
              </Form.Item>
            </div>

            {/* Submit Button */}
            <Form.Item style={{ textAlign: "center", marginTop: "20px" }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{
                  backgroundColor: isHovered ? "#2F486C" : "#1E2E45",
                  borderRadius: "8px",
                  padding: "25px 80px",
                  fontSize: "18px",
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                ADD LAW FIRM
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
