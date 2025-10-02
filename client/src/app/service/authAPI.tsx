import React from "react";
import axios from "axios";
import BASE_URL from "../utils/constant";
import api from "../utils/axiosConfig";
import { LoginPayload, SignupPayload } from "../types/auth";

export const loginUser = async (data: LoginPayload) => {
  const response = await axios.post(`${BASE_URL}/auth/login`, data, {withCredentials: true});
  
  // // Update token in localStorage if provided
  // if (response.data.token) {
  //   localStorage.setItem("token", response.data.token);
  //   localStorage.setItem("authToken", response.data.token);
  //   axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
  // }
  
  return response;
};

export const signupUser = async (data: SignupPayload) => {
  return await api.post("/auth/signup", data);
};

export const logoutUser = async () => {
  // Clear tokens before logout
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  delete axios.defaults.headers.common["Authorization"];
  
  return await api.post("/auth/logout", {});
};

export const resetPassword = async (userId: number, newPassword: string) => {
  const response = await api.post("/auth/reset-password", {
    userId,
    newPassword,
  });
  return response.data;
};
