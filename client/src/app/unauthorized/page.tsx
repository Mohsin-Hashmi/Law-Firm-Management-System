"use client";
import { Button, Result } from "antd";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <>
      <Header />
      <div style={{ 
        minHeight: "70vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you are not authorized to access this page."
          extra={[
            <Button 
              type="primary" 
              key="home"
              onClick={() => router.push("/")}
              style={{
                backgroundColor: "#1E2E45",
                borderColor: "#1E2E45",
              }}
            >
              Go Home
            </Button>,
            <Button 
              key="login"
              onClick={() => router.push("/auth/login")}
            >
              Login
            </Button>,
          ]}
        />
      </div>
      <Footer />
    </>
  );
} 