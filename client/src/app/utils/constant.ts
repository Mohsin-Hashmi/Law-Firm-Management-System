// utils/constant.ts (or constant.js)

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://legal-law-firm-management-system.vercel.app/api" 
    : "http://localhost:5000/api";

export default BASE_URL;

