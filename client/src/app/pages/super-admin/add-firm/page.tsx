"use client";

import HeaderPages from "../../../components/HeaderPages";
import Footer from "../../../components/Footer";
import { useState, useEffect } from "react";
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
import { toast } from "react-hot-toast";
import { createFirm } from "@/app/service/superAdminAPI";
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
  status: string;
  billingInfo: string;
  trialEndsAt: Dayjs;
}

export default function AddFirm() {
  const router = useRouter();
  const dispatch = useDispatch();
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

  // Initialize trialEndsAt on client
  useEffect(() => {
    setTrialEndsAt(dayjs());
  }, []);

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
      setStatus("Active");
      setBillingCardNumber("");
      setBillingExpiry("");
      setBillingAddress("");
      setTrialEndsAt(dayjs());
    } catch (err) {
      toast.error("Something went wrong while creating the firm");
      console.log("Error creating firm:", err);
    }
  };

  return (
    <>
      <HeaderPages />
      <section>
        <div className="container" style={{ margin: "40px auto" }}>
          <Card
            style={{
              maxWidth: 1000,
              margin: "0 auto",
              borderRadius: "12px",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.45)",
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
                    placeholder="Select status"
                    value={status}
                    onChange={(value) => setStatus(value)}
                  >
                    <Option value="Active">Active</Option>
                    <Option value="Suspended">Suspended</Option>
                    <Option value="Cancelled">Cancelled</Option>
                  </Select>
                </Form.Item>

                <Form.Item label="Card Number" name="cardNumber">
                  <Input
                    prefix={<CreditCardOutlined />}
                    placeholder="Enter card number"
                    value={billingCardNumber}
                    onChange={(e) => setBillingCardNumber(e.target.value)}
                  />
                </Form.Item>

                <Form.Item label="Expiry Date" name="expiryDate">
                  <DatePicker
                    style={{ width: "100%" }}
                    picker="month"
                    format="MM/YY"
                    value={billingExpiry ? dayjs(billingExpiry, "MM/YY") : null}
                    onChange={(date) =>
                      setBillingExpiry(date ? date.format("MM/YY") : "")
                    }
                  />
                </Form.Item>

                <Form.Item label="Billing Address" name="billingAddress">
                  <Input
                    prefix={<EnvironmentOutlined />}
                    placeholder="Enter billing address"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
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
