"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { ThemeProvider } from "next-themes";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Avatar,
  Spin,
  Button,
  Form,
  Input,
  Select,
  Upload,
  message,
  Divider,
  DatePicker,
  InputNumber,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
  UploadOutlined,
  PlusOutlined,
  CameraOutlined,
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
  DollarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { getClientById } from "@/app/service/adminAPI";
import { updateClient } from "@/app/service/adminAPI";
import { ClientPayload, Client } from "@/app/types/client";
import type { UploadProps, UploadFile } from "antd";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function EditClient({ params }: { params: { id: number } }) {
  const router = useRouter();
  const clientId = params.id;
  const [form] = Form.useForm();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string>("");

  useEffect(() => {
    if (clientId) fetchClientDetail();
  }, [clientId]);

  const fetchClientDetail = async () => {
    try {
      setLoading(true);
      const data = await getClientById(clientId);
      if (!data) {
        toast.error("Client not found");
        return;
      }
      setClient(data);

      // Populate form with existing data
      form.setFieldsValue({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        clientType: data.clientType,
        organization: data.organization,
        status: data.status,
        billingAddress: data.billingAddress,
        outstandingBalance: data.outstandingBalance,
        gender: data.gender,
        dob: data.dob ? dayjs(data.dob) : undefined,
      });

      // Set existing profile image
      if (data.profileImage) {
        setPreviewImage(`http://localhost:5000${data.profileImage}`);
      }
    } catch (error) {
      console.error("Error fetching client detail:", error);
      toast.error("Failed to fetch client detail");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: ClientPayload) => {
    try {
      setSubmitting(true);

      // Prepare the client data object
      const clientData: ClientPayload = {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        address: values.address,
        clientType: values.clientType,
        organization: values.organization,
        status: values.status,
        billingAddress: values.billingAddress,
        outstandingBalance: values.outstandingBalance,
        gender: values.gender,
        dob: values.dob ? dayjs(values.dob).format("YYYY-MM-DD") : undefined,
        firmId: client?.firmId || 1, // Use existing firmId or default
      };

      // Call the API with the correct parameters
      const response = await updateClient(clientId, clientData);

      toast.success("Client profile updated successfully!");
      router.push(`/pages/firm-admin/get-client-detail/${clientId}`);
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Failed to update client profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    setFileList(newFileList);

    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const file = newFileList[0].originFileObj;
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadButton = (
    <div style={{ textAlign: "center" }}>
      <CameraOutlined
        style={{ fontSize: "24px", color: "#9ca3af", marginBottom: "8px" }}
      />
      <div style={{ color: "#64748b", fontSize: "14px" }}>Upload Photo</div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex justify-center items-center transition-colors duration-300">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout>
        <div
          style={{
            background: "#f8fafc",
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <UserOutlined
              style={{
                fontSize: "64px",
                color: "#9ca3af",
                marginBottom: "16px",
              }}
            />
            <Title level={3} style={{ color: "#64748b" }}>
              Client Not Found
            </Title>
            <Text style={{ color: "#64748b", fontSize: "16px" }}>
              The requested client profile could not be found.
            </Text>
            <br />
            <Button
              type="primary"
              onClick={() => router.back()}
              style={{ marginTop: "16px" }}
            >
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DashboardLayout>
        <div className="min-h-screen p-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 [&_.ant-typography]:dark:!text-white [&_.ant-card-head-title]:dark:!text-white">
          <div className="max-w-[1200px] mx-auto">
            {/* Header Section */}
            <Card
              className="bg-emerald-600 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
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
                      <EditOutlined
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
                        Edit Client Profile
                      </Title>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "18px",
                          fontWeight: "400",
                        }}
                      >
                        Update client information and contact details
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

            {/* Edit Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
            >
              <Row gutter={[32, 24]}>
                {/* Profile Image Section */}
                <Col xs={24} lg={8}>
                  <Card
                    title={
                      <Space>
                        <CameraOutlined style={{ color: "#059669" }} />
                        <span style={{ color: "#111827", fontWeight: "600" }}>
                          Profile Photo
                        </span>
                      </Space>
                    }
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
                    headStyle={{
                      borderBottom: "1px solid #f1f5f9",
                      background: "#fafbfc",
                      borderRadius: "16px 16px 0 0",
                    }}
                    bodyStyle={{ padding: "32px", textAlign: "center" }}
                  >
                    <div style={{ marginBottom: "24px" }}>
                      <Avatar
                        size={160}
                        src={previewImage}
                        icon={!previewImage && <UserOutlined />}
                        style={{
                          background: previewImage ? "transparent" : "#f1f5f9",
                          border: "4px solid #e5e7eb",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                          marginBottom: "16px",
                        }}
                      />
                    </div>

                    <Upload
                      listType="text"
                      fileList={fileList}
                      onChange={handleImageChange}
                      beforeUpload={() => false}
                      maxCount={1}
                      accept="image/*"
                      showUploadList={false}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        style={{
                          borderRadius: "12px",
                          border: "1px solid #d1d5db",
                          fontWeight: "500",
                          padding: "8px 24px",
                          height: "40px",
                        }}
                      >
                        Change Photo
                      </Button>
                    </Upload>

                    <Text
                      style={{
                        display: "block",
                        marginTop: "12px",
                        color: "#64748b",
                        fontSize: "12px",
                      }}
                    >
                      PNG, JPG, GIF up to 10MB
                    </Text>
                  </Card>
                </Col>

                {/* Form Fields Section */}
                <Col xs={24} lg={16}>
                  <Card
                    title={
                      <Space>
                        <UserOutlined style={{ color: "#059669" }} />
                        <span style={{ color: "#111827", fontWeight: "600" }}>
                          Personal Information
                        </span>
                      </Space>
                    }
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
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
                          name="fullName"
                          rules={[
                            {
                              required: true,
                              message: "Please enter client name",
                            },
                          ]}
                        >
                          <Input
                            prefix={
                              <UserOutlined style={{ color: "#9ca3af" }} />
                            }
                            placeholder="Enter full name"
                            size="large"
                            className="dark:!bg-[#2A3441] dark:!text-white dark:!border-[#4B5563] dark:placeholder:text-[#9ca3af]"
                            style={{
                              border: "1px solid #d1d5db",
                              padding: "12px 16px",
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
                              message: "Please enter email address",
                            },
                            {
                              type: "email",
                              message: "Please enter a valid email address",
                            },
                          ]}
                        >
                          <Input
                            prefix={
                              <MailOutlined style={{ color: "#9ca3af" }} />
                            }
                            placeholder="Enter email address"
                            size="large"
                            className="dark:!bg-[#2A3441] dark:!text-white dark:!border-[#4B5563] dark:placeholder:text-[#9ca3af]"
                            style={{
                              border: "1px solid #d1d5db",
                              padding: "12px 16px",
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
                              message: "Please enter phone number",
                            },
                          ]}
                        >
                          <Input
                            prefix={
                              <PhoneOutlined style={{ color: "#9ca3af" }} />
                            }
                            placeholder="Enter phone number"
                            size="large"
                            className="dark:!bg-[#2A3441] dark:!text-white dark:!border-[#4B5563] dark:placeholder:text-[#9ca3af]"
                            style={{
                              border: "1px solid #d1d5db",
                              padding: "12px 16px",
                            }}
                          />
                        </Form.Item>
                      </Col>

                      {/* Date of Birth */}
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={
                            <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                              Date of Birth
                            </span>
                          }
                          name="dob"
                        >
                          <DatePicker
                            placeholder="Select date of birth"
                            size="large"
                            className="w-full dark:!bg-[#2A3441] dark:!text-white dark:!border-[#4B5563] dark:placeholder:text-[#ffffff]"
                            style={{
                              border: "1px solid #d1d5db",
                              padding: "12px 16px",
                            }}
                            suffixIcon={
                              <CalendarOutlined style={{ color: "#9ca3af" }} />
                            }
                          />
                        </Form.Item>
                      </Col>

                      {/* Gender */}
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={
                            <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                              Gender
                            </span>
                          }
                          name="gender"
                        >
                          <Select
                            placeholder="Select gender"
                            size="large"
                            className="
    dark:!bg-[#2A3441] 
    dark:!border-[#4B5563] 
    [&_.ant-select-selector]:dark:!bg-[#2A3441] 
    [&_.ant-select-selector]:dark:!border-[#4B5563] 
    [&_.ant-select-selection-item]:dark:!text-white 
    [&_.ant-select-arrow]:dark:!text-white 
    [&_.ant-select-selector]:!min-h-[50px] 
    [&_.ant-select-selection-placeholder]:dark:!text-[#9ca3af] 
  "
                            dropdownClassName="
    dark:!bg-[#2A3441] dark:!border-[#4B5563] 
    [&_.ant-select-item]:dark:!bg-[#2A3441] 
    [&_.ant-select-item]:dark:!text-white 
    [&_.ant-select-item-option-selected]:dark:!bg-[#374151] 
    [&_.ant-select-item-option-active]:dark:!bg-[#374151]
  "
                            style={{
                              borderRadius: "12px",
                            }}
                          >
                            <Option value="Male">Male</Option>
                            <Option value="Female">Female</Option>
                            <Option value="Other">Other</Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      {/* Client Type */}
                      <Col xs={24} md={12}>
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
                          <Select
                            placeholder="Select client type"
                            size="large"
                            className="
    dark:!bg-[#2A3441] 
    dark:!border-[#4B5563] 
    [&_.ant-select-selector]:dark:!bg-[#2A3441] 
    [&_.ant-select-selector]:dark:!border-[#4B5563] 
    [&_.ant-select-selection-item]:dark:!text-white 
    [&_.ant-select-arrow]:dark:!text-white 
    [&_.ant-select-selector]:!min-h-[50px] 
    [&_.ant-select-selection-placeholder]:dark:!text-[#9ca3af] 
  "
                            dropdownClassName="
    dark:!bg-[#2A3441] dark:!border-[#4B5563] 
    [&_.ant-select-item]:dark:!bg-[#2A3441] 
    [&_.ant-select-item]:dark:!text-white 
    [&_.ant-select-item-option-selected]:dark:!bg-[#374151] 
    [&_.ant-select-item-option-active]:dark:!bg-[#374151]
  "
                            style={{}}
                            suffixIcon={
                              <TeamOutlined style={{ color: "#9ca3af" }} />
                            }
                          >
                            <Option value="Individual">Individual</Option>
                            <Option value="Business">Business</Option>
                            <Option value="Corporate">Corporate</Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      {/* Organization (conditional) */}
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={
                            <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                              Organization
                            </span>
                          }
                          name="organization"
                        >
                          <Input
                            prefix={
                              <BankOutlined style={{ color: "#9ca3af" }} />
                            }
                            placeholder="Enter organization name"
                            size="large"
                            className="dark:!bg-[#2A3441] dark:!text-white dark:!border-[#4B5563] dark:placeholder:text-[#9ca3af]"
                            style={{
                              border: "1px solid #d1d5db",
                              padding: "12px 16px",
                            }}
                          />
                        </Form.Item>
                      </Col>

                      {/* Address */}
                      <Col xs={24}>
                        <Form.Item
                          label={
                            <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                              Address
                            </span>
                          }
                          name="address"
                        >
                          <TextArea
                            placeholder="Enter full address"
                            rows={3}
                            className="dark:!bg-[#2A3441] dark:!text-white dark:!border-[#4B5563] dark:placeholder:text-[#9ca3af]"
                            style={{
                              border: "1px solid #d1d5db",
                            }}
                          />
                        </Form.Item>
                      </Col>

                      {/* Billing Address */}
                      <Col xs={24}>
                        <Form.Item
                          label={
                            <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                              Billing Address
                            </span>
                          }
                          name="billingAddress"
                        >
                          <TextArea
                            placeholder="Enter billing address (if different from address)"
                            rows={3}
                            className="dark:!bg-[#2A3441] dark:!text-white dark:!border-[#4B5563] dark:placeholder:text-[#9ca3af]"
                            style={{
                              border: "1px solid #d1d5db",
                            }}
                          />
                        </Form.Item>
                      </Col>

                      {/* Outstanding Balance */}
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={
                            <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                              Outstanding Balance
                            </span>
                          }
                          name="outstandingBalance"
                        >
                          <InputNumber
                            prefix={
                              <DollarOutlined style={{ color: "#9ca3af" }} />
                            }
                            placeholder="0.00"
                            size="large"
                            min={0}
                            precision={2}
                            className="w-full dark:!bg-[#2A3441] dark:!text-white dark:!border-[#4B5563] dark:placeholder:text-[#9ca3af] [&_.ant-select-selection-placeholder]:dark:!text-white [&_.ant-input-number-input]:dark:!text-white"
                            style={{ padding: "6px 10px", fontSize: "14px" }}
                          />
                        </Form.Item>
                      </Col>

                      {/* Status */}
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={
                            <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                              Status
                            </span>
                          }
                          name="status"
                          rules={[
                            { required: true, message: "Please select status" },
                          ]}
                        >
                          <Select
                            placeholder="Select status"
                            size="large"
                            className="dark:!bg-[#2A3441] dark:!border-[#4B5563] [&_.ant-select-selector]:dark:!bg-[#2A3441] [&_.ant-select-selector]:dark:!border-[#4B5563] [&_.ant-select-selection-item]:dark:!text-white [&_.ant-select-arrow]:dark:!text-white [&_.ant-select-selector]:!min-h-[50px] [&_.ant-select-selector"
                            dropdownClassName="dark:!bg-[#2A3441] dark:!border-[#4B5563] [&_.ant-select-item]:dark:!bg-[#2A3441] [&_.ant-select-item]:dark:!text-white [&_.ant-select-item-option-selected]:dark:!bg-[#374151] [&_.ant-select-item-option-active]:dark:!bg-[#374151]"
                            
                          >
                            <Option value="Active">
                              <Space>
                                <div
                                  style={{
                                    width: "8px",
                                    height: "8px",
                                    background: "#10b981",
                                    borderRadius: "50%",
                                    
                                  }}
                                />
                                Active
                              </Space>
                            </Option>
                            <Option value="Past">
                              <Space>
                                <div
                                  style={{
                                    width: "8px",
                                    height: "8px",
                                    background: "#6b7280",
                                    borderRadius: "50%",
                                  }}
                                />
                                Past
                              </Space>
                            </Option>
                            <Option value="Potential">
                              <Space>
                                <div
                                  style={{
                                    width: "8px",
                                    height: "8px",
                                    background: "#f59e0b",
                                    borderRadius: "50%",
                                  }}
                                />
                                Potential
                              </Space>
                            </Option>
                            <Option value="Suspended">
                              <Space>
                                <div
                                  style={{
                                    width: "8px",
                                    height: "8px",
                                    background: "#ef4444",
                                    borderRadius: "50%",
                                  }}
                                />
                                Suspended
                              </Space>
                            </Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>

              {/* Action Buttons */}
              <Card
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mt-[40px] mb-[40px]"
                bodyStyle={{ padding: "24px" }}
              >
                <Row justify="center">
                  <Col>
                    <Space size="large">
                      <Button
                        size="large"
                        onClick={() => router.back()}
                        style={{
                          borderRadius: "12px",
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
                        htmlType="submit"
                        loading={submitting}
                        icon={<SaveOutlined />}
                        style={{
                          background: "#059669",
                          borderColor: "#059669",
                          borderRadius: "12px",
                          fontWeight: "600",
                          padding: "12px 32px",
                          height: "48px",
                          boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
                        }}
                      >
                        {submitting ? "Updating..." : "Update Client Profile"}
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </Form>

            {/* Current Profile Preview */}
            <Card
              title={
                <Space>
                  <UserOutlined style={{ color: "#059669" }} />
                  <span style={{ color: "#111827", fontWeight: "600" }}>
                    Current Profile Preview
                  </span>
                </Space>
              }
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mb-[40px]"
              headStyle={{
                borderBottom: "1px solid #f1f5f9",
                background: "#fafbfc",
                borderRadius: "16px 16px 0 0",
              }}
              bodyStyle={{ padding: "32px" }}
            >
              <Row gutter={[24, 24]} align="middle">
                <Col xs={24} sm={8} md={6} className="flex justify-center">
                  <Avatar
                    size={120}
                    src={
                      previewImage ||
                      (client.profileImage
                        ? `http://localhost:5000${client.profileImage}`
                        : undefined)
                    }
                    icon={
                      !previewImage && !client.profileImage && <UserOutlined />
                    }
                    style={{
                      background:
                        previewImage || client.profileImage
                          ? "transparent"
                          : "#f1f5f9",
                      border: "2px solid #e5e7eb",
                    }}
                  />
                </Col>
                <Col xs={24} sm={16} md={18}>
                  <Space direction="vertical" size="middle">
                    <Title level={3} style={{ margin: 0, color: "#111827" }}>
                      {form.getFieldValue("fullName") || client.fullName}
                    </Title>

                    <Space wrap>
                      <Space>
                        <MailOutlined style={{ color: "#9ca3af" }} />
                        <Text style={{ color: "#64748b" }}>
                          {form.getFieldValue("email") || client.email}
                        </Text>
                      </Space>
                      <Space>
                        <PhoneOutlined style={{ color: "#9ca3af" }} />
                        <Text style={{ color: "#64748b" }}>
                          {form.getFieldValue("phone") || client.phone}
                        </Text>
                      </Space>
                    </Space>

                    <Space wrap>
                      <Space>
                        <TeamOutlined style={{ color: "#9ca3af" }} />
                        <Text style={{ color: "#64748b" }}>
                          {form.getFieldValue("clientType") ||
                            client.clientType}
                        </Text>
                      </Space>
                      {(form.getFieldValue("organization") ||
                        client.organization) && (
                        <Space>
                          <BankOutlined style={{ color: "#9ca3af" }} />
                          <Text style={{ color: "#64748b" }}>
                            {form.getFieldValue("organization") ||
                              client.organization}
                          </Text>
                        </Space>
                      )}
                    </Space>

                    {(form.getFieldValue("outstandingBalance") ||
                      client.outstandingBalance) && (
                      <Space>
                        <DollarOutlined style={{ color: "#9ca3af" }} />
                        <Text style={{ color: "#64748b" }}>
                          Outstanding: $
                          {(
                            form.getFieldValue("outstandingBalance") ||
                            client.outstandingBalance ||
                            0
                          ).toFixed(2)}
                        </Text>
                      </Space>
                    )}

                    <div>
                      {(() => {
                        const status =
                          form.getFieldValue("status") || client.status;
                        const statusConfig = {
                          Active: { color: "#10b981", textColor: "#059669" },
                          Past: { color: "#6b7280", textColor: "#374151" },
                          Potential: { color: "#f59e0b", textColor: "#d97706" },
                          Suspended: { color: "#ef4444", textColor: "#dc2626" },
                        };
                        const config =
                          statusConfig[status as keyof typeof statusConfig] ||
                          statusConfig.Active;

                        return (
                          <Space>
                            <div
                              style={{
                                width: "8px",
                                height: "8px",
                                background: config.color,
                                borderRadius: "50%",
                              }}
                            />
                            <Text
                              style={{
                                color: config.textColor,
                                fontWeight: "500",
                              }}
                            >
                              {status}
                            </Text>
                          </Space>
                        );
                      })()}
                    </div>
                  </Space>
                </Col>
              </Row>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ThemeProvider>
  );
}
