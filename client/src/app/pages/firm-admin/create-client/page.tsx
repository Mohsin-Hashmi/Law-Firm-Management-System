"use client";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Typography,
  Card,
  Progress,
  Divider,
  Space,
  Spin,
  Row,
  Col,
  DatePicker,
  InputNumber,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  TeamOutlined,
  BankOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ShopOutlined,
  IdcardOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/app/store/hooks";
import { ThemeProvider } from "next-themes";
import {  ClientPayload } from "@/app/types/client";
import { RootState } from "@/app/store/store";
import { createClient } from "@/app/service/adminAPI";
import { addClient, } from "@/app/store/clientSlice";
import { useAppDispatch } from "@/app/store/hooks";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

export default function AddClient() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.user?.user);
  const firmId = user?.firmId;
  const router = useRouter();
  const [form] = Form.useForm<ClientPayload>();

  // State values
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState<string>("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [clientType, setClientType] = useState("Individual");
  const [organization, setOrganization] = useState("");
  const [status, setStatus] = useState("Active");
  const [billingAddress, setBillingAddress] = useState("");
  const [outstandingBalance, setOutstandingBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCreateClient = async () => {
    try {
      setLoading(true);

      const payload: ClientPayload = {
        fullName,
        dob,
        gender: gender as "Male" | "Female" | "Other",
        email,
        phone,
        address,
        clientType: clientType as "Individual" | "Business" | "Corporate",
        organization,
        status: status as "Active" | "Past" | "Potential" | "Suspended",
        billingAddress,
        outstandingBalance,
        firmId: firmId!, // required
      };
      // Replace with your actual API call
      const response = await createClient(payload);
      if (!response) {
        toast.error("Error in create client API");
      }
      dispatch(addClient(response));
      // const response = await createClient(payload);
      console.log("Creating client with payload:", payload);
      toast.success("Client created successfully!");
      router.push("/pages/firm-admin/get-clients");

      // Reset form
      resetForm();
    } catch (err) {
      toast.error("Something went wrong while creating the client");
      console.log("Error creating client:", err);
    } finally {
      setLoading(false);

    }
  };

  const resetForm = () => {
    setFullName("");
    setDob("");
    setGender("");
    setEmail("");
    setPhone("");
    setAddress("");
    setClientType("Individual");
    setOrganization("");
    setStatus("Active");
    setBillingAddress("");
    setOutstandingBalance(0);
    form.resetFields();
  };

  const getFormProgress = () => {
    let progress = 0;
    if (fullName) progress += 20;
    if (email) progress += 20;
    if (phone) progress += 15;
    if (address) progress += 15;
    if (clientType) progress += 10;
    if (status) progress += 10;
    if (clientType !== "Individual" && organization) progress += 10;
    return progress;
  };

  const clientTypes = [
    {
      value: "Individual",
      label: "Individual",
      description: "Personal client",
      icon: <UserOutlined />,
      color: "#059669",
    },
    {
      value: "Business",
      label: "Business",
      description: "Small to medium business",
      icon: <ShopOutlined />,
      color: "#2563eb",
    },
    {
      value: "Corporate",
      label: "Corporate",
      description: "Large corporation",
      icon: <BankOutlined />,
      color: "#7c3aed",
    },
  ];

  const statusOptions = [
    { value: "Active", label: "Active", color: "#059669" },
    { value: "Past", label: "Past Client", color: "#6b7280" },
    { value: "Potential", label: "Potential", color: "#f59e0b" },
    { value: "Suspended", label: "Suspended", color: "#dc2626" },
  ];

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

  const handleClientTypeChange = (type: string) => {
    setClientType(type);
    if (type === "Individual") {
      setOrganization("");
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DashboardLayout>
        <div className="min-h-screen p-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 [&_.ant-typography]:dark:!text-white [&_.ant-card-head-title]:dark:!text-white">
          <div className="max-w-[1200px] mx-auto">
            {/* Header Section */}
            <Card
              className="bg-emerald-900 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
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
                      <UserOutlined
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
                        Add New Client
                      </Title>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "18px",
                          fontWeight: "400",
                        }}
                      >
                        Register a new client with complete contact and billing
                        information
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
                  className="text-[14px] text-[#64748b] dark:text-[#9ca3af] font-[500]"
                  style={{
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  Registration Progress
                </Text>
                <Progress
                  percent={getFormProgress()}
                  strokeColor="#059669"
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
              <Form<ClientPayload>
                form={form}
                layout="vertical"
                onFinish={handleCreateClient}
                initialValues={{
                  clientType: "Individual",
                  status: "Active",
                  outstandingBalance: 0,
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
                        Creating Client
                      </Title>
                      <Text
                        className="text-[#64748b] dark:text-[#9ca3af]"
                        style={{ fontSize: "16px" }}
                      >
                        Please wait while we register the new client...
                      </Text>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Personal Information Section */}
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
                        <UserOutlined
                          style={{ marginRight: "8px", color: "#059669" }}
                        />
                        Personal Information
                      </Title>
                      <Text
                        className="text-[#9ca3af] dark:text-[#6b7280]"
                        style={{ fontSize: "14px" }}
                      >
                        Basic personal details of the client
                      </Text>
                    </div>

                    <Form.Item
                      label={
                        <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                          Full Name
                        </span>
                      }
                      name="fullName"
                      rules={[
                        {
                          required: true,
                          message: "Please enter client's full name",
                        },
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined style={{ color: "#9ca3af" }} />}
                        placeholder="Enter client's full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="dark:!bg-slate-800 dark:text-[#FFFFFF]"
                        style={{
                          padding: "14px 16px",
                          borderRadius: "12px",
                          border: "1px solid #d1d5db",
                          fontSize: "15px",
                        }}
                      />
                    </Form.Item>

                    <div style={{ display: "flex", gap: "16px" }}>
                      <Form.Item
                        label={
                          <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                            Date of Birth
                          </span>
                        }
                        name="dob"
                        style={{ flex: 1 }}
                      >
                        <DatePicker
                          placeholder="Select date of birth"
                          value={dob}
                          onChange={(date) => setDob(date)}
                          className="dark:!bg-slate-800 dark:text-[#FFFFFF]"
                          style={{
                            width: "100%",
                            padding: "14px 16px",
                            borderRadius: "12px",
                            border: "1px solid #d1d5db",
                            fontSize: "15px",
                          }}
                          suffixIcon={
                            <CalendarOutlined style={{ color: "#9ca3af" }} />
                          }
                        />
                      </Form.Item>

                      <Form.Item
                        label={
                          <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                            Gender
                          </span>
                        }
                        name="gender"
                        style={{ flex: 1 }}
                      >
                        <Select
                          placeholder="Select gender"
                          value={gender}
                          onChange={(value) => setGender(value)}
                          size="large"
                          className="dark:!bg-slate-800 [&_.ant-select-selector]:dark:!bg-slate-800 [&_.ant-select-selection-item]:dark:!text-white [&_.ant-select-arrow]:dark:!text-white placeholder:dark:text-[#fff] "
                          dropdownClassName="dark:!bg-slate-800 [&_.ant-select-item]:dark:!bg-slate-800 [&_.ant-select-item]:dark:!text-white [&_.ant-select-item-option-selected]:dark:!bg-slate-700 [&_.ant-select-item-option-active]:dark:!bg-slate-700"
                          style={{
                            borderRadius: "12px",
                          }}
                        >
                          {genderOptions.map((option) => (
                            <Option key={option.value} value={option.value}>
                              {option.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>

                    <Form.Item
                      label={
                        <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                          Email Address
                        </span>
                      }
                      name="email"
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
                        placeholder="client@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="dark:!bg-slate-800 dark:text-[#FFFFFF]"
                        style={{
                          padding: "14px 16px",
                          borderRadius: "12px",
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
                      name="phone"
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
                        className="dark:!bg-slate-800 dark:text-[#FFFFFF]"
                        style={{
                          padding: "14px 16px",
                          borderRadius: "12px",
                          border: "1px solid #d1d5db",
                          fontSize: "15px",
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                          Address
                        </span>
                      }
                      name="address"
                      rules={[
                        { required: true, message: "Please enter address" },
                      ]}
                    >
                      <TextArea
                        placeholder="Enter complete address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3}
                        className="dark:!bg-slate-800 dark:text-[#FFFFFF]"
                        style={{
                          borderRadius: "12px",
                          border: "1px solid #d1d5db",
                          fontSize: "15px",
                        }}
                      />
                    </Form.Item>
                  </div>

                  {/* Business Information Section */}
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
                        <ShopOutlined
                          style={{ marginRight: "8px", color: "#059669" }}
                        />
                        Client Details
                      </Title>
                      <Text
                        className="text-[#9ca3af] dark:text-[#6b7280]"
                        style={{ fontSize: "14px" }}
                      >
                        Client type, status and business information
                      </Text>
                    </div>

                    <Form.Item
                      label={
                        <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                          Client Type
                        </span>
                      }
                      name="clientType"
                      rules={[
                        {
                          required: true,
                          message: "Please select client type",
                        },
                      ]}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        {clientTypes.map((type) => (
                          <div
                            key={type.value}
                            onClick={() => handleClientTypeChange(type.value)}
                            className="cursor-pointer transition-all duration-200 hover:shadow-md"
                            style={{
                              border:
                                clientType === type.value
                                  ? `2px solid ${type.color}`
                                  : "1px solid #d1d5db",
                              borderRadius: "12px",
                              padding: "16px",
                              background:
                                clientType === type.value
                                  ? `${type.color}08`
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
                                  color: type.color,
                                  fontSize: "20px",
                                }}
                              >
                                {type.icon}
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
                                  {type.label}
                                </Title>
                                <Text
                                  className="text-[#6b7280] dark:text-[#9ca3af]"
                                  style={{ fontSize: "14px" }}
                                >
                                  {type.description}
                                </Text>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Form.Item>

                    {clientType !== "Individual" && (
                      <Form.Item
                        label={
                          <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                            Organization Name
                          </span>
                        }
                        name="organization"
                        rules={[
                          {
                            required: true,
                            message: "Please enter organization name",
                          },
                        ]}
                      >
                        <Input
                          prefix={<BankOutlined style={{ color: "#9ca3af" }} />}
                          placeholder="Enter organization name"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          className="dark:!bg-slate-800 dark:text-[#FFFFFF]"
                          style={{
                            padding: "14px 16px",
                            borderRadius: "12px",
                            border: "1px solid #d1d5db",
                            fontSize: "15px",
                          }}
                        />
                      </Form.Item>
                    )}

                    <Form.Item
                      label={
                        <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                          Client Status
                        </span>
                      }
                      name="status"
                      rules={[
                        { required: true, message: "Please select status" },
                      ]}
                    >
                      <Select
                        placeholder="Select client status"
                        value={status}
                        onChange={(value) => setStatus(value)}
                        className="dark:!bg-slate-800 dark:text-[#FFFFFF]"
                        style={{
                          borderRadius: "12px",
                          fontSize: "15px",
                        }}
                      >
                        {statusOptions.map((option) => (
                          <Option key={option.value} value={option.value}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <div
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  backgroundColor: option.color,
                                }}
                              />
                              {option.label}
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                          Billing Address
                        </span>
                      }
                      name="billingAddress"
                    >
                      <TextArea
                        placeholder="Enter billing address (leave empty to use same as address)"
                        value={billingAddress}
                        onChange={(e) => setBillingAddress(e.target.value)}
                        rows={3}
                        className="dark:!bg-slate-800 dark:text-[#FFFFFF]"
                        style={{
                          borderRadius: "12px",
                          border: "1px solid #d1d5db",
                          fontSize: "15px",
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                          Outstanding Balance ($)
                        </span>
                      }
                      name="outstandingBalance"
                    >
                      <InputNumber
                        prefix={<DollarOutlined style={{ color: "#9ca3af" }} />}
                        className="dark:!bg-slate-800 dark:text-[#FFFFFF] [&_.ant-input-number-input]:dark:!bg-slate-800 [&_.ant-input-number-input]:dark:!text-white"
                        style={{
                          width: "100%",
                          borderRadius: "12px",
                          fontSize: "15px",
                        }}
                        min={0}
                        precision={2}
                        value={outstandingBalance}
                        onChange={(value) => setOutstandingBalance(value ?? 0)}
                        placeholder="0.00"
                      />
                    </Form.Item>

                    {/* Client Summary */}
                    <div className="bg-emerald-50 dark:bg-slate-700/50 border border-emerald-200 dark:border-slate-600 rounded-xl p-5 mt-6">
                      <Title
                        level={5}
                        className="text-[#059669] dark:text-[#34d399]"
                        style={{
                          marginBottom: "12px",
                          fontSize: "16px",
                        }}
                      >
                        <IdcardOutlined style={{ marginRight: "8px" }} />
                        Client Summary
                      </Title>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Text className="text-[#374151] dark:text-[#cbd5e1]">
                            Type:
                          </Text>
                          <Text className="text-[#059669] dark:text-[#34d399] font-medium">
                            {clientType}
                          </Text>
                        </div>
                        <div className="flex justify-between">
                          <Text className="text-[#374151] dark:text-[#cbd5e1]">
                            Status:
                          </Text>
                          <Text
                            className="font-medium"
                            style={{
                              color:
                                statusOptions.find((s) => s.value === status)
                                  ?.color || "#374151",
                            }}
                          >
                            {statusOptions.find((s) => s.value === status)
                              ?.label || status}
                          </Text>
                        </div>
                        {outstandingBalance > 0 && (
                          <div className="flex justify-between">
                            <Text className="text-[#374151] dark:text-[#cbd5e1]">
                              Balance:
                            </Text>
                            <Text className="text-[#dc2626] dark:text-[#f87171] font-medium">
                              ${outstandingBalance.toFixed(2)}
                            </Text>
                          </div>
                        )}
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
                        background: isHovered ? "#047857" : "#059669",
                        borderColor: isHovered ? "#047857" : "#059669",
                        borderRadius: "12px",
                        padding: "12px 40px",
                        fontSize: "15px",
                        fontWeight: "600",
                        height: "48px",
                        boxShadow: "0 4px 12px rgba(5, 150, 105, 0.25)",
                        transform: isHovered
                          ? "translateY(-1px)"
                          : "translateY(0)",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      Create Client
                    </Button>
                  </Space>

                  <div style={{ marginTop: "24px" }}>
                    <Text
                      className="text-[#9ca3af] dark:text-[#6b7280]"
                      style={{ fontSize: "14px" }}
                    >
                      Client will be added to your firms database immediately
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
