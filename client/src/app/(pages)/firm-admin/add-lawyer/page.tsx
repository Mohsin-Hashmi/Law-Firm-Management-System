"use client";
import DashboardLayout from "@/app/components/DashboardLayout";
import { addLawyer } from "@/app/service/adminAPI";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { setLawyers } from "@/app/store/lawyerSlice";
import { RootState } from "@/app/store/store";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import {
  ArrowLeftOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  Progress,
  Row,
  Select,
  Space,
  Spin,
  Steps,
  Typography,
} from "antd";
import { ThemeProvider } from "next-themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

const { Option } = Select;
const { Title, Text } = Typography;
const { Step } = Steps;

interface FormValues {
  name: string;
  email: string;
  phone: string;
  specialization?: string;
  status: "Active" | "Inactive";
  profileImage?: File | null;
}

export default function AddLawyer() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const firmId = useAppSelector((state: RootState) => state.firm.firm?.firmId);
  console.log("Firm id is", firmId);
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
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  // Preview image before submit
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };
  const showCreationModal = () => setIsCreateModalVisible(true);
  const hideCreateModal = () => setIsCreateModalVisible(false);
  const handleConfirmCreate = () => {
    hideCreateModal();
    handleCreateLawyer();
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
      if (!firmId) {
        toast.error("Firm ID is missing!");
        return;
      }
      const response = await addLawyer(firmId, formData);

      if (!response) {
        toast.error("Failed to create lawyer");
        return;
      }
      dispatch(setLawyers(response.data.newLawyer));
      toast.success("Attorney added successfully!");
      router.push("/firm-admin/get-lawyers");

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
      toast.error("Something went wrong while adding the attorney");
      console.error("Error creating lawyer:", err);
    } finally {
      setLoading(false);
    }
  };

  const specializationOptions = [
    "Corporate Law",
    "Criminal Defense",
    "Family Law",
    "Real Estate Law",
    "Employment Law",
    "Intellectual Property",
    "Immigration Law",
    "Tax Law",
    "Personal Injury",
    "Environmental Law",
    "Securities Law",
    "Bankruptcy Law",
    "Civil Litigation",
    "Estate Planning",
    "Medical Malpractice",
  ];

  const getFormProgress = () => {
    let progress = 0;
    if (name) progress += 25;
    if (email) progress += 25;
    if (phone) progress += 25;
    if (specialization) progress += 25;
    return progress;
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DashboardLayout>
        <div className="min-h-screen  dark:bg-slate-900 transition-colors duration-300 [&_.ant-typography]:dark:!text-white [&_.ant-card-head-title]:dark:!text-white">
          <div className="max-w-full">
            {/* Header Section */}
            <Card
              className="bg-[#E43636] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
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
                      <UserAddOutlined
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
                        Add New Lawyer
                      </Title>
                      <Text
                        style={{
                          color: "#ffffff",
                          fontSize: "18px",
                          fontWeight: "400",
                        }}
                      >
                        Complete the form below to add a new lawyer to your
                        firms legal team
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
                  Form Progress
                </Text>
                <Progress
                  percent={getFormProgress()}
                  strokeColor="#1e40af"
                  trailColor="#f1f5f9"
                  strokeWidth={8}
                  showInfo={false}
                />
              </div>
            </Card>

            {/* Main Form */}
            <Form<FormValues>
              form={form}
              layout="vertical"
              initialValues={{ status: "Active" }}
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
                      Adding Attorney
                    </Title>
                    <Text
                      className="text-[#64748b] dark:text-[#9ca3af]"
                      style={{ fontSize: "16px" }}
                    >
                      Please wait while we process the registration...
                    </Text>
                  </div>
                </div>
              )}

              <Row gutter={[32, 24]}>
                {/* Profile Image Section */}
                <Col xs={24} lg={8}>
                  <Card
                    title={
                      <Space>
                        <CameraOutlined style={{ color: "#1e40af" }} />
                        <span className="text-[#111827] dark:!text-[#111827] font-[600]">
                          Profile Photo
                        </span>
                      </Space>
                    }
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                    headStyle={{
                      borderBottom: "1px solid #f1f5f9",
                      background: "#fafbfc",
                      borderRadius: "16px 16px 0 0",
                    }}
                    bodyStyle={{ padding: "32px", textAlign: "center" }}
                  >
                    <div
                      style={{
                        position: "relative",
                        display: "inline-block",
                      }}
                    >
                      {previewUrl ? (
                        <Avatar
                          size={120}
                          src={previewUrl}
                          style={{
                            border: "4px solid white",
                            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                          }}
                        />
                      ) : (
                        <Avatar
                          size={120}
                          style={{
                            background: "#f1f5f9",
                            border: "4px solid white",
                            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                          }}
                        >
                          <CameraOutlined
                            style={{ fontSize: "40px", color: "#94a3b8" }}
                          />
                        </Avatar>
                      )}

                      <label
                        style={{
                          position: "absolute",
                          bottom: "4px",
                          right: "4px",
                          background: "#1e40af",
                          borderRadius: "50%",
                          width: "40px",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(30, 64, 175, 0.4)",
                          border: "3px solid white",
                        }}
                      >
                        <CameraOutlined
                          style={{ color: "white", fontSize: "16px" }}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>

                    <div style={{ marginTop: "20px" }}>
                      <Text
                        className="text-[#374151] dark:text-[#FFFFFF]"
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          display: "block",
                        }}
                      >
                        Professional Profile Photo
                      </Text>
                      <Text
                        className="text-[#9ca3af] dark:text-[#6b7280]"
                        style={{
                          fontSize: "14px",
                          marginTop: "4px",
                        }}
                      >
                        Upload a professional headshot for the attorney profile
                      </Text>
                    </div>
                  </Card>
                </Col>

                {/* Form Fields Section */}
                <Col xs={24} lg={16}>
                  <Card
                    title={
                      <Space>
                        <UserOutlined style={{ color: "#1e40af" }} />
                        <span className="text-[#111827] dark:!text-[#111827] font-[600]">
                          Personal & Professional Information
                        </span>
                      </Space>
                    }
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                    headStyle={{
                      borderBottom: "1px solid #f1f5f9",
                      background: "#fafbfc",
                      borderRadius: "16px 16px 0 0",
                    }}
                    bodyStyle={{ padding: "32px" }}
                  >
                    <Row gutter={[24, 16]}>
                      {/* Full Name */}
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={
                            <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                              Full Name
                            </span>
                          }
                          name="name"
                          rules={[
                            {
                              required: true,
                              message: "Please enter the attorney's full name",
                            },
                          ]}
                        >
                          <Input
                            prefix={
                              <UserOutlined style={{ color: "#9ca3af" }} />
                            }
                            placeholder="Enter full legal name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="dark:!bg-[#2A3441] dark:!text-white dark:!border-[#4B5563] dark:placeholder:text-[#9ca3af]"
                            style={{
                              padding: "14px 16px",
                              border: "1px solid #d1d5db",
                              fontSize: "15px",
                            }}
                          />
                        </Form.Item>
                      </Col>

                      {/* Email */}
                      <Col xs={24} md={12}>
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
                              message: "Please enter a valid email address",
                            },
                          ]}
                        >
                          <Input
                            prefix={
                              <MailOutlined style={{ color: "#9ca3af" }} />
                            }
                            placeholder="attorney@lawfirm.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="dark:!bg-[#2A3441] dark:!text-white dark:!border-[#4B5563] dark:placeholder:text-[#9ca3af]"
                            style={{
                              padding: "14px 16px",
                              border: "1px solid #d1d5db",
                              fontSize: "15px",
                            }}
                          />
                        </Form.Item>
                      </Col>

                      {/* Phone */}
                      <Col xs={24} md={12}>
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
                              message: "Please enter a valid phone number",
                            },
                          ]}
                        >
                          <Input
                            prefix={
                              <PhoneOutlined style={{ color: "#9ca3af" }} />
                            }
                            placeholder="+1 (555) 123-4567"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="dark:!bg-[#2A3441] dark:!text-white dark:!border-[#4B5563] dark:placeholder:text-[#9ca3af]"
                            style={{
                              padding: "14px 16px",
                              border: "1px solid #d1d5db",
                              fontSize: "15px",
                            }}
                          />
                        </Form.Item>
                      </Col>

                      {/* Specialization */}
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={
                            <span className="text-[14px] text-[#374151] dark:!text-[#FFFFFF] font-[600]">
                              Legal Specialization
                            </span>
                          }
                          name="specialization"
                        >
                          <Select
                            placeholder="Select primary area of practice"
                            value={specialization}
                            onChange={(value) => setSpecialization(value)}
                            className="
    dark:!bg-[#2A3441] 
    dark:!border-[#4B5563] 
    [&_.ant-select-selector]:dark:!bg-[#2A3441] 
    [&_.ant-select-selector]:dark:!border-[#4B5563] 
    [&_.ant-select-selection-item]:dark:!text-white 
    [&_.ant-select-arrow]:dark:!text-white 
    [&_.ant-select-selection-placeholder]:dark:!text-[#9ca3af] 
    [&_.ant-select-selector]:!min-h-[50px] 
    [&_.ant-select-selector]:!px-4
    [&_.ant-select-arrow]:!top-8
    [&_.ant-select-arrow]:!-translate-y-1/2
  "
                            dropdownClassName="
    dark:!bg-[#2A3441] 
    dark:!border-[#4B5563] 
    [&_.ant-select-item]:dark:!bg-[#2A3441] 
    [&_.ant-select-item]:dark:!text-white 
    [&_.ant-select-item-option-selected]:dark:!bg-[#374151] 
    [&_.ant-select-item-option-active]:dark:!bg-[#374151]
  "
                            style={{ fontSize: "15px" }}
                            showSearch
                            allowClear
                            filterOption={(input, option) =>
                              (option?.children as unknown as string)
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                          >
                            {specializationOptions.map((spec) => (
                              <Option key={spec} value={spec}>
                                {spec}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>

                      {/* Status */}
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={
                            <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                              Employment Status
                            </span>
                          }
                          name="status"
                          rules={[
                            {
                              required: true,
                              message: "Please select employment status",
                            },
                          ]}
                        >
                          <Select
                            value={status}
                            onChange={(value) => setStatus(value)}
                            className="dark:!bg-[#2A3441] dark:!border-[#4B5563] [&_.ant-select-selector]:dark:!bg-[#2A3441] [&_.ant-select-selector]:dark:!border-[#4B5563] [&_.ant-select-selection-item]:dark:!text-white [&_.ant-select-arrow]:dark:!text-white [&_.ant-select-selector]:!min-h-[50px] [&_.ant-select-selector]:!px-4 [&_.ant-select-arrow]:!top-8
                            [&_.ant-select-arrow]:!-translate-y-1/2"
                            dropdownClassName="dark:!bg-[#2A3441] dark:!border-[#4B5563] [&_.ant-select-item]:dark:!bg-[#2A3441] [&_.ant-select-item]:dark:!text-white [&_.ant-select-item-option-selected]:dark:!bg-[#374151] [&_.ant-select-item-option-active]:dark:!bg-[#374151]"
                            style={{
                              fontSize: "15px",
                            }}
                          >
                            <Option value="Active">
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <CheckCircleOutlined
                                  style={{ color: "#059669" }}
                                />
                                <span>Active - Full Access</span>
                              </div>
                            </Option>
                            <Option value="Inactive">
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <LockOutlined style={{ color: "#dc2626" }} />
                                <span>Inactive - Limited Access</span>
                              </div>
                            </Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Additional Info Card */}
                    <div className="bg-blue-50 dark:bg-slate-700/50 border border-blue-200 dark:border-slate-600 rounded-xl p-5 mt-6">
                      <Title
                        level={5}
                        className="text-[#1e40af] dark:text-[#60a5fa]"
                        style={{
                          marginBottom: "8px",
                          fontSize: "16px",
                        }}
                      >
                        Account Setup Information
                      </Title>
                      <Text
                        className="text-[#334155] dark:text-[#cbd5e1]"
                        style={{
                          fontSize: "14px",
                          lineHeight: "1.6",
                        }}
                      >
                        The attorney will receive login credentials via email
                        upon successful registration. They can update their
                        profile and change their password after first login.
                      </Text>
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Action Buttons */}
              <Card
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mt-[40px]"
                bodyStyle={{ padding: "24px" }}
              >
                <Row justify="center">
                  <Col>
                    <Space size="large">
                      <Button
                        size="large"
                        onClick={() => router.back()}
                        style={{
                          border: "1px solid #d1d5db",
                          fontWeight: "600",
                          padding: "12px 32px",
                          height: "48px",
                          color: "#374151",
                        }}
                      >
                        Cancel
                      </Button>

                      <Button
                        type="primary"
                        size="large"
                        icon={<SaveOutlined />}
                        onClick={async () => {
                          try {
                            // validateFields will throw if any required field is empty
                            await form.validateFields();

                            showCreationModal();
                          } catch (err) {
                            console.log("Validation failed:", err);
                          }
                        }}
                        style={{
                          background: "#1e40af",
                          borderColor: "#1e40af",
                          borderRadius: "12px",
                          fontWeight: "600",
                          padding: "12px 32px",
                          height: "48px",
                          boxShadow: "0 4px 12px rgba(30, 64, 175, 0.3)",
                        }}
                      >
                        Add Lawyer To Firm
                      </Button>
                      <ConfirmationModal
                        visible={isCreateModalVisible}
                        entityName={name || "Lawyer"}
                        action="create"
                        onConfirm={handleConfirmCreate}
                        onCancel={hideCreateModal}
                      />
                    </Space>

                    <div style={{ marginTop: "24px", textAlign: "center" }}>
                      <Text
                        className="text-[#9ca3af] dark:text-[#6b7280]"
                        style={{ fontSize: "14px" }}
                      >
                        By adding this attorney, you confirm they have agreed to
                        join your firm
                      </Text>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Form>
          </div>
        </div>
      </DashboardLayout>
    </ThemeProvider>
  );
}
