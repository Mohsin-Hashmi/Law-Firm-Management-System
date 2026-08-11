import React from "react";
import axios from "axios";
import BASE_URL from "../utils/constant";
import api from "../utils/axiosConfig";
import { LoginPayload, SignupPayload } from "../types/auth";
import { IS_DEMO_MODE } from "../utils/demoMode";
import { demoAxiosResponse } from "../dummy/responses";
import { demoToken, findDemoUser } from "../dummy/auth";

export const loginUser = async (data: LoginPayload) => {
  if (IS_DEMO_MODE) {
    const demoUser = findDemoUser(data.email, data.password);

    if (!demoUser) {
      return demoAxiosResponse({
        success: false,
        message: "Invalid demo credentials",
      });
    }

    const { password, ...user } = demoUser;
    return demoAxiosResponse({
      success: true,
      message: "Login successful",
      user,
      token: demoToken,
    });
  }

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
  if (IS_DEMO_MODE) {
    return demoAxiosResponse({
      success: true,
      message: "Demo signup captured",
      user: {
        id: 777,
        name: data.name,
        email: data.email,
        role: "Firm Admin",
        permissions: [],
        firms: [],
        activeFirmId: null,
      },
    });
  }

  return await api.post("/auth/signup", data);
};

export const logoutUser = async () => {
  try {
    if (IS_DEMO_MODE) {
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];

      return demoAxiosResponse({
        success: true,
        message: "Demo user logged out",
      });
    }

   
    const response = await api.post("/auth/logout", {}, {
      withCredentials: true // Important! Allows cookie to be cleared
    });
    
    
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    
    return response;
  } catch (error) {
    // Even if API fails, clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    throw error;
  }
};
