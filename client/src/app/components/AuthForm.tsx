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
type AuthFormProps = {
  type: "login" | "signup";
};

export default function AuthForm({ type }: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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
      // For login
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // handle form submit
    const isValid = validate();
    if (!isValid) return;
    try {
      if (type === "signup") {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        const payload = { name, email, password, confirmPassword };
        const response = await signupUser(payload);
        dispatch(addUser(response.data))
        console.log("Signup Successfully:", response.data);
        toast.success("Signup Successfully");
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        router.push("/");
      } else {
        const payload = { email, password };
        const response = await loginUser(payload);
        dispatch(addUser(response.data));
        console.log("Login successfully:", response.data);
        toast.success("Login successfully");
        setEmail("");
        setPassword("");
        router.push("/");
      }
    } catch (error) {
      console.error("Error:" + error);
    }
  };

  return (
    <section className="container flex justify-center items-center min-h-screen ">
      <div className="rounded-lg shadow-2xl bg-white  backdrop-blur-md w-full max-w-4xl flex justify-center items-center gap-x-3.5 overflow-hidden p-8">
        {/* Left: Form */}
        <div className="w-full md:w-1/2 pl-4 block ">
          <h2 className="text-3xl  font-semibold text-center mb-6 text-[#1E2E45]">
            {type === "login" ? "Hi, Welcome Back! " : "Create An Account"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {type === "signup" && (
              <>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full  px-4 py-2 border border-[#2F486C] rounded-md focus:outline-none focus:ring-1 focus:ring-[#1E2E45] placeholder-[#2F486C]"
                />
                {error.name && (
                  <p className="text-red-600 text-sm">{error.name}</p>
                )}
              </>
            )}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-2 border border-[#2F486C] rounded-md focus:outline-none focus:ring-1 focus:ring-[#1E2E45] placeholder-[#2F486C]"
            />
            {error.email && (
              <p className="text-red-600 text-sm">{error.email}</p>
            )}

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-2 border border-[#2F486C] rounded-md focus:outline-none focus:ring-1 focus:ring-[#1E2E45] placeholder-[#2F486C]"
              />
              <span
                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-[#2F486C]"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {error.password && (
                <p className="text-red-600 text-sm">{error.password}</p>
              )}
            </div>

            {type === "signup" && (
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className="w-full px-4 py-2 border border-[#2F486C] rounded-md focus:outline-none focus:ring-1 focus:ring-[#1E2E45] placeholder-[#2F486C]"
                />
                <span
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-[#2F486C]"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
                {error.confirmPassword && (
                  <p className="text-red-600 text-sm">
                    {error.confirmPassword}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#1E2E45] hover:bg-[#2F486C] text-white font-semibold py-[18px] rounded-md transition duration-300"
            >
              {type === "login" ? "Login" : "Sign Up"}
            </button>
          </form>
          {type === "signup" ? (
            <p className="text-[#1E2E45] mt-3 text-center text-medium">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-bold hover:underline">
                Login
              </Link>
            </p>
          ) : (
            <p className="text-[#1E2E45] mt-3 text-center text-medium">
              {" "}
              Donot have an account?{" "}
              <Link href="/auth/signup" className="font-bold hover:underline">
                Sign Up
              </Link>
            </p>
          )}
        </div>

        {/* Right: Image */}
        <div className="hidden md:block w-1/2">
          <Image
            src={formImage}
            alt="Form"
            className="w-full h-full object-cover rounded-lg  "
            priority
          />
        </div>
      </div>
    </section>
  );
}
