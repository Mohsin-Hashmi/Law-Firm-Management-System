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
import { addUser } from "@/app/store/userSlice";
import { useAppSelector } from "@/app/store/hooks";

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
  const user = useAppSelector((state) => state.user.user);
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

      const response = await createFirm(payload);
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
      toast.success("Law firm created successfully!");
      router.push("/pages/dashboard");

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
    <DashboardLayout>
      <div
        style={{
          background: "#f8fafc",
          minHeight: "100vh",
        }}
      >
        <div className="max-w-[1000px] mx-auto">
          {/* Header Section */}
          <div style={{ marginBottom: "32px" }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              style={{
                marginBottom: "16px",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Back to Dashboard
            </Button>

            <Card
              style={{
                background: "white",
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
              bodyStyle={{ padding: "32px" }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    background:
                      "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 24px",
                  }}
                >
                  <BankOutlined style={{ fontSize: "32px", color: "white" }} />
                </div>

                <Title
                  level={1}
                  style={{
                    color: "#111827",
                    marginBottom: "8px",
                    fontSize: "36px",
                    fontWeight: "700",
                  }}
                >
                  Create New Law Firm
                </Title>
                <Text
                  style={{
                    fontSize: "16px",
                    color: "#64748b",
                    lineHeight: "1.5",
                  }}
                >
                  Set up your law firms digital workspace with all essential
                  details
                </Text>

                {/* Progress Bar */}
                <div
                  style={{
                    marginTop: "24px",
                    maxWidth: "300px",
                    margin: "24px auto 0",
                  }}
                >
                  <Text
                    style={{
                      fontSize: "14px",
                      color: "#64748b",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Setup Progress
                  </Text>
                  <Progress
                    percent={getFormProgress()}
                    strokeColor="#1e40af"
                    trailColor="#f1f5f9"
                    strokeWidth={8}
                    showInfo={false}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Main Form Card */}
          <Card
            style={{
              background: "white",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
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
                  <div
                    style={{
                      background: "white",
                      padding: "48px",
                      borderRadius: "20px",
                      textAlign: "center",
                      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
                      border: "1px solid #e5e7eb",
                    }}
                  >
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
                      style={{ marginBottom: "8px", color: "#111827" }}
                    >
                      Creating Law Firm
                    </Title>
                    <Text style={{ color: "#64748b", fontSize: "16px" }}>
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
                      style={{
                        color: "#374151",
                        marginBottom: "4px",
                        fontSize: "18px",
                      }}
                    >
                      <BankOutlined
                        style={{ marginRight: "8px", color: "#1e40af" }}
                      />
                      Firm Information
                    </Title>
                    <Text style={{ color: "#9ca3af", fontSize: "14px" }}>
                      Basic details about your law firm
                    </Text>
                  </div>

                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
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
                      style={{
                        padding: "14px 16px",
                        borderRadius: "12px",
                        border: "1px solid #d1d5db",
                        fontSize: "15px",
                        background: "#fafafa",
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
                        Firm Subdomain
                      </span>
                    }
                  >
                    <Input
                      prefix={<GlobalOutlined style={{ color: "#9ca3af" }} />}
                      value={subdomain}
                      readOnly
                      placeholder="auto-generated from firm name"
                      style={{
                        padding: "14px 16px",
                        borderRadius: "12px",
                        border: "1px solid #d1d5db",
                        fontSize: "15px",
                        background: "#f9fafb",
                        color: "#6b7280",
                      }}
                      suffix={
                        <Text style={{ color: "#9ca3af", fontSize: "14px" }}>
                          .lawfirm.com
                        </Text>
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
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
                      style={{
                        padding: "14px 16px",
                        borderRadius: "12px",
                        border: "1px solid #d1d5db",
                        fontSize: "15px",
                        background: "#fafafa",
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
                        Phone Number
                      </span>
                    }
                    name="firmPhone"
                    rules={[
                      { required: true, message: "Please enter phone number" },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined style={{ color: "#9ca3af" }} />}
                      placeholder="+1 (555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        padding: "14px 16px",
                        borderRadius: "12px",
                        border: "1px solid #d1d5db",
                        fontSize: "15px",
                        background: "#fafafa",
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
                        Business Address
                      </span>
                    }
                    name="address"
                    rules={[
                      { required: true, message: "Please enter address" },
                    ]}
                  >
                    <Input.TextArea
                      prefix={
                        <EnvironmentOutlined style={{ color: "#9ca3af" }} />
                      }
                      placeholder="Enter complete business address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      style={{
                        borderRadius: "12px",
                        border: "1px solid #d1d5db",
                        fontSize: "15px",
                        background: "#fafafa",
                      }}
                    />
                  </Form.Item>
                </div>

                {/* Subscription & Limits Section */}
                <div>
                  <div style={{ marginBottom: "24px" }}>
                    <Title
                      level={4}
                      style={{
                        color: "#374151",
                        marginBottom: "4px",
                        fontSize: "18px",
                      }}
                    >
                      <CrownOutlined
                        style={{ marginRight: "8px", color: "#1e40af" }}
                      />
                      Subscription & Limits
                    </Title>
                    <Text style={{ color: "#9ca3af", fontSize: "14px" }}>
                      Choose your plan and set operational limits
                    </Text>
                  </div>

                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
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
                          style={{
                            border:
                              subscription_plan === plan.value
                                ? `2px solid ${plan.color}`
                                : "1px solid #d1d5db",
                            borderRadius: "12px",
                            padding: "16px",
                            cursor: "pointer",
                            background:
                              subscription_plan === plan.value
                                ? `${plan.color}08`
                                : "#fafafa",
                            transition: "all 0.2s ease",
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
                                style={{
                                  margin: 0,
                                  color: "#374151",
                                  fontSize: "16px",
                                }}
                              >
                                {plan.label}
                              </Title>
                              <Text
                                style={{ color: "#6b7280", fontSize: "14px" }}
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
                        <span
                          style={{
                            fontSize: "15px",
                            fontWeight: "600",
                            color: "#374151",
                          }}
                        >
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
                        style={{
                          width: "100%",
                          borderRadius: "12px",
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
                        <span
                          style={{
                            fontSize: "15px",
                            fontWeight: "600",
                            color: "#374151",
                          }}
                        >
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
                        style={{
                          width: "100%",
                          borderRadius: "12px",
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
                  <div
                    style={{
                      background: "#f0f9ff",
                      border: "1px solid #e0f2fe",
                      borderRadius: "12px",
                      padding: "20px",
                      marginTop: "24px",
                    }}
                  >
                    <Title
                      level={5}
                      style={{
                        color: "#1e40af",
                        marginBottom: "12px",
                        fontSize: "16px",
                      }}
                    >
                      <BuildOutlined style={{ marginRight: "8px" }} />
                      {
                        subscriptionPlans.find(
                          (p) => p.value === subscription_plan
                        )?.label
                      }{" "}
                      Features
                    </Title>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "20px",
                        color: "#334155",
                      }}
                    >
                      {subscriptionPlans
                        .find((p) => p.value === subscription_plan)
                        ?.features.map((feature, index) => (
                          <li
                            key={index}
                            style={{ fontSize: "14px", marginBottom: "4px" }}
                          >
                            {feature}
                          </li>
                        ))}
                    </ul>
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
                  <Text style={{ color: "#9ca3af", fontSize: "14px" }}>
                    Your firm will be ready to use immediately after creation
                  </Text>
                </div>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
