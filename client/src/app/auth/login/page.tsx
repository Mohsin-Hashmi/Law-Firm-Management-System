"use client";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import AuthForm from "@/app/components/AuthForm";

export default function LoginPage() {
  const { setTheme } = useTheme();

  useEffect(() => {
    // Force light theme when login page loads
    setTheme("light");
  }, [setTheme]);

  return <AuthForm type="login" />;
}
