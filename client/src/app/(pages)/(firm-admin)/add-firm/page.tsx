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
  Progress,
  Divider,
  Space,
  Spin,
  Row,
  Col,
} from "antd";
import {
  BankOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CrownOutlined,
  TeamOutlined,
  FileTextOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  BuildOutlined,
} from "@ant-design/icons";
import { toast } from "react-hot-toast";
import { createFirm } from "@/app/service/adminAPI";
import { FirmPayload } from "@/app/types/firm";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setFirm } from "@/app/store/firmSlice";
import { addUser, addFirm } from "@/app/store/userSlice";
import { useAppSelector } from "@/app/store/hooks";
import { ThemeProvider } from "next-themes";

const { Option } = Select;
const { Title, Text } = Typography;

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
  
  const user = useAppSelector((state) => state.user?.user);
  console.log("Current user in AddFirm:", user);
  const router = useRouter();
  const dispatch = useDispatch();
  const [form] = Form.useForm<FormValues>();
  // State values
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [subscription_plan, setSubscriptionPlan] = useState("Free");
  const [maxUsers, setMaxUsers] = useState(1);
  const [maxCases, setMaxCases] = useState(5);
  const [subdomain, setSubdomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCreateFirm = async () => {
    try {
      setLoading(true);
      const payload: FirmPayload = {
        name,
        email,
        phone,
        address,
        subscription_plan: subscription_plan as "Free" | "Basic" | "Premium",
        max_users: maxUsers,
        max_cases: maxCases,
      };
      if (!user?.role) {
        toast.error("User role is missing. Cannot create firm.");
        return;
      }
      const response = await createFirm(payload, user.role);
      if (!response) {
        toast.error("Failed to create firm");
        return;
      }
      const newFirm = response?.data?.newFirm;

      dispatch(setFirm(newFirm));
      dispatch(
        addUser({
          ...user, // keep old user data
          firmId: newFirm.id, // attach new firmId
        })
      );
      dispatch(addFirm(newFirm));
      toast.success("Law firm created successfully!");
      router.push("/dashboard");

      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setSubscriptionPlan("Free");
      setMaxUsers(1);
      setMaxCases(5);
      setSubdomain("");
      form.resetFields();
    } catch (err) {
      toast.error("Something went wrong while creating the firm");
      console.log("Error creating firm:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFormProgress = () => {
    let progress = 0;
    if (name) progress += 20;
    if (email) progress += 20;
    if (phone) progress += 15;
    if (address) progress += 15;
    if (subscription_plan) progress += 15;
    if (maxUsers > 0) progress += 8;
    if (maxCases > 0) progress += 7;
    return progress;
  };

  const generateSubdomain = (firmName: string) => {
    return firmName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim();
  };

  const subscriptionPlans = [
    {
      value: "Free",
      label: "Free Plan",
      description: "Perfect for solo practitioners",
      features: ["Up to 3 users", "Up to 10 cases", "Basic support"],
      color: "#059669",
      icon: <CheckCircleOutlined />,
    },
    {
      value: "Basic",
      label: "Basic Plan",
      description: "Great for small firms",
      features: ["Up to 10 users", "Up to 50 cases", "Priority support"],
      color: "#2563eb",
      icon: <TeamOutlined />,
    },
    {
      value: "Premium",
      label: "Premium Plan",
      description: "For growing law firms",
      features: ["Unlimited users", "Unlimited cases", "24/7 support"],
      color: "#7c3aed",
      icon: <CrownOutlined />,
    },
  ];

  const getMaxLimitsForPlan = (plan: string) => {
    switch (plan) {
      case "Free":
        return { maxUsers: 3, maxCases: 10 };
      case "Basic":
        return { maxUsers: 10, maxCases: 50 };
      case "Premium":
        return { maxUsers: 100, maxCases: 1000 };
      default:
        return { maxUsers: 3, maxCases: 10 };
    }
  };

  const handlePlanChange = (plan: string) => {
    setSubscriptionPlan(plan);
    const limits = getMaxLimitsForPlan(plan);
    if (maxUsers > limits.maxUsers) setMaxUsers(limits.maxUsers);
    if (maxCases > limits.maxCases) setMaxCases(limits.maxCases);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DashboardLayout>
        <div className="min-h-screen  transition-colors duration-300 [&_.ant-typography]:dark:!text-white [&_.ant-card-head-title]:dark:!text-white">
          <div className="max-w-full">
            {/* Header Section */}
            <Card
              className="bg-[#D92C54] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
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
                      <BankOutlined
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
                        Add New Business
                      </Title>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "18px",
                          fontWeight: "400",
                        }}
                      >
                        Set up your law firms digital workspace with all
                        essential details
                      </Text>
                    </div>
                  </Space>
                </Col>
                <Col>
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.back()}
                    size="large"
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
                    Back
                  </Button>
                </Col>
              </Row>
            </Card>

            {/* Progress Card */}
            <Card
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
              bodyStyle={{ padding: "24px" }}
            >
              <div style={{ textAlign: "center" }}>
                <Text
                  className="text-[14px] text-[#232323] dark:text-[#9ca3af] font-[500]"
                  style={{
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  Setup Progress
                </Text>
                <Progress
                  percent={getFormProgress()}
                  strokeColor="#D92C54"
                  trailColor="#f1f5f9"
                  strokeWidth={8}
                  showInfo={false}
                />
              </div>
            </Card>

            {/* Main Form Card */}
            <Card
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
              bodyStyle={{ padding: "40px" }}
            >
              <Form<FormValues>
                form={form}
                layout="vertical"
                onFinish={handleCreateFirm}
                initialValues={{
                  subscriptionPlan: "Free",
                  maxUsers: 1,
                  maxCases: 5,
                }}
                size="large"
              >
                {loading && (
                  <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl text-center shadow-2xl border border-slate-200 dark:border-slate-700">
                      <div
                        style={{
                          width: "64px",
                          height: "64px",
                          background: "#f3f4f6",
                          borderRadius: "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 24px",
                        }}
                      >
                        <Spin size="large" />
                      </div>
                      <Title
                        level={3}
                        className="text-[#111827] dark:text-[#FFFFFF]"
                        style={{ marginBottom: "8px" }}
                      >
                        Creating Law Firm
                      </Title>
                      <Text
                        className="text-[#64748b] dark:text-[#9ca3af]"
                        style={{ fontSize: "16px" }}
                      >
                        Please wait while we set up your firms workspace...
                      </Text>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Firm Information Section */}
                  <div>
                    <div style={{ marginBottom: "24px" }}>
                      <Title
                        level={4}
                        className="text-[#374151] dark:text-[#FFFFFF]"
                        style={{
                          marginBottom: "4px",
                          fontSize: "18px",
                        }}
                      >
                        <BankOutlined
                          style={{ marginRight: "8px", color: "#1e40af" }}
                        />
                        Firm Information
                      </Title>
                      <Text
                        className="text-[#9ca3af] dark:text-[#6b7280]"
                        style={{ fontSize: "14px" }}
                      >
                        Basic details about your law firm
                      </Text>
                    </div>

                    <Form.Item
                      label={
                        <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                          Firm Name
                        </span>
                      }
                      name="firmName"
                      rules={[
                        { required: true, message: "Please enter firm name" },
                      ]}
                    >
                      <Input
                        prefix={<BankOutlined style={{ color: "#9ca3af" }} />}
                        placeholder="Enter your law firm's name"
                        value={name}
                        onChange={(e) => {
                          const value = e.target.value;
                          setName(value);
                          setSubdomain(generateSubdomain(value));
                        }}
                        className="dark:!bg-[#2A3441] dark:!text-white dark:!border-[#4B5563] dark:placeholder:!text-gray-300"
                        style={{
                          padding: "14px 16px",
                          border: "1px solid #d1d5db",
                          fontSize: "15px",
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                          Firm Subdomain
                        </span>
                      }
                    >
                      <Input
                        prefix={<GlobalOutlined style={{ color: "#9ca3af" }} />}
                        value={subdomain}
                        readOnly
                        placeholder="auto-generated from firm name"
                        className="dark:!bg-[#2A3441] dark:!text-white dark:!border-[#4B5563] dark:placeholder:!text-gray-300"
                        style={{
                          padding: "14px 16px",
                          border: "1px solid #d1d5db",
                          fontSize: "15px",
                        }}
                        suffix={
                          <Text
                            className="!text-[#232323]"
                            style={{ fontSize: "14px" }}
                          >
                            .lawfirm.com
                          </Text>
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                          Email Address
                        </span>
                      }
                      name="firmEmail"
                      rules={[
                        {
                          required: true,
                          type: "email",
                          message: "Enter a valid email address",
                        },
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
                        placeholder="contact@lawfirm.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="dark:!bg-[#2A3441] dark:!text-white dark:!border-[#4B5563] dark:placeholder:!text-gray-300"
                        style={{
                          padding: "14px 16px",
                          border: "1px solid #d1d5db",
                          fontSize: "15px",
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                          Phone Number
                        </span>
                      }
                      name="firmPhone"
                      rules={[
                        {
                          required: true,
                          message: "Please enter phone number",
                        },
                      ]}
                    >
                      <Input
                        prefix={<PhoneOutlined style={{ color: "#9ca3af" }} />}
                        placeholder="+1 (555) 123-4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="dark:!bg-[#2A3441] dark:!text-white dark:!border-[#4B5563] dark:placeholder:!text-gray-300"
                        style={{
                          padding: "14px 16px",
                          border: "1px solid #d1d5db",
                          fontSize: "15px",
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                          Business Address
                        </span>
                      }
                      name="address"
                      rules={[
                        { required: true, message: "Please enter address" },
                      ]}
                    >
                      <Input.TextArea
                        placeholder="Enter complete business address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3}
                        className="dark:!bg-[#2A3441] dark:!text-white dark:!border-[#4B5563] dark:placeholder:!text-gray-300"
                        style={{
                          border: "1px solid #d1d5db",
                          fontSize: "15px",
                        }}
                      />
                    </Form.Item>
                  </div>

                  {/* Subscription & Limits Section */}
                  <div>
                    <div style={{ marginBottom: "24px" }}>
                      <Title
                        level={4}
                        className="text-[#374151] dark:text-[#FFFFFF]"
                        style={{
                          marginBottom: "4px",
                          fontSize: "18px",
                        }}
                      >
                        <CrownOutlined
                          style={{ marginRight: "8px", color: "#1e40af" }}
                        />
                        Subscription & Limits
                      </Title>
                      <Text
                        className="text-[#9ca3af] dark:text-[#6b7280]"
                        style={{ fontSize: "14px" }}
                      >
                        Choose your plan and set operational limits
                      </Text>
                    </div>

                    <Form.Item
                      label={
                        <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                          Subscription Plan
                        </span>
                      }
                      name="subscriptionPlan"
                      rules={[
                        { required: true, message: "Please select a plan" },
                      ]}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        {subscriptionPlans.map((plan) => (
                          <div
                            key={plan.value}
                            onClick={() => handlePlanChange(plan.value)}
                            className="cursor-pointer transition-all duration-200 hover:shadow-md"
                            style={{
                              border:
                                subscription_plan === plan.value
                                  ? `2px solid ${plan.color}`
                                  : "1px solid #d1d5db",
                              borderRadius: "12px",
                              padding: "16px",
                              background:
                                subscription_plan === plan.value
                                  ? `${plan.color}08`
                                  : undefined,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                              }}
                            >
                              <div
                                style={{
                                  color: plan.color,
                                  fontSize: "20px",
                                }}
                              >
                                {plan.icon}
                              </div>
                              <div style={{ flex: 1 }}>
                                <Title
                                  level={5}
                                  className="text-[#374151] dark:text-[#FFFFFF]"
                                  style={{
                                    margin: 0,
                                    fontSize: "16px",
                                  }}
                                >
                                  {plan.label}
                                </Title>
                                <Text
                                  className="text-[#6b7280] dark:text-[#9ca3af]"
                                  style={{ fontSize: "14px" }}
                                >
                                  {plan.description}
                                </Text>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Form.Item>

                    <div style={{ display: "flex", gap: "16px" }}>
                      <Form.Item
                        label={
                          <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                            Max Users
                          </span>
                        }
                        name="maxUsers"
                        rules={[
                          { required: true, message: "Please enter max users" },
                        ]}
                        style={{ flex: 1 }}
                      >
                        <InputNumber
                          prefix={<TeamOutlined style={{ color: "#9ca3af" }} />}
                          className="dark:!bg-[#2A3441] dark:!text-white dark:!border-[#4B5563] [&_.ant-input-number-input]:dark:!bg-[#2A3441] [&_.ant-input-number-input]:dark:!text-white [&_.ant-input-number-input]:dark:!border-[#4B5563] dark:placeholder:text-[#9ca3af]"
                          style={{
                            width: "100%",
                            fontSize: "15px",
                          }}
                          min={1}
                          max={getMaxLimitsForPlan(subscription_plan).maxUsers}
                          value={maxUsers}
                          onChange={(value) => setMaxUsers(value ?? 1)}
                        />
                      </Form.Item>

                      <Form.Item
                        label={
                          <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                            Max Cases
                          </span>
                        }
                        name="maxCases"
                        rules={[
                          { required: true, message: "Please enter max cases" },
                        ]}
                        style={{ flex: 1 }}
                      >
                        <InputNumber
                          prefix={
                            <FileTextOutlined style={{ color: "#9ca3af" }} />
                          }
                          className="dark:!bg-[#2A3441] dark:!text-white dark:!border-[#4B5563] [&_.ant-input-number-input]:dark:!bg-[#2A3441] [&_.ant-input-number-input]:dark:!text-white [&_.ant-input-number-input]:dark:!border-[#4B5563] dark:placeholder:text-[#9ca3af]"
                          style={{
                            width: "100%",
                            fontSize: "15px",
                          }}
                          min={1}
                          max={getMaxLimitsForPlan(subscription_plan).maxCases}
                          value={maxCases}
                          onChange={(value) => setMaxCases(value ?? 1)}
                        />
                      </Form.Item>
                    </div>

                    {/* Plan Features */}
                    <div className="bg-gradient-to-br from-blue-50 via-blue-50/80 to-indigo-50/60 dark:from-slate-800/60 dark:via-slate-700/40 dark:to-slate-800/80 border border-blue-200/80 dark:border-slate-600/70 rounded-2xl p-6 mt-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                          <BuildOutlined className="text-blue-600 dark:text-blue-400 text-lg" />
                        </div>
                        <div>
                          <Title
                            level={4}
                            className="text-slate-800 dark:text-slate-100 !mb-0"
                            style={{
                              fontSize: "18px",
                              fontWeight: 600,
                              letterSpacing: "-0.025em",
                            }}
                          >
                            {
                              subscriptionPlans.find(
                                (p) => p.value === subscription_plan
                              )?.label
                            }
                          </Title>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-0">
                            Plan Features & Benefits
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {subscriptionPlans
                          .find((p) => p.value === subscription_plan)
                          ?.features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 group hover:bg-white/60 dark:hover:bg-slate-600/20 rounded-lg p-2 transition-colors duration-150"
                            >
                              <div className="flex items-center justify-center w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full mt-0.5 flex-shrink-0">
                                <svg
                                  className="w-3 h-3 text-green-600 dark:text-green-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                              <span className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed font-medium">
                                {feature}
                              </span>
                            </div>
                          ))}
                      </div>

                      <div className="mt-5 pt-4 border-t border-blue-200/50 dark:border-slate-600/50">
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          All features are included in your current plan
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Divider style={{ margin: "48px 0" }} />

                {/* Submit Section */}
                <div style={{ textAlign: "center" }}>
                  <Space size="large">
                    <Button
                      size="large"
                      onClick={() => router.back()}
                      style={{
                        borderRadius: "12px",
                        padding: "12px 32px",
                        height: "48px",
                        fontSize: "15px",
                        fontWeight: "500",
                        border: "1px solid #d1d5db",
                        color: "#374151",
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      icon={<SaveOutlined />}
                      loading={loading}
                      style={{
                        background: isHovered ? "#1d4ed8" : "#1e40af",
                        borderColor: isHovered ? "#1d4ed8" : "#1e40af",
                        borderRadius: "12px",
                        padding: "12px 40px",
                        fontSize: "15px",
                        fontWeight: "600",
                        height: "48px",
                        boxShadow: "0 4px 12px rgba(30, 64, 175, 0.25)",
                        transform: isHovered
                          ? "translateY(-1px)"
                          : "translateY(0)",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      Create Law Firm
                    </Button>
                  </Space>

                  <div style={{ marginTop: "24px" }}>
                    <Text
                      className="text-[#9ca3af] dark:text-[#6b7280]"
                      style={{ fontSize: "14px" }}
                    >
                      Your firm will be ready to use immediately after creation
                    </Text>
                  </div>
                </div>
              </Form>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ThemeProvider>
  );
}
