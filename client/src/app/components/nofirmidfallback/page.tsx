"use client";
import { Button, Card, Typography } from "antd";
import {
  BankOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  HomeOutlined,
  TeamOutlined,
  FolderOutlined,
  UserOutlined,
  BarChartOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";
import DashboardLayout from "../DashboardLayout";

const { Title, Text } = Typography;

export default function NoFirmFallback() {
  const router = useRouter();

  const features = [
    {
      icon: <UserOutlined className="text-xl" />,
      title: "Client Management",
      description: "Comprehensive client database and communication tools",
    },
    {
      icon: <FolderOutlined className="text-xl" />,
      title: "Case Management",
      description: "Track cases, deadlines, and court appearances",
    },
    {
      icon: <TeamOutlined className="text-xl" />,
      title: "Team Collaboration",
      description: "Assign tasks and collaborate with team members",
    },
    {
      icon: <BarChartOutlined className="text-xl" />,
      title: "Analytics & Reports",
      description: "Generate insights and performance reports",
    },
    {
      icon: <FileTextOutlined className="text-xl" />,
      title: "Document Management",
      description: "Secure storage and organization of legal documents",
    },
    {
      icon: <ThunderboltOutlined className="text-xl" />,
      title: "Automated Workflows",
      description: "Streamline repetitive tasks and processes",
    },
  ];

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="max-w-4xl w-full">
            <Card
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg"
              bodyStyle={{ padding: "40px 32px" }}
            >
              {/* Header Section */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-blue-500 flex items-center justify-center shadow-md">
                  <BankOutlined className="text-3xl text-white" />
                </div>

                <Title level={2} className="!text-slate-900 dark:!text-white !mb-2 !font-bold">
                  No Firm Profile Found
                </Title>

                <Text className="text-slate-600 dark:text-slate-400 text-base block max-w-lg mx-auto">
                  Create your firm profile to unlock all features and start managing your practice
                </Text>
              </div>

              {/* Info Alert */}
              <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <InfoCircleOutlined className="text-lg text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <Text className="text-blue-900 dark:text-blue-200 font-medium text-sm block mb-1">
                      Why Create a Firm Profile?
                    </Text>
                    <Text className="text-blue-800 dark:text-blue-300 text-xs">
                      Your firm profile is required to access client management, case tracking, team collaboration, and reporting features.
                    </Text>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="mb-8">
                <Text className="text-slate-900 dark:text-white font-semibold text-base block mb-4">
                  Platform Features:
                </Text>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                          {feature.icon}
                        </div>
                        <div className="flex-1">
                          <Text className="text-slate-900 dark:text-white font-medium text-sm block mb-0.5">
                            {feature.title}
                          </Text>
                          <Text className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                            {feature.description}
                          </Text>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => router.push("/add-firm")}
                  className="flex-1 h-12 rounded-lg font-semibold text-base"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    border: "none",
                  }}
                >
                  Add New Business
                </Button>

                <Button
                  size="large"
                  icon={<HomeOutlined />}
                  onClick={() => router.push("/")}
                  className="h-12 rounded-lg font-medium text-base border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500"
                >
                  Go to Home
                </Button>
              </div>

              {/* Help Text */}
              <div className="mt-6 text-center">
                <Text className="text-slate-500 dark:text-slate-400 text-xs">
                  Need help?{" "}
                  <a
                    href="mailto:support@example.com"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Contact Support
                  </a>
                </Text>
              </div>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ThemeProvider>
  );
}