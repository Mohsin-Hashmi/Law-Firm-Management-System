import axios from "axios";
import BASE_URL from "./constant";

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {     "Content-Type": "application/json",   },
});

// Request interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    console.log("Using token:", token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token updates
api.interceptors.response.use(
  (response) => {
    // If response contains a new token, update localStorage and axios defaults
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("authToken", response.data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
    }
    
    return response;
  },
  (error) => {
    // Handle 401 errors (token expired)
    if (error.response?.status === 401) {
      // Clear tokens and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
      
      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
