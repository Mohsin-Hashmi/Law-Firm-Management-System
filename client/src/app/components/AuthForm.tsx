"use client";

import React, { useState } from "react";
import formImage from "../../../public/images/formImage.webp";
import Image from "next/image";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { loginUser, signupUser } from "../service/authAPI";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAppDispatch } from "../store/hooks";
import { addUser } from "../store/userSlice";
import { Input, Button, Typography, Form, Space, Card } from "antd";

const { Title, Text } = Typography;

type AuthFormProps = {
  type: "login" | "signup";
};

export default function AuthForm({ type }: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [firmSubdomain, setFirmSubdomain] = useState("");

  const router = useRouter();
  const dispatch = useAppDispatch();

  const validate = () => {
    const newError: typeof error = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };
    let isValid = true;

    if (type === "signup") {
      if (!name.trim()) {
        newError.name = "Name is required";
        isValid = false;
      }
      if (!email.trim()) {
        newError.email = "Email is required";
        isValid = false;
      }
      if (!password.trim()) {
        newError.password = "Password is required";
        isValid = false;
      }
      if (!confirmPassword.trim()) {
        newError.confirmPassword = "Confirm Password is required";
        isValid = false;
      }
      if (password && confirmPassword && password !== confirmPassword) {
        newError.confirmPassword = "Passwords do not match";
        isValid = false;
      }
    } else {
      if (!email.trim()) {
        newError.email = "Email is required";
        isValid = false;
      }
      if (!password.trim()) {
        newError.password = "Password is required";
        isValid = false;
      }
    }

    setError(newError);
    return isValid;
  };

  const handleSubmit = async () => {
    const isValid = validate();
    if (!isValid) return;
    try {
      if (type === "signup") {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        const payload = { name, email, password, confirmPassword };
        let role = "Frim Admin";
        if (window.location.pathname.includes("firm-admin")) {
          role = "Firm Admin";
        } else if (window.location.pathname.includes("lawyer")) {
          role = "Lawyer";
        }
        const response = await signupUser(payload, role);
        dispatch(addUser(response.data.safeUser));
        toast.success("Signup Successfully");
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        router.push("/auth/login");
      } else {
        const payload = { email, password };
        const response = await loginUser(payload);
        dispatch(addUser(response.data.user));
        toast.success("Login successfully");
        setEmail("");
        setPassword("");
        // redirect it to dashboard
        router.push("/pages/dashboard");
      }
    } catch (error) {
      console.error("Error:" + error);
    }
  };

  return (
    <section className="container flex justify-center items-center min-h-screen">
      <Card
        className="w-full max-w-4xl shadow-lg"
        styles={{
          body: { padding: 0 },
        }}
      >
        <div className="flex flex-col md:flex-row">
          {/* Left Form */}
          <div className="w-full md:w-1/2 flex flex-col justify-center p-8">
            <Title level={2} style={{ textAlign: "center", color: "#1E2E45" }}>
              {type === "login" ? "Hi, Welcome Back!" : "Create An Account"}
            </Title>

            <Form layout="vertical" onFinish={handleSubmit}>
              {type === "signup" && (
                <Form.Item
                  label="Name"
                  validateStatus={error.name ? "error" : ""}
                  help={error.name}
                >
                  <Input
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="p-2"
                  />
                </Form.Item>
              )}

              <Form.Item
                label="Email"
                validateStatus={error.email ? "error" : ""}
                help={error.email}
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-2"
                />
              </Form.Item>

              <Form.Item
                label="Password"
                validateStatus={error.password ? "error" : ""}
                help={error.password}
              >
                <Input.Password
                  placeholder="Enter your password"
                  iconRender={(visible) =>
                    visible ? <FaEyeSlash /> : <FaEye />
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-2"
                />
              </Form.Item>

              {type === "signup" && (
                <Form.Item
                  label="Confirm Password"
                  validateStatus={error.confirmPassword ? "error" : ""}
                  help={error.confirmPassword}
                >
                  <Input.Password
                    placeholder="Confirm your password"
                    iconRender={(visible) =>
                      visible ? <FaEyeSlash /> : <FaEye />
                    }
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="p-2"
                  />
                </Form.Item>
              )}
            
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  style={{
                    backgroundColor: "#1E2E45",
                    borderColor: "#1E2E45",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#2F486C")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#1E2E45")
                  }
                >
                  {type === "login" ? "Login" : "Sign Up"}
                </Button>
              </Form.Item>
            </Form>

            <Text style={{ display: "block", textAlign: "center" }}>
              {type === "signup" ? (
                <>
                  Already have an account?{" "}
                  <Link href="/auth/login">
                    <b>Login</b>
                  </Link>
                </>
              ) : (
                <>
                  Don’t have an account?{" "}
                  <Link href="/auth/signup">
                    <b>Sign Up</b>
                  </Link>
                </>
              )}
            </Text>
          </div>

          {/* Right Image */}
          <div className="hidden md:block w-1/2 ">
            <Image
              src={formImage}
              alt="Form"
              className="w-full h-full object-cover rounded-md"
              priority
            />
          </div>
        </div>
      </Card>
    </section>
  );
}
