"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";
import { ThemeProvider } from "next-themes";
import ConfirmationModal from "@/app/components/ConfirmationModal";
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
} from "@ant-design/icons";
import { getLawyerById, updateLawyer } from "@/app/service/adminAPI";
import { Lawyer } from "@/app/types/firm";
import type { UploadProps, UploadFile } from "antd";
import { toast } from "react-hot-toast";
import BASE_URL from "@/app/utils/constant";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function EditLawyer({ params }: { params: { id: number } }) {
  const router = useRouter();
  const lawyerId = params.id;
  const [form] = Form.useForm();

  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  useEffect(() => {
    if (lawyerId) fetchLawyerDetail();
  }, [lawyerId]);

  const fetchLawyerDetail = async () => {
    try {
      setLoading(true);
      const data = await getLawyerById(lawyerId);
      if (!data) {
        toast.error("Lawyer not found");
        return;
      }
      setLawyer(data);

      // Populate form with existing data
      form.setFieldsValue({
        name: data.name,
        email: data.email,
        phone: data.phone,
        specialization: data.specialization,
        status: data.status,
      });

      // Set existing profile image
      if (data.profileImage) {
        setPreviewImage(`${BASE_URL}${data.profileImage}`);
      }
    } catch (error) {
      console.error("Error fetching lawyer detail:", error);
      toast.error("Failed to fetch lawyer detail");
    } finally {
      setLoading(false);
    }
  };
  const showUpdateModal = () => setIsUpdateModalVisible(true);
  const hideUpdateModal = () => setIsUpdateModalVisible(false);
  const handleConfirmUpdate = () => {
    hideUpdateModal();
    form.submit(); // Trigger form submission
  };

  const handleSubmit = async (values: Lawyer) => {
    try {
      setSubmitting(true);

      // Prepare the lawyer data object
      const lawyerData: Partial<Lawyer> = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        specialization: values.specialization,
        status: values.status,
      };

      // Get the file if one was selected
      const file =
        fileList.length > 0 && fileList[0].originFileObj
          ? (fileList[0].originFileObj as File)
          : undefined;

      // Call the API with the correct parameters
      const response = await updateLawyer(lawyerId, lawyerData, file);

      toast.success("Lawyer profile updated successfully!");
      router.push(`/get-lawyer-detail/${lawyerId}`);
    } catch (error) {
      console.error("Error updating lawyer:", error);
      toast.error("Failed to update lawyer profile");
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
        <div className="min-h-screen flex justify-center items-center transition-colors duration-300">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!lawyer) {
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
              Lawyer Not Found
            </Title>
            <Text style={{ color: "#64748b", fontSize: "16px" }}>
              The requested lawyer profile could not be found.
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
        <div className="min-h-screen   transition-colors duration-300 [&_.ant-typography]:dark:!text-white [&_.ant-card-head-title]:dark:!text-white">
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
                        Edit Lawyer Profile
                      </Title>
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: "18px",
                          fontWeight: "400",
                        }}
                      >
                        Update lawyer information and professional details
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
                        <CameraOutlined style={{ color: "#1e40af" }} />
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
                        src={previewImage || undefined} // show image if exists
                        icon={!previewImage ? <UserOutlined /> : undefined} // fallback icon
                        style={{
                          background: previewImage ? "transparent" : " #F1F5F9 dark:#1E293B",
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
                        <UserOutlined style={{ color: "#1e40af" }} />
                        <span style={{ color: "#111827", fontWeight: "600" }}>
                          Personal & Professional Information
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
                          name="name"
                          rules={[
                            {
                              required: true,
                              message: "Please enter lawyer name",
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

                      {/* Specialization */}
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={
                            <span className="text-[14px] text-[#374151] dark:text-[#FFFFFF] font-[600]">
                              Specialization
                            </span>
                          }
                          name="specialization"
                          rules={[
                            {
                              required: true,
                              message: "Please select specialization",
                            },
                          ]}
                        >
                          <Select
                            placeholder="Select specialization"
                            size="large"
                            className="dark:!bg-[#2A3441] dark:!border-[#4B5563] [&_.ant-select-selector]:dark:!bg-[#2A3441] [&_.ant-select-selector]:dark:!border-[#4B5563] [&_.ant-select-selection-item]:dark:!text-white [&_.ant-select-arrow]:dark:!text-white [&_.ant-select-selector]:!min-h-[50px] [&_.ant-select-selector]:!px-4 [&_.ant-select-arrow]:!top-8
                            [&_.ant-select-arrow]:!-translate-y-1/2"
                            dropdownClassName="dark:!bg-slate-800 [&_.ant-select-item]:dark:!bg-slate-800 [&_.ant-select-item]:dark:!text-white [&_.ant-select-item-option-selected]:dark:!bg-slate-700 [&_.ant-select-item-option-active]:dark:!bg-slate-700"
                            style={{}}
                            suffixIcon={
                              <BankOutlined style={{ color: "#9ca3af" }} />
                            }
                          >
                            <Option value="Criminal Law">Criminal Law</Option>
                            <Option value="Corporate Law">Corporate Law</Option>
                            <Option value="Family Law">Family Law</Option>
                            <Option value="Real Estate Law">
                              Real Estate Law
                            </Option>
                            <Option value="Immigration Law">
                              Immigration Law
                            </Option>
                            <Option value="Intellectual Property">
                              Intellectual Property
                            </Option>
                            <Option value="Employment Law">
                              Employment Law
                            </Option>
                            <Option value="Tax Law">Tax Law</Option>
                            <Option value="Environmental Law">
                              Environmental Law
                            </Option>
                            <Option value="General Practice">
                              General Practice
                            </Option>
                          </Select>
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
                            className="dark:!bg-[#2A3441] dark:!border-[#4B5563] [&_.ant-select-selector]:dark:!bg-[#2A3441] [&_.ant-select-selector]:dark:!border-[#4B5563] [&_.ant-select-selection-item]:dark:!text-white [&_.ant-select-arrow]:dark:!text-white [&_.ant-select-selector]:!min-h-[50px] [&_.ant-select-selector]:!px-4 [&_.ant-select-arrow]:!top-8
                            [&_.ant-select-arrow]:!-translate-y-1/2"
                            dropdownClassName="dark:!bg-[#2A3441] dark:!border-[#4B5563] [&_.ant-select-item]:dark:!bg-[#2A3441] [&_.ant-select-item]:dark:!text-white [&_.ant-select-item-option-selected]:dark:!bg-[#374151] [&_.ant-select-item-option-active]:dark:!bg-[#374151]"
                            style={{}}
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
                            <Option value="Inactive">
                              <Space>
                                <div
                                  style={{
                                    width: "8px",
                                    height: "8px",
                                    background: "#ef4444",
                                    borderRadius: "50%",
                                  }}
                                />
                                Inactive
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
                        icon={<SaveOutlined />}
                        onClick={showUpdateModal}
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
                        Update Lawyer Profile
                      </Button>
                      <ConfirmationModal
                        visible={isUpdateModalVisible}
                        entityName={lawyer?.name || "Lawyer"}
                        action="update"
                        onConfirm={handleConfirmUpdate}
                        onCancel={hideUpdateModal}
                      />
                    </Space>
                  </Col>
                </Row>
              </Card>
            </Form>

            {/* Current Profile Preview */}
            <Card
              title={
                <Space>
                  <UserOutlined style={{ color: "#1e40af" }} />
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
                      (lawyer.profileImage
                        ? `${BASE_URL}${lawyer.profileImage}`
                        : undefined)
                    }
                    icon={
                      !previewImage && !lawyer.profileImage && <UserOutlined />
                    }
                    style={{
                      background:
                        previewImage || lawyer.profileImage
                          ? "transparent"
                          : "#f1f5f9",
                      border: "2px solid #e5e7eb",
                    }}
                  />
                </Col>
                <Col xs={24} sm={16} md={18}>
                  <Space direction="vertical" size="middle">
                    <Title level={3} style={{ margin: 0, color: "#111827" }}>
                      {form.getFieldValue("name") || lawyer.name}
                    </Title>

                    <Space wrap>
                      <Space>
                        <MailOutlined style={{ color: "#9ca3af" }} />
                        <Text style={{ color: "#64748b" }}>
                          {form.getFieldValue("email") || lawyer.email}
                        </Text>
                      </Space>
                      <Space>
                        <PhoneOutlined style={{ color: "#9ca3af" }} />
                        <Text style={{ color: "#64748b" }}>
                          {form.getFieldValue("phone") || lawyer.phone}
                        </Text>
                      </Space>
                    </Space>

                    <Space>
                      <BankOutlined style={{ color: "#9ca3af" }} />
                      <Text style={{ color: "#64748b" }}>
                        {form.getFieldValue("specialization") ||
                          lawyer.specialization ||
                          "General Practice"}
                      </Text>
                    </Space>

                    <div>
                      {(
                        form.getFieldValue("status") || lawyer.status
                      )?.toLowerCase() === "active" ? (
                        <Space>
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              background: "#10b981",
                              borderRadius: "50%",
                            }}
                          />
                          <Text style={{ color: "#059669", fontWeight: "500" }}>
                            Active
                          </Text>
                        </Space>
                      ) : (
                        <Space>
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              background: "#ef4444",
                              borderRadius: "50%",
                            }}
                          />
                          <Text style={{ color: "#dc2626", fontWeight: "500" }}>
                            Inactive
                          </Text>
                        </Space>
                      )}
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
