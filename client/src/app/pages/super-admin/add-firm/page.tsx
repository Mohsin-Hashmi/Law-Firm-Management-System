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
  const [form] = Form.useForm<FormValues>();
  const [isHovered, setIsHovered] = useState(false);
  const onFinish = (values: FormValues) => {
    console.log("Form Submitted:", values);
    // Here you can call your API with values
  };

  return (
    <>
      <HeaderPages />
      <div style={{ padding: "40px", background: "#f5f5f5" }}>
        <Card
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            borderRadius: "12px",
          }}
        >
          <Typography.Title
            level={2}
            style={{ textAlign: "center", color: "#1E2E45", fontSize: "40px" }}
          >
            ADD LAW FIRM
          </Typography.Title>

          <Form<FormValues>
            form={form}
            layout="vertical"
            onFinish={onFinish}
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
                rules={[{ required: true, message: "Please enter firm name" }]}
              >
                <Input
                  prefix={<BankOutlined />}
                  className="p-3"
                  placeholder="Enter firm name"
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
                >
                  <Option value="Free">Free</Option>
                  <Option value="Basic">Basic</Option>
                  <Option value="Premium">Premium</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Max Users"
                name="maxUsers"
                rules={[{ required: true, message: "Please enter max users" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={1}
                  className="p-3"
                  placeholder="Enter max users"
                />
              </Form.Item>

              <Form.Item
                label="Max Cases"
                name="maxCases"
                rules={[{ required: true, message: "Please enter max cases" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={1}
                  className="p-3"
                  placeholder="Enter max cases"
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
      <Footer />
    </>
  );
}
