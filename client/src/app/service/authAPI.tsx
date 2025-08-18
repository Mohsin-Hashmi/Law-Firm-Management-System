import React from "react";
import axios from "axios";
import BASE_URL from "../utils/constant";
import { LoginPayload, SignupPayload } from "../types/auth";

export const loginUser = async (data: LoginPayload) => {
   const response=  await axios.post(`${BASE_URL}/auth/login`, data, {
    withCredentials: true,
  });
  return response.data;
};

export const signupUser = async (data: SignupPayload, role?: string) => {
  // Determine path
  let url = `${BASE_URL}/auth/signup`;
  if (role === "Firm Admin") url = `${BASE_URL}/auth/signup/firm-admin`;
  if (role === "Lawyer") url = `${BASE_URL}/auth/signup/lawyer`;

  return await axios.post(url, data, { withCredentials: true });
};

export const logoutUser = async () => {
  return await axios.post(`${BASE_URL}/auth/logout`);
};
