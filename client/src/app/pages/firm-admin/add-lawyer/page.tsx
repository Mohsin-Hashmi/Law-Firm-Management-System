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
  Spin,
  Avatar,
  Steps,
  Progress,
  Divider,
  Space,
} from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  BankOutlined,
  CameraOutlined,
  SaveOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  LockOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { addLawyer } from "@/app/service/adminAPI";
import { useAppSelector } from "@/app/store/hooks";
import { RootState } from "@/app/store/store";

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
      if (!firmId) {
        toast.error("Firm ID is missing!");
        return;
      }
      const response = await addLawyer(firmId, formData);

      if (!response) {
        toast.error("Failed to create lawyer");
        return;
      }

      toast.success("Attorney added successfully!");
      router.push("/pages/firm-admin/get-lawyers");

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
    <DashboardLayout>
      <div
        style={{
          background: "#f8fafc",
          minHeight: "100vh",
          // padding: "10px"
        }}
      >
        <div className="max-w-[900px] mx-auto">
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
                  <UserAddOutlined
                    style={{ fontSize: "32px", color: "white" }}
                  />
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
                  Add New Lawyer
                </Title>
                <Text
                  style={{
                    fontSize: "16px",
                    color: "#64748b",
                    lineHeight: "1.5",
                  }}
                >
                  Complete the form below to add a new lawyer to your firms
                  legal team
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
              onFinish={handleCreateLawyer}
              initialValues={{ status: "Active" }}
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
                      Adding Attorney
                    </Title>
                    <Text style={{ color: "#64748b", fontSize: "16px" }}>
                      Please wait while we process the registration...
                    </Text>
                  </div>
                </div>
              )}

              {/* Profile Section */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "48px",
                  padding: "32px",
                  background: "#f8fafc",
                  borderRadius: "16px",
                  border: "2px dashed #cbd5e1",
                }}
              >
                <div style={{ position: "relative", display: "inline-block" }}>
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
                    style={{
                      fontSize: "16px",
                      color: "#374151",
                      fontWeight: "600",
                      display: "block",
                    }}
                  >
                    Professional Profile Photo
                  </Text>
                  <Text
                    style={{
                      fontSize: "14px",
                      color: "#9ca3af",
                      marginTop: "4px",
                    }}
                  >
                    Upload a professional headshot for the attorney profile
                  </Text>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information Section */}
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
                      <IdcardOutlined
                        style={{ marginRight: "8px", color: "#1e40af" }}
                      />
                      Personal Information
                    </Title>
                    <Text style={{ color: "#9ca3af", fontSize: "14px" }}>
                      Basic attorney details and contact information
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
                      prefix={<UserOutlined style={{ color: "#9ca3af" }} />}
                      placeholder="Enter full legal name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                      prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
                      placeholder="attorney@lawfirm.com"
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
                    name="phone"
                    rules={[
                      {
                        required: true,
                        message: "Please enter a valid phone number",
                      },
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
                </div>

                {/* Professional Information Section */}
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
                      Professional Details
                    </Title>
                    <Text style={{ color: "#9ca3af", fontSize: "14px" }}>
                      Legal specialization and employment status
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
                        Legal Specialization
                      </span>
                    }
                    name="specialization"
                  >
                    <Select
                      placeholder="Select primary area of practice"
                      value={specialization}
                      onChange={(value) => setSpecialization(value)}
                      style={{
                        fontSize: "15px",
                      }}
                      dropdownStyle={{
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                      }}
                      showSearch
                      allowClear
                      filterOption={(input, option) =>
                        (option?.children as unknown as string)
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {specializationOptions.map((spec) => (
                        <Option key={spec} value={spec}>
                          {spec}
                        </Option>
                      ))}
                    </Select>
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
                      style={{
                        fontSize: "15px",
                      }}
                      dropdownStyle={{
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
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
                          <CheckCircleOutlined style={{ color: "#059669" }} />
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

                  {/* Additional Info Card */}
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
                        marginBottom: "8px",
                        fontSize: "16px",
                      }}
                    >
                      Account Setup Information
                    </Title>
                    <Text
                      style={{
                        color: "#334155",
                        fontSize: "14px",
                        lineHeight: "1.6",
                      }}
                    >
                      The attorney will receive login credentials via email upon
                      successful registration. They can update their profile and
                      change their password after first login.
                    </Text>
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
                    Add Lawyer to Firm
                  </Button>
                </Space>

                <div style={{ marginTop: "24px" }}>
                  <Text style={{ color: "#9ca3af", fontSize: "14px" }}>
                    By adding this attorney, you confirm they have agreed to
                    join your firm
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
