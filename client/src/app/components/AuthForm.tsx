"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import formImage from "../../../public/images/formImage.webp";
import formImage03 from "../../../public/images/getFirmImg.webp";
import Link from "next/link";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaLock,
  FaShieldAlt,
} from "react-icons/fa";
import { loginUser, signupUser } from "../service/authAPI";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addUser } from "../store/userSlice";
import { FaGoogle } from "react-icons/fa";

type AuthFormProps = {
  type: "login" | "signup";
};

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const firmId = useAppSelector((state) => state.user.user?.firmId);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState("/dashboard");
  const [error, setError] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [firmSubdomain, setFirmSubdomain] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      setRedirectTo(searchParams.get("redirect") || "/dashboard");
    }
  }, []);

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
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newError.email = "Please enter a valid email address";
        isValid = false;
      }
      if (!password.trim()) {
        newError.password = "Password is required";
        isValid = false;
      } else if (password.length < 6) {
        newError.password = "Password must be at least 6 characters";
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
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newError.email = "Please enter a valid email address";
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validate();
    if (!isValid) return;

    setIsLoading(true);

    try {
      if (type === "signup") {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        const payload = { name, email, password, confirmPassword };
        let role = "Firm Admin";
        if (window.location.pathname.includes("lawyer")) role = "Lawyer";

        const response = await signupUser(payload, role);
        dispatch(addUser(response.data.safeUser));
        toast.success("Signup Successfully");

        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        router.push("/auth/login");
      } else {
        // Login
        const payload = { email, password };
        const response = await loginUser(payload);

        if (!response.data.success) {
          toast.error(response.data.message || "Login failed");
          return;
        }

        const user = response.data.user;
        console.log("Login user is :", user);
        const currentFirmId =
          user.currentFirmId ||
          (user.firms && user.firms.length > 0 ? user.firms[0].id : null);
        // Save user in Redux no matter what
        dispatch(
          addUser({
            ...user,
            mustChangePassword: user.mustChangePassword,
            firms: user.firms || [],
            currentFirmId,
            firmId: currentFirmId,
          })
        );

        if (response.data.mustChangePassword) {
          toast("You need to reset your password before continuing.");
          // go straight to dashboard — the modal will handle reset
          router.push("/dashboard");
          return;
        }

        // ✅ Normal login success flow
        toast.success("Login successfully");
        setEmail("");
        setPassword("");
        console.log("set password ");
        console.log("Final login redirect decision:");
        console.log("currentFirmId:", currentFirmId);
        console.log(
          "Redirecting to:",
          currentFirmId ? "/dashboard" : "/add-firm"
        );

        // Redirect based on firm presence or to the intended page
        if (currentFirmId) {
          // redirect role-wise
          if (user.role === "Super Admin") {
            router.push("/super-admin/dashboard");
          } else if (user.role === "Firm Admin") {
            router.push("/dashboard"); // firm admin's dashboard
          } else if (user.role === "Lawyer") {
            router.push("/dashboard");
          } else {
            router.push("/dashboard"); // fallback for other roles
          }
        } else {
          // only Super Admin and Firm Admin can add firms
          if (user.role === "Super Admin" || user.role === "Firm Admin") {
            router.push("/add-firm");
          } else {
            router.push("/dashboard"); // fallback
          }
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-[0_8px_16px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[500px]">
          {/* Left Side - Form */}
          <div className="flex-1 p-6 lg:p-8 flex flex-col justify-center">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-slate-900 to-slate-700 rounded-xl mb-4">
                {type === "login" ? (
                  <FaShieldAlt className="text-lg text-white" />
                ) : (
                  <FaUser className="text-lg text-white" />
                )}
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
                {type === "login" ? "Welcome Back!" : "Create Account"}
              </h1>
              <p className="text-slate-600 text-base">
                {type === "login"
                  ? "Sign in to access your dashboard"
                  : "Join us to manage your practice"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {type === "signup" && (
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full dark:bg-[#FFFFFF] dark:text-[#000000]  pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-slate-200 outline-none transition-all duration-300 ${
                        error.name
                          ? "border-red-300 focus:border-red-500"
                          : "border-slate-200 focus:border-slate-400 hover:border-slate-300"
                      }`}
                    />
                  </div>
                  {error.name && (
                    <p className="text-red-500 text-xs mt-1">{error.name}</p>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full dark:bg-[#FFFFFF] dark:text-[#000000] pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-slate-200 outline-none transition-all duration-300 ${
                      error.email
                        ? "border-red-300 focus:border-red-500"
                        : "border-slate-200 focus:border-slate-400 hover:border-slate-300"
                    }`}
                  />
                </div>
                {error.email && (
                  <p className="text-red-500 text-xs mt-1">{error.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full dark:bg-[#FFFFFF] dark:text-[#000000]  pl-10 pr-10 py-3 border-2 rounded-lg focus:ring-2 focus:ring-slate-200 outline-none transition-all duration-300 ${
                      error.password
                        ? "border-red-300 focus:border-red-500"
                        : "border-slate-200 focus:border-slate-400 hover:border-slate-300"
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors" />
                    ) : (
                      <FaEye className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors" />
                    )}
                  </button>
                </div>
                {error.password && (
                  <p className="text-red-500 text-xs mt-1">{error.password}</p>
                )}
              </div>

              {type === "signup" && (
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full dark:bg-[#FFFFFF] dark:text-[#000000]  pl-10 pr-10 py-3 border-2 rounded-lg focus:ring-2 focus:ring-slate-200 outline-none transition-all duration-300 ${
                        error.confirmPassword
                          ? "border-red-300 focus:border-red-500"
                          : "border-slate-200 focus:border-slate-400 hover:border-slate-300"
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors" />
                      ) : (
                        <FaEye className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors" />
                      )}
                    </button>
                  </div>
                  {error.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {error.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {type === "login" && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2 rounded border-slate-300"
                    />
                    <span className="text-slate-600">Remember me</span>
                  </label>
                  <Link
                    href="#"
                    className="text-slate-600 hover:text-slate-900 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  isLoading
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 transform hover:-translate-y-0.5 hover:shadow-lg"
                } text-white`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : type === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center mt-6 pt-4 border-t border-slate-200">
              <p className="text-slate-600 text-sm">
                {type === "signup" ? (
                  <>
                    Already have an account?{" "}
                    <Link
                      href="/auth/login"
                      className="text-slate-900 font-semibold hover:text-slate-700 transition-colors"
                    >
                      Sign in here
                    </Link>
                  </>
                ) : (
                  <>
                    Dont have an account?{" "}
                    <Link
                      href="/auth/signup"
                      className="text-slate-900 font-semibold hover:text-slate-700 transition-colors"
                    >
                      Create one here
                    </Link>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="hidden lg:block flex-1 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
            <div className="absolute inset-0 bg-black/20"></div>
            <Image
              src={formImage}
              alt="Professional legal services"
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
