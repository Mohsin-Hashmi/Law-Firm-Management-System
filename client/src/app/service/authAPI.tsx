import React from "react";
import axios from "axios";
import BASE_URL from "../utils/constant";
import { LoginPayload, SignupPayload } from "../types/auth";

export const loginUser = async (data: LoginPayload) => {
  const response = await axios.post(`${BASE_URL}/auth/login`, data, {
    withCredentials: true,
  });
  return response;
};

export const signupUser = async (data: SignupPayload) => {
  const url = `${BASE_URL}/auth/signup`;
  return await axios.post(url, data, { withCredentials: true });
};

export const logoutUser = async () => {
  return await axios.post(`${BASE_URL}/auth/logout`, {}, { withCredentials: true });
};

export const resetPassword = async (userId: number, newPassword: string) => {
  const response = await axios.post(
    `${BASE_URL}/auth/reset-password`,
    {
      userId,
      newPassword,
    },
    { withCredentials: true }
  );
  return response.data;
};
