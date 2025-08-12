import React from "react";
import axios from "axios";
import BASE_URL from "../utils/constant";
import { LoginPayload, SignupPayload } from "../types/auth";

export const loginUser = async (data: LoginPayload) => {
  return await axios.post(`${BASE_URL}/auth/login`, data, {
    withCredentials: true,
  });
};

export const signupUser = async (data: SignupPayload) => {
  return await axios.post(`${BASE_URL}/auth/signup`, data, {
    withCredentials: true,
  });
};

export const logoutUser = async () => {
  return await axios.post(`${BASE_URL}/auth/logout`);
};
