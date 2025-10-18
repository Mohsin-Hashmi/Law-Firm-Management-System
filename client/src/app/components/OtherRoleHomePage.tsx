"use client";
import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Avatar,
  Divider,
  Badge,
  Timeline,
  Progress,
  Statistic,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  FileOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  BankOutlined,
  BookOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  BellOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  DashboardOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../store/hooks";
import { RootState } from "../store/store";

const { Title, Text, Paragraph } = Typography;

interface OtherRoleProps {
  role: string;
  name?: string;
}

export default function OtherRoleHomePage({ role, name }: OtherRoleProps) {
  const router = useRouter();
  const user = useAppSelector((state: RootState) => state.user.user);
  const firm = useAppSelector((state: RootState) => state.firm.firm);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const quickActions = [
    {
      title: "View Profile",
      description: "Update your personal information and preferences",
      icon: <UserOutlined />,
      color: "#1e40af",
      action: () => router.push("/profile"),
    },
    {
      title: "Contact Support",
      description: "Get help from our support team",
      icon: <QuestionCircleOutlined />,
      color: "#059669",
      action: () => router.push("/support"),
    },
    {
      title: "View Calendar",
      description: "Check your schedule and appointments",
      icon: <CalendarOutlined />,
      color: "#dc2626",
      action: () => router.push("/calendar"),
    },
    {
      title: "Settings",
      description: "Configure your account settings",
      icon: <SettingOutlined />,
      color: "#7c3aed",
      action: () => router.push("/settings"),
    },
  ];

  const notifications = [
    {
      title: "Welcome to the firm!",
      description: "Your account has been successfully activated",
      time: "Today",
      type: "success",
    },
    {
      title: "Profile completion needed",
      description: "Please complete your profile information",
      time: "2 days ago",
      type: "warning",
    },
    {
      title: "System maintenance",
      description: "Scheduled maintenance this weekend",
      time: "1 week ago",
      type: "info",
    },
  ];

  return (
    <div className="min-h-screen transition-colors duration-300">
      <div className="max-w-full">
        {/* Professional Header */}
        <Card
          className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg mb-8 !transition-none"
          bodyStyle={{ padding: "20px 16px" }}
        >
          <Row align="middle" justify="space-between">
            <Col xs={24} sm={24} md={18} lg={18}>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
                
                <div className="w-16 h-16 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border-2 bg-white/15 dark:bg-white/10 border-white/20 dark:border-white/30 flex-shrink-0">
                  <Avatar
                    size={48}
                    icon={<UserOutlined />}
                    className="bg-white/20 border-2 border-white/30"
                    style={{ color: "white" }}
                  />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <Title
                    level={1}
                    className="!text-white dark:!text-white !mb-1 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight"
                  >
                    Welcome {name}!
                  </Title>
                  <Text className="text-white/90 dark:text-white text-sm sm:text-base md:text-lg font-normal block">
                    {role} • {firm?.firmName || "Law Firm"} Dashboard
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Role Information Card */}
        <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
          <Col xs={24} lg={16}>
            <Card
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm"
              bodyStyle={{ padding: "32px" }}
            >
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                <div>
                  <Title
                    level={3}
                    className="!text-slate-900 dark:!text-white !mb-2"
                  >
                    Your Role: {role}
                  </Title>
                  <Paragraph className="text-slate-600 dark:text-slate-300 text-lg mb-0">
                    You have been assigned the role of <strong>{role}</strong>{" "}
                    in our law firm. This role may have specific
                    responsibilities and access permissions that are configured
                    by your firm administrator.
                  </Paragraph>
                </div>

                <Divider className="border-slate-200 dark:border-slate-600" />

                <div>
                  <Title
                    level={4}
                    className="!text-slate-900 dark:!text-white !mb-4"
                  >
                    Getting Started
                  </Title>
                  <Timeline
                    items={[
                      {
                        dot: <CheckCircleOutlined className="text-green-500" />,
                        children: (
                          <div>
                            <Text className="text-slate-900 dark:text-white font-medium">
                              Account Activated
                            </Text>
                            <br />
                            <Text className="text-slate-500 dark:text-slate-400 text-sm">
                              Your account is ready to use
                            </Text>
                          </div>
                        ),
                      },
                      {
                        dot: <ClockCircleOutlined className="text-blue-500" />,
                        children: (
                          <div>
                            <Text className="text-slate-900 dark:text-white font-medium">
                              Complete Your Profile
                            </Text>
                            <br />
                            <Text className="text-slate-500 dark:text-slate-400 text-sm">
                              Add your personal information and preferences
                            </Text>
                          </div>
                        ),
                      },
                      {
                        dot: <InfoCircleOutlined className="text-slate-400" />,
                        children: (
                          <div>
                            <Text className="text-slate-900 dark:text-white font-medium">
                              Explore Your Dashboard
                            </Text>
                            <br />
                            <Text className="text-slate-500 dark:text-slate-400 text-sm">
                              Familiarize yourself with available features
                            </Text>
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Profile Completion Card */}
              <Card
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm"
                bodyStyle={{ padding: "24px" }}
              >
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <div className="text-center">
                    <Title
                      level={4}
                      className="!text-slate-900 dark:!text-white !mb-2"
                    >
                      Profile Completion
                    </Title>
                    <Progress
                      type="circle"
                      percent={65}
                      strokeColor={{
                        "0%": "#108ee9",
                        "100%": "#87d068",
                      }}
                      className="mb-4"
                    />
                    <Text className="text-slate-600 dark:text-slate-300 text-sm">
                      Complete your profile to unlock all features
                    </Text>
                  </div>
                  <Button
                    type="primary"
                    block
                    size="large"
                    onClick={() => router.push("/profile")}
                    className="rounded-xl"
                  >
                    Complete Profile
                  </Button>
                </Space>
              </Card>

              {/* Contact Info Card */}
              <Card
                title={
                  <Space>
                    <PhoneOutlined className="text-blue-600 dark:text-blue-400" />
                    <span className="text-slate-900 dark:!text-white font-semibold">
                      Need Help?
                    </span>
                  </Space>
                }
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm"
                bodyStyle={{ padding: "20px" }}
              >
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <Text className="text-blue-800 dark:text-blue-300 text-sm">
                      Contact your firm administrator for role-specific guidance
                      and training.
                    </Text>
                  </div>
                  <Button
                    type="default"
                    block
                    icon={<MailOutlined />}
                    className="rounded-xl border-slate-300 dark:border-slate-600"
                  >
                    Contact Admin
                  </Button>
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>

        {/* Quick Actions & Notifications */}
        <Row gutter={[24, 24]}>
          {/* Quick Actions */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <DashboardOutlined className="text-blue-600 dark:text-blue-400" />
                  <span className="text-slate-900 dark:!text-white font-semibold">
                    Quick Actions
                  </span>
                </Space>
              }
              className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800"
              bodyStyle={{ padding: "20px" }}
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="middle"
              >
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    type="text"
                    block
                    onClick={action.action}
                    className="text-left h-16 rounded-xl border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"
                  >
                    <Space
                      style={{ width: "100%", justifyContent: "space-between" }}
                    >
                      <Space>
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: `${action.color}15`,
                            color: action.color,
                          }}
                        >
                          {action.icon}
                        </div>
                        <div className="text-left">
                          <div className="text-slate-900 dark:text-white font-medium">
                            {action.title}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-xs">
                            {action.description}
                          </div>
                        </div>
                      </Space>
                      <RightOutlined className="text-slate-400 dark:text-slate-300" />
                    </Space>
                  </Button>
                ))}
              </Space>
            </Card>
          </Col>

          {/* Recent Notifications */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <BellOutlined className="text-purple-600 dark:text-purple-400" />
                  <span className="text-slate-900 dark:!text-white font-semibold">
                    Recent Updates
                  </span>
                </Space>
              }
              className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800"
              bodyStyle={{ padding: "20px" }}
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="middle"
              >
                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    className="py-3 border-b border-slate-100 dark:border-slate-600 last:border-b-0"
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === "success"
                            ? "bg-green-500"
                            : notification.type === "warning"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                        }`}
                      />
                      <div className="flex-1">
                        <Text className="text-slate-900 dark:text-white font-medium block">
                          {notification.title}
                        </Text>
                        <Text className="text-slate-600 dark:text-slate-300 text-sm block">
                          {notification.description}
                        </Text>
                        <Text className="text-slate-400 dark:text-slate-400 text-xs">
                          {notification.time}
                        </Text>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="link"
                  className="p-0 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300"
                >
                  View all updates →
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Role-Specific Information */}
        <Row gutter={[24, 24]} style={{ marginTop: "32px" }}>
          <Col span={24}>
            <Card
              className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm"
              bodyStyle={{ padding: "32px" }}
            >
              <Row align="middle" gutter={[24, 24]}>
                <Col xs={24} md={16}>
                  <Space direction="vertical" size="small">
                    <Title
                      level={3}
                      className="!text-slate-900 dark:!text-white !mb-2"
                    >
                      Role-Specific Features Coming Soon
                    </Title>
                    <Paragraph className="text-slate-600 dark:text-slate-300 mb-0">
                      Our development team is working on custom features and
                      dashboards tailored specifically for your role as{" "}
                      <strong>{role}</strong>. In the meantime, you can use the
                      available general features and contact your administrator
                      for any specific needs.
                    </Paragraph>
                  </Space>
                </Col>
                <Col xs={24} md={8} className="text-center">
                  <div className="w-24 h-24 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <BookOutlined className="text-4xl text-blue-600 dark:text-blue-400" />
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    className="rounded-xl"
                    onClick={() => router.push("/help")}
                  >
                    Learn More
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
