"use client";
import { Modal, Typography, Input, Button, Form, Space } from "antd";
import {
  LockOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { resetPassword } from "../service/authAPI"; // your backend API
import { setUser } from "../store/userSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
const { Title, Text } = Typography;

interface ResetPasswordModalProps {
  visible: boolean;
  userId?: number;
  onClose: () => void;
  onSuccess: () => void; // callback after password reset
}

const ResetPasswordModal = ({
  visible,
  userId,
  onClose,
  onSuccess,
}: ResetPasswordModalProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: { password: string }) => {
    try {
      setLoading(true);
      if (!userId) {
        console.error("Missing userId for password reset");
        return;
      }
      await resetPassword(userId, values.password);
      toast.success("Password updated successfully!");
      const updatedUser = { ...user, mustChangePassword: false };
      // dispatch(setUser(updatedUser));
      onSuccess();
      onClose();
    } catch (error) {
      console.log("Error in Reset Password", error);
      toast.error("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={null}
      open={visible}
      footer={null}
      width={480}
      centered
      className="reset-password-modal"
      maskStyle={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
      closable={false}
    >
      <div className="p-2">
        {/* Header */}
        <div className="mb-3">
          <Space size="middle" className="mb-2">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <KeyOutlined className="text-blue-600 dark:text-blue-400 text-lg" />
            </div>
            <div>
              <Title
                level={4}
                className="!text-slate-900 dark:!text-white !mb-1"
              >
                Reset Your Password
              </Title>
              <Text className="text-slate-500 dark:text-slate-400 text-sm">
                Create a secure new password
              </Text>
            </div>
          </Space>
        </div>

        {/* Content */}
        <div className="mb-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
          <Text className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
            For security reasons, you must <strong>update your password</strong>{" "}
            before continuing.
          </Text>
          <br />
          <Text className="text-slate-500 dark:text-slate-400 text-sm mt-2 block">
            Choose a strong password with at least 8 characters, including
            uppercase, lowercase, and numbers.
          </Text>
        </div>

        {/* Security Notice */}
        <div className="mb-3 p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <LockOutlined className="text-slate-500 dark:text-slate-400 text-sm" />
            </div>
            <div>
              <Text className="text-slate-900 dark:text-white font-medium">
                Security Update Required
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-xs block">
                Your password will be securely encrypted
              </Text>
            </div>
          </div>
        </div>

        {/* Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          className="mb-4"
        >
          <Form.Item
            name="password"
            label={
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                New Password
              </span>
            }
            rules={[
              { required: true, message: "Please enter a new password" },
              { min: 8, message: "Password must be at least 8 characters" },
            ]}
            className="mb-4"
          >
            <Input.Password
              placeholder="Enter new password"
              size="large"
              className="rounded-lg"
              prefix={
                <LockOutlined className="text-slate-400 dark:text-slate-500" />
              }
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                Confirm Password
              </span>
            }
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
            
          >
            <Input.Password
              placeholder="Confirm new password"
              size="large"
              className="rounded-lg"
              prefix={
                <LockOutlined className="text-slate-400 dark:text-slate-500" />
              }
            />
          </Form.Item>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-600">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<CheckCircleOutlined />}
              className="h-10 px-5 rounded-lg bg-blue-600 hover:bg-blue-700"
              size="middle"
            >
              {loading ? "Saving..." : "Save Password"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ResetPasswordModal;
