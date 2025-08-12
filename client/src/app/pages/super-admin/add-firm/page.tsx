"use client";
import HeaderPages from "../../../components/HeaderPages";
import Footer from "../../../components/Footer";
import { useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  InputNumber,
  DatePicker,
  Typography,
  Card,
} from "antd";
import {
  BankOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  AppstoreAddOutlined,
  StopOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import SizeContext from "antd/es/config-provider/SizeContext";
import {toast} from 'react-toastify';
const { Option } = Select;

interface FormValues {
  firmName: string;
  firmEmail: string;
  firmPhone: string;
  address: string;
  subscriptionPlan: string;
  maxUsers: number;
  maxCases: number;
  status: string;
  billingInfo: string;
  trialEndsAt: Dayjs;
}

import { createFirm } from "@/app/service/superAdminAPI";
import { FirmPayload } from "@/app/types/firm";
import { useRouter } from "next/navigation";

export default function AddFirm() {
  const router= useRouter();
  const [form] = Form.useForm<FormValues>();
  const [isHovered, setIsHovered] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [subscriptionPlan, setSubscriptionPlan] = useState("Free");
  const [maxUsers, setMaxUsers] = useState(0);
  const [maxCases, setMaxCases] = useState(0);
  const [status, setStatus] = useState("Active");
  const [billingCardNumber, setBillingCardNumber] = useState("");
  const [billingExpiry, setBillingExpiry] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [trialEndsAt, setTrialEndsAt] = useState<Dayjs | null>(null);


  // Handle form submission 
  const handleCreateFirm = async () => {
   
    try {
      const payload: FirmPayload = {
        name,
        email,
        phone,
        address,
        subscription_plan: subscriptionPlan as "Free" | "Basic" | "Premium",
        max_users: maxUsers,
        max_cases: maxCases,
        status: status as "Active" | "Suspended" | "Cancelled",
        billing_info: {
          card_number: billingCardNumber,
          expiry: billingExpiry,
          billing_address: billingAddress,
        },
        trial_ends_at: trialEndsAt
          ? trialEndsAt.format("YYYY-MM-DD")
          : undefined,
      };

      const response = await createFirm(payload);
      if (!response) {
        console.log("Error occur in create firm api");
      }
      console.log("create firm successfully", response.data.newFirm);
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setSubscriptionPlan("");
      toast.success("Firm created successfully!");
      router.push("/pages/super-admin/get-firms");
      
    } catch (err) {
      console.log("Error in created frim" + err);
    }
  };

  return (
    <>
      <HeaderPages />
      <section>
        <div className="container" style={{ margin: "40px auto 0 auto", background: "#f5f5f5" }}>
          <Card
            style={{
              maxWidth: 1000,
              margin: "0 auto",
              borderRadius: "12px",
            }}
          >
            <Typography.Title
              level={2}
              style={{
                textAlign: "center",
                color: "#1E2E45",
                fontSize: "40px",
              }}
            >
              ADD LAW FIRM
            </Typography.Title>

            <Form<FormValues>
              form={form}
              layout="vertical"
              onFinish={handleCreateFirm}
              initialValues={{
                subscriptionPlan: "Free",
                status: "Active",
                trialEndsAt: dayjs(),
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <Form.Item
                  label="Firm Name"
                  name="firmName"
                  rules={[
                    { required: true, message: "Please enter firm name" },
                  ]}
                >
                  <Input
                    prefix={<BankOutlined />}
                    className="p-3"
                    placeholder="Enter firm name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Item>

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
                    className="p-3"
                    placeholder="Enter firm email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Item>

                <Form.Item
                  label="Firm Phone"
                  name="firmPhone"
                  rules={[
                    { required: true, message: "Please enter phone number" },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    className="p-3"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Form.Item>

                <Form.Item
                  label="Address"
                  name="address"
                  rules={[{ required: true, message: "Please enter address" }]}
                >
                  <Input
                    prefix={<EnvironmentOutlined />}
                    className="p-3"
                    placeholder="Enter address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </Form.Item>

                <Form.Item
                  label="Subscription Plan"
                  name="subscriptionPlan"
                  rules={[{ required: true, message: "Please select a plan" }]}
                >
                  <Select
                    suffixIcon={<AppstoreAddOutlined />}
                    placeholder="Select plan"
                    value={subscriptionPlan}
                    onChange={(value) => setSubscriptionPlan(value)}
                  >
                    <Option value="Free">Free</Option>
                    <Option value="Basic">Basic</Option>
                    <Option value="Premium">Premium</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Max Users"
                  name="maxUsers"
                  rules={[
                    { required: true, message: "Please enter max users" },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={1}
                    className="p-3"
                    placeholder="Enter max users"
                    value={maxUsers}
                    onChange={(value) => setMaxUsers(value ?? 0)}
                  />
                </Form.Item>

                <Form.Item
                  label="Max Cases"
                  name="maxCases"
                  rules={[
                    { required: true, message: "Please enter max cases" },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={1}
                    className="p-3"
                    placeholder="Enter max cases"
                    value={maxCases}
                    onChange={(value) => setMaxCases(value ?? 0)}
                  />
                </Form.Item>

                <Form.Item
                  label="Status"
                  name="status"
                  rules={[{ required: true, message: "Please select status" }]}
                  
                >
                  <Select
                    suffixIcon={<StopOutlined />}
                    placeholder="Select status"
                    value={status}
                     onChange={(value) => setStatus(value)}
                  >
                    <Option value="Active">Active</Option>
                    <Option value="Suspended">Suspended</Option>
                    <Option value="Cancelled">Cancelled</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Billing Info"
                  name="billingInfo"
                  rules={[
                    { required: true, message: "Please enter billing info" },
                  ]}
                >
                  <Input
                    prefix={<CreditCardOutlined />}
                    className="p-3"
                    placeholder="Enter billing info"
                  />
                </Form.Item>

                <Form.Item
                  label="Trial Ends At"
                  name="trialEndsAt"
                  rules={[
                    { required: true, message: "Please select trial end date" },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="YYYY-MM-DD"
                    className="p-3"
                    suffixIcon={<CalendarOutlined />}
                    value={trialEndsAt}
                    onChange={(value) => setTrialEndsAt(value)}
                  />
                </Form.Item>
              </div>

              <Form.Item style={{ textAlign: "center", marginTop: "20px" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  style={{
                    backgroundColor: isHovered ? "#2F486C" : "#1E2E45",
                    borderRadius: "8px",
                    padding: "0 40px",
                  }}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  Add Law Firm
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </section>

      <Footer />
    </>
  );
}
