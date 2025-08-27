"use client";
import DashboardLayout from "@/app/components/DashboardLayout";
import { createClient } from "@/app/service/adminAPI";
import { addClient, } from "@/app/store/clientSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { RootState } from "@/app/store/store";
import { ClientPayload } from "@/app/types/client";
import {
  ArrowLeftOutlined,
  BankOutlined,
  CalendarOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  ShopOutlined,
  UserOutlined
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Progress,
  Row,
  Select,
  Space,
  Spin,
  Typography
} from "antd";
import { ThemeProvider } from "next-themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

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

 const handleCreateClient = async () => {
  try {
    setLoading(true);

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("dob", dob);
    formData.append("gender", gender);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("address", address);
    formData.append("clientType", clientType);
    formData.append("organization", organization);
    formData.append("status", status);
    formData.append("billingAddress", billingAddress);
    formData.append("outstandingBalance", outstandingBalance.toString());

    // profile image if selected
    if (profileImage) {
      formData.append("profileImage", profileImage);
    }
    const response = await createClient(firmId!, formData);

    if (!response) {
      toast.error("Error in create client API");
      return;
    }
    dispatch(addClient(response));
    toast.success("Client created successfully!");
    router.push("/pages/firm-admin/get-clients");

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
    setProfileImage(null);
    setPreviewUrl(null);
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
        <div className="min-h-screen p-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
          <div className="max-w-[1400px] mx-auto">
            {/* Header Section */}
            <Card
              className="bg-emerald-600 dark:bg-slate-800 border-0 rounded-2xl shadow-lg mb-6"
              bodyStyle={{ padding: "32px" }}
            >
              <Row align="middle" justify="space-between">
                <Col>
                  <Space size="large" align="center">
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        background: "rgba(255,255,255,0.15)",
                        borderRadius: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      <UserOutlined style={{ fontSize: "28px", color: "white" }} />
                    </div>
                    <div>
                      <Title
                        level={1}
                        style={{
                          color: "white",
                          margin: 0,
                          fontSize: "32px",
                          fontWeight: "700",
                          lineHeight: "1.1",
                        }}
                      >
                        Add New Client
                      </Title>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.85)",
                          fontSize: "16px",
                          fontWeight: "400",
                          marginTop: "4px",
                          display: "block",
                        }}
                      >
                        Register a new client with complete contact and billing information
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
                      height: "44px",
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
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm mb-6"
              bodyStyle={{ padding: "20px 24px" }}
            >
              <div style={{ textAlign: "center" }}>
                <Text
                  className="text-slate-600 dark:text-slate-300"
                  style={{
                    marginBottom: "12px",
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Registration Progress
                </Text>
                <Progress
                  percent={getFormProgress()}
                  strokeColor="#059669"
                  trailColor="#f1f5f9"
                  strokeWidth={8}
                  showInfo={true}
                  
                />
              </div>
            </Card>

            {/* Main Form */}
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
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl text-center shadow-2xl border border-slate-200 dark:border-slate-700 max-w-sm mx-4">
                    <Spin size="large" />
                    <Title
                      level={4}
                      className="text-slate-800 dark:text-white mt-4 mb-2"
                    >
                      Creating Client
                    </Title>
                    <Text className="text-slate-600 dark:text-slate-300">
                      Please wait while we register the new client...
                    </Text>
                  </div>
                </div>
              )}

              <Row gutter={[24, 24]}>
                {/* Left Column - Profile & Personal Info */}
                <Col xs={24} lg={12}>
                  {/* Profile Image Section */}
                  <Card
                    title={
                      <Space>
                        <CameraOutlined style={{ color: "#059669" }} />
                        <span className="text-slate-800 dark:text-white font-semibold">
                          Profile Photo
                        </span>
                      </Space>
                    }
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm mb-6"
                    bodyStyle={{ padding: "24px", textAlign: "center" }}
                  >
                    <div style={{ position: "relative", display: "inline-block" }}>
                      {previewUrl ? (
                        <Avatar
                          size={100}
                          src={previewUrl}
                          style={{
                            border: "4px solid white",
                            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
                          }}
                        />
                      ) : (
                        <Avatar
                          size={100}
                          style={{
                            background: "#f8fafc",
                            border: "4px solid white",
                            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
                            color: "#94a3b8",
                          }}
                        >
                          <CameraOutlined style={{ fontSize: "32px" }} />
                        </Avatar>
                      )}

                      <label
                        style={{
                          position: "absolute",
                          bottom: "0px",
                          right: "0px",
                          background: "#059669",
                          borderRadius: "50%",
                          width: "36px",
                          height: "36px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(5, 150, 105, 0.4)",
                          border: "3px solid white",
                        }}
                      >
                        <CameraOutlined
                          style={{ color: "white", fontSize: "14px" }}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>

                    <div style={{ marginTop: "16px" }}>
                      <Text
                        className="text-slate-700 dark:text-white"
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          display: "block",
                        }}
                      >
                        Client Profile Photo
                      </Text>
                      <Text
                        className="text-slate-500 dark:text-slate-400"
                        style={{ fontSize: "13px", marginTop: "2px" }}
                      >
                        Upload a photo for the client profile (optional)
                      </Text>
                    </div>
                  </Card>

                  {/* Personal Information */}
                  <Card
                    title={
                      <Space>
                        <UserOutlined style={{ color: "#059669" }} />
                        <span className="text-slate-800 dark:text-white font-semibold">
                          Personal Information
                        </span>
                      </Space>
                    }
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm"
                    bodyStyle={{ padding: "24px" }}
                  >
                    <div className="space-y-4">
                      <Form.Item
                        label={
                          <span className="text-slate-700 dark:text-slate-200 font-medium">
                            Full Name *
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
                          prefix={<UserOutlined className="text-slate-400" />}
                          placeholder="Enter client's full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="rounded-lg border-slate-300 dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                          style={{ padding: "12px 16px", fontSize: "14px" }}
                        />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            label={
                              <span className="text-slate-700 dark:text-slate-200 font-medium">
                                Date of Birth
                              </span>
                            }
                            name="dob"
                          >
                            <DatePicker
                              placeholder="Select date"
                              value={dob}
                              onChange={(date) => setDob(date)}
                              className="w-full rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                              style={{ padding: "12px 16px", fontSize: "14px" }}
                              suffixIcon={<CalendarOutlined className="text-slate-400" />}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            label={
                              <span className="text-slate-700 dark:text-slate-200 font-medium">
                                Gender
                              </span>
                            }
                            name="gender"
                          >
                            <Select
                              placeholder="Select gender"
                              value={gender}
                              onChange={(value) => setGender(value)}
                              className="rounded-lg dark:bg-slate-900 [&_.ant-select-selector]:dark:!bg-slate-700 [&_.ant-select-selector]:dark:!border-slate-600 [&_.ant-select-selection-item]:dark:!text-white"
                              dropdownClassName="dark:!bg-slate-700 [&_.ant-select-item]:dark:!bg-slate-700 [&_.ant-select-item]:dark:!text-white"
                            >
                              {genderOptions.map((option) => (
                                <Option key={option.value} value={option.value}>
                                  {option.label}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item
                        label={
                          <span className="text-slate-700 dark:text-slate-200 font-medium">
                            Email Address *
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
                          prefix={<MailOutlined className="text-slate-400" />}
                          placeholder="client@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="rounded-lg border-slate-300 dark:!bg-slate-900 dark:text-[#FFFFFF]"
                          style={{ padding: "12px 16px", fontSize: "14px" }}
                        />
                      </Form.Item>

                      <Form.Item
                        label={
                          <span className="text-slate-700 dark:text-slate-200 font-medium">
                            Phone Number *
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
                          prefix={<PhoneOutlined className="text-slate-400" />}
                          placeholder="+1 (555) 123-4567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="rounded-lg border-slate-300 dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                          style={{ padding: "12px 16px", fontSize: "14px" }}
                        />
                      </Form.Item>

                      <Form.Item
                        label={
                          <span className="text-slate-700 dark:text-slate-200 font-medium">
                            Address *
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
                          className="rounded-lg border-slate-300 dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                          style={{ fontSize: "14px" }}
                        />
                      </Form.Item>
                    </div>
                  </Card>
                </Col>

                {/* Right Column - Client Details & Summary */}
                <Col xs={24} lg={12}>
                  {/* Client Details */}
                  <Card
                    title={
                      <Space>
                        <IdcardOutlined style={{ color: "#059669" }} />
                        <span className="text-slate-800 dark:text-white font-semibold">
                          Client Details
                        </span>
                      </Space>
                    }
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm mb-6"
                    bodyStyle={{ padding: "24px" }}
                  >
                    <div className="space-y-6">
                      <Form.Item
                        label={
                          <span className="text-slate-700 dark:text-slate-200 font-medium">
                            Client Type *
                          </span>
                        }
                        name="clientType"
                        rules={[
                          { required: true, message: "Please select client type" },
                        ]}
                      >
                        <div className="grid grid-cols-1 gap-3">
                          {clientTypes.map((type) => (
                            <div
                              key={type.value}
                              onClick={() => handleClientTypeChange(type.value)}
                              className="cursor-pointer transition-all duration-200 hover:shadow-md"
                              style={{
                                border:
                                  clientType === type.value
                                    ? `2px solid ${type.color}`
                                    : "1px solid #e2e8f0",
                                borderRadius: "12px",
                                padding: "16px",
                                background:
                                  clientType === type.value
                                    ? `${type.color}08`
                                    : undefined,
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div style={{ color: type.color, fontSize: "18px" }}>
                                  {type.icon}
                                </div>
                                <div className="flex-1">
                                  <div className="text-slate-800 dark:text-white font-medium text-sm">
                                    {type.label}
                                  </div>
                                  <div className="text-slate-500 dark:text-slate-400 text-xs">
                                    {type.description}
                                  </div>
                                </div>
                                {clientType === type.value && (
                                  <CheckCircleOutlined
                                    style={{ color: type.color, fontSize: "18px" }}
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </Form.Item>

                      {clientType !== "Individual" && (
                        <Form.Item
                          label={
                            <span className="text-slate-700 dark:text-slate-200 font-medium">
                              Organization Name *
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
                            prefix={<BankOutlined className="text-slate-400" />}
                            placeholder="Enter organization name"
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            className="rounded-lg border-slate-300 dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                            style={{ padding: "12px 16px", fontSize: "14px" }}
                          />
                        </Form.Item>
                      )}

                      <Form.Item
                        label={
                          <span className="text-slate-900 dark:text-slate-200 font-medium">
                            Client Status *
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
                          className="rounded-lg dark:bg-slate-900 [&_.ant-select-selector]:dark:!bg-slate-900 [&_.ant-select-selector]:dark:!border-slate-600 [&_.ant-select-selection-item]:dark:!text-white"
                          dropdownClassName="dark:!bg-slate-700 [&_.ant-select-item]:dark:!bg-slate-700 [&_.ant-select-item]:dark:!text-white"
                        >
                          {statusOptions.map((option) => (
                            <Option key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
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
                          <span className="text-slate-700 dark:text-slate-200 font-medium">
                            Outstanding Balance ($)
                          </span>
                        }
                        name="outstandingBalance"
                      >
                        <InputNumber
                          prefix={<DollarOutlined className="text-slate-400" />}
                          className="w-full rounded-lg dark:bg-slate-900 dark:border-slate-600 [&_.ant-input-number-input]:dark:!bg-slate-700 [&_.ant-input-number-input]:dark:!text-white [&_.ant-select-selection-placeholder]:dark:!text-white"
                          style={{ padding: "12px 16px", fontSize: "14px" }}
                          min={0}
                          precision={2}
                          value={outstandingBalance}
                          onChange={(value) => setOutstandingBalance(value ?? 0)}
                          placeholder="0.00"
                        />
                      </Form.Item>

                      <Form.Item
                        label={
                          <span className="text-slate-700 dark:text-slate-200 font-medium">
                            Billing Address
                          </span>
                        }
                        name="billingAddress"
                      >
                        <TextArea
                          placeholder="Enter billing address (leave empty to use same as address)"
                          value={billingAddress}
                          onChange={(e) => setBillingAddress(e.target.value)}
                          rows={2}
                          className="rounded-lg border-slate-300 dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                          style={{ fontSize: "14px" }}
                        />
                      </Form.Item>
                    </div>
                  </Card>

                  {/* Client Summary */}
                  <Card
                    title={
                      <Space>
                        <CheckCircleOutlined style={{ color: "#059669" }} />
                        <span className="text-slate-800 dark:text-white font-semibold">
                          Client Summary
                        </span>
                      </Space>
                    }
                    className="bg-emerald-50 dark:bg-slate-700/50 border border-emerald-200 dark:border-slate-600 rounded-xl shadow-sm"
                    bodyStyle={{ padding: "20px" }}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Text className="text-slate-600 dark:text-slate-300 text-sm">
                          Type:
                        </Text>
                        <Text className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                          {clientType}
                        </Text>
                      </div>
                      <div className="flex justify-between items-center">
                        <Text className="text-slate-600 dark:text-slate-300 text-sm">
                          Status:
                        </Text>
                        <Text
                          className="font-medium text-sm"
                          style={{
                            color:
                              statusOptions.find((s) => s.value === status)?.color ||
                              "#374151",
                          }}
                        >
                          {statusOptions.find((s) => s.value === status)?.label ||
                            status}
                        </Text>
                      </div>
                      {outstandingBalance > 0 && (
                        <div className="flex justify-between items-center">
                          <Text className="text-slate-600 dark:text-slate-300 text-sm">
                            Balance:
                          </Text>
                          <Text className="text-red-600 dark:text-red-400 font-medium text-sm">
                            ${Number(outstandingBalance).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </Text>
                        </div>
                      )}
                      {profileImage && (
                        <div className="flex justify-between items-center">
                          <Text className="text-slate-600 dark:text-slate-300 text-sm">
                            Photo:
                          </Text>
                          <Text className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                            ✓ Selected
                          </Text>
                        </div>
                      )}
                      {clientType !== "Individual" && organization && (
                        <div className="flex justify-between items-center">
                          <Text className="text-slate-600 dark:text-slate-300 text-sm">
                            Organization:
                          </Text>
                          <Text className="text-slate-800 dark:text-white font-medium text-sm">
                            {organization}
                          </Text>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Submit Section */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-center items-center gap-4">
                  <Button
                    size="large"
                    onClick={() => router.back()}
                    className="px-8 py-2 h-12 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    style={{ minWidth: "120px" }}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<SaveOutlined />}
                    loading={loading}
                    className="px-8 py-2 h-12 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    style={{
                      background: isHovered ? "#047857" : "#059669",
                      borderColor: isHovered ? "#047857" : "#059669",
                      transform: isHovered ? "translateY(-1px)" : "translateY(0)",
                      minWidth: "160px",
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    Create Client
                  </Button>
                </div>

                <div className="text-center mt-4">
                  <Text className="text-slate-500 dark:text-slate-400 text-sm">
                    Client will be added to your firms database immediately
                  </Text>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </DashboardLayout>
    </ThemeProvider>
  );
}